"use client";

export function ReportActionBar({ pdfUrl }: { pdfUrl: string }) {
  return (
    <div
      className="no-print"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        gap: 8,
      }}
    >
      <button
        onClick={() => window.history.back()}
        style={{
          padding: "8px 16px",
          backgroundColor: "#fff",
          border: "2px solid #000",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "2px 2px 0 #000",
        }}
      >
        Back
      </button>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "8px 16px",
          backgroundColor: "#f97316",
          color: "#fff",
          border: "2px solid #000",
          fontWeight: 600,
          fontSize: 14,
          textDecoration: "none",
          cursor: "pointer",
          boxShadow: "2px 2px 0 #000",
        }}
      >
        Download PDF
      </a>
    </div>
  );
}
