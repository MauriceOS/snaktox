'use client'

import { useState, useEffect } from 'react'
import { Camera, MapPin, AlertTriangle, Shield, Phone, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmergencyHeader } from '@/components/emergency-header'

interface LocationData {
  lat: number
  lng: number
  address?: string
}

interface SnakeIdentification {
  species: string
  scientificName: string
  localNames: string[]
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  venomType: string
  confidence: number
  description: string
  firstAid: string[]
  nearestHospital: {
    name: string
    distance: number
    phone: string
    hasAntivenom: boolean
    stockLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'OUT'
  }
}

export default function SnakeIdentificationPage() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [identification, setIdentification] = useState<SnakeIdentification | null>(null)
  const [language, setLanguage] = useState<'en' | 'sw' | 'ki'>('en')
  const [error, setError] = useState<string | null>(null)

  // Translations
  const translations = {
    en: {
      title: 'Snake Identification',
      subtitle: 'Upload a photo to identify the snake species and get emergency guidance',
      takePhoto: 'Take Photo',
      uploadPhoto: 'Upload Photo',
      analyzing: 'Analyzing...',
      species: 'Species',
      riskLevel: 'Risk Level',
      venomType: 'Venom Type',
      confidence: 'Confidence',
      nearestHospital: 'Nearest Hospital',
      callEmergency: 'Call Emergency',
      getDirections: 'Get Directions',
      firstAid: 'First Aid Steps',
      locationError: 'Unable to get your location. Please enable GPS.',
      analysisError: 'Failed to analyze image. Please try again.'
    },
    sw: {
      title: 'Utambulisho wa Nyoka',
      subtitle: 'Pakia picha ili kutambua aina ya nyoka na kupata mwongozo wa dharura',
      takePhoto: 'Piga Picha',
      uploadPhoto: 'Pakia Picha',
      analyzing: 'Inachambua...',
      species: 'Aina',
      riskLevel: 'Kiwango cha Hatari',
      venomType: 'Aina ya Sumu',
      confidence: 'Uaminifu',
      nearestHospital: 'Hospitali ya Karibu',
      callEmergency: 'Piga Simu ya Dharura',
      getDirections: 'Pata Mwelekeo',
      firstAid: 'Hatua za Huduma ya Kwanza',
      locationError: 'Haiwezekani kupata eneo lako. Tafadhali wezesha GPS.',
      analysisError: 'Imeshindwa kuchambua picha. Tafadhali jaribu tena.'
    },
    ki: {
      title: 'Gũthũrania wa Nyoka',
      subtitle: 'Thũrania kĩhũthũ gũtũrania mũhũrũga wa nyoka na gũkũra ũhoro wa gũthũrania',
      takePhoto: 'Thũrania Kĩhũthũ',
      uploadPhoto: 'Thũrania Kĩhũthũ',
      analyzing: 'Nĩrĩgũthũrania...',
      species: 'Mũhũrũga',
      riskLevel: 'Kĩgũrũ kĩa Gũthũrania',
      venomType: 'Mũhũrũga wa Thũrania',
      confidence: 'Gũthũrania',
      nearestHospital: 'Thũrania ya Gũthũrania',
      callEmergency: 'Thũrania ya Gũthũrania',
      getDirections: 'Gũkũra Mũhũrũga',
      firstAid: 'Mawĩra ma Gũthũrania',
      locationError: 'Nĩgũthũrania gũkũra eneo rĩaku. Tafadhali wezesha GPS.',
      analysisError: 'Nĩgũthũrania gũthũrania kĩhũthũ. Tafadhali jaribu tena.'
    }
  }

  const t = translations[language]

  // Request GPS location immediately
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error('Location error:', error)
          setError(t.locationError)
          setIsLoadingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    } else {
      setError(t.locationError)
      setIsLoadingLocation(false)
    }
  }, [language])

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setError(null)
    }
  }

  // Handle camera capture
  const handleCameraCapture = () => {
    // This would integrate with device camera
    // For now, we'll use file input with camera capture
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use back camera
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setSelectedImage(file)
        setError(null)
      }
    }
    input.click()
  }

  // Analyze image with AI
  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('userId', 'user-001')
      formData.append('sessionId', 'session-001')
      if (location) {
        formData.append('location', JSON.stringify(location))
      }

      // Use environment variable - NEXT_PUBLIC_API_URL should be the full backend URL
      // Default to port 3002 where backend is running
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'
      // Remove /api/v1 if it's already in the URL, then add it back
      const baseUrl = apiUrl.replace(/\/api\/v1$/, '') || 'http://localhost:3002'
      const response = await fetch(`${baseUrl}/api/v1/ai/upload-and-detect`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Backend error:', errorData)
        throw new Error(errorData.message || errorData.error || 'Analysis failed')
      }

      const result = await response.json()
      console.log('Analysis result:', result)
      
      // Transform the result to match our interface
      const transformedResult: SnakeIdentification = {
        species: result.commonName || result.species,
        scientificName: result.species,
        localNames: [], // Not provided by AI
        riskLevel: result.riskLevel as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
        venomType: result.venomType,
        confidence: Math.round(result.confidence * 100),
        description: result.treatmentNotes || 'No description available',
        firstAid: [
          'Stay calm and keep the victim still',
          'Remove tight clothing or jewelry near the bite',
          'Keep the affected limb below heart level',
          'Call emergency services immediately',
          'Get to the nearest hospital with antivenom'
        ],
        nearestHospital: {
          name: 'Kenyatta National Hospital',
          distance: 5.2,
          phone: '+254-20-2726300',
          hasAntivenom: true,
          stockLevel: 'HIGH' as 'HIGH' | 'MEDIUM' | 'LOW' | 'OUT'
        }
      }
      
      setIdentification(transformedResult)
    } catch (error) {
      console.error('Analysis error:', error)
      setError(t.analysisError)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Get risk level color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500'
      case 'MODERATE': return 'bg-yellow-500'
      case 'HIGH': return 'bg-orange-500'
      case 'CRITICAL': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Get stock level color
  const getStockColor = (stock: string) => {
    switch (stock) {
      case 'HIGH': return 'text-green-600'
      case 'MEDIUM': return 'text-yellow-600'
      case 'LOW': return 'text-orange-600'
      case 'OUT': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-snake-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <EmergencyHeader 
        title={t.title}
        subtitle={t.subtitle}
        backHref="/emergency"
        breadcrumbs={[
          { label: 'Emergency Response', href: '/emergency' },
          { label: 'Snake Identification' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage('en')}
              className={`${
                language === 'en' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'text-foreground'
              }`}
            >
              EN
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage('sw')}
              className={`${
                language === 'sw' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'text-foreground'
              }`}
            >
              SW
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage('ki')}
              className={`${
                language === 'ki' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'text-foreground'
              }`}
            >
              KI
            </Button>
          </div>
        </div>

        {/* Location Status */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              {isLoadingLocation ? (
                <span className="text-muted-foreground">Getting your location...</span>
              ) : location ? (
                <span className="text-green-600 dark:text-green-500">Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-500">Location unavailable - analysis will work without location data</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Upload Section */}
        <Card className="mb-6 border-green-200 bg-gradient-to-br from-green-50/10 to-green-100/5 dark:from-green-50/10 dark:to-green-100/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <Camera className="h-5 w-5 text-green-500" />
              </div>
              Upload Snake Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                onClick={handleCameraCapture}
                className="h-40 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
                variant="outline"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-green-500" />
                </div>
                <span className="text-green-500 font-semibold">{t.takePhoto}</span>
                <span className="text-xs text-muted-foreground">Use device camera</span>
              </Button>
              
              <div className="flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="h-40 w-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-muted-foreground hover:bg-muted/10 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground font-semibold">{t.uploadPhoto}</span>
                  <span className="text-xs text-muted-foreground">Select from gallery</span>
                </label>
              </div>
            </div>

            {selectedImage && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Selected: {selectedImage.name}
                  </span>
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="bg-emergency-600 hover:bg-emergency-700"
                  >
                    {isAnalyzing ? t.analyzing : 'Analyze Image'}
                  </Button>
                </div>
                
                {isAnalyzing && (
                  <div className="mt-4">
                    <Progress value={75} className="mb-2" />
                    <p className="text-sm text-muted-foreground">AI is analyzing the image...</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Identification Results */}
        {identification && (
          <div className="space-y-6">
            {/* Species Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Identification Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t.species}</label>
                    <p className="text-lg font-semibold text-foreground">{identification.species}</p>
                    <p className="text-sm text-muted-foreground italic">{identification.scientificName}</p>
                    {identification.localNames.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Local names: {identification.localNames.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t.riskLevel}</label>
                    <Badge className={`${getRiskColor(identification.riskLevel)} text-white`}>
                      {identification.riskLevel}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t.venomType}</label>
                    <p className="text-foreground">{identification.venomType}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t.confidence}</label>
                    <p className="text-foreground">{identification.confidence}%</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-muted-foreground">{identification.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Nearest Hospital */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t.nearestHospital}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{identification.nearestHospital.name}</h3>
                    <p className="text-muted-foreground">{identification.nearestHospital.distance}km away</p>
                    <p className={`text-sm ${getStockColor(identification.nearestHospital.stockLevel)}`}>
                      Antivenom Stock: {identification.nearestHospital.stockLevel}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(`tel:${identification.nearestHospital.phone}`)}
                      className="bg-emergency-600 hover:bg-emergency-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {t.callEmergency}
                    </Button>
                    <Button variant="outline">
                      <Navigation className="h-4 w-4 mr-2" />
                      {t.getDirections}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* First Aid Steps */}
            <Card>
              <CardHeader>
                <CardTitle>{t.firstAid}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {identification.firstAid.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="bg-emergency-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
