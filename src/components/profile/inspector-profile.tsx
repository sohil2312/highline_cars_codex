"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function InspectorProfile() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", auth.user.id)
        .single();
      if (data?.full_name) {
        setName(data.full_name);
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
      .upsert({ id: auth.user.id, role: "inspector", full_name: name });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Saved.");
    }
    setLoading(false);
  };

  return (
    <Card className="p-4">
      <p className="text-sm text-neutral-600">Inspector Name (appears on reports)</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
        />
        <Button type="button" variant="outline" onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
      {message ? <p className="mt-2 text-xs text-neutral-600">{message}</p> : null}
    </Card>
  );
}
