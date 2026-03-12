// src/components/sections/SocialProofSection.tsx
// Server Component
import { SOCIAL_PROOF } from '@/lib/content'

export function SocialProofSection() {
  return (
    <section className="py-24 px-6 max-w-3xl mx-auto text-center">
      <h2 className="text-foreground font-sans font-medium tracking-tight text-3xl mb-12">
        {SOCIAL_PROOF.SECTION_HEADING}
      </h2>
      {/* Placeholder until testimonial is delivered — see SOCIAL-01 */}
      <div
        className="glass-surface rounded-xl p-8 text-left"
        data-placeholder="TESTIMONIAL_REQUIRED"
      >
        {/* Layout ready for: quote, name, title, agency, result — SOCIAL-02 */}
        <blockquote className="text-muted-foreground text-base italic mb-6">
          &ldquo;Testimonial coming soon&rdquo;
        </blockquote>
        <div className="flex flex-col gap-1">
          <span className="text-foreground font-sans font-medium text-sm">Name</span>
          <span className="text-muted-foreground text-sm">Title · Agency</span>
          <span className="text-muted-foreground text-xs mt-1">Result</span>
        </div>
      </div>
    </section>
  )
}
