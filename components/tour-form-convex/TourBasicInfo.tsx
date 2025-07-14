'use client'

import { typography, forms } from '@/hooks/useDesignTokens'
import Image from 'next/image'
import { Upload, Loader2, X } from 'lucide-react'
import { useRef } from 'react'

interface TourBasicInfoProps {
  formData: {
    title: string
    region: string
    description: string
    price: number
    discount_percent: number
    duration_days: number
    is_active: boolean
  }
  mainImage: string | null
  uploading: boolean
  onFormDataChange: (data: any) => void
  onFieldBlur: (field: string, value: any) => void
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  typography: any
  forms: any
}

export default function TourBasicInfo({
  formData,
  mainImage,
  uploading,
  onFormDataChange,
  onFieldBlur,
  onImageSelect,
  onImageRemove,
  fileInputRef,
  typography,
  forms
}: TourBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Основные поля */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Название тура
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
            onBlur={(e) => onFieldBlur('title', e.target.value)}
            className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
            required
          />
        </div>
        
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Регион
          </label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => onFormDataChange({ ...formData, region: e.target.value })}
            onBlur={(e) => onFieldBlur('region', e.target.value)}
            className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
            required
          />
        </div>
      </div>
      
      <div>
        <label className={typography.body.small + " block font-medium mb-2"}>
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          onBlur={(e) => onFieldBlur('description', e.target.value)}
          className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.textarea}
          rows={4}
        />
      </div>
      
      {/* Главное изображение */}
      <div>
        <label className={typography.body.small + " block font-medium mb-4"}>
          Главное изображение тура
        </label>
        {mainImage ? (
          <div className="relative w-full h-64 bg-neutral-100 rounded-xl overflow-hidden">
            <Image
              src={mainImage}
              alt="Главное изображение"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={onImageRemove}
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
              onChange={onImageSelect}
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Цена (₽)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => onFormDataChange({ ...formData, price: Number(e.target.value) })}
            onBlur={(e) => onFieldBlur('price', Number(e.target.value))}
            className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
            required
          />
          {formData.discount_percent > 0 && (
            <div className="mt-2 text-sm text-neutral-600">
              Старая цена: {Math.round(formData.price / (1 - formData.discount_percent / 100)).toLocaleString('ru-RU')} ₽
            </div>
          )}
        </div>
        
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Скидка (%)
          </label>
          <input
            type="number"
            value={formData.discount_percent}
            onChange={(e) => onFormDataChange({ ...formData, discount_percent: Number(e.target.value) })}
            onBlur={(e) => onFieldBlur('discount_percent', Number(e.target.value))}
            className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
            min="0"
            max="100"
          />
        </div>
        
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Дней
          </label>
          <input
            type="number"
            value={formData.duration_days}
            onChange={(e) => onFormDataChange({ ...formData, duration_days: Number(e.target.value) })}
            onBlur={(e) => onFieldBlur('duration_days', Number(e.target.value))}
            className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
            required
          />
        </div>
      </div>
      
      <div>
        <div>
          <label className={typography.body.small + " block font-medium mb-2"}>
            Статус
          </label>
          <select
            value={formData.is_active ? 'true' : 'false'}
            onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.value === 'true' })}
            onBlur={(e) => onFieldBlur('is_active', e.target.value === 'true')}
            className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
          >
            <option value="true">Активен</option>
            <option value="false">Скрыт</option>
          </select>
        </div>
      </div>
    </div>
  )
}