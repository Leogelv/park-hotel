import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAltaiTourDaysAndActivities = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Находим тур "Алтай за 5 дней"
    const tour = await ctx.db
      .query("tours")
      .filter((q) => q.eq(q.field("title"), "Алтай за 5 дней"))
      .first();
    
    if (!tour) {
      throw new Error("Тур 'Алтай за 5 дней' не найден");
    }

    // Удаляем старые дни и активности если есть
    const existingDays = await ctx.db
      .query("tour_days")
      .withIndex("by_tour", (q) => q.eq("tour_id", tour._id))
      .collect();
    
    for (const day of existingDays) {
      // Удаляем активности дня
      const activities = await ctx.db
        .query("activities")
        .withIndex("by_tour_day", (q) => q.eq("tour_day_id", day._id))
        .collect();
      
      for (const activity of activities) {
        await ctx.db.delete(activity._id);
      }
      
      await ctx.db.delete(day._id);
    }

    // Создаем дни тура
    const daysData = [
      {
        day_number: 1,
        accommodation: "Парк-отель «Чыгыш»",
        auto_distance_km: 50, // Примерно от аэропорта
        walk_distance_km: 1
      },
      {
        day_number: 2,
        accommodation: "Парк-отель «Чыгыш»",
        auto_distance_km: 80,
        walk_distance_km: 3
      },
      {
        day_number: 3,
        accommodation: "Парк-отель «Чыгыш»",
        auto_distance_km: 350,
        walk_distance_km: 2
      },
      {
        day_number: 4,
        accommodation: "Парк-отель «Чыгыш»",
        auto_distance_km: 50,
        walk_distance_km: 1
      },
      {
        day_number: 5,
        accommodation: "Выезд из отеля",
        auto_distance_km: 100,
        walk_distance_km: 2
      }
    ];

    // Создаем дни и активности
    for (const dayData of daysData) {
      const dayId = await ctx.db.insert("tour_days", {
        tour_id: tour._id,
        day_number: dayData.day_number,
        accommodation: dayData.accommodation,
        auto_distance_km: dayData.auto_distance_km,
        walk_distance_km: dayData.walk_distance_km,
        created_at: now,
        updated_at: now
      });

      // Активности для каждого дня
      let activities: any[] = [];

      switch (dayData.day_number) {
        case 1:
          activities = [
            {
              name: "Трансфер от аэропорта",
              description: "Встреча в аэропорту Горно-Алтайска, знакомство с Алтаем по дороге до отеля",
              type: "трансфер",
              order_number: 1,
              is_included: true
            },
            {
              name: "Заселение и обед",
              description: "Заселение в парк-отель «Чыгыш». Обед в ресторане парк-отеля",
              type: "питание",
              order_number: 2,
              is_included: true
            },
            {
              name: "Время для отдыха",
              description: "Свободное время для отдыха после перелета и прогулки по территории",
              type: "отдых",
              order_number: 3,
              is_included: true
            },
            {
              name: "Ужин и вечер-знакомство",
              description: "Ужин в ресторане парк-отеля «Чыгыш». Вечер-знакомство с группой",
              type: "вечернее мероприятие",
              order_number: 4,
              is_included: true
            }
          ];
          break;

        case 2:
          activities = [
            {
              name: "Завтрак",
              description: "Завтрак в ресторане отеля. Сборы на экскурсию",
              type: "питание",
              time_start: "08:00",
              time_end: "09:00",
              order_number: 1,
              is_included: true
            },
            {
              name: "Экскурсия: Остров Патмос и Чемальская ГЭС",
              description: "Посещение острова Патмос, Чемальской ГЭС, Ороктойского моста",
              type: "экскурсия",
              time_start: "09:00",
              time_end: "14:00",
              order_number: 2,
              is_included: true
            },
            {
              name: "Обед на природе",
              description: "Обед на промежуточной точке - «Ороктойский мост» в формате полевой кухни",
              type: "питание",
              time_start: "14:00",
              time_end: "14:40",
              order_number: 3,
              is_included: true
            },
            {
              name: "Смотровая площадка «Зубы Дракона»",
              description: "Посещение смотровой площадки «Зубы Дракона» в Эликмонаре. Возвращение в отель",
              type: "экскурсия",
              time_start: "14:40",
              time_end: "18:00",
              order_number: 4,
              is_included: true
            },
            {
              name: "Ужин в парк-отеле",
              description: "Ужин в ресторане парк-отеля «Чыгыш»",
              type: "питание",
              time_start: "19:00",
              time_end: "20:00",
              order_number: 5,
              is_included: true
            },
            {
              name: "Баня",
              description: "Посещение бани по желанию и наличию мест",
              type: "отдых",
              time_start: "20:00",
              price: 2500,
              order_number: 6,
              is_included: false
            }
          ];
          break;

        case 3:
          activities = [
            {
              name: "Ранний завтрак",
              description: "Ранний завтрак в номере или автобусе (ланч-бокс). Сборы на экскурсию",
              type: "питание",
              time_start: "07:00",
              time_end: "07:20",
              order_number: 1,
              is_included: true
            },
            {
              name: "Экскурсия по Чуйскому тракту",
              description: "Перевалы «Семинский» и «Чике-Таман», слияние рек Чуи и Катунь, водопад, Гейзерово озеро",
              type: "экскурсия",
              time_start: "07:30",
              time_end: "14:30",
              order_number: 2,
              is_included: true
            },
            {
              name: "Обед-гриль с видами",
              description: "Обед на промежуточной точке с живописным видом в формате «гриль»",
              type: "питание",
              time_start: "14:30",
              time_end: "15:00",
              order_number: 3,
              is_included: true
            },
            {
              name: "Возвращение в отель",
              description: "Дорога обратно в парк-отель «Чыгыш»",
              type: "трансфер",
              time_start: "15:00",
              time_end: "21:00",
              order_number: 4,
              is_included: true
            },
            {
              name: "Поздний ужин",
              description: "Поздний ужин в отеле",
              type: "питание",
              time_start: "21:00",
              time_end: "21:30",
              order_number: 5,
              is_included: true
            }
          ];
          break;

        case 4:
          activities = [
            {
              name: "Завтрак",
              description: "Завтрак в ресторане отеля. Сборы на экскурсию",
              type: "питание",
              time_start: "08:00",
              time_end: "09:30",
              order_number: 1,
              is_included: true
            },
            {
              name: "Экстремальный подъем на внедорожнике",
              description: "Подъем на смотровую площадку на проходимом внедорожнике в гору. Посещение пасеки алтайского меда",
              type: "экскурсия",
              time_start: "09:30",
              time_end: "12:30",
              order_number: 2,
              is_included: true
            },
            {
              name: "Обед на смотровой площадке",
              description: "Обед в формате «гриль» с красивым видом на Катунь на смотровой площадке",
              type: "питание",
              time_start: "12:30",
              time_end: "13:30",
              order_number: 3,
              is_included: true
            },
            {
              name: "Возвращение в отель",
              description: "Спуск с горы и возвращение в парк-отель «Чыгыш»",
              type: "трансфер",
              time_start: "13:30",
              time_end: "16:00",
              order_number: 4,
              is_included: true
            },
            {
              name: "Праздничный ужин с программой",
              description: "Праздничный ужин с дискотекой и живым вокалом",
              type: "вечернее мероприятие",
              time_start: "19:00",
              time_end: "23:00",
              order_number: 5,
              is_included: true
            }
          ];
          break;

        case 5:
          activities = [
            {
              name: "Завтрак и выезд",
              description: "Завтрак в ресторане отеля. Выезд из номеров",
              type: "питание",
              time_start: "08:00",
              time_end: "09:30",
              order_number: 1,
              is_included: true
            },
            {
              name: "ГЛК Манжерок",
              description: "Прогулочный подъем на канатной дороге. Для клиентов парк-отеля «Чыгыш» скидка 15%",
              type: "экскурсия",
              time_start: "09:30",
              time_end: "13:00",
              price: 1000,
              order_number: 2,
              is_included: false
            },
            {
              name: "Трансфер в аэропорт",
              description: "Трансфер до аэропорта Горно-Алтайска",
              type: "трансфер",
              time_start: "13:00",
              order_number: 3,
              is_included: true
            }
          ];
          break;
      }

      // Создаем активности для дня
      for (const activity of activities) {
        await ctx.db.insert("activities", {
          tour_day_id: dayId,
          name: activity.name,
          description: activity.description,
          type: activity.type,
          time_start: activity.time_start,
          time_end: activity.time_end,
          price: activity.price,
          order_number: activity.order_number,
          is_included: activity.is_included,
          created_at: now,
          updated_at: now
        });
      }
    }

    console.log(`Создано ${daysData.length} дней тура с активностями`);

    return {
      success: true,
      message: `Успешно созданы дни и активности для тура 'Алтай за 5 дней'`
    };
  },
});