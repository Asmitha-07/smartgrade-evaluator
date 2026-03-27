import { supabase } from "@/integrations/supabase/client";

export type UserRole = "staff" | "student";

export const SUBJECTS = [
  "Engineering Mathematics",
  "Data Structures & Algorithms",
  "Thermodynamics",
  "Circuit Theory",
  "Control Systems",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export async function signUp(email: string, password: string, fullName: string, role: UserRole) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.role as UserRole) ?? null;
}
