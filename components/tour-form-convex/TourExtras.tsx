'use client'

import { typography, forms } from '@/hooks/useDesignTokens'
import { Plus, Trash2, Check, X } from 'lucide-react'

interface ExtraService {
  name: string
  price?: number
}

interface TourExtrasProps {
  includedServices: string[]
  extraServices: ExtraService[]
  onIncludedServicesChange: (services: string[]) => void
  onExtraServicesChange: (services: ExtraService[]) => void
  typography: any
  forms: any
}

export default function TourExtras({
  includedServices,
  extraServices,
  onIncludedServicesChange,
  onExtraServicesChange,
  typography,
  forms
}: TourExtrasProps) {
  // Добавление включенной услуги
  const addIncludedService = () => {
    onIncludedServicesChange([...includedServices, ''])
  }

  // Добавление платной услуги
  const addExtraService = () => {
    onExtraServicesChange([...extraServices, { name: '', price: 0 }])
  }

  // Обновление включенной услуги
  const updateIncludedService = (index: number, value: string) => {
    const updated = [...includedServices]
    updated[index] = value
    onIncludedServicesChange(updated)
  }

  // Обновление платной услуги
  const updateExtraService = (index: number, field: 'name' | 'price', value: string | number) => {
    const updated = [...extraServices]
    updated[index] = { ...updated[index], [field]: value }
    onExtraServicesChange(updated)
  }

  // Удаление включенной услуги
  const removeIncludedService = (index: number) => {
    onIncludedServicesChange(includedServices.filter((_, i) => i !== index))
  }

  // Удаление платной услуги
  const removeExtraService = (index: number) => {
    onExtraServicesChange(extraServices.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8">
      {/* Включено в стоимость */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className={typography.heading.subsection}>
            <Check className="w-5 h-5 inline-block mr-2 text-green-600" />
            Включено в стоимость
          </h3>
          <button
            type="button"
            onClick={addIncludedService}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
        
        <div className="space-y-3">
          {includedServices.map((service, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={service}
                onChange={(e) => updateIncludedService(index, e.target.value)}
                placeholder="Название услуги"
                className={"flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
              />
              <button
                type="button"
                onClick={() => removeIncludedService(index)}
                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          {includedServices.length === 0 && (
            <p className={typography.body.small + " text-neutral-500 text-center py-8 border-2 border-dashed border-neutral-200 rounded-xl"}>
              Нажмите "Добавить" чтобы указать что включено в стоимость
            </p>
          )}
        </div>
      </div>
      
      {/* Не входит в стоимость */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className={typography.heading.subsection}>
            <X className="w-5 h-5 inline-block mr-2 text-red-600" />
            Не входит в стоимость
          </h3>
          <button
            type="button"
            onClick={addExtraService}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
        
        <div className="space-y-3">
          {extraServices.map((service, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={service.name}
                onChange={(e) => updateExtraService(index, 'name', e.target.value)}
                placeholder="Название услуги"
                className={"flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
              />
              <input
                type="number"
                value={service.price || ''}
                onChange={(e) => updateExtraService(index, 'price', Number(e.target.value))}
                placeholder="Цена (₽)"
                className={"w-32 px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
              />
              <button
                type="button"
                onClick={() => removeExtraService(index)}
                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          {extraServices.length === 0 && (
            <p className={typography.body.small + " text-neutral-500 text-center py-8 border-2 border-dashed border-neutral-200 rounded-xl"}>
              Нажмите "Добавить" чтобы указать дополнительные платные услуги
            </p>
          )}
        </div>
      </div>
    </div>
  )
}