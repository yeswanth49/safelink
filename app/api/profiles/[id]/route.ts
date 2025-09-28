import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyPassword, hashPassword } from '@/lib/qr-utils'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      bloodGroup,
      password, // Current password for verification
      newPassword, // Optional new password
      emergencyContact,
      medicalConditions,
      allergies,
      medications
    } = body

    const profileId = params.id

    // Validate required fields
    if (!name || !phone || !bloodGroup || !emergencyContact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (fetchError || !currentProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Verify current password
    if (!password || !(await verifyPassword(password, currentProfile.password_hash))) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Prepare update data
    const updateData: any = {
      name,
      phone,
      blood_group: bloodGroup,
      emergency_contact: emergencyContact,
      medical_conditions: medicalConditions || null,
      allergies: allergies || null,
      medications: medications || null,
    }

    // Update password if provided
    if (newPassword) {
      updateData.password_hash = await hashPassword(newPassword)
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profileId)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in profile update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { password } = body
    const profileId = params.id

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required for deletion' },
        { status: 400 }
      )
    }

    // Get current profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('password_hash')
      .eq('id', profileId)
      .single()

    if (fetchError || !currentProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Verify password
    if (!(await verifyPassword(password, currentProfile.password_hash))) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Delete QR code from storage if it exists
    const { data: qrCodes } = await supabase
      .from('qr_codes')
      .select('qr_code_url')
      .eq('profile_id', profileId)

    if (qrCodes && qrCodes.length > 0) {
      // Extract filename from URL and delete from storage
      const qrCodeUrl = qrCodes[0].qr_code_url
      if (qrCodeUrl && qrCodeUrl.includes('qr-codes/')) {
        const fileName = qrCodeUrl.split('qr-codes/')[1]
        if (fileName) {
          await supabase.storage
            .from('qr-codes')
            .remove([fileName])
        }
      }
    }

    // Delete profile (this will cascade delete QR codes due to foreign key constraint)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (deleteError) {
      console.error('Error deleting profile:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in profile delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
