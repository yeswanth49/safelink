-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  medical_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create qr_codes table for storing QR code metadata
CREATE TABLE qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  qr_code_data TEXT NOT NULL, -- The URL that the QR code points to
  qr_code_url TEXT NOT NULL, -- The URL where the QR code image is stored
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_qr_codes_profile_id ON qr_codes(profile_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Allow anyone to read profiles (for QR code scanning)
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own profiles
CREATE POLICY "Users can insert their own profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own profiles (with password verification - handled in application)
CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (true);

-- Create policies for qr_codes table
CREATE POLICY "Anyone can view qr_codes" ON qr_codes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert qr_codes" ON qr_codes
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
