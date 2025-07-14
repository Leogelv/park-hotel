'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Loader2 } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTourForm } from '@/hooks/useTourForm'
import { tourFormSchema, TourFormData, defaultTourFormValues } from '@/lib/tour-form-schema'
import { typography } from '@/hooks/useDesignTokens'

// Компоненты
import TourBasicInfoModern from './tour-form-modern/TourBasicInfoModern'
import TourExtrasModern from './tour-form-modern/TourExtrasModern'
import TourDaysModern from './tour-form-modern/TourDaysModern'

interface TourFormModernProps {
  tourId?: string
}

export default function TourFormModern({ tourId }: TourFormModernProps) {
  console.log('🚀 TourFormModern - Современная версия с React Hook Form!')
  
  const router = useRouter()
  const [autoSaving, setAutoSaving] = useState(false)
  
  // Загрузка данных тура
  const tour = useQuery(api.tours.getTourWithDetails, 
    tourId ? { tourId: tourId as Id<"tours"> } : "skip"
  )
  
  // Инициализация формы с валидацией
  const methods = useForm<TourFormData>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: defaultTourFormValues,
    mode: 'onBlur',
  })

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
    reset,
  } = methods

  // Загружаем данные в форму при изменении tour
  React.useEffect(() => {
    if (tour) {
      const formData: Partial<TourFormData> = {
        title: tour.title || '',
        description: tour.description || '',
        region: tour.region || '',
        price: tour.price || 0,
        discount_percent: tour.discount_percent || 0,
        duration_days: tour.duration_days || 1,
        max_participants: tour.max_participants || 10,
        difficulty_level: (tour.difficulty_level as 'легкий' | 'средний' | 'сложный') || 'средний',
        is_active: tour.is_active !== false,
        main_image: tour.main_image || undefined,
        included_services: tour.included_services || [],
        days: (tour.days || []).map(day => ({
          day_number: day.day_number,
          accommodation: day.accommodation,
          auto_distance_km: day.auto_distance_km,
          walk_distance_km: day.walk_distance_km,
          activities: day.activities.map(activity => ({
            _id: activity._id,
            name: activity.name,
            description: activity.description,
            type: activity.type as 'экскурсия' | 'трансфер' | 'питание' | 'отдых' | 'вечернее мероприятие',
            time_start: activity.time_start,
            time_end: activity.time_end,
            price: activity.price,
            order_number: activity.order_number,
            is_included: activity.is_included,
            image: activity.image,
          }))
        })),
      }

      reset(formData)
    }
  }, [tour, reset])

  // Мутации
  const updateTour = useMutation(api.tours.updateTour)
  const createTour = useMutation(api.tours.createTour)

  // Обработка отправки формы
  const onSubmit = async (data: TourFormData) => {
    try {
      console.log('📤 Отправка формы:', data)
      
      if (tourId) {
        // Подготавливаем данные для updateTour
        const updateData = {
          id: tourId as Id<"tours">,
          title: data.title,
          description: data.description,
          region: data.region,
          price: data.price,
          discount_percent: data.discount_percent,
          duration_days: data.duration_days,
          max_participants: data.max_participants,
          difficulty_level: data.difficulty_level,
          is_active: data.is_active,
          main_image: data.main_image,
          included_services: data.included_services,
          days: data.days.map(day => ({
            _id: day._id ? day._id as Id<"tour_days"> : undefined,
            day_number: day.day_number,
            accommodation: day.accommodation,
            auto_distance_km: day.auto_distance_km,
            walk_distance_km: day.walk_distance_km,
            activities: day.activities.map(activity => ({
              _id: activity._id ? activity._id as Id<"activities"> : undefined,
              name: activity.name,
              description: activity.description,
              type: activity.type,
              time_start: activity.time_start,
              time_end: activity.time_end,
              price: activity.price,
              order_number: activity.order_number,
              is_included: activity.is_included,
              image: activity.image,
            }))
          }))
        }
        
        await updateTour(updateData)
        console.log('✅ Тур успешно обновлен')
      } else {
        // Создание нового тура
        const newTourId = await createTour(data)
        console.log('✅ Тур успешно создан:', newTourId)
        router.push(`/admin/tours/${newTourId}`)
        return
      }
      
      router.push('/admin/tours')
    } catch (error) {
      console.error('❌ Ошибка при сохранении тура:', error)
      alert('Ошибка при сохранении тура')
    }
  }

  // Показываем индикатор автосохранения, если есть ошибки валидации
  const hasErrors = Object.keys(errors).length > 0

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-3xl shadow-soft p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className={typography.heading.page}>
              {tourId ? 'Редактировать тур' : 'Создать тур'}
            </h2>
            <div className="flex items-center gap-4">
              {tourId && isDirty && (
                <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Есть несохраненные изменения
                </div>
              )}
              {hasErrors && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-600 rounded-full" />
                  Проверьте поля формы
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-12">
            {/* Основная информация */}
            <TourBasicInfoModern tourId={tourId} />
            
            {/* Включенные услуги */}
            <TourExtrasModern tourId={tourId} />
            
            {/* Программа тура по дням */}
            <TourDaysModern tourId={tourId} />
          </div>
          
        </div>
        
        {/* Залипающая панель с кнопками */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-50">
          <div className="container-wide max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
              <div className="text-sm text-neutral-600 order-2 sm:order-1">
                {hasErrors && <span className="text-red-600">Исправьте ошибки в форме</span>}
              </div>
              <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => router.push('/admin/tours')}
                  className="flex-1 sm:flex-none px-6 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors bg-white"
                >
                  <X className="w-5 h-5 inline-block mr-2" />
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || hasErrors}
                  className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Сохранить
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Отступ для фиксированной панели */}
        <div className="h-24"></div>
      </form>
    </FormProvider>
  )
}