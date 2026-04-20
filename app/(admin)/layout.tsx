import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/ui/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-display text-xl font-bold text-ink hover:text-accent transition-colors"
            >
              Articles
            </Link>
            <nav className="flex items-center gap-4 text-sm text-ink/60">
              <Link
                href="/admin/dashboard"
                className="hover:text-ink transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/editor"
                className="hover:text-ink transition-colors"
              >
                New Article
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {session.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? "Admin"}
                className="w-7 h-7 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-ink/50 hidden sm:block">
              {session.user?.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {children}
      </main>
    </div>
  );
}
