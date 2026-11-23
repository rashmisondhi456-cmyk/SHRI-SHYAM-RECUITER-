// Client-side AES-256-GCM encryption for sensitive candidate & interview PII

const APP_SALT = 'shri-shyam-consulting-durg-ats-v1-salt';

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesKey(uid: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(`${uid}:${APP_SALT}`),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(APP_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPII(uid: string, payload: unknown): Promise<string> {
  const json = JSON.stringify(payload);
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    const encoded = toBase64(new TextEncoder().encode(json));
    return `plain.${encoded}`;
  }

  const key = await deriveAesKey(uid);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(json);
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  return `v1.${toBase64(iv)}.${toBase64(new Uint8Array(cipherBuffer))}`;
}

export async function decryptPII<T>(uid: string, encryptedString: string): Promise<T | null> {
  if (!encryptedString) return null;

  try {
    if (encryptedString.startsWith('plain.')) {
      const b64 = encryptedString.slice(6);
      const json = new TextDecoder().decode(fromBase64(b64));
      return JSON.parse(json) as T;
    }

    if (encryptedString.startsWith('v1.') && typeof window !== 'undefined' && window.crypto?.subtle) {
      const parts = encryptedString.split('.');
      if (parts.length !== 3) return null;
      const iv = fromBase64(parts[1]);
      const cipherBytes = fromBase64(parts[2]);
      const key = await deriveAesKey(uid);
      const plainBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        cipherBytes as BufferSource
      );
      const json = new TextDecoder().decode(plainBuffer);
      return JSON.parse(json) as T;
    }

    return null;
  } catch (err) {
    console.warn('PII decryption error:', err);
    return null;
  }
}
