import { getAllFiles } from '@/lib/vault'
import { searchVault } from '@/lib/deepseek'

export async function POST(request: Request) {
  const body = await request.json()
  const query: string = body.query ?? ''

  if (!query.trim()) {
    return new Response(JSON.stringify({ error: 'query required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const matchedFilenames = await searchVault(query)
  const allFiles = getAllFiles()
  const files = allFiles.filter((f) => matchedFilenames.includes(f.filename))

  return new Response(JSON.stringify({ files }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
