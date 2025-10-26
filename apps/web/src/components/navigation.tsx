'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X, Phone, MapPin, Shield } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Snake ID', href: '/emergency/identify' },
  { name: 'Emergency', href: '/emergency' },
  { name: 'Hospitals', href: '/emergency/hospitals' },
  { name: 'Education', href: '/education' },
  { name: 'About', href: '/about' },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">SnaKTox</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Theme Switcher & Emergency Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            <Button
              variant="outline"
              size="sm"
              className="border-emergency-200 text-emergency-600 hover:bg-emergency-50 dark:border-emergency-800 dark:text-emergency-400 dark:hover:bg-emergency-900/20"
            >
              <Phone className="h-4 w-4 mr-2" />
              Emergency
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-medical-200 text-medical-600 hover:bg-medical-50 dark:border-medical-800 dark:text-medical-400 dark:hover:bg-medical-900/20"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Find Hospital
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                      pathname === item.href
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t space-y-4">
                  <div className="flex justify-center">
                    <ThemeSwitcher />
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full border-emergency-200 text-emergency-600 hover:bg-emergency-50 dark:border-emergency-800 dark:text-emergency-400 dark:hover:bg-emergency-900/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Emergency
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-medical-200 text-medical-600 hover:bg-medical-50 dark:border-medical-800 dark:text-medical-400 dark:hover:bg-medical-900/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Find Hospital
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
