import type { ChecklistStatus, CostSeverity, Recommendation, ItemType, LetterGrade } from "@/lib/types";

export interface ChecklistResult {
  categoryId: string;
  itemId: string;
  itemType: ItemType;
  status: ChecklistStatus;
  costSeverity: CostSeverity;
}

export interface LegalFlags {
  rcMismatch?: boolean;
  hypothecationUnresolved?: boolean;
  fitnessExpired?: boolean;
  roadTaxInvalid?: boolean;
}

export interface ScoreInput {
  marketValue: number;
  checklist: ChecklistResult[];
  legal: LegalFlags;
  engineReplaced?: boolean;
}

export interface ScoreOutput {
  totalRepairMin: number;
  totalRepairMax: number;
  exposurePercent: number;
  healthScore: number;
  recommendation: Recommendation;
  recommendationReasons: string[];
  caps: string[];
  categoryTotals: Record<string, { min: number; max: number }>;
}

const scoreWeights = {
  structural: 35,
  engine: 25,
  steering: 15,
  electrical: 10,
  exterior: 10,
  legal: 5
};

type ScoreGroup = keyof typeof scoreWeights;

type CostGroup = "structural" | "engine" | "electrical" | "exterior" | "tyres" | "steering";

function scoreGroupFromItem(categoryId: string, itemType: ItemType): ScoreGroup {
  if (["APRON", "PILLAR", "QUARTER_PANEL", "STRUCTURAL_SUPPORT"].includes(itemType)) {
    return "structural";
  }
  if (itemType === "ENGINE") return "engine";
  if (categoryId === "interior") return "electrical";
  if (categoryId === "steering" || categoryId === "underbody" || categoryId === "test-drive") {
    return "steering";
  }
  return "exterior";
}

function costGroupFromItem(categoryId: string, itemType: ItemType): CostGroup {
  if (["APRON", "PILLAR", "QUARTER_PANEL", "STRUCTURAL_SUPPORT"].includes(itemType)) {
    return "structural";
  }
  if (itemType === "ENGINE") return "engine";
  if (categoryId === "interior") return "electrical";
  if (categoryId === "tyres") return "tyres";
  if (categoryId === "steering" || categoryId === "underbody" || categoryId === "test-drive") {
    return "steering";
  }
  return "exterior";
}

export function costBand(group: CostGroup, severity: CostSeverity) {
  if (severity === 0) return { min: 0, max: 0 };

  if (group === "structural") {
    if (severity <= 2) return { min: 10000, max: 25000 };
    if (severity === 3) return { min: 25000, max: 60000 };
    return { min: 60000, max: 150000 };
  }

  if (group === "engine") {
    if (severity <= 2) return { min: 8000, max: 25000 };
    if (severity === 3) return { min: 25000, max: 80000 };
    return { min: 80000, max: 250000 };
  }

  if (group === "tyres") {
    if (severity <= 2) return { min: 6000, max: 15000 };
    return { min: 15000, max: 40000 };
  }

  if (group === "electrical") {
    if (severity === 1) return { min: 1000, max: 5000 };
    if (severity === 2) return { min: 5000, max: 15000 };
    if (severity === 3) return { min: 15000, max: 35000 };
    return { min: 35000, max: 80000 };
  }

  if (group === "exterior") {
    if (severity === 1) return { min: 1000, max: 3000 };
    if (severity === 2) return { min: 3000, max: 8000 };
    if (severity === 3) return { min: 8000, max: 20000 };
    return { min: 20000, max: 200000 };
  }

  if (group === "steering") {
    if (severity === 1) return { min: 3000, max: 8000 };
    if (severity === 2) return { min: 8000, max: 15000 };
    if (severity === 3) return { min: 15000, max: 35000 };
    return { min: 35000, max: 80000 };
  }

  return { min: 0, max: 0 };
}

function statusPenalty(status: ChecklistStatus) {
  if (status === "MINOR") return 2;
  if (status === "MAJOR") return 5;
  return 0;
}

export function computeScore(input: ScoreInput): ScoreOutput {
  const categoryBuckets = new Map<ScoreGroup, ChecklistResult[]>();
  Object.keys(scoreWeights).forEach((key) => {
    categoryBuckets.set(key as ScoreGroup, []);
  });

  let totalRepairMin = 0;
  let totalRepairMax = 0;
  const categoryTotals: Record<string, { min: number; max: number }> = {};

  let structuralCritical = false;
  let structuralHighCount = 0;
  let engineCritical = false;

  for (const item of input.checklist) {
    const scoreGroup = scoreGroupFromItem(item.categoryId, item.itemType);
    const costGroup = costGroupFromItem(item.categoryId, item.itemType);

    const list = categoryBuckets.get(scoreGroup);
    if (list) list.push(item);

    const band = costBand(costGroup, item.costSeverity);
    totalRepairMin += band.min;
    totalRepairMax += band.max;

    const bucket = categoryTotals[scoreGroup] ?? { min: 0, max: 0 };
    bucket.min += band.min;
    bucket.max += band.max;
    categoryTotals[scoreGroup] = bucket;

    if (scoreGroup === "structural" && item.costSeverity >= 4) structuralCritical = true;
    if (scoreGroup === "structural" && item.costSeverity >= 3) structuralHighCount += 1;
    if (scoreGroup === "engine" && item.costSeverity >= 4) engineCritical = true;
  }

  const exposurePercent = input.marketValue > 0
    ? Math.round((totalRepairMax / input.marketValue) * 100)
    : 0;

  let healthScore = 0;
  for (const [cat, items] of categoryBuckets.entries()) {
    if (cat === "legal") continue;
    if (items.length === 0) continue;
    const maxPenalty = items.length * 7;
    const penalty = items.reduce(
      (sum, item) => sum + statusPenalty(item.status) + item.costSeverity,
      0
    );
    const normalized = Math.min(1, penalty / maxPenalty);
    healthScore += Math.round(scoreWeights[cat] * (1 - normalized));
  }

  const legalFlags = input.legal;
  const legalPenalty =
    (legalFlags.rcMismatch ? 2 : 0) +
    (legalFlags.hypothecationUnresolved ? 2 : 0) +
    (legalFlags.fitnessExpired ? 1 : 0) +
    (legalFlags.roadTaxInvalid ? 1 : 0);
  healthScore += Math.max(0, scoreWeights.legal - legalPenalty);

  let exposurePenalty = 0;
  if (exposurePercent <= 5) exposurePenalty = 0;
  else if (exposurePercent <= 10) exposurePenalty = 3;
  else if (exposurePercent <= 20) exposurePenalty = 7;
  else if (exposurePercent <= 30) exposurePenalty = 12;
  else if (exposurePercent <= 50) exposurePenalty = 20;
  else exposurePenalty = 35;

  healthScore = Math.max(0, Math.min(100, healthScore - exposurePenalty));

  const caps: string[] = [];
  let capValue = 100;
  if (structuralCritical) {
    caps.push("Critical structural item present");
    capValue = Math.min(capValue, 60);
  }
  if (structuralHighCount >= 2) {
    caps.push("Multiple high structural items");
    capValue = Math.min(capValue, 55);
  }
  if (input.engineReplaced) {
    caps.push("Engine replaced");
    capValue = Math.min(capValue, 65);
  }
  if (engineCritical) {
    caps.push("Critical engine cost");
    capValue = Math.min(capValue, 50);
  }
  if (legalFlags.rcMismatch || legalFlags.hypothecationUnresolved) {
    caps.push("RC mismatch or hypothecation unresolved");
    capValue = Math.min(capValue, 60);
  }
  if (legalFlags.fitnessExpired || legalFlags.roadTaxInvalid) {
    caps.push("Fitness expired or road tax invalid");
    capValue = Math.min(capValue, 55);
  }

  if (capValue < 100) healthScore = Math.min(healthScore, capValue);

  let recommendation: Recommendation = "CAUTION";
  if (healthScore >= 80 && caps.length === 0) recommendation = "YES";
  else if (healthScore < 60) recommendation = "NO";

  const recommendationReasons = [...caps];
  if (exposurePercent > 50) {
    recommendation = "NO";
    recommendationReasons.push("Repair exposure > 50%");
  }
  if (structuralCritical) {
    recommendation = "NO";
  }

  return {
    totalRepairMin,
    totalRepairMax,
    exposurePercent,
    healthScore,
    recommendation,
    recommendationReasons,
    caps,
    categoryTotals
  };
}

export function getSuggestedSeverity(status: ChecklistStatus, itemType: ItemType): CostSeverity {
  if (status === "OK" || status === "NA") return 0;
  const isHighRisk = ["APRON", "PILLAR", "QUARTER_PANEL", "STRUCTURAL_SUPPORT", "ENGINE"].includes(itemType);
  if (status === "MINOR") return isHighRisk ? 2 : 1;
  return isHighRisk ? 4 : 3;
}

export function healthScoreToGrade(score: number): LetterGrade {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function gradeColor(grade: LetterGrade): string {
  if (grade === "A+" || grade === "A") return "#1f9d55";
  if (grade === "B+" || grade === "B") return "#0ea5e9";
  if (grade === "C+" || grade === "C") return "#f59e0b";
  if (grade === "D") return "#f97316";
  return "#dc2626";
}

export function deriveItemScore(status: ChecklistStatus, costSeverity: CostSeverity): number | null {
  if (status === "NA") return null;
  if (status === "OK") return costSeverity === 0 ? 10 : 9;
  if (status === "MINOR") return Math.max(5, 7 - costSeverity);
  return Math.max(1, 4 - costSeverity);
}

export function categoryAggregateScore(
  items: Array<{ status: ChecklistStatus; costSeverity: CostSeverity }>
): number {
  const scores = items
    .map((i) => deriveItemScore(i.status, i.costSeverity))
    .filter((s): s is number => s !== null);
  if (scores.length === 0) return 10;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}
