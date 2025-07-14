'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Plus, Trash2, Upload, Loader2, Image as ImageIcon, GripVertical, Users, Home, Bed } from 'lucide-react'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useFileUrl } from '@/hooks/useConvex'
import { typography, spacing, forms } from '@/hooks/useDesignTokens'
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

interface SpaceFormProps {
  spaceId?: string
}

interface SpaceImage {
  id: string
  storageId?: string
  file?: File
  order: number
}

// Компонент для сортируемого изображения
function SortableImage({ image, onRemove }: { image: SpaceImage; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }
  
  const imageUrl = useFileUrl(image.storageId || null)
  const previewUrl = image.file ? URL.createObjectURL(image.file) : imageUrl
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-xl shadow-soft overflow-hidden ${isDragging ? 'z-50' : ''}`}
    >
      <div className="aspect-[4/3] relative">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Space image"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-neutral-300" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-medium"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div
            {...attributes}
            {...listeners}
            className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 cursor-move"
          >
            <GripVertical className="w-5 h-5 text-neutral-700" />
          </div>
        </div>
      </div>
      
      <div className="p-2 text-center">
        <span className={typography.body.small}>Изображение {image.order + 1}</span>
      </div>
    </div>
  )
}

// Удалено статическое определение roomTypes - теперь используем из БД

const amenitiesList = [
  'Wi-Fi',
  'Кондиционер',
  'Холодильник',
  'Телевизор',
  'Чайник',
  'Фен',
  'Сейф',
  'Мини-бар',
  'Балкон',
  'Вид на горы',
  'Джакузи',
  'Камин',
  'Терраса',
  'Кухня',
  'Посудомоечная машина',
  'Стиральная машина',
  'Гостиная зона',
  'Обеденная зона'
]

export default function SpaceFormConvex({ spaceId }: SpaceFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Загружаем категории из БД
  const spaceTypes = useQuery(api.spaceTypes.getAllSpaceTypes, { onlyActive: true })
  
  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 2,
    area_sqm: 25,
    floor: 1,
    amenities: [] as string[],
    room_type: '',
    room_type_id: undefined as Id<"space_types"> | undefined,
    price_per_night: 0,
    discount_percent: 0,
    hourly_rate: 0,
    is_available: true
  })
  
  const [images, setImages] = useState<SpaceImage[]>([])
  const [nextImageId, setNextImageId] = useState(1)
  
  // Настройка сенсоров для drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  
  // Загрузка данных спейса
  const space = useQuery(api.spaces.getSpaceById, 
    spaceId ? { id: spaceId as Id<"spaces"> } : "skip"
  )
  
  // Мутации
  const createSpace = useMutation(api.spaces.createSpace)
  const updateSpace = useMutation(api.spaces.updateSpace)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  
  // Загрузка данных при редактировании
  useEffect(() => {
    if (space) {
      setFormData({
        name: space.name,
        description: space.description,
        capacity: space.capacity,
        area_sqm: space.area_sqm,
        floor: space.floor || 1,
        amenities: space.amenities || [],
        room_type: space.room_type,
        room_type_id: space.room_type_id,
        price_per_night: space.price_per_night || 0,
        discount_percent: space.discount_percent || 0,
        hourly_rate: space.hourly_rate || 0,
        is_available: space.is_available
      })
      
      // Загружаем существующие изображения
      if (space.images && space.images.length > 0) {
        const existingImages = space.images.map((storageId, index) => ({
          id: `existing-${index}`,
          storageId,
          order: index
        }))
        setImages(existingImages)
        setNextImageId(existingImages.length + 1)
      }
    }
  }, [space])
  
  // Обработка выбора файлов
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    const newImages = files.map((file, index) => ({
      id: `new-${nextImageId + index}`,
      file,
      order: images.length + index
    }))
    
    setImages([...images, ...newImages])
    setNextImageId(nextImageId + files.length)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Обработка drag-and-drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        // Обновляем порядок
        return newItems.map((item, index) => ({
          ...item,
          order: index
        }))
      })
    }
  }
  
  // Удаление изображения
  const removeImage = (imageId: string) => {
    setImages(images.filter(img => img.id !== imageId).map((img, index) => ({
      ...img,
      order: index
    })))
  }
  
  // Загрузка изображения
  const uploadImage = async (file: File): Promise<string> => {
    const uploadUrl = await generateUploadUrl()
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: file
    })
    const { storageId } = await response.json()
    return storageId
  }
  
  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Проверка выбора типа номера
    if (!formData.room_type_id) {
      alert('Пожалуйста, выберите тип номера')
      return
    }
    
    setLoading(true)
    
    try {
      // Загружаем новые изображения
      const uploadedImages: string[] = []
      
      for (const image of images) {
        if (image.file) {
          const storageId = await uploadImage(image.file)
          uploadedImages.push(storageId)
        } else if (image.storageId) {
          uploadedImages.push(image.storageId)
        }
      }
      
      const spaceData = {
        ...formData,
        images: uploadedImages
      }
      
      if (spaceId) {
        await updateSpace({
          id: spaceId as Id<"spaces">,
          ...spaceData
        })
      } else {
        await createSpace(spaceData)
      }
      
      router.push('/admin/spaces')
    } catch (error) {
      console.error('Ошибка при сохранении спейса:', error)
      alert('Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }
  
  // Переключение удобств
  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      })
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      })
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8">
        <h2 className={typography.heading.section + " mb-8"}>
          {spaceId ? 'Редактировать номер' : 'Добавить номер'}
        </h2>
        
        {/* Основная информация */}
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={typography.body.small + " block font-medium mb-2"}>
                Название номера
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                required
              />
            </div>
            
            <div>
              <label className={typography.body.small + " block font-medium mb-2"}>
                Тип номера
              </label>
              <select
                value={formData.room_type_id || ''}
                onChange={(e) => {
                  const selectedType = spaceTypes?.find(t => t._id === e.target.value)
                  if (selectedType) {
                    setFormData({ 
                      ...formData, 
                      room_type_id: selectedType._id,
                      room_type: selectedType.slug 
                    })
                  }
                }}
                className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.select}
                disabled={!spaceTypes || spaceTypes.length === 0}
              >
                <option value="">Выберите тип номера</option>
                {spaceTypes?.map(type => (
                  <option key={type._id} value={type._id}>
                    {type.display_name || type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className={typography.body.small + " block font-medium mb-2"}>
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.textarea}
              rows={4}
              required
            />
          </div>
          
          {/* Параметры номера */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={typography.body.small + " block font-medium mb-2"}>
                <Users className="w-4 h-4 inline mr-1" />
                Вместимость
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                min="1"
                required
              />
            </div>
            
            <div>
              <label className={typography.body.small + " block font-medium mb-2"}>
                <Home className="w-4 h-4 inline mr-1" />
                Площадь (м²)
              </label>
              <input
                type="number"
                value={formData.area_sqm}
                onChange={(e) => setFormData({ ...formData, area_sqm: Number(e.target.value) })}
                className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                step="0.1"
                required
              />
            </div>
            
            <div>
              <label className={typography.body.small + " block font-medium mb-2"}>
                Этаж
              </label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                min="0"
              />
            </div>
            
            <div>
              <label className={typography.body.small + " block font-medium mb-2"}>
                Статус
              </label>
              <select
                value={formData.is_available ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'true' })}
                className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.select}
              >
                <option value="true">Доступен</option>
                <option value="false">Недоступен</option>
              </select>
            </div>
          </div>
          
          {/* Цены */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={typography.body.small + " block font-medium mb-2"}>
                Цена за ночь (₽)
              </label>
              <input
                type="number"
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                min="0"
              />
              {formData.discount_percent > 0 && (
                <div className="mt-2 text-sm text-neutral-600">
                  Старая цена: {Math.round(formData.price_per_night / (1 - formData.discount_percent / 100)).toLocaleString('ru-RU')} ₽
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
                onChange={(e) => setFormData({ ...formData, discount_percent: Number(e.target.value) })}
                className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                min="0"
                max="100"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className={typography.body.small + " block font-medium mb-2"}>
                Почасовая оплата (₽)
              </label>
              <input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                className={"w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent " + forms.input}
                min="0"
              />
            </div>
          </div>
          
          {/* Удобства */}
          <div>
            <label className={typography.body.small + " block font-medium mb-4"}>
              Удобства
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenitiesList.map(amenity => (
                <label
                  key={amenity}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all
                    ${formData.amenities.includes(amenity)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="sr-only"
                  />
                  <span className={typography.body.small}>{amenity}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Изображения */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className={typography.body.small + " block font-medium"}>
                Фотографии номера
              </label>
              <span className={typography.body.caption}>
                Перетащите для изменения порядка
              </span>
            </div>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <SortableContext
                  items={images.map(img => img.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {images.map((image) => (
                    <SortableImage
                      key={image.id}
                      image={image}
                      onRemove={() => removeImage(image.id)}
                    />
                  ))}
                </SortableContext>
                
                {/* Кнопка добавления */}
                <div className="aspect-[4/3] relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-full bg-beige-50 border-2 border-dashed border-beige-200 rounded-xl hover:bg-beige-100 hover:border-primary transition-all flex flex-col items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className={typography.body.small}>Загрузка...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-primary" />
                        <span className={typography.body.small}>Добавить фото</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </DndContext>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/spaces')}
            className="px-6 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <X className="w-5 h-5 inline-block mr-2" />
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
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
    </form>
  )
}