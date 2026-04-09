export type UserRole = "staff" | "student";

export type Semester = "Semester 1" | "Semester 2" | "Semester 3";

export interface SubjectInfo {
  name: string;
  icon: string;
}

export const SEMESTERS: Semester[] = ["Semester 1", "Semester 2", "Semester 3"];

export const SEMESTER_SUBJECTS: Record<Semester, SubjectInfo[]> = {
  "Semester 1": [
    { name: "Programming in C", icon: "Code2" },
    { name: "Engineering Mathematics I", icon: "Calculator" },
    { name: "Digital Logic Design", icon: "Cpu" },
    { name: "Computer Fundamentals", icon: "Monitor" },
    { name: "Environmental Science", icon: "Leaf" },
  ],
  "Semester 2": [
    { name: "Data Structures", icon: "Database" },
    { name: "Engineering Mathematics II", icon: "BarChart3" },
    { name: "Object-Oriented Programming", icon: "FileCode2" },
    { name: "Computer Organization", icon: "Cpu" },
    { name: "Discrete Mathematics", icon: "Binary" },
  ],
  "Semester 3": [
    { name: "Database Management Systems", icon: "Database" },
    { name: "Operating Systems", icon: "Monitor" },
    { name: "Design and Analysis of Algorithms", icon: "Brain" },
    { name: "Computer Networks", icon: "Network" },
    { name: "Software Engineering", icon: "Settings" },
  ],
};

export const SUBJECTS = SEMESTER_SUBJECTS["Semester 3"].map((s) => s.name) as unknown as readonly string[];
export type Subject = string;

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

  const t = attempts[e];
  if (t && t.count >= MAX_ATTEMPTS && Date.now() < t.lockedUntil) {
    const s = Math.ceil((t.lockedUntil - Date.now()) / 1000);
    return { success: false, error: `Too many attempts. Try again in ${s}s.` };
  }

  if (password !== FIXED_PASSWORD) {
    trackFail(e);
    return { success: false, error: "Invalid college email or password." };
  }

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
