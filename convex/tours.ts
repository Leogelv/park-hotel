import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Получить все туры
export const getAllTours = query({
  args: { 
    onlyActive: v.optional(v.boolean()),
    region: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query;
    
    if (args.onlyActive) {
      query = ctx.db.query("tours").withIndex("by_active", q => q.eq("is_active", true));
    } else {
      query = ctx.db.query("tours");
    }
    
    const tours = await query.collect();
    
    if (args.region) {
      return tours.filter(tour => tour.region === args.region);
    }
    
    return tours;
  },
});

// Получить тур по ID
export const getTourById = query({
  args: { id: v.id("tours") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Получить тур с днями и активностями (оптимизированный)
export const getTourWithDetails = query({
  args: { tourId: v.id("tours") },
  handler: async (ctx, { tourId }) => {
    const tour = await ctx.db.get(tourId);
    if (!tour) return null;

    // Получаем дни тура
    const days = await ctx.db
      .query("tour_days")
      .withIndex("by_tour", (q) => q.eq("tour_id", tourId))
      .collect();

    if (days.length === 0) {
      return {
        ...tour,
        days: [],
        availability: []
      };
    }

    // Получаем ВСЕ активности для всех дней тура одним запросом
    const dayIds = days.map(d => d._id);
    const allActivities = await ctx.db
      .query("activities")
      .collect();
    
    // Фильтруем активности, принадлежащие нашим дням
    const tourActivities = allActivities.filter(activity => 
      dayIds.includes(activity.tour_day_id)
    );

    // Группируем активности по дням
    const activitiesByDay = tourActivities.reduce((acc, activity) => {
      const dayId = activity.tour_day_id;
      if (!acc[dayId]) acc[dayId] = [];
      acc[dayId].push(activity);
      return acc;
    }, {} as Record<string, typeof tourActivities>);

    // Собираем дни с активностями
    const daysWithActivities = days
      .sort((a, b) => a.day_number - b.day_number)
      .map(day => ({
        ...day,
        activities: (activitiesByDay[day._id] || [])
          .sort((a, b) => a.order_number - b.order_number)
      }));

    // Получаем доступные даты
    const availability = await ctx.db
      .query("availability")
      .withIndex("by_tour", (q) => q.eq("tour_id", tourId))
      .collect();

    return {
      ...tour,
      days: daysWithActivities,
      availability: availability.filter(a => a.start_date > Date.now())
        .sort((a, b) => a.start_date - b.start_date)
    };
  },
});

// Создать новый тур (полная схема с новыми полями)
export const createTour = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    region: v.string(),
    duration_days: v.number(),
    price: v.float64(),
    discount_percent: v.optional(v.number()),
    max_participants: v.number(),
    difficulty_level: v.string(),
    included_services: v.optional(v.array(v.string())),
    excluded_services: v.optional(v.array(v.string())),
    extra_services: v.optional(v.array(v.object({
      name: v.string(),
      price: v.float64()
    }))),
    days: v.optional(v.array(v.object({
      day_number: v.number(),
      accommodation: v.optional(v.string()),
      auto_distance_km: v.optional(v.number()),
      walk_distance_km: v.optional(v.number()),
      activities: v.array(v.object({
        name: v.string(),
        description: v.string(),
        type: v.string(),
        time_start: v.optional(v.string()),
        time_end: v.optional(v.string()),
        price: v.optional(v.number()),
        order_number: v.number(),
        is_included: v.boolean(),
        image: v.optional(v.string())
      }))
    }))),
    main_image: v.optional(v.string()),
    gallery_images: v.optional(v.array(v.string())),
    is_active: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Извлекаем дни для отдельного сохранения
    const { days, ...tourData } = args;
    
    // Создаем тур
    const tourId = await ctx.db.insert("tours", {
      ...tourData,
      included_services: args.included_services || [],
      excluded_services: [],
      gallery_images: args.gallery_images || [],
      is_active: args.is_active ?? true,
      created_at: now,
      updated_at: now
    });
    
    // Создаем дни и активности
    if (days && days.length > 0) {
      for (const day of days) {
        const { activities, ...dayData } = day;
        
        // Создаем день
        const dayId = await ctx.db.insert("tour_days", {
          tour_id: tourId,
          ...dayData,
          created_at: now,
          updated_at: now
        });
        
        // Создаем активности для дня
        for (const activity of activities) {
          await ctx.db.insert("activities", {
            tour_day_id: dayId,
            ...activity,
            created_at: now,
            updated_at: now
          });
        }
      }
    }
    
    return tourId;
  },
});

// Обновить тур (полная схема с новыми полями)
export const updateTour = mutation({
  args: {
    id: v.id("tours"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    region: v.optional(v.string()),
    duration_days: v.optional(v.number()),
    price: v.optional(v.float64()),
    discount_percent: v.optional(v.number()),
    max_participants: v.optional(v.number()),
    difficulty_level: v.optional(v.string()),
    included_services: v.optional(v.array(v.string())),
    excluded_services: v.optional(v.array(v.string())),
    extra_services: v.optional(v.array(v.object({
      name: v.string(),
      price: v.float64()
    }))),
    days: v.optional(v.array(v.object({
      _id: v.optional(v.id("tour_days")),
      day_number: v.number(),
      accommodation: v.optional(v.string()),
      auto_distance_km: v.optional(v.number()),
      walk_distance_km: v.optional(v.number()),
      activities: v.array(v.object({
        _id: v.optional(v.id("activities")),
        name: v.string(),
        description: v.string(),
        type: v.string(),
        time_start: v.optional(v.string()),
        time_end: v.optional(v.string()),
        price: v.optional(v.number()),
        order_number: v.number(),
        is_included: v.boolean(),
        image: v.optional(v.string())
      }))
    }))),
    main_image: v.optional(v.string()),
    gallery_images: v.optional(v.array(v.string())),
    is_active: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // ЛОГИРОВАНИЕ: смотрим что пришло
    console.log('🔥🔥🔥 updateTour получил args:', args);
    console.log('🔥🔥🔥 есть ли extra_services:', args.extra_services);
    
    const { id, days, ...updates } = args;
    
    // ЛОГИРОВАНИЕ: что в updates
    console.log('🔥🔥🔥 updates содержит:', updates);
    
    // Проверяем существование тура
    const tour = await ctx.db.get(id);
    if (!tour) {
      console.log(`Tour with id ${id} not found, skipping update`);
      return id;
    }
    
    // ЛОГИРОВАНИЕ: что пытаемся записать в БД
    console.log('🔥🔥🔥 Пытаемся записать в БД:', {
      ...updates,
      updated_at: Date.now()
    });
    
    // Обновляем основную информацию тура
    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now()
    });
    
    // Если переданы дни, обновляем их
    if (days !== undefined) {
      // Получаем существующие дни
      const existingDays = await ctx.db
        .query("tour_days")
        .withIndex("by_tour", q => q.eq("tour_id", id))
        .collect();
      
      // Удаляем дни, которых нет в новом списке
      const newDayIds = new Set(days.map(d => d._id).filter(id => id));
      for (const existingDay of existingDays) {
        if (!newDayIds.has(existingDay._id)) {
          // Удаляем активности дня
          const activities = await ctx.db
            .query("activities")
            .withIndex("by_order", q => q.eq("tour_day_id", existingDay._id))
            .collect();
          
          for (const activity of activities) {
            await ctx.db.delete(activity._id);
          }
          
          // Удаляем день
          await ctx.db.delete(existingDay._id);
        }
      }
      
      // Обновляем или создаем дни
      for (const day of days) {
        const { _id: dayId, activities, ...dayData } = day;
        const now = Date.now();
        
        let actualDayId: Id<"tour_days">;
        
        if (dayId) {
          // Обновляем существующий день
          await ctx.db.patch(dayId, {
            ...dayData,
            updated_at: now
          });
          actualDayId = dayId;
        } else {
          // Создаем новый день
          actualDayId = await ctx.db.insert("tour_days", {
            tour_id: id,
            ...dayData,
            created_at: now,
            updated_at: now
          });
        }
        
        // Обработка активностей
        if (activities) {
          // Получаем существующие активности
          const existingActivities = await ctx.db
            .query("activities")
            .withIndex("by_order", q => q.eq("tour_day_id", actualDayId))
            .collect();
          
          // Удаляем активности, которых нет в новом списке
          const newActivityIds = new Set(activities.map(a => a._id).filter(id => id));
          for (const existingActivity of existingActivities) {
            if (!newActivityIds.has(existingActivity._id)) {
              await ctx.db.delete(existingActivity._id);
            }
          }
          
          // Обновляем или создаем активности
          for (const activity of activities) {
            const { _id: activityId, ...activityData } = activity;
            
            if (activityId) {
              // Обновляем существующую активность
              await ctx.db.patch(activityId, {
                ...activityData,
                updated_at: now
              });
            } else {
              // Создаем новую активность
              await ctx.db.insert("activities", {
                tour_day_id: actualDayId,
                ...activityData,
                created_at: now,
                updated_at: now
              });
            }
          }
        }
      }
    }
    
    return id;
  },
});

// Удалить тур
export const deleteTour = mutation({
  args: { id: v.id("tours") },
  handler: async (ctx, args) => {
    // Удаляем дни тура
    const days = await ctx.db
      .query("tour_days")
      .withIndex("by_tour", q => q.eq("tour_id", args.id))
      .collect();
    
    for (const day of days) {
      // Удаляем активности дня
      const activities = await ctx.db
        .query("activities")
        .withIndex("by_order", q => q.eq("tour_day_id", day._id))
        .collect();
      
      for (const activity of activities) {
        await ctx.db.delete(activity._id);
      }
      
      await ctx.db.delete(day._id);
    }
    
    // Удаляем тур
    await ctx.db.delete(args.id);
  },
});

// Получить уникальные регионы
export const getUniqueRegions = query({
  handler: async (ctx) => {
    const tours = await ctx.db.query("tours").collect();
    const regions = [...new Set(tours.map(tour => tour.region))];
    return regions;
  },
});

// Пакетное обновление тура (заменяет autoSaveTourField)
export const updateTourDraft = mutation({
  args: {
    id: v.id("tours"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      region: v.optional(v.string()),
      price: v.optional(v.float64()),
      discount_percent: v.optional(v.float64()),
      duration_days: v.optional(v.number()),
      max_participants: v.optional(v.number()),
      difficulty_level: v.optional(v.string()),
      is_active: v.optional(v.boolean()),
      main_image: v.optional(v.string()),
      included_services: v.optional(v.array(v.string())),
    })
  },
  handler: async (ctx, args) => {
    // Проверяем существование документа
    const tour = await ctx.db.get(args.id);
    if (!tour) {
      console.log(`Tour with id ${args.id} not found, skipping update`);
      return args.id;
    }
    
    // Фильтруем undefined значения
    const filteredUpdates = Object.fromEntries(
      Object.entries(args.updates).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredUpdates).length === 0) {
      return args.id; // Нечего обновлять
    }
    
    await ctx.db.patch(args.id, {
      ...filteredUpdates,
      updated_at: Date.now()
    });
    
    console.log(`Updated tour ${args.id} with fields: ${Object.keys(filteredUpdates).join(', ')}`);
    return args.id;
  },
});

// Устаревшая мутация - оставляем для обратной совместимости
export const autoSaveTourField = mutation({
  args: {
    id: v.id("tours"),
    field: v.string(),
    value: v.any()
  },
  handler: async (ctx, args) => {
    console.log(`⚠️ autoSaveTourField is deprecated, use updateTourDraft instead`);
    
    // Маппим старые вызовы на новую мутацию
    const updates: Record<string, any> = {};
    
    const supportedFields = ['title', 'description', 'region', 'price', 'discount_percent', 
                           'duration_days', 'max_participants', 'difficulty_level', 'is_active', 'main_image', 'included_services'];
    
    if (supportedFields.includes(args.field)) {
      updates[args.field] = args.value;
      // Используем новую мутацию напрямую
      const tour = await ctx.db.get(args.id);
      if (tour) {
        await ctx.db.patch(args.id, {
          [args.field]: args.value,
          updated_at: Date.now()
        });
      }
      return args.id;
    }
    
    return args.id;
  },
});

// Создать день тура
export const createTourDay = mutation({
  args: {
    tour_id: v.id("tours"),
    day_number: v.number(),
    accommodation: v.optional(v.string()),
    auto_distance_km: v.optional(v.number()),
    walk_distance_km: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tour_days", args);
  },
});

// Создать активность
export const createActivity = mutation({
  args: {
    tour_day_id: v.id("tour_days"),
    name: v.string(),
    description: v.string(),
    image: v.optional(v.string()),
    type: v.string(),
    time_start: v.optional(v.string()),
    time_end: v.optional(v.string()),
    price: v.optional(v.number()),
    order_number: v.number(),
    is_included: v.boolean(),
    created_at: v.number(),
    updated_at: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});