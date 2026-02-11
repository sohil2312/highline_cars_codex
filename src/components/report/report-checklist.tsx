import { reportColors } from "@/lib/report-theme";
import { deriveItemScore, categoryAggregateScore, healthScoreToGrade, gradeColor } from "@/lib/scoring";
import { defaultChecklist } from "@/lib/templates";
import type { ChecklistStatus, CostSeverity } from "@/lib/types";

interface ItemData {
  item_id: string;
  item_label: string;
  category_id: string;
  status: string;
  work_done: string | null;
  notes: string | null;
  cost_severity: number | null;
  tread_depth: string | null;
  inspection_media?: Array<{
    id: string;
    media_type: string;
    storage_path: string;
  }>;
}

interface ReportChecklistProps {
  items: ItemData[];
  mediaUrlMap: Record<string, string>;
  videoQrMap?: Record<string, string>;
  hideNotes?: boolean;
  hideCosts?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  OK: { bg: "#059669", text: "#fff", label: "OK" },
  MINOR: { bg: "#d97706", text: "#fff", label: "MINOR" },
  MAJOR: { bg: "#dc2626", text: "#fff", label: "MAJOR" },
  NA: { bg: "#9ca3af", text: "#fff", label: "N/A" },
};

function CategorySummaryBar({ ok, minor, major, na }: { ok: number; minor: number; major: number; na: number }) {
  const total = ok + minor + major + na;
  if (total === 0) return null;
  return (
    <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", width: "100%" }}>
      {ok > 0 && <div style={{ width: `${(ok / total) * 100}%`, backgroundColor: "#059669" }} />}
      {minor > 0 && <div style={{ width: `${(minor / total) * 100}%`, backgroundColor: "#d97706" }} />}
      {major > 0 && <div style={{ width: `${(major / total) * 100}%`, backgroundColor: "#dc2626" }} />}
      {na > 0 && <div style={{ width: `${(na / total) * 100}%`, backgroundColor: "#d1d5db" }} />}
    </div>
  );
}

export function ReportChecklist({ items, mediaUrlMap, videoQrMap, hideNotes, hideCosts }: ReportChecklistProps) {
  // Overall summary
  const overallCounts = { OK: 0, MINOR: 0, MAJOR: 0, NA: 0 };
  items.forEach((i) => {
    if (i.status in overallCounts) overallCounts[i.status as keyof typeof overallCounts]++;
  });
  const totalItems = items.length;

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          paddingBottom: "8px",
          borderBottom: `3px solid ${reportColors.accent}`,
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: reportColors.primary, margin: 0 }}>
          Inspection Checklist
        </h2>
        <div style={{ display: "flex", gap: "12px", fontSize: "11px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "#059669", display: "inline-block" }} />
            OK ({overallCounts.OK})
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "#d97706", display: "inline-block" }} />
            Minor ({overallCounts.MINOR})
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "#dc2626", display: "inline-block" }} />
            Major ({overallCounts.MAJOR})
          </span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div style={{ marginBottom: "20px" }}>
        <CategorySummaryBar
          ok={overallCounts.OK}
          minor={overallCounts.MINOR}
          major={overallCounts.MAJOR}
          na={overallCounts.NA}
        />
        <div style={{ fontSize: "10px", color: reportColors.textMuted, marginTop: "4px" }}>
          {totalItems} items inspected &bull; {overallCounts.OK} passed &bull; {overallCounts.MINOR + overallCounts.MAJOR} issues found
        </div>
      </div>

      {/* Categories */}
      {defaultChecklist.map((category) => {
        const catItems = items.filter((i) => i.category_id === category.id);
        if (catItems.length === 0) return null;

        const catCounts = { OK: 0, MINOR: 0, MAJOR: 0, NA: 0 };
        catItems.forEach((i) => {
          if (i.status in catCounts) catCounts[i.status as keyof typeof catCounts]++;
        });

        const aggScore = categoryAggregateScore(
          catItems.map((i) => ({
            status: i.status as ChecklistStatus,
            costSeverity: (i.cost_severity ?? 0) as CostSeverity,
          }))
        );

        const scoreGrade = healthScoreToGrade(aggScore * 10);
        const scoreColor = gradeColor(scoreGrade);

        return (
          <div key={category.id} style={{ marginBottom: "18px" }}>
            {/* Category Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: reportColors.primary,
                color: "#fff",
                borderRadius: "6px 6px 0 0",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <span>{category.title}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "10px", opacity: 0.8 }}>
                  {catCounts.OK}/{catItems.length} OK
                </span>
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: "10px",
                    backgroundColor: scoreColor,
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {aggScore}/10
                </span>
              </div>
            </div>

            {/* Category Summary Bar */}
            <div style={{ padding: "0 14px" }}>
              <CategorySummaryBar
                ok={catCounts.OK}
                minor={catCounts.MINOR}
                major={catCounts.MAJOR}
                na={catCounts.NA}
              />
            </div>

            {/* Items */}
            <div style={{ border: `1px solid ${reportColors.border}`, borderTop: "none", borderRadius: "0 0 6px 6px" }}>
              {catItems.map((item, idx) => {
                const dot = statusConfig[item.status] ?? statusConfig.NA;
                const score = deriveItemScore(
                  item.status as ChecklistStatus,
                  (item.cost_severity ?? 0) as CostSeverity
                );
                const media = item.inspection_media ?? [];
                const isLast = idx === catItems.length - 1;

                return (
                  <div
                    key={item.item_id}
                    style={{
                      padding: "8px 14px",
                      borderBottom: isLast ? "none" : `1px solid ${reportColors.border}`,
                      fontSize: "11px",
                      backgroundColor: item.status === "MAJOR" ? "#fef2f2" : item.status === "MINOR" ? "#fffbeb" : "transparent",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                        {/* Status badge */}
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "3px",
                            backgroundColor: dot.bg,
                            color: dot.text,
                            fontSize: "8px",
                            fontWeight: 700,
                            minWidth: "40px",
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        >
                          {dot.label}
                        </span>
                        <span style={{ fontWeight: 500, color: reportColors.text }}>
                          {item.item_label}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        {item.work_done && (
                          <span style={{ fontSize: "9px", color: reportColors.textMuted, padding: "1px 6px", backgroundColor: "#f3f4f6", borderRadius: "3px" }}>
                            {item.work_done}
                          </span>
                        )}
                        {item.tread_depth && (
                          <span style={{ fontSize: "9px", color: reportColors.textMuted, padding: "1px 6px", backgroundColor: "#f3f4f6", borderRadius: "3px" }}>
                            Tread: {item.tread_depth}
                          </span>
                        )}
                        {score !== null && (
                          <span style={{ fontSize: "10px", fontWeight: 600, color: reportColors.textMuted }}>
                            {score}/10
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {!hideNotes && item.notes && (
                      <div style={{ marginTop: "4px", marginLeft: "56px", fontSize: "10px", color: reportColors.textMuted, fontStyle: "italic" }}>
                        {item.notes}
                      </div>
                    )}

                    {/* Inline Photos / Video QR */}
                    {media.length > 0 && (
                      <div style={{ display: "flex", gap: "6px", marginTop: "6px", marginLeft: "56px", alignItems: "flex-end" }}>
                        {media.slice(0, 3).map((m) => {
                          const qrUrl = videoQrMap?.[m.storage_path];
                          if (m.media_type === "video" && qrUrl) {
                            return (
                              <div key={m.id} style={{ textAlign: "center" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={qrUrl}
                                  alt="Scan to play video"
                                  style={{ width: "60px", height: "60px", borderRadius: "4px" }}
                                />
                                <div style={{ fontSize: "7px", color: reportColors.textMuted, marginTop: "2px" }}>
                                  Scan to play
                                </div>
                              </div>
                            );
                          }
                          const url = mediaUrlMap[m.storage_path];
                          if (!url) return null;
                          return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={m.id}
                              src={url}
                              alt={item.item_label}
                              style={{
                                width: "72px",
                                height: "54px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                border: `1px solid ${reportColors.border}`,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
