"use client";

import { useState } from "react";
import {
  silhouettes,
  zoneColor,
  zoneSolidColor,
  bodyTypeLabels,
  type DamageZone,
} from "./silhouettes";
import type { BodyType } from "@/lib/types";

interface DamageMapInteractiveProps {
  bodyType: BodyType;
  /** Map of item_id → status string (OK/MINOR/MAJOR/NA or undefined) */
  itemStatuses: Record<string, string | undefined>;
  /** Called when user taps a zone */
  onZoneTap?: (zoneId: string) => void;
}

export function DamageMapInteractive({
  bodyType,
  itemStatuses,
  onZoneTap,
}: DamageMapInteractiveProps) {
  const silhouette = silhouettes[bodyType] ?? silhouettes.sedan;
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const handleZoneClick = (zone: DamageZone) => {
    onZoneTap?.(zone.id);
  };

  return (
    <div>
      <div className="relative brutal-border bg-white overflow-hidden" style={{ aspectRatio: "100/95" }}>
        <svg
          viewBox={silhouette.viewBox}
          className="w-full h-full"
          style={{ display: "block" }}
        >
          {/* Vehicle outline */}
          <path
            d={silhouette.outline}
            fill="none"
            stroke="#666"
            strokeWidth="1.2"
          />

          {/* Detail lines */}
          {silhouette.details.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#bbb" strokeWidth="0.6" />
          ))}

          {/* Clickable zones */}
          {silhouette.zones.map((zone) => {
            const status = itemStatuses[zone.id];
            const fill = zoneColor(status);
            const isHovered = hoveredZone === zone.id;

            return (
              <g key={zone.id}>
                <path
                  d={zone.path}
                  fill={fill}
                  stroke={isHovered ? "#000" : status ? zoneSolidColor(status) : "#ccc"}
                  strokeWidth={isHovered ? "1" : "0.5"}
                  style={{ cursor: "pointer", transition: "fill 0.15s" }}
                  onClick={() => handleZoneClick(zone)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredZone && (() => {
          const zone = silhouette.zones.find((z) => z.id === hoveredZone);
          if (!zone) return null;
          const status = itemStatuses[zone.id] ?? "—";
          return (
            <div
              className="absolute pointer-events-none bg-black text-white text-xs px-2 py-1 rounded"
              style={{
                left: `${zone.cx}%`,
                top: `${zone.cy}%`,
                transform: "translate(-50%, -130%)",
                whiteSpace: "nowrap",
                zIndex: 10,
              }}
            >
              {zone.label}: {status}
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-neutral-600">
        {(["OK", "MINOR", "MAJOR", "NA"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full border border-neutral-300"
              style={{ backgroundColor: zoneSolidColor(s) }}
            />
            {s === "OK" ? "OK" : s === "MINOR" ? "Minor" : s === "MAJOR" ? "Major" : "N/A"}
          </div>
        ))}
      </div>

      {/* Body type indicator */}
      <p className="text-xs text-neutral-400 mt-1">
        {bodyTypeLabels[bodyType]} — tap a zone to scroll to its checklist item
      </p>
    </div>
  );
}
