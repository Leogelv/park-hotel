import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Функция для загрузки изображения из base64
export const uploadImageFromBase64 = mutation({
  args: {
    base64Data: v.string(),
    filename: v.string(),
    contentType: v.string()
  },
  handler: async (ctx, args) => {
    // Конвертируем base64 в blob
    const base64String = args.base64Data.split(',')[1]; // убираем data:image/jpeg;base64, часть
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Используем правильный API для загрузки файлов
    // Сначала получаем URL для загрузки
    const uploadUrl = await ctx.storage.generateUploadUrl();
    
    // Создаем response объект с содержимым файла
    const response = new Response(new Blob([bytes], { type: args.contentType }));
    
    // Отправляем файл на upload URL и получаем storage ID
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": args.contentType },
      body: response.body,
    });
    
    const { storageId } = await result.json();
    return storageId;
  },
});

// Функция для создания пространства с изображениями
export const createSpaceWithImages = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    capacity: v.number(),
    area_sqm: v.float64(),
    floor: v.number(),
    amenities: v.array(v.string()),
    room_type: v.string(),
    price_per_night: v.optional(v.float64()),
    hourly_rate: v.optional(v.float64()),
    imageIds: v.array(v.string()),
    is_available: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const space = await ctx.db.insert("spaces", {
      name: args.name,
      description: args.description,
      capacity: args.capacity,
      area_sqm: args.area_sqm,
      floor: args.floor,
      amenities: args.amenities,
      room_type: args.room_type,
      price_per_night: args.price_per_night,
      hourly_rate: args.hourly_rate,
      images: args.imageIds,
      is_available: args.is_available ?? true,
      created_at: now,
      updated_at: now
    });
    
    return space;
  },
});