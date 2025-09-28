"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, Heart, QrCode } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">safeLINK</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </Link>
              <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              Side Project: Emergency Access Made Simple
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance">
              Emergency contacts
              <br />
              <span className="text-muted-foreground">when it matters</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              A simple QR code solution for sharing emergency contacts and medical info. Built to help when every second
              counts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/create-profile">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                  Create Your safeLINK
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/scanner">
                <Button variant="outline" size="lg">
                  Scan QR Code
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating QR Code Visual */}
          <div className={`mt-16 transition-all duration-1000 delay-300 ${isVisible ? "animate-float" : "opacity-0"}`}>
            <div className="w-32 h-32 mx-auto bg-card border border-border rounded-2xl flex items-center justify-center shadow-lg">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-slide-in-left">
              <div className="text-3xl font-bold text-foreground mb-2">Simple</div>
              <div className="text-muted-foreground">Setup Process</div>
            </div>
            <div className="animate-slide-in-left" style={{ animationDelay: "0.1s" }}>
              <div className="text-3xl font-bold text-foreground mb-2">Instant</div>
              <div className="text-muted-foreground">QR Code Access</div>
            </div>
            <div className="animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
              <div className="text-3xl font-bold text-foreground mb-2">Free</div>
              <div className="text-muted-foreground">To Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Built for emergencies</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature designed with one goal: getting help to you faster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Instant Access</h3>
              <p className="text-muted-foreground">
                QR codes provide immediate access to emergency contacts without unlocking phones or remembering numbers.
              </p>
            </Card>

            <Card className="p-8 border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your information is encrypted and only accessible with proper authentication when needed.
              </p>
            </Card>

            <Card className="p-8 border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Medical Info</h3>
              <p className="text-muted-foreground">
                Store critical medical information, allergies, and medications for first responders.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple. Fast. Reliable.</h2>
            <p className="text-xl text-muted-foreground">Get your safeLINK ready in minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Create Profile</h3>
              <p className="text-muted-foreground">
                Enter your emergency contacts and medical information in our secure form.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Generate QR Code</h3>
              <p className="text-muted-foreground">Get your unique QR code that links to your emergency information.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Stay Protected</h3>
              <p className="text-muted-foreground">
                Print, save, or share your QR code. Help is always just a scan away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <Card className="p-12 bg-primary text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">Ready to create your safeLINK?</h2>
            <p className="text-xl mb-8 opacity-90">A simple side project to help keep you and your loved ones safe</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create-profile">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Create Profile Now
                </Button>
              </Link>
              <Link href="/scanner">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                >
                  Scan Existing QR
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">safeLINK</span>
              </div>
              <p className="text-muted-foreground">
                Making emergency contact information accessible when it matters most.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Project</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>

            

            <div>
              <h4 className="font-semibold text-foreground mb-4">About</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Creator
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Source Code
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 safeLINK - A side project for emergency preparedness</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
