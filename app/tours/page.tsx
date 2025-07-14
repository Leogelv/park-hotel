'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TourCard from '@/components/TourCard'
import { useTours } from '@/hooks/useConvex'
import { ArrowLeft } from 'lucide-react'
import { typography, spacing } from '@/hooks/useDesignTokens'

export default function ToursPage() {
  const tours = useTours(true) // только активные туры
  const router = useRouter()

  const handleTourClick = (tour: any) => {
    router.push(`/tours/${tour._id || tour.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-white">
      {/* Header */}
      

      <div className={spacing.container.wide + " py-12"}>
        {/* Hero секция */}
        <div className="text-center mb-12 animate-fade-in">
         
        </div>

        {tours === undefined ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className={typography.body.large}>Загружаем туры...</div>
            </div>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-pastel-peach/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={typography.body.large + " mb-4"}>Туры пока не добавлены</p>
            <Link href="/" className="btn-outline">
              Вернуться на главную
            </Link>
          </div>
        ) : (
          <>
            {/* Десктоп - сетка */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour, index) => (
                <div 
                  key={tour._id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TourCard tour={{...tour, id: tour._id, name: tour.title}} onOpenDetails={handleTourClick} />
                </div>
              ))}
            </div>

            {/* Мобильная версия - вертикальный список */}
            <div className="md:hidden space-y-6">
              {tours.map((tour, index) => (
                <div 
                  key={tour._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TourCard tour={{...tour, id: tour._id, name: tour.title}} onOpenDetails={handleTourClick} />
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}