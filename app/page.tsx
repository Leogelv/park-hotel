import Link from 'next/link'
import Image from 'next/image'
import { typography, spacing } from '@/hooks/useDesignTokens'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <nav className={spacing.container.wide + " py-6"}>
          <div className="flex justify-between items-center">
            <div className={typography.heading.subsection}>
              Парк-отель
            </div>
            <div className="flex gap-8 items-center">
              <Link href="/tours" className="text-neutral-600 hover:text-primary transition-colors">
                Туры
              </Link>
              <Link href="/spaces" className="text-neutral-600 hover:text-primary transition-colors">
                Номера
              </Link>
              <Link href="/tours" className="btn-primary text-sm">
                Забронировать
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-pastel-peach rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pastel-mint rounded-full blur-3xl opacity-30 animate-pulse animation-delay-1000"></div>
        
        <div className={spacing.container.wide + " relative z-10"}>
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
          
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tours"
                className="btn-primary text-lg px-8 py-4 inline-block"
              >
                Выбрать тур
              </Link>
              <Link
                href="/spaces"
                className="btn-outline text-lg px-8 py-4 inline-block"
              >
                Смотреть номера
              </Link>
            </div>
          </div>
        </div>
        
        {/* Скролл индикатор */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-neutral-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className={spacing.container.wide}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-pastel-peach/20 to-transparent animate-slide-up">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className={typography.heading.card + " mb-2"}>Уютные номера</h3>
              <p className={typography.body.base}>Комфортабельные номера с видом на природу</p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-pastel-mint/20 to-transparent animate-slide-up animation-delay-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className={typography.heading.card + " mb-2"}>Активный отдых</h3>
              <p className={typography.body.base}>Разнообразные туры и развлечения</p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-pastel-lavender/20 to-transparent animate-slide-up animation-delay-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className={typography.heading.card + " mb-2"}>Забота о гостях</h3>
              <p className={typography.body.base}>Индивидуальный подход к каждому</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-beige-100 py-8">
        <div className={spacing.container.wide}>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className={typography.body.small + " mb-4 sm:mb-0"}>
              © 2024 Парк-отель. Все права защищены.
            </div>
            <div className="flex gap-6">
              <Link
                href="/admin/tours"
                className="text-neutral-500 hover:text-primary transition-colors text-sm"
              >
                Админка туров
              </Link>
              <Link
                href="/admin/spaces"
                className="text-neutral-500 hover:text-primary transition-colors text-sm"
              >
                Админка номеров
              </Link>
              <Link
                href="/admin/design-tokens"
                className="text-neutral-400 hover:text-primary transition-colors text-xs opacity-50 hover:opacity-100"
              >
                •
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
