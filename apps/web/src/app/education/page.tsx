'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmergencyHeader } from '@/components/emergency-header'
import { 
  BookOpen, 
  Shield, 
  AlertTriangle, 
  Users, 
  Globe, 
  Brain,
  Heart,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Download,
  Share2,
  Languages
} from 'lucide-react'

interface EducationModule {
  id: string
  title: string
  description: string
  icon: any
  category: 'first-aid' | 'prevention' | 'species' | 'emergency'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  languages: string[]
  verified: boolean
  content: {
    sections: string[]
    keyPoints: string[]
    resources: string[]
  }
}

const educationModules: EducationModule[] = [
  {
    id: '1',
    title: 'Snakebite First Aid - WHO Guidelines',
    description: 'Essential first aid steps for snakebite emergencies based on WHO/CDC verified protocols.',
    icon: Heart,
    category: 'first-aid',
    difficulty: 'beginner',
    duration: '15 min',
    languages: ['English', 'Swahili', 'Kikuyu'],
    verified: true,
    content: {
      sections: [
        'Immediate Response',
        'What NOT to Do',
        'Transportation',
        'Hospital Care'
      ],
      keyPoints: [
        'Stay calm and call emergency services',
        'Keep the bitten area still and below heart level',
        'Remove tight clothing or jewelry',
        'Get to hospital immediately'
      ],
      resources: [
        'WHO Snakebite Guidelines 2023',
        'CDC Emergency Response Manual',
        'KEMRI Treatment Protocols'
      ]
    }
  },
  {
    id: '2',
    title: 'Snake Species Identification',
    description: 'Learn to identify common venomous snakes in Kenya and their characteristics.',
    icon: Brain,
    category: 'species',
    difficulty: 'intermediate',
    duration: '25 min',
    languages: ['English', 'Swahili'],
    verified: true,
    content: {
      sections: [
        'Venomous vs Non-venomous',
        'Common Kenyan Species',
        'Identification Features',
        'Habitat and Behavior'
      ],
      keyPoints: [
        'Black Mamba: Long, slender, black/gray',
        'Puff Adder: Thick, triangular head, brown pattern',
        'Cobra: Hood when threatened, various colors',
        'Bush Viper: Small, colorful, tree-dwelling'
      ],
      resources: [
        'KEMRI Snake Database',
        'Kenya Wildlife Service Guide',
        'WHO Snake Identification Manual'
      ]
    }
  },
  {
    id: '3',
    title: 'Prevention and Safety',
    description: 'How to prevent snakebites and stay safe in snake-prone areas.',
    icon: Shield,
    category: 'prevention',
    difficulty: 'beginner',
    duration: '20 min',
    languages: ['English', 'Swahili', 'Kikuyu'],
    verified: true,
    content: {
      sections: [
        'Outdoor Safety',
        'Home Protection',
        'Agricultural Safety',
        'Children Safety'
      ],
      keyPoints: [
        'Wear protective footwear',
        'Use a flashlight at night',
        'Keep grass short around homes',
        'Never handle snakes'
      ],
      resources: [
        'Ministry of Health Guidelines',
        'Agricultural Safety Manual',
        'Community Education Materials'
      ]
    }
  },
  {
    id: '4',
    title: 'Emergency Response Protocol',
    description: 'Complete emergency response procedures for healthcare workers and first responders.',
    icon: Zap,
    category: 'emergency',
    difficulty: 'advanced',
    duration: '35 min',
    languages: ['English'],
    verified: true,
    content: {
      sections: [
        'Initial Assessment',
        'Antivenom Administration',
        'Monitoring and Care',
        'Documentation'
      ],
      keyPoints: [
        'Assess airway, breathing, circulation',
        'Administer appropriate antivenom',
        'Monitor for allergic reactions',
        'Document all treatments'
      ],
      resources: [
        'WHO Clinical Guidelines',
        'KEMRI Treatment Protocols',
        'Emergency Medicine Manual'
      ]
    }
  }
]

const snakeSpecies = [
  {
    name: 'Black Mamba',
    scientificName: 'Dendroaspis polylepis',
    venomType: 'Neurotoxic',
    dangerLevel: 'EXTREME',
    habitat: 'Savanna, rocky areas',
    distribution: 'Eastern and Southern Kenya',
    image: '/images/black-mamba.jpg',
    description: 'Africa\'s most feared snake. Extremely fast and aggressive when threatened.'
  },
  {
    name: 'Puff Adder',
    scientificName: 'Bitis arietans',
    venomType: 'Cytotoxic',
    dangerLevel: 'HIGH',
    habitat: 'Grasslands, agricultural areas',
    distribution: 'Throughout Kenya',
    image: '/images/puff-adder.jpg',
    description: 'Responsible for most snakebites in Africa. Excellent camouflage.'
  },
  {
    name: 'Cape Cobra',
    scientificName: 'Naja nivea',
    venomType: 'Neurotoxic',
    dangerLevel: 'HIGH',
    habitat: 'Dry areas, rocky terrain',
    distribution: 'Northern Kenya',
    image: '/images/cape-cobra.jpg',
    description: 'Can spit venom up to 3 meters. Hoods when threatened.'
  },
  {
    name: 'Bush Viper',
    scientificName: 'Atheris squamigera',
    venomType: 'Hemotoxic',
    dangerLevel: 'MEDIUM',
    habitat: 'Forests, trees',
    distribution: 'Western Kenya',
    image: '/images/bush-viper.jpg',
    description: 'Small but venomous. Often found in trees and bushes.'
  }
]

export default function EducationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en')

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'first-aid', name: 'First Aid', icon: Heart },
    { id: 'prevention', name: 'Prevention', icon: Shield },
    { id: 'species', name: 'Snake Species', icon: Brain },
    { id: 'emergency', name: 'Emergency', icon: Zap }
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
    { code: 'ki', name: 'Kikuyu', flag: '🇰🇪' }
  ]

  const filteredModules = educationModules.filter(module => 
    selectedCategory === 'all' || module.category === selectedCategory
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'advanced': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-snake-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <EmergencyHeader 
        title="Education Portal"
        subtitle="WHO/CDC verified snakebite awareness, prevention, and emergency response education"
        backHref="/"
        breadcrumbs={[
          { label: 'Education Portal' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Language Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Languages className="h-5 w-5 text-blue-500" />
                <span className="text-foreground font-semibold">Select Language:</span>
              </div>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`border-border hover:bg-accent ${
                      selectedLanguage === lang.code 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'text-foreground'
                    }`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5" />
              Education Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`border-border hover:bg-accent ${
                    selectedCategory === category.id 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'text-foreground'
                  }`}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredModules.map((module) => (
            <Card key={module.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border bg-card dark:border-white/10 dark:bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <module.icon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">{module.title}</CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">{module.description}</p>
                    </div>
                  </div>
                  {module.verified && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Module Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <Badge className={`${getDifficultyColor(module.difficulty)} border-0`}>
                      {module.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Play className="h-4 w-4" />
                      <span>{module.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{module.languages.length} languages</span>
                    </div>
                  </div>

                  {/* Key Points Preview */}
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">Key Points:</h4>
                    <ul className="space-y-1">
                      {module.content.keyPoints.slice(0, 2).map((point, index) => (
                        <li key={index} className="text-muted-foreground text-sm flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Languages */}
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">Available in:</h4>
                    <div className="flex gap-2">
                      {module.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs border-border text-muted-foreground">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                    <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Snake Species Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Brain className="h-5 w-5" />
              Common Venomous Snakes in Kenya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {snakeSpecies.map((snake, index) => (
                <Card key={index} className="border-border bg-card dark:border-white/10 dark:bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-snake-500/20 to-snake-600/20 rounded-lg flex items-center justify-center">
                        <Brain className="h-8 w-8 text-snake-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-1">{snake.name}</h3>
                        <p className="text-sm text-muted-foreground italic mb-2">{snake.scientificName}</p>
                        <div className="flex gap-2 mb-3">
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            {snake.dangerLevel}
                          </Badge>
                          <Badge variant="outline" className="border-border text-muted-foreground">
                            {snake.venomType}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{snake.description}</p>
                        <div className="text-xs text-muted-foreground">
                          <div><strong>Habitat:</strong> {snake.habitat}</div>
                          <div><strong>Distribution:</strong> {snake.distribution}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card className="border-emergency-500/50 bg-emergency-500/10 dark:bg-emergency-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emergency-600 dark:text-emergency-400">
              <AlertTriangle className="h-5 w-5" />
              Quick Reference - Emergency First Aid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-foreground font-semibold mb-3">✅ DO:</h4>
                <ul className="space-y-2">
                  <li className="text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Stay calm and call emergency services
                  </li>
                  <li className="text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Keep the bitten area still and below heart level
                  </li>
                  <li className="text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Remove tight clothing or jewelry
                  </li>
                  <li className="text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Get to the nearest hospital immediately
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-foreground font-semibold mb-3">❌ DON'T:</h4>
                <ul className="space-y-2">
                  <li className="text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Cut the wound or try to suck out venom
                  </li>
                  <li className="text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Apply ice or a tourniquet
                  </li>
                  <li className="text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Drink alcohol or caffeine
                  </li>
                  <li className="text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Try to catch or kill the snake
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
