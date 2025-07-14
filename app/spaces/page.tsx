'use client'

import { useState } from 'react'
import Link from 'next/link'
import SpaceCard from '@/components/SpaceCardImproved'
import { useSpaces, useRoomTypes } from '@/hooks/useConvex'
import { typography, spacing } from '@/hooks/useDesignTokens'

export default function SpacesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const spaces = useSpaces(true, selectedCategory) // только доступные, с фильтром по категории
  const roomTypes = useRoomTypes()

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-white">
      {/* Header */}
    

      <div className={spacing.container.wide + " py-12"}>
        {/* Hero секция */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className={typography.heading.page + " mb-4"}>Наши номера</h1>
          <p className={typography.body.large + " text-neutral-600 max-w-2xl mx-auto"}>
            Выберите идеальный номер для вашего отдыха в горном Алтае
          </p>
        </div>

        {spaces === undefined ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className={typography.body.large}>Загружаем номера...</div>
            </div>
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-pastel-lavender/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className={typography.body.large + " mb-4"}>Номера пока не добавлены</p>
            <Link href="/" className="btn-outline">
              Вернуться на главную
            </Link>
          </div>
        ) : (
          <>
            {/* Кнопки фильтров по категориям */}
            {roomTypes && roomTypes.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setSelectedCategory(undefined)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                      selectedCategory === undefined
                        ? 'bg-primary text-white shadow-soft'
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    Все номера
                  </button>
                  {roomTypes
                    .sort()
                    .map((type) => {
                      // Функция для получения читабельного названия типа номера
                      const getTypeLabel = (roomType: string): string => {
                        const labels: { [key: string]: string } = {
                          'hotel_room': 'Номера в отеле',
                          'bungalow': 'Бунгало',
                          'scandinavian_house': 'Скандинавские дома',
                          'chalet': 'Шале',
                          'townhouse': 'Таунхаусы',
                          'suite': 'Люксы',
                          'standard': 'Стандарт',
                          'deluxe': 'Делюкс'
                        }
                        return labels[roomType] || roomType
                      }

                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedCategory(type)}
                          className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                            selectedCategory === type
                              ? 'bg-primary text-white shadow-soft'
                              : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {getTypeLabel(type)}
                        </button>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Горизонтальная лента номеров */}
            <div className="relative">
              {/* Контейнер с горизонтальным скроллом */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 w-max">
                  {spaces.map((space, index) => (
                    <div 
                      key={space._id} 
                      className="animate-slide-up flex-shrink-0 w-80 md:w-96"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <SpaceCard space={space} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Градиент для показа возможности скролла */}
              <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-white to-transparent pointer-events-none" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}