import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword, generateQRCode, generateProfileURL } from '@/lib/qr-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      bloodGroup,
      password,
      emergencyContact,
      medicalConditions,
      allergies,
      medications
    } = body

    // Validate required fields
    if (!name || !phone || !bloodGroup || !password || !emergencyContact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hash the password
    const passwordHash = await hashPassword(password)

    // Insert profile into database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        name,
        phone,
        blood_group: bloodGroup,
        password_hash: passwordHash,
        emergency_contact: emergencyContact,
        medical_conditions: medicalConditions || null,
        allergies: allergies || null,
        medications: medications || null,
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    // Generate QR code
    const profileUrl = generateProfileURL(profile.id)
    const qrCodeDataURL = await generateQRCode(profileUrl)

    // Upload QR code to Supabase Storage
    const qrCodeFileName = `qr-${profile.id}.png`
    const qrCodeBlob = await fetch(qrCodeDataURL).then(r => r.blob())

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('qr-codes')
      .upload(qrCodeFileName, qrCodeBlob, {
        contentType: 'image/png',
        upsert: true
      })

    let qrCodeUrl = null
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('qr-codes')
        .getPublicUrl(qrCodeFileName)
      qrCodeUrl = publicUrl
    }

    // Update profile with QR code URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating profile with QR code URL:', updateError)
    }

    // Insert QR code metadata
    const { error: qrError } = await supabase
      .from('qr_codes')
      .insert({
        profile_id: profile.id,
        qr_code_data: profileUrl,
        qr_code_url: qrCodeUrl || qrCodeDataURL,
      })

    if (qrError) {
      console.error('Error creating QR code record:', qrError)
    }

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      qrCodeUrl: qrCodeUrl || qrCodeDataURL,
    })

  } catch (error) {
    console.error('Error in profiles API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      )
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Convert database field names to camelCase for frontend
    const formattedProfile = {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      bloodGroup: profile.blood_group,
      emergencyContact: profile.emergency_contact,
      medicalConditions: profile.medical_conditions,
      allergies: profile.allergies,
      medications: profile.medications,
      qrCodeUrl: profile.qr_code_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }

    return NextResponse.json({ profile: formattedProfile })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
