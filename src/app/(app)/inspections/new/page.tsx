import { AppShell } from "@/components/app-shell";
import { InspectionForm } from "@/components/inspection/inspection-form";
import { requireUser } from "@/lib/auth";

export default async function NewInspectionPage({
  searchParams
}: {
  searchParams?: { id?: string; finalize?: string };
}) {
  const { user } = await requireUser();
  const inspectionId = searchParams?.id ?? null;
  const finalizeOnLoad = searchParams?.finalize === "1";

  return (
    <AppShell userEmail={user.email}>
      <InspectionForm initialInspectionId={inspectionId} finalizeOnLoad={finalizeOnLoad} />
    </AppShell>
  );
}
