'use client'

import Image from 'next/image'
import { Eye, Check, X, Calendar, Users, Mountain, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useFileUrl, useTourAvailability } from '@/hooks/useConvex'
import { Doc, Id } from '@/convex/_generated/dataModel'
import { typography } from '@/hooks/useDesignTokens'

interface TourCardProps {
  tour: Doc<"tours"> & {
    // Дополнительные поля для обратной совместимости
    name?: string
    img?: string
    old_price?: number
    id?: string
  }
  onOpenDetails: (tour: any) => void
}

export default function TourCard({ tour, onOpenDetails }: TourCardProps) {
  // Получаем URL изображения из Convex storage
  const imageUrl = useFileUrl(tour.main_image || null)
  
  // Получаем даты заездов для этого тура
  const availability = useTourAvailability(tour._id as Id<"tours">)
  
  // Находим ближайшие доступные даты
  const upcomingDates = availability?.filter(date => 
    date.start_date > Date.now() && date.is_available
  ).sort((a, b) => a.start_date - b.start_date).slice(0, 2)
  
  // Состояние для разворачивания описания
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Обработчик клика на карточку
  const handleCardClick = (e: React.MouseEvent) => {
    // Не разворачиваем, если клик по кнопке
    if ((e.target as HTMLElement).closest('button')) return
    setIsExpanded(!isExpanded)
  }

  return (
    <div 
      className="card group hover:scale-[1.02] transition-all duration-300 cursor-pointer w-full max-w-sm" 
      onClick={handleCardClick}
    >
      {/* Изображение */}
      <div className="relative h-64 bg-gradient-to-br from-beige-100 to-beige-200 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={tour.title || ''}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className={typography.body.base}>Нет изображения</span>
          </div>
        )}
        
      </div>

      {/* Чипы под фотографией */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex gap-2 flex-wrap">
          <div className={`bg-primary/10 text-primary rounded-full px-3 py-1 ${typography.body.small} font-semibold`}>
            {tour.title}
          </div>
          <div className={`bg-neutral-100 text-neutral-700 rounded-full px-3 py-1 ${typography.body.small} font-medium flex items-center gap-1`}>
            <Calendar className="w-4 h-4" />
            {tour.duration_days} дней
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="px-6 pb-6">
        
        {/* Описание */}
        <div className="mb-4">
          <p className={`${typography.body.small} leading-relaxed transition-all duration-300 ${
            isExpanded ? '' : 'line-clamp-2'
          }`}>
            {tour.description}
            {!isExpanded && tour.description && tour.description.length > 100 && '...'}
          </p>
        </div>
        
        
        {/* Даты заездов */}
        {upcomingDates && upcomingDates.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-beige-50 to-white rounded-xl border border-beige-200">
            <h4 className={typography.body.small + " font-semibold text-neutral-700 mb-2"}>Ближайшие заезды:</h4>
            <div className="space-y-2">
              {upcomingDates.map((date, index) => (
                <div key={index} className={`flex items-center justify-between ${typography.body.small}`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <span>
                      {new Date(date.start_date).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })} - {new Date(date.end_date).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={typography.body.small + " text-neutral-500"}>мест:</span>
                    <span className={typography.body.small + " font-medium text-primary"}>{date.available_spots}</span>
                    <span className={typography.body.small + " text-neutral-500"}>из {date.total_capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Цена */}
        <div className="mb-5 pb-5 border-b border-beige-200">
          <div className="flex items-baseline gap-3">
            <span className={typography.display.price + " text-primary"}>
              {tour.price.toLocaleString('ru-RU')} ₽
            </span>
            {(tour as any).discount_percent && (tour as any).discount_percent > 0 && (
              <span className={typography.display.oldPrice}>
                {Math.round(tour.price / (1 - (tour as any).discount_percent / 100)).toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
          <span className={typography.body.small + " text-neutral-500"}>за человека</span>
        </div>

        {/* Секция "Включено в стоимость" */}
        {tour.included_services && tour.included_services.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-br from-pastel-mint/20 to-transparent rounded-2xl">
            <h4 className={typography.body.small + " font-semibold text-neutral-700 mb-3"}>Включено:</h4>
            <ul className="space-y-2">
              {tour.included_services.slice(0, 3).map((service, index) => (
                <li key={index} className={`flex items-start gap-2 ${typography.body.small} text-neutral-600`}>
                  <div className="w-5 h-5 bg-pastel-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-neutral-700" />
                  </div>
                  <span>{service}</span>
                </li>
              ))}
              {tour.included_services.length > 3 && (
                <li className={typography.body.small + " text-primary font-medium pl-7"}>
                  + еще {tour.included_services.length - 3}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* extra_services удалено из схемы */}

        {/* Кнопка "Подробнее" */}
        <button
          onClick={() => onOpenDetails(tour)}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Eye className="w-5 h-5" />
          Подробнее о туре
        </button>
      </div>
    </div>
  )
}