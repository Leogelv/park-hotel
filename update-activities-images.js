import { ConvexClient } from 'convex/browser'

const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL)

// Карта категорий активностей на изображения с Unsplash
const activityImageMap = {
  // День 1
  'Встреча в аэропорту': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
  'Трансфер на базу': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Размещение и обед': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'Знакомство с территорией': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
  'Приветственный ужин': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  
  // День 2
  'Завтрак на базе': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'Переезд к началу маршрута': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80',
  'Пеший переход': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  'Привал на обед': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
  'Продолжение маршрута': 'https://images.unsplash.com/photo-1533654478611-18737c13db4d?w=800&q=80',
  'Установка лагеря': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
  'Ужин у костра': 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800&q=80',
  
  // День 3
  'Завтрак в лагере': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  'Треккинг к водопаду': 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
  'Отдых у водопада': 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800&q=80',
  'Пикник': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
  'Возвращение в лагерь': 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=800&q=80',
  'Баня': 'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&q=80',
  'Традиционный ужин': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  
  // День 4
  'Рафтинг по реке Катунь': 'https://images.unsplash.com/photo-1515871904506-20c4f0d6d0cf?w=800&q=80',
  'Обед на берегу': 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&q=80',
  'Продолжение сплава': 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&q=80',
  'Возвращение на базу': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Отдых и развлечения': 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80',
  'Прощальный ужин': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  
  // День 5
  'Завтрак и сборы': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  'Посещение сувенирного рынка': 'https://images.unsplash.com/photo-1556011308-d6aedab5ed8f?w=800&q=80',
  'Трансфер в аэропорт': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
}

async function downloadAndUploadImage(imageUrl, activityName) {
  try {
    // Загружаем изображение
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    // Создаем файл
    const file = new File([blob], `${activityName}.jpg`, { type: 'image/jpeg' })
    
    // Получаем URL для загрузки
    const uploadUrl = await client.mutation(api.files.generateUploadUrl)
    
    // Загружаем файл
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })
    
    const { storageId } = await uploadResponse.json()
    return storageId
  } catch (error) {
    console.error(`Ошибка при загрузке изображения для ${activityName}:`, error)
    return null
  }
}

async function updateActivitiesImages() {
  console.log('Начинаем обновление изображений активностей...')
  
  try {
    // Получаем все активности
    const activities = await client.query(api.activities.getAllActivities)
    console.log(`Найдено ${activities.length} активностей`)
    
    for (const activity of activities) {
      const imageUrl = activityImageMap[activity.name]
      
      if (imageUrl && !activity.image) {
        console.log(`Загружаем изображение для: ${activity.name}`)
        
        const storageId = await downloadAndUploadImage(imageUrl, activity.name)
        
        if (storageId) {
          await client.mutation(api.activities.updateActivity, {
            id: activity._id,
            image: storageId
          })
          console.log(`✓ Обновлено: ${activity.name}`)
        }
      }
    }
    
    console.log('Обновление завершено!')
  } catch (error) {
    console.error('Ошибка:', error)
  }
}

updateActivitiesImages()