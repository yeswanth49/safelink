"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, ArrowLeft, User, Phone, Lock, Heart, AlertTriangle, Pill } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    password: "",
    emergencyContact: "",
    medicalConditions: "",
    allergies: "",
    medications: "",
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const totalSteps = 3

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile')
      }

      // Redirect to QR code page with the actual profile ID
      router.push(`/qr-code/${data.profileId}`)
    } catch (error) {
      console.error('Error creating profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to create profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
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
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground">Create Your Profile</h1>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <Card className="p-8 border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Basic Information</h2>
                    <p className="text-muted-foreground">Let's start with your essential details</p>
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

                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup" className="text-foreground font-medium">
                        Blood Group
                      </Label>
                      <Select
                        value={formData.bloodGroup}
                        onValueChange={(value) => handleInputChange("bloodGroup", value)}
                      >
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

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground font-medium">
                        Security Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Create a secure password"
                        className="border-border focus:border-primary transition-colors"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Used to protect sensitive information</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Emergency Contact */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Emergency Contact</h2>
                    <p className="text-muted-foreground">Who should we contact in case of emergency?</p>
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
                </div>
              )}

              {/* Step 3: Medical Information */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Medical Information</h2>
                    <p className="text-muted-foreground">Critical information for first responders</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="medicalConditions"
                        className="text-foreground font-medium flex items-center gap-2"
                      >
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
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Creating Profile...
                      </>
                    ) : (
                      "Generate QR Code"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <Card className="mt-6 p-4 bg-muted/50 border-border">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground mb-1">Your Privacy Matters</h3>
                <p className="text-sm text-muted-foreground">
                  All information is encrypted and stored securely. Only authorized personnel with your password can
                  access sensitive medical details.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
