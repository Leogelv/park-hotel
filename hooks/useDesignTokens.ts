import designTokens from '@/design-tokens.json'

export function useDesignTokens() {
  return designTokens
}

// Утилита для получения классов типографики
export function getTypographyClass(category: keyof typeof designTokens.typography, variant: string) {
  const categoryTokens = designTokens.typography[category]
  if (categoryTokens && variant in categoryTokens) {
    return (categoryTokens as any)[variant].className
  }
  return ''
}

// Утилита для получения цветов
export function getColor(category: keyof typeof designTokens.colors, variant: string) {
  const categoryColors = designTokens.colors[category]
  if (categoryColors && variant in categoryColors) {
    return (categoryColors as any)[variant]
  }
  return ''
}

// Экспорт готовых классов для удобства
export const typography = {
  heading: {
    hero: designTokens.typography.heading.hero.className,
    page: designTokens.typography.heading.page.className,
    section: designTokens.typography.heading.section.className,
    subsection: designTokens.typography.heading.subsection.className,
    card: designTokens.typography.heading.card.className,
    small: designTokens.typography.heading.small.className,
  },
  body: {
    large: designTokens.typography.body.large.className,
    base: designTokens.typography.body.base.className,
    small: designTokens.typography.body.small.className,
    caption: designTokens.typography.body.caption.className,
  },
  display: {
    price: designTokens.typography.display.price.className,
    oldPrice: designTokens.typography.display.oldPrice.className,
    discount: designTokens.typography.display.discount.className,
  },
  interactive: {
    link: designTokens.typography.interactive.link.className,
    button: designTokens.typography.interactive.button,
  }
}

export const spacing = {
  section: designTokens.spacing.section,
  container: designTokens.spacing.container,
}

export const forms = {
  input: 'text-neutral-800 placeholder-neutral-400',
  label: designTokens.typography.body.small.className + ' block font-medium mb-2 text-neutral-800',
  textarea: 'text-neutral-800 placeholder-neutral-400',
  select: 'text-neutral-800'
}

// Для отладки
console.log('🎨 forms.input стили:', forms.input)