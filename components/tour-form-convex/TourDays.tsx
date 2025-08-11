'use client'

import { useState } from 'react'
import { typography, forms } from '@/hooks/useDesignTokens'
import { Plus, Trash2, Home, Car, Footprints, ChevronLeft, ChevronRight, Grid, Layers } from 'lucide-react'
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
import TourDayActivities from './TourDayActivities'

interface TourDay {
  _id?: string
  day_number: number
  accommodation?: string
  auto_distance_km?: number
  walk_distance_km?: number
  activities: Activity[]
}

interface Activity {
  _id?: string
  name: string
  description: string
  image?: string
  type: string
  time_start?: string
  time_end?: string
  price?: number
  order_number: number
  is_included: boolean
}

interface TourDaysProps {
  days: TourDay[]
  onDaysChange: (days: TourDay[]) => void
  uploadingActivity: string | null
  selectedActivityImages: { [key: string]: File }
  activityFileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement }>
  onActivityImageSelect: (e: React.ChangeEvent<HTMLInputElement>, dayNumber: number, activityOrder: number) => Promise<void>
  setSelectedActivityImages: (images: { [key: string]: File }) => void
  typography: any
  forms: any
}

// Компонент для сортируемого дня
function SortableDay({ 
  day, 
  dayIndex,
  onRemove,
  onUpdate,
  children 
}: { 
  day: TourDay
  dayIndex: number
  onRemove: () => void
  onUpdate: (updates: Partial<TourDay>) => void
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: day._id || `day-${day.day_number}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl shadow-soft p-6 ${isDragging ? 'z-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}

export default function TourDays({
  days,
  onDaysChange,
  uploadingActivity,
  selectedActivityImages,
  activityFileInputRefs,
  onActivityImageSelect,
  setSelectedActivityImages,
  typography,
  forms
}: TourDaysProps) {
  const [viewMode, setViewMode] = useState<'all' | 'single'>('single') // Изменено на single по умолчанию чтобы избежать лагов
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Добавление нового дня
  const addDay = () => {
    const newDayNumber = days.length + 1
    const newDay: TourDay = {
      day_number: newDayNumber,
      activities: []
    }
    onDaysChange([...days, newDay])
  }

  // Удаление дня
  const removeDay = (index: number) => {
    const updatedDays = days.filter((_, i) => i !== index).map((day, i) => ({
      ...day,
      day_number: i + 1
    }))
    onDaysChange(updatedDays)
  }

  // Обновление дня
  const updateDay = (index: number, updates: Partial<TourDay>) => {
    const updatedDays = [...days]
    updatedDays[index] = { ...updatedDays[index], ...updates }
    onDaysChange(updatedDays)
  }

  // Изменение порядкового номера дня
  const changeDayNumber = (index: number, newNumber: number) => {
    if (newNumber < 1 || newNumber > days.length) return
    
    const updatedDays = [...days]
    const day = updatedDays.splice(index, 1)[0]
    updatedDays.splice(newNumber - 1, 0, day)
    
    // Перенумеровываем дни
    const renumberedDays = updatedDays.map((d, i) => ({
      ...d,
      day_number: i + 1
    }))
    
    onDaysChange(renumberedDays)
  }

  // Drag and drop для дней
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = days.findIndex(d => (d._id || `day-${d.day_number}`) === active.id)
      const newIndex = days.findIndex(d => (d._id || `day-${d.day_number}`) === over.id)
      
      const reorderedDays = arrayMove(days, oldIndex, newIndex).map((day, i) => ({
        ...day,
        day_number: i + 1
      }))
      
      onDaysChange(reorderedDays)
    }
  }

  // Компонент для отображения одного дня
  const renderDay = (day: TourDay, index: number, isFullView: boolean = true) => (
    <div key={day._id || `day-${day.day_number}`} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className={typography.heading.card}>
            День {day.day_number}
          </h3>
          {viewMode === 'all' && (
            <input
              type="number"
              value={day.day_number}
              onChange={(e) => changeDayNumber(index, Number(e.target.value))}
              className="w-16 px-2 py-1 border border-neutral-200 rounded-lg text-center"
              min="1"
              max={days.length}
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => removeDay(index)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={typography.body.small + " block mb-2"}>
            <Home className="w-4 h-4 inline mr-1" />
            Размещение
          </label>
          <input
            type="text"
            value={day.accommodation || ''}
            onChange={(e) => updateDay(index, { accommodation: e.target.value })}
            placeholder="Где ночуем"
            className={"w-full px-4 py-2 border border-neutral-200 rounded-lg " + forms.input}
          />
        </div>
        
        <div>
          <label className={typography.body.small + " block mb-2"}>
            <Car className="w-4 h-4 inline mr-1" />
            На авто (км)
          </label>
          <input
            type="number"
            value={day.auto_distance_km || ''}
            onChange={(e) => updateDay(index, { auto_distance_km: Number(e.target.value) })}
            placeholder="0"
            className={"w-full px-4 py-2 border border-neutral-200 rounded-lg " + forms.input}
          />
        </div>
        
        <div>
          <label className={typography.body.small + " block mb-2"}>
            <Footprints className="w-4 h-4 inline mr-1" />
            Пешком (км)
          </label>
          <input
            type="number"
            value={day.walk_distance_km || ''}
            onChange={(e) => updateDay(index, { walk_distance_km: Number(e.target.value) })}
            placeholder="0"
            className={"w-full px-4 py-2 border border-neutral-200 rounded-lg " + forms.input}
          />
        </div>
      </div>
      
      {isFullView && (
        <TourDayActivities
          activities={day.activities}
          dayIndex={index}
          dayNumber={day.day_number}
          onActivitiesChange={(activities) => updateDay(index, { activities })}
          uploadingActivity={uploadingActivity}
          selectedActivityImages={selectedActivityImages}
          activityFileInputRefs={activityFileInputRefs}
          onActivityImageSelect={onActivityImageSelect}
          setSelectedActivityImages={setSelectedActivityImages}
          typography={typography}
          forms={forms}
        />
      )}
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className={typography.heading.section}>Дни тура</h3>
        <div className="flex gap-4">
          {/* Переключатель режима отображения */}
          <div className="flex bg-neutral-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'all' 
                  ? 'bg-white shadow-soft text-primary' 
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              <Grid className="w-4 h-4" />
              Все дни
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'single' 
                  ? 'bg-white shadow-soft text-primary' 
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              По одному
            </button>
          </div>
          
          <button
            type="button"
            onClick={addDay}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить день
          </button>
        </div>
      </div>
      
      {viewMode === 'all' ? (
        // Режим отображения всех дней
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            <SortableContext
              items={days.map(d => d._id || `day-${d.day_number}`)}
              strategy={verticalListSortingStrategy}
            >
              {days.map((day, index) => (
                <SortableDay
                  key={day._id || `day-${day.day_number}`}
                  day={day}
                  dayIndex={index}
                  onRemove={() => removeDay(index)}
                  onUpdate={(updates) => updateDay(index, updates)}
                >
                  {renderDay(day, index)}
                </SortableDay>
              ))}
            </SortableContext>
          </div>
        </DndContext>
      ) : (
        // Режим отображения по одному дню
        <div>
          {days.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
                  disabled={selectedDayIndex === 0}
                  className="p-2 rounded-xl hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex gap-2">
                  {days.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedDayIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === selectedDayIndex 
                          ? 'bg-primary w-8' 
                          : 'bg-neutral-300 hover:bg-neutral-400'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => setSelectedDayIndex(Math.min(days.length - 1, selectedDayIndex + 1))}
                  disabled={selectedDayIndex === days.length - 1}
                  className="p-2 rounded-xl hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-white rounded-2xl shadow-soft p-6">
                {renderDay(days[selectedDayIndex], selectedDayIndex)}
              </div>
            </>
          )}
        </div>
      )}
      
      {days.length === 0 && (
        <div className="text-center py-12 bg-neutral-50 rounded-2xl">
          <p className={typography.body.large + " text-neutral-600 mb-4"}>
            Дни тура еще не добавлены
          </p>
          <button
            type="button"
            onClick={addDay}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            Добавить первый день
          </button>
        </div>
      )}
    </div>
  )
}