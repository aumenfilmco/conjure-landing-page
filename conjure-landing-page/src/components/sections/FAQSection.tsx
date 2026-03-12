// src/components/sections/FAQSection.tsx
// Server Component — native details/summary, no JS, fully accessible
import { FAQ } from '@/lib/content'

export function FAQSection() {
  return (
    <section className="py-24 px-6 max-w-2xl mx-auto">
      <h2 className="text-foreground font-sans font-medium tracking-tight text-3xl text-center mb-12">
        Questions
      </h2>
      <div className="flex flex-col gap-4">
        {FAQ.ITEMS.map((item, index) => (
          <details
            key={index}
            className="glass-surface rounded-xl overflow-hidden group"
          >
            <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between text-foreground font-sans font-medium text-base select-none">
              {item.question}
              <span className="text-muted-foreground text-lg ml-4 flex-shrink-0 group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="px-6 pb-5 text-muted-foreground text-base leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
