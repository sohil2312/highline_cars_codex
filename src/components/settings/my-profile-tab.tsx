"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MyProfileTab() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", auth.user.id)
        .single();
      if (data) {
        setName(data.full_name ?? "");
        setRole(data.role ?? "inspector");
      }
    };
    load();
  }, []);

  const save = async () => {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setMessage("Not signed in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", auth.user.id);

    setMessage(error ? error.message : "Saved.");
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Your Name</label>
        <p className="text-xs text-neutral-500 mb-1">This appears on inspection reports</p>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Button variant="outline" onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Role</label>
        <p className="text-sm text-neutral-600 mt-1 capitalize">{role}</p>
      </div>
      {message && <p className="text-xs text-neutral-600">{message}</p>}
    </div>
  );
}
