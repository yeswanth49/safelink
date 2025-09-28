import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseReady } from '@/lib/supabase'
import { verifyPassword } from '@/lib/qr-utils'
import { verifyMockPassword } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, password } = body

    if (!profileId || !password) {
      return NextResponse.json(
        { error: 'Profile ID and password are required' },
        { status: 400 }
      )
    }

    if (isSupabaseReady && supabase) {
      // Use Supabase
      // Get profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('password_hash')
        .eq('id', profileId)
        .single()

      if (error || !profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }

      // Verify password
      const isValid = await verifyPassword(password, profile.password_hash)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }

      return NextResponse.json({ success: true })
    } else {
      // Use mock verification
      const isValid = await verifyMockPassword(profileId, password)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }

      return NextResponse.json({ success: true })
    }

  } catch (error) {
    console.error('Error verifying password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
