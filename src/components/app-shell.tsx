import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/signout-button";

export function AppShell({
  children,
  userEmail
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="brutal-border flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest">Highline Cars</p>
          <h1 className="text-lg font-semibold">Inspection Console</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {userEmail ? (
            <span className="text-xs text-neutral-600">{userEmail}</span>
          ) : null}
          <Link href="/inspections/new">
            <Button size="sm">New Inspection</Button>
          </Link>
          <SignOutButton />
        </div>
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-[220px_1fr]">
        <aside className="brutal-border p-4">
          <nav className="space-y-2 text-sm">
            <Link href="/dashboard" className="block underline">
              Dashboard
            </Link>
            <Link href="/inspections/new" className="block underline">
              New Inspection
            </Link>
            <Link href="/dashboard" className="block underline">
              Templates
            </Link>
            <Link href="/dashboard" className="block underline">
              Branding
            </Link>
          </nav>
        </aside>
        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}
