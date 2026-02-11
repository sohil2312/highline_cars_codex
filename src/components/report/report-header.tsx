import { reportColors } from "@/lib/report-theme";

interface ReportHeaderProps {
  companyName: string;
  logoUrl?: string | null;
  inspectionCode: string;
}

export function ReportHeader({ companyName, logoUrl, inspectionCode }: ReportHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        marginBottom: "16px",
        borderBottom: `2px solid ${reportColors.primary}`,
        backgroundColor: reportColors.lightBg,
        borderRadius: "4px 4px 0 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={companyName} style={{ height: "24px", objectFit: "contain" }} />
        )}
        <span style={{ fontSize: "13px", fontWeight: 700, color: reportColors.primary }}>
          {companyName}
        </span>
        <span style={{ fontSize: "10px", color: reportColors.accent, fontWeight: 600 }}>
          Vehicle Inspection Report
        </span>
      </div>
      <span style={{ fontSize: "10px", fontWeight: 600, color: reportColors.textMuted }}>
        {inspectionCode}
      </span>
    </div>
  );
}
