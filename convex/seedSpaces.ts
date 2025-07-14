import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Создать пространства без изображений пока что
export const createTestSpaces = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    
    // Проверяем, есть ли уже пространства
    const existingSpace = await ctx.db.query("spaces").first();
    if (existingSpace) {
      return { message: "Пространства уже созданы" };
    }
    
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
        price_per_night: 8500,
        images: [], // пока без изображений
        is_available: true,
        created_at: now,
        updated_at: now
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
        price_per_night: 4200,
        images: [], // пока без изображений
        is_available: true,
        created_at: now,
        updated_at: now
      }
    ];
    
    const spaceIds = [];
    for (const spaceData of spacesData) {
      const id = await ctx.db.insert("spaces", spaceData);
      spaceIds.push(id);
    }
    
    return {
      message: "Пространства успешно созданы",
      created: spaceIds.length,
      ids: spaceIds
    };
  },
});

// Загрузить номера из парсированных данных
export const clearAndSeedSpaces = mutation({
  args: {
    spaces: v.array(v.object({
      name: v.string(),
      description: v.string(),
      images: v.array(v.string()),
      area_sqm: v.float64(),
      capacity: v.number(),
      price_per_night: v.float64(),
      discount_amount: v.optional(v.float64()),
      room_type: v.string(),
      amenities: v.array(v.string()),
      original_id: v.string()
    }))
  },
  handler: async (ctx, { spaces }) => {
    const now = Date.now();
    
    // Сначала создаем типы размещения если их нет
    const existingTypes = await ctx.db.query("space_types").collect();
    if (existingTypes.length === 0) {
      const spaceTypes = [
        { type_id: 1, name: "Номера в отеле", slug: "hotel_room" },
        { type_id: 2, name: "Домики-бунгало", slug: "bungalow" },
        { type_id: 3, name: "Скандинавский дом", slug: "scandinavian_house" },
        { type_id: 4, name: "Домики-шале", slug: "chalet" },
        { type_id: 5, name: "Таунхаус", slug: "townhouse" }
      ];
      
      for (const type of spaceTypes) {
        await ctx.db.insert("space_types", {
          ...type,
          created_at: now,
          updated_at: now
        });
      }
      console.log("Созданы типы размещения");
    }
    
    // Очищаем существующие номера
    const existingSpaces = await ctx.db.query("spaces").collect();
    for (const space of existingSpaces) {
      await ctx.db.delete(space._id);
    }
    
    console.log("Очищены все существующие номера");

    // Создаем номера
    let created = 0;
    const imageIds: Record<string, string[]> = {};
    
    for (const space of spaces) {
      // Пока что создаем номера без изображений
      // В отдельной функции мы загрузим изображения
      const spaceId = await ctx.db.insert("spaces", {
        name: space.name,
        description: space.description,
        capacity: space.capacity,
        area_sqm: space.area_sqm,
        room_type: space.room_type,
        price_per_night: space.price_per_night,
        discount_percent: space.discount_amount ? Math.round((space.discount_amount / (space.price_per_night + space.discount_amount)) * 100) : undefined,
        amenities: space.amenities,
        images: [], // Пока пустой массив
        is_available: true,
        original_id: space.original_id,
        created_at: now,
        updated_at: now,
        floor: 1 // По умолчанию первый этаж
      });
      
      // Сохраняем связь между ID номера и URL изображений
      imageIds[spaceId] = space.images;
      created++;
    }
    
    console.log(`Создано ${created} номеров`);
    
    return {
      success: true,
      message: `Успешно создано ${created} номеров`,
      imageMapping: imageIds // Возвращаем маппинг для последующей загрузки изображений
    };
  },
});