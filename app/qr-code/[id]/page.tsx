"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Download, Share2, Edit, Copy, Check, ArrowLeft, QrCode, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface QRCodePageProps {
  params: {
    id: string
  }
}

interface ProfileData {
  id: string
  name: string
  qrCodeUrl?: string
  profileUrl: string
}

export default function QRCodePage({ params }: QRCodePageProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Starting fetch for profile:', params.id)
        const response = await fetch(`/api/profiles/${params.id}`)
        console.log('Fetch completed, status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API error:', errorText)
          throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        console.log('API response:', data)

        if (data.profile) {
          setProfileData({
            id: data.profile.id,
            name: data.profile.name,
            qrCodeUrl: data.profile.qrCodeUrl,
            profileUrl: `http://localhost:3000/profile/${data.profile.id}`,
          })
        } else {
          throw new Error('No profile data received')
        }
      } catch (err) {
        console.error('Fetch failed:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      fetchProfile()
    } else {
      // For server-side rendering, set loading to false
      setLoading(false)
      setError('Unable to load profile')
    }
  }, [params.id])

  const handleDownload = async () => {
    if (!profileData?.qrCodeUrl) return

    try {
      const response = await fetch(profileData.qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `safeLINK-${profileData.name.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  const handleCopyUrl = async () => {
    if (!profileData?.profileUrl) return

    try {
      await navigator.clipboard.writeText(profileData.profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.log("Failed to copy:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your QR code...</p>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">safeLINK</span>
              </Link>
              <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Profile not found. Please check the URL and try again.'}
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href="/create-profile">Create New Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">safeLINK</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your safeLINK is Ready!</h1>
            <p className="text-muted-foreground">Your emergency contact QR code has been generated successfully</p>
          </div>

          <Card className="p-8 text-center border-border">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4">
                Profile ID: {params.id}
              </Badge>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Emergency Contact QR Code</h2>
              <p className="text-muted-foreground">Scan this code to access emergency information</p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-8 mb-6 inline-block">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <img
                  src={profileData.qrCodeUrl || "/placeholder.svg"}
                  alt="Emergency Contact QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>
              <Button variant="outline" className="border-border hover:bg-muted/50 flex items-center gap-2 bg-transparent">
                <Share2 className="w-4 h-4" />
                Share QR Code
              </Button>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Direct Link:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-background border border-border rounded px-3 py-2 text-left">
                  {profileData.profileUrl}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopyUrl} className="border-border hover:bg-muted/50 bg-transparent">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button variant="outline" className="flex items-center gap-2 border-border hover:bg-muted/50 bg-transparent" asChild>
              <Link href={`/edit-profile/${params.id}`}>
                <Edit className="w-4 h-4" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-border hover:bg-muted/50 bg-transparent" asChild>
              <Link href={`/profile/${params.id}`}>
                <QrCode className="w-4 h-4" />
                Preview Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
