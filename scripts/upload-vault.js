// scripts/upload-vault.js
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { lookup } from 'mime-types'

// ── Supabase client (guna service_role untuk bypass RLS) ──────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌  Tiada NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY dalam .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
})

const BUCKET = 'vault'
const VAULT_DIR = join(process.cwd(), 'vault')

// ── Kumpul semua fail secara rekursif ─────────────────────────────────────────
function getAllFiles(dir, fileList = []) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList)
    } else {
      fileList.push(fullPath)
    }
  }
  return fileList
}

// ── Main upload ───────────────────────────────────────────────────────────────
async function uploadVault() {
  console.log(`\n📦  Memulakan upload ke bucket "${BUCKET}"...\n`)

  let files
  try {
    files = getAllFiles(VAULT_DIR)
  } catch (err) {
    console.error(`❌  Folder "vault/" tidak dijumpai: ${err.message}`)
    process.exit(1)
  }

  console.log(`📁  Dijumpai ${files.length} fail untuk diupload\n`)
  console.log('─'.repeat(60))

  let ok = 0
  let gagal = 0

  for (const filePath of files) {
    // ✅ FIX: ambil path relatif dari DALAM folder vault/
    // Hasil: avatar/AVATAR-PERMUKAAN-v1.txt  (bukan vault/avatar/...)
    const storagePath = relative(VAULT_DIR, filePath).replace(/\\/g, '/')

    const mimeType = lookup(filePath) || 'application/octet-stream'
    const fileBuffer = readFileSync(filePath)

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true  // overwrite jika fail sudah ada
      })

    if (error) {
      console.log(`❌  GAGAL   ${storagePath}`)
      console.log(`           ${error.message}`)
      gagal++
    } else {
      console.log(`✅  OK      ${storagePath}`)
      ok++
    }
  }

  console.log('─'.repeat(60))
  console.log(`\n📊  Keputusan: ${ok} OK  |  ${gagal} GAGAL  |  ${files.length} jumlah\n`)

  if (gagal > 0) process.exit(1)
}

uploadVault()
