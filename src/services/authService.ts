import { hasSupabaseConfig, supabase } from "../supabase";

export async function signIn(email: string, password: string): Promise<{ ok: boolean; message: string }> {
  if (!hasSupabaseConfig || !supabase) {
    if (email && password) return { ok: true, message: "Mode demo aktif." };
    return { ok: false, message: "Sila isi emel dan kata laluan." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Log masuk berjaya." };
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseConfig || !supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUserEmail(): Promise<string | null> {
  if (!hasSupabaseConfig || !supabase) return "admin@klinik.com";
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}
