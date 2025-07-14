import { httpAction } from "./_generated/server";

// HTTP action для загрузки файлов
export const uploadFile = httpAction(async (ctx, request) => {
  // Получаем файл из request body
  const blob = await request.blob();
  
  // Сохраняем в storage
  const storageId = await ctx.storage.store(blob);
  
  // Возвращаем storage ID
  return new Response(JSON.stringify({ storageId }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});