import { mutation } from "./_generated/server";

export const seedSpaceTypes = mutation({
  args: {},
  handler: async (ctx) => {
    // Типы размещения из исходной системы
    const spaceTypes = [
      { type_id: 1, name: "Номера в отеле", slug: "hotel_room" },
      { type_id: 2, name: "Домики-бунгало", slug: "bungalow" },
      { type_id: 3, name: "Скандинавский дом", slug: "scandinavian_house" },
      { type_id: 4, name: "Домики-шале", slug: "chalet" },
      { type_id: 5, name: "Таунхаус", slug: "townhouse" }
    ];

    const now = Date.now();
    
    // Очищаем существующие типы
    const existingTypes = await ctx.db.query("space_types").collect();
    for (const type of existingTypes) {
      await ctx.db.delete(type._id);
    }

    // Создаем новые типы
    for (const type of spaceTypes) {
      await ctx.db.insert("space_types", {
        ...type,
        created_at: now,
        updated_at: now
      });
    }

    console.log(`Созданы ${spaceTypes.length} типов размещения`);
    
    return {
      success: true,
      message: `Успешно созданы ${spaceTypes.length} типов размещения`
    };
  },
});