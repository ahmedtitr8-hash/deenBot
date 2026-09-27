// عميل بسيط للتعامل مع Firestore REST API من داخل Cloudflare Workers
// (Firebase Admin SDK ما يشتغل مباشر على Workers، فنستخدم REST + JWT موقّع بـ Web Crypto)

let cachedToken = null; // { token, expiresAt }

async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const unsigned = `${enc(header)}.${enc(claim)}`;

  const pem = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const key = await importPrivateKey(pem);

  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(unsigned)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsigned}.${sigB64}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Firebase auth failed: " + JSON.stringify(data));
  }

  cachedToken = { token: data.access_token, expiresAt: now + data.expires_in };
  return data.access_token;
}

async function importPrivateKey(pem) {
  const body = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    binary,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

// تحويل قيم JS <-> صيغة حقول Firestore
function toFirestoreValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === "object") return { mapValue: { fields: toFirestoreFields(v) } };
  return { stringValue: String(v) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const k in obj) fields[k] = toFirestoreValue(obj[k]);
  return fields;
}

function fromFirestoreValue(v) {
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return parseInt(v.integerValue, 10);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in v) return fromFirestoreFields(v.mapValue.fields || {});
  return null;
}

function fromFirestoreFields(fields) {
  const obj = {};
  for (const k in fields) obj[k] = fromFirestoreValue(fields[k]);
  return obj;
}

export function firestore(env) {
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

  async function request(path, options = {}) {
    const token = await getAccessToken(env);
    const res = await fetch(`${baseUrl}/${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (res.status === 404) return null;
    const data = await res.json();
    if (data.error) throw new Error(`Firestore error: ${JSON.stringify(data.error)}`);
    return data;
  }

  return {
    // جلب مستند واحد -> يرجع object أو null
    async get(collection, docId) {
      const data = await request(`${collection}/${docId}`);
      if (!data) return null;
      return fromFirestoreFields(data.fields || {});
    },

    // إنشاء/استبدال مستند كامل
    async set(collection, docId, obj) {
      return request(`${collection}/${docId}`, {
        method: "PATCH",
        body: JSON.stringify({ fields: toFirestoreFields(obj) }),
      });
    },

    // جلب كل مستندات مجموعة (بسيط، بدون فلاتر معقدة)
    async list(collection) {
      const data = await request(`${collection}`);
      if (!data || !data.documents) return [];
      return data.documents.map((d) => ({
        id: d.name.split("/").pop(),
        ...fromFirestoreFields(d.fields || {}),
      }));
    },

    async delete(collection, docId) {
      return request(`${collection}/${docId}`, { method: "DELETE" });
    },
  };
}
