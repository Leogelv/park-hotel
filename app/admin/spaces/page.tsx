'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Home, Users, Image as ImageIcon, Check, X, DollarSign, Settings } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useFileUrl } from '@/hooks/useConvex'
import { typography, spacing, forms } from '@/hooks/useDesignTokens'
import { CategoryManagementModal } from '@/components/CategoryManagementModal'

// Компонент для превью изображения
function SpaceImagePreview({ storageId }: { storageId?: string }) {
  const imageUrl = useFileUrl(storageId || null)
  
  if (!imageUrl) {
    return (
      <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-neutral-400" />
      </div>
    )
  }
  
  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
      <Image
        src={imageUrl}
        alt="Space preview"
        fill
        className="object-cover"
      />
    </div>
  )
}

// Компонент для редактируемого поля
function EditableField({ 
  value, 
  onSave,
  type = 'text',
  prefix = '',
  suffix = '',
  className = ''
}: { 
  value: string | number
  onSave: (value: string | number) => void
  type?: 'text' | 'number'
  prefix?: string
  suffix?: string
  className?: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  
  const handleSave = () => {
    const finalValue = type === 'number' ? Number(editValue) : editValue
    onSave(finalValue)
    setIsEditing(false)
  }
  
  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
  
  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={`px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary ${className} ` + forms.input}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )
  }
  
  return (
    <div 
      className="cursor-pointer hover:bg-beige-50 px-2 py-1 rounded transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <span className="text-neutral-800">
        {prefix}{type === 'number' && value ? Number(value).toLocaleString('ru-RU') : value}{suffix}
      </span>
    </div>
  )
}

// Компонент для выбора типа номера
function EditableRoomType({ 
  value, 
  onSave 
}: { 
  value: string
  onSave: (value: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const spaceTypes = useQuery(api.spaceTypes.getAllSpaceTypes, { onlyActive: true })
  
  // Создаем маппинг для обратной совместимости
  const roomTypeLabels: Record<string, string> = spaceTypes?.reduce((acc, type) => {
    acc[type.slug] = type.display_name || type.name
    return acc
  }, {} as Record<string, string>) || {}
  
  const handleSave = () => {
    onSave(editValue)
    setIsEditing(false)
  }
  
  if (isEditing) {
    return (
      <select
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        className={"px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary text-sm " + forms.select}
        autoFocus
      >
        {spaceTypes?.map((type) => (
          <option key={type.slug} value={type.slug}>{type.display_name || type.name}</option>
        ))}
      </select>
    )
  }
  
  return (
    <div 
      className="cursor-pointer hover:bg-beige-50 px-2 py-1 rounded transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <span className={typography.body.base}>
        {roomTypeLabels[value] || value}
      </span>
    </div>
  )
}

export default function AdminSpacesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const spaces = useQuery(api.spaces.getAllSpaces, {})
  const spaceTypes = useQuery(api.spaceTypes.getAllSpaceTypes, { onlyActive: true })
  const updateSpace = useMutation(api.spaces.updateSpace)
  const deleteSpace = useMutation(api.spaces.deleteSpace)
  const [updatingField, setUpdatingField] = useState<string | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  
  // Фильтруем номера по выбранной категории
  const filteredSpaces = spaces?.filter(space => 
    !selectedCategory || space.room_type === selectedCategory
  )
  
  const handleUpdateField = async (spaceId: Id<"spaces">, field: string, value: any) => {
    setUpdatingField(`${spaceId}-${field}`)
    try {
      await updateSpace({
        id: spaceId,
        [field]: value
      })
    } catch (error) {
      console.error('Ошибка при обновлении поля:', error)
    } finally {
      setUpdatingField(null)
    }
  }
  
  const handleToggleAvailable = async (spaceId: Id<"spaces">, isAvailable: boolean) => {
    try {
      await updateSpace({
        id: spaceId,
        is_available: !isAvailable
      })
    } catch (error) {
      console.error('Ошибка при обновлении статуса номера:', error)
    }
  }
  
  const handleDeleteSpace = async (spaceId: Id<"spaces">) => {
    if (!confirm('Вы уверены, что хотите удалить этот номер?')) return
    
    try {
      await deleteSpace({ id: spaceId })
    } catch (error) {
      console.error('Ошибка при удалении номера:', error)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-white">
      <div className={spacing.container.default + " py-8"}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-neutral-600 hover:text-primary transition-colors">
              ← Назад в админку
            </Link>
            <h1 className={typography.heading.page}>Управление номерами</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-white text-primary border-2 border-primary rounded-xl py-3 px-6 font-medium hover:bg-primary hover:text-white transition-colors flex items-center gap-2 shadow-soft hover:shadow-medium"
            >
              <Settings className="w-5 h-5" />
              Управление категориями
            </button>
            <Link
              href="/admin/spaces/new"
              className="bg-primary text-white rounded-xl py-3 px-6 font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-soft hover:shadow-medium"
            >
              <Plus className="w-5 h-5" />
              Добавить номер
            </Link>
          </div>
        </div>
        
        {/* Фильтр по категориям */}
        {spaceTypes && spaceTypes.length > 0 && (
          <div className="mb-6">
            <p className={typography.body.small + " mb-3"}>Фильтр по категориям:</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === undefined
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary hover:text-primary'
                }`}
              >
                Все номера{spaces && ` (${spaces.length})`}
              </button>
              {spaceTypes.map((type) => (
                <button
                  key={type._id}
                  onClick={() => setSelectedCategory(type.slug)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === type.slug
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {type.display_name || type.name}
                  {spaces && ` (${spaces.filter(s => s.room_type === type.slug).length})`}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {spaces === undefined ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className={typography.body.large}>Загрузка номеров...</div>
            </div>
          </div>
        ) : !filteredSpaces || filteredSpaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-pastel-peach/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-12 h-12 text-primary" />
            </div>
            <p className={typography.body.large + " mb-4"}>
              {selectedCategory ? 'Нет номеров в этой категории' : 'Номера пока не добавлены'}
            </p>
            <Link 
              href="/admin/spaces/new" 
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Создать первый номер
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-beige-50 to-beige-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Фото
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Тип
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Параметры
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Цены
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-secondary uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredSpaces!.map((space) => (
                    <tr key={space._id} className="hover:bg-beige-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/admin/spaces/${space._id}`} className="block">
                          <SpaceImagePreview storageId={space.images?.[0]} />
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-neutral-800 font-semibold">
                            <EditableField
                              value={space.name}
                              onSave={(value) => handleUpdateField(space._id, 'name', value)}
                            />
                          </div>
                          {space.images && space.images.length > 0 && (
                            <div className="text-sm text-neutral-600 mt-1">
                              {space.images.length} фото
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EditableRoomType
                          value={space.room_type}
                          onSave={(value) => handleUpdateField(space._id, 'room_type', value)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary flex-shrink-0" />
                            <EditableField
                              value={space.capacity}
                              onSave={(value) => handleUpdateField(space._id, 'capacity', value)}
                              type="number"
                              suffix=" чел."
                              className="w-16"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-primary flex-shrink-0" />
                            <EditableField
                              value={space.area_sqm}
                              onSave={(value) => handleUpdateField(space._id, 'area_sqm', value)}
                              type="number"
                              suffix=" м²"
                              className="w-20"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                            <EditableField
                              value={space.price_per_night || 0}
                              onSave={(value) => handleUpdateField(space._id, 'price_per_night', value)}
                              type="number"
                              suffix=" ₽/ночь"
                              className="w-24"
                            />
                          </div>
                          {space.discount_percent && space.discount_percent > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-green-600">Скидка:</span>
                              <EditableField
                                value={space.discount_percent}
                                onSave={(value) => handleUpdateField(space._id, 'discount_percent', value)}
                                type="number"
                                suffix="%"
                                className="w-20"
                              />
                            </div>
                          )}
                          {space.hourly_rate && space.hourly_rate > 0 && (
                            <div className="flex items-center gap-1">
                              <span className={typography.body.caption}>Час:</span>
                              <EditableField
                                value={space.hourly_rate}
                                onSave={(value) => handleUpdateField(space._id, 'hourly_rate', value)}
                                type="number"
                                suffix=" ₽"
                                className="w-20"
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAvailable(space._id, space.is_available)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                            space.is_available
                              ? 'bg-pastel-mint text-neutral-700 hover:bg-pastel-mint/80'
                              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                          }`}
                        >
                          {space.is_available ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Доступен
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Недоступен
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/admin/spaces/${space._id}`}
                            className="text-primary hover:text-primary-dark transition-colors p-2 hover:bg-beige-100 rounded-lg"
                            title="Редактировать детально"
                          >
                            <Edit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteSpace(space._id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Удалить"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Легенда */}
            <div className="px-6 py-3 bg-beige-50 border-t border-beige-100">
              <p className="text-sm text-neutral-600">
                💡 Совет: Кликните на любое поле чтобы отредактировать его мгновенно
              </p>
            </div>
          </div>
        )}
      </div>
      
      <CategoryManagementModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  )
}