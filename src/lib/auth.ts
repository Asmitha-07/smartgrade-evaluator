export type UserRole = "staff" | "student";

export const SUBJECTS = [
  "Engineering Mathematics",
  "Data Structures & Algorithms",
  "Thermodynamics",
  "Circuit Theory",
  "Control Systems",
] as const;

export type Subject = (typeof SUBJECTS)[number];

// Email format: name.rollnumber@gmail.com
const EMAIL_REGEX = /^[a-z]+\.\d{7}@gmail\.com$/;

const USERS: { name: string; email: string; password: string; role: UserRole }[] = [
  { name: "Professor", email: "professor.0000001@gmail.com", password: "staff@123", role: "staff" },
  { name: "Agalya", email: "agalya.2201010@gmail.com", password: "srec@123", role: "student" },
  { name: "John", email: "john.2201020@gmail.com", password: "srec@456", role: "student" },
];

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const attempts: Record<string, { count: number; lockedUntil: number }> = {};

export function authenticate(
  email: string,
  password: string,
  selectedRole: UserRole
): { success: boolean; error?: string; name?: string; role?: UserRole } {
  const e = email.trim().toLowerCase();

  // Strict email format check
  if (!EMAIL_REGEX.test(e)) {
    return { success: false, error: "Invalid email format. Use: name.rollnumber@gmail.com (e.g. agalya.2201010@gmail.com)" };
  }

  // Brute-force protection
  const t = attempts[e];
  if (t && t.count >= MAX_ATTEMPTS && Date.now() < t.lockedUntil) {
    const s = Math.ceil((t.lockedUntil - Date.now()) / 1000);
    return { success: false, error: `Too many attempts. Try again in ${s}s.` };
  }

  const user = USERS.find((u) => u.email === e && u.password === password);

  if (!user || user.role !== selectedRole) {
    trackFail(e);
    return { success: false, error: "Invalid email format or credentials." };
  }

  delete attempts[e];
  return { success: true, name: user.name, role: user.role };
}

function trackFail(email: string) {
  if (!attempts[email]) attempts[email] = { count: 0, lockedUntil: 0 };
  attempts[email].count += 1;
  if (attempts[email].count >= MAX_ATTEMPTS) {
    attempts[email].lockedUntil = Date.now() + LOCKOUT_MS;
  }
}
