// VaultFile — matches actual vault_index.json `files` array structure
export type VaultFile = {
  filename: string
  filepath: string
  module: string
  module_desc: string
  niche: string
  niche_code: string
  tier: string
  platforms: string[]
  language: string
  version: string
  tags: string[]
  status: string
}

export type VaultIndex = {
  version: string
  generated: string
  total_files: number
  niche_count: number
  module_count: number
  modules: string[]
  niches: Record<string, string>
  platforms: string[]
  files: VaultFile[]
}

export type UserRole = 'user' | 'beta' | 'admin'

export type User = {
  id: string
  full_name: string | null
  phone: string | null
  niche: string | null
  role: UserRole
  onboarded: boolean
  created_at: string
}

export type PurchaseStatus = 'pending' | 'paid' | 'refunded'

export type Purchase = {
  id: string
  user_id: string | null
  email: string
  amount: number
  toyyibpay_ref: string | null
  status: PurchaseStatus
  created_at: string
}

export type Affiliate = {
  id: string
  user_id: string
  ref_code: string
  bank_name: string | null
  bank_account: string | null
  bank_holder: string | null
  is_active: boolean
  created_at: string
}

export type ConversionStatus = 'pending' | 'paid' | 'clawback'

export type AffiliateConversion = {
  id: string
  affiliate_id: string
  purchase_id: string
  commission: number
  status: ConversionStatus
  paid_at: string | null
  created_at: string
}

export type AffiliateClick = {
  id: string
  affiliate_id: string
  ip_hash: string | null
  created_at: string
}

export type PromptLog = {
  id: string
  user_id: string
  modul: string
  kad_id: string
  platform: string | null
  created_at: string
}

export type Download = {
  id: string
  user_id: string
  kad_id: string
  created_at: string
}
