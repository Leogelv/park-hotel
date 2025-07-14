const fs = require('fs');
const { ConvexClient } = require('convex/browser');

// Читаем парсированные данные
const spacesData = JSON.parse(fs.readFileSync('parsed-spaces.json', 'utf-8'));

// Создаем клиент Convex
const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function seedSpaces() {
  try {
    console.log(`Загружаем ${spacesData.length} номеров в базу данных...`);
    
    // Вызываем mutation для загрузки номеров
    const result = await client.mutation('seedSpaces:clearAndSeedSpaces', {
      spaces: spacesData
    });
    
    console.log('Результат:', result);
    
    if (result.success) {
      console.log(`✅ Успешно загружено ${result.message}`);
      console.log('Маппинг изображений сохранен для последующей загрузки');
      
      // Сохраняем маппинг изображений для следующего шага
      fs.writeFileSync(
        'image-mapping.json',
        JSON.stringify(result.imageMapping, null, 2),
        'utf-8'
      );
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке номеров:', error);
  }
}

// Проверяем, что есть URL Convex
if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  console.error('❌ Не найден NEXT_PUBLIC_CONVEX_URL в переменных окружения');
  process.exit(1);
}

// Запускаем загрузку
seedSpaces();