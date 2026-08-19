export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export const VERIFICATION_STAGES = [
  "UNVERIFIED",
  "AI_DETECTED",
  "SOURCE_VERIFIED",
  "OFFICIAL_RECORD_VERIFIED",
  "CONFIRMED",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STAGES)[number];

export const VERIFICATION_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  AI_DETECTED: "AI detected",
  SOURCE_VERIFIED: "Source verified",
  OFFICIAL_RECORD_VERIFIED: "Official record verified",
  CONFIRMED: "Confirmed",
};

export const DISPUTE_TYPES = [
  "Land dispute",
  "Property dispute",
  "Ownership dispute",
  "Land grabbing",
  "Encroachment",
  "Illegal possession",
  "Boundary dispute",
  "Survey number dispute",
  "Property fraud",
  "Fake land documents",
  "Government land dispute",
  "Court case (property)",
  "Acquisition dispute",
  "Inheritance dispute",
  "Construction dispute",
  "Real estate fraud",
];

export function riskClasses(risk?: string | null) {
  switch ((risk ?? "").toUpperCase()) {
    case "HIGH":
      return "bg-risk-high text-risk-high-foreground";
    case "MEDIUM":
      return "bg-risk-medium text-risk-medium-foreground";
    default:
      return "bg-risk-low text-risk-low-foreground";
  }
}

export function normalizeSurvey(value?: string | null) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9/]/g, "");
}

export function normalizeName(value?: string | null) {
  return (value ?? "").toLowerCase().trim();
}
