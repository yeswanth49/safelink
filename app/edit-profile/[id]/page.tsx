"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, User, Phone, Heart, AlertTriangle, Pill, Save, Eye, AlertCircle, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface EditProfilePageProps {
  params: {
    id: string
  }
}

interface ProfileData {
  name: string
  phone: string
  bloodGroup: string
  emergencyContact: string
  medicalConditions?: string
  allergies?: string
  medications?: string
}

export default function EditProfilePage({ params }: EditProfilePageProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    phone: "",
    bloodGroup: "",
    emergencyContact: "",
    medicalConditions: "",
    allergies: "",
    medications: "",
  })

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  useEffect(() => {
    fetchProfileData()
    setIsVisible(true)
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`/api/profiles?id=${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

      const profile = data.profile
      setFormData({
        name: profile.name,
        phone: profile.phone,
        bloodGroup: profile.bloodGroup,
        emergencyContact: profile.emergencyContact,
        medicalConditions: profile.medicalConditions || "",
        allergies: profile.allergies || "",
        medications: profile.medications || "",
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    if (!currentPassword) {
      setError("Current password is required to save changes")
      setIsSaving(false)
      return
    }

    try {
      const updateData = {
        ...formData,
        bloodGroup: formData.bloodGroup,
        password: currentPassword,
        ...(newPassword && { newPassword }),
      }

      const response = await fetch(`/api/profiles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Redirect to profile view
      router.push(`/profile/${params.id}`)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error && !formData.name) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">safeLINK</span>
              </Link>

              <Link
                href="/"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
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
              <Link href="/scanner">Scan Another QR Code</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">safeLINK</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href={`/profile/${params.id}`}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Profile</span>
              </Link>
              <Link
                href="/"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div
            className={`text-center mb-8 transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Edit Your Profile</h1>
            <p className="text-muted-foreground">Update your emergency contact information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card
              className={`p-8 border-border transition-all duration-1000 delay-200 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="border-border focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="border-border focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="bloodGroup" className="text-foreground font-medium">
                    Blood Group
                  </Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange("bloodGroup", value)}>
                    <SelectTrigger className="border-border focus:border-primary">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card
              className={`p-8 border-border transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Emergency Contact</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact" className="text-foreground font-medium">
                  Emergency Contact Information
                </Label>
                <Textarea
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Name: John Doe&#10;Relationship: Spouse&#10;Phone: +1 (555) 987-6543&#10;Email: john@example.com"
                  className="border-border focus:border-primary transition-colors min-h-32"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Include name, relationship, phone number, and any other relevant contact information
                </p>
              </div>
            </Card>

            {/* Medical Information */}
            <Card
              className={`p-8 border-border transition-all duration-1000 delay-400 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Medical Information</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions" className="text-foreground font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Medical Conditions
                  </Label>
                  <Textarea
                    id="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                    placeholder="Diabetes, Hypertension, Heart Disease, etc."
                    className="border-border focus:border-primary transition-colors"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    List any chronic conditions, disabilities, or ongoing health issues
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-foreground font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Allergies
                  </Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    placeholder="Penicillin, Peanuts, Shellfish, etc."
                    className="border-border focus:border-primary transition-colors"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include drug allergies, food allergies, and environmental allergies
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications" className="text-foreground font-medium flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Current Medications
                  </Label>
                  <Textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => handleInputChange("medications", e.target.value)}
                    placeholder="Metformin 500mg twice daily, Lisinopril 10mg once daily, etc."
                    className="border-border focus:border-primary transition-colors"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include prescription medications, dosages, and frequency. Also include supplements if relevant.
                  </p>
                </div>
              </div>
            </Card>

            {/* Password Verification */}
            <Card
              className={`p-8 border-border transition-all duration-1000 delay-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Security Verification</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-foreground font-medium">
                    Current Password *
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="border-border focus:border-primary transition-colors"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Required to save any changes to your profile
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newPassword" className="text-foreground font-medium">
                      New Password (Optional)
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      className="text-xs"
                    >
                      {showPasswordFields ? 'Hide' : 'Change Password'}
                    </Button>
                  </div>
                  {showPasswordFields && (
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter a new password"
                      className="border-border focus:border-primary transition-colors"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave blank to keep your current password
                  </p>
                </div>
              </div>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-end transition-all duration-1000 delay-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            >
              <Button
                type="button"
                variant="outline"
                className="border-border hover:bg-muted/50 bg-transparent"
                asChild
              >
                <Link href={`/profile/${params.id}`}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-32"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Security Notice */}
          <Card
            className={`mt-8 p-4 bg-muted/50 border-border transition-all duration-1000 delay-600 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground mb-1">Security & Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Your information is encrypted and stored securely. Changes will be reflected immediately in your QR
                  code profile. Only authorized personnel with proper authentication can access sensitive medical
                  details.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
