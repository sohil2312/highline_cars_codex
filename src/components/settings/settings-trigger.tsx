"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "./settings-modal";
import { createClient } from "@/lib/supabase/client";

export function SettingsTrigger() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", auth.user.id)
        .single();
      setIsAdmin(data?.role === "admin");
    };
    checkRole();
  }, []);

  return (
    <>
      <Button variant="outline" className="h-11 w-11 px-0" onClick={() => setOpen(true)} title="Settings">
        <Settings className="h-4 w-4" />
      </Button>
      <SettingsModal open={open} onOpenChange={setOpen} isAdmin={isAdmin} />
    </>
  );
}
