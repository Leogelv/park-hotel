# Парк-отель - Система бронирования

Приложение для управления турами и номерами парк-отеля с возможностью встраивания через iframe.

## Функционал

- **Публичные страницы:**
  - `/tours` - Каталог туров с карточками, ценами и детальной информацией
  - `/spaces` - Каталог номеров с галереей фото, характеристиками и ценами

- **Админ-панель:**
  - `/admin/tours` - Управление турами (создание, редактирование, удаление)
  - `/admin/spaces` - Управление номерами с drag&drop сортировкой фото

- **Хранение изображений:**
  - Загрузка файлов напрямую в Supabase Storage
  - Автоматическое удаление старых изображений при замене
  - Поддержка внешних URL для изображений

## Технологии

- Next.js 15 с App Router
- TypeScript
- Tailwind CSS
- Supabase (БД)
- @dnd-kit для drag&drop

## Установка

1. Клонируйте репозиторий
2. Установите зависимости: `npm install`
3. Создайте файл `.env.local` и добавьте:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Создайте таблицы в Supabase используя `schema.sql`
5. Настройте Storage в Supabase:
   - Создайте бакеты: `tours`, `spaces`, `activities`
   - Сделайте их публичными для чтения
   - Примените политики из `storage-setup.sql`
6. Запустите проект: `npm run dev`

## Деплой на Railway

1. Подключите GitHub репозиторий к Railway
2. Добавьте переменные окружения в Railway:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Railway автоматически задеплоит приложение

## Встраивание через iframe

```html
<!-- Для туров -->
<iframe src="https://your-app.railway.app/tours" width="100%" height="800"></iframe>

<!-- Для номеров -->
<iframe src="https://your-app.railway.app/spaces" width="100%" height="800"></iframe>
```
