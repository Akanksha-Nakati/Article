import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-ink hover:text-accent transition-colors"
          >
            Articles
          </Link>
          <nav className="flex items-center gap-6 text-sm text-ink/60">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-ink/10 py-8">
        <div className="max-w-3xl mx-auto px-6 text-sm text-ink/40 text-center">
          © {new Date().getFullYear()} Articles
        </div>
      </footer>
    </div>
  );
}
