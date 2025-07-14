'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Upload, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ImageItem {
  id: string
  url: string
  order: number
}

interface ImageUploadWithSortProps {
  images: ImageItem[]
  onImagesChange: (images: ImageItem[]) => void
}

function SortableImage({ image, onRemove }: { image: ImageItem; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="relative h-32">
        <Image
          src={image.url}
          alt="Изображение"
          fill
          className="object-cover"
        />
        
        {/* Ручка для перетаскивания */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
        
        {/* Кнопка удаления */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function ImageUploadWithSort({ images, onImagesChange }: ImageUploadWithSortProps) {
  const [newImageUrl, setNewImageUrl] = useState('')
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)
      
      const newImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
        ...img,
        order: index
      }))
      
      onImagesChange(newImages)
    }
  }

  const addImage = () => {
    if (!newImageUrl.trim()) return

    const newImage: ImageItem = {
      id: Date.now().toString(),
      url: newImageUrl,
      order: images.length
    }

    onImagesChange([...images, newImage])
    setNewImageUrl('')
  }

  const removeImage = (id: string) => {
    const newImages = images
      .filter((img) => img.id !== id)
      .map((img, index) => ({ ...img, order: index }))
    
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Форма добавления изображения */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          placeholder="URL изображения"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="button"
          onClick={addImage}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Добавить
        </button>
      </div>

      {/* Список изображений с сортировкой */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map(img => img.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  onRemove={() => removeImage(image.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {images.length === 0 && (
        <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
          Изображения не добавлены
        </div>
      )}
    </div>
  )
}