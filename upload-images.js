#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Конфиг для Convex
const CONVEX_URL = 'https://convex-backend-production-587a.up.railway.app';
const ADMIN_KEY = 'self-hosted-convex|014dd603afe27576459853d9b6acffe0c8be4cf0aa532a2398b33fd3df705e63f4b0e14146';

// Пути к изображениям
const imagesPath = '/Users/gelvihleonid/Documents/clients/chigish/rooms';
const images = [
  { file: '1 5.jpg', name: 'Роскошный номер Люкс' },
  { file: 'IMG_1006 1.jpg', name: 'Стандартный номер с видом на горы' }
];

// Функция для загрузки изображения в Convex согласно документации
async function uploadImage(imagePath, filename) {
  try {
    // Читаем файл
    const imageBuffer = fs.readFileSync(imagePath);
    
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
    console.log(`📤 Got upload URL for ${filename}`);
    
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
    const storageId = result.storageId;
    
    console.log(`✅ Uploaded ${filename} -> ${storageId}`);
    return storageId;
    
  } catch (error) {
    console.error(`❌ Error uploading ${filename}:`, error.message);
    return null;
  }
}

// Step 3: Функция для создания пространства с изображениями (сохраняем storageId в БД)
async function createSpaceWithImage(spaceData, imageIds) {
  try {
    const response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: {
        'Authorization': `Convex ${ADMIN_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: 'uploadImages:createSpaceWithImages',
        args: { ...spaceData, imageIds },
        format: 'json'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create space: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(`Space creation failed: ${result.errorMessage}`);
    }
    
    console.log(`✅ Created space: ${spaceData.name} with ${imageIds.length} images`);
    return result.value;
    
  } catch (error) {
    console.error(`❌ Error creating space:`, error.message);
    return null;
  }
}

// Основная функция
async function main() {
  console.log('🚀 Starting image upload and space creation...\n');
  
  // Загружаем изображения
  const uploadedImages = [];
  
  for (const image of images) {
    const imagePath = path.join(imagesPath, image.file);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  File not found: ${imagePath}`);
      continue;
    }
    
    const storageId = await uploadImage(imagePath, image.file);
    if (storageId) {
      uploadedImages.push({ ...image, storageId });
    }
  }
  
  console.log(`\n📸 Uploaded ${uploadedImages.length} images\n`);
  
  // Создаем пространства с изображениями
  const spacesData = [
    {
      name: "Роскошный номер Люкс",
      description: "Просторный люкс с панорамными окнами и видом на горы. Оснащен всеми современными удобствами для комфортного проживания.",
      capacity: 2,
      area_sqm: 45.5,
      floor: 3,
      amenities: [
        "Панорамные окна",
        "Мини-бар",
        "Кофемашина",
        "Smart TV",
        "Кондиционер",
        "Сейф",
        "Балкон с видом на горы",
        "Халаты и тапочки"
      ],
      room_type: "suite",
      price_per_night: 8500
    },
    {
      name: "Стандартный номер Комфорт",
      description: "Уютный стандартный номер с современным дизайном и прекрасным видом. Идеально подходит для отдыха пары или деловых поездок.",
      capacity: 2,
      area_sqm: 28.0,
      floor: 2,
      amenities: [
        "Кондиционер",
        "ТВ",
        "Мини-холодильник",
        "Рабочий стол",
        "Душевая кабина",
        "Фен",
        "Wi-Fi",
        "Сейф"
      ],
      room_type: "standard",
      price_per_night: 4200
    }
  ];
  
  for (let i = 0; i < spacesData.length && i < uploadedImages.length; i++) {
    const spaceData = spacesData[i];
    const imageData = uploadedImages[i];
    
    await createSpaceWithImage(spaceData, [imageData.storageId]);
  }
  
  console.log('\n🎉 All done! Check your Convex dashboard.');
}

// Запускаем
main().catch(console.error);