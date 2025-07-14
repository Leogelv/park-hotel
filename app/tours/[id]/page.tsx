'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Check, X, Calendar, Users, MapPin, Clock, ChevronRight, Car, Footprints, Home, Mountain, Coffee, Utensils, Bus, Camera } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useFileUrl } from '@/hooks/useConvex'
import { typography, spacing } from '@/hooks/useDesignTokens'

// Типы активностей и их иконки
const activityTypes: Record<string, { label: string; color: string; icon: any }> = {
  'трансфер': { label: 'Трансфер', color: 'bg-blue-500', icon: Bus },
  'питание': { label: 'Питание', color: 'bg-green-500', icon: Utensils },
  'экскурсия': { label: 'Экскурсия', color: 'bg-purple-500', icon: Camera },
  'отдых': { label: 'Отдых', color: 'bg-yellow-500', icon: Coffee },
  'вечернее мероприятие': { label: 'Вечер', color: 'bg-indigo-500', icon: Mountain }
}

// Компонент для изображения активности
function ActivityImage({ activity }: { activity: any }) {
  const storageImageUrl = useFileUrl(activity.image)
  const imageUrl = storageImageUrl || activity.image_url
  
  if (!imageUrl) return null
  
  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
      <Image
        src={imageUrl}
        alt={activity.name}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  )
}

export default function TourDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)

  const tourId = params.id as Id<"tours">
  const tour = useQuery(api.tours.getTourWithDetails, { tourId })
  const mainImageUrl = useFileUrl(tour?.main_image || null)

  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 to-pastel-peach/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={typography.body.base}>Загрузка тура...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-pastel-peach/20">
      {/* Хедер с кнопкой назад */}
      <div className="bg-white/80 backdrop-blur-md shadow-soft sticky top-0 z-10">
        <div className={spacing.container.default + " py-4"}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Назад к турам</span>
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className={spacing.container.default + " py-8"}>
        {/* Заголовок и основная информация */}
        <div className="card mb-8 overflow-hidden">
          {/* Изображение */}
          <div className="relative h-[400px]">
            {mainImageUrl ? (
              <Image
                src={mainImageUrl}
                alt={tour.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className={typography.heading.hero + " mb-2"}>{tour.title}</h1>
              <p className={typography.body.large + " opacity-90"}>{tour.region}</p>
            </div>
          </div>

          {/* Информация о туре */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pastel-mint/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className={typography.body.caption}>Длительность</p>
                  <p className={typography.body.base + " font-semibold"}>{tour.duration_days} дней</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pastel-lavender/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className={typography.body.caption}>Группа</p>
                  <p className={typography.body.base + " font-semibold"}>до {tour.max_participants} чел.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pastel-peach/30 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className={typography.body.caption}>Регион</p>
                  <p className={typography.body.base + " font-semibold"}>{tour.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pastel-sky/30 rounded-xl flex items-center justify-center">
                  <Mountain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className={typography.body.caption}>Сложность</p>
                  <p className={typography.body.base + " font-semibold"}>{tour.difficulty_level}</p>
                </div>
              </div>
            </div>

            <p className={typography.body.large + " mb-8 leading-relaxed"}>{tour.description}</p>

            {/* Цена */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className={typography.display.price + " text-5xl"}>
                {tour.price.toLocaleString('ru-RU')} ₽
              </span>
              {tour.discount_percent && tour.discount_percent > 0 && (
                <span className={typography.display.oldPrice + " text-2xl"}>
                  {Math.round(tour.price / (1 - tour.discount_percent / 100)).toLocaleString('ru-RU')} ₽
                </span>
              )}
              <span className={typography.body.base}>за человека</span>
            </div>

            {/* Кнопка бронирования */}
            <button className="btn-primary">
              Забронировать тур
            </button>
          </div>
        </div>

        {/* Включено/Не включено */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Включено в стоимость */}
          <div className="card p-8">
            <h2 className={typography.heading.subsection + " mb-6 text-green-600 flex items-center gap-2"}>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              Включено в стоимость
            </h2>
            <ul className="space-y-3">
              {tour.included_services?.map((service, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className={typography.body.base}>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Не входит в стоимость */}
          <div className="card p-8">
            <h2 className={typography.heading.subsection + " mb-6 text-orange-600 flex items-center gap-2"}>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5" />
              </div>
              Дополнительно оплачивается
            </h2>
            <ul className="space-y-3">
              {tour.excluded_services?.map((service, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className={typography.body.base}>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Программа тура по дням */}
        {tour.days && tour.days.length > 0 && (
          <div className="card p-8">
            <h2 className={typography.heading.section + " mb-8"}>Программа тура</h2>
            
            {/* Вкладки дней */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tour.days.map((day, index) => (
                <button
                  key={day._id}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all transform ${
                    selectedDayIndex === index
                      ? 'bg-primary text-white shadow-medium scale-105'
                      : 'bg-beige-100 text-neutral-700 hover:bg-beige-200 hover:scale-105'
                  }`}
                >
                  <span className={typography.body.base}>День {day.day_number}</span>
                </button>
              ))}
            </div>

            {/* Контент выбранного дня */}
            {tour.days[selectedDayIndex] && (
              <div className="space-y-8">
                {/* Информация о дне */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tour.days[selectedDayIndex].accommodation && (
                    <div className="bg-gradient-to-br from-beige-50 to-beige-100 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Home className="w-5 h-5 text-primary" />
                        <p className={typography.body.small + " font-medium"}>Проживание</p>
                      </div>
                      <p className={typography.body.base + " font-semibold"}>{tour.days[selectedDayIndex].accommodation}</p>
                    </div>
                  )}
                  {tour.days[selectedDayIndex].walk_distance_km && (
                    <div className="bg-gradient-to-br from-pastel-mint/20 to-pastel-mint/10 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Footprints className="w-5 h-5 text-primary" />
                        <p className={typography.body.small + " font-medium"}>Пешком</p>
                      </div>
                      <p className={typography.body.base + " font-semibold"}>{tour.days[selectedDayIndex].walk_distance_km} км</p>
                    </div>
                  )}
                  {tour.days[selectedDayIndex].auto_distance_km && (
                    <div className="bg-gradient-to-br from-pastel-sky/20 to-pastel-sky/10 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Car className="w-5 h-5 text-primary" />
                        <p className={typography.body.small + " font-medium"}>На транспорте</p>
                      </div>
                      <p className={typography.body.base + " font-semibold"}>{tour.days[selectedDayIndex].auto_distance_km} км</p>
                    </div>
                  )}
                </div>

                {/* Активности дня */}
                <div className="space-y-6">
                  <h3 className={typography.heading.subsection}>Активности дня</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tour.days[selectedDayIndex].activities?.map((activity, index) => {
                      const activityType = activityTypes[activity.type] || { 
                        label: activity.type, 
                        color: 'bg-neutral-500',
                        icon: Coffee 
                      }
                      const Icon = activityType.icon
                      
                      return (
                        <div key={activity._id} className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all">
                          <ActivityImage activity={activity} />
                          
                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 ${activityType.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-soft`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className={typography.heading.card + " mb-1"}>{activity.name}</h4>
                                    {(activity.time_start || activity.time_end) && (
                                      <p className={typography.body.caption}>
                                        {activity.time_start && activity.time_end 
                                          ? `${activity.time_start} - ${activity.time_end}`
                                          : activity.time_start || activity.time_end
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${activityType.color} text-white`}>
                                    {activityType.label}
                                  </span>
                                </div>
                                <p className={typography.body.base + " mb-3"}>{activity.description}</p>
                                {!activity.is_included && activity.price && (
                                  <p className={typography.body.small + " text-orange-600 font-medium"}>
                                    Дополнительно: {activity.price.toLocaleString('ru-RU')} ₽
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}