import { NextRequest, NextResponse } from 'next/server'

// Demo logout endpoint
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}