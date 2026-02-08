import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getInspectionWithDetails(id: string, useAdmin = false) {
  const client = useAdmin ? createAdminClient() : createClient();
  if (!client) return null;

  const { data, error } = await client
    .from("inspections")
    .select(
      `*,
       inspection_legal(*),
       inspection_items(*, inspection_media(*))`
    )
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getShareByToken(token: string, useAdmin = false) {
  const client = useAdmin ? createAdminClient() : createClient();
  if (!client) return null;

  const { data } = await client
    .from("report_shares")
    .select("*")
    .eq("token", token)
    .single();

  return data ?? null;
}
