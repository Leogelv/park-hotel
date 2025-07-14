import Link from 'next/link'
import { typography, spacing } from '@/hooks/useDesignTokens'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-white flex items-center justify-center">
      <div className={spacing.container.wide + " max-w-4xl mx-auto"}>
        <div className="text-center mb-12">
          <h1 className={typography.heading.section + " mb-4"}>
            Парк-отель
          </h1>
          <p className={typography.body.large + " text-neutral-600"}>
            Управление турами и номерами
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/tours"
            className="bg-white hover:bg-neutral-50 border border-neutral-200 rounded-3xl p-12 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg group"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className={typography.heading.card + " mb-2"}>Туры</h2>
            <p className={typography.body.base + " text-neutral-600"}>Просмотр всех туров</p>
          </Link>

          <Link
            href="/spaces"
            className="bg-white hover:bg-neutral-50 border border-neutral-200 rounded-3xl p-12 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg group"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 className={typography.heading.card + " mb-2"}>Номера</h2>
            <p className={typography.body.base + " text-neutral-600"}>Просмотр всех номеров</p>
          </Link>

          <Link
            href="/admin/tours"
            className="bg-white hover:bg-neutral-50 border border-neutral-200 rounded-3xl p-12 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg group"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className={typography.heading.card + " mb-2"}>Админка туров</h2>
            <p className={typography.body.base + " text-neutral-600"}>Управление турами</p>
          </Link>

          <Link
            href="/admin/spaces"
            className="bg-white hover:bg-neutral-50 border border-neutral-200 rounded-3xl p-12 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg group"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className={typography.heading.card + " mb-2"}>Админка номеров</h2>
            <p className={typography.body.base + " text-neutral-600"}>Управление номерами</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
