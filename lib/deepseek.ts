import { getAllFiles } from '@/lib/vault'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function searchVault(query: string): Promise<string[]> {
  const files = getAllFiles()
  const fileList = files
    .map((f) => `${f.filename}: ${f.module} — ${f.niche} — ${f.tags.join(', ')}`)
    .join('\n')

  const systemPrompt = `Kamu adalah search engine untuk platform SIDEKICK.
Dari senarai fail prompt berikut, cari yang paling relevan dengan query pengguna.
Kembalikan HANYA JSON array filenames, contoh: ["ATTRACT-REN-v1.txt", "CAPTURE-SKINCARE-v1.txt"]
Pilih maksimum 10 yang paling relevan. Jika tiada yang relevan, kembalikan [].

Senarai fail:
${fileList}`

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  const content: string = data.choices?.[0]?.message?.content ?? '[]'

  try {
    const match = content.match(/\[[\s\S]*\]/)
    if (!match) return []
    return JSON.parse(match[0]) as string[]
  } catch {
    return []
  }
}

export async function askHelpdesk(message: string): Promise<string> {
  const systemPrompt = `Kamu adalah assistant SIDEKICK.
Jawab soalan berkaitan cara guna platform SIDEKICK sahaja.
SIDEKICK adalah platform download prompt AI untuk seller Malaysia.
User download fail .txt dan guna dengan AI pilihan mereka sendiri.
Jangan jawab soalan luar topik. Jawab dalam Bahasa Malaysia.`

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.5,
    }),
  })

  if (!response.ok) {
    return 'Maaf, saya tidak dapat menjawab sekarang. Cuba lagi.'
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? 'Tiada jawapan.'
}
