/**
 * Encryption Service
 *
 * Provides secure encryption/decryption using AES-256-GCM with PBKDF2 key derivation.
 * Used for encrypting sensitive data like private keys and mnemonics.
 *
 * Security Features:
 * - AES-256-GCM authenticated encryption
 * - PBKDF2 key derivation (100,000 iterations, SHA-256)
 * - Random salt per encryption (16 bytes)
 * - Random IV per encryption (12 bytes for GCM)
 * - Base64 encoding for storage
 */

/**
 * Encrypts data using AES-256-GCM with password-based key derivation
 *
 * @param data - Plain text data to encrypt (e.g., private key, mnemonic)
 * @param password - User password for key derivation
 * @returns Base64 encoded string containing: salt (16 bytes) + IV (12 bytes) + encrypted data + auth tag
 * @throws Error if encryption fails
 */
export async function encrypt(data: string, password: string): Promise<string> {
  try {
    // Validate inputs
    if (!data || !password) {
      throw new Error('Data and password are required for encryption');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Generate random salt (16 bytes)
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive encryption key from password using PBKDF2
    const keyMaterial = await getKeyMaterial(password);
    const key = await deriveKey(keyMaterial, salt);

    // Convert data to bytes
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);

    // Encrypt data using AES-GCM
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBytes
    );

    // Combine salt + IV + encrypted data
    const encryptedBytes = new Uint8Array(encryptedData);
    const combined = new Uint8Array(salt.length + iv.length + encryptedBytes.length);

    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedBytes, salt.length + iv.length);

    // Convert to base64 for storage
    return arrayBufferToBase64(combined);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
    throw new Error('Encryption failed: Unknown error');
  }
}

/**
 * Decrypts data that was encrypted with the encrypt() function
 *
 * @param encryptedData - Base64 encoded encrypted data (salt + IV + ciphertext + auth tag)
 * @param password - User password used for encryption
 * @returns Decrypted plain text data
 * @throws Error if decryption fails (wrong password, corrupted data, etc.)
 */
export async function decrypt(encryptedData: string, password: string): Promise<string> {
  try {
    // Validate inputs
    if (!encryptedData || !password) {
      throw new Error('Encrypted data and password are required for decryption');
    }

    // Convert from base64 to bytes
    const combined = base64ToArrayBuffer(encryptedData);

    // Extract salt (first 16 bytes)
    const salt = combined.slice(0, 16);

    // Extract IV (next 12 bytes)
    const iv = combined.slice(16, 28);

    // Extract encrypted data (remaining bytes)
    const encryptedBytes = combined.slice(28);

    // Derive the same key from password and salt
    const keyMaterial = await getKeyMaterial(password);
    const key = await deriveKey(keyMaterial, salt);

    // Decrypt data using AES-GCM
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedBytes
    );

    // Convert decrypted bytes to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    if (error instanceof Error) {
      // GCM authentication failure usually means wrong password
      if (error.message.includes('operation-specific reason')) {
        throw new Error('Decryption failed: Invalid password or corrupted data');
      }
      throw new Error(`Decryption failed: ${error.message}`);
    }
    throw new Error('Decryption failed: Unknown error');
  }
}

/**
 * Creates key material from password for PBKDF2
 */
async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  return await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
}

/**
 * Derives AES-256 key from key material using PBKDF2
 *
 * @param keyMaterial - Key material from password
 * @param salt - Random salt for key derivation
 * @returns AES-256-GCM key
 */
async function deriveKey(keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 100,000 iterations for strong key derivation
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256, // 256-bit key
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Converts Uint8Array to base64 string
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const len = buffer.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }

  return btoa(binary);
}

/**
 * Converts base64 string to Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}
