import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const clearAndSeedAltaiTour = mutation({
  args: {},
  handler: async (ctx) => {
    // Очищаем все существующие туры
    const existingTours = await ctx.db.query("tours").collect();
    for (const tour of existingTours) {
      await ctx.db.delete(tour._id);
    }
    console.log("Cleared all existing tours");

    // Создаем тур "Алтай за 5 дней"
    const now = Date.now();
    const tourId = await ctx.db.insert("tours", {
      title: "Алтай за 5 дней",
      description: "5-ти дневный тур от парк-отеля «Чыгыш», который охватывает основные достопримечательности Горного Алтая. Тур составлен по комфортным маршрутам и тайминг, чтобы насладиться Алтаем без спешки, и получить удовольствие.",
      price: 55000, // Новая цена
      discount_percent: 29, // Скидка 29% (рассчитано от старой цены 77000)
      duration_days: 5,
      max_participants: 20,
      difficulty_level: "Средний",
      region: "Горный Алтай",
      is_active: true,
      visible: true, // Видимость на сайте
      created_at: now,
      updated_at: now,
      gallery_images: [],

      // Временно сохраняем программу по дням в старом формате
      itinerary: [
        {
          day: 1,
          description: "День 1: Знакомство с Алтаем. Трансфер от аэропорта, заселение в парк-отель «Чыгыш», обед, время для отдыха, ужин и вечер-знакомство."
        },
        {
          day: 2,
          description: "День 2: Остров Патмос и Чемальская ГЭС. Экскурсия (09:00-14:00) к основным достопримечательностям, обед на природе, смотровая площадка «Зубы Дракона». Баня по желанию."
        },
        {
          day: 3,
          description: "День 3: Чуйский тракт и Гейзерово озеро. Ранний выезд (07:30), перевалы Семинский и Чике-Таман, слияние Чуи и Катуни, водопад, обед-гриль с видами."
        },
        {
          day: 4,
          description: "День 4: Экстремальный подъем в горы. Уникальная поездка на внедорожнике, посещение пасеки, пикник на смотровой площадке, праздничный ужин с дискотекой."
        },
        {
          day: 5,
          description: "День 5: ГЛК Манжерок и возвращение. Подъем на канатной дороге (скидка 15% для гостей), трансфер в аэропорт."
        }
      ],

      // Что включено в стоимость
      included_services: [
        "Проживание в парк-отеле «Чыгыш» (4 ночи)",
        "Трёхразовое питание по программе",
        "Все трансферы по программе",
        "Услуги профессионального гида",
        "Экскурсии: Остров Патмос, Чемальская ГЭС, Ороктойский мост",
        "Экскурсия по Чуйскому тракту с посещением Гейзерового озера",
        "Уникальный подъем на внедорожнике на смотровую площадку",
        "Праздничный ужин с развлекательной программой",
        "Посещение пасеки с дегустацией алтайского мёда"
      ],

      // Дополнительно оплачивается
      excluded_services: [
        "Авиаперелет до Горно-Алтайска",
        "Баня в парк-отеле (2500₽)",
        "Канатная дорога на ГЛК Манжерок (1000₽ со скидкой 15%)",
        "Личные расходы и сувениры",
        "Алкогольные напитки"
      ]
    });

    console.log("Created Altai 5 days tour with ID:", tourId);
    
    // Добавляем даты доступности (каждую субботу на ближайшие 3 месяца)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let week = 0; week < 12; week++) {
      const startDate = new Date(today);
      // Находим следующую субботу
      const daysUntilSaturday = (6 - startDate.getDay() + 7) % 7 || 7;
      startDate.setDate(startDate.getDate() + daysUntilSaturday + (week * 7));
      
      await ctx.db.insert("availability", {
        tour_id: tourId,
        start_date: startDate.getTime(),
        occupied_spots: 0,
        created_at: now,
        updated_at: now
      });
    }
    
    console.log("Added availability dates for the tour");
    
    return {
      success: true,
      tourId: tourId,
      message: "Successfully created 'Алтай за 5 дней' tour with availability dates"
    };
  },
});