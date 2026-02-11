import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/");
  }
  return { supabase, user: data.user };
}

export async function getUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user ?? null };
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return { supabase, user, role: "admin" as const };
}
