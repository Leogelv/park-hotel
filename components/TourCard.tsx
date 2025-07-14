'use client'

import Image from 'next/image'
import { Eye, Check, X, Calendar, Users, Mountain, MapPin } from 'lucide-react'
import { useFileUrl } from '@/hooks/useConvex'
import { Doc } from '@/convex/_generated/dataModel'
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

  // Маппинг уровня сложности на цвета
  const difficultyColors = {
    'Легкий': 'bg-pastel-mint text-neutral-700',
    'Средний': 'bg-pastel-peach text-neutral-700',
    'Сложный': 'bg-pastel-rose text-neutral-700',
  }

  return (
    <div className="card group hover:scale-[1.02] transition-all duration-300">
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
            <span>Нет изображения</span>
          </div>
        )}
        
        {/* Регион и сложность */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-white/95 backdrop-blur-sm text-primary rounded-full px-4 py-2 text-sm font-semibold shadow-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {tour.region}
          </div>
          <div className={`rounded-full px-3 py-1.5 text-xs font-medium shadow-medium ${difficultyColors[tour.difficulty_level as keyof typeof difficultyColors] || 'bg-neutral-200'}`}>
            {tour.difficulty_level}
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="p-6">
        <h3 className={typography.heading.subsection + " mb-3"}>{tour.title}</h3>
        
        {/* Описание */}
        <p className={typography.body.small + " mb-4 line-clamp-2 leading-relaxed"}>
          {tour.description}
        </p>
        
        {/* Детали */}
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <div className="w-8 h-8 bg-pastel-sky/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span>{tour.duration_days} дней</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <div className="w-8 h-8 bg-pastel-peach/30 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <span>до {tour.max_participants} чел.</span>
          </div>
        </div>
        
        {/* Цена */}
        <div className="mb-5 pb-5 border-b border-beige-200">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-display font-bold text-primary">
              {tour.price.toLocaleString('ru-RU')} ₽
            </span>
            {(tour as any).discount_percent && (tour as any).discount_percent > 0 && (
              <span className="text-lg text-neutral-400 line-through">
                {Math.round(tour.price / (1 - (tour as any).discount_percent / 100)).toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
          <span className="text-neutral-500 text-sm">за человека</span>
        </div>

        {/* Секция "Включено в стоимость" */}
        {tour.included_services && tour.included_services.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-br from-pastel-mint/20 to-transparent rounded-2xl">
            <h4 className="font-semibold text-sm text-neutral-700 mb-3">Включено:</h4>
            <ul className="space-y-2">
              {tour.included_services.slice(0, 3).map((service, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-neutral-600">
                  <div className="w-5 h-5 bg-pastel-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-neutral-700" />
                  </div>
                  <span>{service}</span>
                </li>
              ))}
              {tour.included_services.length > 3 && (
                <li className="text-sm text-primary font-medium pl-7">
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