'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmergencyHeader } from '@/components/emergency-header'
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Clock, 
  Shield, 
  AlertTriangle,
  Search,
  Star,
  Users,
  Car
} from 'lucide-react'

interface Hospital {
  id: string
  name: string
  address: string
  city: string
  phone: string
  distance: string
  travelTime: string
  antivenomStock: 'HIGH' | 'MEDIUM' | 'LOW' | 'OUT'
  emergencyServices: boolean
  specialties: string[]
  rating: number
  coordinates: {
    lat: number
    lng: number
  }
  isOpen: boolean
  nextStockUpdate: string
}

const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'Kenyatta National Hospital',
    address: 'Hospital Road, Nairobi',
    city: 'Nairobi',
    phone: '+254-20-2726300',
    distance: '2.3 km',
    travelTime: '8 min',
    antivenomStock: 'HIGH',
    emergencyServices: true,
    specialties: ['Emergency Medicine', 'Toxicology', 'Critical Care'],
    rating: 4.8,
    coordinates: { lat: -1.3048, lng: 36.8161 },
    isOpen: true,
    nextStockUpdate: 'Updated 2 hours ago'
  },
  {
    id: '2',
    name: 'Moi Teaching and Referral Hospital',
    address: 'Nandi Road, Eldoret',
    city: 'Eldoret',
    phone: '+254-53-2033471',
    distance: '15.7 km',
    travelTime: '25 min',
    antivenomStock: 'MEDIUM',
    emergencyServices: true,
    specialties: ['Emergency Medicine', 'Surgery', 'Pediatrics'],
    rating: 4.6,
    coordinates: { lat: 0.5143, lng: 35.2698 },
    isOpen: true,
    nextStockUpdate: 'Updated 1 hour ago'
  },
  {
    id: '3',
    name: 'Coast General Hospital',
    address: 'Kisauni Road, Mombasa',
    city: 'Mombasa',
    phone: '+254-41-2312191',
    distance: '8.2 km',
    travelTime: '18 min',
    antivenomStock: 'LOW',
    emergencyServices: true,
    specialties: ['Emergency Medicine', 'Internal Medicine'],
    rating: 4.4,
    coordinates: { lat: -4.0437, lng: 39.6682 },
    isOpen: true,
    nextStockUpdate: 'Updated 30 min ago'
  },
  {
    id: '4',
    name: 'Nakuru County Hospital',
    address: 'Kenyatta Avenue, Nakuru',
    city: 'Nakuru',
    phone: '+254-51-2210000',
    distance: '12.1 km',
    travelTime: '22 min',
    antivenomStock: 'HIGH',
    emergencyServices: true,
    specialties: ['Emergency Medicine', 'Surgery'],
    rating: 4.5,
    coordinates: { lat: -0.3031, lng: 36.0800 },
    isOpen: true,
    nextStockUpdate: 'Updated 45 min ago'
  },
  {
    id: '5',
    name: 'Kisumu County Hospital',
    address: 'Kisumu-Maseno Road, Kisumu',
    city: 'Kisumu',
    phone: '+254-57-2020000',
    distance: '6.8 km',
    travelTime: '15 min',
    antivenomStock: 'OUT',
    emergencyServices: true,
    specialties: ['Emergency Medicine'],
    rating: 4.2,
    coordinates: { lat: -0.0917, lng: 34.7680 },
    isOpen: true,
    nextStockUpdate: 'Updated 1 hour ago'
  }
]

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OUT'>('all')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  useEffect(() => {
    // Simulate getting user location
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
            setIsLoadingLocation(false)
          },
          (error) => {
            console.error('Error getting location:', error)
            setIsLoadingLocation(false)
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      } else {
        setIsLoadingLocation(false)
      }
    }

    getLocation()
  }, [])

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || hospital.antivenomStock === selectedFilter
    return matchesSearch && matchesFilter
  })

  const getStockColor = (stock: string) => {
    switch (stock) {
      case 'HIGH': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'LOW': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
      case 'OUT': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const getStockIcon = (stock: string) => {
    switch (stock) {
      case 'HIGH': return <Shield className="h-4 w-4" />
      case 'MEDIUM': return <AlertTriangle className="h-4 w-4" />
      case 'LOW': return <AlertTriangle className="h-4 w-4" />
      case 'OUT': return <AlertTriangle className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-snake-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <EmergencyHeader 
        title="Find Nearest Hospital"
        subtitle="Locate hospitals with antivenom stock and emergency services near you"
        backHref="/emergency"
        breadcrumbs={[
          { label: 'Emergency Response', href: '/emergency' },
          { label: 'Find Hospital' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Location Status - Basic HTML */}
        <div className="mb-6 p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-500" />
            {isLoadingLocation ? (
              <span className="text-muted-foreground">Getting your location...</span>
            ) : userLocation ? (
              <span className="text-muted-foreground">
                Location found: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            ) : (
              <span className="text-red-500">Could not get your location. Showing all hospitals.</span>
            )}
          </div>
        </div>

        {/* Search and Filter - Basic HTML */}
        <div className="mb-6 p-4 border rounded-lg bg-card">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-foreground text-lg font-semibold">
              <Search className="h-5 w-5" />
              Search Hospitals
            </h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by hospital name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 text-sm border rounded ${
                  selectedFilter === 'all' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'text-foreground border-border hover:bg-accent'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('HIGH')}
                className={`px-3 py-1 text-sm border rounded ${
                  selectedFilter === 'HIGH' 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'text-green-400 border-green-500/50 hover:bg-green-500/10'
                }`}
              >
                High Stock
              </button>
              <button
                onClick={() => setSelectedFilter('MEDIUM')}
                className={`px-3 py-1 text-sm border rounded ${
                  selectedFilter === 'MEDIUM' 
                    ? 'bg-yellow-500 text-white border-yellow-500' 
                    : 'text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/10'
                }`}
              >
                Medium Stock
              </button>
              <button
                onClick={() => setSelectedFilter('LOW')}
                className={`px-3 py-1 text-sm border rounded ${
                  selectedFilter === 'LOW' 
                    ? 'bg-orange-500 text-white border-orange-500' 
                    : 'text-orange-400 border-orange-500/50 hover:bg-orange-500/10'
                }`}
              >
                Low Stock
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Alert - Basic HTML */}
        <div className="mb-6 p-4 border border-red-500 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
            <div>
              <h3 className="text-red-500 font-semibold">Emergency Alert</h3>
              <p className="text-muted-foreground text-sm">
                If you've been bitten by a snake, call emergency services immediately and go to the nearest hospital with antivenom stock.
              </p>
            </div>
          </div>
        </div>

        {/* Hospital List */}
        <div className="space-y-4">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border bg-card dark:border-white/10 dark:bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Hospital Info */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{hospital.name}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{hospital.address}, {hospital.city}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{hospital.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{hospital.distance} • {hospital.travelTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {hospital.isOpen ? (
                              <span className="text-green-400">Open 24/7</span>
                            ) : (
                              <span className="text-red-400">Closed</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getStockColor(hospital.antivenomStock)} border-0`}>
                        <div className="flex items-center gap-1">
                          {getStockIcon(hospital.antivenomStock)}
                          <span className="font-semibold">{hospital.antivenomStock} STOCK</span>
                        </div>
                      </Badge>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-border text-muted-foreground">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    {/* Stock Update Info */}
                    <div className="text-xs text-muted-foreground">
                      Last updated: {hospital.nextStockUpdate}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                      onClick={() => window.open(`tel:${hospital.phone}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Emergency
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => {
                        const mapsUrl = `https://maps.google.com/?q=${hospital.coordinates.lat},${hospital.coordinates.lng}`
                        window.open(mapsUrl, '_blank')
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>

                    <Button 
                      variant="outline"
                      className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
                      onClick={() => {
                        // In a real app, this would trigger ambulance dispatch
                        alert('Ambulance dispatch feature will be implemented here.')
                      }}
                    >
                      <span className="mr-2">🚑</span>
                      Call Ambulance
                    </Button>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Travel Options</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-xs border-border text-muted-foreground">
                          <Car className="h-3 w-3 mr-1" />
                          {hospital.travelTime}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs border-border text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          Walk
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredHospitals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No hospitals found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find hospitals in your area.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact Info */}
        <Card className="mt-8 border-red-500/50 bg-red-500/10 dark:bg-red-500/10">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-4">🚨 Emergency Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-800 dark:text-white">999</div>
                  <div className="text-sm text-red-700 dark:text-gray-300">Emergency Services</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-800 dark:text-white">911</div>
                  <div className="text-sm text-red-700 dark:text-gray-300">Police</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-800 dark:text-white">112</div>
                  <div className="text-sm text-red-700 dark:text-gray-300">Ambulance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
