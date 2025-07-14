'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, X, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { typography, forms } from '@/hooks/useDesignTokens'
import { TourFormData, createDefaultActivity } from '@/lib/tour-form-schema'

interface TourDaysModernProps {
  tourId?: string
}

export default function TourDaysModern({ tourId }: TourDaysModernProps) {
  const {
    control,
    formState: { errors },
    register,
    watch,
    trigger,
    setValue,
    getValues,
  } = useFormContext<TourFormData>()

  // Управление массивом дней
  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
    control,
    name: 'days',
  })

  // Состояние для сворачивания дней
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set())

  // Мутация для автосохранения
  const updateTourDraft = useMutation(api.tours.updateTourDraft)

  // Автосохранение дней
  const handleDaysBlur = async () => {
    if (!tourId) return
    
    const isValid = await trigger('days')
    if (!isValid) return

    // Дни сохраняются только при финальной отправке формы
    // так как требуют сложной логики обновления в отдельных таблицах
    console.log('📝 Дни будут сохранены при отправке формы')
  }

  // Добавление нового дня
  const addDay = () => {
    appendDay({
      day_number: dayFields.length + 1,
      activities: [createDefaultActivity(1)],
    })
  }

  // Удаление дня
  const removeDayHandler = (dayIndex: number) => {
    removeDay(dayIndex)
    // react-hook-form автоматически переиндексирует массив
    // Номера дней можно отображать как dayIndex + 1 в UI
    setTimeout(handleDaysBlur, 100)
  }

  // Эти функции больше не нужны - DayContent будет управлять активностями самостоятельно

  // Сворачивание/разворачивание дня
  const toggleDayCollapse = (dayIndex: number) => {
    const newCollapsed = new Set(collapsedDays)
    if (newCollapsed.has(dayIndex)) {
      newCollapsed.delete(dayIndex)
    } else {
      newCollapsed.add(dayIndex)
    }
    setCollapsedDays(newCollapsed)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={typography.heading.section}>
          Программа тура по дням
        </h3>
        <button
          type="button"
          onClick={addDay}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить день
        </button>
      </div>

      {dayFields.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-xl">
          <p className="text-neutral-600 mb-4">
            Программа тура не составлена. Добавьте первый день чтобы начать.
          </p>
          <button
            type="button"
            onClick={addDay}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            Добавить первый день
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {dayFields.map((dayField, dayIndex) => {
            const isCollapsed = collapsedDays.has(dayIndex)
            const dayErrors = errors.days?.[dayIndex]
            
            return (
              <div 
                key={dayField.id} 
                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden"
              >
                {/* Заголовок дня */}
                <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleDayCollapse(dayIndex)}
                        className="p-1 hover:bg-white rounded-lg transition-colors"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronUp className="w-5 h-5" />
                        )}
                      </button>
                      <h4 className={typography.heading.subsection}>
                        День {dayIndex + 1}
                      </h4>
                      {dayErrors && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" title="Есть ошибки" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDayHandler(dayIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить день"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Содержимое дня */}
                {!isCollapsed && (
                  <div className="p-6 space-y-6">
                    {/* Основная информация дня */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={typography.body.small + " block font-medium mb-2"}>
                          Размещение
                        </label>
                        <input
                          {...register(`days.${dayIndex}.accommodation` as const)}
                          onBlur={handleDaysBlur}
                          placeholder="Название отеля/базы отдыха"
                          className={
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                            forms.input +
                            (dayErrors?.accommodation ? ' border-red-500' : ' border-neutral-200')
                          }
                        />
                        {dayErrors?.accommodation && (
                          <p className="mt-1 text-sm text-red-600">
                            {typeof dayErrors.accommodation === 'object' && 'message' in dayErrors.accommodation
                              ? dayErrors.accommodation.message
                              : 'Ошибка в поле размещения'
                            }
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className={typography.body.small + " block font-medium mb-2"}>
                          Автопереезд (км)
                        </label>
                        <input
                          type="number"
                          {...register(`days.${dayIndex}.auto_distance_km` as const, { valueAsNumber: true })}
                          onBlur={handleDaysBlur}
                          placeholder="0"
                          className={
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                            forms.input +
                            (dayErrors?.auto_distance_km ? ' border-red-500' : ' border-neutral-200')
                          }
                        />
                        {dayErrors?.auto_distance_km && (
                          <p className="mt-1 text-sm text-red-600">
                            {typeof dayErrors.auto_distance_km === 'object' && 'message' in dayErrors.auto_distance_km
                              ? dayErrors.auto_distance_km.message
                              : 'Ошибка в поле автопереезда'
                            }
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className={typography.body.small + " block font-medium mb-2"}>
                          Пешие переходы (км)
                        </label>
                        <input
                          type="number"
                          {...register(`days.${dayIndex}.walk_distance_km` as const, { valueAsNumber: true })}
                          onBlur={handleDaysBlur}
                          placeholder="0"
                          className={
                            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                            forms.input +
                            (dayErrors?.walk_distance_km ? ' border-red-500' : ' border-neutral-200')
                          }
                        />
                        {dayErrors?.walk_distance_km && (
                          <p className="mt-1 text-sm text-red-600">
                            {typeof dayErrors.walk_distance_km === 'object' && 'message' in dayErrors.walk_distance_km
                              ? dayErrors.walk_distance_km.message
                              : 'Ошибка в поле пеших переходов'
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Активности дня - управляются компонентом DayContent */}
                    <DayContent dayIndex={dayIndex} onBlur={handleDaysBlur} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Общая ошибка массива дней */}
      {errors.days && typeof errors.days === 'object' && 'message' in errors.days && (
        <p className="text-sm text-red-600">
          {typeof errors.days.message === 'string' ? errors.days.message : 'Ошибка в программе тура'}
        </p>
      )}
    </div>
  )
}

// Компонент для содержимого дня (поля дня + активности)
interface DayContentProps {
  dayIndex: number
  onBlur: () => void
}

function DayContent({ dayIndex, onBlur }: DayContentProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<TourFormData>()

  // Управление активностями этого дня через собственный useFieldArray
  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control,
    name: `days.${dayIndex}.activities`,
  })

  const dayErrors = errors.days?.[dayIndex]

  // Добавление новой активности к этому дню
  const addActivityToDay = () => {
    const newOrderNumber = activityFields.length + 1
    const newActivity = createDefaultActivity(newOrderNumber)
    appendActivity(newActivity)
  }

  return (
    <div>
      <h5 className="font-medium mb-4">Активности дня</h5>
      
      {/* Кнопка добавления активности */}
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <button
          type="button"
          onClick={addActivityToDay}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить активность
        </button>
      </div>

      {/* Список активностей */}
      <div className="space-y-4">
        {activityFields.map((activityField, activityIndex) => {
          const activityErrors = dayErrors?.activities?.[activityIndex]
          
          return (
            <div key={activityField.id} className="bg-neutral-50 rounded-xl p-4">
              <div className="flex items-start justify-between mb-4">
                <h6 className="font-medium text-sm">
                  Активность {activityIndex + 1}
                </h6>
                <button
                  type="button"
                  onClick={() => removeActivity(activityIndex)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                  title="Удалить активность"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Название *</label>
                  <input
                    {...register(`days.${dayIndex}.activities.${activityIndex}.name` as const)}
                    onBlur={onBlur}
                    placeholder="Например: Экскурсия к водопаду"
                    className={
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                      forms.input +
                      (activityErrors?.name ? ' border-red-500' : ' border-neutral-200')
                    }
                  />
                  {activityErrors?.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {typeof activityErrors.name === 'object' && 'message' in activityErrors.name
                        ? activityErrors.name.message
                        : 'Название активности обязательно'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Тип *</label>
                  <select
                    {...register(`days.${dayIndex}.activities.${activityIndex}.type` as const)}
                    onBlur={onBlur}
                    className={
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                      forms.input +
                      (activityErrors?.type ? ' border-red-500' : ' border-neutral-200')
                    }
                  >
                    <option value="экскурсия">Экскурсия</option>
                    <option value="трансфер">Трансфер</option>
                    <option value="питание">Питание</option>
                    <option value="отдых">Отдых</option>
                    <option value="вечернее мероприятие">Вечернее мероприятие</option>
                  </select>
                  {activityErrors?.type && (
                    <p className="mt-1 text-sm text-red-600">
                      {typeof activityErrors.type === 'object' && 'message' in activityErrors.type 
                        ? activityErrors.type.message 
                        : 'Выберите тип активности'
                      }
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Описание *</label>
                <textarea
                  {...register(`days.${dayIndex}.activities.${activityIndex}.description` as const)}
                  onBlur={onBlur}
                  placeholder="Подробное описание активности..."
                  rows={2}
                  className={
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                    forms.input +
                    (activityErrors?.description ? ' border-red-500' : ' border-neutral-200')
                  }
                />
                {activityErrors?.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {typeof activityErrors.description === 'object' && 'message' in activityErrors.description
                      ? activityErrors.description.message
                      : 'Описание активности обязательно'
                    }
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Время начала</label>
                  <input
                    type="time"
                    {...register(`days.${dayIndex}.activities.${activityIndex}.time_start` as const)}
                    onBlur={onBlur}
                    className={
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                      forms.input +
                      ' border-neutral-200'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Время окончания</label>
                  <input
                    type="time"
                    {...register(`days.${dayIndex}.activities.${activityIndex}.time_end` as const)}
                    onBlur={onBlur}
                    className={
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                      forms.input +
                      ' border-neutral-200'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Цена (₽)</label>
                  <input
                    type="number"
                    {...register(`days.${dayIndex}.activities.${activityIndex}.price` as const, { valueAsNumber: true })}
                    onBlur={onBlur}
                    placeholder="0"
                    className={
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                      forms.input +
                      (activityErrors?.price ? ' border-red-500' : ' border-neutral-200')
                    }
                  />
                  {activityErrors?.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {typeof activityErrors.price === 'object' && 'message' in activityErrors.price
                        ? activityErrors.price.message
                        : 'Цена не может быть отрицательной'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Включено</label>
                  <select
                    {...register(`days.${dayIndex}.activities.${activityIndex}.is_included` as const)}
                    onBlur={onBlur}
                    className={
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent " +
                      forms.input +
                      ' border-neutral-200'
                    }
                  >
                    <option value="true">Да, включено</option>
                    <option value="false">Доплата</option>
                  </select>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}