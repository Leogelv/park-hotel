#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Конфиг для Convex
const CONVEX_URL = 'https://convex-backend-production-587a.up.railway.app';
const ADMIN_KEY = 'self-hosted-convex|014dd603afe27576459853d9b6acffe0c8be4cf0aa532a2398b33fd3df705e63f4b0e14146';

// Читаем парсированные данные номеров
const spacesData = JSON.parse(fs.readFileSync('parsed-spaces.json', 'utf-8'));

// Функция для скачивания изображения по URL
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Функция для загрузки изображения в Convex
async function uploadImageToConvex(imageBuffer, filename) {
  try {
    // Step 1: Получаем upload URL через mutation
    const uploadUrlResponse = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: {
        'Authorization': `Convex ${ADMIN_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: 'files:generateUploadUrl',
        args: {},
        format: 'json'
      })
    });
    
    if (!uploadUrlResponse.ok) {
      const errorText = await uploadUrlResponse.text();
      throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText} - ${errorText}`);
    }
    
    const uploadUrlResult = await uploadUrlResponse.json();
    
    if (uploadUrlResult.status !== 'success') {
      throw new Error(`Upload URL generation failed: ${uploadUrlResult.errorMessage}`);
    }
    
    const postUrl = uploadUrlResult.value;
    
    // Step 2: POST файл на upload URL
    const uploadResponse = await fetch(postUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'image/jpeg' 
      },
      body: imageBuffer
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload image: ${uploadResponse.statusText} - ${errorText}`);
    }
    
    const result = await uploadResponse.json();
    return result.storageId;
    
  } catch (error) {
    console.error(`❌ Error uploading ${filename}:`, error.message);
    return null;
  }
}

// Функция для обновления номера с изображениями
async function updateSpaceImages(spaceId, imageIds) {
  try {
    const response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: {
        'Authorization': `Convex ${ADMIN_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: 'updateSpaceImages:updateSpaceImages',
        args: { spaceId, imageIds },
        format: 'json'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update space: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(`Space update failed: ${result.errorMessage}`);
    }
    
    return result.value;
    
  } catch (error) {
    console.error(`❌ Error updating space:`, error.message);
    return null;
  }
}

// Основная функция
async function main() {
  console.log('🚀 Starting image upload for spaces...\n');
  
  // Сначала загружаем номера в БД без изображений
  console.log('📝 Uploading spaces data to database...');
  
  const createSpacesResponse = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: {
      'Authorization': `Convex ${ADMIN_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      path: 'seedSpaces:clearAndSeedSpaces',
      args: { spaces: spacesData },
      format: 'json'
    })
  });
  
  if (!createSpacesResponse.ok) {
    const errorText = await createSpacesResponse.text();
    throw new Error(`Failed to create spaces: ${createSpacesResponse.statusText} - ${errorText}`);
  }
  
  const createResult = await createSpacesResponse.json();
  
  if (createResult.status !== 'success') {
    throw new Error(`Spaces creation failed: ${createResult.errorMessage}`);
  }
  
  console.log(`✅ Created ${createResult.value.message}`);
  
  const imageMapping = createResult.value.imageMapping;
  
  // Теперь загружаем изображения для каждого номера
  console.log('\n📸 Starting image upload process...\n');
  
  for (const [spaceId, imageUrls] of Object.entries(imageMapping)) {
    const space = spacesData.find(s => imageUrls === s.images);
    console.log(`\n🏠 Processing ${space?.name || 'Unknown'}...`);
    
    const uploadedImageIds = [];
    
    for (let i = 0; i < Math.min(imageUrls.length, 5); i++) { // Ограничиваем до 5 изображений
      const imageUrl = imageUrls[i];
      console.log(`  📥 Downloading image ${i + 1}/${Math.min(imageUrls.length, 5)}...`);
      
      try {
        const imageBuffer = await downloadImage(imageUrl);
        const filename = `${space?.name}_${i + 1}.jpg`;
        
        console.log(`  📤 Uploading to Convex...`);
        const storageId = await uploadImageToConvex(imageBuffer, filename);
        
        if (storageId) {
          uploadedImageIds.push(storageId);
          console.log(`  ✅ Uploaded successfully`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to process image: ${error.message}`);
      }
    }
    
    // Обновляем номер с загруженными изображениями
    if (uploadedImageIds.length > 0) {
      await updateSpaceImages(spaceId, uploadedImageIds);
      console.log(`✅ Updated ${space?.name} with ${uploadedImageIds.length} images`);
    }
  }
  
  console.log('\n🎉 All done! Check your Convex dashboard.');
}

// Запускаем
main().catch(console.error);