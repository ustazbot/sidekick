import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { promises as fs } from 'fs'
import path from 'path'
import type { VaultIndex } from '@/types'

// Vault bucket name in Supabase Storage
const VAULT_BUCKET = 'vault'

// Only allow vault filenames: e.g. ATTRACT-REN-v1.txt or AD-CREATOR-FNB-v1.txt
const SAFE_FILENAME = /^[A-Z0-9]+-[A-Z0-9-]+-v\d+\.txt$/i

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? 'planetrizq@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase())

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('file') ?? ''

  // 1. Validate filename format — prevents path traversal
  if (!SAFE_FILENAME.test(filename)) {
    return NextResponse.json({ error: 'invalid_file' }, { status: 400 })
  }

  // 2. Auth check
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 3. Purchase check — skip for admins
  const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')
  if (!isAdmin) {
    const admin = createAdminClient()
    const { data: purchase } = await admin
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'success')
      .limit(1)
      .maybeSingle()

    if (!purchase) {
      return NextResponse.json({ error: 'no_purchase' }, { status: 403 })
    }
  }

  const admin = createAdminClient()

  // 4. Resolve file path via vault index (no arbitrary path construction)
  let vaultIndex: VaultIndex
  try {
    const indexRaw = await fs.readFile(
      path.join(process.cwd(), 'public', 'vault', 'vault_index.json'),
      'utf-8'
    )
    vaultIndex = JSON.parse(indexRaw)
  } catch {
    return NextResponse.json({ error: 'vault_index_error' }, { status: 500 })
  }

  const entry = vaultIndex.files.find(
    f => f.filename.toLowerCase() === filename.toLowerCase()
  )
  if (!entry) {
    return NextResponse.json({ error: 'file_not_found' }, { status: 404 })
  }

  // 5. Fetch file from Supabase Storage
  // entry.filepath = "vault/attract/ATTRACT-REN-v1.txt" but bucket stores "attract/ATTRACT-REN-v1.txt"
  const storagePath = entry.filepath.replace(/^vault\//, '')
  const { data: blob, error: storageError } = await admin.storage
    .from(VAULT_BUCKET)
    .download(storagePath)

  if (storageError || !blob) {
    return NextResponse.json({ error: 'file_read_error' }, { status: 500 })
  }

  const content = await blob.text()

  // 6. Log download (non-blocking — failure does not abort the download)
  admin
    .from('downloads')
    .insert({ user_id: user.id, filename })
    .then(({ error }) => { if (error) console.error('[download] log error:', error.message) })

  // 7. Serve file
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
