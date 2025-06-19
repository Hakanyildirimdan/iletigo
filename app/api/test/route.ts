import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'İletigo API is working!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  })
}