import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";


export default async function DashboardPage({
  searchParams
}: {
  searchParams?: { q?: string; from?: string; to?: string };
}) {
  const { supabase, user } = await requireUser();

  const q = searchParams?.q?.trim();
  const from = searchParams?.from;
  const to = searchParams?.to;

  let query = supabase
    .from("inspections")
    .select("id, inspection_code, vehicle_reg_no, make, model, created_at, health_score, status")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `vehicle_reg_no.ilike.%${q}%,model.ilike.%${q}%,make.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`
    );
  }

  if (from) {
    query = query.gte("created_at", new Date(from).toISOString());
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    query = query.lte("created_at", toDate.toISOString());
  }

  const { data: inspections } = await query;

  return (
    <AppShell userEmail={user.email}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <Link href="/inspections/new">
          <Button>New Inspection</Button>
        </Link>
      </div>

      <Card className="p-4">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input name="q" placeholder="Search reg/VIN/customer" defaultValue={q} />
          <Input name="from" type="date" defaultValue={from} />
          <Input name="to" type="date" defaultValue={to} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="outline">Filter</Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-3 md:hidden">
        {inspections && inspections.length > 0 ? (
          inspections.map((row) => (
            <Card key={row.id} className="p-4">
              <div className="flex items-center justify-between">
                <Link className="inline-flex min-h-11 items-center underline text-sm font-medium" href={`/inspections/${row.id}`}>
                  {row.inspection_code ?? row.id.slice(0, 8)}
                </Link>
                <span className="text-xs text-neutral-600">{formatDate(row.created_at)}</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">Reg No</p>
              <p className="text-base">{row.vehicle_reg_no ?? "—"}</p>
              <p className="mt-2 text-sm text-neutral-600">Make/Model</p>
              <p className="text-base">{[row.make, row.model].filter(Boolean).join(" ") || "—"}</p>
              <p className="mt-2 text-sm text-neutral-600">Health Score</p>
              <p className="text-base">{row.health_score ?? "—"}</p>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-sm text-neutral-600">No inspections yet.</Card>
        )}
      </div>

      <div className="hidden md:block">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inspection ID</TableHead>
            <TableHead>Reg No</TableHead>
            <TableHead>Make/Model</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Health</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
          {inspections && inspections.length > 0 ? (
            inspections.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link className="underline" href={`/inspections/${row.id}`}>
                    {row.inspection_code ?? row.id.slice(0, 8)}
                  </Link>
                </TableCell>
                <TableCell>{row.vehicle_reg_no ?? "—"}</TableCell>
                <TableCell>{[row.make, row.model].filter(Boolean).join(" ") || "—"}</TableCell>
                <TableCell>{formatDate(row.created_at)}</TableCell>
                <TableCell>{row.health_score ?? "—"}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-neutral-600">
                No inspections yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
