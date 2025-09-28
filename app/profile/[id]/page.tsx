"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Phone, Heart, AlertTriangle, Pill, User, Droplets, Clock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface ProfilePageProps {
  params: {
    id: string
  }
}

interface ProfileData {
  id: string
  name: string
  phone: string
  bloodGroup: string
  emergencyContact: string
  medicalConditions?: string
  allergies?: string
  medications?: string
  lastUpdated: string
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`/api/profiles?id=${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

      const profile = data.profile
      setProfileData({
        id: profile.id,
        name: profile.name,
        phone: profile.phone,
        bloodGroup: profile.bloodGroup,
        emergencyContact: profile.emergencyContact,
        medicalConditions: profile.medicalConditions,
        allergies: profile.allergies,
        medications: profile.medications,
        lastUpdated: profile.updatedAt,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const formatEmergencyContact = (contact: string) => {
    return contact.split("\n").map((line, index) => (
      <div key={index} className={index === 0 ? "font-semibold" : ""}>
        {line}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading emergency contact information...</p>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Emergency Contact Information</h1>
              <p className="text-primary-foreground/80">safeLINK Profile</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Profile not found. Please check the URL and try again.'}
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href="/scanner">Scan Another QR Code</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Emergency Contact Information</h1>
            <p className="text-primary-foreground/80">safeLINK Profile</p>
            <Badge
              variant="secondary"
              className="mt-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
            >
              Profile ID: {params.id}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Information */}
          <Card
            className={`p-6 border-border transition-all duration-1000 delay-200 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Full Name</p>
                <p className="text-lg text-foreground font-semibold">{profileData.name}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Phone Number</p>
                <p className="text-lg text-foreground font-semibold">{profileData.phone}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Blood Group
                </p>
                <p className="text-lg text-foreground font-semibold">{profileData.bloodGroup}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last Updated
                </p>
                <p className="text-lg text-foreground">{new Date(profileData.lastUpdated).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card
            className={`p-6 border-border transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Emergency Contact</h2>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="text-foreground leading-relaxed">
                {formatEmergencyContact(profileData.emergencyContact)}
              </div>
              <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => (window.location.href = `tel:${profileData.phone}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Emergency Contact
                </Button>
              </div>
            </div>
          </Card>

          {/* Medical Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Medical Conditions */}
            <Card
              className={`p-6 border-border transition-all duration-1000 delay-400 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Medical Conditions</h3>
              </div>

              <div className="space-y-2">
                {profileData.medicalConditions ? (
                  profileData.medicalConditions.split(", ").map((condition, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {condition}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">None reported</p>
                )}
              </div>
            </Card>

            {/* Allergies */}
            <Card
              className={`p-6 border-border transition-all duration-1000 delay-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Allergies</h3>
              </div>

              <div className="space-y-2">
                {profileData.allergies ? (
                  profileData.allergies.split(", ").map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="mr-2 mb-2">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">None reported</p>
                )}
              </div>
            </Card>

            {/* Current Medications */}
            <Card
              className={`p-6 border-border transition-all duration-1000 delay-600 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Current Medications</h3>
              </div>

              <div className="space-y-3">
                {profileData.medications ? (
                  profileData.medications.split(", ").map((medication, index) => (
                    <div key={index} className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
                      {medication}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">None reported</p>
                )}
              </div>
            </Card>
          </div>

          {/* Important Notice */}
          <Card
            className={`p-6 bg-muted/50 border-border transition-all duration-1000 delay-700 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Important Notice for First Responders</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This information is provided for emergency medical assistance. Please verify critical details with the
                  patient or emergency contacts when possible.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Last updated: {new Date(profileData.lastUpdated).toLocaleDateString()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified safeLINK profile
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-800 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => (window.location.href = `tel:${profileData.phone}`)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Emergency Contact
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:bg-muted/50 bg-transparent" asChild>
              <Link href="/">
                <Shield className="w-4 h-4 mr-2" />
                Create Your safeLINK
              </Link>
            </Button>
          </div>

          {/* Footer */}
          <div
            className={`text-center py-8 transition-all duration-1000 delay-900 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg font-bold text-foreground">safeLINK</span>
            </div>
            <p className="text-sm text-muted-foreground">Emergency contact information when it matters most</p>
          </div>
        </div>
      </div>
    </div>
  )
}
