import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies();
  const canSet = "set" in cookieStore;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          if (canSet) {
            (cookieStore as any).set({ name, value, ...options });
          }
        },
        remove(name: string, options: any) {
          if (canSet) {
            (cookieStore as any).set({ name, value: "", ...options });
          }
        }
      }
    }
  );
}
