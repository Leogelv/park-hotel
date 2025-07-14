'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Home } from 'lucide-react'
import { typography } from '@/hooks/useDesignTokens'

interface Category {
  value: string | undefined
  label: string
  count?: number
}

interface MobileCategorySelectorProps {
  categories: Category[]
  selectedCategory: string | undefined
  onCategoryChange: (category: string | undefined) => void
}

export default function MobileCategorySelector({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: MobileCategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Находим выбранную категорию для отображения
  const selectedCategoryData = categories.find(cat => cat.value === selectedCategory) || categories[0]

  // Закрытие дропдауна при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCategorySelect = (categoryValue: string | undefined) => {
    onCategoryChange(categoryValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Кнопка селектора */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-soft border border-neutral-200 hover:border-primary transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <div className={typography.body.base + " font-medium text-neutral-800"}>
              {selectedCategoryData.label}
            </div>
            {selectedCategoryData.count !== undefined && (
              <div className={typography.body.small + " text-neutral-500"}>
                {selectedCategoryData.count} номеров
              </div>
            )}
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Выпадающий список */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-large border border-neutral-100 z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {categories.map((category, index) => (
              <button
                key={category.value || 'all'}
                onClick={() => handleCategorySelect(category.value)}
                className={`w-full px-4 py-3 text-left hover:bg-beige-50 transition-all duration-200 border-b border-neutral-50 last:border-b-0 ${
                  selectedCategory === category.value ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      selectedCategory === category.value 
                        ? 'bg-primary text-white' 
                        : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      <Home className="w-3 h-3" />
                    </div>
                    <span className={typography.body.base + " font-medium text-neutral-800"}>
                      {category.label}
                    </span>
                  </div>
                  {category.count !== undefined && (
                    <span className={typography.body.small + " text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full"}>
                      {category.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}