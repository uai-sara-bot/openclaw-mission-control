'use client'

export default function ContentPage() {
  const name = 'Content'
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-2xl">🚧</div>
        <h1 className="text-xl font-semibold text-white mb-2">{name}</h1>
        <p className="text-sm text-gray-500">Coming soon</p>
      </div>
    </div>
  )
}
