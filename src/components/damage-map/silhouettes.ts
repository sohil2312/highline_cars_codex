import type { BodyType } from "@/lib/types";

/**
 * Each zone defines a clickable/fillable region on the vehicle silhouette.
 * - `id` maps to a checklist item_id from templates.ts
 * - `path` is an SVG path (d attribute) for the zone shape
 * - `cx`,`cy` are the label anchor point (center of the zone)
 */
export interface DamageZone {
  id: string;
  label: string;
  path: string;
  cx: number;
  cy: number;
}

export interface VehicleSilhouette {
  bodyType: BodyType;
  viewBox: string;
  /** The main outline of the vehicle (stroke only, no fill) */
  outline: string;
  /** Additional detail lines (windows, wheel arches, etc.) */
  details: string[];
  /** Clickable/fillable zones */
  zones: DamageZone[];
}

// ─── Shared zone generators ──────────────────────────────────────────────────
// The core zones are the same across body types; only the outline and some
// proportions change. We define a base set of zones then tweak per body type.

function baseZones(opts: {
  /** Y offset for front-row zones (pillars, doors, fenders) */
  frontY: number;
  /** Y offset for rear-row zones */
  rearY: number;
  /** Width factor — wider for SUV/truck */
  w: number;
  /** Vehicle length factor */
  h: number;
}): DamageZone[] {
  const { frontY, rearY, w, h } = opts;
  const cx = 50; // center X
  const lx = cx - w; // left edge
  const rx = cx + w; // right edge

  return [
    // ── Front ────────────────────────────────────────────────────────────────
    {
      id: "front-bumper",
      label: "Front Bumper",
      path: `M${cx - w + 2},${4 * h} Q${cx},${2 * h} ${cx + w - 2},${4 * h} L${cx + w - 4},${7 * h} L${cx - w + 4},${7 * h} Z`,
      cx,
      cy: 5 * h,
    },
    {
      id: "headlight-lhs",
      label: "Headlight L",
      path: `M${lx + 1},${5 * h} L${lx + 5},${4 * h} L${lx + 9},${5 * h} L${lx + 7},${7 * h} Z`,
      cx: lx + 5,
      cy: 5.5 * h,
    },
    {
      id: "headlight-rhs",
      label: "Headlight R",
      path: `M${rx - 1},${5 * h} L${rx - 5},${4 * h} L${rx - 9},${5 * h} L${rx - 7},${7 * h} Z`,
      cx: rx - 5,
      cy: 5.5 * h,
    },
    {
      id: "bonnet",
      label: "Bonnet",
      path: `M${lx + 4},${7 * h} L${rx - 4},${7 * h} L${rx - 2},${16 * h} L${lx + 2},${16 * h} Z`,
      cx,
      cy: 11.5 * h,
    },

    // ── Windshield & pillars ─────────────────────────────────────────────────
    {
      id: "windshield",
      label: "Windshield",
      path: `M${lx + 5},${17 * h} L${rx - 5},${17 * h} L${rx - 3},${23 * h} L${lx + 3},${23 * h} Z`,
      cx,
      cy: 20 * h,
    },
    {
      id: "a-pillar-lhs",
      label: "A Pillar L",
      path: `M${lx + 1},${16 * h} L${lx + 5},${16 * h} L${lx + 3},${24 * h} L${lx},${22 * h} Z`,
      cx: lx + 3,
      cy: 20 * h,
    },
    {
      id: "a-pillar-rhs",
      label: "A Pillar R",
      path: `M${rx - 1},${16 * h} L${rx - 5},${16 * h} L${rx - 3},${24 * h} L${rx},${22 * h} Z`,
      cx: rx - 3,
      cy: 20 * h,
    },

    // ── Fenders ──────────────────────────────────────────────────────────────
    {
      id: "fender-lhs",
      label: "Fender L",
      path: `M${lx},${7 * h} L${lx + 4},${7 * h} L${lx + 2},${16 * h} L${lx},${16 * h} Z`,
      cx: lx + 2,
      cy: 11 * h,
    },
    {
      id: "fender-rhs",
      label: "Fender R",
      path: `M${rx},${7 * h} L${rx - 4},${7 * h} L${rx - 2},${16 * h} L${rx},${16 * h} Z`,
      cx: rx - 2,
      cy: 11 * h,
    },

    // ── Front doors ──────────────────────────────────────────────────────────
    {
      id: "door-lf",
      label: "Door LF",
      path: `M${lx},${24 * h} L${lx + 3},${24 * h} L${lx + 3},${40 * h} L${lx},${40 * h} Z`,
      cx: lx + 1.5,
      cy: 32 * h,
    },
    {
      id: "door-rf",
      label: "Door RF",
      path: `M${rx},${24 * h} L${rx - 3},${24 * h} L${rx - 3},${40 * h} L${rx},${40 * h} Z`,
      cx: rx - 1.5,
      cy: 32 * h,
    },

    // ── B pillars ────────────────────────────────────────────────────────────
    {
      id: "b-pillar-lhs",
      label: "B Pillar L",
      path: `M${lx},${40 * h} L${lx + 3},${40 * h} L${lx + 3},${44 * h} L${lx},${44 * h} Z`,
      cx: lx + 1.5,
      cy: 42 * h,
    },
    {
      id: "b-pillar-rhs",
      label: "B Pillar R",
      path: `M${rx},${40 * h} L${rx - 3},${40 * h} L${rx - 3},${44 * h} L${rx},${44 * h} Z`,
      cx: rx - 1.5,
      cy: 42 * h,
    },

    // ── Roof ─────────────────────────────────────────────────────────────────
    {
      id: "roof",
      label: "Roof",
      path: `M${lx + 3},${24 * h} L${rx - 3},${24 * h} L${rx - 3},${60 * h} L${lx + 3},${60 * h} Z`,
      cx,
      cy: 42 * h,
    },

    // ── Rear doors ───────────────────────────────────────────────────────────
    {
      id: "door-lr",
      label: "Door LR",
      path: `M${lx},${44 * h} L${lx + 3},${44 * h} L${lx + 3},${58 * h} L${lx},${58 * h} Z`,
      cx: lx + 1.5,
      cy: 51 * h,
    },
    {
      id: "door-rr",
      label: "Door RR",
      path: `M${rx},${44 * h} L${rx - 3},${44 * h} L${rx - 3},${58 * h} L${rx},${58 * h} Z`,
      cx: rx - 1.5,
      cy: 51 * h,
    },

    // ── C pillars ────────────────────────────────────────────────────────────
    {
      id: "c-pillar-lhs",
      label: "C Pillar L",
      path: `M${lx},${58 * h} L${lx + 3},${58 * h} L${lx + 3},${63 * h} L${lx},${63 * h} Z`,
      cx: lx + 1.5,
      cy: 60.5 * h,
    },
    {
      id: "c-pillar-rhs",
      label: "C Pillar R",
      path: `M${rx},${58 * h} L${rx - 3},${58 * h} L${rx - 3},${63 * h} L${rx},${63 * h} Z`,
      cx: rx - 1.5,
      cy: 60.5 * h,
    },

    // ── Quarter panels ───────────────────────────────────────────────────────
    {
      id: "lhs-quarter",
      label: "Quarter L",
      path: `M${lx},${63 * h} L${lx + 3},${63 * h} L${lx + 2},${76 * h} L${lx},${76 * h} Z`,
      cx: lx + 1.5,
      cy: 69.5 * h,
    },
    {
      id: "rhs-quarter",
      label: "Quarter R",
      path: `M${rx},${63 * h} L${rx - 3},${63 * h} L${rx - 2},${76 * h} L${rx},${76 * h} Z`,
      cx: rx - 1.5,
      cy: 69.5 * h,
    },

    // ── Rear glass / window ──────────────────────────────────────────────────
    // (not a separate checklist item, shares with windshield or can be added)

    // ── Boot / Trunk ─────────────────────────────────────────────────────────
    {
      id: "boot-door",
      label: "Boot Door",
      path: `M${lx + 2},${76 * h} L${rx - 2},${76 * h} L${rx - 4},${85 * h} L${lx + 4},${85 * h} Z`,
      cx,
      cy: 80.5 * h,
    },

    // ── Rear bumper ──────────────────────────────────────────────────────────
    {
      id: "rear-bumper",
      label: "Rear Bumper",
      path: `M${lx + 4},${85 * h} L${rx - 4},${85 * h} Q${cx},${90 * h} ${lx + 4},${85 * h} M${lx + 4},${85 * h} L${rx - 4},${85 * h} L${rx - 2},${89 * h} Q${cx},${92 * h} ${lx + 2},${89 * h} Z`,
      cx,
      cy: 88 * h,
    },

    // ── Taillights ───────────────────────────────────────────────────────────
    {
      id: "taillight-lhs",
      label: "Taillight L",
      path: `M${lx + 1},${83 * h} L${lx + 5},${82 * h} L${lx + 5},${86 * h} L${lx + 1},${87 * h} Z`,
      cx: lx + 3,
      cy: 84.5 * h,
    },
    {
      id: "taillight-rhs",
      label: "Taillight R",
      path: `M${rx - 1},${83 * h} L${rx - 5},${82 * h} L${rx - 5},${86 * h} L${rx - 1},${87 * h} Z`,
      cx: rx - 3,
      cy: 84.5 * h,
    },

    // ── ORVMs ────────────────────────────────────────────────────────────────
    {
      id: "orvm-lhs",
      label: "ORVM L",
      path: `M${lx - 3},${22 * h} L${lx},${20 * h} L${lx},${24 * h} Z`,
      cx: lx - 1.5,
      cy: 22 * h,
    },
    {
      id: "orvm-rhs",
      label: "ORVM R",
      path: `M${rx + 3},${22 * h} L${rx},${20 * h} L${rx},${24 * h} Z`,
      cx: rx + 1.5,
      cy: 22 * h,
    },

    // ── Running border (sills) ───────────────────────────────────────────────
    {
      id: "running-border",
      label: "Running Border",
      path: `M${lx - 1},${28 * h} L${lx},${28 * h} L${lx},${70 * h} L${lx - 1},${70 * h} Z`,
      cx: lx - 0.5,
      cy: 49 * h,
    },
  ];
}

// ─── Sedan ───────────────────────────────────────────────────────────────────
const sedanZones = baseZones({ frontY: 12, rearY: 75, w: 18, h: 1 });
const sedan: VehicleSilhouette = {
  bodyType: "sedan",
  viewBox: "0 0 100 95",
  outline:
    "M32,4 Q50,1 68,4 L70,10 Q72,16 72,22 L72,70 Q72,76 70,82 L68,90 Q50,93 32,90 L30,82 Q28,76 28,70 L28,22 Q28,16 30,10 Z",
  details: [
    // Front windshield
    "M34,17 L66,17 L68,23 L32,23 Z",
    // Rear windshield
    "M34,63 L66,63 L68,58 L32,58 Z",
    // Front wheel arches
    "M27,10 Q24,14 27,18",
    "M73,10 Q76,14 73,18",
    // Rear wheel arches
    "M27,70 Q24,74 27,78",
    "M73,70 Q76,74 73,78",
  ],
  zones: sedanZones,
};

// ─── SUV ─────────────────────────────────────────────────────────────────────
const suvZones = baseZones({ frontY: 12, rearY: 75, w: 20, h: 1 });
const suv: VehicleSilhouette = {
  bodyType: "suv",
  viewBox: "0 0 100 95",
  outline:
    "M30,4 Q50,1 70,4 L72,10 Q74,16 74,22 L74,70 Q74,76 72,82 L70,90 Q50,93 30,90 L28,82 Q26,76 26,70 L26,22 Q26,16 28,10 Z",
  details: [
    "M33,17 L67,17 L69,23 L31,23 Z",
    "M33,63 L67,63 L69,58 L31,58 Z",
    "M25,9 Q21,14 25,19",
    "M75,9 Q79,14 75,19",
    "M25,69 Q21,74 25,79",
    "M75,69 Q79,74 75,79",
    // Roof rails
    "M31,24 L31,58",
    "M69,24 L69,58",
  ],
  zones: suvZones,
};

// ─── Hatchback ───────────────────────────────────────────────────────────────
const hatchZones = baseZones({ frontY: 12, rearY: 72, w: 17, h: 1 });
const hatchback: VehicleSilhouette = {
  bodyType: "hatchback",
  viewBox: "0 0 100 92",
  outline:
    "M33,5 Q50,2 67,5 L69,11 Q71,16 71,22 L71,65 Q71,72 69,78 L67,85 Q50,88 33,85 L31,78 Q29,72 29,65 L29,22 Q29,16 31,11 Z",
  details: [
    "M35,17 L65,17 L67,23 L33,23 Z",
    "M35,60 L65,60 L67,56 L33,56 Z",
    "M28,10 Q25,14 28,18",
    "M72,10 Q75,14 72,18",
    "M28,64 Q25,68 28,72",
    "M72,64 Q75,68 72,72",
  ],
  zones: hatchZones,
};

// ─── Coupe ───────────────────────────────────────────────────────────────────
const coupeZones = baseZones({ frontY: 12, rearY: 72, w: 17, h: 1 });
// Coupe: no rear doors, so remove them and adjust quarters
const coupeFilteredZones = coupeZones.filter(
  (z) => z.id !== "door-lr" && z.id !== "door-rr" && z.id !== "b-pillar-lhs" && z.id !== "b-pillar-rhs"
);

const coupe: VehicleSilhouette = {
  bodyType: "coupe",
  viewBox: "0 0 100 92",
  outline:
    "M33,5 Q50,2 67,5 L69,12 Q71,17 71,24 L71,64 Q71,70 69,76 L67,84 Q50,87 33,84 L31,76 Q29,70 29,64 L29,24 Q29,17 31,12 Z",
  details: [
    "M36,18 L64,18 L66,26 L34,26 Z",
    "M36,60 L64,60 L66,55 L34,55 Z",
    "M28,11 Q25,16 28,20",
    "M72,11 Q75,16 72,20",
    "M28,62 Q25,66 28,70",
    "M72,62 Q75,66 72,70",
  ],
  zones: coupeFilteredZones,
};

// ─── Truck / Pickup ──────────────────────────────────────────────────────────
const truckZones = baseZones({ frontY: 12, rearY: 75, w: 20, h: 1 });
// Truck: no rear doors; boot becomes "bed"
const truckFilteredZones = truckZones
  .filter(
    (z) => z.id !== "door-lr" && z.id !== "door-rr" && z.id !== "b-pillar-lhs" && z.id !== "b-pillar-rhs"
  )
  .map((z) => {
    if (z.id === "boot-door") return { ...z, label: "Truck Bed" };
    return z;
  });

const truck: VehicleSilhouette = {
  bodyType: "truck",
  viewBox: "0 0 100 95",
  outline:
    "M30,4 Q50,1 70,4 L72,10 Q74,16 74,22 L74,72 Q74,78 72,84 L70,90 Q50,93 30,90 L28,84 Q26,78 26,72 L26,22 Q26,16 28,10 Z",
  details: [
    "M33,17 L67,17 L69,23 L31,23 Z",
    // Cab-bed separator line
    "M26,50 L74,50",
    "M25,9 Q21,14 25,19",
    "M75,9 Q79,14 75,19",
    "M25,69 Q21,74 25,79",
    "M75,69 Q79,74 75,79",
  ],
  zones: truckFilteredZones,
};

// ─── Wagon ───────────────────────────────────────────────────────────────────
const wagonZones = baseZones({ frontY: 12, rearY: 75, w: 18, h: 1 });
const wagon: VehicleSilhouette = {
  bodyType: "wagon",
  viewBox: "0 0 100 95",
  outline:
    "M32,4 Q50,1 68,4 L70,10 Q72,16 72,22 L72,72 Q72,78 70,84 L68,90 Q50,93 32,90 L30,84 Q28,78 28,72 L28,22 Q28,16 30,10 Z",
  details: [
    "M34,17 L66,17 L68,23 L32,23 Z",
    "M34,65 L66,65 L68,60 L32,60 Z",
    "M27,10 Q24,14 27,18",
    "M73,10 Q76,14 73,18",
    "M27,70 Q24,74 27,78",
    "M73,70 Q76,74 73,78",
    // Roof rails (estate/wagon indicator)
    "M32,24 L32,60",
    "M68,24 L68,60",
  ],
  zones: wagonZones,
};

// ─── Van ─────────────────────────────────────────────────────────────────────
const vanZones = baseZones({ frontY: 12, rearY: 75, w: 21, h: 1 });
const van: VehicleSilhouette = {
  bodyType: "van",
  viewBox: "0 0 100 95",
  outline:
    "M29,4 Q50,1 71,4 L73,10 Q75,16 75,22 L75,72 Q75,78 73,84 L71,90 Q50,93 29,90 L27,84 Q25,78 25,72 L25,22 Q25,16 27,10 Z",
  details: [
    "M33,17 L67,17 L69,23 L31,23 Z",
    "M24,8 Q20,14 24,19",
    "M76,8 Q80,14 76,19",
    "M24,69 Q20,74 24,79",
    "M76,69 Q80,74 76,79",
  ],
  zones: vanZones,
};

// ─── Registry ────────────────────────────────────────────────────────────────
export const silhouettes: Record<BodyType, VehicleSilhouette> = {
  sedan,
  suv,
  hatchback,
  coupe,
  truck,
  wagon,
  van,
};

export const bodyTypeLabels: Record<BodyType, string> = {
  sedan: "Sedan",
  suv: "SUV",
  hatchback: "Hatchback",
  coupe: "Coupe",
  truck: "Truck / Pickup",
  wagon: "Wagon / Estate",
  van: "Van / MPV",
};

/** Status → fill color for a zone */
export function zoneColor(status: string | undefined): string {
  switch (status) {
    case "OK":
      return "rgba(31, 157, 85, 0.35)";
    case "MINOR":
      return "rgba(245, 158, 11, 0.45)";
    case "MAJOR":
      return "rgba(220, 38, 38, 0.50)";
    case "NA":
      return "rgba(156, 163, 175, 0.20)";
    default:
      return "rgba(0, 0, 0, 0)";
  }
}

/** Status → solid color for legend / dots */
export function zoneSolidColor(status: string): string {
  switch (status) {
    case "OK":
      return "#1f9d55";
    case "MINOR":
      return "#f59e0b";
    case "MAJOR":
      return "#dc2626";
    default:
      return "#9ca3af";
  }
}
