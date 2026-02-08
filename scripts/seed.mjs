#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(projectRoot, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    if (!line || line.trim().startsWith("#")) return;
    const idx = line.indexOf("=");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function assertEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing ${name}. Set it in .env.local or env.`);
  }
}

loadEnv();

assertEnv("NEXT_PUBLIC_SUPABASE_URL");
assertEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const INSPECTION_CODE = "HL-DEMO-001";
const SEED_EMAIL = process.env.SEED_INSPECTOR_EMAIL || "inspector@highlinecars.in";
const SEED_PASSWORD = process.env.SEED_INSPECTOR_PASSWORD || "Password123!";

const demoItems = [
  {
    category_id: "exterior",
    item_id: "front-bumper",
    item_label: "Front Bumper",
    item_type: "BODY_PANEL",
    status: "MINOR",
    work_done: "Repainted",
    notes: "Light scratch on corner",
    cost_severity: 1
  },
  {
    category_id: "engine",
    item_id: "engine-condition",
    item_label: "Engine Condition",
    item_type: "ENGINE",
    status: "OK",
    work_done: "Good",
    notes: "Healthy idle",
    cost_severity: 0
  },
  {
    category_id: "tyres",
    item_id: "tyre-lf",
    item_label: "LHS Front Tyre",
    item_type: "GENERAL",
    status: "MINOR",
    work_done: "Needs attention",
    notes: "Tread is mid-life",
    cost_severity: 2,
    tread_depth: "3-4mm"
  }
];

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.warn("Unable to list buckets:", error.message);
    return;
  }
  const exists = buckets?.some((bucket) => bucket.name === "inspection-media");
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket("inspection-media", {
      public: true
    });
    if (createError) {
      console.warn("Unable to create bucket:", createError.message);
    }
  }
}

function demoImageBuffer() {
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAPAAAACgCAYAAABtG2LDAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gIICBEMqv1o4QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAABQ0lEQVR42u3RAQ0AAAjDMO5fNHIYQKxV4QMGiJ1fGgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwBylQAAEw+S8QAAAAASUVORK5CYII=";
  return Buffer.from(base64, "base64");
}

async function main() {
  await ensureBucket();

  let userId = null;
  try {
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find((user) => user.email === SEED_EMAIL);
    if (existing) {
      userId = existing.id;
    }
  } catch (error) {
    console.warn("Unable to list users; will attempt create.");
  }

  if (!userId) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
      email_confirm: true
    });

    if (createError) {
      throw createError;
    }

    userId = created.user.id;
  }

  await supabase.from("profiles").upsert({
    id: userId,
    role: "inspector",
    full_name: "Demo Inspector"
  });

  const { data: inspection, error: inspectionError } = await supabase
    .from("inspections")
    .upsert(
      {
        inspection_code: INSPECTION_CODE,
        status: "Draft",
        vehicle_reg_no: "MH12AB1234",
        make: "Hyundai",
        model: "Creta",
        variant: "SX",
        year_of_manufacture: 2022,
        mileage_km: 42000,
        fuel_type: "petrol",
        color: "White",
        owners_count: "1",
        customer_name: "Rahul Shah",
        customer_phone: "+91 90000 11111",
        inspection_city: "Mumbai",
        notes: "Demo inspection",
        airbags_count: 6,
        abs_present: true,
        market_value: 620000,
        health_score: 78,
        recommendation: "CAUTION",
        exposure_percent: 18,
        total_repair_min: 48000,
        total_repair_max: 110000,
        created_by: userId
      },
      { onConflict: "inspection_code" }
    )
    .select("id")
    .single();

  if (inspectionError) {
    console.error("Inspection error:", inspectionError);
  }
  if (!inspection) {
    throw new Error("Failed to create inspection");
  }

  const inspectionId = inspection.id;

  await supabase.from("inspection_legal").upsert(
    {
      inspection_id: inspectionId,
      insurance_type: "comprehensive",
      insurance_expiry: "2026-09-12",
      rc_availability: "original",
      rc_condition: "ok",
      hypothecation: false,
      fitness_valid_till: "2027-01-02",
      road_tax_paid: true,
      road_tax_valid_till: "2027-01-02",
      vin_embossing: "ok",
      rc_mismatch: false,
      to_be_scrapped: false,
      duplicate_key: true
    },
    { onConflict: "inspection_id" }
  );

  const itemRows = demoItems.map((item) => ({
    inspection_id: inspectionId,
    ...item
  }));

  const { data: itemResults } = await supabase
    .from("inspection_items")
    .upsert(itemRows, { onConflict: "inspection_id,item_id" })
    .select("id,item_id");

  const frontItem = itemResults?.find((row) => row.item_id === "front-bumper");
  const engineItem = itemResults?.find((row) => row.item_id === "engine-condition");

  const buffer = demoImageBuffer();

  if (frontItem) {
    const frontPath = `${inspectionId}/front-bumper/demo.png`;
    await supabase.storage.from("inspection-media").upload(frontPath, buffer, {
      contentType: "image/png",
      upsert: true
    });
    await supabase.from("inspection_media").insert({
      inspection_item_id: frontItem.id,
      media_type: "photo",
      storage_path: frontPath,
      caption: "Front bumper minor scratch"
    });
  }

  if (engineItem) {
    const enginePath = `${inspectionId}/engine-condition/demo.png`;
    await supabase.storage.from("inspection-media").upload(enginePath, buffer, {
      contentType: "image/png",
      upsert: true
    });
    await supabase.from("inspection_media").insert({
      inspection_item_id: engineItem.id,
      media_type: "photo",
      storage_path: enginePath,
      caption: "Engine bay overview"
    });
  }

  const token = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await supabase
    .from("report_shares")
    .upsert({ inspection_id: inspectionId, token, allow_pdf: true }, { onConflict: "token" });

  console.log("Seed complete.");
  console.log("Inspector:", SEED_EMAIL, "/", SEED_PASSWORD);
  console.log("Inspection ID:", inspectionId);
  console.log("Share token:", token);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
