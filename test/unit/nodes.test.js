/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Unit tests for Chainlink nodes
 * Tests run against compiled dist/ output
 */

describe('Chainlink Node', () => {
  let Chainlink;
  let node;

  beforeAll(() => {
    const nodeModule = require('../../dist/nodes/Chainlink/Chainlink.node');
    Chainlink = nodeModule.Chainlink;
  });

  beforeEach(() => {
    node = new Chainlink();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(node.description.displayName).toBe('Chainlink');
    });

    it('should have correct node name', () => {
      expect(node.description.name).toBe('chainlink');
    });

    it('should have correct version', () => {
      expect(node.description.version).toBe(1);
    });

    it('should have correct group', () => {
      expect(node.description.group).toContain('transform');
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials.length).toBeGreaterThan(0);
      expect(node.description.credentials[0].name).toBe('chainlinkRpcApi');
    });
  });

  describe('Resources', () => {
    it('should have 8 resources', () => {
      const resourceProperty = node.description.properties.find(
        (p) => p.name === 'resource'
      );
      expect(resourceProperty).toBeDefined();
      expect(resourceProperty.options.length).toBe(8);
    });

    it('should have priceFeed resource', () => {
      const resourceProperty = node.description.properties.find(
        (p) => p.name === 'resource'
      );
      const priceFeed = resourceProperty.options.find(
        (o) => o.value === 'priceFeed'
      );
      expect(priceFeed).toBeDefined();
    });

    it('should have vrf resource', () => {
      const resourceProperty = node.description.properties.find(
        (p) => p.name === 'resource'
      );
      const vrf = resourceProperty.options.find((o) => o.value === 'vrf');
      expect(vrf).toBeDefined();
    });

    it('should have automation resource', () => {
      const resourceProperty = node.description.properties.find(
        (p) => p.name === 'resource'
      );
      const automation = resourceProperty.options.find(
        (o) => o.value === 'automation'
      );
      expect(automation).toBeDefined();
    });

    it('should have ccip resource', () => {
      const resourceProperty = node.description.properties.find(
        (p) => p.name === 'resource'
      );
      const ccip = resourceProperty.options.find((o) => o.value === 'ccip');
      expect(ccip).toBeDefined();
    });
  });
});

describe('ChainlinkTrigger Node', () => {
  let ChainlinkTrigger;
  let node;

  beforeAll(() => {
    const nodeModule = require('../../dist/nodes/Chainlink/ChainlinkTrigger.node');
    ChainlinkTrigger = nodeModule.ChainlinkTrigger;
  });

  beforeEach(() => {
    node = new ChainlinkTrigger();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(node.description.displayName).toBe('Chainlink Trigger');
    });

    it('should have correct node name', () => {
      expect(node.description.name).toBe('chainlinkTrigger');
    });

    it('should be a trigger node', () => {
      expect(node.description.group).toContain('trigger');
    });

    it('should have polling enabled', () => {
      expect(node.description.polling).toBe(true);
    });
  });

  describe('Events', () => {
    it('should have 6 event types', () => {
      const eventProperty = node.description.properties.find(
        (p) => p.name === 'event'
      );
      expect(eventProperty).toBeDefined();
      expect(eventProperty.options.length).toBe(6);
    });

    it('should have priceUpdate event', () => {
      const eventProperty = node.description.properties.find(
        (p) => p.name === 'event'
      );
      const priceUpdate = eventProperty.options.find(
        (o) => o.value === 'priceUpdate'
      );
      expect(priceUpdate).toBeDefined();
    });

    it('should have priceThreshold event', () => {
      const eventProperty = node.description.properties.find(
        (p) => p.name === 'event'
      );
      const priceThreshold = eventProperty.options.find(
        (o) => o.value === 'priceThreshold'
      );
      expect(priceThreshold).toBeDefined();
    });
  });
});
