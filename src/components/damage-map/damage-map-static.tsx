import {
  silhouettes,
  zoneColor,
  zoneSolidColor,
  bodyTypeLabels,
} from "./silhouettes";
import { reportColors } from "@/lib/report-theme";
import type { BodyType } from "@/lib/types";

interface DamageItem {
  item_id: string;
  item_label: string;
  status: string;
}

interface DamageMapStaticProps {
  bodyType: BodyType;
  items: DamageItem[];
}

export function DamageMapStatic({ bodyType, items }: DamageMapStaticProps) {
  const silhouette = silhouettes[bodyType] ?? silhouettes.sedan;

  // Build lookup map
  const statusMap: Record<string, string> = {};
  for (const item of items) {
    statusMap[item.item_id] = item.status;
  }

  // Issues list (only MINOR and MAJOR)
  const issues = items.filter(
    (i) => i.status === "MINOR" || i.status === "MAJOR"
  );

  return (
    <div style={{ marginBottom: "24px" }}>
      <h2
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: reportColors.primary,
          marginBottom: "12px",
          paddingBottom: "6px",
          borderBottom: `2px solid ${reportColors.accent}`,
        }}
      >
        Visual Damage Map
      </h2>

      <div
        style={{
          border: `1px solid ${reportColors.border}`,
          borderRadius: "6px",
          backgroundColor: "#fafafa",
          padding: "8px",
        }}
      >
        <svg
          viewBox={silhouette.viewBox}
          style={{ width: "100%", maxHeight: "320px", display: "block" }}
        >
          {/* Vehicle outline */}
          <path
            d={silhouette.outline}
            fill="none"
            stroke="#999"
            strokeWidth="1.2"
          />

          {/* Detail lines */}
          {silhouette.details.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#ccc" strokeWidth="0.5" />
          ))}

          {/* Zones */}
          {silhouette.zones.map((zone) => {
            const status = statusMap[zone.id];
            const fill = zoneColor(status);
            return (
              <path
                key={zone.id}
                d={zone.path}
                fill={fill}
                stroke={status ? zoneSolidColor(status) : "#ddd"}
                strokeWidth="0.4"
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "8px",
          fontSize: "10px",
        }}
      >
        {[
          { label: "OK", color: "#1f9d55" },
          { label: "Minor Issue", color: "#f59e0b" },
          { label: "Major Issue", color: "#dc2626" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: item.color,
                display: "inline-block",
              }}
            />
            {item.label}
          </div>
        ))}
      </div>

      {/* Body type label */}
      <div
        style={{
          fontSize: "9px",
          color: reportColors.textMuted,
          marginTop: "4px",
        }}
      >
        Body type: {bodyTypeLabels[bodyType]}
      </div>

      {/* Issues summary */}
      {issues.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "10px",
            color: reportColors.textMuted,
          }}
        >
          <strong>Issues found:</strong>{" "}
          {issues.map((i) => `${i.item_label} (${i.status})`).join(" • ")}
        </div>
      )}
    </div>
  );
}
