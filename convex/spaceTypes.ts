import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Получить все категории номеров
export const getAllSpaceTypes = query({
  args: {
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("space_types");
    
    if (args.onlyActive) {
      const types = await query.collect();
      return types
        .filter(type => type.is_active !== false) // По умолчанию активные
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    }
    
    const types = await query.collect();
    return types.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  },
});

// Получить категорию по ID
export const getSpaceTypeById = query({
  args: { id: v.id("space_types") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Создать новую категорию
export const createSpaceType = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    display_name: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Получаем максимальный order_index
    const allTypes = await ctx.db.query("space_types").collect();
    const maxOrderIndex = allTypes.reduce((max, type) => 
      Math.max(max, type.order_index || 0), 0
    );
    
    // Получаем максимальный type_id
    const maxTypeId = allTypes.reduce((max, type) => 
      Math.max(max, type.type_id || 0), 0
    );
    
    const now = Date.now();
    
    return await ctx.db.insert("space_types", {
      type_id: maxTypeId + 1,
      name: args.name,
      slug: args.slug,
      display_name: args.display_name || args.name,
      order_index: maxOrderIndex + 1,
      is_active: args.is_active ?? true,
      created_at: now,
      updated_at: now,
    });
  },
});

// Обновить категорию
export const updateSpaceType = mutation({
  args: {
    id: v.id("space_types"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    display_name: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const existingType = await ctx.db.get(id);
    if (!existingType) {
      throw new Error("Категория не найдена");
    }
    
    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    });
  },
});

// Обновить порядок категорий (для drag-and-drop)
export const updateSpaceTypesOrder = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("space_types"),
      order_index: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Обновляем порядок всех категорий за одну транзакцию
    for (const update of args.updates) {
      await ctx.db.patch(update.id, {
        order_index: update.order_index,
        updated_at: now,
      });
    }
  },
});

// Удалить категорию
export const deleteSpaceType = mutation({
  args: { id: v.id("space_types") },
  handler: async (ctx, args) => {
    // Проверяем, есть ли номера с этой категорией
    const spacesWithType = await ctx.db
      .query("spaces")
      .withIndex("by_type")
      .filter(q => q.eq(q.field("room_type_id"), args.id))
      .first();
    
    if (spacesWithType) {
      throw new Error("Невозможно удалить категорию, так как существуют номера этого типа");
    }
    
    await ctx.db.delete(args.id);
  },
});

// Инициализация базовых категорий (для миграции существующих данных)
export const initializeDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Проверяем, есть ли уже категории
    const existingTypes = await ctx.db.query("space_types").collect();
    if (existingTypes.length > 0) {
      return { message: "Категории уже инициализированы" };
    }
    
    const defaultCategories = [
      { type_id: 1, slug: "hotel_room", name: "Номера в отеле", display_name: "Номер в отеле" },
      { type_id: 2, slug: "bungalow", name: "Домики-бунгало", display_name: "Домик-бунгало" },
      { type_id: 3, slug: "scandinavian_house", name: "Скандинавские дома", display_name: "Скандинавский дом" },
      { type_id: 4, slug: "chalet", name: "Домики-шале", display_name: "Домик-шале" },
      { type_id: 5, slug: "townhouse", name: "Таунхаусы", display_name: "Таунхаус" },
    ];
    
    const now = Date.now();
    
    for (let i = 0; i < defaultCategories.length; i++) {
      const category = defaultCategories[i];
      await ctx.db.insert("space_types", {
        ...category,
        order_index: i + 1,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }
    
    return { message: "Категории успешно инициализированы" };
  },
});