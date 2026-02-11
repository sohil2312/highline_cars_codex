import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getInspectionWithDetails, getShareByToken } from "@/lib/data";

export default async function SharePage({ params }: { params: { token: string } }) {
  const share = await getShareByToken(params.token, true);
  if (!share) {
    notFound();
  }

  const inspection = await getInspectionWithDetails(share.inspection_id, true);
  if (!inspection) {
    notFound();
  }

  const profile = (share as any).profile ?? "full";
  const reportUrl = `/report/${inspection.id}?token=${params.token}&profile=${profile}`;
  const pdfUrl = `/api/reports/${inspection.id}/pdf?profile=${profile}&token=${params.token}`;

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="p-4">
          <p className="text-xs text-neutral-600">Shared Inspection Report</p>
          <h1 className="text-xl font-semibold">
            {[inspection.make, inspection.model].filter(Boolean).join(" ") || "Vehicle Inspection"}
          </h1>
          <p className="text-sm text-neutral-600">
            {inspection.inspection_code ?? inspection.id.slice(0, 8)}
          </p>
        </Card>
        <Card className="p-4 flex flex-wrap gap-2">
          <Link href={reportUrl}>
            <Button>View Report</Button>
          </Link>
          {share.allow_pdf ? (
            <Link href={pdfUrl}>
              <Button variant="outline">Download PDF</Button>
            </Link>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
