const fs = require('fs');
const csv = require('csv-parse/sync');
const { ConvexClient } = require('convex/browser');

// Читаем CSV файл
const csvContent = fs.readFileSync('/Users/gelvihleonid/Downloads/export_All-Spaces-modified_2025-01-04_04-55-32.csv', 'utf-8');

// Парсим CSV
const records = csv.parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

// Функция для очистки и парсинга данных
function parseSpaceData(record) {
  // Парсим изображения (разделены запятыми)
  const parseImages = (imagesStr) => {
    if (!imagesStr || imagesStr.trim() === '') return [];
    return imagesStr.split(' , ')
      .map(url => url.trim())
      .filter(url => url.startsWith('//'))
      .map(url => 'https:' + url);
  };

  // Определяем тип номера на основе строки
  const getRoomType = (typeStr) => {
    const typeMap = {
      'Номера в отеле': 'hotel_room',
      'Домики-бунгало': 'bungalow',
      'Скандинавский дом': 'scandinavian_house',
      'Домики-шале': 'chalet',
      'Таунхаус': 'townhouse'
    };
    return typeMap[typeStr] || 'standard';
  };

  // Парсим цену (убираем лишние символы)
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseInt(priceStr.toString().replace(/[^\d]/g, '')) || 0;
  };

  // Парсим площадь
  const parseArea = (areaStr) => {
    if (!areaStr) return 0;
    return parseFloat(areaStr) || 0;
  };

  // Парсим количество мест
  const parsePlaces = (placesStr) => {
    if (!placesStr) return 2;
    return parseInt(placesStr) || 2;
  };

  // Объединяем изображения из images и files
  const allImages = [...parseImages(record.images), ...parseImages(record.files)];
  
  return {
    name: record.name || 'Без названия',
    description: record.description || '',
    images: allImages, // Все изображения в одном массиве
    area_sqm: parseArea(record.meters),
    capacity: parsePlaces(record.places),
    price_per_night: parsePrice(record['price from']),
    discount_amount: parsePrice(record.sale),
    room_type: getRoomType(record.type),
    amenities: [], // Будем заполнять на основе описания
    original_id: record['unique id']
  };
}

// Обрабатываем все записи
const spaces = records.map(parseSpaceData);

// Определяем удобства на основе описания
spaces.forEach(space => {
  const desc = space.description.toLowerCase();
  const amenities = [];
  
  if (desc.includes('wi-fi') || desc.includes('wifi')) amenities.push('Wi-Fi');
  if (desc.includes('холодильник')) amenities.push('Холодильник');
  if (desc.includes('телевизор')) amenities.push('Телевизор');
  if (desc.includes('чайник')) amenities.push('Чайник');
  if (desc.includes('фен')) amenities.push('Фен');
  if (desc.includes('халат')) amenities.push('Халаты и тапочки');
  if (desc.includes('кондиционер')) amenities.push('Кондиционер');
  if (desc.includes('мангал') || desc.includes('барбекю')) amenities.push('Мангал');
  if (desc.includes('терраса')) amenities.push('Терраса');
  if (desc.includes('балкон')) amenities.push('Балкон');
  if (desc.includes('завтрак включен')) amenities.push('Завтрак включен');
  if (desc.includes('сейф')) amenities.push('Сейф');
  
  space.amenities = amenities;
});

// Выводим результат для проверки
console.log(`Найдено ${spaces.length} номеров для импорта`);
console.log('\nПримеры номеров:');
spaces.slice(0, 3).forEach((space, index) => {
  console.log(`\n${index + 1}. ${space.name}`);
  console.log(`   Тип: ${space.room_type}`);
  console.log(`   Цена: ${space.price_per_night} руб/ночь`);
  console.log(`   Площадь: ${space.area_sqm} м²`);
  console.log(`   Вместимость: ${space.capacity} человек`);
  console.log(`   Удобства: ${space.amenities.join(', ')}`);
  console.log(`   Изображений: ${space.images.length}`);
});

// Сохраняем в JSON для дальнейшего использования
fs.writeFileSync(
  'parsed-spaces.json', 
  JSON.stringify(spaces, null, 2),
  'utf-8'
);

console.log('\nДанные сохранены в parsed-spaces.json');