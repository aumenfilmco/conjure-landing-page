// Server Component
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground text-sm font-mono">
        <span>© {year} Aumen Film Co</span>
        <a
          href="https://conjurestudio.app"
          className="hover:text-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          conjurestudio.app
        </a>
      </div>
    </footer>
  )
}
