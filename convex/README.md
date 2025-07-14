# Convex Backend для Park Hotel

## Настройка

1. Установите зависимости:
```bash
npm install
```

2. Подключитесь к self-hosted Convex:
```bash
npx convex dev
```
Выберите "Start without an account" и укажите URL:
```
https://convex-backend-production-587a.up.railway.app
```

3. Заполните базу тестовыми данными:
```bash
npx convex run seed:seedDatabase
```

## Структура данных

### Tours (Туры)
- title: название тура
- description: описание
- region: регион
- duration_days: продолжительность в днях
- price: цена
- max_participants: макс. количество участников
- difficulty_level: уровень сложности
- included_services: включенные услуги
- excluded_services: не включенные услуги
- itinerary: маршрут по дням
- main_image: главное изображение
- gallery_images: галерея изображений
- is_active: активен ли тур

### Spaces (Пространства отеля)
- name: название
- description: описание
- capacity: вместимость
- area_sqm: площадь в кв.м
- floor: этаж
- amenities: удобства
- room_type: тип помещения (suite, standard, deluxe, conference, restaurant)
- price_per_night: цена за ночь
- hourly_rate: почасовая ставка
- images: изображения
- is_available: доступно ли

### Bookings (Бронирования)
- tour_id или space_id: что бронируется
- customer_name: имя клиента
- customer_email: email
- customer_phone: телефон
- check_in_date: дата заезда
- check_out_date: дата выезда
- number_of_guests: количество гостей
- total_price: общая стоимость
- status: статус (pending, confirmed, cancelled)
- special_requests: особые пожелания

### Reviews (Отзывы)
- tour_id или space_id: к чему отзыв
- booking_id: ID бронирования
- author_name: имя автора
- rating: рейтинг (1-5)
- comment: комментарий
- images: изображения
- is_published: опубликован ли

## Доступные функции

### Файлы
- `files:generateUploadUrl` - получить URL для загрузки файла
- `files:getFileUrl` - получить URL файла по ID
- `files:deleteFile` - удалить файл
- `files:getFileMetadata` - получить метаданные файла

### Туры
- `tours:getAllTours` - получить все туры
- `tours:getTourById` - получить тур по ID
- `tours:createTour` - создать тур
- `tours:updateTour` - обновить тур
- `tours:deleteTour` - удалить тур
- `tours:getUniqueRegions` - получить список регионов

### Пространства
- `spaces:getAllSpaces` - получить все пространства
- `spaces:getSpaceById` - получить пространство по ID
- `spaces:createSpace` - создать пространство
- `spaces:updateSpace` - обновить пространство
- `spaces:deleteSpace` - удалить пространство
- `spaces:getRoomTypes` - получить типы помещений