// Общие стили для форм - все инпуты с темным текстом из design-tokens
export const formStyles = {
  input: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-neutral-800 placeholder-neutral-400',
  textarea: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-neutral-800 placeholder-neutral-400',
  select: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-neutral-800',
  label: 'block text-sm font-medium text-neutral-800 mb-2',
  button: {
    primary: 'px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50',
    secondary: 'px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-neutral-800'
  }
}