import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdminCaller() {
  const supabase = createClient();
  const { data: auth, error } = await supabase.auth.getUser();
  if (error || !auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return auth.user;
}

export async function POST(request: NextRequest) {
  const caller = await requireAdminCaller();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const body = await request.json();
  const { email, password, full_name } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createError || !newUser.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Failed to create user" },
      { status: 400 }
    );
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .insert({
      id: newUser.user.id,
      role: "inspector",
      full_name: full_name || null
    });

  if (profileError) {
    return NextResponse.json(
      { error: `User created but profile failed: ${profileError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: newUser.user.id, email });
}

export async function PATCH(request: NextRequest) {
  const caller = await requireAdminCaller();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const body = await request.json();
  const { id, full_name } = body;

  if (!id) {
    return NextResponse.json({ error: "Inspector ID is required" }, { status: 400 });
  }

  const { error } = await adminClient
    .from("profiles")
    .update({ full_name })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const caller = await requireAdminCaller();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Inspector ID is required" }, { status: 400 });
  }

  const { error } = await adminClient.auth.admin.updateUserById(id, {
    ban_duration: "876600h"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
