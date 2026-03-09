const { createClient } = require('@supabase/supabase-js');

function parseCookieHeader(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

function createStorageFromServerCookies(cookiesApi) {
  return {
    getItem(key) {
      const all = cookiesApi.getAll ? cookiesApi.getAll() : [];
      const found = all.find((item) => item.name === key);
      return found ? found.value : null;
    },
    setItem(key, value) {
      if (!cookiesApi.setAll) return;
      cookiesApi.setAll([{ name: key, value: String(value), options: { path: '/', sameSite: 'lax' } }]);
    },
    removeItem(key) {
      if (!cookiesApi.setAll) return;
      cookiesApi.setAll([{ name: key, value: '', options: { path: '/', maxAge: 0 } }]);
    }
  };
}

function createStorageFromBrowserCookies() {
  return {
    getItem(key) {
      if (typeof document === 'undefined') return null;
      const all = parseCookieHeader(document.cookie || '');
      return Object.prototype.hasOwnProperty.call(all, key) ? all[key] : null;
    },
    setItem(key, value) {
      if (typeof document === 'undefined') return;
      document.cookie = `${key}=${encodeURIComponent(String(value))}; path=/; samesite=lax`;
    },
    removeItem(key) {
      if (typeof document === 'undefined') return;
      document.cookie = `${key}=; path=/; max-age=0`;
    }
  };
}

function createServerClient(url, anonKey, options = {}) {
  const storage = createStorageFromServerCookies(options.cookies || {});
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage
    }
  });
}

function createBrowserClient(url, anonKey) {
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

module.exports = {
  createServerClient,
  createBrowserClient
};
