'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  MapPin, 
  MessageSquare, 
  BookOpen, 
  Shield, 
  Zap,
  Users,
  Globe,
  Clock,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Snake Detection',
    description: '94.2% accurate species identification using advanced CNN models trained on WHO/KEMRI verified datasets.',
    badge: 'AI-Powered',
    color: 'snake'
  },
  {
    icon: MapPin,
    title: 'Emergency Hospital Routing',
    description: 'GPS-based routing to nearest verified hospitals with real-time antivenom availability.',
    badge: 'Real-time',
    color: 'emergency'
  },
  {
    icon: MessageSquare,
    title: 'WHO/CDC Chatbot',
    description: 'Verified first aid guidance and emergency procedures in multiple languages.',
    badge: 'Verified',
    color: 'medical'
  },
  {
    icon: BookOpen,
    title: 'Education Portal',
    description: 'Comprehensive awareness campaigns and prevention materials from official sources.',
    badge: 'Educational',
    color: 'medical'
  },
  {
    icon: Shield,
    title: 'Verified Data Sources',
    description: 'All medical information sourced from WHO, CDC, and KEMRI with proper attribution.',
    badge: 'Trusted',
    color: 'snake'
  },
  {
    icon: Zap,
    title: 'Instant Emergency Response',
    description: 'Real-time SOS alerts with automatic hospital notifications and status tracking.',
    badge: 'Emergency',
    color: 'emergency'
  }
]

const stats = [
  { icon: Users, value: '156', label: 'Active Users' },
  { icon: Globe, value: '30+', label: 'Hospitals' },
  { icon: Clock, value: '12.5min', label: 'Avg Response' },
  { icon: CheckCircle, value: '94.2%', label: 'AI Accuracy' }
]

export function Features() {
  return (
    <section className="py-20 bg-background dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="w-fit mx-auto bg-emergency-500/20 text-emergency-700 dark:text-emergency-300 border-emergency-500/30">
            <Shield className="h-3 w-3 mr-1" />
            WHO/CDC Verified
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground dark:text-white">
            Comprehensive Snakebite Response System
          </h2>
          <p className="text-xl text-muted-foreground dark:text-gray-300 max-w-3xl mx-auto">
            From AI-powered identification to emergency hospital routing, 
            SnaKTox provides end-to-end snakebite emergency response.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border border-border dark:bg-white/5 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg bg-${feature.color}-500/20`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-emergency-500/20">
                  <stat.icon className="h-6 w-6 text-emergency-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
