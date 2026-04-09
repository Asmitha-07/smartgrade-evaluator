export type UserRole = "staff" | "student";

export type Semester = "Semester 4" | "Semester 5" | "Semester 6";

export interface SubjectInfo {
  name: string;
  icon: string; // lucide icon name
}

export const SEMESTERS: Semester[] = ["Semester 4", "Semester 5", "Semester 6"];

export const SEMESTER_SUBJECTS: Record<Semester, SubjectInfo[]> = {
  "Semester 4": [
    { name: "Discrete Mathematics", icon: "Calculator" },
    { name: "Database Management Systems", icon: "Database" },
    { name: "Computer Architecture", icon: "Cpu" },
    { name: "Object Oriented Programming", icon: "Code2" },
    { name: "Probability & Statistics", icon: "BarChart3" },
    { name: "Environmental Science", icon: "Leaf" },
  ],
  "Semester 5": [
    { name: "Theory of Computation", icon: "Binary" },
    { name: "Web Technologies", icon: "Globe" },
    { name: "Cryptography", icon: "Lock" },
    { name: "Data Analytics", icon: "LineChart" },
    { name: "Mobile Computing", icon: "Smartphone" },
    { name: "Cloud Computing", icon: "Cloud" },
  ],
  "Semester 6": [
    { name: "Artificial Intelligence", icon: "Brain" },
    { name: "Machine Learning", icon: "Sparkles" },
    { name: "Computer Networks", icon: "Network" },
    { name: "Operating Systems", icon: "Monitor" },
    { name: "Compiler Design", icon: "FileCode2" },
    { name: "Software Engineering", icon: "Settings" },
  ],
};

// Legacy compat
export const SUBJECTS = SEMESTER_SUBJECTS["Semester 6"].map((s) => s.name) as unknown as readonly string[];
export type Subject = string;

// Email: name.rollnumber@srec.ac.in (lowercase name, exactly 7-digit roll number)
const EMAIL_REGEX = /^[a-z]+\.\d{7}@srec\.ac\.in$/;
const FIXED_PASSWORD = "srec@123";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const attempts: Record<string, { count: number; lockedUntil: number }> = {};

export function authenticate(
  email: string,
  password: string,
  selectedRole: UserRole
): { success: boolean; error?: string; name?: string; role?: UserRole } {
  const e = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(e)) {
    return { success: false, error: "Invalid college email or password. Email must be: name.rollnumber@srec.ac.in" };
  }

  // Brute-force protection
  const t = attempts[e];
  if (t && t.count >= MAX_ATTEMPTS && Date.now() < t.lockedUntil) {
    const s = Math.ceil((t.lockedUntil - Date.now()) / 1000);
    return { success: false, error: `Too many attempts. Try again in ${s}s.` };
  }

  if (password !== FIXED_PASSWORD) {
    trackFail(e);
    return { success: false, error: "Invalid college email or password." };
  }

  // Extract display name from email (capitalize first letter)
  const rawName = e.split(".")[0];
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  delete attempts[e];
  return { success: true, name: displayName, role: selectedRole };
}

function trackFail(email: string) {
  if (!attempts[email]) attempts[email] = { count: 0, lockedUntil: 0 };
  attempts[email].count += 1;
  if (attempts[email].count >= MAX_ATTEMPTS) {
    attempts[email].lockedUntil = Date.now() + LOCKOUT_MS;
  }
}
