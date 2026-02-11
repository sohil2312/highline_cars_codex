interface ReportWatermarkProps {
  logoUrl?: string | null;
}

export function ReportWatermark({ logoUrl }: ReportWatermarkProps) {
  if (!logoUrl) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(-45deg)",
        opacity: 0.06,
        pointerEvents: "none",
        zIndex: 0,
        width: "80vw",
        textAlign: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt=""
        style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
      />
    </div>
  );
}
