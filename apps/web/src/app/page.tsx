import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { Navigation } from '@/components/navigation'
import { EmergencyCTA } from '@/components/emergency-cta'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-snake-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <Navigation />
      
      <main>
        <Hero />
        <Features />
        <EmergencyCTA />
      </main>
      
      <Footer />
    </div>
  )
}
