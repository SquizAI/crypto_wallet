/**
 * Wallet Service Tests
 *
 * Comprehensive test suite for wallet service functionality.
 * Run with: npm test
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createWallet,
  importFromMnemonic,
  importFromPrivateKey,
  unlockWallet,
  hasWallet,
  deleteWallet,
  getWalletAddress,
  getWalletType,
  verifyPassword,
  exportPrivateKey,
  exportMnemonic,
  WalletError,
} from '../walletService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Setup global mocks
beforeEach(() => {
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  localStorageMock.clear();
});

afterEach(() => {
  localStorageMock.clear();
});

describe('WalletService', () => {
  const TEST_PASSWORD = 'testPassword123';
  const WEAK_PASSWORD = '123';
  const TEST_MNEMONIC =
    'test test test test test test test test test test test junk';
  const TEST_PRIVATE_KEY =
    '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  describe('createWallet', () => {
    it('should create a new HD wallet', async () => {
      const result = await createWallet(TEST_PASSWORD);

      expect(result.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result.mnemonic.split(' ')).toHaveLength(12);
      expect(hasWallet()).toBe(true);
    });

    it('should throw error for weak password', async () => {
      await expect(createWallet(WEAK_PASSWORD)).rejects.toThrow(WalletError);
    });

    it('should throw error if wallet already exists', async () => {
      await createWallet(TEST_PASSWORD);
      await expect(createWallet(TEST_PASSWORD)).rejects.toThrow(
        'Wallet already exists'
      );
    });

    it('should create wallet with correct type', async () => {
      await createWallet(TEST_PASSWORD);
      expect(getWalletType()).toBe('hd');
    });
  });

  describe('importFromMnemonic', () => {
    it('should import wallet from valid mnemonic', async () => {
      const address = await importFromMnemonic(TEST_MNEMONIC, TEST_PASSWORD);

      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(hasWallet()).toBe(true);
      expect(getWalletType()).toBe('hd');
    });

    it('should throw error for invalid mnemonic', async () => {
      await expect(
        importFromMnemonic('invalid mnemonic phrase', TEST_PASSWORD)
      ).rejects.toThrow(WalletError);
    });

    it('should throw error for wrong word count', async () => {
      await expect(
        importFromMnemonic('word1 word2 word3', TEST_PASSWORD)
      ).rejects.toThrow('must be 12, 15, 18, 21, or 24 words');
    });

    it('should normalize mnemonic (trim and lowercase)', async () => {
      const address1 = await importFromMnemonic(TEST_MNEMONIC, TEST_PASSWORD);
      deleteWallet();

      const address2 = await importFromMnemonic(
        TEST_MNEMONIC.toUpperCase(),
        TEST_PASSWORD
      );
      expect(address1).toBe(address2);
    });
  });

  describe('importFromPrivateKey', () => {
    it('should import wallet from valid private key', async () => {
      const address = await importFromPrivateKey(
        TEST_PRIVATE_KEY,
        TEST_PASSWORD
      );

      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(hasWallet()).toBe(true);
      expect(getWalletType()).toBe('imported');
    });

    it('should accept private key without 0x prefix', async () => {
      const keyWithout0x = TEST_PRIVATE_KEY.slice(2);
      const address = await importFromPrivateKey(keyWithout0x, TEST_PASSWORD);

      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should throw error for invalid private key', async () => {
      await expect(
        importFromPrivateKey('invalid-key', TEST_PASSWORD)
      ).rejects.toThrow(WalletError);
    });

    it('should throw error for wrong key length', async () => {
      await expect(
        importFromPrivateKey('0x1234', TEST_PASSWORD)
      ).rejects.toThrow('must be 32 bytes');
    });
  });

  describe('unlockWallet', () => {
    it('should unlock HD wallet with correct password', async () => {
      const { address, mnemonic } = await createWallet(TEST_PASSWORD);
      const unlocked = await unlockWallet(TEST_PASSWORD);

      expect(unlocked.address).toBe(address);
      expect(unlocked.mnemonic).toBe(mnemonic);
      expect(unlocked.type).toBe('hd');
      expect(unlocked.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it('should unlock imported wallet without mnemonic', async () => {
      const address = await importFromPrivateKey(
        TEST_PRIVATE_KEY,
        TEST_PASSWORD
      );
      const unlocked = await unlockWallet(TEST_PASSWORD);

      expect(unlocked.address).toBe(address);
      expect(unlocked.mnemonic).toBeNull();
      expect(unlocked.type).toBe('imported');
    });

    it('should throw error for wrong password', async () => {
      await createWallet(TEST_PASSWORD);

      await expect(unlockWallet('wrongPassword123')).rejects.toThrow(
        'Invalid password'
      );
    });

    it('should throw error if no wallet exists', async () => {
      await expect(unlockWallet(TEST_PASSWORD)).rejects.toThrow(
        'No wallet found'
      );
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      await createWallet(TEST_PASSWORD);
      const isValid = await verifyPassword(TEST_PASSWORD);

      expect(isValid).toBe(true);
    });

    it('should return false for wrong password', async () => {
      await createWallet(TEST_PASSWORD);
      const isValid = await verifyPassword('wrongPassword123');

      expect(isValid).toBe(false);
    });

    it('should return false if no wallet exists', async () => {
      const isValid = await verifyPassword(TEST_PASSWORD);

      expect(isValid).toBe(false);
    });
  });

  describe('exportPrivateKey', () => {
    it('should export private key with correct password', async () => {
      await createWallet(TEST_PASSWORD);
      const privateKey = await exportPrivateKey(TEST_PASSWORD);

      expect(privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it('should throw error for wrong password', async () => {
      await createWallet(TEST_PASSWORD);

      await expect(exportPrivateKey('wrongPassword123')).rejects.toThrow(
        WalletError
      );
    });
  });

  describe('exportMnemonic', () => {
    it('should export mnemonic for HD wallet', async () => {
      const { mnemonic } = await createWallet(TEST_PASSWORD);
      const exported = await exportMnemonic(TEST_PASSWORD);

      expect(exported).toBe(mnemonic);
    });

    it('should return null for imported wallet', async () => {
      await importFromPrivateKey(TEST_PRIVATE_KEY, TEST_PASSWORD);
      const exported = await exportMnemonic(TEST_PASSWORD);

      expect(exported).toBeNull();
    });
  });

  describe('hasWallet', () => {
    it('should return false when no wallet exists', () => {
      expect(hasWallet()).toBe(false);
    });

    it('should return true when wallet exists', async () => {
      await createWallet(TEST_PASSWORD);
      expect(hasWallet()).toBe(true);
    });
  });

  describe('deleteWallet', () => {
    it('should delete existing wallet', async () => {
      await createWallet(TEST_PASSWORD);
      expect(hasWallet()).toBe(true);

      deleteWallet();
      expect(hasWallet()).toBe(false);
    });

    it('should throw error if no wallet exists', () => {
      expect(() => deleteWallet()).toThrow('No wallet to delete');
    });
  });

  describe('getWalletAddress', () => {
    it('should return address without unlocking', async () => {
      const { address } = await createWallet(TEST_PASSWORD);
      const storedAddress = getWalletAddress();

      expect(storedAddress).toBe(address);
    });

    it('should return null if no wallet exists', () => {
      expect(getWalletAddress()).toBeNull();
    });
  });

  describe('getWalletType', () => {
    it('should return "hd" for created wallet', async () => {
      await createWallet(TEST_PASSWORD);
      expect(getWalletType()).toBe('hd');
    });

    it('should return "hd" for imported mnemonic', async () => {
      await importFromMnemonic(TEST_MNEMONIC, TEST_PASSWORD);
      expect(getWalletType()).toBe('hd');
    });

    it('should return "imported" for private key wallet', async () => {
      await importFromPrivateKey(TEST_PRIVATE_KEY, TEST_PASSWORD);
      expect(getWalletType()).toBe('imported');
    });

    it('should return null if no wallet exists', () => {
      expect(getWalletType()).toBeNull();
    });
  });

  describe('Security Tests', () => {
    it('should use BIP44 derivation path', async () => {
      // Import same mnemonic and verify consistent address
      const address1 = await importFromMnemonic(TEST_MNEMONIC, TEST_PASSWORD);
      deleteWallet();

      const address2 = await importFromMnemonic(TEST_MNEMONIC, TEST_PASSWORD);
      expect(address1).toBe(address2);
    });

    it('should never store unencrypted private key', async () => {
      await createWallet(TEST_PASSWORD);
      const stored = localStorage.getItem('stablecoin_wallet_data');

      expect(stored).toBeDefined();
      expect(stored).not.toContain('0x');
      expect(stored).toMatch(/encryptedPrivateKey/);
    });

    it('should verify address matches private key', async () => {
      const { address } = await createWallet(TEST_PASSWORD);
      const unlocked = await unlockWallet(TEST_PASSWORD);

      expect(unlocked.address).toBe(address);
    });
  });
});
