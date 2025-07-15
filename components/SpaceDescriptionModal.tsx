'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { typography } from '@/hooks/useDesignTokens'

interface SpaceDescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
}

export default function SpaceDescriptionModal({ isOpen, onClose, title, description }: SpaceDescriptionModalProps) {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Блокируем скролл body
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <>
      {/* Оверлей */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Модальное окно */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-soft max-w-2xl w-full max-h-[80vh] flex flex-col pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <h3 className={typography.heading.section}>{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
          
          {/* Контент с прокруткой */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className={typography.body.large + " text-neutral-700 whitespace-pre-wrap leading-relaxed"}>
              {description}
            </div>
          </div>
          
          {/* Нижняя панель */}
          <div className="p-6 border-t border-neutral-100">
            <button
              onClick={onClose}
              className="w-full btn-primary"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </>
  )
}