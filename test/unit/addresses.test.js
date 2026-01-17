/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Unit tests for price feed addresses
 * Tests run against compiled dist/ output
 */

describe('Addresses Constants', () => {
  let PRICE_FEEDS, getPriceFeed;

  beforeAll(() => {
    const addresses = require('../../dist/nodes/Chainlink/constants/addresses');
    PRICE_FEEDS = addresses.PRICE_FEEDS;
    getPriceFeed = addresses.getPriceFeed;
  });

  describe('PRICE_FEEDS', () => {
    it('should contain price feeds for ethereum-mainnet', () => {
      expect(PRICE_FEEDS['ethereum-mainnet']).toBeDefined();
      expect(PRICE_FEEDS['ethereum-mainnet']['ETH/USD']).toBeDefined();
      expect(PRICE_FEEDS['ethereum-mainnet']['BTC/USD']).toBeDefined();
    });

    it('should have valid address format for all feeds', () => {
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;

      Object.entries(PRICE_FEEDS).forEach(([network, feeds]) => {
        Object.entries(feeds).forEach(([pair, feedInfo]) => {
          expect(feedInfo.address).toMatch(addressRegex);
        });
      });
    });

    it('should have decimals defined for all feeds', () => {
      Object.entries(PRICE_FEEDS).forEach(([network, feeds]) => {
        Object.entries(feeds).forEach(([pair, feedInfo]) => {
          expect(feedInfo.decimals).toBeDefined();
          expect(typeof feedInfo.decimals).toBe('number');
          // FAST_GAS and SEQUENCER_UPTIME feeds can have 0 decimals
          expect(feedInfo.decimals).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('getPriceFeed', () => {
    it('should return ETH/USD feed for ethereum-mainnet', () => {
      const feed = getPriceFeed('ethereum-mainnet', 'ETH/USD');
      expect(feed).toBeDefined();
      expect(feed.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(feed.decimals).toBe(8);
    });

    it('should return BTC/USD feed for ethereum-mainnet', () => {
      const feed = getPriceFeed('ethereum-mainnet', 'BTC/USD');
      expect(feed).toBeDefined();
      expect(feed.decimals).toBe(8);
    });

    it('should return undefined for unknown network', () => {
      const feed = getPriceFeed('unknown-network', 'ETH/USD');
      expect(feed).toBeUndefined();
    });

    it('should return undefined for unknown pair', () => {
      const feed = getPriceFeed('ethereum-mainnet', 'UNKNOWN/USD');
      expect(feed).toBeUndefined();
    });
  });
});
