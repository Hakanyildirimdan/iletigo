import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    app: 'İletigo',
    version: '1.0.0',
    status: 'running',
    mode: 'demo',
    database: 'ready for connection'
  })
}