'use client'

import { useFormContext } from 'react-hook-form'
import Image from 'next/image'
import { Upload, Loader2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useFileUrl } from '@/hooks/useConvex'
import { typography, forms } from '@/hooks/useDesignTokens'
import { TourFormData } from '@/lib/tour-form-schema'

interface TourBasicInfoModernProps {
  tourId?: string
}

export default function TourBasicInfoModern({ tourId }: TourBasicInfoModernProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useFormContext<TourFormData>()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  
  // Мутации
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const updateTourDraft = useMutation(api.tours.updateTourDraft)

  // Watching values
  const mainImage = watch('main_image')
  const price = watch('price')
  const discountPercent = watch('discount_percent')

  // URL изображения
  const mainImageUrl = useFileUrl(mainImage || null)

  // Функция загрузки изображения
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

  // Обработка выбора изображения
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const storageId = await uploadImage(file)
      setValue('main_image', storageId)
      
      // Автосохранение при загрузке изображения
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

  // Автосохранение при потере фокуса
  const handleBlur = async (fieldName: keyof TourFormData) => {
    if (!tourId) return
    
    const isValid = await trigger(fieldName)
    if (!isValid) return

    const fieldValue = watch(fieldName)
    
    try {
      await updateTourDraft({
        id: tourId as Id<"tours">,
        updates: { [fieldName]: fieldValue }
      })
      console.log('✅ Автосохранение:', fieldName)
    } catch (error) {
      console.error('Ошибка автосохранения:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Основные поля */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Название тура *
          </label>
          <input
            {...register('title')}
            onBlur={() => handleBlur('title')}
            className={"w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + 
              forms.input + 
              (errors.title ? ' border-red-500' : ' border-neutral-200')
            }
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Регион *
          </label>
          <input
            {...register('region')}
            onBlur={() => handleBlur('region')}
            className={"w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + 
              forms.input + 
              (errors.region ? ' border-red-500' : ' border-neutral-200')
            }
          />
          {errors.region && (
            <p className="mt-1 text-sm text-red-600">{errors.region.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className={typography.body.small + " block font-medium mb-2"}>
          Описание *
        </label>
        <textarea
          {...register('description')}
          onBlur={() => handleBlur('description')}
          className={"w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + 
            forms.input + 
            (errors.description ? ' border-red-500' : ' border-neutral-200')
          }
          rows={4}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>
      
      {/* Главное изображение */}
      <div>
        <label className={typography.body.small + " block font-medium mb-4"}>
          Главное изображение тура
        </label>
        {mainImageUrl ? (
          <div className="relative w-full h-64 bg-neutral-100 rounded-xl overflow-hidden">
            <Image
              src={mainImageUrl}
              alt="Главное изображение"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setValue('main_image', undefined)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-medium"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="w-full">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-32 bg-beige-50 border-2 border-dashed border-beige-200 rounded-xl hover:bg-beige-100 hover:border-primary transition-all flex flex-col items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className={typography.body.small}>Загрузка...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-primary" />
                  <span className={typography.body.small}>Загрузить изображение</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Параметры тура */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Цена (₽) *
          </label>
          <input
            type="number"
            {...register('price', { valueAsNumber: true })}
            onBlur={() => handleBlur('price')}
            className={"w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + 
              forms.input + 
              (errors.price ? ' border-red-500' : ' border-neutral-200')
            }
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
          {discountPercent > 0 && price > 0 && (
            <div className="mt-2 text-sm text-neutral-600">
              Старая цена: {Math.round(price / (1 - discountPercent / 100)).toLocaleString('ru-RU')} ₽
            </div>
          )}
        </div>
        
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Скидка (%)
          </label>
          <input
            type="number"
            {...register('discount_percent', { valueAsNumber: true })}
            onBlur={() => handleBlur('discount_percent')}
            className={"w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + 
              forms.input + 
              (errors.discount_percent ? ' border-red-500' : ' border-neutral-200')
            }
            min="0"
            max="100"
          />
          {errors.discount_percent && (
            <p className="mt-1 text-sm text-red-600">{errors.discount_percent.message}</p>
          )}
        </div>
        
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Дней *
          </label>
          <input
            type="number"
            {...register('duration_days', { valueAsNumber: true })}
            onBlur={() => handleBlur('duration_days')}
            className={"w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + 
              forms.input + 
              (errors.duration_days ? ' border-red-500' : ' border-neutral-200')
            }
          />
          {errors.duration_days && (
            <p className="mt-1 text-sm text-red-600">{errors.duration_days.message}</p>
          )}
        </div>
        
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Участников *
          </label>
          <input
            type="number"
            {...register('max_participants', { valueAsNumber: true })}
            onBlur={() => handleBlur('max_participants')}
            className={"w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + 
              forms.input + 
              (errors.max_participants ? ' border-red-500' : ' border-neutral-200')
            }
          />
          {errors.max_participants && (
            <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Сложность *
          </label>
          <select
            {...register('difficulty_level')}
            onBlur={() => handleBlur('difficulty_level')}
            className={"w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + 
              forms.input + 
              (errors.difficulty_level ? ' border-red-500' : ' border-neutral-200')
            }
          >
            <option value="легкий">Легкий</option>
            <option value="средний">Средний</option>
            <option value="сложный">Сложный</option>
          </select>
          {errors.difficulty_level && (
            <p className="mt-1 text-sm text-red-600">{errors.difficulty_level.message}</p>
          )}
        </div>
        
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Статус
          </label>
          <select
            {...register('is_active')}
            onBlur={() => handleBlur('is_active')}
            className={"w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
          >
            <option value="true">Активен</option>
            <option value="false">Скрыт</option>
          </select>
        </div>
      </div>
    </div>
  )
}