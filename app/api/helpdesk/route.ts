import { NextResponse } from 'next/server'
import { askHelpdesk } from '@/lib/deepseek'

export async function POST(request: Request) {
  const body = await request.json()
  const message: string = body.message ?? ''

  if (!message.trim()) {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  const reply = await askHelpdesk(message)
  return NextResponse.json({ reply })
}
