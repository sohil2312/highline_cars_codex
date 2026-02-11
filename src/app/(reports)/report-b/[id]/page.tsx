import { redirect } from "next/navigation";

export default function ReportBPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token;
  const url = `/report/${params.id}?profile=customer${token ? `&token=${token}` : ""}`;
  redirect(url);
}
