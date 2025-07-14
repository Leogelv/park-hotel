import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Моковые данные для туров
const mockTours = [
  {
    title: "Горный тур по Кыргызстану",
    description: "Незабываемое путешествие по горным вершинам Тянь-Шаня. Откройте для себя красоту дикой природы, кристально чистые озера и традиционную культуру кочевников.",
    region: "Иссык-Куль",
    duration_days: 7,
    price: 45000,
    max_participants: 12,
    difficulty_level: "Средний",
    included_services: [
      "Трансфер из аэропорта",
      "Проживание в юртах",
      "3-х разовое питание",
      "Профессиональный гид",
      "Конные прогулки"
    ],
    excluded_services: [
      "Авиаперелет",
      "Личная страховка",
      "Алкогольные напитки"
    ],
    itinerary: [
      { day: 1, description: "Прибытие в Бишкек, трансфер на Иссык-Куль" },
      { day: 2, description: "Треккинг к водопаду Барскоон" },
      { day: 3, description: "Конная прогулка по ущелью Джеты-Огуз" },
      { day: 4, description: "Восхождение на перевал Кок-Мойнок" },
      { day: 5, description: "Отдых на берегу озера, рыбалка" },
      { day: 6, description: "Посещение культурного центра, мастер-классы" },
      { day: 7, description: "Возвращение в Бишкек" }
    ]
  },
  {
    title: "Зимний тур на горнолыжный курорт",
    description: "Активный зимний отдых на лучшем горнолыжном курорте Кыргызстана. Профессиональные трассы, обучение с инструктором и апре-ски.",
    region: "Каракол",
    duration_days: 5,
    price: 38000,
    max_participants: 20,
    difficulty_level: "Легкий",
    included_services: [
      "Трансфер до курорта",
      "Проживание в отеле",
      "Завтраки и ужины",
      "Ски-пасс",
      "Инструктор для начинающих"
    ],
    excluded_services: [
      "Прокат снаряжения",
      "Обеды на горе",
      "СПА процедуры"
    ],
    itinerary: [
      { day: 1, description: "Прибытие, размещение, вечерний брифинг" },
      { day: 2, description: "Обучение/катание на зеленых трассах" },
      { day: 3, description: "Катание на синих и красных трассах" },
      { day: 4, description: "Свободное катание, внетрассовое катание" },
      { day: 5, description: "Утреннее катание, отъезд" }
    ]
  },
  {
    title: "Культурно-гастрономический тур",
    description: "Погружение в культуру и кухню Кыргызстана. Мастер-классы по приготовлению традиционных блюд, посещение базаров и ремесленных мастерских.",
    region: "Бишкек",
    duration_days: 4,
    price: 25000,
    max_participants: 15,
    difficulty_level: "Легкий",
    included_services: [
      "Экскурсии с гидом",
      "Мастер-классы",
      "Дегустации",
      "Транспорт",
      "Обеды и ужины"
    ],
    excluded_services: [
      "Проживание",
      "Завтраки",
      "Сувениры"
    ],
    itinerary: [
      { day: 1, description: "Экскурсия по Бишкеку, посещение Ош базара" },
      { day: 2, description: "Мастер-класс по приготовлению бешбармака и мант" },
      { day: 3, description: "Поездка в Токмок, посещение башни Бурана" },
      { day: 4, description: "Ремесленные мастерские, сувенирный шоппинг" }
    ]
  }
];

// Моковые данные для пространств отеля
const mockSpaces = [
  {
    name: "Президентский люкс",
    description: "Роскошный двухэтажный люкс с панорамными окнами, видом на горы и озеро. Камин, джакузи, терраса.",
    capacity: 4,
    area_sqm: 120,
    floor: 5,
    amenities: [
      "Камин",
      "Джакузи",
      "Мини-бар",
      "Кофемашина",
      "Smart TV",
      "Терраса",
      "Сейф",
      "Халаты и тапочки"
    ],
    room_type: "suite",
    price_per_night: 25000,
  },
  {
    name: "Семейный номер Делюкс",
    description: "Просторный номер для семьи с детьми. Две спальни, гостиная зона, вид на сад.",
    capacity: 6,
    area_sqm: 65,
    floor: 3,
    amenities: [
      "Две спальни",
      "Мини-кухня",
      "Детская кроватка",
      "Smart TV",
      "Балкон",
      "Сейф",
      "Фен"
    ],
    room_type: "deluxe",
    price_per_night: 12000,
  },
  {
    name: "Стандартный двухместный",
    description: "Уютный номер с видом на горы. Идеально подходит для пар и деловых поездок.",
    capacity: 2,
    area_sqm: 32,
    floor: 2,
    amenities: [
      "Кондиционер",
      "Мини-холодильник",
      "ТВ",
      "Рабочий стол",
      "Душ",
      "Фен"
    ],
    room_type: "standard",
    price_per_night: 5500,
  },
  {
    name: "Конференц-зал 'Тянь-Шань'",
    description: "Современный конференц-зал для проведения деловых встреч и презентаций. Полное техническое оснащение.",
    capacity: 50,
    area_sqm: 85,
    floor: 1,
    amenities: [
      "Проектор",
      "Экран",
      "Звуковая система",
      "Флипчарт",
      "Wi-Fi",
      "Кофе-брейк зона",
      "Кондиционер"
    ],
    room_type: "conference",
    hourly_rate: 3000,
  },
  {
    name: "Ресторан 'Алтын-Казык'",
    description: "Изысканный ресторан с национальной и европейской кухней. Живая музыка по вечерам.",
    capacity: 80,
    area_sqm: 150,
    floor: 1,
    amenities: [
      "Основной зал",
      "VIP-кабинеты",
      "Бар",
      "Летняя терраса",
      "Сцена",
      "Детская зона"
    ],
    room_type: "restaurant",
    hourly_rate: 10000,
  }
];

// Функция для заполнения базы моковыми данными
export const seedDatabase = mutation({
  handler: async (ctx) => {
    // Проверяем, есть ли уже данные
    const existingTours = await ctx.db.query("tours").first();
    const existingSpaces = await ctx.db.query("spaces").first();
    
    if (existingTours || existingSpaces) {
      return { message: "База данных уже содержит данные" };
    }
    
    const now = Date.now();
    
    // Создаем туры
    const tourIds = [];
    for (const tour of mockTours) {
      const id = await ctx.db.insert("tours", {
        ...tour,
        gallery_images: [], // Пока без изображений
        is_active: true,
        created_at: now,
        updated_at: now
      });
      tourIds.push(id);
    }
    
    // Создаем пространства
    const spaceIds = [];
    for (const space of mockSpaces) {
      const id = await ctx.db.insert("spaces", {
        ...space,
        images: [], // Пока без изображений
        is_available: true,
        created_at: now,
        updated_at: now
      });
      spaceIds.push(id);
    }
    
    // Создаем даты заездов для туров
    const availabilityData = [];
    
    // Для каждого тура создаем несколько дат заездов
    for (let i = 0; i < tourIds.length; i++) {
      const tourId = tourIds[i];
      
      // Создаем 6 дат заездов на ближайшие 3 месяца
      for (let j = 0; j < 6; j++) {
        const startDate = now + (j * 14 + 7) * 24 * 60 * 60 * 1000; // каждые 2 недели, начиная через неделю
        const occupiedSpots = Math.floor(Math.random() * 8); // случайно от 0 до 7 занятых мест
        
        const availabilityId = await ctx.db.insert("availability", {
          tour_id: tourId,
          start_date: startDate,
          occupied_spots: occupiedSpots,
          created_at: now,
          updated_at: now
        });
        
        availabilityData.push(availabilityId);
      }
    }
    
    // Создаем несколько тестовых бронирований
    const bookings = [
      {
        tour_id: tourIds[0],
        customer_name: "Иван Петров",
        customer_email: "ivan@example.com",
        customer_phone: "+996 555 123456",
        check_in_date: now + 7 * 24 * 60 * 60 * 1000, // через неделю
        check_out_date: now + 14 * 24 * 60 * 60 * 1000, // через 2 недели
        number_of_guests: 2,
        total_price: 90000,
        status: "confirmed",
        special_requests: "Вегетарианское меню",
        created_at: now,
        updated_at: now
      },
      {
        space_id: spaceIds[0],
        customer_name: "Анна Сидорова",
        customer_email: "anna@example.com",
        customer_phone: "+996 555 789012",
        check_in_date: now + 3 * 24 * 60 * 60 * 1000,
        check_out_date: now + 5 * 24 * 60 * 60 * 1000,
        number_of_guests: 2,
        total_price: 50000,
        status: "pending",
        created_at: now,
        updated_at: now
      }
    ];
    
    // Bookings удалены из схемы
    
    // Создаем тестовые отзывы
    const reviews = [
      {
        tour_id: tourIds[0],
        booking_id: undefined,
        author_name: "Иван Петров",
        rating: 5,
        comment: "Отличный тур! Незабываемые впечатления, профессиональные гиды.",
        is_published: true,
        created_at: now
      },
      {
        space_id: spaceIds[0],
        booking_id: undefined,
        author_name: "Анна Сидорова",
        rating: 4,
        comment: "Прекрасный номер с потрясающим видом. Сервис на высоте!",
        is_published: true,
        created_at: now
      }
    ];
    
    for (const review of reviews) {
      await ctx.db.insert("reviews", review);
    }
    
    return {
      message: "База данных успешно заполнена моковыми данными",
      stats: {
        tours: tourIds.length,
        spaces: spaceIds.length,
        availability: availabilityData.length,
        bookings: 0,
        reviews: reviews.length
      }
    };
  },
});