import { mutation } from "../_generated/server";

export const removeOldFields = mutation({
  args: {},
  handler: async (ctx) => {
    // Удаляем old_price из туров
    const tours = await ctx.db.query("tours").collect();
    for (const tour of tours) {
      const { old_price, ...rest } = tour as any;
      if ('old_price' in tour) {
        await ctx.db.replace(tour._id, {
          ...rest,
          updated_at: Date.now()
        });
      }
    }
    
    // Удаляем discount_amount из номеров
    const spaces = await ctx.db.query("spaces").collect();
    for (const space of spaces) {
      const { discount_amount, ...rest } = space as any;
      if ('discount_amount' in space) {
        await ctx.db.replace(space._id, {
          ...rest,
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