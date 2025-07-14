import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Обновить изображения у существующего номера
export const updateSpaceImages = mutation({
  args: {
    spaceId: v.string(),
    imageIds: v.array(v.string())
  },
  handler: async (ctx, { spaceId, imageIds }) => {
    // Преобразуем строку в ID
    const id = spaceId as Id<"spaces">;
    
    // Получаем существующий номер
    const space = await ctx.db.get(id);
    if (!space) {
      throw new Error(`Space with id ${spaceId} not found`);
    }
    
    // Обновляем изображения
    await ctx.db.patch(id, {
      images: imageIds,
      updated_at: Date.now()
    });
    
    console.log(`Updated space ${space.name} with ${imageIds.length} images`);
    
    return {
      success: true,
      spaceId: spaceId,
      imageCount: imageIds.length
    };
  },
});