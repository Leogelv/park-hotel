'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Loader2 } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useFileUrl } from '@/hooks/useConvex'
import { useDebounce } from '@/hooks/useDebounce'
import { typography, spacing, forms } from '@/hooks/useDesignTokens'

// Импортируем новые компоненты
import TourBasicInfo from './tour-form-convex/TourBasicInfo'
import TourExtras from './tour-form-convex/TourExtras'
import TourDays from './tour-form-convex/TourDays'

interface TourFormProps {
  tourId?: string
}

interface TourDay {
  _id?: Id<"tour_days">
  day_number: number
  accommodation?: string
  auto_distance_km?: number
  walk_distance_km?: number
  activities: Activity[]
}

interface Activity {
  _id?: Id<"activities">
  name: string
  description: string
  image?: string
  image_url?: string
  type: string
  time_start?: string
  time_end?: string
  price?: number
  order_number: number
  is_included: boolean
}

interface ExtraService {
  name: string
  price?: number
}

export default function TourFormConvex({ tourId }: TourFormProps) {
  // Логи убраны
  
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activityFileInputRefs = useRef<{ [key: string]: HTMLInputElement }>({})
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingActivity, setUploadingActivity] = useState<string | null>(null)
  
  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    region: '',
    description: '',
    price: 0,
    discount_percent: 0,
    duration_days: 1,
    max_participants: 10,
    difficulty_level: 'легкий',
    is_active: true
  })
  
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [days, setDays] = useState<TourDay[]>([])
  const [includedServices, setIncludedServices] = useState<string[]>([])
  const [extraServices, setExtraServices] = useState<ExtraService[]>([])
  const [selectedActivityImages, setSelectedActivityImages] = useState<{ [key: string]: File }>({})
  const [autoSaving, setAutoSaving] = useState(false)
  
  // Добавляем debounce для дней чтобы не сохранять при каждом нажатии клавиши
  const debouncedDays = useDebounce(days, 2000) // 2 секунды задержки
  
  // Состояние для отслеживания изменений
  const [initialFormData, setInitialFormData] = useState(formData)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Загрузка данных тура с деталями (дни и активности)
  const tour = useQuery(api.tours.getTourWithDetails, 
    tourId ? { tourId: tourId as Id<"tours"> } : "skip"
  )
  
  // Мутации
  const createTour = useMutation(api.tours.createTour)
  const updateTour = useMutation(api.tours.updateTour)
  const updateTourDraft = useMutation(api.tours.updateTourDraft)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  
  // Загрузка данных при редактировании
  useEffect(() => {
    if (tour) {
      setFormData({
        title: tour.title,
        region: tour.region || '',
        description: tour.description || '',
        price: tour.price,
        discount_percent: tour.discount_percent || 0,
        duration_days: tour.duration_days,
        max_participants: tour.max_participants || 10,
        difficulty_level: tour.difficulty_level || 'легкий',
        is_active: tour.is_active !== false
      })
      
      setMainImage(tour.main_image || null)
      
      // Загружаем дни с активностями
      if (tour.days) {
        setDays(tour.days.map((day: any) => ({
          ...day,
          activities: day.activities || []
        })))
      }
      
      // Загружаем услуги
      if (tour.included_services) {
        setIncludedServices(tour.included_services)
      }
      
      // Загружаем extra_services (услуги НЕ включенные в стоимость)
      if (tour.extra_services) {
        console.log('🔥 Загружаем extra_services из БД:', tour.extra_services)
        setExtraServices(tour.extra_services)
      } else {
        setExtraServices([])
      }
      
      // Запоминаем начальные данные
      setInitialFormData({
        title: tour.title,
        region: tour.region || '',
        description: tour.description || '',
        price: tour.price,
        discount_percent: tour.discount_percent || 0,
        duration_days: tour.duration_days,
        max_participants: tour.max_participants || 10,
        difficulty_level: tour.difficulty_level || 'легкий',
        is_active: tour.is_active !== false
      })
    }
  }, [tour])
  
  // Пакетное сохранение изменений формы
  const saveDraftChanges = async (changedData: Partial<typeof formData>) => {
    if (!tourId || !tour || Object.keys(changedData).length === 0) return
    
    try {
      setAutoSaving(true)
      await updateTourDraft({
        id: tourId as Id<"tours">,
        updates: changedData
      })
      console.log('✅ Автосохранение:', Object.keys(changedData).join(', '))
    } catch (error) {
      console.error('Ошибка автосохранения:', error)
    } finally {
      setAutoSaving(false)
    }
  }
  
  // Функция для сохранения поля при потере фокуса - ОТКЛЮЧЕНА для оптимизации
  const saveFieldOnBlur = async (field: string, value: any) => {
    // ОТКЛЮЧЕНО: автосохранение при blur вызывает лаги
    // if (!tourId || !tour) return
    // 
    // // Проверяем, изменилось ли значение
    // const currentValue = (initialFormData as any)[field]
    // if (currentValue === value) return
    // 
    // await saveDraftChanges({ [field]: value })
  }
  
  // Функция для проверки изменений в форме
  const checkForChanges = (newFormData: typeof formData) => {
    const changed = JSON.stringify(newFormData) !== JSON.stringify(initialFormData)
    setHasChanges(changed)
    return changed
  }
  
  // Функция загрузки изображения (исправленная по примеру рабочих скриптов)
  const uploadImage = async (file: File): Promise<string> => {
    const uploadUrl = await generateUploadUrl()
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': file.type 
      },
      body: file
    })
    const { storageId } = await response.json()
    return storageId
  }
  
  // Обработка выбора главного изображения с автосохранением
  const handleMainImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const storageId = await uploadImage(file)
      setMainImage(storageId)
      
      // Автоматически сохраняем в базу при редактировании
      if (tourId) {
        await updateTourDraft({
          id: tourId as Id<"tours">,
          updates: { main_image: storageId }
        })
      }
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error)
      alert('Ошибка при загрузке изображения')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  // Обновление активности с автосохранением
  const updateActivityAndSave = async (dayIndex: number, activityIndex: number, updates: Partial<Activity>) => {
    const updatedDays = [...days]
    updatedDays[dayIndex].activities[activityIndex] = {
      ...updatedDays[dayIndex].activities[activityIndex],
      ...updates
    }
    setDays(updatedDays)
    
    // Если редактируем существующий тур, сохраняем в БД
    if (tourId && updatedDays[dayIndex]._id) {
      try {
        await updateTour({
          id: tourId as Id<"tours">,
          days: updatedDays.map(day => ({
            ...day,
            activities: day.activities.map(act => ({
              ...act,
              image: act.image,
              image_url: act.image_url || ''
            }))
          }))
        })
      } catch (error) {
        console.error('Ошибка при сохранении активности:', error)
      }
    }
  }
  
  // Обработка выбора изображения активности (по аналогии с обложкой)
  const handleActivityImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, dayNumber: number, activityOrder: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const activityKey = `${dayNumber}-${activityOrder}`
    
    // Сохраняем файл в состоянии чтобы сразу показать превью
    setSelectedActivityImages(prev => ({
      ...prev,
      [activityKey]: file
    }))
    
    // Начинаем загрузку
    setUploadingActivity(activityKey)
    try {
      const storageId = await uploadImage(file)
      
      // Обновляем активность с новым изображением
      const updatedDays = [...days]
      const dayIndex = updatedDays.findIndex(d => d.day_number === dayNumber)
      if (dayIndex !== -1) {
        const activityIndex = updatedDays[dayIndex].activities.findIndex(a => a.order_number === activityOrder)
        if (activityIndex !== -1) {
          updatedDays[dayIndex].activities[activityIndex].image = storageId
          // Также очищаем image_url если был
          updatedDays[dayIndex].activities[activityIndex].image_url = ''
          setDays(updatedDays)
          
          // Если редактируем существующий тур, сразу сохраняем в БД (как с обложкой)
          if (tourId && updatedDays[dayIndex]._id) {
            await updateTour({
              id: tourId as Id<"tours">,
              days: updatedDays.map(day => ({
                ...day,
                activities: day.activities.map(act => ({
                  ...act,
                  image: act.image,
                  image_url: act.image_url || ''
                }))
              }))
            })
          } else {
            console.log('⚠️ Не сохраняем в БД: tourId:', tourId, 'dayId:', updatedDays[dayIndex]?._id)
          }
        } else {
          console.log('❌ Активность не найдена!')
        }
      } else {
        console.log('❌ День не найден!')
      }
      
      // После успешной загрузки удаляем файл из временного хранилища
      setSelectedActivityImages(prev => {
        const updated = { ...prev }
        delete updated[activityKey]
        return updated
      })
    } catch (error) {
      console.error('Ошибка при загрузке изображения активности:', error)
      alert('Ошибка при загрузке изображения')
      // При ошибке тоже удаляем файл из состояния
      setSelectedActivityImages(prev => {
        const updated = { ...prev }
        delete updated[activityKey]
        return updated
      })
    } finally {
      setUploadingActivity(null)
      const input = activityFileInputRefs.current[activityKey]
      if (input) {
        input.value = ''
      }
    }
  }
  
  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const tourData = {
        ...formData,
        main_image: mainImage || undefined,
        days: days.map(day => ({
          day_number: day.day_number,
          accommodation: day.accommodation,
          auto_distance_km: day.auto_distance_km,
          walk_distance_km: day.walk_distance_km,
          activities: day.activities.map(activity => ({
            name: activity.name,
            description: activity.description,
            type: activity.type,
            time_start: activity.time_start,
            time_end: activity.time_end,
            price: activity.price,
            order_number: activity.order_number,
            is_included: activity.is_included,
            image: activity.image,
            image_url: activity.image_url
          }))
        })),
        included_services: includedServices.filter(s => s.length > 0),
        extra_services: extraServices
          .filter(s => s.name.length > 0 && s.price !== undefined)
          .map(s => ({ name: s.name, price: s.price! }))
      }
      
      // ЛОГИРОВАНИЕ: проверяем extra_services
      console.log('🔥 extra_services отправляются:', tourData.extra_services)
      
      if (tourId) {
        await updateTour({
          id: tourId as Id<"tours">,
          ...tourData
        })
        // При редактировании остаемся на странице
      } else {
        const newTourId = await createTour(tourData)
        // При создании нового тура переходим на его редактирование
        if (newTourId) {
          router.push(`/admin/tours/${newTourId}`)
        }
      }
    } catch (error) {
      console.error('Ошибка при сохранении тура:', error)
      alert('Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }
  
  const mainImageUrl = useFileUrl(mainImage)
  
  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="bg-white rounded-3xl shadow-soft p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className={typography.heading.page}>
            {tourId ? 'Редактировать тур' : 'Создать тур'}
          </h2>
          {tourId && autoSaving && (
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
              <Loader2 className="w-4 h-4 animate-spin" />
              Автосохранение...
            </div>
          )}
        </div>
        
        <div className="space-y-12">
          {/* Основная информация */}
          <TourBasicInfo
            formData={formData}
            mainImage={mainImageUrl || null}
            uploading={uploading}
            onFormDataChange={setFormData}
            onFieldBlur={saveFieldOnBlur}
            onImageSelect={handleMainImageSelect}
            onImageRemove={() => setMainImage(null)}
            fileInputRef={fileInputRef as any}
            typography={typography}
            forms={forms}
          />
          
          {/* Включено/Не включено в стоимость */}
          <TourExtras
            includedServices={includedServices}
            extraServices={extraServices}
            onIncludedServicesChange={setIncludedServices}
            onExtraServicesChange={setExtraServices}
            typography={typography}
            forms={forms}
          />
          
          {/* Дни тура */}
          <TourDays
            days={days}
            onDaysChange={setDays as any}
            onActivityUpdate={updateActivityAndSave}
            uploadingActivity={uploadingActivity}
            selectedActivityImages={selectedActivityImages}
            activityFileInputRefs={activityFileInputRefs}
            onActivityImageSelect={handleActivityImageSelect}
            setSelectedActivityImages={setSelectedActivityImages}
            typography={typography}
            forms={forms}
          />
        </div>
        
      </div>
      
      {/* Залипающая панель с кнопками */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-50">
        <div className="container-wide max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
            <div className="text-sm text-neutral-600 order-2 sm:order-1">
              {autoSaving && "Автосохранение..."}
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
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
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
  )
}