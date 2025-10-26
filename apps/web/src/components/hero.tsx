'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Shield, Zap, Users, Globe } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-medical-50 via-white to-snake-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit bg-emergency-500/20 text-emergency-700 dark:text-emergency-300 border-emergency-500/30">
                <Shield className="h-3 w-3 mr-1" />
                WHO/CDC Verified
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold text-foreground dark:text-white leading-tight">
                AI-Powered{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emergency-600 to-medical-600 dark:from-emergency-400 dark:to-medical-400">
                  Snakebite
                </span>{' '}
                Emergency Response
              </h1>
              
              <p className="text-xl text-muted-foreground dark:text-gray-300 leading-relaxed max-w-2xl">
                Save lives with instant snake species identification, emergency guidance, 
                and verified hospital routing. Built for Sub-Saharan Africa with WHO/CDC 
                verified medical protocols.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-emergency-600 hover:bg-emergency-700 text-white font-semibold py-4 px-8 group">
                <Zap className="h-5 w-5 mr-2" />
                Emergency SOS
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button size="lg" variant="outline" asChild className="py-4 px-8">
                <Link href="/emergency/identify">
                  <Shield className="h-5 w-5 mr-2" />
                  Identify Snake
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emergency-600 dark:text-emergency-400">94.2%</div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">AI Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-medical-600 dark:text-medical-400">30+</div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">Hospitals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-snake-600 dark:text-snake-400">25</div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">Snake Species</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <Card className="bg-card/50 backdrop-blur-md border border-border dark:bg-white/10 dark:border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-emergency-600 dark:bg-emergency-400 animate-pulse-emergency"></div>
                    <span className="text-sm font-medium text-foreground dark:text-white">Live Emergency Response</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-emergency-600/60 to-emergency-700/60 dark:from-emergency-400/60 dark:to-emergency-500/60 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-medical-600/60 to-medical-700/60 dark:from-medical-400/60 dark:to-medical-500/60 rounded-full w-1/2"></div>
                    <div className="h-4 bg-gradient-to-r from-snake-600/60 to-snake-700/60 dark:from-snake-400/60 dark:to-snake-500/60 rounded-full w-2/3"></div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-medical-600 dark:text-medical-400" />
                      <span className="text-sm text-muted-foreground dark:text-gray-300">156 Active Users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-snake-600 dark:text-snake-400" />
                      <span className="text-sm text-muted-foreground dark:text-gray-300">Kenya Coverage</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 h-8 w-8 bg-emergency-600 dark:bg-emergency-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 h-6 w-6 bg-medical-600 dark:bg-medical-400 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
