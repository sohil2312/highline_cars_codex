export type Role = "admin" | "inspector" | "viewer";

export type InspectionStatus = "Draft" | "Final";

export type ChecklistStatus = "OK" | "MINOR" | "MAJOR" | "NA";

export type Recommendation = "YES" | "CAUTION" | "NO";

export type CostSeverity = 0 | 1 | 2 | 3 | 4;

export type ItemType =
  | "BODY_PANEL"
  | "APRON"
  | "PILLAR"
  | "QUARTER_PANEL"
  | "STRUCTURAL_SUPPORT"
  | "GENERAL"
  | "ENGINE";

export interface ChecklistItem {
  id: string;
  label: string;
  itemType: ItemType;
  allowVideo?: boolean;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface InspectionSummary {
  totalRepairMin: number;
  totalRepairMax: number;
  exposurePercent: number;
  healthScore: number;
  recommendation: Recommendation;
  recommendationReasons: string[];
}

export type ShareProfile = "full" | "customer" | "summary";

export type BodyType = "sedan" | "suv" | "hatchback" | "coupe" | "truck" | "van" | "wagon";

export type LetterGrade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";

export interface CompanySettings {
  id: string;
  company_name: string;
  logo_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  version: number;
  is_default: boolean;
  categories: ChecklistCategory[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
