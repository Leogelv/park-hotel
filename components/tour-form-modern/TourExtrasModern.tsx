'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { typography, forms } from '@/hooks/useDesignTokens'
import { TourFormData } from '@/lib/tour-form-schema'

interface TourExtrasModernProps {
  tourId?: string
}

export default function TourExtrasModern({ tourId }: TourExtrasModernProps) {
  const {
    control,
    formState: { errors },
    register,
    watch,
    trigger,
  } = useFormContext()

  // Управление массивом услуг
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'included_services',
  })

  // Мутация для автосохранения
  const updateTourDraft = useMutation(api.tours.updateTourDraft)

  // Автосохранение при изменении услуг
  const handleServicesBlur = async () => {
    if (!tourId) return
    
    const isValid = await trigger('included_services')
    if (!isValid) return

    const services = watch('included_services')
    
    try {
      await updateTourDraft({
        id: tourId as Id<"tours">,
        updates: { included_services: services }
      })
      console.log('✅ Автосохранение услуг')
    } catch (error) {
      console.error('Ошибка автосохранения услуг:', error)
    }
  }

  // Добавление новой услуги
  const addService = () => {
    append('')
  }

  // Удаление услуги
  const removeService = (index: number) => {
    remove(index)
    // Автосохранение после удаления
    setTimeout(handleServicesBlur, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={typography.heading.section}>
          Что включено в стоимость
        </h3>
        <button
          type="button"
          onClick={addService}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить услугу
        </button>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 bg-neutral-50 rounded-xl">
            <p className="text-neutral-600">
              Услуги не добавлены. Нажмите "Добавить услугу" чтобы начать.
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  {...register(`included_services.${index}` as const)}
                  onBlur={handleServicesBlur}
                  placeholder="Название услуги (например: Трансфер из аэропорта)"
                  className={
                    "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " +
                    forms.input +
                    ((errors.included_services as any)?.[index] ? ' border-red-500' : ' border-neutral-200')
                  }
                />
                {(errors.included_services as any)?.[index] && (
                  <p className="mt-1 text-sm text-red-600">
                    {(errors.included_services as any)[index]?.message || 'Ошибка в названии услуги'}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeService(index)}
                className="mt-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Удалить услугу"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Общая ошибка массива услуг */}
      {errors.included_services && typeof errors.included_services === 'object' && 'message' in errors.included_services && (
        <p className="text-sm text-red-600">{(errors.included_services as any).message}</p>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Советы:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Укажите все услуги, включенные в стоимость тура</li>
          <li>• Будьте конкретны: "Трансфер аэропорт-отель" вместо "Трансфер"</li>
          <li>• Порядок услуг можно менять перетаскиванием</li>
        </ul>
      </div>
    </div>
  )
}