'use client'

import { use } from 'react'
import TourFormModern from '@/components/TourFormModern'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ModernTourEditPage({ params }: PageProps) {
  const { id } = use(params)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-white">
      <TourFormModern tourId={id} />
    </div>
  )
}