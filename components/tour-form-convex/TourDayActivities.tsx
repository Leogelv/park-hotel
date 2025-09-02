'use client'

import React, { useState } from 'react'
import { typography, forms } from '@/hooks/useDesignTokens'
import { Plus, Trash2, Upload, Loader2, GripVertical, X } from 'lucide-react'
import Image from 'next/image'
import { useFileUrl } from '@/hooks/useConvex'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Activity {
  _id?: string
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

interface TourDayActivitiesProps {
  activities: Activity[]
  dayIndex: number
  dayNumber: number
  onActivitiesChange: (activities: Activity[]) => void
  onActivityUpdate?: (dayIndex: number, activityIndex: number, updates: Partial<Activity>) => Promise<void>
  uploadingActivity: string | null
  selectedActivityImages: { [key: string]: File }
  activityFileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement }>
  onActivityImageSelect: (e: React.ChangeEvent<HTMLInputElement>, dayNumber: number, activityOrder: number) => Promise<void>
  setSelectedActivityImages: (images: { [key: string]: File }) => void
  typography: any
  forms: any
}

const activityTypes = [
  { value: 'трансфер', label: 'Трансфер', color: 'bg-blue-500' },
  { value: 'питание', label: 'Питание', color: 'bg-green-500' },
  { value: 'экскурсия', label: 'Экскурсия', color: 'bg-purple-500' },
  { value: 'отдых', label: 'Отдых', color: 'bg-yellow-500' },
  { value: 'вечернее мероприятие', label: 'Вечернее мероприятие', color: 'bg-indigo-500' }
]

// Wrapper компонент для вызова хука вне map
function SortableActivityWrapper(props: {
  activity: Activity
  activityKey: string
  selectedImage?: File
  uploading: boolean
  onUpdate: (field: keyof Activity, value: any) => void
  onRemove: () => void
  onImageSelect: (e?: any, dayNumber?: number, activityOrder?: number) => void
  onImageRemove: () => void
  activityFileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement }>
  typography: any
  forms: any
}) {
  const imageUrl = useFileUrl(props.activity.image || null)
  console.log('🌅 SortableActivityWrapper:', {
    activityKey: props.activityKey,
    'activity.image': props.activity.image,
    'activity.image_url': props.activity.image_url,
    'selectedImage': props.selectedImage ? 'есть' : 'нет',
    'imageUrl from hook': imageUrl,
    'uploading': props.uploading
  })
  return <SortableActivity {...props} imageUrl={imageUrl ?? null} />
}

// Компонент для сортируемой активности
function SortableActivity({ 
  activity,
  activityKey,
  imageUrl,
  selectedImage,
  uploading,
  onUpdate,
  onRemove,
  onImageSelect,
  onImageRemove,
  activityFileInputRefs,
  typography,
  forms
}: {
  activity: Activity
  activityKey: string
  imageUrl: string | null
  selectedImage?: File
  uploading: boolean
  onUpdate: (field: keyof Activity, value: any) => void
  onRemove: () => void
  onImageSelect: (e?: any, dayNumber?: number, activityOrder?: number) => void
  onImageRemove: () => void
  activityFileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement }>
  typography: any
  forms: any
}) {
  // Локальное состояние для полей чтобы избежать лагов при вводе
  const [localName, setLocalName] = useState(activity.name)
  const [localDescription, setLocalDescription] = useState(activity.description)
  const [localImageUrl, setLocalImageUrl] = useState(activity.image_url || '')
  
  // Синхронизация при изменении пропсов
  React.useEffect(() => {
    setLocalName(activity.name)
    setLocalDescription(activity.description)
    setLocalImageUrl(activity.image_url || '')
  }, [activity.name, activity.description, activity.image_url])
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: activity._id || `activity-${activityKey}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const activityType = activityTypes.find(t => t.value === activity.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl p-4 border border-neutral-200 ${isDragging ? 'z-50 shadow-large' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Ручка для перетаскивания и номер */}
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-neutral-100 rounded"
          >
            <GripVertical className="w-5 h-5 text-neutral-400" />
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 ${activityType?.color || 'bg-primary'}`}>
            {activity.order_number}
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={() => onUpdate('name', localName)}
              placeholder="Название активности"
              className={"px-4 py-2 border border-neutral-200 rounded-lg " + forms.input}
            />
            
            <select
              value={activity.type}
              onChange={(e) => onUpdate('type', e.target.value)}
              className={"px-4 py-2 border border-neutral-200 rounded-lg " + forms.select}
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Описание */}
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            onBlur={() => onUpdate('description', localDescription)}
            placeholder="Описание активности"
            rows={4}
            className={"w-full px-4 py-2 border border-neutral-200 rounded-lg " + forms.textarea}
          />
          
          {/* Стоимость */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={typography.body.caption + " block mb-1"}>
                Включено?
              </label>
              <select
                value={activity.is_included ? 'true' : 'false'}
                onChange={(e) => onUpdate('is_included', e.target.value === 'true')}
                className={"px-4 py-2 border border-neutral-200 rounded-lg " + forms.select}
              >
                <option value="true">Включено</option>
                <option value="false">За доп. плату</option>
              </select>
            </div>
            
            {!activity.is_included && (
              <div>
                <label className={typography.body.caption + " block mb-1"}>
                  Цена (₽)
                </label>
                <input
                  type="number"
                  value={activity.price || ''}
                  onChange={(e) => onUpdate('price', Number(e.target.value))}
                  className={"px-4 py-2 border border-neutral-200 rounded-lg " + forms.input}
                />
              </div>
            )}
          </div>
          
          {/* Изображение */}
          <div>
            <label className={typography.body.caption + " block mb-2"}>
              Изображение активности
            </label>
            {(() => {
              const shouldShowImage = imageUrl || selectedImage || activity.image_url
              console.log('🖼️ Проверяем отображение изображения:', {
                activityKey,
                imageUrl,
                selectedImage: selectedImage ? 'есть' : 'нет',
                'activity.image_url': activity.image_url,
                shouldShowImage
              })
              return shouldShowImage
            })() ? (
              <div className="relative w-full h-32 bg-neutral-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedImage ? URL.createObjectURL(selectedImage) : (imageUrl || activity.image_url)!}
                  alt="Изображение активности"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={onImageRemove}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  console.log('🔥 Клик по кнопке Загрузить фото, activityKey:', activityKey)
                  
                  // Создаем input прямо здесь
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e: any) => {
                    console.log('📁 Файл выбран!')
                    const file = e.target?.files?.[0]
                    if (file) {
                      console.log('📄 Файл:', file.name)
                      const dayNumber = parseInt(activityKey.split('-')[0])
                      const activityOrder = parseInt(activityKey.split('-')[1])
                      console.log('🎯 Передаем: dayNumber =', dayNumber, ', activityOrder =', activityOrder)
                      onImageSelect(e, dayNumber, activityOrder)
                    }
                  }
                  input.click()
                }}
                disabled={uploading}
                className="w-full h-20 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-lg hover:bg-neutral-100 hover:border-primary transition-all flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className={typography.body.small}>Загрузка...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-primary" />
                    <span className={typography.body.small}>Загрузить фото</span>
                  </>
                )}
              </button>
            )}
            
            {/* Поле для ввода URL изображения */}
            <div className="mt-2">
              <input
                type="url"
                value={localImageUrl}
                onChange={(e) => setLocalImageUrl(e.target.value)}
                onBlur={() => onUpdate('image_url', localImageUrl)}
                placeholder="Или вставьте URL изображения"
                className={"w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm " + forms.input}
              />
            </div>
          </div>
        </div>
        
        {/* Кнопка удаления */}
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default function TourDayActivities({
  activities,
  dayIndex,
  dayNumber,
  onActivitiesChange,
  onActivityUpdate,
  uploadingActivity,
  selectedActivityImages,
  activityFileInputRefs,
  onActivityImageSelect,
  setSelectedActivityImages,
  typography,
  forms
}: TourDayActivitiesProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Добавление активности
  const addActivity = () => {
    const newOrderNumber = activities.length + 1
    const newActivity: Activity = {
      _id: `new-${dayNumber}-${Date.now()}`, // Добавляем временный ID для новых активностей
      name: '',
      description: '',
      type: 'экскурсия',
      order_number: newOrderNumber,
      is_included: true
    }
    onActivitiesChange([...activities, newActivity])
  }

  // Удаление активности
  const removeActivity = (index: number) => {
    const activityKey = `${dayNumber}-${activities[index].order_number}`
    
    // Удаляем изображение из выбранных
    const updatedImages = { ...selectedActivityImages }
    delete updatedImages[activityKey]
    setSelectedActivityImages(updatedImages)
    
    // Удаляем активность и перенумеровываем
    const updatedActivities = activities
      .filter((_, i) => i !== index)
      .map((activity, i) => ({
        ...activity,
        order_number: i + 1
      }))
    onActivitiesChange(updatedActivities)
  }

  // Обновление активности
  const updateActivity = async (index: number, field: keyof Activity, value: any) => {
    const updatedActivities = [...activities]
    updatedActivities[index] = { ...updatedActivities[index], [field]: value }
    onActivitiesChange(updatedActivities)
    
    // Если обновляем image_url и есть функция автосохранения
    if ((field === 'image_url' || field === 'image') && onActivityUpdate) {
      await onActivityUpdate(dayIndex, index, { [field]: value })
    }
  }

  // Drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = activities.findIndex(a => (a._id || `activity-${dayNumber}-${a.order_number}`) === active.id)
      const newIndex = activities.findIndex(a => (a._id || `activity-${dayNumber}-${a.order_number}`) === over.id)
      
      const reorderedActivities = arrayMove(activities, oldIndex, newIndex).map((activity, i) => ({
        ...activity,
        order_number: i + 1
      }))
      
      onActivitiesChange(reorderedActivities)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className={typography.heading.small}>Активности</h4>
        <button
          type="button"
          onClick={addActivity}
          className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Добавить активность
        </button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <SortableContext
            items={activities.map(a => a._id || `activity-${dayNumber}-${a.order_number}`)}
            strategy={verticalListSortingStrategy}
          >
            {activities.map((activity, index) => {
              const activityKey = `${dayNumber}-${activity.order_number}`
              
              return (
                <SortableActivityWrapper
                  key={activity._id || activityKey}
                  activity={activity}
                  activityKey={activityKey}
                  selectedImage={selectedActivityImages[activityKey]}
                  uploading={uploadingActivity === activityKey}
                  onUpdate={(field, value) => updateActivity(index, field, value)}
                  onRemove={() => removeActivity(index)}
                  onImageSelect={() => {
                    console.log('🎯 onImageSelect вызван для activityKey:', activityKey)
                    
                    // Создаем новый input каждый раз
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e: any) => {
                      console.log('📁 Файл выбран через созданный input')
                      const file = e.target?.files?.[0]
                      if (file) {
                        console.log('📄 Файл:', file.name)
                        const dayNumber = parseInt(activityKey.split('-')[0])
                        const activityOrder = parseInt(activityKey.split('-')[1])
                        console.log('🎯 Вызываем onActivityImageSelect')
                        onActivityImageSelect(e, dayNumber, activityOrder)
                      }
                    }
                    console.log('🔥 Кликаем по созданному input')
                    input.click()
                  }}
                  onImageRemove={() => {
                    updateActivity(index, 'image', undefined)
                    updateActivity(index, 'image_url', '')
                    const updatedImages = { ...selectedActivityImages }
                    delete updatedImages[activityKey]
                    setSelectedActivityImages(updatedImages)
                  }}
                  activityFileInputRefs={activityFileInputRefs}
                  typography={typography}
                  forms={forms}
                />
              )
            })}
          </SortableContext>
        </div>
      </DndContext>
      
      {activities.length === 0 && (
        <p className={typography.body.small + " text-neutral-500 text-center py-8 border-2 border-dashed border-neutral-200 rounded-xl"}>
          Нажмите "Добавить активность" чтобы создать расписание дня
        </p>
      )}
    </div>
  )
}