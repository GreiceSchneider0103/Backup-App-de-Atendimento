const { createClient } = require('@supabase/supabase-js');

const COOKIE_CHUNK_SIZE = 3800;

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

function splitCookieValue(value) {
  if (value.length <= COOKIE_CHUNK_SIZE) return [value];
  const chunks = [];
  for (let i = 0; i < value.length; i += COOKIE_CHUNK_SIZE) {
    chunks.push(value.slice(i, i + COOKIE_CHUNK_SIZE));
  }
  return chunks;
}

function getCookieRecordsByKey(allCookies, key) {
  const direct = allCookies.find((item) => item.name === key);
  if (direct) return [direct];

  const chunks = allCookies
    .filter((item) => item.name === key || item.name.startsWith(`${key}.`))
    .sort((a, b) => {
      const ai = a.name === key ? -1 : Number(a.name.slice(key.length + 1));
      const bi = b.name === key ? -1 : Number(b.name.slice(key.length + 1));
      return ai - bi;
    });

  return chunks;
}

function buildCookieSetPayload(key, value, baseOptions = {}) {
  const chunks = splitCookieValue(String(value));
  if (chunks.length === 1) {
    return [{
      name: key,
      value: chunks[0],
      options: { path: '/', sameSite: 'lax', ...baseOptions }
    }];
  }

  return chunks.map((chunk, index) => ({
    name: `${key}.${index}`,
    value: chunk,
    options: { path: '/', sameSite: 'lax', ...baseOptions }
  }));
}

function buildCookieClearPayload(allCookies, key) {
  const targets = getCookieRecordsByKey(allCookies, key).map((item) => item.name);
  if (!targets.length) targets.push(key);

  return targets.map((name) => ({
    name,
    value: '',
    options: { path: '/', maxAge: 0 }
  }));
}

function createStorageFromServerCookies(cookiesApi) {
  return {
    getItem(key) {
      const all = cookiesApi.getAll ? cookiesApi.getAll() : [];
      const records = getCookieRecordsByKey(all, key);
      if (!records.length) return null;
      return records.map((item) => item.value).join('');
    },
    setItem(key, value) {
      if (!cookiesApi.setAll) return;
      const all = cookiesApi.getAll ? cookiesApi.getAll() : [];
      const clearPayload = buildCookieClearPayload(all, key);
      const setPayload = buildCookieSetPayload(key, value);
      cookiesApi.setAll([...clearPayload, ...setPayload]);
    },
    removeItem(key) {
      if (!cookiesApi.setAll) return;
      const all = cookiesApi.getAll ? cookiesApi.getAll() : [];
      cookiesApi.setAll(buildCookieClearPayload(all, key));
    }
  };
}

function createStorageFromBrowserCookies() {
  return {
    getItem(key) {
      if (typeof document === 'undefined') return null;
      const all = parseCookieHeader(document.cookie || '');
      if (Object.prototype.hasOwnProperty.call(all, key)) return all[key];

      const chunkKeys = Object.keys(all)
        .filter((cookieKey) => cookieKey === key || cookieKey.startsWith(`${key}.`))
        .sort((a, b) => {
          const ai = a === key ? -1 : Number(a.slice(key.length + 1));
          const bi = b === key ? -1 : Number(b.slice(key.length + 1));
          return ai - bi;
        });

      if (!chunkKeys.length) return null;
      return chunkKeys.map((cookieKey) => all[cookieKey]).join('');
    },
    setItem(key, value) {
      if (typeof document === 'undefined') return;

      const parsed = parseCookieHeader(document.cookie || '');
      const existingChunkKeys = Object.keys(parsed).filter((cookieKey) => cookieKey === key || cookieKey.startsWith(`${key}.`));
      existingChunkKeys.forEach((cookieKey) => {
        document.cookie = `${cookieKey}=; path=/; max-age=0`;
      });

      const payload = buildCookieSetPayload(key, value);
      payload.forEach((entry) => {
        document.cookie = `${entry.name}=${encodeURIComponent(entry.value)}; path=/; samesite=lax`;
      });
    },
    removeItem(key) {
      if (typeof document === 'undefined') return;
      const parsed = parseCookieHeader(document.cookie || '');
      const targets = Object.keys(parsed).filter((cookieKey) => cookieKey === key || cookieKey.startsWith(`${key}.`));
      (targets.length ? targets : [key]).forEach((cookieKey) => {
        document.cookie = `${cookieKey}=; path=/; max-age=0`;
      });
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
