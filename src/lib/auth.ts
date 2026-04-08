export type UserRole = "staff" | "student";

export const SUBJECTS = [
  "Engineering Mathematics",
  "Data Structures & Algorithms",
  "Thermodynamics",
  "Circuit Theory",
  "Control Systems",
] as const;

export type Subject = (typeof SUBJECTS)[number];

// Hardcoded credentials (in a real app these would be in a secure backend)
const CREDENTIALS: { email: string; password: string; role: UserRole; name: string }[] = [
  { email: "staff@srec.ac.in", password: "srec@staff123", role: "staff", name: "Dr. Kumar" },
  { email: "student@srec.ac.in", password: "srec@123", role: "student", name: "John Student" },
  { email: "student2@srec.ac.in", password: "srec@456", role: "student", name: "Jane Student" },
];

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000; // 1 minute

const attemptTracker: Record<string, { count: number; lockedUntil: number }> = {};

export function authenticate(email: string, password: string): {
  success: boolean;
  error?: string;
  role?: UserRole;
  name?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();

  // Email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, error: "Invalid email format." };
  }

  // Brute-force protection
  const tracker = attemptTracker[normalizedEmail];
  if (tracker && tracker.count >= MAX_ATTEMPTS && Date.now() < tracker.lockedUntil) {
    const secsLeft = Math.ceil((tracker.lockedUntil - Date.now()) / 1000);
    return { success: false, error: `Too many attempts. Try again in ${secsLeft}s.` };
  }

  const user = CREDENTIALS.find(
    (c) => c.email === normalizedEmail && c.password === password
  );

  if (!user) {
    // Track failed attempt
    if (!attemptTracker[normalizedEmail]) {
      attemptTracker[normalizedEmail] = { count: 0, lockedUntil: 0 };
    }
    attemptTracker[normalizedEmail].count += 1;
    if (attemptTracker[normalizedEmail].count >= MAX_ATTEMPTS) {
      attemptTracker[normalizedEmail].lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
    return { success: false, error: "Invalid email or password." };
  }

  // Reset on success
  delete attemptTracker[normalizedEmail];
  return { success: true, role: user.role, name: user.name };
}
