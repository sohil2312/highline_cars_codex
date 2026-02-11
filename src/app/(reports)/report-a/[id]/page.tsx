import { redirect } from "next/navigation";

export default function ReportAPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token;
  const url = `/report/${params.id}?profile=full${token ? `&token=${token}` : ""}`;
  redirect(url);
}
