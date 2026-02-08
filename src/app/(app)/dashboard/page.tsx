import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";

const recommendationVariant = (value?: string | null) => {
  if (value === "YES") return "ok";
  if (value === "NO") return "major";
  if (value === "CAUTION") return "minor";
  return "outline";
};

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: { q?: string; from?: string; to?: string; rec?: string };
}) {
  const { supabase, user } = await requireUser();

  const q = searchParams?.q?.trim();
  const from = searchParams?.from;
  const to = searchParams?.to;
  const rec = searchParams?.rec;

  let query = supabase
    .from("inspections")
    .select("id, inspection_code, vehicle_reg_no, make, model, created_at, health_score, recommendation, status")
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

  if (rec) {
    query = query.eq("recommendation", rec);
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
        <form className="grid gap-3 md:grid-cols-4">
          <Input name="q" placeholder="Search reg/VIN/customer" defaultValue={q} />
          <Input name="from" type="date" defaultValue={from} />
          <Input name="to" type="date" defaultValue={to} />
          <div className="flex gap-2">
            <select
              name="rec"
              defaultValue={rec ?? ""}
              className="brutal-input w-full"
            >
              <option value="">All Recommendations</option>
              <option value="YES">YES</option>
              <option value="CAUTION">CAUTION</option>
              <option value="NO">NO</option>
            </select>
            <Button type="submit" variant="outline">Filter</Button>
          </div>
        </form>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inspection ID</TableHead>
            <TableHead>Reg No</TableHead>
            <TableHead>Make/Model</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Recommendation</TableHead>
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
                <TableCell>
                  <Badge variant={recommendationVariant(row.recommendation)}>
                    {row.recommendation ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-neutral-600">
                No inspections yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AppShell>
  );
}
