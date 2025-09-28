"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, Camera, Scan, Lock, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import jsQR from "jsqr"

export default function ScannerPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setHasPermission(true)
        setIsScanning(true)
        startScanning()
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setHasPermission(false)
      setError("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const startScanning = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const canvasContext = canvas.getContext('2d')
    if (!canvasContext) return

    let animationFrameId: number

    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          // Check if it's a valid safeLINK profile URL
          const scannedUrl = code.data
          if (scannedUrl.includes('/profile/')) {
            setScanResult(scannedUrl)
            setShowPasswordModal(true)
            stopCamera()
            return
          }
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame)
    }

    scanFrame()

    // Clean up after 30 seconds
    setTimeout(() => {
      cancelAnimationFrame(animationFrameId)
      if (isScanning) {
        stopCamera()
        setError("QR code scan timed out. Please try again.")
      }
    }, 30000)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(null)

    if (!scanResult) {
      setError("No QR code scanned. Please try scanning again.")
      setIsVerifying(false)
      return
    }

    try {
      // Extract profile ID from the scanned URL
      const urlParts = scanResult.split('/profile/')
      if (urlParts.length !== 2) {
        setError("Invalid QR code. Please scan a valid safeLINK QR code.")
        setIsVerifying(false)
        return
      }

      const profileId = urlParts[1]

      // Verify password with the API
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password verification failed')
      }

      // Password is correct, redirect to edit profile
      router.push(`/edit-profile/${profileId}`)
    } catch (error) {
      console.error('Password verification error:', error)
      setError(error instanceof Error ? error.message : 'Password verification failed')
      setIsVerifying(false)
    }
  }

  const closeModal = () => {
    setShowPasswordModal(false)
    setPassword("")
    setError(null)
    setScanResult(null)
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
          {/* Header */}
          <div
            className={`text-center mb-8 transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scan className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">QR Code Scanner</h1>
            <p className="text-muted-foreground">Scan a safeLINK QR code to access or edit profile information</p>
          </div>

          {/* Scanner Card */}
          <Card
            className={`p-8 border-border transition-all duration-1000 delay-200 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            {!hasPermission && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Camera Access Required</h3>
                  <p className="text-muted-foreground mb-6">
                    We need access to your camera to scan QR codes. Your privacy is protected - we only process the QR
                    code data locally.
                  </p>
                  <Button onClick={startCamera} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Camera className="w-4 h-4 mr-2" />
                    Enable Camera
                  </Button>
                </div>
              </div>
            )}

            {hasPermission === false && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Camera Access Denied</h3>
                  <p className="text-muted-foreground mb-4">
                    Please enable camera permissions in your browser settings and refresh the page.
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Refresh Page
                  </Button>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="space-y-6">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full rounded-lg bg-black"
                    style={{ aspectRatio: "4/3" }}
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-primary rounded-lg relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

                      {/* Scanning Line Animation */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-primary animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Position the QR code within the frame</p>
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="border-border hover:bg-muted/50 bg-transparent"
                  >
                    Stop Scanning
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Error</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Instructions */}
          <Card
            className={`mt-6 p-6 bg-muted/50 border-border transition-all duration-1000 delay-400 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <h3 className="font-semibold text-foreground mb-4">How to Use the Scanner</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <p>Allow camera access when prompted by your browser</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <p>Point your camera at a safeLINK QR code</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <p>Enter the profile password when prompted to access or edit information</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Enter Password
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Profile Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the profile password"
                className="border-border focus:border-primary"
                required
                disabled={isVerifying}
              />
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeModal} disabled={isVerifying}>
                Cancel
              </Button>
              <Button type="submit" disabled={isVerifying} className="bg-primary text-primary-foreground">
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Access Profile"
                )}
              </Button>
            </div>
          </form>

          {scanResult && (
            <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">QR Code detected:</p>
              <p className="break-all text-xs">{scanResult}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
