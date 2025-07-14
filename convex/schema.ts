import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Таблица для туров
  tours: defineTable({
    title: v.string(),
    description: v.string(),
    region: v.string(),
    duration_days: v.number(),
    price: v.float64(),
    discount_percent: v.optional(v.float64()), // Процент скидки (0-100)
    max_participants: v.number(),
    difficulty_level: v.string(),
    included_services: v.array(v.string()),
    excluded_services: v.array(v.string()),
    extra_services: v.optional(v.array(v.object({
      name: v.string(),
      price: v.float64()
    }))),
    itinerary: v.optional(v.array(v.object({
      day: v.number(),
      description: v.string()
    }))), // Временно для обратной совместимости
    main_image: v.optional(v.string()), // ID файла в Convex storage
    gallery_images: v.array(v.string()), // массив ID файлов
    is_active: v.boolean(),
    visible: v.optional(v.boolean()), // Видимость тура на сайте
    created_at: v.number(),
    updated_at: v.number()
  }).index("by_region", ["region"])
    .index("by_active", ["is_active"]),

  // Таблица для дней тура
  tour_days: defineTable({
    tour_id: v.id("tours"),
    day_number: v.number(), // Номер дня в туре
    accommodation: v.optional(v.string()), // Место размещения в этот день
    auto_distance_km: v.optional(v.number()), // Расстояние на автомобиле
    walk_distance_km: v.optional(v.number()), // Пешеходное расстояние
    created_at: v.number(),
    updated_at: v.number()
  }).index("by_tour", ["tour_id"])
    .index("by_tour_day", ["tour_id", "day_number"]),

  // Таблица для активностей
  activities: defineTable({
    tour_day_id: v.id("tour_days"), // Связь с конкретным днем (обязательно)
    name: v.string(),
    description: v.string(),
    image: v.optional(v.string()), // ID файла в Convex storage
    image_url: v.optional(v.string()), // Внешний URL изображения
    type: v.string(), // экскурсия, трансфер, питание, отдых, вечернее мероприятие
    time_start: v.optional(v.string()), // Время начала (например "09:00")
    time_end: v.optional(v.string()), // Время окончания (например "14:00")
    price: v.optional(v.float64()), // Стоимость если не включена
    order_number: v.number(), // Порядковый номер для сортировки
    is_included: v.boolean(), // Включена в стоимость тура
    created_at: v.number(),
    updated_at: v.number()
  }).index("by_tour_day", ["tour_day_id"])
    .index("by_order", ["tour_day_id", "order_number"]),

  // Таблица для пространств отеля
  spaces: defineTable({
    name: v.string(),
    description: v.string(),
    capacity: v.number(),
    area_sqm: v.float64(),
    floor: v.optional(v.number()),
    amenities: v.array(v.string()),
    room_type: v.string(), // "hotel_room", "bungalow", "scandinavian_house", "chalet", "townhouse"
    room_type_id: v.optional(v.id("space_types")), // Связь с типами
    price_per_night: v.optional(v.float64()), // Цена за ночь (для номеров)
    discount_percent: v.optional(v.float64()), // Процент скидки (0-100)
    hourly_rate: v.optional(v.float64()),
    images: v.array(v.string()), // массив ID файлов
    is_available: v.boolean(),
    original_id: v.optional(v.string()), // ID из исходной системы
    created_at: v.number(),
    updated_at: v.number()
  }).index("by_type", ["room_type"])
    .index("by_availability", ["is_available"])
    .index("by_original_id", ["original_id"]),

  // Таблица типов размещения с управлением порядком
  space_types: defineTable({
    type_id: v.number(), // 1-5 как в исходной системе
    name: v.string(), // Номера в отеле, Домики-бунгало и т.д.
    slug: v.string(), // hotel_room, bungalow и т.д.
    display_name: v.optional(v.string()), // Отображаемое название для пользователей
    order_index: v.optional(v.number()), // Порядковый номер для сортировки
    is_active: v.optional(v.boolean()), // Активность категории
    created_at: v.number(),
    updated_at: v.number()
  }).index("by_type_id", ["type_id"])
    .index("by_slug", ["slug"]),

  // Таблица доступности туров по датам заезда
  availability: defineTable({
    tour_id: v.id("tours"),
    start_date: v.number(), // дата заезда в timestamp
    occupied_spots: v.number(), // занятые места
    created_at: v.number(),
    updated_at: v.number()
  }).index("by_tour", ["tour_id"])
    .index("by_start_date", ["start_date"])
    .index("by_tour_date", ["tour_id", "start_date"]),

  // Таблица для отзывов
  reviews: defineTable({
    tour_id: v.optional(v.id("tours")),
    space_id: v.optional(v.id("spaces")),
    booking_id: v.optional(v.string()), // Временно для обратной совместимости
    author_name: v.string(),
    rating: v.number(), // 1-5
    comment: v.string(),
    images: v.optional(v.array(v.string())),
    is_published: v.boolean(),
    created_at: v.number()
  }).index("by_tour", ["tour_id"])
    .index("by_space", ["space_id"])
    .index("by_published", ["is_published"])
    .index("by_rating", ["rating"]),
});