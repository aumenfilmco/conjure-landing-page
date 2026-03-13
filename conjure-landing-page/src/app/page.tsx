// src/app/page.tsx
// Server Component — NO 'use client' directive
import { checkoutUrls } from '@/lib/env'
import { Header } from '@/components/sections/Header'
import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { PricingSection } from '@/components/sections/PricingSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { WaitlistSection } from '@/components/sections/WaitlistSection'
import { Footer } from '@/components/sections/Footer'
import { FadeInWrapper } from '@/components/FadeInWrapper'

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        {/* Hero — above fold, no fade-in (already visible) */}
        <HeroSection />

        {/* Content sections fade in on scroll */}
        <FadeInWrapper>
          <HowItWorksSection />
        </FadeInWrapper>

        <FeaturesSection />

        <FadeInWrapper>
          {/* PricingSection is 'use client' — checkoutUrls passed as prop from here */}
          <PricingSection checkoutUrls={checkoutUrls} />
        </FadeInWrapper>

        {/* FAQ above Waitlist — keeping FAQ near Waitlist per FAQ-02 */}
        <FadeInWrapper>
          <FAQSection />
        </FadeInWrapper>

        <FadeInWrapper>
          <WaitlistSection />
        </FadeInWrapper>
      </main>
      <Footer />
    </>
  )
}
