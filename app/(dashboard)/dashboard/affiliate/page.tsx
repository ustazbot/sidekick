import { createClient } from '@/lib/supabase/server'
import AffiliateClient from '@/components/AffiliateClient'

type PayoutRecord = {
  id: string
  amount: number
  method: string
  note: string | null
  paid_at: string
}

export default async function AffiliatePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: raw } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user!.id)
    .maybeSingle()

  // Handle both ref_code and affiliate_code column names
  const refCode = raw?.ref_code ?? raw?.affiliate_code ?? null

  const affiliate = raw
    ? { ref_code: refCode as string, is_active: raw.is_active ?? true, created_at: raw.created_at }
    : null

  // Fetch sejarah bayaran komisyen (SSR)
  let payouts: PayoutRecord[] = []
  if (raw?.id) {
    const { data: payoutsData } = await supabase
      .from('affiliate_payouts')
      .select('id, amount, method, note, paid_at')
      .eq('affiliate_id', raw.id)
      .order('paid_at', { ascending: false })
      .limit(20)
    payouts = ((payoutsData ?? []) as any[]).map(r => ({
      ...r,
      amount: Number(r.amount),
    }))
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sidekick.my'

  return (
    <AffiliateClient
      affiliate={affiliate}
      refUrl={affiliate ? `${appUrl}/ref/${refCode}` : null}
      appUrl={appUrl}
      payouts={payouts}
    />
  )
}
