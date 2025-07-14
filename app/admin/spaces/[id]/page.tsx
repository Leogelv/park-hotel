import SpaceFormConvex from '@/components/SpaceFormConvex'

export default async function EditSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-white">
      <SpaceFormConvex spaceId={id} />
    </div>
  )
}