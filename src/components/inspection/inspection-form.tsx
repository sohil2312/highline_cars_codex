"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { defaultChecklist, workDoneOptions } from "@/lib/templates";
import { createClient } from "@/lib/supabase/client";
import { compressImage, isVideo } from "@/lib/media";
import { computeScore, getSuggestedSeverity } from "@/lib/scoring";
import type { ChecklistStatus, CostSeverity } from "@/lib/types";
import { MediaButton } from "@/components/inspection/media-button";

const statusOptions: ChecklistStatus[] = ["OK", "MINOR", "MAJOR", "NA"];

const treadDepthOptions = ["7mm+", "5-6mm", "3-4mm", "<2mm"];

const damageMapPositions: Record<string, { x: number; y: number }> = {
  "front-bumper": { x: 50, y: 12 },
  bonnet: { x: 50, y: 24 },
  roof: { x: 50, y: 48 },
  "rear-bumper": { x: 50, y: 84 },
  "door-lf": { x: 25, y: 40 },
  "door-rf": { x: 75, y: 40 },
  "door-lr": { x: 25, y: 62 },
  "door-rr": { x: 75, y: 62 },
  "lhs-quarter": { x: 20, y: 74 },
  "rhs-quarter": { x: 80, y: 74 }
};

type VehicleForm = {
  vehicle_reg_no: string;
  make: string;
  model: string;
  variant: string;
  year_of_manufacture: string;
  mileage_km: string;
  fuel_type: string;
  color: string;
  owners_count: string;
  customer_name: string;
  customer_phone: string;
  inspection_city: string;
  notes: string;
  airbags_count: string;
  abs_present: string;
};

type LegalForm = {
  insurance_type: string;
  insurance_expiry: string;
  rc_availability: string;
  rc_condition: string;
  hypothecation: string;
  fitness_valid_till: string;
  road_tax_paid: string;
  road_tax_valid_till: string;
  vin_embossing: string;
  rc_mismatch: string;
  to_be_scrapped: string;
  duplicate_key: string;
};

type MediaEntry = {
  id?: string;
  url: string;
  type: "photo" | "video";
  path?: string;
};

type ItemState = {
  status: ChecklistStatus;
  workDone: string;
  notes: string;
  costSeverity: CostSeverity;
  treadDepth?: string;
  media: MediaEntry[];
};

const initialVehicle: VehicleForm = {
  vehicle_reg_no: "",
  make: "",
  model: "",
  variant: "",
  year_of_manufacture: "",
  mileage_km: "",
  fuel_type: "",
  color: "",
  owners_count: "",
  customer_name: "",
  customer_phone: "",
  inspection_city: "",
  notes: "",
  airbags_count: "",
  abs_present: ""
};

const initialLegal: LegalForm = {
  insurance_type: "",
  insurance_expiry: "",
  rc_availability: "",
  rc_condition: "",
  hypothecation: "",
  fitness_valid_till: "",
  road_tax_paid: "",
  road_tax_valid_till: "",
  vin_embossing: "",
  rc_mismatch: "",
  to_be_scrapped: "",
  duplicate_key: ""
};

const itemMeta = defaultChecklist.flatMap((category) =>
  category.items.map((item) => ({
    ...item,
    categoryId: category.id
  }))
);

const itemMetaMap = new Map(itemMeta.map((item) => [item.id, item]));

const categoryItemIds = new Map(
  defaultChecklist.map((category) => [
    category.id,
    category.items.map((item) => item.id)
  ])
);

function createInitialItems() {
  const map: Record<string, ItemState> = {};
  itemMeta.forEach((item) => {
    map[item.id] = {
      status: "OK",
      workDone: "",
      notes: "",
      costSeverity: getSuggestedSeverity("OK", item.itemType),
      treadDepth: "",
      media: []
    };
  });
  return map;
}

function generateInspectionCode() {
  const stamp = Date.now().toString().slice(-6);
  return `HL-${stamp}`;
}

export function InspectionForm({
  initialInspectionId,
  finalizeOnLoad
}: {
  initialInspectionId?: string | null;
  finalizeOnLoad?: boolean;
}) {
  const [inspectionId, setInspectionId] = useState<string | null>(initialInspectionId ?? null);
  const [inspectionCode, setInspectionCode] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleForm>(initialVehicle);
  const [legal, setLegal] = useState<LegalForm>(initialLegal);
  const [marketValue, setMarketValue] = useState<string>("");
  const [rcFront, setRcFront] = useState<MediaEntry | null>(null);
  const [rcBack, setRcBack] = useState<MediaEntry | null>(null);
  const [items, setItems] = useState<Record<string, ItemState>>(createInitialItems);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [allowPdf, setAllowPdf] = useState(true);
  const [status, setStatus] = useState<"Draft" | "Final">("Draft");
  const [message, setMessage] = useState<string | null>(null);

  const isEditing = Boolean(inspectionId);

  useEffect(() => {
    const loadExisting = async () => {
      if (!inspectionId) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("inspections")
        .select(
          `*,
           inspection_legal(*),
           inspection_items(*, inspection_media(*))`
        )
        .eq("id", inspectionId)
        .single();

      if (error || !data) return;

      setInspectionCode(data.inspection_code ?? null);
      setStatus(data.status ?? "Draft");
      setVehicle({
        vehicle_reg_no: data.vehicle_reg_no ?? "",
        make: data.make ?? "",
        model: data.model ?? "",
        variant: data.variant ?? "",
        year_of_manufacture: data.year_of_manufacture?.toString() ?? "",
        mileage_km: data.mileage_km?.toString() ?? "",
        fuel_type: data.fuel_type ?? "",
        color: data.color ?? "",
        owners_count: data.owners_count ?? "",
        customer_name: data.customer_name ?? "",
        customer_phone: data.customer_phone ?? "",
        inspection_city: data.inspection_city ?? "",
        notes: data.notes ?? "",
        airbags_count: data.airbags_count?.toString() ?? "",
        abs_present: data.abs_present === null || data.abs_present === undefined ? "" : data.abs_present ? "yes" : "no"
      });
      setMarketValue(data.market_value?.toString() ?? "");

      if (data.rc_front_path) {
        const { data: publicData } = supabase.storage
          .from("inspection-media")
          .getPublicUrl(data.rc_front_path);
        setRcFront({
          url: publicData.publicUrl,
          type: "photo",
          path: data.rc_front_path
        });
      }

      if (data.rc_back_path) {
        const { data: publicData } = supabase.storage
          .from("inspection-media")
          .getPublicUrl(data.rc_back_path);
        setRcBack({
          url: publicData.publicUrl,
          type: "photo",
          path: data.rc_back_path
        });
      }

      const legalRow = data.inspection_legal?.[0];
      if (legalRow) {
        setLegal({
          insurance_type: legalRow.insurance_type ?? "",
          insurance_expiry: legalRow.insurance_expiry ?? "",
          rc_availability: legalRow.rc_availability ?? "",
          rc_condition: legalRow.rc_condition ?? "",
          hypothecation: legalRow.hypothecation === null || legalRow.hypothecation === undefined ? "" : legalRow.hypothecation ? "yes" : "no",
          fitness_valid_till: legalRow.fitness_valid_till ?? "",
          road_tax_paid: legalRow.road_tax_paid === null || legalRow.road_tax_paid === undefined ? "" : legalRow.road_tax_paid ? "yes" : "no",
          road_tax_valid_till: legalRow.road_tax_valid_till ?? "",
          vin_embossing: legalRow.vin_embossing ?? "",
          rc_mismatch: legalRow.rc_mismatch === null || legalRow.rc_mismatch === undefined ? "" : legalRow.rc_mismatch ? "yes" : "no",
          to_be_scrapped: legalRow.to_be_scrapped === null || legalRow.to_be_scrapped === undefined ? "" : legalRow.to_be_scrapped ? "yes" : "no",
          duplicate_key: legalRow.duplicate_key === null || legalRow.duplicate_key === undefined ? "" : legalRow.duplicate_key ? "yes" : "no"
        });
      }

      const nextItems = createInitialItems();
      for (const row of data.inspection_items ?? []) {
        const meta = itemMetaMap.get(row.item_id);
        if (!meta) continue;
        const mediaEntries: MediaEntry[] = (row.inspection_media ?? []).map((media: any) => {
          const { data: publicData } = supabase.storage
            .from("inspection-media")
            .getPublicUrl(media.storage_path);
          return {
            id: media.id,
            url: publicData.publicUrl,
            type: media.media_type,
            path: media.storage_path
          };
        });

        nextItems[row.item_id] = {
          status: (row.status as ChecklistStatus) ?? "OK",
          workDone: row.work_done ?? "",
          notes: row.notes ?? "",
          costSeverity: (row.cost_severity as CostSeverity) ?? getSuggestedSeverity("OK", meta.itemType),
          treadDepth: row.tread_depth ?? "",
          media: mediaEntries
        };
      }
      setItems(nextItems);
    };

    loadExisting();
  }, [inspectionId]);

  const checklistResults = useMemo(() => {
    return itemMeta.map((item) => ({
      categoryId: item.categoryId,
      itemId: item.id,
      itemType: item.itemType,
      status: items[item.id]?.status ?? "OK",
      costSeverity: items[item.id]?.costSeverity ?? 0
    }));
  }, [items]);

  const legalFlags = useMemo(() => {
    const fitnessExpired = legal.fitness_valid_till
      ? new Date(legal.fitness_valid_till).getTime() < Date.now()
      : false;
    const roadTaxInvalid =
      legal.road_tax_paid === "no" ||
      (legal.road_tax_valid_till
        ? new Date(legal.road_tax_valid_till).getTime() < Date.now()
        : false);

    return {
      rcMismatch: legal.rc_mismatch === "yes",
      hypothecationUnresolved: legal.hypothecation === "yes",
      fitnessExpired,
      roadTaxInvalid
    };
  }, [legal]);

  const scoreOutput = useMemo(() => {
    return computeScore({
      marketValue: Number(marketValue) || 0,
      checklist: checklistResults,
      legal: legalFlags,
      engineReplaced: items["engine-condition"]?.workDone === "Engine replaced"
    });
  }, [checklistResults, legalFlags, marketValue, items]);

  const statusCounts = useMemo(() => {
    const counts = { OK: 0, MINOR: 0, MAJOR: 0, NA: 0 };
    Object.values(items).forEach((item) => {
      counts[item.status] += 1;
    });
    return counts;
  }, [items]);

  const damageMarkers = useMemo(() => {
    return Object.entries(items)
      .filter(
        ([itemId, state]) =>
          (state.status === "MINOR" || state.status === "MAJOR") && Boolean(damageMapPositions[itemId])
      )
      .map(([itemId, state]) => ({
        id: itemId,
        status: state.status,
        ...damageMapPositions[itemId]
      }));
  }, [items]);

  const markDirty = () => {
    setMessage(null);
  };

  const updateItem = (itemId: string, updates: Partial<ItemState>) => {
    setItems((prev) => {
      const next = { ...prev };
      const current = next[itemId];
      if (!current) return prev;
      const status = updates.status ?? current.status;
      const meta = itemMetaMap.get(itemId);
      const costSeverity = updates.costSeverity ?? current.costSeverity;
      next[itemId] = {
        ...current,
        ...updates,
        status,
        costSeverity: meta ? costSeverity : current.costSeverity
      };
      return next;
    });
    markDirty();
  };

  const applyCategoryStatus = (categoryId: string, status: ChecklistStatus) => {
    if (!confirm(`Set all ${categoryId} items to ${status}?`)) return;
    const ids = categoryItemIds.get(categoryId) ?? [];
    setItems((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        const meta = itemMetaMap.get(id);
        if (!meta) return;
        next[id] = {
          ...next[id],
          status,
          costSeverity: getSuggestedSeverity(status, meta.itemType)
        };
      });
      return next;
    });
    markDirty();
  };

  const ensureInspection = useCallback(async () => {
    if (inspectionId) return inspectionId;

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const code = inspectionCode ?? generateInspectionCode();

    const payload = {
      inspection_code: code,
      status: "Draft",
      vehicle_reg_no: vehicle.vehicle_reg_no || null,
      make: vehicle.make || null,
      model: vehicle.model || null,
      variant: vehicle.variant || null,
      year_of_manufacture: vehicle.year_of_manufacture ? Number(vehicle.year_of_manufacture) : null,
      mileage_km: vehicle.mileage_km ? Number(vehicle.mileage_km) : null,
      fuel_type: vehicle.fuel_type || null,
      color: vehicle.color || null,
      owners_count: vehicle.owners_count || null,
      customer_name: vehicle.customer_name || null,
      customer_phone: vehicle.customer_phone || null,
      inspection_city: vehicle.inspection_city || null,
      notes: vehicle.notes || null,
      airbags_count: vehicle.airbags_count ? Number(vehicle.airbags_count) : null,
      abs_present: vehicle.abs_present ? vehicle.abs_present === "yes" : null,
      market_value: marketValue ? Number(marketValue) : null,
      rc_front_path: rcFront?.path ?? null,
      rc_back_path: rcBack?.path ?? null,
      health_score: scoreOutput.healthScore,
      recommendation: scoreOutput.recommendation,
      exposure_percent: scoreOutput.exposurePercent,
      total_repair_min: scoreOutput.totalRepairMin,
      total_repair_max: scoreOutput.totalRepairMax,
      created_by: authData.user?.id ?? null
    };

    const { data, error } = await supabase
      .from("inspections")
      .insert(payload)
      .select("id, inspection_code")
      .single();

    if (error || !data) {
      setMessage(error?.message ?? "Failed to create inspection");
      return null;
    }

    setInspectionId(data.id);
    setInspectionCode(data.inspection_code);
    return data.id as string;
  }, [inspectionId, inspectionCode, vehicle, marketValue, scoreOutput, rcFront?.path, rcBack?.path]);

  const saveDraft = useCallback(
    async (nextStatus: "Draft" | "Final" = "Draft") => {
      setSaving(true);
      setMessage(null);
      const supabase = createClient();

      const id = await ensureInspection();
      if (!id) {
        setSaving(false);
        return;
      }

      const payload = {
        status: nextStatus,
        vehicle_reg_no: vehicle.vehicle_reg_no || null,
        make: vehicle.make || null,
        model: vehicle.model || null,
        variant: vehicle.variant || null,
        year_of_manufacture: vehicle.year_of_manufacture ? Number(vehicle.year_of_manufacture) : null,
        mileage_km: vehicle.mileage_km ? Number(vehicle.mileage_km) : null,
        fuel_type: vehicle.fuel_type || null,
        color: vehicle.color || null,
        owners_count: vehicle.owners_count || null,
        customer_name: vehicle.customer_name || null,
        customer_phone: vehicle.customer_phone || null,
        inspection_city: vehicle.inspection_city || null,
        notes: vehicle.notes || null,
        airbags_count: vehicle.airbags_count ? Number(vehicle.airbags_count) : null,
        abs_present: vehicle.abs_present ? vehicle.abs_present === "yes" : null,
        market_value: marketValue ? Number(marketValue) : null,
        rc_front_path: rcFront?.path ?? null,
        rc_back_path: rcBack?.path ?? null,
        health_score: scoreOutput.healthScore,
        recommendation: scoreOutput.recommendation,
        exposure_percent: scoreOutput.exposurePercent,
        total_repair_min: scoreOutput.totalRepairMin,
        total_repair_max: scoreOutput.totalRepairMax
      };

      const { error: updateError } = await supabase
        .from("inspections")
        .update(payload)
        .eq("id", id);

      if (updateError) {
        setMessage(updateError.message);
        setSaving(false);
        return;
      }

      await supabase.from("inspection_legal").upsert(
        {
          inspection_id: id,
          insurance_type: legal.insurance_type || null,
          insurance_expiry: legal.insurance_expiry || null,
          rc_availability: legal.rc_availability || null,
          rc_condition: legal.rc_condition || null,
          hypothecation: legal.hypothecation ? legal.hypothecation === "yes" : null,
          fitness_valid_till: legal.fitness_valid_till || null,
          road_tax_paid: legal.road_tax_paid ? legal.road_tax_paid === "yes" : null,
          road_tax_valid_till: legal.road_tax_valid_till || null,
          vin_embossing: legal.vin_embossing || null,
          rc_mismatch: legal.rc_mismatch ? legal.rc_mismatch === "yes" : null,
          to_be_scrapped: legal.to_be_scrapped ? legal.to_be_scrapped === "yes" : null,
          duplicate_key: legal.duplicate_key ? legal.duplicate_key === "yes" : null
        },
        { onConflict: "inspection_id" }
      );

      const itemRows = itemMeta.map((item) => {
        const state = items[item.id];
        return {
          inspection_id: id,
          category_id: item.categoryId,
          item_id: item.id,
          item_label: item.label,
          item_type: item.itemType,
          status: state.status,
          work_done: state.workDone || null,
          notes: state.notes || null,
          cost_severity: state.costSeverity
        };
      });

      await supabase
        .from("inspection_items")
        .upsert(itemRows, { onConflict: "inspection_id,item_id" });

      if (nextStatus === "Final") {
        const { data: authData } = await supabase.auth.getUser();
        const { data: latest } = await supabase
          .from("inspection_revisions")
          .select("revision_number")
          .eq("inspection_id", id)
          .order("revision_number", { ascending: false })
          .limit(1);

        const nextRevision = (latest?.[0]?.revision_number ?? 0) + 1;
        await supabase.from("inspection_revisions").insert({
          inspection_id: id,
          revision_number: nextRevision,
          data: { vehicle, legal, items },
          created_by: authData.user?.id ?? null
        });
      }

      setStatus(nextStatus);
      setLastSavedAt(new Date());
      setSaving(false);
      setMessage(nextStatus === "Final" ? "Inspection finalized." : "Draft saved.");
    },
    [ensureInspection, items, legal, marketValue, scoreOutput, vehicle, rcFront?.path, rcBack?.path]
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      saveDraft("Draft");
    }, 30000);

    return () => window.clearInterval(id);
  }, [inspectionId, saveDraft]);

  useEffect(() => {
    if (finalizeOnLoad && inspectionId) {
      saveDraft("Final");
    }
  }, [finalizeOnLoad, inspectionId, saveDraft]);

  useEffect(() => {
    if (shareToken && typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/r/${shareToken}`);
    }
  }, [shareToken]);

  useEffect(() => {
    if (!shareToken) return;
    const supabase = createClient();
    supabase.from("report_shares").update({ allow_pdf: allowPdf }).eq("token", shareToken);
  }, [allowPdf, shareToken]);

  const handleUpload = async (itemId: string, files: File[]) => {
    const supabase = createClient();
    const id = await ensureInspection();
    if (!id) return;

    const meta = itemMetaMap.get(itemId);
    if (!meta) return;

    const itemState = items[itemId];
    const { data: itemRow, error: upsertError } = await supabase
      .from("inspection_items")
      .upsert(
        {
          inspection_id: id,
          category_id: meta.categoryId,
          item_id: meta.id,
          item_label: meta.label,
          item_type: meta.itemType,
          status: itemState.status,
          work_done: itemState.workDone || null,
          notes: itemState.notes || null,
          cost_severity: itemState.costSeverity
        },
        { onConflict: "inspection_id,item_id" }
      )
      .select("id")
      .single();

    if (upsertError || !itemRow) {
      setMessage(upsertError?.message ?? "Failed to save item before upload");
      return;
    }

    for (const file of files) {
      const isVid = isVideo(file);
      const processed = isVid ? file : await compressImage(file);
      const path = `${id}/${itemId}/${Date.now()}-${processed.name}`;

      const { error: uploadError } = await supabase.storage
        .from("inspection-media")
        .upload(path, processed, { upsert: true });

      if (uploadError) {
        setMessage(uploadError.message);
        continue;
      }

      const { data: publicData } = supabase.storage
        .from("inspection-media")
        .getPublicUrl(path);

      const { data: mediaRow } = await supabase
        .from("inspection_media")
        .insert({
          inspection_item_id: itemRow.id,
          media_type: isVid ? "video" : "photo",
          storage_path: path
        })
        .select("id")
        .single();

      setItems((prev) => {
        const next = { ...prev };
        next[itemId] = {
          ...prev[itemId],
          media: [
            ...prev[itemId].media,
            {
              id: mediaRow?.id,
              url: publicData.publicUrl,
              type: isVid ? "video" : "photo",
              path
            }
          ]
        };
        return next;
      });
    }
  };

  const handleRcUpload = async (side: "front" | "back", files: File[]) => {
    const file = files[0];
    if (!file) return;

    const supabase = createClient();
    const id = await ensureInspection();
    if (!id) return;

    const processed = await compressImage(file, 2000, 0.85);
    const path = `${id}/rc/${side}-${Date.now()}-${processed.name}`;

    const { error: uploadError } = await supabase.storage
      .from("inspection-media")
      .upload(path, processed, { upsert: true });

    if (uploadError) {
      setMessage(uploadError.message);
      return;
    }

    await supabase
      .from("inspections")
      .update(side === "front" ? { rc_front_path: path } : { rc_back_path: path })
      .eq("id", id);

    const { data: publicData } = supabase.storage
      .from("inspection-media")
      .getPublicUrl(path);

    if (side === "front") {
      setRcFront({ url: publicData.publicUrl, type: "photo", path });
    } else {
      setRcBack({ url: publicData.publicUrl, type: "photo", path });
    }
  };

  const fetchRtoData = async () => {
    setMessage(null);
    if (!vehicle.vehicle_reg_no) {
      setMessage("Enter registration number to fetch RTO data.");
      return;
    }

    const res = await fetch(`/api/rto?reg=${encodeURIComponent(vehicle.vehicle_reg_no)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.message ?? "RTO integration not configured.");
      return;
    }

    const data = await res.json();
    setVehicle((prev) => ({
      ...prev,
      make: data.make ?? prev.make,
      model: data.model ?? prev.model,
      variant: data.variant ?? prev.variant,
      year_of_manufacture: data.year_of_manufacture ? String(data.year_of_manufacture) : prev.year_of_manufacture,
      fuel_type: data.fuel_type ?? prev.fuel_type,
      color: data.color ?? prev.color,
      owners_count: data.owners_count ?? prev.owners_count
    }));
  };


  const createShare = async () => {
    const supabase = createClient();
    const id = await ensureInspection();
    if (!id) return;

    const token = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { error } = await supabase
      .from("report_shares")
      .insert({ inspection_id: id, token, allow_pdf: allowPdf });

    if (error) {
      setMessage(error.message);
      return;
    }

    setShareToken(token);
    setMessage("Share link generated.");
  };

  const reportLinkA = inspectionId ? `/report-a/${inspectionId}` : "#";
  const reportLinkB = inspectionId ? `/report-b/${inspectionId}` : "#";
  const pdfLink = inspectionId ? `/api/reports/${inspectionId}/pdf?type=a` : "#";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Inspection" : "New Inspection"}
          </h2>
          <p className="text-sm text-neutral-600">Status: {status}</p>
          {inspectionCode ? (
            <p className="text-xs text-neutral-500">Code: {inspectionCode}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => saveDraft("Draft")} disabled={saving}>
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button onClick={() => saveDraft("Final")} disabled={saving}>
            Finalize
          </Button>
        </div>
      </div>

      {message ? (
        <Card className="p-3 text-sm">{message}</Card>
      ) : null}

      <Tabs defaultValue="vehicle">
        <TabsList>
          <TabsTrigger value="vehicle">1. Vehicle</TabsTrigger>
          <TabsTrigger value="legal">2. Legal</TabsTrigger>
          <TabsTrigger value="checklist">3. Checklist</TabsTrigger>
          <TabsTrigger value="summary">4. Summary</TabsTrigger>
          <TabsTrigger value="reports">5. Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicle">
          <Card className="p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Registration Number</label>
                <Input
                  value={vehicle.vehicle_reg_no}
                  onChange={(event) =>
                    setVehicle((prev) => ({ ...prev, vehicle_reg_no: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Make</label>
                <Input
                  value={vehicle.make}
                  onChange={(event) => setVehicle((prev) => ({ ...prev, make: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Model</label>
                <Input
                  value={vehicle.model}
                  onChange={(event) => setVehicle((prev) => ({ ...prev, model: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Variant</label>
                <Input
                  value={vehicle.variant}
                  onChange={(event) => setVehicle((prev) => ({ ...prev, variant: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Year of Manufacturing</label>
                <Input
                  type="number"
                  value={vehicle.year_of_manufacture}
                  onChange={(event) =>
                    setVehicle((prev) => ({ ...prev, year_of_manufacture: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mileage (KM)</label>
                <Input
                  type="number"
                  value={vehicle.mileage_km}
                  onChange={(event) => setVehicle((prev) => ({ ...prev, mileage_km: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fuel Type</label>
                <Select
                  value={vehicle.fuel_type}
                  onValueChange={(value) => setVehicle((prev) => ({ ...prev, fuel_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="cng">CNG</SelectItem>
                    <SelectItem value="petrol-cng">Petrol + CNG</SelectItem>
                    <SelectItem value="ev">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <Input
                  value={vehicle.color}
                  onChange={(event) => setVehicle((prev) => ({ ...prev, color: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">No. of Owners</label>
                <Select
                  value={vehicle.owners_count}
                  onValueChange={(value) => setVehicle((prev) => ({ ...prev, owners_count: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Airbags Count</label>
                <Input
                  type="number"
                  value={vehicle.airbags_count}
                  onChange={(event) => setVehicle((prev) => ({ ...prev, airbags_count: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">ABS Present</label>
                <Select
                  value={vehicle.abs_present}
                  onValueChange={(value) => setVehicle((prev) => ({ ...prev, abs_present: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  value={vehicle.customer_name}
                  onChange={(event) =>
                    setVehicle((prev) => ({ ...prev, customer_name: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Customer Phone</label>
                <Input
                  value={vehicle.customer_phone}
                  onChange={(event) =>
                    setVehicle((prev) => ({ ...prev, customer_phone: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Inspection City</label>
                <Input
                  value={vehicle.inspection_city}
                  onChange={(event) =>
                    setVehicle((prev) => ({ ...prev, inspection_city: event.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={vehicle.notes}
                  onChange={(event) => setVehicle((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <div className="brutal-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">RC Scan / RTO Fetch</p>
                      <p className="text-xs text-neutral-600">Upload RC front & back or fetch from RTO.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={fetchRtoData}>
                      Fetch from RTO
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs text-neutral-600">RC Front</p>
                      <MediaButton
                        label="Scan Front"
                        accept="image/*"
                        capture="environment"
                        onFiles={(files) => handleRcUpload("front", files)}
                      />
                      {rcFront ? (
                        <img src={rcFront.url} alt="RC Front" className="h-32 w-full object-cover brutal-border" />
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-neutral-600">RC Back</p>
                      <MediaButton
                        label="Scan Back"
                        accept="image/*"
                        capture="environment"
                        onFiles={(files) => handleRcUpload("back", files)}
                      />
                      {rcBack ? (
                        <img src={rcBack.url} alt="RC Back" className="h-32 w-full object-cover brutal-border" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card className="p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Insurance Type</label>
                <Select
                  value={legal.insurance_type}
                  onValueChange={(value) => setLegal((prev) => ({ ...prev, insurance_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="third-party">Third Party</SelectItem>
                    <SelectItem value="nil">Nil</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Insurance Expiry</label>
                <Input
                  type="date"
                  value={legal.insurance_expiry}
                  onChange={(event) => setLegal((prev) => ({ ...prev, insurance_expiry: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">RC Availability</label>
                <Select
                  value={legal.rc_availability}
                  onValueChange={(value) => setLegal((prev) => ({ ...prev, rc_availability: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="duplicate">Duplicate</SelectItem>
                    <SelectItem value="not-available">Not available</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">RC Condition</label>
                <Select
                  value={legal.rc_condition}
                  onValueChange={(value) => setLegal((prev) => ({ ...prev, rc_condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ok">OK</SelectItem>
                    <SelectItem value="faded">Faded</SelectItem>
                    <SelectItem value="torn">Torn</SelectItem>
                    <SelectItem value="na">NA</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Hypothecation</label>
                <Select
                  value={legal.hypothecation}
                  onValueChange={(value) => setLegal((prev) => ({ ...prev, hypothecation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Fitness valid till</label>
                <Input
                  type="date"
                  value={legal.fitness_valid_till}
                  onChange={(event) => setLegal((prev) => ({ ...prev, fitness_valid_till: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Road Tax Paid</label>
                <Select
                  value={legal.road_tax_paid}
                  onValueChange={(value) => setLegal((prev) => ({ ...prev, road_tax_paid: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Road Tax Validity</label>
                <Input
                  type="date"
                  value={legal.road_tax_valid_till}
                  onChange={(event) => setLegal((prev) => ({ ...prev, road_tax_valid_till: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">VIN/Chassis embossing</label>
                <Select
                  value={legal.vin_embossing}
                  onValueChange={(value) => setLegal((prev) => ({ ...prev, vin_embossing: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ok">OK</SelectItem>
                    <SelectItem value="not-ok">Not OK</SelectItem>
                    <SelectItem value="not-checked">Not checked</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">RC mismatch</label>
                <Select
                  value={legal.rc_mismatch}
                  onValueChange={(value) => setLegal((prev) => ({ ...prev, rc_mismatch: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">To be scrapped</label>
                <Select
                  value={legal.to_be_scrapped}
                  onValueChange={(value) => setLegal((prev) => ({ ...prev, to_be_scrapped: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Duplicate Key</label>
                <Select
                  value={legal.duplicate_key}
                  onValueChange={(value) => setLegal((prev) => ({ ...prev, duplicate_key: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <div className="sticky top-0 z-10 mb-3 flex flex-wrap items-center gap-3 brutal-border bg-accentSoft p-3">
            <Badge variant="ok">OK: {statusCounts.OK}</Badge>
            <Badge variant="minor">MINOR: {statusCounts.MINOR}</Badge>
            <Badge variant="major">MAJOR: {statusCounts.MAJOR}</Badge>
            <Badge variant="na">NA: {statusCounts.NA}</Badge>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {defaultChecklist.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger>{category.title}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" type="button" onClick={() => applyCategoryStatus(category.id, "OK")}>
                        All OK
                      </Button>
                      <Button size="sm" variant="outline" type="button" onClick={() => applyCategoryStatus(category.id, "MINOR")}>
                        All Minor
                      </Button>
                      <Button size="sm" variant="outline" type="button" onClick={() => applyCategoryStatus(category.id, "MAJOR")}>
                        All Major
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {category.items.map((item) => {
                        const state = items[item.id];
                        return (
                          <div key={item.id} className="brutal-border p-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-xs text-neutral-600">{item.itemType}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Select
                                  value={state.status}
                                  onValueChange={(value) => {
                                    const status = value as ChecklistStatus;
                                    updateItem(item.id, {
                                      status,
                                      costSeverity: getSuggestedSeverity(status, item.itemType)
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-full sm:w-[120px]">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={state.workDone}
                                  onValueChange={(value) => updateItem(item.id, { workDone: value })}
                                >
                                  <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Work Done" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {workDoneOptions[item.itemType].map((opt) => (
                                      <SelectItem key={opt} value={opt}>
                                        {opt}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {item.id.startsWith("tyre-") ? (
                                  <Select
                                    value={state.treadDepth ?? ""}
                                    onValueChange={(value) => updateItem(item.id, { treadDepth: value })}
                                  >
                                    <SelectTrigger className="w-full sm:w-[140px]">
                                      <SelectValue placeholder="Tread" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {treadDepthOptions.map((depth) => (
                                        <SelectItem key={depth} value={depth}>
                                          {depth}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : null}
                              </div>
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                              <Textarea
                                placeholder="Notes"
                                value={state.notes}
                                onChange={(event) => updateItem(item.id, { notes: event.target.value })}
                              />
                              <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <MediaButton
                                    label="Camera"
                                    accept="image/*"
                                    multiple
                                    capture="environment"
                                    onFiles={(files) => handleUpload(item.id, files)}
                                  />
                                  <MediaButton
                                    label="Gallery"
                                    accept="image/*"
                                    multiple
                                    onFiles={(files) => handleUpload(item.id, files)}
                                  />
                                </div>
                                {item.allowVideo ? (
                                  <MediaButton
                                    label="Record Video"
                                    accept="video/*"
                                    capture="environment"
                                    onFiles={(files) => handleUpload(item.id, files)}
                                  />
                                ) : null}
                              </div>
                            </div>
                            {state.media.length > 0 ? (
                              <div className="mt-3 grid gap-2 md:grid-cols-3">
                                {state.media.map((media) => (
                                  <div key={media.url} className="brutal-border p-2 text-xs">
                                    {media.type === "photo" ? (
                                      <img src={media.url} alt="Upload" className="h-24 w-full object-cover brutal-border" />
                                    ) : (
                                      <video src={media.url} controls className="h-24 w-full brutal-border" />
                                    )}
                                    <p className="mt-1">{media.type.toUpperCase()}</p>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="summary">
          <Card className="p-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="brutal-border p-3">
                <p className="text-sm text-neutral-600">Health Score</p>
                <p className="text-xl font-semibold">{scoreOutput.healthScore}</p>
              </div>
              <div className="brutal-border p-3">
                <p className="text-sm text-neutral-600">Checklist Counts</p>
                <p className="text-sm">OK {statusCounts.OK} • Minor {statusCounts.MINOR} • Major {statusCounts.MAJOR} • NA {statusCounts.NA}</p>
              </div>
            </div>
            <div className="brutal-border p-3">
              <p className="text-sm text-neutral-600">Damage Map</p>
              <div className="relative mt-2 h-40 brutal-border bg-white">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                  <rect x="20" y="10" width="60" height="80" fill="none" stroke="black" strokeWidth="2" />
                  <rect x="30" y="18" width="40" height="12" fill="none" stroke="black" strokeWidth="1" />
                  <rect x="30" y="70" width="40" height="12" fill="none" stroke="black" strokeWidth="1" />
                </svg>
                {damageMarkers.map((marker) => (
                  <span
                    key={marker.id}
                    className={marker.status === "MAJOR" ? "status-major" : "status-minor"}
                    style={{
                      position: "absolute",
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                      width: "10px",
                      height: "10px",
                      borderRadius: "999px",
                      transform: "translate(-50%, -50%)",
                      border: "2px solid #000"
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="brutal-border p-3">
              <p className="text-sm text-neutral-600">Critical Flags</p>
              {scoreOutput.caps.length > 0 ? (
                <ul className="mt-2 list-disc pl-4 text-sm text-neutral-700">
                  {scoreOutput.caps.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-600">None</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Link href={reportLinkA}>
                <Button disabled={!inspectionId}>View Report A (Dealer/Bank)</Button>
              </Link>
              <Link href={reportLinkB}>
                <Button variant="outline" disabled={!inspectionId}>
                  View Report B (Customer)
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={pdfLink}>
                <Button variant="outline" disabled={!inspectionId}>Download PDF</Button>
              </Link>
              <div className="flex items-center gap-2 brutal-border p-2">
                <Switch checked={allowPdf} onCheckedChange={setAllowPdf} />
                <span className="text-xs">Allow PDF download</span>
              </div>
              <Button variant="outline" onClick={createShare} disabled={!inspectionId}>
                Share Link
              </Button>
            </div>
            {shareToken ? (
              <div className="brutal-border p-3 text-sm">
                Share URL: {shareUrl}
              </div>
            ) : null}
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 brutal-border bg-accentSoft p-3">
        <span className="text-sm text-neutral-600">
          {lastSavedAt ? `Last saved ${lastSavedAt.toLocaleTimeString()}` : "Not saved yet"}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => saveDraft("Draft")} disabled={saving}>
            Save Draft
          </Button>
          <Button onClick={() => saveDraft("Final")} disabled={saving}>
            Finalize
          </Button>
        </div>
      </div>
    </>
  );
}
