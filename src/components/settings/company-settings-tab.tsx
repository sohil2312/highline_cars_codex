"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CompanySettingsTab() {
  const [companyName, setCompanyName] = useState("Highline Cars");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .single();
      if (data) {
        setCompanyName(data.company_name ?? "Highline Cars");
        setLogoPath(data.logo_path);
        if (data.logo_path) {
          const { data: urlData } = supabase.storage
            .from("inspection-media")
            .getPublicUrl(data.logo_path);
          setLogoPreview(urlData.publicUrl);
        }
      }
    };
    load();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const path = `company-assets/logo-${Date.now()}.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage
      .from("inspection-media")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage(`Upload failed: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("inspection-media")
      .getPublicUrl(path);

    setLogoPath(path);
    setLogoPreview(urlData.publicUrl);
    setLoading(false);
    setMessage("Logo uploaded. Click Save to apply.");
  };

  const save = async () => {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("company_settings")
      .select("id")
      .limit(1)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("company_settings")
        .update({ company_name: companyName, logo_path: logoPath })
        .eq("id", existing.id));
    } else {
      ({ error } = await supabase
        .from("company_settings")
        .insert({ company_name: companyName, logo_path: logoPath }));
    }

    setMessage(error ? error.message : "Saved.");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Company Name</label>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company name"
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Company Logo</label>
        <p className="text-xs text-neutral-500 mb-2">Used in PDF headers and as a watermark on every page</p>
        {logoPreview && (
          <div className="mb-2 brutal-border inline-block p-2 bg-white">
            <img src={logoPreview} alt="Company logo" className="h-16 object-contain" />
          </div>
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
        {message && <p className="text-xs text-neutral-600">{message}</p>}
      </div>
    </div>
  );
}
