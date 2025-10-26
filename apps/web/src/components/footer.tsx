'use client'

import Link from 'next/link'
import { Shield, Phone, Mail, MapPin, Globe } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground">SnaKTox</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI-powered snakebite emergency response system for Sub-Saharan Africa. 
              Saving lives through technology and verified medical protocols.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Globe className="h-4 w-4" />
              <span>Kenya Coverage</span>
            </div>
          </div>

          {/* Emergency Services */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Emergency Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/emergency" className="text-gray-400 hover:text-white transition-colors">
                  Emergency Response
                </Link>
              </li>
              <li>
                <Link href="/emergency/identify" className="text-gray-400 hover:text-white transition-colors">
                  Snake Identification
                </Link>
              </li>
              <li>
                <Link href="/emergency/hospitals" className="text-gray-400 hover:text-white transition-colors">
                  Find Hospital
                </Link>
              </li>
              <li>
                <Link href="/education/first-aid" className="text-gray-400 hover:text-white transition-colors">
                  First Aid Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/education" className="text-gray-400 hover:text-white transition-colors">
                  Education Portal
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About SnaKTox
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+254-20-2726300</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="h-4 w-4" />
                <span className="text-sm">emergency@snaktox.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Nairobi, Kenya</span>
              </div>
            </div>
            
            {/* Emergency Notice */}
            <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-xs font-semibold">
                🚨 For snakebite emergencies, call emergency services immediately
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2025 SnaKTox. All rights reserved. Medical data verified by WHO, CDC, and KEMRI.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
