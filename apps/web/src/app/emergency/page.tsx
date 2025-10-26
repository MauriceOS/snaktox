'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmergencyHeader } from '@/components/emergency-header'
import { EmergencyChatbot } from '@/components/emergency-chatbot'
import { 
  Phone, 
  MapPin, 
  Camera, 
  BookOpen, 
  AlertTriangle, 
  Shield,
  Navigation,
  Clock,
  Zap,
  Users,
  Globe
} from 'lucide-react'

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-snake-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <EmergencyHeader 
        title="Emergency Response Center"
        subtitle="Get immediate help for snakebite emergencies with AI-powered identification and verified medical guidance"
        showBackButton={false}
        breadcrumbs={[
          { label: 'Emergency Response' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Emergency Banner */}
        <Card className="mb-8 border-red-500 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500 animate-pulse" />
                <h2 className="text-3xl font-bold text-red-500">
                  🚨 SNAKEBITE EMERGENCY?
                </h2>
              </div>
              <p className="text-xl text-red-800 dark:text-white mb-6">
                Get immediate help with AI-powered identification and verified medical guidance
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-red-800 dark:text-white">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">94.2% AI Accuracy</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-red-800 dark:text-white">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">30+ Verified Hospitals</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-red-800 dark:text-white">
                  <Globe className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Kenya Coverage</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Call Emergency */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-red-200 bg-gradient-to-br from-red-50/10 to-red-100/5 dark:from-red-50/10 dark:to-red-100/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
                <Phone className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-xl text-foreground">Call Emergency</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Call emergency services immediately for life-threatening situations
              </p>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
                onClick={() => window.open('tel:+254-20-2726300')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            </CardContent>
          </Card>

          {/* Find Hospital */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-blue-200 bg-gradient-to-br from-blue-50/10 to-blue-100/5 dark:from-blue-50/10 dark:to-blue-100/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-xl text-foreground">Find Hospital</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Locate nearest hospital with antivenom stock and emergency services
              </p>
              <Link href="/emergency/hospitals">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                  <Navigation className="h-4 w-4 mr-2" />
                  Find Hospital
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Identify Snake */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-green-200 bg-gradient-to-br from-green-50/10 to-green-100/5 dark:from-green-50/10 dark:to-green-100/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                <Camera className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-xl text-foreground">Identify Snake</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Upload photo for AI-powered snake species identification
              </p>
              <Link href="/emergency/identify">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3">
                  <Camera className="h-4 w-4 mr-2" />
                  Identify Snake
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* First Aid Guide */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-yellow-200 bg-gradient-to-br from-yellow-50/10 to-yellow-100/5 dark:from-yellow-50/10 dark:to-yellow-100/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle className="text-xl text-foreground">First Aid Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                WHO/CDC verified immediate first aid steps and protocols
              </p>
              <Link href="/education/first-aid">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Guide
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* AI Chatbot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EmergencyChatbot />
          
          {/* Emergency Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5" />
                Emergency Response Steps
              </CardTitle>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Immediate Actions</h3>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</span>
                    <span className="text-muted-foreground">Stay calm and call emergency services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</span>
                    <span className="text-muted-foreground">Keep the bitten area still and below heart level</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</span>
                    <span className="text-muted-foreground">Remove tight clothing or jewelry near the bite</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</span>
                    <span className="text-muted-foreground">Get to the nearest hospital immediately</span>
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">What NOT to Do</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-muted-foreground">Don't cut the wound or try to suck out venom</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-muted-foreground">Don't apply ice or a tourniquet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-muted-foreground">Don't drink alcohol or caffeine</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-muted-foreground">Don't try to catch or kill the snake</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Phone className="h-5 w-5" />
              Emergency Contacts (Kenya)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Kenyatta National Hospital</h4>
                <p className="text-muted-foreground mb-2">Nairobi</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('tel:+254-20-2726300')}
                  className="border-border text-foreground hover:bg-accent"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  +254-20-2726300
                </Button>
              </div>
              
              <div className="text-center p-4 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Moi Teaching Hospital</h4>
                <p className="text-muted-foreground mb-2">Eldoret</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('tel:+254-53-2033471')}
                  className="border-border text-foreground hover:bg-accent"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  +254-53-2033471
                </Button>
              </div>
              
              <div className="text-center p-4 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Coast General Hospital</h4>
                <p className="text-muted-foreground mb-2">Mombasa</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('tel:+254-41-2312191')}
                  className="border-border text-foreground hover:bg-accent"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  +254-41-2312191
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
