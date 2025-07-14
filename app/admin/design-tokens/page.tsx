'use client'

import { useState, useEffect } from 'react'
import { useDesignTokens, typography, spacing } from '@/hooks/useDesignTokens'
import designTokensDefault from '@/design-tokens.json'

export default function DesignTokensPage() {
  const [tokens, setTokens] = useState(designTokensDefault)
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview')
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(tokens, null, 2))
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const renderTypographyPreview = () => {
    return (
      <div className="space-y-8">
        {/* Заголовки */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">Заголовки</h3>
          <div className="space-y-4">
            {Object.entries(tokens.typography.heading).map(([key, value]) => (
              <div key={key} className="p-4 bg-white rounded-lg border border-beige-200">
                <div className="flex justify-between items-start mb-2">
                  <code className="text-sm text-neutral-600 bg-beige-50 px-2 py-1 rounded">
                    typography.heading.{key}
                  </code>
                  <span className="text-xs text-neutral-500">{value.description}</span>
                </div>
                <div className={value.className}>
                  Пример текста для {key}
                </div>
                <div className="mt-2 text-xs text-neutral-500 font-mono">
                  {value.className}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Основной текст */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">Основной текст</h3>
          <div className="space-y-4">
            {Object.entries(tokens.typography.body).map(([key, value]) => (
              <div key={key} className="p-4 bg-white rounded-lg border border-beige-200">
                <div className="flex justify-between items-start mb-2">
                  <code className="text-sm text-neutral-600 bg-beige-50 px-2 py-1 rounded">
                    typography.body.{key}
                  </code>
                  <span className="text-xs text-neutral-500">{value.description}</span>
                </div>
                <div className={value.className}>
                  Это пример текста для демонстрации стиля {key}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </div>
                <div className="mt-2 text-xs text-neutral-500 font-mono">
                  {value.className}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Специальные стили */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">Специальные стили</h3>
          <div className="space-y-4">
            {Object.entries(tokens.typography.display).map(([key, value]) => (
              <div key={key} className="p-4 bg-white rounded-lg border border-beige-200">
                <div className="flex justify-between items-start mb-2">
                  <code className="text-sm text-neutral-600 bg-beige-50 px-2 py-1 rounded">
                    typography.display.{key}
                  </code>
                  <span className="text-xs text-neutral-500">{value.description}</span>
                </div>
                <div className="flex items-baseline gap-4">
                  {key === 'price' && <span className={value.className}>55 000 ₽</span>}
                  {key === 'oldPrice' && <span className={value.className}>77 000 ₽</span>}
                  {key === 'discount' && <span className={value.className}>-30%</span>}
                </div>
                <div className="mt-2 text-xs text-neutral-500 font-mono">
                  {value.className}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">Кнопки</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-beige-200">
              <div className="flex gap-4 items-center">
                <button className="btn-primary">Primary Button</button>
                <button className="btn-secondary">Secondary Button</button>
                <button className="btn-outline">Outline Button</button>
              </div>
              <div className="mt-4 space-y-1 text-xs text-neutral-500 font-mono">
                <div>btn-primary</div>
                <div>btn-secondary</div>
                <div>btn-outline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Цвета */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">Цвета</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(tokens.colors).map(([category, colors]) => (
              <div key={category}>
                <h4 className="font-medium mb-2 capitalize">{category}</h4>
                <div className="space-y-2">
                  {Object.entries(colors).map(([name, value]) => (
                    <div key={name} className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded border border-neutral-200"
                        style={{ backgroundColor: value as string }}
                      />
                      <div className="text-sm">
                        <span className="font-mono text-xs text-neutral-600">{name}:</span>
                        <span className="ml-2 font-mono text-xs">{value as string}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Отступы */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">Отступы и контейнеры</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-beige-200">
              <h4 className="font-medium mb-2">Section Padding</h4>
              <div className="space-y-1 text-sm font-mono text-neutral-600">
                <div>Desktop: {tokens.spacing.section.desktop}</div>
                <div>Tablet: {tokens.spacing.section.tablet}</div>
                <div>Mobile: {tokens.spacing.section.mobile}</div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-beige-200">
              <h4 className="font-medium mb-2">Container Classes</h4>
              <div className="space-y-1 text-sm font-mono text-neutral-600">
                {Object.entries(tokens.spacing.container).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-neutral-500">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className={typography.heading.page}>Design Tokens</h1>
        <p className={typography.body.large + " mt-2 mb-8"}>
          Централизованное управление стилями приложения
        </p>

        {/* Табы */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-600 hover:bg-beige-100'
            }`}
          >
            Превью
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'json'
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-600 hover:bg-beige-100'
            }`}
          >
            JSON
          </button>
        </div>

        {/* Контент */}
        {activeTab === 'preview' ? (
          renderTypographyPreview()
        ) : (
          <div className="bg-white rounded-lg p-6 border border-beige-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">design-tokens.json</h3>
              <button
                onClick={handleCopyJson}
                className="btn-secondary text-sm"
              >
                {copySuccess ? 'Скопировано!' : 'Копировать JSON'}
              </button>
            </div>
            <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(tokens, null, 2)}</code>
            </pre>
          </div>
        )}

        {/* Инструкция по использованию */}
        <div className="mt-12 bg-white rounded-lg p-6 border border-beige-200">
          <h3 className="text-lg font-semibold mb-4">Как использовать</h3>
          <div className="space-y-4 text-sm text-neutral-700">
            <div>
              <h4 className="font-medium mb-1">Импорт хука:</h4>
              <pre className="bg-neutral-100 p-2 rounded text-xs">
                <code>{`import { typography, spacing } from '@/hooks/useDesignTokens'`}</code>
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-1">Использование в компонентах:</h4>
              <pre className="bg-neutral-100 p-2 rounded text-xs">
                <code>{`<h1 className={typography.heading.hero}>Заголовок</h1>
<p className={typography.body.base}>Текст параграфа</p>
<div className={spacing.container.default}>Контейнер</div>`}</code>
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-1">Прямое использование классов:</h4>
              <pre className="bg-neutral-100 p-2 rounded text-xs">
                <code>{`<h1 className="page-title">Заголовок страницы</h1>
<h2 className="tour-title">Название тура</h2>
<button className="btn-primary">Кнопка</button>`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}