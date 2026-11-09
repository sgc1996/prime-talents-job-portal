export interface SeedProvince {
  name: string;
  code: string;
  districts: { name: string; code: string }[];
}

export const SRI_LANKA_LOCATIONS: SeedProvince[] = [
  {
    name: "Western",
    code: "WP",
    districts: [
      { name: "Colombo", code: "COL" },
      { name: "Gampaha", code: "GAM" },
      { name: "Kalutara", code: "KAL" },
    ],
  },
  {
    name: "Central",
    code: "CP",
    districts: [
      { name: "Kandy", code: "KAN" },
      { name: "Matale", code: "MTL" },
      { name: "Nuwara Eliya", code: "NUE" },
    ],
  },
  {
    name: "Southern",
    code: "SP",
    districts: [
      { name: "Galle", code: "GAL" },
      { name: "Matara", code: "MAT" },
      { name: "Hambantota", code: "HAM" },
    ],
  },
  {
    name: "Northern",
    code: "NP",
    districts: [
      { name: "Jaffna", code: "JAF" },
      { name: "Kilinochchi", code: "KIL" },
      { name: "Mannar", code: "MAN" },
      { name: "Vavuniya", code: "VAV" },
      { name: "Mullaitivu", code: "MUL" },
    ],
  },
  {
    name: "Eastern",
    code: "EP",
    districts: [
      { name: "Batticaloa", code: "BAT" },
      { name: "Ampara", code: "AMP" },
      { name: "Trincomalee", code: "TRI" },
    ],
  },
  {
    name: "North Western",
    code: "NWP",
    districts: [
      { name: "Kurunegala", code: "KUR" },
      { name: "Puttalam", code: "PUT" },
    ],
  },
  {
    name: "North Central",
    code: "NCP",
    districts: [
      { name: "Anuradhapura", code: "ANU" },
      { name: "Polonnaruwa", code: "POL" },
    ],
  },
  {
    name: "Uva",
    code: "UP",
    districts: [
      { name: "Badulla", code: "BAD" },
      { name: "Monaragala", code: "MON" },
    ],
  },
  {
    name: "Sabaragamuwa",
    code: "SGP",
    districts: [
      { name: "Ratnapura", code: "RAT" },
      { name: "Kegalle", code: "KEG" },
    ],
  },
];
