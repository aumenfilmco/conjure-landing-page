// Server Component — no 'use client' directive
import { HOW_IT_WORKS } from '@/lib/content'

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <h2 className="text-foreground font-sans font-medium tracking-tight text-3xl text-center mb-16">
        How it works
      </h2>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {HOW_IT_WORKS.STEPS.map((step) => (
          <li key={step.number} className="flex flex-col gap-4">
            <span className="font-mono text-primary text-sm tracking-widest">
              {String(step.number).padStart(2, '0')}
            </span>
            <h3 className="text-foreground font-sans font-medium text-xl">
              {step.TITLE}
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              {step.BODY}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
