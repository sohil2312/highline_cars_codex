import { reportColors } from "@/lib/report-theme";
import { healthScoreToGrade, gradeColor } from "@/lib/scoring";
import type { Recommendation } from "@/lib/types";

interface ReportCoverProps {
  companyName: string;
  logoUrl?: string | null;
  inspectionCode: string;
  healthScore: number | null;
  recommendation: Recommendation | string | null;
  make: string | null;
  model: string | null;
  variant: string | null;
  year: number | null;
  mileageKm: number | null;
  ownersCount: string | null;
  fuelType: string | null;
  transmission: string | null;
  stockPhotoUrl?: string | null;
  inspectorName: string;
  inspectionDate: string;
  qrDataUrl?: string | null;
}

function RecommendationBadge({ rec }: { rec: string }) {
  const config: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    YES: { bg: "#059669", text: "#fff", label: "RECOMMENDED", icon: "\u2713" },
    CAUTION: { bg: "#d97706", text: "#fff", label: "CAUTION", icon: "\u26A0" },
    NO: { bg: "#dc2626", text: "#fff", label: "NOT RECOMMENDED", icon: "\u2717" },
  };
  const c = config[rec] ?? config.CAUTION;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 20px",
        borderRadius: "6px",
        fontWeight: 700,
        fontSize: "14px",
        backgroundColor: c.bg,
        color: c.text,
        letterSpacing: "0.5px",
      }}
    >
      <span style={{ fontSize: "16px" }}>{c.icon}</span>
      {c.label}
    </div>
  );
}

function HealthGradeDisplay({ score }: { score: number }) {
  const grade = healthScoreToGrade(score);
  const color = gradeColor(grade);

  return (
    <div style={{ textAlign: "center" }}>
      {/* Circular score display */}
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: `6px solid ${color}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
          background: `linear-gradient(135deg, ${color}10, ${color}05)`,
        }}
      >
        <div style={{ fontSize: "36px", fontWeight: 800, color, lineHeight: 1 }}>{grade}</div>
        <div style={{ fontSize: "11px", color: reportColors.textMuted, marginTop: "2px" }}>
          {score}/100
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          maxWidth: "200px",
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          overflow: "hidden",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            borderRadius: "4px",
            background: `linear-gradient(90deg, #dc2626, #f59e0b, #059669)`,
            backgroundSize: "300% 100%",
            backgroundPosition: `${100 - score}% 0`,
          }}
        />
      </div>
      <div style={{ fontSize: "10px", color: reportColors.textMuted, marginTop: "4px" }}>
        Vehicle Health Score
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "14px 8px",
        border: `1px solid ${reportColors.border}`,
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ fontSize: "18px", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontSize: "9px", color: reportColors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", fontWeight: 700, color: reportColors.text }}>
        {value}
      </div>
    </div>
  );
}

export function ReportCover({
  companyName,
  logoUrl,
  inspectionCode,
  healthScore,
  recommendation,
  make,
  model,
  variant,
  year,
  mileageKm,
  ownersCount,
  fuelType,
  transmission,
  stockPhotoUrl,
  inspectorName,
  inspectionDate,
  qrDataUrl,
}: ReportCoverProps) {
  const vehicleTitle = [year, make, model].filter(Boolean).join(" ") || "Vehicle";
  const vehicleSubtitle = variant || "";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "0",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: "6px",
          background: `linear-gradient(90deg, ${reportColors.primary}, ${reportColors.accent})`,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: `1px solid ${reportColors.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={companyName} style={{ height: "44px", objectFit: "contain" }} />
          )}
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: reportColors.primary, letterSpacing: "-0.5px" }}>
              {companyName}
            </div>
            <div style={{ fontSize: "11px", color: reportColors.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px" }}>
              Vehicle Inspection Report
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: reportColors.textMuted }}>Report ID</div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: reportColors.primary }}>{inspectionCode}</div>
          <div style={{ fontSize: "10px", color: reportColors.textMuted, marginTop: "2px" }}>{inspectionDate}</div>
        </div>
      </div>

      {/* Vehicle Title Banner */}
      <div
        style={{
          padding: "28px 24px",
          background: `linear-gradient(135deg, ${reportColors.primary} 0%, #16213e 100%)`,
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
          {vehicleTitle}
        </h1>
        {vehicleSubtitle && (
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: "6px 0 0", fontWeight: 500 }}>
            {vehicleSubtitle}
          </p>
        )}
      </div>

      {/* Vehicle Stock Photo */}
      {stockPhotoUrl && (
        <div style={{ padding: "0", textAlign: "center", backgroundColor: "#f9fafb" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stockPhotoUrl}
            alt={vehicleTitle}
            style={{
              width: "100%",
              maxHeight: "220px",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* Score + Recommendation Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          padding: "28px 24px",
          backgroundColor: reportColors.lightBg,
          borderBottom: `1px solid ${reportColors.border}`,
        }}
      >
        <div style={{ flex: "0 0 200px" }}>
          {healthScore != null ? (
            <HealthGradeDisplay score={healthScore} />
          ) : (
            <div style={{ textAlign: "center", color: reportColors.textMuted, fontSize: "14px" }}>
              Score pending
            </div>
          )}
        </div>
        <div style={{ textAlign: "center" }}>
          {recommendation && <RecommendationBadge rec={recommendation} />}
          <p style={{ fontSize: "10px", color: reportColors.textMuted, marginTop: "8px", maxWidth: "200px" }}>
            Based on {healthScore ?? 0} inspection parameters
          </p>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div style={{ padding: "20px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
          }}
        >
          <StatCard icon="\uD83D\uDCC5" label="Year" value={year?.toString() ?? "\u2014"} />
          <StatCard
            icon="\uD83D\uDCCF"
            label="Kilometres"
            value={mileageKm ? `${mileageKm.toLocaleString("en-IN")} km` : "\u2014"}
          />
          <StatCard icon="\uD83D\uDC64" label="Owners" value={ownersCount ?? "\u2014"} />
          <StatCard icon="\u26FD" label="Fuel" value={fuelType ? fuelType.charAt(0).toUpperCase() + fuelType.slice(1) : "\u2014"} />
          <StatCard icon="\u2699\uFE0F" label="Transmission" value={transmission ? transmission.toUpperCase() : "\u2014"} />
        </div>
      </div>

      {/* Footer: Inspector + QR */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "16px 24px 20px",
          borderTop: `2px solid ${reportColors.primary}`,
          backgroundColor: reportColors.lightBg,
        }}
      >
        <div>
          <div style={{ fontSize: "10px", color: reportColors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Inspected By
          </div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: reportColors.text, marginTop: "2px" }}>
            {inspectorName}
          </div>
          <div style={{ fontSize: "10px", color: reportColors.textMuted, marginTop: "2px" }}>
            {inspectionDate}
          </div>
        </div>
        {qrDataUrl && (
          <div style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Code" style={{ width: "80px", height: "80px", borderRadius: "4px" }} />
            <div style={{ fontSize: "8px", color: reportColors.textMuted, marginTop: "4px" }}>
              Scan for digital report
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
