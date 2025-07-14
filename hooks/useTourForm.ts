import React, { useEffect } from 'react';
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { tourFormSchema, TourFormData, defaultTourFormValues } from '@/lib/tour-form-schema';

interface UseTourFormProps {
  tourId?: string;
  initialData?: any; // Данные из Convex
}

export function useTourForm({ tourId, initialData }: UseTourFormProps) {
  // Инициализируем форму с валидацией
  const methods = useForm<TourFormData>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: defaultTourFormValues,
    mode: 'onBlur', // Валидация при потере фокуса
  });

  // Мутации
  const updateTourDraft = useMutation(api.tours.updateTourDraft);
  const updateTour = useMutation(api.tours.updateTour);
  const createTour = useMutation(api.tours.createTour);

  // Загружаем данные в форму при изменении initialData
  useEffect(() => {
    if (initialData) {
      // Преобразуем данные из Convex в формат формы
      const formData: Partial<TourFormData> = {
        title: initialData.title || '',
        description: initialData.description || '',
        region: initialData.region || '',
        price: initialData.price || 0,
        discount_percent: initialData.discount_percent || 0,
        duration_days: initialData.duration_days || 1,
        max_participants: initialData.max_participants || 10,
        difficulty_level: initialData.difficulty_level || 'средний',
        is_active: initialData.is_active !== false,
        main_image: initialData.main_image || undefined,
        included_services: initialData.included_services || [],
        days: initialData.days || [],
      };

      // Сбрасываем форму с новыми данными
      methods.reset(formData);
    }
  }, [initialData, methods]);

  // Автосохранение при потере фокуса
  const saveFieldOnBlur = async (fieldName: keyof TourFormData, value: any) => {
    if (!tourId) return;

    try {
      // Проверяем валидность поля
      const isValid = await methods.trigger(fieldName);
      if (!isValid) return;

      // Сохраняем только измененные поля
      const currentValue = methods.getValues(fieldName);
      if (JSON.stringify(currentValue) === JSON.stringify(value)) return;

      await updateTourDraft({
        id: tourId as Id<"tours">,
        updates: { [fieldName]: value }
      });

      console.log('✅ Автосохранение поля:', fieldName);
    } catch (error) {
      console.error('Ошибка автосохранения:', error);
    }
  };

  // Сохранение всей формы
  const saveForm = async (data: TourFormData) => {
    try {
      if (tourId) {
        // Подготавливаем данные для updateTour
        const updateData = {
          id: tourId as Id<"tours">,
          title: data.title,
          description: data.description,
          region: data.region,
          price: data.price,
          discount_percent: data.discount_percent,
          duration_days: data.duration_days,
          max_participants: data.max_participants,
          difficulty_level: data.difficulty_level,
          is_active: data.is_active,
          main_image: data.main_image,
          included_services: data.included_services,
          days: data.days.map(day => ({
            _id: day._id ? day._id as Id<"tour_days"> : undefined,
            day_number: day.day_number,
            accommodation: day.accommodation,
            auto_distance_km: day.auto_distance_km,
            walk_distance_km: day.walk_distance_km,
            activities: day.activities.map(activity => ({
              _id: activity._id ? activity._id as Id<"activities"> : undefined,
              name: activity.name,
              description: activity.description,
              type: activity.type,
              time_start: activity.time_start,
              time_end: activity.time_end,
              price: activity.price,
              order_number: activity.order_number,
              is_included: activity.is_included,
              image: activity.image,
            }))
          }))
        }
        
        await updateTour(updateData);
      } else {
        // Создаем новый тур
        const newTourId = await createTour(data);
        return newTourId;
      }
    } catch (error) {
      console.error('Ошибка сохранения тура:', error);
      throw error;
    }
  };

  // Получение состояния формы
  const {
    formState: { errors, isSubmitting, isDirty },
    watch,
    setValue,
    getValues,
    trigger,
  } = methods;

  return {
    methods,
    errors,
    isSubmitting,
    isDirty,
    watch,
    setValue,
    getValues,
    trigger,
    saveFieldOnBlur,
    saveForm,
    // Утилиты для работы с днями и активностями
    addDay: () => {
      const currentDays = getValues('days');
      const newDayNumber = currentDays.length + 1;
      setValue('days', [
        ...currentDays,
        {
          day_number: newDayNumber,
          activities: [{
            name: '',
            description: '',
            type: 'экскурсия' as const,
            order_number: 1,
            is_included: true,
          }],
        },
      ]);
    },
    removeDay: (index: number) => {
      const currentDays = getValues('days');
      const filteredDays = currentDays.filter((_, i) => i !== index);
      // Перенумеровываем дни
      const renumberedDays = filteredDays.map((day, i) => ({
        ...day,
        day_number: i + 1,
      }));
      setValue('days', renumberedDays);
    },
  };
}

