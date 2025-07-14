import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Получить все пространства
export const getAllSpaces = query({
  args: { 
    onlyAvailable: v.optional(v.boolean()),
    roomType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query;
    
    if (args.onlyAvailable) {
      query = ctx.db.query("spaces").withIndex("by_availability", q => q.eq("is_available", true));
    } else {
      query = ctx.db.query("spaces");
    }
    
    const spaces = await query.collect();
    
    if (args.roomType) {
      return spaces.filter(space => space.room_type === args.roomType);
    }
    
    return spaces;
  },
});

// Получить пространство по ID
export const getSpaceById = query({
  args: { id: v.id("spaces") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Создать новое пространство
export const createSpace = mutation({
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
    images: v.optional(v.array(v.string())),
    is_available: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const space = await ctx.db.insert("spaces", {
      ...args,
      images: args.images || [],
      is_available: args.is_available ?? true,
      created_at: now,
      updated_at: now
    });
    
    return space;
  },
});

// Обновить пространство
export const updateSpace = mutation({
  args: {
    id: v.id("spaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    capacity: v.optional(v.number()),
    area_sqm: v.optional(v.float64()),
    floor: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    room_type: v.optional(v.string()),
    price_per_night: v.optional(v.float64()),
    hourly_rate: v.optional(v.float64()),
    images: v.optional(v.array(v.string())),
    is_available: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now()
    });
    
    return id;
  },
});

// Удалить пространство
export const deleteSpace = mutation({
  args: { id: v.id("spaces") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Получить типы комнат (строки)
export const getRoomTypes = query({
  handler: async (ctx) => {
    const spaces = await ctx.db.query("spaces").collect();
    const types = [...new Set(spaces.map(space => space.room_type))];
    return types;
  },
});

// Получить типы комнат из таблицы space_types
export const getSpaceTypes = query({
  handler: async (ctx) => {
    const spaceTypes = await ctx.db.query("space_types").collect();
    return spaceTypes.sort((a, b) => a.type_id - b.type_id);
  },
});