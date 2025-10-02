/**
 * Address Book Type Definitions
 *
 * Types for managing saved wallet addresses with labels
 */

/**
 * Network type for address book entries
 */
export type NetworkType = 'sepolia' | 'mainnet';

/**
 * Saved address entry in address book
 */
export interface AddressBookEntry {
  /**
   * Unique identifier for the entry
   */
  id: string;

  /**
   * User-friendly label for the address
   */
  label: string;

  /**
   * Ethereum address (0x prefixed, checksummed)
   */
  address: string;

  /**
   * Network where this address is used
   * @default 'sepolia'
   */
  network: NetworkType;

  /**
   * Optional notes or description
   */
  notes?: string;

  /**
   * Creation timestamp (ISO 8601 format)
   */
  createdAt: string;

  /**
   * Last update timestamp (ISO 8601 format)
   */
  updatedAt: string;
}

/**
 * Form data for creating/editing address book entries
 */
export interface AddressBookFormData {
  label: string;
  address: string;
  network: NetworkType;
  notes?: string;
}
