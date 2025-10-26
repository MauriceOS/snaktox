'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Shield, 
  Heart, 
  Users, 
  Globe, 
  Award, 
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Zap,
  Brain,
  BookOpen,
  AlertTriangle,
  Star,
  Target,
  Eye,
  ArrowLeft
} from 'lucide-react'

const teamMembers = [
  {
    name: 'Maurice Osoro',
    role: 'Lead Engineer & Founder',
    bio: 'Full-stack developer with expertise in AI/ML and healthcare technology. Passionate about using technology to save lives in underserved communities.',
    image: '/images/maurice.jpg',
    linkedin: 'https://linkedin.com/in/mauriceosoro',
    github: 'https://github.com/MauriceOS'
  },
  {
    name: 'Diana Kinyanjui',
    role: 'Medical Advisor & Research Lead',
    bio: 'Healthcare professional specializing in emergency medicine and snakebite treatment protocols. Expert in WHO/CDC guidelines implementation.',
    image: '/images/diana.jpg',
    linkedin: 'https://linkedin.com/in/dianakinyanjui',
    credentials: 'MD, Emergency Medicine Specialist'
  },
  {
    name: 'Nzisa Mwanzia',
    role: 'AI/ML Engineer & Data Scientist',
    bio: 'Computer vision expert specializing in medical image analysis and species identification systems. Focused on improving AI accuracy for snake detection.',
    image: '/images/nzisa.jpg',
    linkedin: 'https://linkedin.com/in/nzisamwanzia',
    github: 'https://github.com/nzisamwanzia'
  },
  {
    name: 'Eric Wambua',
    role: 'Backend Engineer & DevOps',
    bio: 'Systems architect and DevOps engineer with expertise in scalable healthcare applications and real-time emergency response systems.',
    image: '/images/eric.jpg',
    linkedin: 'https://linkedin.com/in/ericwambua',
    github: 'https://github.com/ericwambua'
  }
]

const dataSources = [
  {
    name: 'World Health Organization (WHO)',
    description: 'Global snakebite guidelines and treatment protocols',
    logo: '/logos/who.png',
    verified: true,
    lastUpdated: '2024'
  },
  {
    name: 'Centers for Disease Control (CDC)',
    description: 'Emergency response procedures and first aid guidelines',
    logo: '/logos/cdc.png',
    verified: true,
    lastUpdated: '2024'
  },
  {
    name: 'Kenya Medical Research Institute (KEMRI)',
    description: 'Local snake species database and treatment protocols',
    logo: '/logos/kemri.png',
    verified: true,
    lastUpdated: '2024'
  },
  {
    name: 'Ministry of Health Kenya',
    description: 'National healthcare guidelines and hospital network',
    logo: '/logos/moh.png',
    verified: true,
    lastUpdated: '2024'
  }
]

const statistics = [
  { icon: Users, value: '30+', label: 'Verified Hospitals', color: 'text-blue-500' },
  { icon: Brain, value: '25', label: 'Snake Species', color: 'text-green-500' },
  { icon: Zap, value: '94.2%', label: 'AI Accuracy', color: 'text-yellow-500' },
  { icon: Globe, value: '47', label: 'Counties Covered', color: 'text-purple-500' },
  { icon: Shield, value: '100%', label: 'WHO/CDC Verified', color: 'text-red-500' },
  { icon: BookOpen, value: '4', label: 'Languages', color: 'text-indigo-500' }
]

const values = [
  {
    icon: Heart,
    title: 'Lives First',
    description: 'Every decision is made with the primary goal of saving lives and reducing snakebite mortality.'
  },
  {
    icon: Shield,
    title: 'Medical Accuracy',
    description: 'All information is verified by WHO, CDC, and KEMRI to ensure medical accuracy and safety.'
  },
  {
    icon: Globe,
    title: 'Local Focus',
    description: 'Built specifically for Sub-Saharan Africa with local languages and cultural considerations.'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Developed in partnership with local communities, healthcare workers, and medical experts.'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-snake-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-medical-100 via-white to-snake-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 border-b border-border dark:border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground">SnaKTox</span>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">About SnaKTox</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered snakebite emergency response system saving lives across Sub-Saharan Africa
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-blue-500/50 bg-blue-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To reduce snakebite mortality in Sub-Saharan Africa by providing instant, AI-powered 
                snake identification, emergency guidance, and hospital routing. We believe technology 
                can bridge the gap between rural communities and life-saving medical care.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/50 bg-purple-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Eye className="h-5 w-5" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                A world where no one dies from snakebite due to lack of information or delayed 
                medical care. We envision SnaKTox as the standard emergency response system 
                for snakebite incidents across Africa.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Award className="h-5 w-5" />
              Platform Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-white/10">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Heart className="h-5 w-5" />
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white/10">
                    <value.icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-semibold mb-2">{member.role}</p>
                    {member.credentials && (
                      <Badge variant="outline" className="mb-3 border-blue-500/50 text-blue-400">
                        {member.credentials}
                      </Badge>
                    )}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{member.bio}</p>
                    <div className="flex justify-center gap-2">
                      {member.linkedin && (
                        <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-accent">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {member.github && (
                        <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-accent">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Verified Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataSources.map((source, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-white/10 rounded-lg bg-white/5">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-foreground font-semibold">{source.name}</h3>
                      {source.verified && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{source.description}</p>
                    <p className="text-muted-foreground/70 text-xs">Last updated: {source.lastUpdated}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* Contact Information */}
        <Card className="border-emergency-500/50 bg-emergency-500/10 dark:bg-emergency-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emergency-600 dark:text-emergency-400">
              <Phone className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 rounded-full bg-emergency-500/20 mx-auto w-fit mb-3">
                  <Phone className="h-6 w-6 text-emergency-500" />
                </div>
                <h3 className="text-foreground font-semibold mb-2">Emergency Hotline</h3>
                <p className="text-muted-foreground mb-2">24/7 Emergency Support</p>
                <Button 
                  className="bg-emergency-600 hover:bg-emergency-700 text-white"
                  onClick={() => window.open('tel:+254-20-2726300')}
                >
                  +254-20-2726300
                </Button>
              </div>
              
              <div className="text-center">
                <div className="p-3 rounded-full bg-emergency-500/20 mx-auto w-fit mb-3">
                  <Mail className="h-6 w-6 text-emergency-500" />
                </div>
                <h3 className="text-foreground font-semibold mb-2">General Inquiries</h3>
                <p className="text-muted-foreground mb-2">Support & Partnerships</p>
                <Button 
                  variant="outline"
                  className="border-emergency-500/50 text-emergency-600 dark:text-emergency-400 hover:bg-emergency-500/10"
                  onClick={() => window.open('mailto:info@snaktox.com')}
                >
                  info@snaktox.com
                </Button>
              </div>
              
              <div className="text-center">
                <div className="p-3 rounded-full bg-emergency-500/20 mx-auto w-fit mb-3">
                  <MapPin className="h-6 w-6 text-emergency-500" />
                </div>
                <h3 className="text-foreground font-semibold mb-2">Headquarters</h3>
                <p className="text-muted-foreground mb-2">Nairobi, Kenya</p>
                <Button 
                  variant="outline"
                  className="border-emergency-500/50 text-emergency-600 dark:text-emergency-400 hover:bg-emergency-500/10"
                  onClick={() => window.open('https://maps.google.com/?q=Nairobi,Kenya')}
                >
                  View Location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
