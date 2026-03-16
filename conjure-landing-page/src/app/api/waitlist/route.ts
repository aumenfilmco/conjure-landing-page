import { NextRequest, NextResponse } from 'next/server'

const UPSTREAM = 'https://www.conjurestudio.app/api/waitlist'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const upstream = await fetch(UPSTREAM, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await upstream.json().catch(() => ({}))
  return NextResponse.json(data, { status: upstream.status })
}
