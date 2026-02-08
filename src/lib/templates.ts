import type { ChecklistCategory } from "@/lib/types";

export const workDoneOptions = {
  BODY_PANEL: [
    "Original",
    "Minor damage",
    "Dent present",
    "Repaired",
    "Repainted",
    "Replaced",
    "Accident damage"
  ],
  APRON: [
    "Original",
    "Minor damage",
    "Dent present",
    "Repaired",
    "Repainted",
    "Replaced",
    "Accident damage"
  ],
  PILLAR: [
    "Original",
    "Minor damage",
    "Dent present",
    "Repaired",
    "Repainted",
    "Replaced",
    "Accident damage"
  ],
  QUARTER_PANEL: [
    "Original",
    "Minor damage",
    "Dent present",
    "Repaired",
    "Repainted",
    "Replaced",
    "Accident damage"
  ],
  STRUCTURAL_SUPPORT: [
    "Structurally sound",
    "Original",
    "Minor rust",
    "Repaired",
    "Repainted",
    "Damage present",
    "Accident damage"
  ],
  GENERAL: [
    "Good condition",
    "Needs attention",
    "Not working",
    "Needs replacement"
  ],
  ENGINE: [
    "Excellent",
    "Good",
    "Minor oil leak",
    "Noise present",
    "Needs service",
    "Engine repaired",
    "Engine replaced",
    "Major issue"
  ]
};

export const defaultChecklist: ChecklistCategory[] = [
  {
    id: "exterior",
    title: "Exterior & Body",
    items: [
      { id: "front-bumper", label: "Front Bumper", itemType: "BODY_PANEL" },
      { id: "rear-bumper", label: "Rear Bumper", itemType: "BODY_PANEL" },
      { id: "bonnet", label: "Bonnet/Hood", itemType: "BODY_PANEL" },
      { id: "roof", label: "Roof", itemType: "BODY_PANEL" },
      { id: "fender-lhs", label: "Fender LHS", itemType: "BODY_PANEL" },
      { id: "fender-rhs", label: "Fender RHS", itemType: "BODY_PANEL" },
      { id: "door-lf", label: "Door LHS Front", itemType: "BODY_PANEL" },
      { id: "door-lr", label: "Door LHS Rear", itemType: "BODY_PANEL" },
      { id: "door-rf", label: "Door RHS Front", itemType: "BODY_PANEL" },
      { id: "door-rr", label: "Door RHS Rear", itemType: "BODY_PANEL" },
      { id: "boot-door", label: "Dicky/Boot Door", itemType: "BODY_PANEL" },
      { id: "boot-floor", label: "Boot Floor", itemType: "BODY_PANEL" },
      { id: "running-border", label: "Running Border", itemType: "BODY_PANEL" },
      { id: "windshield", label: "Windshield", itemType: "BODY_PANEL" },
      { id: "orvm-lhs", label: "ORVM LHS", itemType: "BODY_PANEL" },
      { id: "orvm-rhs", label: "ORVM RHS", itemType: "BODY_PANEL" },
      { id: "headlight-lhs", label: "Headlight LHS", itemType: "BODY_PANEL" },
      { id: "headlight-rhs", label: "Headlight RHS", itemType: "BODY_PANEL" },
      { id: "taillight-lhs", label: "Taillight LHS", itemType: "BODY_PANEL" },
      { id: "taillight-rhs", label: "Taillight RHS", itemType: "BODY_PANEL" },
      { id: "foglight-lhs", label: "Fog Light LHS", itemType: "BODY_PANEL" },
      { id: "foglight-rhs", label: "Fog Light RHS", itemType: "BODY_PANEL" },
      { id: "lhs-apron", label: "LHS Apron", itemType: "APRON" },
      { id: "rhs-apron", label: "RHS Apron", itemType: "APRON" },
      { id: "a-pillar-lhs", label: "A Pillar LHS", itemType: "PILLAR" },
      { id: "a-pillar-rhs", label: "A Pillar RHS", itemType: "PILLAR" },
      { id: "b-pillar-lhs", label: "B Pillar LHS", itemType: "PILLAR" },
      { id: "b-pillar-rhs", label: "B Pillar RHS", itemType: "PILLAR" },
      { id: "c-pillar-lhs", label: "C Pillar LHS", itemType: "PILLAR" },
      { id: "c-pillar-rhs", label: "C Pillar RHS", itemType: "PILLAR" },
      { id: "lhs-quarter", label: "LHS Quarter Panel", itemType: "QUARTER_PANEL" },
      { id: "rhs-quarter", label: "RHS Quarter Panel", itemType: "QUARTER_PANEL" },
      { id: "firewall", label: "Firewall", itemType: "STRUCTURAL_SUPPORT" },
      { id: "cowl-top", label: "Cowl Top", itemType: "STRUCTURAL_SUPPORT" },
      { id: "upper-cross", label: "Upper Cross Member (Bonnet Patti)", itemType: "STRUCTURAL_SUPPORT" },
      { id: "lower-cross", label: "Lower Cross Member", itemType: "STRUCTURAL_SUPPORT" },
      { id: "headlight-support", label: "Headlight Support", itemType: "STRUCTURAL_SUPPORT" },
      { id: "radiator-support", label: "Radiator Support", itemType: "STRUCTURAL_SUPPORT" }
    ]
  },
  {
    id: "tyres",
    title: "Tyres & Wheels",
    items: [
      { id: "tyre-lf", label: "LHS Front Tyre", itemType: "GENERAL" },
      { id: "tyre-rf", label: "RHS Front Tyre", itemType: "GENERAL" },
      { id: "tyre-lr", label: "LHS Rear Tyre", itemType: "GENERAL" },
      { id: "tyre-rr", label: "RHS Rear Tyre", itemType: "GENERAL" },
      { id: "tyre-spare", label: "Spare Tyre", itemType: "GENERAL" },
      { id: "alloy", label: "Alloy/Wheel Condition", itemType: "GENERAL" }
    ]
  },
  {
    id: "interior",
    title: "Interior & Electrical",
    items: [
      { id: "power-windows", label: "Power Windows", itemType: "GENERAL" },
      { id: "central-lock", label: "Central Lock", itemType: "GENERAL" },
      { id: "music", label: "Music System", itemType: "GENERAL" },
      { id: "reverse-camera", label: "Reverse Camera", itemType: "GENERAL" },
      { id: "rear-defog", label: "Rear Defogger", itemType: "GENERAL" },
      { id: "navigation", label: "Navigation", itemType: "GENERAL" },
      { id: "seat-driver", label: "Seat (Driver)", itemType: "GENERAL" },
      { id: "seat-2nd", label: "Seat (2nd Row)", itemType: "GENERAL" },
      { id: "seat-3rd", label: "Seat (3rd Row)", itemType: "GENERAL" },
      { id: "dashboard", label: "Dashboard", itemType: "GENERAL" },
      { id: "flooring", label: "Flooring", itemType: "GENERAL" }
    ]
  },
  {
    id: "engine",
    title: "Engine & Transmission",
    items: [
      { id: "engine-condition", label: "Engine Condition", itemType: "ENGINE" },
      { id: "battery", label: "Battery", itemType: "ENGINE" },
      { id: "engine-oil-level", label: "Engine Oil Level (Dipstick)", itemType: "ENGINE" },
      { id: "engine-oil-condition", label: "Engine Oil Condition", itemType: "ENGINE" },
      { id: "coolant-condition", label: "Coolant Condition", itemType: "ENGINE" },
      { id: "engine-mounting", label: "Engine Mounting", itemType: "ENGINE" },
      { id: "engine-sound", label: "Engine Sound", itemType: "ENGINE", allowVideo: true },
      { id: "exhaust-smoke", label: "Exhaust Smoke", itemType: "ENGINE" },
      { id: "clutch", label: "Clutch", itemType: "ENGINE" },
      { id: "gear-shifting", label: "Gear Shifting", itemType: "ENGINE" },
      { id: "turbo", label: "Turbo Charger", itemType: "ENGINE" },
      { id: "fuel-injector", label: "Fuel Injector", itemType: "ENGINE" }
    ]
  },
  {
    id: "steering",
    title: "Steering / Suspension / Brakes",
    items: [
      { id: "steering", label: "Steering", itemType: "GENERAL" },
      { id: "suspension", label: "Suspension", itemType: "GENERAL" },
      { id: "brakes", label: "Brakes", itemType: "GENERAL" }
    ]
  },
  {
    id: "underbody",
    title: "Underbody / Chassis",
    items: [
      { id: "floor-pan", label: "Floor Pan", itemType: "STRUCTURAL_SUPPORT" },
      { id: "rust", label: "Rust/Corrosion", itemType: "STRUCTURAL_SUPPORT" },
      { id: "exhaust-system", label: "Exhaust System", itemType: "GENERAL" },
      { id: "accident-underbody", label: "Accident Damage (Underbody)", itemType: "STRUCTURAL_SUPPORT" },
      { id: "front-cross", label: "Front Cross Member", itemType: "STRUCTURAL_SUPPORT" },
      { id: "rear-cross", label: "Rear Cross Member", itemType: "STRUCTURAL_SUPPORT" }
    ]
  },
  {
    id: "test-drive",
    title: "Test Drive",
    items: [
      { id: "pickup", label: "Pickup", itemType: "GENERAL" },
      { id: "braking", label: "Braking Feel", itemType: "GENERAL" },
      { id: "steering-pull", label: "Steering Pull", itemType: "GENERAL" },
      { id: "vibration", label: "Vibration/Noise", itemType: "GENERAL" },
      { id: "clutch-slip", label: "Clutch Slip", itemType: "GENERAL" },
      { id: "gearbox", label: "Gearbox Behavior", itemType: "GENERAL" }
    ]
  }
];
