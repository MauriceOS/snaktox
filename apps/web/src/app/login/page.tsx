'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()

  // Optional: Allow users to access login, but don't force it
  // The app works without login, so this is just for optional features
  useEffect(() => {
    // If user navigates directly to /login, show the page
    // But don't redirect - let them use the app without login
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 via-white to-snake-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            SnaKTox
          </Link>
          <p className="text-muted-foreground mt-2">Snakebite Emergency Response System</p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-2">Sign in to SnaKTox</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Login is optional. You can use all features without an account.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled
              />
            </div>

            <button
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
              disabled
            >
              Sign in (Coming Soon)
            </button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-center text-muted-foreground mb-4">
              Don't have an account? <span className="text-primary">Sign up</span> (Coming Soon)
            </p>
            <Link
              href="/"
              className="block w-full text-center text-sm text-primary hover:underline"
            >
              Continue without login →
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

