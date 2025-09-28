import { NextResponse } from 'next/server'
import { getAllMockProfiles } from '@/lib/mock-data'

export async function GET() {
  try {
    const profiles = getAllMockProfiles()
    return NextResponse.json({
      success: true,
      count: profiles.length,
      profiles: profiles
    })
  } catch (error) {
    console.error('Error getting mock profiles:', error)
    return NextResponse.json(
      { error: 'Failed to get mock profiles' },
      { status: 500 }
    )
  }
}
