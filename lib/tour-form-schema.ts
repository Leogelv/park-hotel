import { z } from 'zod';

// Схема для активности
export const activitySchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Название активности обязательно'),
  description: z.string().min(1, 'Описание активности обязательно'),
  type: z.enum(['экскурсия', 'трансфер', 'питание', 'отдых', 'вечернее мероприятие'], {
    message: 'Выберите тип активности'
  }),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
  price: z.number().min(0, 'Цена не может быть отрицательной').optional(),
  order_number: z.number().min(1, 'Порядковый номер должен быть больше 0'),
  is_included: z.boolean(),
  image: z.string().optional(),
});

// Схема для дня тура
export const tourDaySchema = z.object({
  _id: z.string().optional(),
  day_number: z.number().min(1, 'Номер дня должен быть больше 0'),
  accommodation: z.string().optional(),
  auto_distance_km: z.number().min(0, 'Расстояние не может быть отрицательным').optional(),
  walk_distance_km: z.number().min(0, 'Расстояние не может быть отрицательным').optional(),
  activities: z.array(activitySchema),
});

// Основная схема формы тура
export const tourFormSchema = z.object({
  // Основная информация
  title: z.string().min(1, 'Название тура обязательно').max(200, 'Название слишком длинное'),
  description: z.string().min(10, 'Описание должно быть не менее 10 символов').max(2000, 'Описание слишком длинное'),
  region: z.string().min(1, 'Регион обязателен').max(100, 'Название региона слишком длинное'),
  
  // Цена и скидки
  price: z.number().min(0, 'Цена не может быть отрицательной').max(1000000, 'Цена слишком большая'),
  discount_percent: z.number().min(0, 'Скидка не может быть отрицательной').max(100, 'Скидка не может быть больше 100%'),
  
  // Параметры тура
  duration_days: z.number().min(1, 'Продолжительность должна быть не менее 1 дня').max(30, 'Продолжительность не может быть больше 30 дней'),
  max_participants: z.number().min(1, 'Количество участников должно быть не менее 1').max(100, 'Слишком много участников'),
  difficulty_level: z.enum(['легкий', 'средний', 'сложный'], {
    message: 'Выберите уровень сложности'
  }),
  
  // Дополнительные поля
  is_active: z.boolean(),
  main_image: z.string().optional(),
  
  // Услуги
  included_services: z.array(z.string().min(1, 'Название услуги не может быть пустым')),
  
  // Дни тура
  days: z.array(tourDaySchema),
});

// Типы для TypeScript
export type TourFormData = z.infer<typeof tourFormSchema>;
export type TourDayData = z.infer<typeof tourDaySchema>;
export type ActivityData = z.infer<typeof activitySchema>;

// Значения по умолчанию
export const defaultTourFormValues: Partial<TourFormData> = {
  title: '',
  description: '',
  region: '',
  price: 0,
  discount_percent: 0,
  duration_days: 1,
  max_participants: 10,
  difficulty_level: 'средний',
  is_active: true,
  included_services: [],
  days: [],
};

// Утилиты для работы с формой
export const createDefaultActivity = (order_number: number): ActivityData => ({
  name: '',
  description: '',
  type: 'экскурсия',
  order_number,
  is_included: true,
});

export const createDefaultDay = (day_number: number): TourDayData => ({
  day_number,
  activities: [createDefaultActivity(1)],
});