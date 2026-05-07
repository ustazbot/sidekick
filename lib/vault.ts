import type { VaultFile, VaultIndex } from '@/types'
import vaultData from '@/public/vault/vault_index.json'

const vault = vaultData as VaultIndex

export function getAllFiles(): VaultFile[] {
  return vault.files
}

export function filterByModule(module: string): VaultFile[] {
  if (module === 'ALL') return vault.files
  return vault.files.filter(f => f.module === module)
}

export function filterByNiche(nicheCode: string): VaultFile[] {
  return vault.files.filter(f => f.niche_code === nicheCode)
}

export function getVaultMeta() {
  return {
    total: vault.total_files,
    modules: vault.modules,
    niches: vault.niches,
    platforms: vault.platforms,
  }
}
