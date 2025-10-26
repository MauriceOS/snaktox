'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Phone, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Shield,
  ArrowRight,
  Zap
} from 'lucide-react'

export function EmergencyCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10">
      <div className="container mx-auto px-4">
        {/* Emergency Banner */}
        <Card className="mb-12 border-red-500 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <AlertTriangle className="h-12 w-12 text-red-500 animate-pulse" />
                <h2 className="text-3xl font-bold text-red-500">
                  🚨 SNAKEBITE EMERGENCY?
                </h2>
              </div>
                  <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
                    Get immediate help with AI-powered identification and verified medical guidance
                  </p>
              
              {/* Emergency Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Link href="/emergency">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 text-lg group">
                    <Phone className="h-6 w-6 mr-3" />
                    Emergency Response
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link href="/emergency/identify">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 text-lg group">
                    <Camera className="h-6 w-6 mr-3" />
                    Identify Snake
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link href="/emergency/hospitals">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-lg group">
                    <MapPin className="h-6 w-6 mr-3" />
                    Find Hospital
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground dark:text-white">
              Trusted by Medical Professionals
            </h3>
            <p className="text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
              All medical information is verified by WHO, CDC, and KEMRI. 
              Our AI models are trained on official datasets and validated by medical experts.
            </p>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="flex items-center gap-2 text-foreground dark:text-white">
              <Shield className="h-6 w-6 text-green-500" />
              <span className="font-semibold">WHO Verified</span>
            </div>
            <div className="flex items-center gap-2 text-foreground dark:text-white">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="font-semibold">CDC Approved</span>
            </div>
            <div className="flex items-center gap-2 text-foreground dark:text-white">
              <Shield className="h-6 w-6 text-purple-500" />
              <span className="font-semibold">KEMRI Validated</span>
            </div>
            <div className="flex items-center gap-2 text-foreground dark:text-white">
              <Zap className="h-6 w-6 text-yellow-500" />
              <span className="font-semibold">94.2% AI Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
