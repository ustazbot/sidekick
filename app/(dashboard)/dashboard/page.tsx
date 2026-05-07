import { createClient } from '@/lib/supabase/server'
import { getAllFiles } from '@/lib/vault'
import BrowseClient from '@/components/BrowseClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const userName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Pengguna'
  const files = getAllFiles()

  return <BrowseClient files={files} userName={userName} />
}
