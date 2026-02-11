import { reportColors } from "@/lib/report-theme";
import { formatDate } from "@/lib/format";

interface LegalData {
  insurance_type?: string | null;
  insurance_expiry?: string | null;
  rc_availability?: string | null;
  rc_condition?: string | null;
  hypothecation?: boolean | null;
  fitness_valid_till?: string | null;
  road_tax_paid?: boolean | null;
  road_tax_valid_till?: string | null;
  vin_embossing?: string | null;
  rc_mismatch?: boolean | null;
  to_be_scrapped?: boolean | null;
  duplicate_key?: boolean | null;
}

interface VehicleInfo {
  vehicle_reg_no?: string | null;
  make?: string | null;
  model?: string | null;
  variant?: string | null;
  year_of_manufacture?: number | null;
  mileage_km?: number | null;
  fuel_type?: string | null;
  color?: string | null;
  owners_count?: string | null;
  vin?: string | null;
}

interface ReportLegalSummaryProps {
  legal: LegalData | null;
  vehicle: VehicleInfo;
}

function InfoRow({ label, value, flag }: { label: string; value: string; flag?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "7px 0",
        borderBottom: `1px solid #f3f4f6`,
        fontSize: "11px",
      }}
    >
      <span style={{ color: reportColors.textMuted }}>{label}</span>
      <span
        style={{
          fontWeight: 600,
          color: flag ? reportColors.danger : reportColors.text,
          maxWidth: "60%",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function FlagBadge({ label, type }: { label: string; type: "danger" | "warning" | "ok" }) {
  const colors = {
    danger: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
    warning: { bg: "#fffbeb", text: "#d97706", border: "#fed7aa" },
    ok: { bg: "#f0fdf4", text: "#059669", border: "#bbf7d0" },
  };
  const c = colors[type];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {label}
    </span>
  );
}

export function ReportLegalSummary({ legal, vehicle }: ReportLegalSummaryProps) {
  // Check for alerts
  const alerts: { label: string; type: "danger" | "warning" }[] = [];
  if (legal?.rc_mismatch) alerts.push({ label: "RC Mismatch", type: "danger" });
  if (legal?.to_be_scrapped) alerts.push({ label: "Marked for Scrap", type: "danger" });
  if (legal?.hypothecation) alerts.push({ label: "Hypothecated", type: "warning" });
  if (legal?.duplicate_key) alerts.push({ label: "Duplicate Key", type: "warning" });

  const fitnessExpired = legal?.fitness_valid_till
    ? new Date(legal.fitness_valid_till).getTime() < Date.now()
    : false;
  if (fitnessExpired) alerts.push({ label: "Fitness Expired", type: "danger" });

  const roadTaxIssue = legal?.road_tax_paid === false;
  if (roadTaxIssue) alerts.push({ label: "Road Tax Unpaid", type: "warning" });

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: `3px solid ${reportColors.accent}`,
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: reportColors.primary, margin: 0 }}>
          Vehicle &amp; Legal Summary
        </h2>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            padding: "10px 14px",
            marginBottom: "12px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
            Alerts:
          </span>
          {alerts.map((a) => (
            <FlagBadge key={a.label} label={a.label} type={a.type} />
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Vehicle Info Column */}
        <div
          style={{
            border: `1px solid ${reportColors.border}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              backgroundColor: reportColors.primary,
              color: "#fff",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Vehicle Details
          </div>
          <div style={{ padding: "4px 14px 8px" }}>
            <InfoRow label="Registration" value={vehicle.vehicle_reg_no ?? "\u2014"} />
            <InfoRow
              label="Vehicle"
              value={[vehicle.make, vehicle.model, vehicle.variant].filter(Boolean).join(" ") || "\u2014"}
            />
            <InfoRow label="Year" value={vehicle.year_of_manufacture?.toString() ?? "\u2014"} />
            <InfoRow
              label="Mileage"
              value={vehicle.mileage_km ? `${vehicle.mileage_km.toLocaleString("en-IN")} km` : "\u2014"}
            />
            <InfoRow label="Fuel Type" value={vehicle.fuel_type ? vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1) : "\u2014"} />
            <InfoRow label="Color" value={vehicle.color ?? "\u2014"} />
            <InfoRow label="Owners" value={vehicle.owners_count ?? "\u2014"} />
            {vehicle.vin && <InfoRow label="VIN / Chassis" value={vehicle.vin} />}
          </div>
        </div>

        {/* Legal Info Column */}
        <div
          style={{
            border: `1px solid ${reportColors.border}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              backgroundColor: reportColors.primary,
              color: "#fff",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Legal &amp; Compliance
          </div>
          <div style={{ padding: "4px 14px 8px" }}>
            <InfoRow
              label="Insurance"
              value={
                legal?.insurance_type
                  ? `${legal.insurance_type.charAt(0).toUpperCase() + legal.insurance_type.slice(1)}${legal.insurance_expiry ? ` (exp ${formatDate(legal.insurance_expiry)})` : ""}`
                  : "\u2014"
              }
            />
            <InfoRow label="RC Availability" value={legal?.rc_availability ?? "\u2014"} />
            <InfoRow label="RC Condition" value={legal?.rc_condition ?? "\u2014"} />
            <InfoRow
              label="Hypothecation"
              value={legal?.hypothecation ? "Yes" : "No"}
              flag={legal?.hypothecation ?? false}
            />
            <InfoRow
              label="Fitness Valid Till"
              value={legal?.fitness_valid_till ? formatDate(legal.fitness_valid_till) : "\u2014"}
              flag={fitnessExpired}
            />
            <InfoRow
              label="Road Tax"
              value={legal?.road_tax_paid ? "Paid" : legal?.road_tax_paid === false ? "Unpaid" : "\u2014"}
              flag={roadTaxIssue}
            />
            <InfoRow label="VIN Embossing" value={legal?.vin_embossing ?? "\u2014"} />
          </div>
        </div>
      </div>
    </div>
  );
}
