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

  const reportA = `/report-a/${inspection.id}?token=${params.token}`;
  const reportB = `/report-b/${inspection.id}?token=${params.token}`;
  const pdfLink = `/api/reports/${inspection.id}/pdf?type=a`;

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="p-4">
          <p className="text-xs text-neutral-600">Shared Report Token</p>
          <h1 className="text-xl font-semibold">{params.token}</h1>
          <p className="text-sm">View-only access to inspection report.</p>
        </Card>
        <Card className="p-4 flex flex-wrap gap-2">
          <Link href={reportA}>
            <Button>Open Report A</Button>
          </Link>
          <Link href={reportB}>
            <Button variant="outline">Open Report B</Button>
          </Link>
          {share.allow_pdf ? (
            <Link href={pdfLink}>
              <Button variant="outline">Download PDF</Button>
            </Link>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
