# safeLINK - Emergency Contact QR Code System

A Next.js application that generates QR codes for emergency contact information, allowing first responders and others to quickly access critical medical and contact details.

## Features

- **Profile Creation**: Create detailed emergency contact profiles with medical information
- **QR Code Generation**: Automatically generate QR codes that link to profile information
- **Secure Access**: Password-protected sensitive medical information
- **QR Code Scanning**: Scan QR codes to access and edit profiles
- **Real-time Updates**: Update profile information with proper authentication
- **Responsive Design**: Works on all devices with a modern UI

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI components, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for QR codes
- **Authentication**: Password-based (bcrypt hashing)
- **QR Code**: Client-side generation with `qrcode` library
- **Scanning**: Real-time QR code scanning with `jsqr`

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Development Mode (Optional - Supabase Setup)

The app includes a **mock data layer** that allows you to run and test all functionality without setting up Supabase. This is perfect for development and testing.

#### Option A: Use Mock Data (Recommended for Development)

1. **No additional setup required!** The app will automatically use mock data when Supabase is not configured.
2. All features work including:
   - Profile creation
   - QR code generation (placeholder images)
   - Profile retrieval
   - Password verification (use "demo123" for testing all profiles)
   - Profile editing

#### Option B: Set up Supabase (Production Ready)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings and copy the following:
   - Project URL
   - Anon/Public key

3. Configure Environment Variables

Update the `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

4. Set up Database Schema

Run the Supabase migration to create the necessary tables:

```bash
supabase db push
```

This will create:
- `profiles` table for storing user information
- `qr_codes` table for QR code metadata
- Storage bucket for QR code images

### 5. Start the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Database Schema

### Profiles Table
```sql
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
```

### QR Codes Table
```sql
CREATE TABLE qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  qr_code_data TEXT NOT NULL,
  qr_code_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## API Routes

### Profiles
- `POST /api/profiles` - Create a new profile
- `GET /api/profiles?id={id}` - Get profile by ID
- `PUT /api/profiles/{id}` - Update profile (requires current password)
- `DELETE /api/profiles/{id}` - Delete profile (requires password)

### Authentication
- `POST /api/auth/verify-password` - Verify profile password

## How It Works

1. **Create Profile**: Users fill out a multi-step form with their emergency contact and medical information
2. **QR Code Generation**: Upon submission, a QR code is generated and stored in Supabase Storage
3. **Profile Access**: The QR code links to a public profile page showing basic contact info
4. **Secure Access**: Sensitive medical information requires password authentication
5. **Scanning**: QR codes can be scanned to access and edit profiles
6. **Updates**: Profile information can be updated with proper password verification

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- Row Level Security (RLS) enabled on all tables
- Public access to basic contact information
- Password protection for sensitive medical data
- Secure storage of QR codes

## File Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── verify-password/
│   │   └── profiles/
│   │       ├── [id]/
│   │       └── route.ts
│   ├── create-profile/
│   ├── edit-profile/
│   │   └── [id]/
│   ├── profile/
│   │   └── [id]/
│   ├── qr-code/
│   │   └── [id]/
│   ├── scanner/
│   └── layout.tsx
├── components/
│   ├── ui/          # shadcn/ui components
│   └── theme-provider.tsx
├── lib/
│   ├── supabase.ts  # Supabase client
│   └── qr-utils.ts  # QR code utilities
├── supabase/
│   └── migrations/  # Database migrations
└── public/          # Static assets
```

## Development

### Running Locally

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Database Management

```bash
# Push migrations to Supabase
supabase db push

# Reset database (WARNING: This deletes all data)
supabase db reset

# View database status
supabase status
```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

### Manual Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.
