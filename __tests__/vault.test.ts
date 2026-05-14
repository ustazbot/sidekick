import { getAllFiles, filterByModule, filterByNiche, getVaultMeta } from '@/lib/vault'

describe('vault', () => {
  describe('getAllFiles', () => {
    it('returns all 74 vault files', () => {
      expect(getAllFiles()).toHaveLength(74)
    })
  })

  describe('filterByModule', () => {
    it('returns only ATTRACT files', () => {
      const results = filterByModule('ATTRACT')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(f => f.module === 'ATTRACT')).toBe(true)
    })

    it('returns all files when module is ALL', () => {
      expect(filterByModule('ALL')).toHaveLength(74)
    })

    it('returns empty array for unknown module', () => {
      expect(filterByModule('UNKNOWN')).toHaveLength(0)
    })
  })

  describe('filterByNiche', () => {
    it('returns only REN files', () => {
      const results = filterByNiche('REN')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(f => f.niche_code === 'REN')).toBe(true)
    })

    it('returns empty array for unknown niche', () => {
      expect(filterByNiche('UNKNOWN')).toHaveLength(0)
    })
  })

  describe('getVaultMeta', () => {
    it('returns correct total', () => {
      expect(getVaultMeta().total).toBe(74)
    })

    it('includes all 7 modules', () => {
      const { modules } = getVaultMeta()
      ;['AVATAR', 'ATTRACT', 'CAPTURE', 'CONVERT', 'CLOSE', 'DEFEND', 'AD-CREATOR'].forEach(m => {
        expect(modules).toContain(m)
      })
    })
  })
})
