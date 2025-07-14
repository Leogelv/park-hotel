import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Создать день тура
export const createTourDay = mutation({
  args: {
    tour_id: v.id("tours"),
    day_number: v.number(),
    accommodation: v.optional(v.string()),
    auto_distance_km: v.optional(v.number()),
    walk_distance_km: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const dayId = await ctx.db.insert("tour_days", {
      ...args,
      created_at: now,
      updated_at: now
    });
    
    return dayId;
  },
});

// Обновить день тура
export const updateTourDay = mutation({
  args: {
    id: v.id("tour_days"),
    accommodation: v.optional(v.string()),
    auto_distance_km: v.optional(v.number()),
    walk_distance_km: v.optional(v.number())
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

// Удалить день тура
export const deleteTourDay = mutation({
  args: { id: v.id("tour_days") },
  handler: async (ctx, args) => {
    // Сначала удаляем все активности этого дня
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_tour_day", (q) => q.eq("tour_day_id", args.id))
      .collect();
    
    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }
    
    // Затем удаляем сам день
    await ctx.db.delete(args.id);
  },
});

// Получить дни тура
export const getTourDays = query({
  args: { tourId: v.id("tours") },
  handler: async (ctx, args) => {
    const days = await ctx.db
      .query("tour_days")
      .withIndex("by_tour", (q) => q.eq("tour_id", args.tourId))
      .collect();
    
    return days.sort((a, b) => a.day_number - b.day_number);
  },
});