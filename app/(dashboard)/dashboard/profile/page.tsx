import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ProfileClient from '@/components/ProfileClient'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  // Fetch profile and check affiliate existence in parallel
  const [{ data: profile }, affiliateResult] = await Promise.all([
    admin
      .from('users')
      .select('name, niche, created_at')
      .eq('id', user!.id)
      .maybeSingle(),
    // Detect affiliate with minimal columns first
    admin
      .from('affiliates')
      .select('id')
      .eq('user_id', user!.id)
      .maybeSingle(),
  ])

  const isAffiliate = !!affiliateResult.data

  // Fetch bank_info separately — column may not exist yet
  let bankInfo = ''
  if (isAffiliate) {
    const { data: bankRow, error: bankErr } = await admin
      .from('affiliates')
      .select('bank_info')
      .eq('user_id', user!.id)
      .maybeSingle()

    if (!bankErr) {
      bankInfo = (bankRow as Record<string, unknown> | null)?.bank_info as string ?? ''
    }
    // If error (column not found), bankInfo stays '' — section still shows so user can fill once column exists
  }

  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ms-MY', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'

  return (
    <ProfileClient
      email={user!.email ?? ''}
      initialName={profile?.name ?? ''}
      initialNiche={profile?.niche ?? ''}
      joined={joined}
      isAffiliate={isAffiliate}
      initialBankInfo={bankInfo}
    />
  )
}
