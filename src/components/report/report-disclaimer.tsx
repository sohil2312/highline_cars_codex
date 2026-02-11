import { reportColors } from "@/lib/report-theme";

export function ReportDisclaimer() {
  return (
    <div
      style={{
        marginTop: "32px",
        padding: "16px",
        borderTop: `1px solid ${reportColors.border}`,
        fontSize: "10px",
        color: reportColors.textMuted,
        lineHeight: 1.5,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: "4px" }}>Disclaimer</p>
      <p>
        This vehicle inspection report is based on a visual and functional examination conducted at
        the time of inspection. It does not guarantee the absence of hidden defects, future
        mechanical failures, or issues not detectable through standard inspection procedures. The
        inspection does not cover components that require disassembly to examine. This report is
        provided for informational purposes only and should not be considered as a warranty or
        guarantee of vehicle condition. The inspector and Highline Cars accept no liability for any
        loss, damage, or expense arising from reliance on this report.
      </p>
    </div>
  );
}
