// Comprehensive Indian car market vehicle database
// Brand → Model → Variants with body type mapping

export type VehicleEntry = {
  brand: string;
  models: {
    name: string;
    bodyType: string;
    variants: string[];
  }[];
};

export const vehicleDatabase: VehicleEntry[] = [
  {
    brand: "Maruti Suzuki",
    models: [
      { name: "Alto K10", bodyType: "hatchback", variants: ["Std", "Lxi", "Vxi", "Vxi+", "Vxi+ AGS"] },
      { name: "S-Presso", bodyType: "hatchback", variants: ["Std", "Lxi", "Vxi", "Vxi+", "Vxi+ AGS"] },
      { name: "Celerio", bodyType: "hatchback", variants: ["Lxi", "Vxi", "Vxi AGS", "Zxi", "Zxi+", "Zxi+ AGS"] },
      { name: "WagonR", bodyType: "hatchback", variants: ["Lxi", "Vxi", "Vxi AGS", "Zxi", "Zxi+", "Zxi+ AGS"] },
      { name: "Swift", bodyType: "hatchback", variants: ["Lxi", "Vxi", "Vxi AGS", "Zxi", "Zxi+", "Zxi+ AGS"] },
      { name: "Baleno", bodyType: "hatchback", variants: ["Sigma", "Delta", "Delta AGS", "Zeta", "Zeta AGS", "Alpha", "Alpha AGS"] },
      { name: "Ignis", bodyType: "hatchback", variants: ["Sigma", "Delta", "Delta AGS", "Zeta", "Zeta AGS", "Alpha", "Alpha AGS"] },
      { name: "Dzire", bodyType: "sedan", variants: ["Lxi", "Vxi", "Vxi AGS", "Zxi", "Zxi+", "Zxi+ AGS"] },
      { name: "Ciaz", bodyType: "sedan", variants: ["Sigma", "Delta", "Zeta", "Alpha"] },
      { name: "Vitara Brezza", bodyType: "suv", variants: ["Lxi", "Vxi", "Zxi", "Zxi+", "Zxi+ Dual Tone"] },
      { name: "Brezza", bodyType: "suv", variants: ["Lxi", "Vxi", "Vxi (S)", "Zxi", "Zxi (S)", "Zxi+", "Zxi+ Dual Tone"] },
      { name: "Ertiga", bodyType: "van", variants: ["Lxi", "Vxi", "Zxi", "Zxi+", "Zxi+ AT"] },
      { name: "XL6", bodyType: "van", variants: ["Zeta", "Zeta AT", "Alpha", "Alpha AT", "Alpha+ Dual Tone"] },
      { name: "Grand Vitara", bodyType: "suv", variants: ["Sigma", "Delta", "Zeta", "Zeta+", "Alpha", "Alpha+", "Alpha+ Dual Tone"] },
      { name: "Jimny", bodyType: "suv", variants: ["Zeta", "Zeta AT", "Alpha", "Alpha AT"] },
      { name: "Fronx", bodyType: "suv", variants: ["Sigma", "Delta", "Delta+ AGS", "Zeta", "Zeta AGS", "Alpha", "Alpha AGS", "Alpha Dual Tone"] },
      { name: "Invicto", bodyType: "van", variants: ["Zeta", "Zeta+", "Alpha", "Alpha+"] },
      { name: "Eeco", bodyType: "van", variants: ["5 Seater Std", "5 Seater AC", "7 Seater Std", "7 Seater AC", "Cargo"] },
      { name: "e Vitara", bodyType: "suv", variants: ["Delta", "Zeta", "Zeta+", "Alpha", "Alpha+"] },
    ],
  },
  {
    brand: "Hyundai",
    models: [
      { name: "Grand i10 Nios", bodyType: "hatchback", variants: ["Era", "Magna", "Sportz", "Sportz Dual Tone", "Asta", "Asta AMT"] },
      { name: "i20", bodyType: "hatchback", variants: ["Magna", "Sportz", "Sportz iVT", "Asta", "Asta(O)", "Asta(O) iVT", "N Line N6", "N Line N8", "N Line N8 iVT"] },
      { name: "Aura", bodyType: "sedan", variants: ["E", "S", "S CNG", "SX", "SX+", "SX+ AMT"] },
      { name: "Verna", bodyType: "sedan", variants: ["EX", "S", "S(O)", "SX", "SX(O)", "SX(O) Turbo DCT"] },
      { name: "Venue", bodyType: "suv", variants: ["E", "S", "S+", "S(O)", "SX", "SX(O)", "SX(O) DCT"] },
      { name: "Creta", bodyType: "suv", variants: ["E", "EX", "S", "S+", "SX", "SX(O)", "SX Tech DCT"] },
      { name: "Alcazar", bodyType: "suv", variants: ["Prestige", "Prestige (O)", "Platinum", "Platinum (O)", "Signature"] },
      { name: "Tucson", bodyType: "suv", variants: ["Platinum", "Platinum AT", "Signature", "Signature AT"] },
      { name: "Exter", bodyType: "suv", variants: ["EX", "S", "S+", "SX", "SX(O)", "SX Connect", "SX(O) Connect", "Knight"] },
      { name: "i20 N Line", bodyType: "hatchback", variants: ["N6", "N6 iVT", "N8", "N8 DCT"] },
      { name: "Ioniq 5", bodyType: "suv", variants: ["Standard Range", "Long Range", "Long Range AWD"] },
      { name: "Creta N Line", bodyType: "suv", variants: ["N8", "N8 DCT", "N10", "N10 DCT"] },
      { name: "Creta EV", bodyType: "suv", variants: ["Executive", "Smart", "Premium", "Excellence"] },
    ],
  },
  {
    brand: "Tata",
    models: [
      { name: "Tiago", bodyType: "hatchback", variants: ["XE", "XT", "XZ", "XZ+", "XZ+ DT", "NRG"] },
      { name: "Altroz", bodyType: "hatchback", variants: ["XE", "XE+", "XM", "XM+", "XT", "XZ", "XZ+", "XZ+(O)", "Racer"] },
      { name: "Tigor", bodyType: "sedan", variants: ["XE", "XM", "XM+", "XT", "XZ", "XZ+", "XZ+ DT"] },
      { name: "Punch", bodyType: "suv", variants: ["Pure", "Adventure", "Accomplished", "Creative", "Creative+"] },
      { name: "Nexon", bodyType: "suv", variants: ["Smart", "Smart+", "Pure", "Pure+", "Creative", "Creative+", "Fearless", "Fearless+"] },
      { name: "Harrier", bodyType: "suv", variants: ["Smart", "Pure", "Pure+", "Adventure", "Adventure+", "Fearless", "Fearless+"] },
      { name: "Safari", bodyType: "suv", variants: ["Smart", "Pure", "Pure+", "Adventure", "Adventure+", "Accomplished", "Accomplished+"] },
      { name: "Tiago EV", bodyType: "hatchback", variants: ["XE", "XT", "XZ+", "XZ+ Tech LUX", "XZ+ Long Range"] },
      { name: "Tigor EV", bodyType: "sedan", variants: ["XE", "XM", "XZ+", "XZ+ LUX"] },
      { name: "Nexon EV", bodyType: "suv", variants: ["Creative", "Creative+", "Fearless", "Fearless+", "Empowered", "Empowered+"] },
      { name: "Punch EV", bodyType: "suv", variants: ["Smart", "Adventure", "Accomplished", "Accomplished+"] },
      { name: "Curvv", bodyType: "suv", variants: ["Smart", "Pure", "Pure+", "Creative", "Creative+", "Accomplished", "Accomplished+"] },
      { name: "Curvv EV", bodyType: "suv", variants: ["Creative", "Creative+", "Accomplished", "Accomplished+", "Empowered", "Empowered+"] },
    ],
  },
  {
    brand: "Mahindra",
    models: [
      { name: "Bolero", bodyType: "suv", variants: ["B4", "B6", "B6 (O)"] },
      { name: "Bolero Neo", bodyType: "suv", variants: ["N4", "N8", "N10", "N10 (O)"] },
      { name: "Scorpio N", bodyType: "suv", variants: ["Z4", "Z6", "Z8", "Z8 L", "Z8 Select"] },
      { name: "Scorpio Classic", bodyType: "suv", variants: ["S", "S 11"] },
      { name: "XUV 3XO", bodyType: "suv", variants: ["MX1", "MX2", "MX3", "AX3", "AX5", "AX7", "AX7 L"] },
      { name: "XUV700", bodyType: "suv", variants: ["MX", "AX3", "AX5", "AX7", "AX7 L"] },
      { name: "Thar", bodyType: "suv", variants: ["AX Std", "AX (O)", "LX", "LX Hard Top"] },
      { name: "Thar Roxx", bodyType: "suv", variants: ["MX1", "MX3", "AX3", "AX5", "AX7", "AX7 L"] },
      { name: "XUV400", bodyType: "suv", variants: ["EC", "EL", "EL Pro"] },
      { name: "BE 6", bodyType: "suv", variants: ["Pack One", "Pack Two", "Pack Three"] },
      { name: "XEV 9e", bodyType: "suv", variants: ["Pack One", "Pack Two", "Pack Three"] },
      { name: "Marazzo", bodyType: "van", variants: ["M2", "M4", "M6", "M8"] },
    ],
  },
  {
    brand: "Honda",
    models: [
      { name: "City", bodyType: "sedan", variants: ["V", "V MT", "VX", "VX CVT", "ZX", "ZX CVT"] },
      { name: "City Hybrid", bodyType: "sedan", variants: ["V", "ZX"] },
      { name: "Amaze", bodyType: "sedan", variants: ["E", "S", "S CVT", "VX", "VX CVT"] },
      { name: "Elevate", bodyType: "suv", variants: ["SV", "V", "VX", "VX CVT", "ZX", "ZX CVT"] },
      { name: "WR-V", bodyType: "suv", variants: ["S", "VX", "VX Diesel"] },
    ],
  },
  {
    brand: "Toyota",
    models: [
      { name: "Glanza", bodyType: "hatchback", variants: ["E", "S", "S AMT", "G", "G AMT", "V", "V AMT"] },
      { name: "Urban Cruiser Taisor", bodyType: "suv", variants: ["E", "S", "S+", "G", "V"] },
      { name: "Rumion", bodyType: "van", variants: ["E", "S", "G", "G AT"] },
      { name: "Urban Cruiser Hyryder", bodyType: "suv", variants: ["E", "S", "G", "V", "V AT"] },
      { name: "Innova Crysta", bodyType: "van", variants: ["GX", "GX AT", "VX", "VX AT", "ZX", "ZX AT"] },
      { name: "Innova Hycross", bodyType: "van", variants: ["G", "GX", "VX", "VX (O)", "ZX", "ZX (O)"] },
      { name: "Fortuner", bodyType: "suv", variants: ["4x2 MT", "4x2 AT", "4x4 MT", "4x4 AT", "Legender", "GR Sport"] },
      { name: "Hilux", bodyType: "truck", variants: ["Std MT", "High MT", "High AT"] },
      { name: "Camry", bodyType: "sedan", variants: ["Hybrid"] },
      { name: "Land Cruiser 300", bodyType: "suv", variants: ["GX-R", "VX-R", "ZX"] },
      { name: "Vellfire", bodyType: "van", variants: ["Executive Lounge"] },
    ],
  },
  {
    brand: "Kia",
    models: [
      { name: "Seltos", bodyType: "suv", variants: ["HTE", "HTK", "HTK+", "HTX", "HTX+", "GTX", "GTX+", "X-Line"] },
      { name: "Sonet", bodyType: "suv", variants: ["HTE", "HTK", "HTK+", "HTX", "HTX+", "GTX+", "X-Line"] },
      { name: "Carens", bodyType: "van", variants: ["Premium", "Prestige", "Prestige+", "Luxury", "Luxury+"] },
      { name: "EV6", bodyType: "suv", variants: ["RWD", "AWD", "GT Line RWD", "GT Line AWD", "GT"] },
      { name: "Carnival", bodyType: "van", variants: ["Premium", "Prestige", "Limousine", "Limousine+"] },
      { name: "EV9", bodyType: "suv", variants: ["GT Line", "GT Line AWD"] },
      { name: "Syros", bodyType: "suv", variants: ["HTE", "HTK", "HTK+", "HTX", "HTX+", "GTX+"] },
    ],
  },
  {
    brand: "MG",
    models: [
      { name: "Hector", bodyType: "suv", variants: ["Style", "Super", "Smart", "Sharp", "Sharp Pro", "Savvy", "Savvy Pro"] },
      { name: "Hector Plus", bodyType: "suv", variants: ["Style", "Super", "Smart", "Sharp", "Savvy"] },
      { name: "Astor", bodyType: "suv", variants: ["Style", "Super", "Smart", "Sharp", "Savvy"] },
      { name: "Gloster", bodyType: "suv", variants: ["Super", "Smart", "Sharp", "Savvy"] },
      { name: "ZS EV", bodyType: "suv", variants: ["Excite", "Exclusive", "Exclusive Pro"] },
      { name: "Comet EV", bodyType: "hatchback", variants: ["Pace", "Play"] },
      { name: "Windsor EV", bodyType: "suv", variants: ["Excite", "Exclusive", "Essence"] },
    ],
  },
  {
    brand: "Volkswagen",
    models: [
      { name: "Polo", bodyType: "hatchback", variants: ["Comfortline", "Highline", "Highline Plus", "GT Line", "GT TSI"] },
      { name: "Virtus", bodyType: "sedan", variants: ["Comfortline", "Highline", "Topline", "GT", "GT+"] },
      { name: "Taigun", bodyType: "suv", variants: ["Comfortline", "Highline", "Topline", "GT", "GT+"] },
      { name: "Tiguan", bodyType: "suv", variants: ["Elegance", "Exclusive"] },
    ],
  },
  {
    brand: "Skoda",
    models: [
      { name: "Slavia", bodyType: "sedan", variants: ["Active", "Ambition", "Style", "Monte Carlo", "Laurin & Klement"] },
      { name: "Kushaq", bodyType: "suv", variants: ["Active", "Ambition", "Style", "Monte Carlo", "Laurin & Klement"] },
      { name: "Superb", bodyType: "sedan", variants: ["Sportline", "Laurin & Klement"] },
      { name: "Kodiaq", bodyType: "suv", variants: ["Style", "Sportline", "Laurin & Klement"] },
      { name: "Kylaq", bodyType: "suv", variants: ["Classic", "Signature", "Signature+", "Prestige", "Prestige+"] },
    ],
  },
  {
    brand: "Renault",
    models: [
      { name: "Kwid", bodyType: "hatchback", variants: ["RXE", "RXL", "RXT", "RXT (O)", "Climber"] },
      { name: "Triber", bodyType: "van", variants: ["RXE", "RXL", "RXT", "RXZ", "RXZ AMT"] },
      { name: "Kiger", bodyType: "suv", variants: ["RXE", "RXL", "RXT", "RXT (O)", "RXZ", "RXZ Turbo"] },
    ],
  },
  {
    brand: "Nissan",
    models: [
      { name: "Magnite", bodyType: "suv", variants: ["XE", "XL", "XV", "XV Premium", "XV Premium (O)", "XV Premium Turbo CVT"] },
    ],
  },
  {
    brand: "Jeep",
    models: [
      { name: "Compass", bodyType: "suv", variants: ["Sport", "Longitude", "Limited", "Limited Plus", "Model S", "Trailhawk"] },
      { name: "Meridian", bodyType: "suv", variants: ["Limited", "Limited (O)", "Overland"] },
      { name: "Grand Cherokee", bodyType: "suv", variants: ["Limited", "Overland", "Summit Reserve", "Trailhawk"] },
      { name: "Wrangler", bodyType: "suv", variants: ["Unlimited", "Rubicon"] },
    ],
  },
  {
    brand: "BMW",
    models: [
      { name: "2 Series Gran Coupe", bodyType: "sedan", variants: ["220i Sport", "220i M Sport", "M235i xDrive"] },
      { name: "3 Series", bodyType: "sedan", variants: ["320i Sport", "320Ld Luxury", "330i M Sport", "M340i xDrive"] },
      { name: "5 Series", bodyType: "sedan", variants: ["520d M Sport", "530i M Sport", "530d M Sport"] },
      { name: "7 Series", bodyType: "sedan", variants: ["740i M Sport", "735d M Sport"] },
      { name: "X1", bodyType: "suv", variants: ["sDrive 18i", "sDrive 20i M Sport", "xDrive 20d M Sport"] },
      { name: "X3", bodyType: "suv", variants: ["xDrive 20i", "xDrive 20d", "xDrive 30i M Sport", "M40i"] },
      { name: "X5", bodyType: "suv", variants: ["xDrive 30d", "xDrive 40i M Sport", "M50i"] },
      { name: "X7", bodyType: "suv", variants: ["xDrive 40i", "xDrive 40d M Sport", "M60i xDrive"] },
      { name: "iX1", bodyType: "suv", variants: ["xDrive 30", "eDrive 20"] },
      { name: "i4", bodyType: "sedan", variants: ["eDrive 35", "eDrive 40", "M50"] },
      { name: "i7", bodyType: "sedan", variants: ["xDrive 60", "M70 xDrive"] },
      { name: "iX", bodyType: "suv", variants: ["xDrive 40", "xDrive 50", "M60"] },
    ],
  },
  {
    brand: "Mercedes-Benz",
    models: [
      { name: "A-Class Limousine", bodyType: "sedan", variants: ["A200", "A200d", "AMG A35"] },
      { name: "C-Class", bodyType: "sedan", variants: ["C200", "C220d", "C300d", "AMG C43"] },
      { name: "E-Class", bodyType: "sedan", variants: ["E200", "E220d", "E350", "AMG E53"] },
      { name: "S-Class", bodyType: "sedan", variants: ["S350d", "S450", "S500", "Maybach S580"] },
      { name: "GLA", bodyType: "suv", variants: ["200", "200d", "220d", "AMG GLA 35"] },
      { name: "GLB", bodyType: "suv", variants: ["220d", "AMG GLB 35"] },
      { name: "GLC", bodyType: "suv", variants: ["220d", "300", "AMG GLC 43"] },
      { name: "GLE", bodyType: "suv", variants: ["300d", "450", "AMG GLE 53"] },
      { name: "GLS", bodyType: "suv", variants: ["400d", "450", "Maybach 600"] },
      { name: "EQB", bodyType: "suv", variants: ["250+", "350 4MATIC"] },
      { name: "EQS", bodyType: "sedan", variants: ["450+", "580 4MATIC", "AMG EQS 53"] },
      { name: "V-Class", bodyType: "van", variants: ["Expression", "Exclusive", "Elite"] },
    ],
  },
  {
    brand: "Audi",
    models: [
      { name: "A4", bodyType: "sedan", variants: ["Premium", "Premium Plus", "Technology"] },
      { name: "A6", bodyType: "sedan", variants: ["Premium Plus", "Technology"] },
      { name: "A8 L", bodyType: "sedan", variants: ["Technology", "Plus"] },
      { name: "Q3", bodyType: "suv", variants: ["Premium Plus", "Technology"] },
      { name: "Q5", bodyType: "suv", variants: ["Premium Plus", "Technology"] },
      { name: "Q7", bodyType: "suv", variants: ["Premium Plus", "Technology"] },
      { name: "Q8", bodyType: "suv", variants: ["Celebration", "Technology"] },
      { name: "e-tron", bodyType: "suv", variants: ["50", "55", "Sportback 55"] },
      { name: "e-tron GT", bodyType: "sedan", variants: ["RS e-tron GT"] },
    ],
  },
  {
    brand: "Volvo",
    models: [
      { name: "XC40", bodyType: "suv", variants: ["B4 Momentum", "B4 Inscription", "Recharge"] },
      { name: "XC60", bodyType: "suv", variants: ["B5 Momentum", "B5 Inscription", "Recharge"] },
      { name: "XC90", bodyType: "suv", variants: ["B6 Momentum", "B6 Inscription", "Recharge"] },
      { name: "S60", bodyType: "sedan", variants: ["B4 Momentum", "B4 Inscription"] },
      { name: "S90", bodyType: "sedan", variants: ["B5 Inscription", "Recharge"] },
      { name: "C40 Recharge", bodyType: "suv", variants: ["Plus", "Ultimate"] },
    ],
  },
  {
    brand: "Land Rover",
    models: [
      { name: "Defender", bodyType: "suv", variants: ["90 S", "90 SE", "110 S", "110 SE", "110 HSE", "110 X", "130 SE"] },
      { name: "Discovery Sport", bodyType: "suv", variants: ["S", "R-Dynamic S", "R-Dynamic SE", "R-Dynamic HSE"] },
      { name: "Range Rover Evoque", bodyType: "suv", variants: ["S", "SE", "HSE", "R-Dynamic SE"] },
      { name: "Range Rover Velar", bodyType: "suv", variants: ["S", "SE", "R-Dynamic SE", "R-Dynamic HSE"] },
      { name: "Range Rover Sport", bodyType: "suv", variants: ["SE", "Dynamic SE", "Dynamic HSE", "Autobiography", "SV"] },
      { name: "Range Rover", bodyType: "suv", variants: ["SE", "HSE", "Autobiography", "SV", "Autobiography LWB"] },
    ],
  },
  {
    brand: "Porsche",
    models: [
      { name: "Macan", bodyType: "suv", variants: ["Macan", "S", "GTS", "Turbo"] },
      { name: "Cayenne", bodyType: "suv", variants: ["Cayenne", "S", "GTS", "Turbo GT", "E-Hybrid"] },
      { name: "Taycan", bodyType: "sedan", variants: ["4S", "GTS", "Turbo", "Turbo S"] },
      { name: "911", bodyType: "coupe", variants: ["Carrera", "Carrera S", "Targa 4", "Turbo", "Turbo S", "GT3"] },
      { name: "Panamera", bodyType: "sedan", variants: ["Panamera", "4S", "GTS", "Turbo S"] },
    ],
  },
  {
    brand: "Lexus",
    models: [
      { name: "ES", bodyType: "sedan", variants: ["300h Exquisite", "300h Luxury", "300h Ultra Luxury"] },
      { name: "NX", bodyType: "suv", variants: ["350h Exquisite", "350h Luxury", "350h F Sport"] },
      { name: "RX", bodyType: "suv", variants: ["350h Luxury", "350h F Sport", "500h F Sport", "500h Direct4"] },
      { name: "LX", bodyType: "suv", variants: ["500d", "500h"] },
      { name: "LS", bodyType: "sedan", variants: ["500h Nishijin", "500h Luxury"] },
      { name: "LC", bodyType: "coupe", variants: ["500", "500h"] },
    ],
  },
  {
    brand: "Citroen",
    models: [
      { name: "C3", bodyType: "hatchback", variants: ["Live", "Feel", "Feel Dual Tone", "Shine"] },
      { name: "C3 Aircross", bodyType: "suv", variants: ["Live", "Feel", "Shine", "Shine Dual Tone"] },
      { name: "eC3", bodyType: "hatchback", variants: ["Live", "Feel", "Shine"] },
      { name: "Basalt", bodyType: "suv", variants: ["You", "Plus", "Max"] },
    ],
  },
  {
    brand: "Isuzu",
    models: [
      { name: "D-Max V-Cross", bodyType: "truck", variants: ["Z", "Z Prestige", "Hi-Lander"] },
      { name: "MU-X", bodyType: "suv", variants: ["4x2", "4x4"] },
    ],
  },
  {
    brand: "Force",
    models: [
      { name: "Gurkha", bodyType: "suv", variants: ["3 Door", "5 Door"] },
    ],
  },
  {
    brand: "BYD",
    models: [
      { name: "Atto 3", bodyType: "suv", variants: ["Dynamic", "Premium", "Superior"] },
      { name: "Seal", bodyType: "sedan", variants: ["Dynamic", "Premium", "Performance"] },
      { name: "e6", bodyType: "van", variants: ["GL"] },
      { name: "eMAX 7", bodyType: "van", variants: ["Premium", "Superior"] },
    ],
  },
];

// Helper functions for cascading lookups
export function getBrands(): string[] {
  return vehicleDatabase.map((v) => v.brand).sort();
}

export function getModels(brand: string): { name: string; bodyType: string }[] {
  const entry = vehicleDatabase.find((v) => v.brand === brand);
  if (!entry) return [];
  return entry.models.map((m) => ({ name: m.name, bodyType: m.bodyType })).sort((a, b) => a.name.localeCompare(b.name));
}

export function getVariants(brand: string, model: string): string[] {
  const entry = vehicleDatabase.find((v) => v.brand === brand);
  if (!entry) return [];
  const modelEntry = entry.models.find((m) => m.name === model);
  if (!modelEntry) return [];
  return modelEntry.variants;
}

export function getBodyType(brand: string, model: string): string | null {
  const entry = vehicleDatabase.find((v) => v.brand === brand);
  if (!entry) return null;
  const modelEntry = entry.models.find((m) => m.name === model);
  return modelEntry?.bodyType ?? null;
}
