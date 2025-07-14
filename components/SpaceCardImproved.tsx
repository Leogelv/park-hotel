'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Users, Maximize, MapPin, Wifi, Coffee, Car, Wind } from 'lucide-react'
import { useFileUrl } from '@/hooks/useConvex'
import { typography } from '@/hooks/useDesignTokens'

interface SpaceCardProps {
  space: any // Convex space объект
}

// Функция для получения читабельного названия типа номера
function getRoomTypeLabel(roomType: string): string {
  const labels: { [key: string]: string } = {
    'hotel_room': 'Номер в отеле',
    'bungalow': 'Бунгало',
    'scandinavian_house': 'Скандинавский дом',
    'chalet': 'Шале',
    'townhouse': 'Таунхаус',
    'suite': 'Люкс',
    'standard': 'Стандарт',
    'deluxe': 'Делюкс'
  }
  return labels[roomType] || roomType
}

// Компонент для отдельного изображения с lazy loading
function LazyImage({ storageId, index, isActive }: { storageId: string; index: number; isActive: boolean }) {
  const imageUrl = useFileUrl(storageId)
  const [isLoaded, setIsLoaded] = useState(false)
  
  if (!imageUrl) return null
  
  return (
    <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <Image
        src={imageUrl}
        alt={`Space image ${index + 1}`}
        fill
        className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        priority={index === 0}
        loading={index === 0 ? 'eager' : 'lazy'}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-beige-100 to-beige-200 animate-pulse" />
      )}
    </div>
  )
}

export default function SpaceCardImproved({ space }: SpaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const imageIds = space.images || []
  const hasMultipleImages = imageIds.length > 1

  // Предзагрузка следующего изображения
  useEffect(() => {
    if (imageIds.length > 1) {
      const nextIndex = (currentImageIndex + 1) % imageIds.length
      const img = new window.Image()
      const nextUrl = imageIds[nextIndex]
      if (nextUrl) {
        // Предзагрузка следующего изображения
      }
    }
  }, [currentImageIndex, imageIds])

  const nextImage = useCallback(() => {
    if (imageIds.length > 0 && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentImageIndex((prev) => (prev + 1) % imageIds.length)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [imageIds.length, isTransitioning])

  const prevImage = useCallback(() => {
    if (imageIds.length > 0 && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentImageIndex((prev) => 
        prev === 0 ? imageIds.length - 1 : prev - 1
      )
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [imageIds.length, isTransitioning])

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && hasMultipleImages) {
      nextImage()
    }
    if (isRightSwipe && hasMultipleImages) {
      prevImage()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextImage, prevImage])

  // Маппинг удобств на иконки
  const amenityIcons: { [key: string]: any } = {
    'Wi-Fi': Wifi,
    'Завтрак': Coffee,
    'Парковка': Car,
    'Кондиционер': Wind,
  }

  // Обработчик клика на карточку
  const handleCardClick = (e: React.MouseEvent) => {
    // Не разворачиваем, если клик по кнопкам навигации или другим интерактивным элементам
    if ((e.target as HTMLElement).closest('button')) return
    setIsExpanded(!isExpanded)
  }

  return (
    <div 
      className="card group hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full flex flex-col" 
      onClick={handleCardClick}
    >
      {/* Галерея изображений */}
      <div 
        className="relative h-48 bg-gradient-to-br from-beige-100 to-beige-200 group overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {imageIds.length > 0 ? (
          <>
            {imageIds.map((imageId: string, index: number) => (
              <LazyImage
                key={imageId}
                storageId={imageId}
                index={index}
                isActive={index === currentImageIndex}
              />
            ))}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>Нет изображения</span>
          </div>
        )}
        
        {/* Навигация для нескольких изображений */}
        {hasMultipleImages && (
          <>
            {/* Кнопки переключения */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-neutral-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-medium hover:bg-white"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-neutral-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-medium hover:bg-white"
              aria-label="Следующее изображение"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Индикаторы */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imageIds.map((_: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white w-8' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Перейти к изображению ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Тип номера */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-primary rounded-full px-4 py-2 text-sm font-semibold shadow-medium">
          {getRoomTypeLabel(space.room_type)}
        </div>
      </div>

      {/* Контент */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className={typography.heading.subsection + " mb-3"}>{space.name}</h3>
        
        {/* Описание */}
        <div className="mb-4">
          <p className={`${typography.body.small} leading-relaxed transition-all duration-300 ${
            isExpanded ? '' : 'line-clamp-2'
          }`}>
            {space.description}
            {!isExpanded && space.description && space.description.length > 100 && '...'}
          </p>
        </div>
        
        {/* Характеристики */}
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pastel-peach/30 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <span className={typography.body.small}>{space.capacity} мест</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pastel-mint/30 rounded-lg flex items-center justify-center">
              <Maximize className="w-4 h-4 text-primary" />
            </div>
            <span className={typography.body.small}>{space.area_sqm} м²</span>
          </div>
          {space.floor && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pastel-lavender/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className={typography.body.small}>{space.floor} этаж</span>
            </div>
          )}
        </div>
        
        {/* Удобства */}
        {space.amenities && space.amenities.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              {space.amenities.slice(0, 4).map((amenity: string) => {
                const Icon = amenityIcons[amenity]
                return (
                  <div key={amenity} className="flex items-center gap-1 text-neutral-600">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className={typography.body.small}>{amenity}</span>
                  </div>
                )
              })}
              {space.amenities.length > 4 && (
                <span className={typography.body.caption + " self-center"}>+{space.amenities.length - 4}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Цена и кнопка */}
        <div className="bg-gradient-to-r from-beige-50 to-white border border-beige-200 rounded-2xl p-4 mt-auto">
          {space.discount_percent && space.discount_percent > 0 ? (
            <div className="space-y-3">
              {/* Все что касается цены в одном ряду */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm line-through text-neutral-400 font-medium">
                  {Math.round(space.price_per_night / (1 - space.discount_percent / 100)).toLocaleString('ru-RU')} ₽
                </span>
                <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                  -{space.discount_percent}%
                </div>
                <span className="text-xl text-primary font-bold">
                  {space.price_per_night.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-neutral-500 text-sm">
                  {space.price_per_night ? 'за ночь' : 'в час'}
                </span>
              </div>
              
              {/* Кнопка */}
              <button 
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  const targetUrl = "https://chigish.ru/booking"
                  if (window.top) {
                    window.top.location.href = targetUrl
                  } else {
                    window.location.href = targetUrl
                  }
                }}
              >
                Забронировать
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Цена без скидки */}
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  {space.price_per_night ? space.price_per_night.toLocaleString('ru-RU') : space.hourly_rate?.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-neutral-500 text-sm">
                  {space.price_per_night ? 'за ночь' : 'в час'}
                </span>
              </div>
              
              {/* Кнопка */}
              <button 
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  const targetUrl = "https://chigish.ru/booking"
                  if (window.top) {
                    window.top.location.href = targetUrl
                  } else {
                    window.location.href = targetUrl
                  }
                }}
              >
                Забронировать
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}