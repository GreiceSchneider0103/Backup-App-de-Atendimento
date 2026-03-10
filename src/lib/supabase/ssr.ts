import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type CookieSetInput = { name: string; value: string; options?: Record<string, unknown> };

type ServerCookieApi = {
  getAll?: () => Array<{ name: string; value: string }>;
  setAll?: (cookies: CookieSetInput[]) => void;
};

const COOKIE_CHUNK_SIZE = 3800;

function parseCookieHeader(cookieHeader: string) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;

    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }

  return out;
}

function splitCookieValue(value: string) {
  if (value.length <= COOKIE_CHUNK_SIZE) return [value];

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += COOKIE_CHUNK_SIZE) {
    chunks.push(value.slice(i, i + COOKIE_CHUNK_SIZE));
  }

  return chunks;
}

function getCookieRecordsByKey(allCookies: Array<{ name: string; value: string }>, key: string) {
  const direct = allCookies.find((item) => item.name === key);
  if (direct) return [direct];

  return allCookies
    .filter((item) => item.name === key || item.name.startsWith(`${key}.`))
    .sort((a, b) => {
      const ai = a.name === key ? -1 : Number(a.name.slice(key.length + 1));
      const bi = b.name === key ? -1 : Number(b.name.slice(key.length + 1));
      return ai - bi;
    });
}

function buildCookieSetPayload(key: string, value: string, baseOptions: Record<string, unknown> = {}) {
  const chunks = splitCookieValue(String(value));

  if (chunks.length === 1) {
    return [{ name: key, value: chunks[0], options: { path: "/", sameSite: "lax", ...baseOptions } }];
  }

  return chunks.map((chunk, index) => ({
    name: `${key}.${index}`,
    value: chunk,
    options: { path: "/", sameSite: "lax", ...baseOptions }
  }));
}

function buildCookieClearPayload(allCookies: Array<{ name: string; value: string }>, key: string) {
  const targets = getCookieRecordsByKey(allCookies, key).map((item) => item.name);
  if (!targets.length) targets.push(key);

  return targets.map((name) => ({
    name,
    value: "",
    options: { path: "/", maxAge: 0 }
  }));
}

function createStorageFromServerCookies(cookiesApi: ServerCookieApi) {
  return {
    getItem(key: string) {
      const all = cookiesApi.getAll ? cookiesApi.getAll() : [];
      const records = getCookieRecordsByKey(all, key);
      if (!records.length) return null;
      return records.map((item) => item.value).join("");
    },
    setItem(key: string, value: string) {
      if (!cookiesApi.setAll) return;
      const all = cookiesApi.getAll ? cookiesApi.getAll() : [];
      const clearPayload = buildCookieClearPayload(all, key);
      const setPayload = buildCookieSetPayload(key, value);
      cookiesApi.setAll([...clearPayload, ...setPayload]);
    },
    removeItem(key: string) {
      if (!cookiesApi.setAll) return;
      const all = cookiesApi.getAll ? cookiesApi.getAll() : [];
      cookiesApi.setAll(buildCookieClearPayload(all, key));
    }
  };
}

function createStorageFromBrowserCookies() {
  return {
    getItem(key: string) {
      if (typeof document === "undefined") return null;

      const all = parseCookieHeader(document.cookie || "");
      if (Object.prototype.hasOwnProperty.call(all, key)) return all[key];

      const chunkKeys = Object.keys(all)
        .filter((cookieKey) => cookieKey === key || cookieKey.startsWith(`${key}.`))
        .sort((a, b) => {
          const ai = a === key ? -1 : Number(a.slice(key.length + 1));
          const bi = b === key ? -1 : Number(b.slice(key.length + 1));
          return ai - bi;
        });

      if (!chunkKeys.length) return null;
      return chunkKeys.map((cookieKey) => all[cookieKey]).join("");
    },
    setItem(key: string, value: string) {
      if (typeof document === "undefined") return;

      const parsed = parseCookieHeader(document.cookie || "");
      const existingChunkKeys = Object.keys(parsed).filter((cookieKey) => cookieKey === key || cookieKey.startsWith(`${key}.`));
      existingChunkKeys.forEach((cookieKey) => {
        document.cookie = `${cookieKey}=; path=/; max-age=0`;
      });

      const payload = buildCookieSetPayload(key, value);
      payload.forEach((entry) => {
        document.cookie = `${entry.name}=${encodeURIComponent(entry.value)}; path=/; samesite=lax`;
      });
    },
    removeItem(key: string) {
      if (typeof document === "undefined") return;

      const parsed = parseCookieHeader(document.cookie || "");
      const targets = Object.keys(parsed).filter((cookieKey) => cookieKey === key || cookieKey.startsWith(`${key}.`));
      (targets.length ? targets : [key]).forEach((cookieKey) => {
        document.cookie = `${cookieKey}=; path=/; max-age=0`;
      });
    }
  };
}

export function createServerClient(url: string, anonKey: string, options: { cookies?: ServerCookieApi } = {}): SupabaseClient {
  const storage = createStorageFromServerCookies(options.cookies ?? {});

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage
    }
  });
}

export function createBrowserClient(url: string, anonKey: string): SupabaseClient {
  const storage = createStorageFromBrowserCookies();

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage
    }
  });
}
