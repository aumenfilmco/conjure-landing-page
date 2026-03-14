// Server Component — no 'use client' directive
import { HOW_IT_WORKS } from '@/lib/content'

// ─── Inline SVG icons ────────────────────────────────────────────────────────

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)

const PersonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const SlidesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

// ─── Flow node ────────────────────────────────────────────────────────────────

function FlowNode({
  label,
  icon,
  accent = false,
}: {
  label: string
  icon?: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap ${
        accent
          ? 'bg-primary/10 border-primary/40 text-primary'
          : 'bg-card border-border text-foreground'
      }`}
    >
      {icon && <span className={accent ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>}
      {label}
    </div>
  )
}

// ─── SVG connectors ───────────────────────────────────────────────────────────

// One → Three (fan out)
function FanOut() {
  return (
    <svg viewBox="0 0 300 44" className="w-full h-11" preserveAspectRatio="none">
      <line x1="150" y1="0" x2="50"  y2="44" stroke="oklch(0.92 0.18 142 / 0.35)" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="150" y1="0" x2="150" y2="44" stroke="oklch(0.92 0.18 142 / 0.35)" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="150" y1="0" x2="250" y2="44" stroke="oklch(0.92 0.18 142 / 0.35)" strokeWidth="1" strokeDasharray="4 3" />
    </svg>
  )
}

// Three → One (fan in) — only outer two merge; center passes through
function FanIn() {
  return (
    <svg viewBox="0 0 300 44" className="w-full h-11" preserveAspectRatio="none">
      <line x1="50"  y1="0" x2="150" y2="44" stroke="oklch(0.92 0.18 142 / 0.35)" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="150" y1="0" x2="150" y2="44" stroke="oklch(0.92 0.18 142 / 0.35)" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="250" y1="0" x2="150" y2="44" stroke="oklch(0.92 0.18 142 / 0.35)" strokeWidth="1" strokeDasharray="4 3" />
    </svg>
  )
}

// Single vertical stem
function Stem() {
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 2 28" width="2" height="28">
        <line x1="1" y1="0" x2="1" y2="28" stroke="oklch(0.92 0.18 142 / 0.35)" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section className="pt-16 pb-8 px-6 max-w-5xl mx-auto">
      <h2 className="text-foreground font-sans font-medium tracking-tight text-3xl text-center mb-14">
        How it works
      </h2>

      {/* Pipeline flowchart card */}
      <div
        className="relative rounded-2xl border border-border overflow-hidden mb-8"
        style={{
          background: 'linear-gradient(160deg, oklch(0.10 0 0) 0%, oklch(0.07 0 0) 100%)',
        }}
      >
        {/* Inner green glow at bottom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-48 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at bottom, oklch(0.92 0.18 142 / 0.12) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 py-10 px-8">
          <p className="text-center text-xs font-mono text-muted-foreground tracking-widest uppercase mb-8">
            The pipeline
          </p>

          {/* Diagram container — constrained width for clean proportions */}
          <div className="max-w-xs mx-auto flex flex-col items-center">

            {/* Conjure hub */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center border border-primary/40 mb-0"
              style={{ background: 'oklch(0.18 0.10 142 / 0.8)', boxShadow: '0 0 20px oklch(0.92 0.18 142 / 0.25)' }}
            >
              <span className="text-primary font-bold text-base">✦</span>
            </div>

            <Stem />

            {/* Input */}
            <FlowNode label="Your script" icon={<FileIcon />} accent />

            {/* Fan out */}
            <FanOut />

            {/* Three extraction outputs */}
            <div className="grid grid-cols-3 w-full gap-1.5">
              <div className="flex justify-center">
                <FlowNode label="Characters" icon={<PersonIcon />} />
              </div>
              <div className="flex justify-center">
                <FlowNode label="Locations" icon={<PinIcon />} />
              </div>
              <div className="flex justify-center">
                <FlowNode label="Shot list" icon={<ListIcon />} />
              </div>
            </div>

            {/* Fan in */}
            <FanIn />

            {/* Assembly node */}
            <FlowNode label="Shot assembly" accent />

            <Stem />

            {/* Output: storyboard deck preview */}
            <div className="flex gap-2 w-full justify-center">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex-1 max-w-[72px] h-12 rounded-lg border border-border flex items-center justify-center"
                  style={{ background: 'oklch(0.12 0 0)' }}
                >
                  <SlidesIcon />
                </div>
              ))}
            </div>

            {/* Output label */}
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Google Slides deck
            </p>

          </div>
        </div>
      </div>

      {/* Text steps — supporting detail */}
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none p-0">
        {HOW_IT_WORKS.STEPS.map((step) => (
          <li
            key={step.number}
            className="glass-surface rounded-2xl p-6 flex flex-col gap-3"
          >
            <span className="font-mono text-primary text-xs tracking-widest">
              {String(step.number).padStart(2, '0')}
            </span>
            <h3 className="text-foreground font-sans font-medium text-base">
              {step.TITLE}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {step.BODY}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
