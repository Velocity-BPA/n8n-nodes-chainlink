/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Unit tests for provider utilities
 * Tests run against compiled dist/ output
 */

describe('Provider Utilities', () => {
  let provider;

  beforeAll(() => {
    provider = require('../../dist/nodes/Chainlink/transport/provider');
  });

  describe('formatPrice', () => {
    it('should format price with 8 decimals correctly', () => {
      const result = provider.formatPrice(BigInt('234512345678'), 8);
      expect(result).toBe('2345.12345678');
    });

    it('should format price with 18 decimals correctly', () => {
      const result = provider.formatPrice(BigInt('1000000000000000000'), 18);
      expect(result).toBe('1.0');
    });

    it('should handle zero value', () => {
      const result = provider.formatPrice(BigInt(0), 8);
      expect(result).toBe('0.0');
    });

    it('should handle large values', () => {
      const result = provider.formatPrice(BigInt('100000000000000'), 8);
      expect(result).toBe('1000000.0');
    });
  });

  describe('timestampToISO', () => {
    it('should convert Unix timestamp to ISO string', () => {
      const timestamp = BigInt(1704067200); // 2024-01-01 00:00:00 UTC
      const result = provider.timestampToISO(timestamp);
      expect(result).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('isValidAddress', () => {
    it('should return true for valid checksummed address', () => {
      expect(provider.isValidAddress('0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419')).toBe(true);
    });

    it('should return true for valid lowercase address', () => {
      expect(provider.isValidAddress('0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419')).toBe(true);
    });

    it('should return false for invalid address', () => {
      expect(provider.isValidAddress('0xinvalid')).toBe(false);
      expect(provider.isValidAddress('invalid')).toBe(false);
      expect(provider.isValidAddress('')).toBe(false);
    });

    it('should return false for address with wrong length', () => {
      expect(provider.isValidAddress('0x5f4eC3Df9cbd43714FE2740f5E3616155c5b84')).toBe(false);
    });
  });

  describe('checksumAddress', () => {
    it('should return checksummed address', () => {
      const result = provider.checksumAddress('0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419');
      expect(result).toBe('0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419');
    });

    it('should return same address if already checksummed', () => {
      const address = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';
      const result = provider.checksumAddress(address);
      expect(result).toBe(address);
    });
  });
});
