// src/app/page.tsx
// Phase 1 skeleton — proves infrastructure before Phase 2 section components.
// Phase 2 replaces the contents of <main> with actual section components.

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-muted-foreground text-sm font-mono mb-4">
          conjure — foundation phase
        </p>
        <h1 className="text-foreground text-2xl font-sans font-medium">
          Infrastructure check
        </h1>
        <p className="text-muted-foreground text-base mt-2">
          Dark background ✓ · Geist font ✓ · Brand tokens ✓
        </p>
      </div>
    </main>
  )
}
