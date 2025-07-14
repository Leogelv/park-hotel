import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Получить доступность для тура - только ID тура
export const getTourAvailability = query({
  args: { tour_id: v.id("tours") },
  handler: async (ctx, args) => {
    // Получаем инфо о туре для макс. участников и длительности
    const tour = await ctx.db.get(args.tour_id);
    if (!tour) return null;
    
    // Получаем все даты заездов для этого тура
    const availability = await ctx.db.query("availability")
      .withIndex("by_tour", q => q.eq("tour_id", args.tour_id))
      .collect();
    
    // Возвращаем с расчетом свободных мест и дат выезда
    return availability.map(item => ({
      start_date: item.start_date,
      end_date: item.start_date + (tour.duration_days * 24 * 60 * 60 * 1000), // +дни тура
      total_capacity: tour.max_participants,
      occupied_spots: item.occupied_spots,
      available_spots: tour.max_participants - item.occupied_spots,
      is_available: item.occupied_spots < tour.max_participants,
      price: tour.price,
      _id: item._id
    }));
  },
});

// Создать дату заезда для тура
export const createTourDate = mutation({
  args: {
    tour_id: v.id("tours"),
    start_date: v.number(),
    occupied_spots: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const availability = await ctx.db.insert("availability", {
      tour_id: args.tour_id,
      start_date: args.start_date,
      occupied_spots: args.occupied_spots || 0,
      created_at: now,
      updated_at: now
    });
    
    return availability;
  },
});

// Обновить занятость мест для даты
export const updateTourOccupancy = mutation({
  args: {
    tour_id: v.id("tours"),
    start_date: v.number(),
    spots_change: v.number() // +число для бронирования, -число для отмены
  },
  handler: async (ctx, args) => {
    const availability = await ctx.db.query("availability")
      .withIndex("by_tour_date", q => q.eq("tour_id", args.tour_id).eq("start_date", args.start_date))
      .first();
    
    if (!availability) {
      throw new Error("Tour date not found");
    }
    
    const new_occupied = Math.max(0, availability.occupied_spots + args.spots_change);
    
    await ctx.db.patch(availability._id, {
      occupied_spots: new_occupied,
      updated_at: Date.now()
    });
    
    return availability._id;
  },
});