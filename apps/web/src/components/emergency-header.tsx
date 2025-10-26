'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'

interface EmergencyHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backHref?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
}

export function EmergencyHeader({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backHref = '/emergency', 
  breadcrumbs = []
}: EmergencyHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-medical-100 via-purple-100 to-snake-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 border-b border-border dark:border-slate-800">
      <div className="container mx-auto px-4 py-6">
        {/* Top Navigation - Minimal Version */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link href={backHref}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            )}
            
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>

          {/* SnaKTox Logo - Minimal Version */}
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground">SnaKTox</span>
            </Link>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-muted-foreground hover:text-foreground">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator className="text-muted-foreground" />
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-foreground">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

