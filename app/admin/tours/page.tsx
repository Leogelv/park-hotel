'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, MapPin, Users, DollarSign, Mountain } from 'lucide-react'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { typography, spacing, forms } from '@/hooks/useDesignTokens'

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

// Компонент для выбора уровня сложности
function EditableDifficulty({ 
  value, 
  onSave 
}: { 
  value: string
  onSave: (value: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  
  const difficulties = ['Легкий', 'Средний', 'Сложный']
  const difficultyColors = {
    'Легкий': 'bg-pastel-mint text-neutral-700',
    'Средний': 'bg-pastel-peach text-neutral-700',
    'Сложный': 'bg-pastel-rose text-neutral-700',
  }
  
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
        {difficulties.map(diff => (
          <option key={diff} value={diff}>{diff}</option>
        ))}
      </select>
    )
  }
  
  return (
    <div 
      className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-colors ${difficultyColors[value as keyof typeof difficultyColors] || 'bg-neutral-200'}`}
      onClick={() => setIsEditing(true)}
    >
      {value}
    </div>
  )
}

export default function AdminToursPage() {
  const tours = useQuery(api.tours.getAllTours, {})
  const updateTour = useMutation(api.tours.updateTour)
  const deleteTour = useMutation(api.tours.deleteTour)
  const [updatingField, setUpdatingField] = useState<string | null>(null)
  
  const handleUpdateField = async (tourId: Id<"tours">, field: string, value: any) => {
    setUpdatingField(`${tourId}-${field}`)
    try {
      await updateTour({
        id: tourId,
        [field]: value
      })
    } catch (error) {
      console.error('Ошибка при обновлении поля:', error)
    } finally {
      setUpdatingField(null)
    }
  }
  
  const handleToggleActive = async (tourId: Id<"tours">, isActive: boolean) => {
    try {
      await updateTour({
        id: tourId,
        is_active: !isActive
      })
    } catch (error) {
      console.error('Ошибка при обновлении статуса тура:', error)
    }
  }
  
  const handleDeleteTour = async (tourId: Id<"tours">) => {
    if (!confirm('Вы уверены, что хотите удалить этот тур?')) return
    
    try {
      await deleteTour({ id: tourId })
    } catch (error) {
      console.error('Ошибка при удалении тура:', error)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-white">
      <div className={spacing.container.default + " py-8"}>
        <div className="flex justify-between items-center mb-8">
          <h1 className={typography.heading.page}>Управление турами</h1>
          <Link
            href="/admin/tours/new"
            className="bg-primary text-white rounded-xl py-3 px-6 font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-soft hover:shadow-medium"
          >
            <Plus className="w-5 h-5" />
            Добавить тур
          </Link>
        </div>
        
        {tours === undefined ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className={typography.body.large}>Загрузка туров...</div>
            </div>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-pastel-peach/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-primary" />
            </div>
            <p className={typography.body.large + " mb-4"}>Туры пока не добавлены</p>
            <Link 
              href="/admin/tours/new" 
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Создать первый тур
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-beige-50 to-beige-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Регион
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Параметры
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Цены
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary uppercase tracking-wider">
                      Сложность
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
                  {tours.map((tour) => (
                    <tr key={tour._id} className="hover:bg-beige-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-neutral-800 font-semibold">
                          <EditableField
                            value={tour.title}
                            onSave={(value) => handleUpdateField(tour._id, 'title', value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                          <EditableField
                            value={tour.region}
                            onSave={(value) => handleUpdateField(tour._id, 'region', value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                            <EditableField
                              value={tour.duration_days}
                              onSave={(value) => handleUpdateField(tour._id, 'duration_days', value)}
                              type="number"
                              suffix=" дней"
                              className="w-16"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary flex-shrink-0" />
                            <EditableField
                              value={tour.max_participants}
                              onSave={(value) => handleUpdateField(tour._id, 'max_participants', value)}
                              type="number"
                              suffix=" чел."
                              className="w-16"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                            <EditableField
                              value={tour.price}
                              onSave={(value) => handleUpdateField(tour._id, 'price', value)}
                              type="number"
                              suffix=" ₽"
                              className="w-24"
                            />
                          </div>
                          {tour.discount_percent && tour.discount_percent > 0 && (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-neutral-500">Было:</span>
                                <span className="text-xs text-neutral-500 line-through">
                                  {Math.round(tour.price / (1 - tour.discount_percent / 100)).toLocaleString('ru-RU')} ₽
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-green-600 font-medium">
                                  Скидка:
                                </span>
                                <EditableField
                                  value={tour.discount_percent}
                                  onSave={(value) => handleUpdateField(tour._id, 'discount_percent', value)}
                                  type="number"
                                  suffix="%"
                                  className="w-16 text-green-600 font-medium"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EditableDifficulty
                          value={tour.difficulty_level}
                          onSave={(value) => handleUpdateField(tour._id, 'difficulty_level', value)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(tour._id, tour.is_active)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                            tour.is_active
                              ? 'bg-pastel-mint text-neutral-700 hover:bg-pastel-mint/80'
                              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                          }`}
                        >
                          {tour.is_active ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Активен
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Неактивен
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/admin/tours/${tour._id}`}
                            className="text-primary hover:text-primary-dark transition-colors p-2 hover:bg-beige-100 rounded-lg"
                            title="Редактировать детально"
                          >
                            <Edit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteTour(tour._id)}
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
    </div>
  )
}