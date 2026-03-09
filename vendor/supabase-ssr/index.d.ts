import { SupabaseClient } from '@supabase/supabase-js';

type CookieSetInput = { name: string; value: string; options?: Record<string, unknown> };

type ServerCookieApi = {
  getAll?: () => Array<{ name: string; value: string }>;
  setAll?: (cookies: CookieSetInput[]) => void;
};

export function createServerClient(url: string, anonKey: string, options?: { cookies?: ServerCookieApi }): SupabaseClient;
export function createBrowserClient(url: string, anonKey: string): SupabaseClient;
