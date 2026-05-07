import { createClient } from '@/lib/supabase/server'
import AffiliateClient from '@/components/AffiliateClient'

export default async function AffiliatePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('ref_code, is_active, created_at')
    .eq('user_id', user!.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sidekick.my'

  return (
    <AffiliateClient
      affiliate={affiliate ?? null}
      refUrl={affiliate ? `${appUrl}/ref/${affiliate.ref_code}` : null}
    />
  )
}
