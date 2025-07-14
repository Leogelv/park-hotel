import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateTourPrice = mutation({
  args: {},
  handler: async (ctx) => {
    // Находим тур "Алтай за 5 дней"
    const tours = await ctx.db
      .query("tours")
      .filter((q) => q.eq(q.field("title"), "Алтай за 5 дней"))
      .collect();

    if (tours.length === 0) {
      throw new Error("Тур 'Алтай за 5 дней' не найден");
    }

    const tour = tours[0];
    
    // Обновляем цены
    await ctx.db.patch(tour._id, {
      price: 55000,
      discount_percent: 29, // Рассчитано от старой цены 77000
      updated_at: Date.now()
    });

    return { 
      success: true, 
      message: `Цены для тура "${tour.title}" обновлены: новая цена 55000₽, старая цена 77000₽`
    };
  },
});