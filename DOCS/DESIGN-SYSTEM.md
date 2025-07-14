# 🎨 Дизайн-система Park Hotel

*Последнее обновление: 14 июля 2025*

## 🌈 Обзор

Дизайн-система Park Hotel построена на основе дизайн-токенов, обеспечивающих консистентность визуального языка через весь проект. Система оптимизирована для светлой темы горного отеля с теплыми природными оттенками.

## 🎯 Философия дизайна

1. **Природность** - цвета и формы вдохновлены горными пейзажами
2. **Доступность** - высокий контраст для читаемости
3. **Отзывчивость** - адаптивность для всех устройств
4. **Консистентность** - единые токены через весь проект

## 🎨 Цветовая палитра

### Основные цвета
```css
/* Главные акценты */
--primary: #fc7514;        /* Оранжевый закат */
--primary-dark: #e56610;   /* Темный оранжевый */
--secondary: #c56f33;      /* Коричневый */

/* Нейтральные */
--neutral-50: #fafafa;     /* Почти белый */
--neutral-100: #f5f5f5;    /* Светло-серый */
--neutral-200: #e5e5e5;    
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;    /* Основной текст */
--neutral-900: #171717;    /* Почти черный */

/* Бежевые тона */
--beige-50: #faf5ee;       /* Очень светлый беж */
--beige-100: #f5e6d3;      /* Светлый беж */
--beige-200: #e6ccab;
--beige-300: #d4b896;

/* Пастельные акценты */
--pastel-peach: #ffd4a3;   /* Персиковый */
--pastel-lavender: #e6d7ff; /* Лавандовый */
--pastel-mint: #b8e7d0;    /* Мятный */
```

### Семантические цвета
```css
/* Статусы */
--success: #16a34a;        /* Зеленый */
--error: #dc2626;          /* Красный */
--warning: #f59e0b;        /* Желтый */
--info: #3b82f6;           /* Синий */
```

## 📐 Типографика

### Шрифты
```css
/* Заголовки */
font-family: 'Playfair Display', serif;

/* Основной текст */
font-family: 'Inter', sans-serif;
```

### Размеры и стили

#### Заголовки (Playfair Display)
```typescript
heading: {
  hero: "text-4xl sm:text-5xl lg:text-6xl font-bold",      // H1 главный
  page: "text-3xl sm:text-4xl lg:text-5xl font-bold",      // H1 страницы
  section: "text-2xl sm:text-3xl lg:text-4xl font-semibold", // H2
  subsection: "text-xl sm:text-2xl font-semibold",         // H3
  card: "text-lg sm:text-xl font-semibold",                // H4
  small: "text-base sm:text-lg font-medium"                // H5
}
```

#### Основной текст (Inter)
```typescript
body: {
  large: "text-lg sm:text-xl leading-relaxed",   // Лид-абзацы
  base: "text-base",                              // Обычный текст
  small: "text-sm",                               // Мелкий текст
  caption: "text-xs"                              // Подписи
}
```

#### Специальные стили
```typescript
display: {
  price: "font-display font-bold text-primary",   // Цены
  oldPrice: "font-display text-neutral-500 line-through", // Старые цены
  discount: "font-medium text-green-600"          // Скидки
}
```

## 🧩 Компоненты

### Кнопки

#### Primary Button
```css
.btn-primary {
  @apply bg-primary text-white font-medium py-3 px-6 rounded-2xl 
  hover:bg-primary-dark transition-all duration-200 
  shadow-soft hover:shadow-medium transform hover:-translate-y-0.5;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply bg-secondary text-white font-medium py-3 px-6 rounded-2xl 
  hover:bg-secondary-dark transition-all duration-200 
  shadow-soft hover:shadow-medium transform hover:-translate-y-0.5;
}
```

#### Outline Button
```css
.btn-outline {
  @apply border-2 border-primary text-primary font-medium py-3 px-6 rounded-2xl 
  hover:bg-primary hover:text-white transition-all duration-200 
  transform hover:-translate-y-0.5;
}
```

### Карточки
```css
.card {
  @apply bg-white rounded-2xl shadow-soft p-6 
  transition-shadow duration-300 hover:shadow-medium;
}
```

### Формы

#### Input
```typescript
forms: {
  input: 'text-neutral-800 placeholder-neutral-400',
  label: 'text-sm text-neutral-800 block font-medium mb-2',
  textarea: 'text-neutral-800 placeholder-neutral-400',
  select: 'text-neutral-800'
}
```

#### Стили полей ввода
```css
/* Базовый input */
.form-input {
  @apply w-full px-4 py-3 border border-neutral-200 rounded-xl 
  focus:ring-2 focus:ring-primary focus:border-transparent 
  text-neutral-800 placeholder-neutral-400;
}

/* Textarea */
.form-textarea {
  @apply w-full px-4 py-3 border border-neutral-200 rounded-xl 
  focus:ring-2 focus:ring-primary focus:border-transparent 
  text-neutral-800 placeholder-neutral-400 resize-none;
}

/* Select */
.form-select {
  @apply w-full px-4 py-3 border border-neutral-200 rounded-xl 
  focus:ring-2 focus:ring-primary focus:border-transparent 
  text-neutral-800 bg-white;
}
```

## 📏 Spacing (Отступы)

### Секции
```typescript
spacing: {
  section: {
    desktop: "py-24",
    tablet: "py-20", 
    mobile: "py-16"
  }
}
```

### Контейнеры
```typescript
container: {
  default: "container mx-auto px-4 sm:px-6 lg:px-8",
  wide: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  narrow: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
}
```

## 🌓 Тени

```css
/* Мягкая тень */
.shadow-soft {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Средняя тень */
.shadow-medium {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Глубокая тень */
.shadow-hard {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

## 🎭 Анимации

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
```

### Slide Up
```css
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}
```

### Spin (для загрузки)
```css
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 🔄 Использование дизайн-токенов

### Импорт
```typescript
import { typography, spacing, forms } from '@/hooks/useDesignTokens'
```

### Применение в компонентах
```tsx
// Заголовок страницы
<h1 className={typography.heading.page}>
  Управление номерами
</h1>

// Контейнер
<div className={spacing.container.default}>
  {/* Контент */}
</div>

// Форма
<label className={forms.label}>
  Название номера
</label>
<input className={"w-full px-4 py-3 ... " + forms.input} />
```

## 📱 Адаптивность

### Breakpoints
```css
/* Tailwind defaults */
sm: 640px   /* Планшеты */
md: 768px   /* Небольшие ноутбуки */
lg: 1024px  /* Десктопы */
xl: 1280px  /* Большие экраны */
2xl: 1536px /* Очень большие экраны */
```

### Мобильный первый подход
```css
/* Мобильные стили по умолчанию */
.text-base {
  font-size: 16px;
}

/* Планшет и выше */
@media (min-width: 640px) {
  .sm\:text-lg {
    font-size: 18px;
  }
}

/* Десктоп */
@media (min-width: 1024px) {
  .lg\:text-xl {
    font-size: 20px;
  }
}
```

## 🎯 Best Practices

1. **Всегда используйте дизайн-токены**
   ```tsx
   // ✅ Хорошо
   <h2 className={typography.heading.section}>
   
   // ❌ Плохо
   <h2 className="text-2xl font-bold">
   ```

2. **Консистентные отступы**
   ```tsx
   // ✅ Хорошо
   <div className={spacing.container.default}>
   
   // ❌ Плохо
   <div className="px-4 mx-auto max-w-screen-xl">
   ```

3. **Семантические цвета**
   ```tsx
   // ✅ Хорошо
   <button className="bg-primary hover:bg-primary-dark">
   
   // ❌ Плохо
   <button className="bg-orange-500 hover:bg-orange-600">
   ```

4. **Доступность**
   - Минимальный размер кликабельных элементов: 44x44px
   - Контраст текста: минимум 4.5:1
   - Фокус индикаторы для клавиатурной навигации

## 🚀 Расширение системы

### Добавление нового токена
1. Обновите `design-tokens.json`
2. Добавьте экспорт в `useDesignTokens.ts`
3. Используйте в компонентах

### Создание нового компонента
1. Используйте существующие токены
2. Следуйте паттернам других компонентов
3. Добавьте в эту документацию

---

*Дизайн-система актуальна на 14.07.2025*