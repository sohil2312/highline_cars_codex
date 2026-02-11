import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/signout-button";
import { SettingsTrigger } from "@/components/settings/settings-trigger";
import { OfflineIndicator } from "@/components/offline-indicator";

export function AppShell({
  children,
  userEmail
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="brutal-border flex flex-col gap-3 bg-accentSoft px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest">Highline Cars</p>
          <h1 className="text-lg font-semibold">Inspection Console</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {userEmail ? (
            <span className="text-xs text-neutral-600 max-w-[180px] truncate">{userEmail}</span>
          ) : null}
          <SettingsTrigger />
          <Link href="/inspections/new">
            <Button size="sm">New Inspection</Button>
          </Link>
          <SignOutButton />
        </div>
        <nav className="flex w-full gap-2 overflow-x-auto text-base md:hidden">
          <Link href="/dashboard" className="brutal-border bg-white px-3 py-2 whitespace-nowrap">
            Dashboard
          </Link>
          <Link href="/inspections/new" className="brutal-border bg-white px-3 py-2 whitespace-nowrap">
            New Inspection
          </Link>
          <Link href="/dashboard" className="brutal-border bg-white px-3 py-2 whitespace-nowrap">
            Templates
          </Link>
          <Link href="/dashboard" className="brutal-border bg-white px-3 py-2 whitespace-nowrap">
            Branding
          </Link>
        </nav>
      </header>
      <OfflineIndicator />
      <div className="grid gap-4 p-4 md:grid-cols-[220px_1fr]">
        <aside className="brutal-border hidden bg-white p-4 md:block">
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
        <main className="min-w-0 space-y-4">{children}</main>
      </div>
    </div>
  );
}
