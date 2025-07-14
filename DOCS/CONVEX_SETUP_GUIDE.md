# 🚀 Convex Self-Hosted Setup Guide & Project Knowledge Base

## 📋 Оглавление
- [Архитектура проекта](#архитектура-проекта)
- [Установка Convex Self-Hosted](#установка-convex-self-hosted)
- [Структура данных](#структура-данных)
- [API функции](#api-функции)
- [Работа с файлами](#работа-с-файлами)
- [Frontend интеграция](#frontend-интеграция)
- [Логика бизнес-процессов](#логика-бизнес-процессов)
- [Полезные команды](#полезные-команды)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Архитектура проекта

### Философские основы
Проект построен на трёх философских категориях:
1. **Вещь** - сущности (туры, номера, бронирования)
2. **Свойство** - атрибуты сущностей (название, цена, даты)
3. **Отношение** - связи между сущностями (тур → доступность, номер → изображения)

### Технологический стек
- **Backend**: Convex Self-Hosted (Railway)
- **Database**: Convex встроенная БД
- **Storage**: Convex File Storage
- **Frontend**: Next.js 15 + React 19
- **UI**: Tailwind CSS + Lucide Icons
- **Deploy**: Railway

---

## ⚙️ Установка Convex Self-Hosted

### 1. Railway Deploy
```bash
# Уже задеплоен на Railway:
# Backend: https://convex-backend-production-587a.up.railway.app
# Dashboard: https://convex-dashboard-production-eda2.up.railway.app
```

### 2. Получение Admin Key
```bash
# SSH в контейнер
railway ssh --project=b16ebf4b-8302-4b80-949e-241b1f41448e --environment=5f408574-b648-4c0c-a8b2-e86295efb219 --service=d45f80af-c5d8-4094-a290-82d7190d69ee

# В контейнере
./generate_admin_key.sh

# Результат:
# self-hosted-convex|014dd603afe27576459853d9b6acffe0c8be4cf0aa532a2398b33fd3df705e63f4b0e14146
```

### 3. Настройка проекта
```bash
# 1. Установка Convex
npm install convex

# 2. Настройка env переменных
cat > .env.local << EOF
CONVEX_SELF_HOSTED_URL=https://convex-backend-production-587a.up.railway.app
CONVEX_SELF_HOSTED_ADMIN_KEY=self-hosted-convex|014dd603afe27576459853d9b6acffe0c8be4cf0aa532a2398b33fd3df705e63f4b0e14146
NEXT_PUBLIC_CONVEX_URL=https://convex-backend-production-587a.up.railway.app
EOF

# 3. Создание convex.json
cat > convex.json << EOF
{
  "functions": "convex/",
  "authConfig": {
    "providers": []
  }
}
EOF

# 4. Deploy функций
npx convex deploy
```

---

## 🗃️ Структура данных

### Основные таблицы

#### Tours (Туры)
```typescript
{
  title: string,           // Название тура
  description: string,     // Описание
  region: string,          // Регион (Иссык-Куль, Каракол, Бишкек)
  duration_days: number,   // Длительность в днях
  price: float64,          // Цена за человека
  max_participants: number,// Макс участников
  difficulty_level: string,// Уровень сложности
  included_services: string[],  // Включенные услуги
  excluded_services: string[],  // Не включенные услуги
  itinerary: Array<{       // Маршрут по дням
    day: number,
    description: string
  }>,
  main_image?: string,     // ID главного изображения
  gallery_images: string[],// Массив ID изображений
  is_active: boolean,      // Активен ли тур
  created_at: number,
  updated_at: number
}
```

#### Spaces (Пространства отеля)
```typescript
{
  name: string,            // Название номера
  description: string,     // Описание
  capacity: number,        // Вместимость
  area_sqm: float64,       // Площадь в кв.м
  floor: number,           // Этаж
  amenities: string[],     // Удобства
  room_type: string,       // Тип (suite, standard, deluxe, conference, restaurant)
  price_per_night?: float64,  // Цена за ночь
  hourly_rate?: float64,   // Почасовая ставка
  images: string[],        // Массив ID изображений
  is_available: boolean,   // Доступен ли
  created_at: number,
  updated_at: number
}
```

#### Availability (Доступность туров)
```typescript
{
  tour_id: Id<"tours">,    // ID тура
  start_date: number,      // Дата заезда (timestamp)
  occupied_spots: number,  // Занятые места
  created_at: number,
  updated_at: number
}
```

### Ключевая особенность Availability
- **Дата выезда = дата заезда + длительность тура** (автоматически)
- **Свободные места = макс. участники - занятые места** (из тура)
- **Только дата заезда хранится в БД**, остальное вычисляется

---

## 🔧 API функции

### Tours API
```typescript
// Получить все туры
tours:getAllTours({ onlyActive?: boolean, region?: string })

// Получить тур по ID
tours:getTourById({ id: Id<"tours"> })

// Создать тур
tours:createTour({ title, description, region, ... })

// Обновить тур
tours:updateTour({ id, ...updates })

// Удалить тур
tours:deleteTour({ id })

// Получить регионы
tours:getUniqueRegions()
```

### Spaces API
```typescript
// Получить все пространства
spaces:getAllSpaces({ onlyAvailable?: boolean, roomType?: string })

// Получить пространство по ID
spaces:getSpaceById({ id: Id<"spaces"> })

// Создать пространство
spaces:createSpace({ name, description, capacity, ... })

// Обновить пространство
spaces:updateSpace({ id, ...updates })

// Удалить пространство
spaces:deleteSpace({ id })

// Получить типы комнат
spaces:getRoomTypes()
```

### Availability API
```typescript
// Получить доступность тура (КЛЮЧЕВАЯ ФУНКЦИЯ!)
availability:getTourAvailability({ tour_id: Id<"tours"> })
// Возвращает:
// {
//   start_date: number,
//   end_date: number,        // start_date + duration_days
//   total_capacity: number,  // из тура
//   occupied_spots: number,
//   available_spots: number, // total - occupied
//   is_available: boolean,   // occupied < total
//   price: number,          // из тура
//   _id: string
// }

// Создать дату заезда
availability:createTourDate({ tour_id, start_date, occupied_spots? })

// Обновить занятость
availability:updateTourOccupancy({ tour_id, start_date, spots_change })
```

### Files API
```typescript
// Генерировать upload URL
files:generateUploadUrl()

// Получить URL файла
files:getFileUrl({ storageId: string })

// Удалить файл
files:deleteFile({ storageId: string })
```

---

## 📁 Работа с файлами

### 3-Step Upload Process (согласно документации Convex)

#### Step 1: Получить Upload URL
```typescript
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

const result = await uploadUrlResponse.json();
const uploadUrl = result.value; // ⚠️ Важно: result.value, не просто result!
```

#### Step 2: Загрузить файл
```typescript
const uploadResponse = await fetch(uploadUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'image/jpeg' },
  body: imageBuffer
});

const { storageId } = await uploadResponse.json();
```

#### Step 3: Сохранить в БД
```typescript
await fetch(`${CONVEX_URL}/api/mutation`, {
  method: 'POST',
  headers: {
    'Authorization': `Convex ${ADMIN_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    path: 'spaces:updateSpace',
    args: { 
      id: spaceId, 
      images: [...existingImages, storageId] 
    },
    format: 'json'
  })
});
```

### Получение URL изображений в React
```typescript
import { useFileUrl } from '@/hooks/useConvex';

const imageUrl = useFileUrl(storageId); // Возвращает публичный URL
```

---

## ⚛️ Frontend интеграция

### Провайдер
```typescript
// app/providers.tsx
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}

// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Хуки
```typescript
// hooks/useConvex.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export const useTours = (onlyActive = true) => {
  return useQuery(api.tours.getAllTours, { onlyActive });
};

export const useCreateTour = () => {
  return useMutation(api.tours.createTour);
};

// В компоненте
const tours = useTours(); // undefined пока загружается, потом массив
const createTour = useCreateTour();

if (tours === undefined) return <div>Загрузка...</div>;

// Использование
await createTour({ title: "Новый тур", ... });
```

### Загрузка состояний
```typescript
// ⚠️ Важно понимать состояния Convex queries:
const data = useQuery(api.tours.getAllTours);

if (data === undefined) {
  // ЗАГРУЗКА - query еще не выполнен
  return <Spinner />;
}

if (data.length === 0) {
  // ПУСТО - query выполнен, но данных нет
  return <EmptyState />;
}

// ДАННЫЕ ЕСТЬ
return <DataComponent data={data} />;
```

---

## 🎯 Логика бизнес-процессов

### Система доступности туров

#### Концепция
1. **Хранится только дата заезда** в таблице `availability`
2. **Дата выезда вычисляется**: `start_date + tour.duration_days * 24 * 60 * 60 * 1000`
3. **Свободные места вычисляются**: `tour.max_participants - availability.occupied_spots`

#### Workflow бронирования
1. Пользователь выбирает тур → открывается попап с датами
2. `getTourAvailability(tour_id)` возвращает все даты с расчетами
3. Пользователь выбирает дату → можно бронировать
4. При бронировании: `updateTourOccupancy(tour_id, start_date, +guests_count)`

#### Преимущества такого подхода
- ✅ Минимальная избыточность данных
- ✅ Автоматический расчет дат выезда при изменении длительности тура
- ✅ Простота логики - только одна дата в БД
- ✅ Легко добавлять/убирать даты заездов

### Система изображений

#### Концепция
1. **Файлы хранятся в Convex Storage** (S3-совместимое хранилище)
2. **В БД хранятся только ID файлов** (strings)
3. **URL генерируются динамически** через `getFileUrl(storageId)`

#### Workflow загрузки
1. Генерируем upload URL: `generateUploadUrl()`
2. Загружаем файл на полученный URL
3. Получаем `storageId`
4. Сохраняем `storageId` в поле массива `images: string[]`

#### Frontend отображение
```typescript
// Множественные изображения
const imageUrls = space.images
  ?.map(imageId => useFileUrl(imageId))
  .filter(Boolean) || [];

// Одно изображение
const imageUrl = useFileUrl(tour.main_image);
```

---

## 🛠️ Полезные команды

### Convex CLI
```bash
# Deploy функций
npx convex deploy

# Запуск функции
npx convex run seed:seedDatabase

# Запуск с аргументами
npx convex run tours:createTour '{
  "title": "Новый тур",
  "description": "Описание",
  "region": "Иссык-Куль",
  "duration_days": 7,
  "price": 45000,
  "max_participants": 12,
  "difficulty_level": "Средний",
  "included_services": ["Проживание", "Питание"],
  "excluded_services": ["Авиаперелет"],
  "itinerary": [{"day": 1, "description": "Прибытие"}],
  "gallery_images": [],
  "is_active": true
}'

# Просмотр логов (если поддерживается)
npx convex logs

# Очистка кеша
npx convex dev --typecheck disable
```

### Railway
```bash
# SSH подключение
railway ssh --project=b16ebf4b-8302-4b80-949e-241b1f41448e --environment=5f408574-b648-4c0c-a8b2-e86295efb219 --service=d45f80af-c5d8-4094-a290-82d7190d69ee

# Логи сервиса
railway logs --service convex-backend

# Статус проекта
railway status

# Переменные окружения
railway variables --service convex-backend
```

### Database Operations
```bash
# Заполнение тестовыми данными
npx convex run seed:seedDatabase

# Создание пространств с изображениями
npx convex run seedSpaces:createTestSpaces

# Создание дат для туров
npx convex run availability:createTourDate '{
  "tour_id": "kg2...",
  "start_date": 1735689600000,
  "occupied_spots": 0
}'
```

---

## 🚨 Troubleshooting

### Частые проблемы

#### 1. "Not Found" при вызове функций
```bash
# Проблема: Неправильный endpoint
❌ /api/run
✅ /api/mutation (для mutations)
✅ /api/query (для queries)

# Проблема: Неправильная авторизация
❌ Authorization: Bearer <key>
✅ Authorization: Convex <admin_key>
```

#### 2. Файлы не загружаются
```bash
# Проверить функцию
npx convex run files:generateUploadUrl

# Проверить права доступа
# Admin key должен быть валидным

# Проверить размер файла
# Лимит: 20MB для HTTP actions, unlimited для upload URLs
```

#### 3. Изображения не отображаются
```typescript
// ❌ Неправильно
const imageUrl = useFileUrl(null);

// ✅ Правильно
const imageUrl = useFileUrl(storageId || null);

// ❌ Неправильно
const imageUrls = space.images.map(id => useFileUrl(id));

// ✅ Правильно  
const imageUrls = space.images
  ?.map(id => useFileUrl(id))
  .filter(Boolean) || [];
```

#### 4. Self-hosted deployment проблемы
```bash
# Проверить переменные
echo $CONVEX_SELF_HOSTED_URL
echo $CONVEX_SELF_HOSTED_ADMIN_KEY

# НЕ должно быть установлено
unset CONVEX_DEPLOYMENT
unset CONVEX_DEPLOY_KEY

# Очистить кеш Convex
rm -rf .convex
npx convex deploy
```

### Debug техники

#### 1. Проверка API ответов
```typescript
const response = await fetch(`${CONVEX_URL}/api/mutation`, {
  // ... config
});

console.log('Status:', response.status);
console.log('Headers:', response.headers);

const result = await response.json();
console.log('Result:', result);

// Для успешных ответов:
// { status: "success", value: <result>, logLines: [...] }

// Для ошибок:
// { status: "error", errorMessage: "...", errorData: {...} }
```

#### 2. Проверка функций через CLI
```bash
# Тестирование функций напрямую
npx convex run files:generateUploadUrl
npx convex run tours:getAllTours '{"onlyActive": true}'
npx convex run availability:getTourAvailability '{"tour_id": "kg2..."}'
```

#### 3. Проверка storage
```bash
# Через dashboard
# https://convex-dashboard-production-eda2.up.railway.app

# Логин с admin key:
# self-hosted-convex|014dd603afe27576459853d9b6acffe0c8be4cf0aa532a2398b33fd3df705e63f4b0e14146
```

---

## 📊 Статистика проекта

### Созданные функции
- **Tours**: 6 функций (CRUD + regions)
- **Spaces**: 6 функций (CRUD + types)  
- **Availability**: 3 функции (get, create, update)
- **Files**: 4 функции (upload, get, delete, metadata)
- **Seed**: 2 функции (full seed, spaces seed)

### Структура файлов
```
convex/
├── _generated/          # Автогенерированные типы
├── schema.ts           # Схемы таблиц
├── tours.ts           # API для туров
├── spaces.ts          # API для пространств
├── availability.ts    # API для доступности
├── files.ts           # API для файлов
├── seed.ts            # Заполнение данными
├── seedSpaces.ts      # Заполнение пространств
└── uploadImages.ts    # Создание пространств с изображениями

hooks/
└── useConvex.ts       # React хуки для всех API

components/
├── TourCard.tsx           # Карточка тура
├── TourAvailabilityModal.tsx  # Попап с датами
└── SpaceCard.tsx          # Карточка номера
```

### Загруженные данные
- **3 тура** с маршрутами и описаниями
- **18 дат заездов** (6 дат × 3 тура)
- **2 пространства** с полными характеристиками
- **2 изображения** в storage
- **Тестовые бронирования и отзывы**

---

## 🎓 Ключевые learnings

### О Convex
1. **Self-hosted версия** полностью функциональна
2. **Правильные endpoints**: `/api/mutation`, `/api/query`, НЕ `/api/run`
3. **Структура ответов**: `{ status: "success", value: <data> }`
4. **Файлы**: 3-step process обязателен
5. **Reactive queries**: `useQuery` возвращает `undefined` при загрузке

### О проектировании
1. **Минимальная избыточность**: хранить только start_date, остальное вычислять
2. **Нормализация изображений**: ID в массивах, URL по запросу
3. **Индексы важны**: для быстрых запросов по tour_id, date
4. **TypeScript типы**: auto-generated из схем

### О production ready
1. **Admin key безопасность**: только в переменных окружения
2. **Error handling**: проверка статусов и текстов ошибок
3. **Loading states**: правильная обработка `undefined`
4. **Optimistic updates**: Convex делает автоматически

---

## 🚀 Следующие шаги

1. **Админка на Convex** - формы создания/редактирования
2. **Бронирование** - интеграция с платежами
3. **Аутентификация** - Convex Auth или внешние провайдеры
4. **Real-time updates** - автоматические обновления доступности
5. **Мобильная оптимизация** - PWA
6. **SEO** - статическая генерация страниц туров
7. **Аналитика** - отслеживание популярных туров
8. **Email уведомления** - через Convex actions
9. **Кеширование** - Redis для часто запрашиваемых данных
10. **Мониторинг** - логи и метрики

---

*Документ обновлен: 2025-01-11*  
*Версия Convex: Self-hosted на Railway*  
*Статус: Production Ready ✅*