'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Check, X, Calendar, Users, MapPin, Clock, ChevronRight, Car, Footprints, Home, Mountain, Coffee, Utensils, Bus, Camera, Info, DollarSign, CalendarDays } from 'lucide-react'
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


export default function TourDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [activeModule, setActiveModule] = useState<'description' | 'services' | 'program'>('description')

  const tourId = params.id as Id<"tours">
  const tour = useQuery(api.tours.getTourWithDetails, { tourId })
  const mainImageUrl = useFileUrl(tour?.main_image || null)

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#feead3'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={typography.body.base}>Загрузка тура...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{backgroundColor: '#feead3'}}>
      {/* Хедер с кнопкой назад */}
      <div className="bg-white/80 backdrop-blur-md shadow-soft flex-shrink-0">
        <div className={spacing.container.default + " py-3"}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm">Назад к турам</span>
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto">
        <div className={spacing.container.default + " py-4"}>
          {/* Переключатель модулей */}
          <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-soft">
            <button
              onClick={() => setActiveModule('description')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeModule === 'description'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-neutral-600 hover:text-primary'
              }`}
            >
              <Info className="w-4 h-4" />
              <span className="text-sm">Описание</span>
            </button>
            <button
              onClick={() => setActiveModule('services')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeModule === 'services'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-neutral-600 hover:text-primary'
              }`}
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Состав услуг</span>
            </button>
            <button
              onClick={() => setActiveModule('program')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeModule === 'program'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-neutral-600 hover:text-primary'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm">Программа</span>
            </button>
          </div>

          {/* Компактная карточка тура - показывается только когда активна вкладка описания */}
          {activeModule === 'description' && (
            <div className="card mb-6 overflow-hidden">
              {/* Горизонтальная компоновка */}
              <div className="flex flex-col md:flex-row">
                {/* Изображение */}
                <div className="relative w-full md:w-80 h-64 md:h-72 bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
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
                </div>

                {/* Информация о туре */}
                <div className="flex-1 p-6">
                  <h1 className={typography.heading.section + " mb-2"}>{tour.title}</h1>
                  <p className={typography.body.base + " text-neutral-600 mb-4"}>{tour.region}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className={typography.body.small}>{tour.duration_days} дней</span>
                    </div>
                  </div>

                  <p className={typography.body.base + " mb-4"}>{tour.description}</p>

                  {/* Цена и кнопка */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className={typography.heading.section + " text-primary"}>
                        {tour.price.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className={typography.body.small + " text-neutral-500"}>за человека</span>
                    </div>
                    <button className="btn-primary text-sm py-2 px-4">
                      Забронировать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Контент модулей */}
          <div className="space-y-4">
            {/* Модуль "Описание" - уже показан в карточке выше */}

            {/* Модуль "Состав услуг" */}
            {activeModule === 'services' && (
              <div className="space-y-4">
                {/* Включено в стоимость */}
                {tour.included_services && tour.included_services.length > 0 && (
                  <div className="card p-6">
                    <h3 className={typography.heading.card + " mb-4 text-green-600 flex items-center gap-2"}>
                      <Check className="w-5 h-5" />
                      Включено в стоимость
                    </h3>
                    <ul className="space-y-2">
                      {tour.included_services.map((service, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className={typography.body.small}>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Дополнительные услуги (бывшие extra_services) */}
                {tour.extra_services && tour.extra_services.length > 0 && (
                  <div className="card p-6">
                    <h3 className={typography.heading.card + " mb-4 text-blue-600 flex items-center gap-2"}>
                      <DollarSign className="w-5 h-5" />
                      Дополнительные услуги
                    </h3>
                    <div className="space-y-3">
                      {tour.extra_services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 p-3 bg-gradient-to-r from-beige-50 to-white rounded-lg">
                          <span className={typography.body.base}>{service.name}</span>
                          <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {service.price.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Модуль "Программа тура" */}
            {activeModule === 'program' && tour.days && tour.days.length > 0 && (
              <div className="card p-6">
                <h3 className={typography.heading.card + " mb-6"}>Программа тура</h3>
                
                {/* Вкладки дней */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {tour.days.map((day, index) => (
                    <button
                      key={day._id}
                      onClick={() => setSelectedDayIndex(index)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
                        selectedDayIndex === index
                          ? 'bg-primary text-white shadow-soft'
                          : 'bg-beige-100 text-neutral-700 hover:bg-beige-200'
                      }`}
                    >
                      День {day.day_number}
                    </button>
                  ))}
                </div>

                {/* Контент выбранного дня */}
                {tour.days[selectedDayIndex] && (
                  <div className="space-y-4">
                    {/* Информация о дне */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {tour.days[selectedDayIndex].accommodation && (
                        <div className="bg-gradient-to-br from-beige-50 to-beige-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Home className="w-4 h-4 text-primary" />
                            <p className={typography.body.small + " font-medium"}>Проживание</p>
                          </div>
                          <p className={typography.body.small + " font-semibold"}>{tour.days[selectedDayIndex].accommodation}</p>
                        </div>
                      )}
                      {tour.days[selectedDayIndex].walk_distance_km && (
                        <div className="bg-gradient-to-br from-pastel-mint/20 to-pastel-mint/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Footprints className="w-4 h-4 text-primary" />
                            <p className={typography.body.small + " font-medium"}>Пешком</p>
                          </div>
                          <p className={typography.body.small + " font-semibold"}>{tour.days[selectedDayIndex].walk_distance_km} км</p>
                        </div>
                      )}
                      {tour.days[selectedDayIndex].auto_distance_km && (
                        <div className="bg-gradient-to-br from-pastel-sky/20 to-pastel-sky/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Car className="w-4 h-4 text-primary" />
                            <p className={typography.body.small + " font-medium"}>На транспорте</p>
                          </div>
                          <p className={typography.body.small + " font-semibold"}>{tour.days[selectedDayIndex].auto_distance_km} км</p>
                        </div>
                      )}
                    </div>

                    {/* Активности дня - горизонтальная лента */}
                    <div className="space-y-4">
                      <h4 className={typography.heading.card}>Активности дня</h4>
                      <div className="overflow-x-auto pb-2">
                        <div className="flex gap-3 w-max">
                          {tour.days[selectedDayIndex].activities?.map((activity, index) => {
                            const activityType = activityTypes[activity.type] || { 
                              label: activity.type, 
                              color: 'bg-neutral-500',
                              icon: Coffee 
                            }
                            const Icon = activityType.icon
                            
                            const storageImageUrl = useFileUrl(activity.image)
                            const imageUrl = storageImageUrl || activity.image_url
                            
                            return (
                              <div key={activity._id} className="bg-white rounded-lg shadow-soft overflow-hidden flex-shrink-0 w-64">
                                {/* Изображение активности или иконка */}
                                {imageUrl ? (
                                  <div className="relative w-full h-32 overflow-hidden">
                                    <Image
                                      src={imageUrl}
                                      alt={activity.name}
                                      fill
                                      className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                  </div>
                                ) : (
                                  <div className={`w-full h-32 ${activityType.color} flex items-center justify-center`}>
                                    <Icon className="w-12 h-12 text-white opacity-90" />
                                  </div>
                                )}
                                
                                {/* Контент активности */}
                                <div className="p-3">
                                  <div className="flex items-start gap-2 mb-2">
                                    <div className={`w-6 h-6 ${activityType.color} rounded flex items-center justify-center text-white flex-shrink-0`}>
                                      <Icon className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-neutral-800 font-semibold text-sm mb-1 line-clamp-2">{activity.name}</h5>
                                      {(activity.time_start || activity.time_end) && (
                                        <p className="text-xs text-neutral-500">
                                          {activity.time_start && activity.time_end 
                                            ? `${activity.time_start} - ${activity.time_end}`
                                            : activity.time_start || activity.time_end
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${activityType.color} text-white inline-block mb-2`}>
                                    {activityType.label}
                                  </span>
                                  <p className="text-xs text-neutral-600 mb-2 line-clamp-2">{activity.description}</p>
                                  {!activity.is_included && activity.price && (
                                    <p className="text-xs text-orange-600 font-medium">
                                      Доп: {activity.price.toLocaleString('ru-RU')} ₽
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}