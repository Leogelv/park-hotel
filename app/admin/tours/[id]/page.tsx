import TourFormConvex from '@/components/TourFormConvex'

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-white">
      <TourFormConvex tourId={id} />
    </div>
  )
}