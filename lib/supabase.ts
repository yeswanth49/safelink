import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  name: string
  phone: string
  blood_group: string
  password_hash: string
  emergency_contact: string
  medical_conditions?: string
  allergies?: string
  medications?: string
  qr_code_url?: string
  created_at: string
  updated_at: string
}

export interface QRCode {
  id: string
  profile_id: string
  qr_code_data: string
  qr_code_url: string
  created_at: string
}
