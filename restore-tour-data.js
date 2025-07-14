#!/usr/bin/env node

const CONVEX_URL = 'https://convex-backend-production-587a.up.railway.app';
const ADMIN_KEY = 'self-hosted-convex|014dd603afe27576459853d9b6acffe0c8be4cf0aa532a2398b33fd3df705e63f4b0e14146';

async function callMutation(path, args) {
  const response = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: {
      'Authorization': `Convex ${ADMIN_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      path,
      args,
      format: 'json'
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to call ${path}: ${response.statusText} - ${errorText}`);
  }
  
  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(`${path} failed: ${result.errorMessage}`);
  }
  
  return result.value;
}

async function main() {
  console.log('🚀 Восстанавливаем данные тура "Алтай за 5 дней"...\n');
  
  try {
    // 1. Создаем основной тур
    console.log('📝 Создаем основной тур...');
    const tourId = await callMutation('tours:createTour', {
      title: 'Алтай за 5 дней',
      description: '5-ти дневный тур от парк-отеля «Чыгыш», который охватывает основные достопримечательности Горного Алтая. Тур составлен по комфортным маршрутам и тайминг, чтобы насладиться Алтаем без спешки, и получить удовольствие.',
      region: 'Алтай',
      duration_days: 5,
      price: 45000,
      discount_percent: 0,
      max_participants: 20,
      difficulty_level: 'средний',
      included_services: [
        'Проживание в парк-отеле «Чыгыш»',
        'Все завтраки, обеды и ужины',
        'Трансфер от/до аэропорта',
        'Все экскурсии по программе',
        'Транспорт по маршруту',
        'Услуги гида',
        'Подъем на внедорожнике',
        'Посещение пасеки',
        'Праздничный ужин с дискотекой'
      ],
      is_active: true
    });
    
    console.log(`✅ Тур создан с ID: ${tourId}`);
    
    // 2. Создаем дни тура с активностями
    const tourDays = [
      {
        day_number: 1,
        accommodation: 'Парк-отель «Чыгыш»',
        auto_distance_km: 50,
        walk_distance_km: 2,
        activities: [
          {
            name: 'Трансфер от аэропорта',
            description: 'Встреча в аэропорту и трансфер до отеля. Знакомство с Алтаем по дороге.',
            type: 'трансфер',
            time_start: '10:00',
            time_end: '12:00',
            order_number: 1,
            is_included: true
          },
          {
            name: 'Заселение и обед',
            description: 'Заселение в номера и обед в ресторане парк-отеля.',
            type: 'питание',
            time_start: '12:00',
            time_end: '14:00',
            order_number: 2,
            is_included: true
          },
          {
            name: 'Отдых и прогулка',
            description: 'Время для отдыха после перелета и прогулки по территории отеля.',
            type: 'отдых',
            time_start: '14:00',
            time_end: '18:00',
            order_number: 3,
            is_included: true
          },
          {
            name: 'Ужин и знакомство',
            description: 'Ужин в ресторане парк-отеля «Чыгыш». Вечер знакомства с группой.',
            type: 'питание',
            time_start: '19:00',
            time_end: '21:00',
            order_number: 4,
            is_included: true
          }
        ]
      },
      {
        day_number: 2,
        accommodation: 'Парк-отель «Чыгыш»',
        auto_distance_km: 120,
        walk_distance_km: 5,
        activities: [
          {
            name: 'Завтрак и сборы',
            description: 'Завтрак в отеле и подготовка к экскурсии.',
            type: 'питание',
            time_start: '08:00',
            time_end: '09:00',
            order_number: 1,
            is_included: true
          },
          {
            name: 'Остров Патмос и Чемальская ГЭС',
            description: 'Экскурсия: Остров Патмос, Чемальская ГЭС, Ороктойский мост.',
            type: 'экскурсия',
            time_start: '09:00',
            time_end: '14:00',
            order_number: 2,
            is_included: true
          },
          {
            name: 'Обед на природе',
            description: 'Обед на промежуточной точке - «Ороктойский мост» в формате полевой кухни.',
            type: 'питание',
            time_start: '14:00',
            time_end: '14:40',
            order_number: 3,
            is_included: true
          },
          {
            name: 'Зубы Дракона',
            description: 'Смотровая площадка «Зубы Дракона» в Эликмонаре. Возвращение в отель.',
            type: 'экскурсия',
            time_start: '14:40',
            time_end: '18:00',
            order_number: 4,
            is_included: true
          },
          {
            name: 'Ужин',
            description: 'Ужин в парк-отеле «Чыгыш».',
            type: 'питание',
            time_start: '19:00',
            time_end: '20:00',
            order_number: 5,
            is_included: true
          },
          {
            name: 'Баня',
            description: 'Баня - по желанию и наличию мест.',
            type: 'отдых',
            time_start: '20:00',
            price: 2000,
            order_number: 6,
            is_included: false
          }
        ]
      },
      {
        day_number: 3,
        accommodation: 'Парк-отель «Чыгыш»',
        auto_distance_km: 300,
        walk_distance_km: 3,
        activities: [
          {
            name: 'Ранний завтрак',
            description: 'Ранний завтрак в номере или автобусе (ланч-бокс). Сборы на экскурсию.',
            type: 'питание',
            time_start: '07:00',
            time_end: '07:20',
            order_number: 1,
            is_included: true
          },
          {
            name: 'Чуйский тракт',
            description: 'Экскурсия: Чуйский тракт - перевалы «Семинский» и «Чике-Таман», слияние двух рек Чуи и Катунь, водопад, Гейзерово Озеро.',
            type: 'экскурсия',
            time_start: '07:30',
            time_end: '14:30',
            order_number: 2,
            is_included: true
          },
          {
            name: 'Обед-гриль',
            description: 'Обед на промежуточной точке с живописным видом в формате «гриль».',
            type: 'питание',
            time_start: '14:30',
            time_end: '15:00',
            order_number: 3,
            is_included: true
          },
          {
            name: 'Возвращение',
            description: 'Возвращение в парк-отель «Чыгыш».',
            type: 'трансфер',
            time_start: '15:00',
            time_end: '21:00',
            order_number: 4,
            is_included: true
          },
          {
            name: 'Поздний ужин',
            description: 'Поздний ужин в отеле.',
            type: 'питание',
            time_start: '21:00',
            time_end: '21:30',
            order_number: 5,
            is_included: true
          }
        ]
      },
      {
        day_number: 4,
        accommodation: 'Парк-отель «Чыгыш»',
        auto_distance_km: 80,
        walk_distance_km: 2,
        activities: [
          {
            name: 'Завтрак и сборы',
            description: 'Завтрак в отеле и подготовка к экскурсии.',
            type: 'питание',
            time_start: '08:00',
            time_end: '09:30',
            order_number: 1,
            is_included: true
          },
          {
            name: 'Подъем на внедорожнике',
            description: 'Подъем на смотровую площадку на проходимом внедорожнике в гору. Посещение пасеки Алтайского меда, много разнотравья и красивых видов по пути.',
            type: 'экскурсия',
            time_start: '09:30',
            time_end: '12:30',
            order_number: 2,
            is_included: true
          },
          {
            name: 'Обед на смотровой',
            description: 'Обед в формате «гриль», с красивым видом на Катунь на смотровой площадке.',
            type: 'питание',
            time_start: '12:30',
            time_end: '13:30',
            order_number: 3,
            is_included: true
          },
          {
            name: 'Возвращение в отель',
            description: 'Возвращение в парк-отель «Чыгыш».',
            type: 'трансфер',
            time_start: '13:30',
            time_end: '16:00',
            order_number: 4,
            is_included: true
          },
          {
            name: 'Праздничный ужин',
            description: 'Праздничный ужин с дискотекой и живым вокалом.',
            type: 'вечернее мероприятие',
            time_start: '19:00',
            time_end: '23:00',
            order_number: 5,
            is_included: true
          }
        ]
      },
      {
        day_number: 5,
        auto_distance_km: 60,
        walk_distance_km: 3,
        activities: [
          {
            name: 'Завтрак и выезд',
            description: 'Завтрак в отеле. Выезд из номеров.',
            type: 'питание',
            time_start: '08:00',
            time_end: '09:30',
            order_number: 1,
            is_included: true
          },
          {
            name: 'ГЛК Манжерок',
            description: 'ГЛК Манжерок. Прогулочный подъем на канатной дороге (скидка 15% для клиентов парк-отеля).',
            type: 'экскурсия',
            time_start: '09:30',
            time_end: '13:00',
            price: 800,
            order_number: 2,
            is_included: false
          },
          {
            name: 'Трансфер до аэропорта',
            description: 'Трансфер до аэропорта.',
            type: 'трансфер',
            time_start: '13:00',
            order_number: 3,
            is_included: true
          }
        ]
      }
    ];
    
    console.log('\n📅 Создаем дни тура с активностями...');
    
    for (const dayData of tourDays) {
      const { activities, ...dayInfo } = dayData;
      
      // Создаем день
      console.log(`  📌 День ${dayData.day_number}...`);
      const dayId = await callMutation('tours:createTourDay', {
        tour_id: tourId,
        ...dayInfo,
        created_at: Date.now(),
        updated_at: Date.now()
      });
      
      // Создаем активности для дня
      for (const activity of activities) {
        await callMutation('tours:createActivity', {
          tour_day_id: dayId,
          ...activity,
          created_at: Date.now(),
          updated_at: Date.now()
        });
      }
      
      console.log(`     ✅ Создано ${activities.length} активностей`);
    }
    
    console.log('\n🎉 Данные тура "Алтай за 5 дней" успешно восстановлены!');
    console.log(`📊 Создано: 1 тур, ${tourDays.length} дней, ${tourDays.reduce((acc, day) => acc + day.activities.length, 0)} активностей`);
    
  } catch (error) {
    console.error('❌ Ошибка при восстановлении данных:', error.message);
  }
}

main().catch(console.error);