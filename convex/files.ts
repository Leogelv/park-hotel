import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Функция для загрузки файла
export const generateUploadUrl = mutation(async (ctx) => {
  // Генерируем URL для загрузки файла
  return await ctx.storage.generateUploadUrl();
});

// Функция для получения URL файла по его ID
export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Функция для удаления файла
export const deleteFile = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});

// Функция для получения метаданных файла
export const getFileMetadata = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const metadata = await ctx.storage.getMetadata(args.storageId);
    return metadata;
  },
});