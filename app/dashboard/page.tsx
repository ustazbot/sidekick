import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500 text-sm">Selamat datang, {user.email}</p>
        <p className="text-gray-400 text-xs mt-4">Coming soon — browse &amp; search vault</p>
      </div>
    </main>
  )
}
