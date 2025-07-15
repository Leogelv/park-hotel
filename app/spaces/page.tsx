'use client'

import { useState } from 'react'
import Link from 'next/link'
import SpaceCard from '@/components/SpaceCardImproved'
import MobileCategorySelector from '@/components/MobileCategorySelector'
import { useSpaces, useSpaceTypes } from '@/hooks/useConvex'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { typography, spacing } from '@/hooks/useDesignTokens'

export default function SpacesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const spaces = useSpaces(true, selectedCategory) // только доступные, с фильтром по категории
  const spaceTypes = useQuery(api.spaceTypes.getAllSpaceTypes, { onlyActive: true })

  // Подготавливаем категории для мобильного селектора
  const categoryOptions = [
    { 
      value: undefined, 
      label: 'Все номера', 
      count: spaces?.length || 0 
    },
    ...(spaceTypes || []).map(type => {
      return {
        value: type.slug,
        label: type.name,
        count: spaces?.filter(s => s.room_type === type.slug).length || 0
      }
    })
  ]

  return (
    <div className="min-h-screen" style={{backgroundColor: '#feead3'}}>
      {/* Header */}
    

      <div className={spacing.container.wide + " py-8 md:py-12"}>

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
            {/* Категории - десктоп и мобильная версия */}
            {spaceTypes && spaceTypes.length > 0 && (
              <>
                {/* Мобильный селектор */}
                <div className="block md:hidden mb-6">
                  <MobileCategorySelector
                    categories={categoryOptions}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>

                {/* Десктоп кнопки */}
                <div className="hidden md:block mb-8">
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
                    {spaceTypes
                      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                      .map((type) => {
                        return (
                          <button
                            key={type._id}
                            onClick={() => setSelectedCategory(type.slug)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                              selectedCategory === type.slug
                                ? 'bg-primary text-white shadow-soft'
                                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {type.name}
                          </button>
                        )
                      })}
                  </div>
                </div>
              </>
            )}

            {/* Горизонтальная лента номеров */}
            <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
              {/* Контейнер с горизонтальным скроллом */}
              <div className="overflow-x-auto py-8 pb-12">
                <div className="flex gap-6 w-max px-4 sm:px-6 lg:px-8">
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
              <div className="absolute top-0 right-0 w-8 h-full pointer-events-none" style={{background: 'linear-gradient(to left, #feead3, transparent)'}} />
              <div className="absolute top-0 left-0 w-8 h-full pointer-events-none" style={{background: 'linear-gradient(to right, #feead3, transparent)'}} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}