import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Создать активность
export const createActivity = mutation({
  args: {
    tour_day_id: v.id("tour_days"),
    name: v.string(),
    description: v.string(),
    image: v.optional(v.string()),
    image_url: v.optional(v.string()),
    type: v.string(),
    time_start: v.optional(v.string()),
    time_end: v.optional(v.string()),
    price: v.optional(v.float64()),
    order_number: v.number(),
    is_included: v.boolean()
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const activityId = await ctx.db.insert("activities", {
      ...args,
      created_at: now,
      updated_at: now
    });
    
    return activityId;
  },
});

// Обновить активность
export const updateActivity = mutation({
  args: {
    id: v.id("activities"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    image_url: v.optional(v.string()),
    type: v.optional(v.string()),
    time_start: v.optional(v.string()),
    time_end: v.optional(v.string()),
    price: v.optional(v.float64()),
    order_number: v.optional(v.number()),
    is_included: v.optional(v.boolean())
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

// Удалить активность
export const deleteActivity = mutation({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Получить активности дня
export const getDayActivities = query({
  args: { dayId: v.id("tour_days") },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_order", (q) => q.eq("tour_day_id", args.dayId))
      .collect();
    
    return activities.sort((a, b) => a.order_number - b.order_number);
  },
});

// Получить все активности
export const getAllActivities = query({
  handler: async (ctx) => {
    return await ctx.db.query("activities").collect();
  },
});

// Массовое обновление изображений активностей
export const updateActivitiesImages = mutation({
  args: {
    updates: v.array(v.object({
      name: v.string(),
      image_url: v.string()
    }))
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db.query("activities").collect();
    
    for (const update of args.updates) {
      const activity = activities.find(a => a.name === update.name);
      if (activity) {
        await ctx.db.patch(activity._id, {
          image_url: update.image_url,
          updated_at: Date.now()
        });
      }
    }
    
    return { updated: args.updates.length };
  },
});