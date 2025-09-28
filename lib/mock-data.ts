// Mock data for development when Supabase is not configured

export interface MockProfile {
  id: string
  name: string
  phone: string
  blood_group: string
  emergency_contact: string
  medical_conditions?: string
  allergies?: string
  medications?: string
  qr_code_url?: string
  created_at: string
  updated_at: string
}

// In-memory storage for mock data (global to persist across requests)
declare global {
  var __mockProfiles: MockProfile[] | undefined
}

if (!global.__mockProfiles) {
  global.__mockProfiles = []
}

let mockProfiles: MockProfile[] = global.__mockProfiles

// Generate a random ID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Mock QR code generation (generates actual QR code)
async function generateMockQRCode(profileId: string): Promise<string> {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    const profileUrl = `${baseUrl}/profile/${profileId}`

    // Use the API endpoint to generate QR code
    const response = await fetch(`${baseUrl}/api/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: profileUrl }),
    })

    if (response.ok) {
      const result = await response.json()
      return result.qrCodeUrl
    } else {
      throw new Error('Failed to generate QR code')
    }
  } catch (error) {
    console.error('Error generating mock QR code:', error)
    // Fallback to placeholder
    return "/qr-code-for-emergency-contact.jpg"
  }
}

// Mock profile creation
export async function createMockProfile(profileData: {
  name: string
  phone: string
  bloodGroup: string
  password: string
  emergencyContact: string
  medicalConditions?: string
  allergies?: string
  medications?: string
}): Promise<{ profileId: string; qrCodeUrl: string }> {
  const profileId = generateId()
  const qrCodeUrl = await generateMockQRCode(profileId)

  const profile: MockProfile = {
    id: profileId,
    name: profileData.name,
    phone: profileData.phone,
    blood_group: profileData.bloodGroup,
    emergency_contact: profileData.emergencyContact,
    medical_conditions: profileData.medicalConditions,
    allergies: profileData.allergies,
    medications: profileData.medications,
    qr_code_url: qrCodeUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockProfiles.push(profile)
  console.log(`[MOCK] Created profile: ${profileId}, total profiles: ${mockProfiles.length}`)

  return { profileId, qrCodeUrl }
}

// Mock profile retrieval
export async function getMockProfile(profileId: string): Promise<{ profile: any } | null> {
  console.log(`[MOCK] Looking for profile: ${profileId}, total profiles: ${mockProfiles.length}`)
  const profile = mockProfiles.find(p => p.id === profileId)

  if (!profile) {
    console.log(`[MOCK] Profile ${profileId} not found`)
    return null
  }

  console.log(`[MOCK] Found profile: ${profileId}`)

  // Convert to camelCase for frontend
  return {
    profile: {
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
  }
}

// Mock profile update
export async function updateMockProfile(
  profileId: string,
  updateData: {
    name: string
    phone: string
    bloodGroup: string
    emergencyContact: string
    medicalConditions?: string
    allergies?: string
    medications?: string
  }
): Promise<void> {
  const profileIndex = mockProfiles.findIndex(p => p.id === profileId)

  if (profileIndex === -1) {
    throw new Error('Profile not found')
  }

  mockProfiles[profileIndex] = {
    ...mockProfiles[profileIndex],
    name: updateData.name,
    phone: updateData.phone,
    blood_group: updateData.bloodGroup,
    emergency_contact: updateData.emergencyContact,
    medical_conditions: updateData.medicalConditions,
    allergies: updateData.allergies,
    medications: updateData.medications,
    updated_at: new Date().toISOString(),
  }
}

// Mock password verification
export async function verifyMockPassword(profileId: string, password: string): Promise<boolean> {
  // In mock mode, accept any password that matches "demo123" for testing
  return password === "demo123"
}

// Mock profile deletion
export async function deleteMockProfile(profileId: string): Promise<void> {
  const profileIndex = mockProfiles.findIndex(p => p.id === profileId)

  if (profileIndex === -1) {
    throw new Error('Profile not found')
  }

  mockProfiles.splice(profileIndex, 1)
  console.log(`[MOCK] Deleted profile: ${profileId}, remaining profiles: ${mockProfiles.length}`)
}

// Debug function to get all profiles
export function getAllMockProfiles(): MockProfile[] {
  return mockProfiles
}
