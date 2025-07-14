import { mutation } from "../_generated/server";

export const updateDiscountFields = mutation({
  args: {},
  handler: async (ctx) => {
    // Обновляем туры
    const tours = await ctx.db.query("tours").collect();
    for (const tour of tours) {
      const updates: any = {};
      
      // Конвертируем old_price в discount_percent
      if ('old_price' in tour && tour.old_price && tour.price) {
        const discount = ((Number(tour.old_price) - Number(tour.price)) / Number(tour.old_price)) * 100;
        updates.discount_percent = Math.round(discount);
      }
      
      // Удаляем старое поле
      if ('old_price' in tour) {
        await ctx.db.patch(tour._id, {
          ...updates,
          updated_at: Date.now()
        });
      }
    }
    
    // Обновляем номера
    const spaces = await ctx.db.query("spaces").collect();
    for (const space of spaces) {
      const updates: any = {};
      
      // Конвертируем discount_amount в discount_percent
      if ('discount_amount' in space && space.discount_amount && space.price_per_night) {
        const oldPrice = Number(space.price_per_night) + Number(space.discount_amount);
        const discount = (Number(space.discount_amount) / oldPrice) * 100;
        updates.discount_percent = Math.round(discount);
      }
      
      // Удаляем старое поле
      if ('discount_amount' in space) {
        await ctx.db.patch(space._id, {
          ...updates,
          updated_at: Date.now()
        });
      }
    }
    
    return { 
      toursUpdated: tours.length,
      spacesUpdated: spaces.length
    };
  },
});