'use client'

import { useState } from 'react'
import { X, Calendar, Users, Clock } from 'lucide-react'
import { useTourAvailability } from '@/hooks/useConvex'

interface TourAvailabilityModalProps {
  tour: any
  onClose: () => void
}

export default function TourAvailabilityModal({ tour, onClose }: TourAvailabilityModalProps) {
  const availability = useTourAvailability(tour._id)
  const [selectedDate, setSelectedDate] = useState<any>(null)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateShort = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (availability === undefined) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">Загрузка дат...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-secondary">
            Даты заездов: {tour.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {!availability || availability.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Пока нет доступных дат для этого тура
            </div>
          ) : (
            <div className="space-y-4">
              {availability.map((dateInfo) => (
                <div
                  key={dateInfo._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDate?._id === dateInfo._id
                      ? 'border-primary bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    !dateInfo.is_available
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={() => {
                    if (dateInfo.is_available) {
                      setSelectedDate(dateInfo)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Дата заезда */}
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="font-semibold">
                          {formatDateShort(dateInfo.start_date)}
                        </span>
                        <span className="text-gray-500">—</span>
                        <span className="font-semibold">
                          {formatDateShort(dateInfo.end_date)}
                        </span>
                      </div>

                      {/* Полная дата */}
                      <div className="text-sm text-gray-600 mb-2">
                        Заезд: {formatDate(dateInfo.start_date)}
                      </div>

                      {/* Места */}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">
                          Свободных мест: {dateInfo.available_spots} из {dateInfo.total_capacity}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {/* Цена */}
                      <div className="text-lg font-bold text-primary mb-1">
                        {dateInfo.price.toLocaleString('ru-RU')} ₽
                      </div>
                      
                      {/* Статус */}
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        dateInfo.is_available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {dateInfo.is_available ? 'Доступно' : 'Нет мест'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Выбранная дата - детали */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-orange-50 border border-primary rounded-lg">
              <h3 className="font-bold text-lg mb-3">Детали бронирования</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Тур:</span>
                  <div className="font-semibold">{tour.title}</div>
                </div>
                
                <div>
                  <span className="text-gray-600">Длительность:</span>
                  <div className="font-semibold">{tour.duration_days} дней</div>
                </div>
                
                <div>
                  <span className="text-gray-600">Дата заезда:</span>
                  <div className="font-semibold">{formatDateShort(selectedDate.start_date)}</div>
                </div>
                
                <div>
                  <span className="text-gray-600">Дата выезда:</span>
                  <div className="font-semibold">{formatDateShort(selectedDate.end_date)}</div>
                </div>
                
                <div>
                  <span className="text-gray-600">Свободные места:</span>
                  <div className="font-semibold">{selectedDate.available_spots}</div>
                </div>
                
                <div>
                  <span className="text-gray-600">Цена за человека:</span>
                  <div className="font-semibold text-primary">{selectedDate.price.toLocaleString('ru-RU')} ₽</div>
                </div>
              </div>

              <button className="w-full mt-4 bg-primary text-white rounded-lg py-3 px-4 font-medium hover:bg-orange-600 transition-colors">
                Забронировать
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}