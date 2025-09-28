import QRCode from 'qrcode'
import bcrypt from 'bcryptjs'

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

/**
 * Generate a QR code as a data URL
 */
export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  }

  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, defaultOptions)
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  try {
    const hash = await bcrypt.hash(password, saltRounds)
    return hash
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hash)
    return isValid
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

/**
 * Generate a profile URL for QR code
 */
export function generateProfileURL(profileId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  return `${base}/profile/${profileId}`
}
