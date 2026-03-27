export type UserRole = "staff" | "student";

export const SUBJECTS = [
  "Engineering Mathematics",
  "Data Structures & Algorithms",
  "Thermodynamics",
  "Circuit Theory",
  "Control Systems",
] as const;

export type Subject = (typeof SUBJECTS)[number];
