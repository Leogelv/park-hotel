'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import activityImageUrls from '@/add-activity-images'
import { typography, spacing } from '@/hooks/useDesignTokens'

export default function UpdateActivityImagesPage() {
  const [updating, setUpdating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const updateActivitiesImages = useMutation(api.activities.updateActivitiesImages)

  const handleUpdate = async () => {
    setUpdating(true)
    setResult(null)
    
    try {
      const updates = Object.entries(activityImageUrls).map(([name, image_url]) => ({
        name,
        image_url
      }))
      
      const result = await updateActivitiesImages({ updates })
      setResult(`Успешно обновлено ${result.updated} активностей!`)
    } catch (error) {
      setResult(`Ошибка: ${error}`)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-white">
      <div className={spacing.container.default + " py-8"}>
        <div className="bg-white rounded-2xl shadow-soft p-8 max-w-2xl mx-auto">
          <h1 className={typography.heading.section + " mb-8"}>
            Обновление изображений активностей
          </h1>
          
          <p className={typography.body.base + " mb-6"}>
            Нажмите кнопку ниже, чтобы добавить изображения к активностям в базе данных.
          </p>
          
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="btn-primary"
          >
            {updating ? 'Обновление...' : 'Обновить изображения'}
          </button>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.includes('Успешно') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p className={typography.body.base}>{result}</p>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className={typography.heading.subsection + " mb-4"}>
              Будут добавлены изображения для:
            </h3>
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {Object.entries(activityImageUrls).map(([name, url]) => (
                <div key={name} className="flex items-center gap-4 p-3 bg-beige-50 rounded-lg">
                  <img 
                    src={url} 
                    alt={name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <span className={typography.body.small}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}