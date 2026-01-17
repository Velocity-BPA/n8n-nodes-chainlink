/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Unit tests for network constants
 * Tests run against compiled dist/ output
 */

describe('Networks Constants', () => {
  let NETWORKS, getNetworkConfig;

  beforeAll(() => {
    const networks = require('../../dist/nodes/Chainlink/constants/networks');
    NETWORKS = networks.NETWORKS;
    getNetworkConfig = networks.getNetworkConfig;
  });

  describe('NETWORKS', () => {
    it('should contain mainnet networks', () => {
      const mainnets = [
        'ethereum-mainnet',
        'polygon-mainnet',
        'arbitrum-mainnet',
        'optimism-mainnet',
        'avalanche-mainnet',
        'bnb-mainnet',
        'base-mainnet',
      ];

      mainnets.forEach((network) => {
        expect(NETWORKS[network]).toBeDefined();
        expect(NETWORKS[network].isTestnet).toBe(false);
      });
    });

    it('should contain testnet networks', () => {
      const testnets = [
        'ethereum-sepolia',
        'polygon-amoy',
        'arbitrum-sepolia',
        'optimism-sepolia',
        'avalanche-fuji',
        'bnb-testnet',
        'base-sepolia',
      ];

      testnets.forEach((network) => {
        expect(NETWORKS[network]).toBeDefined();
        expect(NETWORKS[network].isTestnet).toBe(true);
      });
    });

    it('should have valid chainId for each network', () => {
      Object.entries(NETWORKS).forEach(([key, config]) => {
        if (key !== 'custom') {
          expect(config.chainId).toBeGreaterThan(0);
          expect(typeof config.chainId).toBe('number');
        }
      });
    });

    it('should have LINK token address for mainnet networks', () => {
      const mainnets = [
        'ethereum-mainnet',
        'polygon-mainnet',
        'arbitrum-mainnet',
        'optimism-mainnet',
        'avalanche-mainnet',
        'bnb-mainnet',
        'base-mainnet',
      ];

      mainnets.forEach((network) => {
        expect(NETWORKS[network].linkToken).toBeDefined();
        expect(NETWORKS[network].linkToken).toMatch(/^0x[a-fA-F0-9]{40}$/);
      });
    });
  });

  describe('getNetworkConfig', () => {
    it('should return correct config for ethereum-mainnet', () => {
      const config = getNetworkConfig('ethereum-mainnet');
      expect(config).toBeDefined();
      expect(config.chainId).toBe(1);
      expect(config.name).toBe('Ethereum Mainnet');
    });

    it('should return correct config for polygon-mainnet', () => {
      const config = getNetworkConfig('polygon-mainnet');
      expect(config).toBeDefined();
      expect(config.chainId).toBe(137);
    });

    it('should return undefined for unknown network', () => {
      const config = getNetworkConfig('unknown-network');
      expect(config).toBeUndefined();
    });

    it('should return custom config placeholder', () => {
      const config = getNetworkConfig('custom');
      expect(config).toBeDefined();
      expect(config.chainId).toBe(0);
    });
  });
});
