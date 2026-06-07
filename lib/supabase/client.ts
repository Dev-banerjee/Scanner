import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Return a mock client during build if env vars are missing
    if (!supabaseUrl || !supabaseAnonKey) {
        // During SSR/build, return a minimal mock
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                signInWithOAuth: async () => ({ error: null }),
                signOut: async () => ({ error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            }
        } as any;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
