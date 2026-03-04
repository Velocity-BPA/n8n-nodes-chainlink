/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Chainlink } from '../nodes/Chainlink/Chainlink.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Chainlink Node', () => {
  let node: Chainlink;

  beforeAll(() => {
    node = new Chainlink();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Chainlink');
      expect(node.description.name).toBe('chainlink');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('PriceFeeds Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.chain.link/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('getAllFeeds should fetch all price feeds', async () => {
    const mockResponse = {
      data: [
        { id: 'eth-usd', name: 'ETH/USD', network: 'ethereum' },
        { id: 'btc-usd', name: 'BTC/USD', network: 'ethereum' }
      ]
    };

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getAllFeeds')
      .mockImplementationOnce(() => 'ethereum')
      .mockImplementationOnce(() => 'crypto');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executePriceFeedsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.chain.link/v1/feeds?network=ethereum&category=crypto',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getFeed should fetch specific feed details', async () => {
    const mockResponse = {
      id: 'eth-usd',
      name: 'ETH/USD',
      network: 'ethereum',
      address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'
    };

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getFeed')
      .mockImplementationOnce(() => 'eth-usd')
      .mockImplementationOnce(() => 'ethereum');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executePriceFeedsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('getLatestPrice should fetch latest price data', async () => {
    const mockResponse = {
      price: '2000.50000000',
      timestamp: 1640995200,
      roundId: 12345
    };

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getLatestPrice')
      .mockImplementationOnce(() => 'eth-usd')
      .mockImplementationOnce(() => 'ethereum');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executePriceFeedsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('searchFeeds should search feeds by query', async () => {
    const mockResponse = {
      data: [
        { id: 'eth-usd', name: 'ETH/USD', network: 'ethereum' }
      ]
    };

    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'searchFeeds')
      .mockImplementationOnce(() => 'ETH')
      .mockImplementationOnce(() => 'ethereum');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executePriceFeedsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should handle API errors correctly', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getAllFeeds')
      .mockImplementationOnce(() => 'ethereum')
      .mockImplementationOnce(() => '');

    const error = new Error('API Error');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

    await expect(
      executePriceFeedsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('API Error');
  });

  test('should continue on fail when configured', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter
      .mockImplementationOnce(() => 'getAllFeeds')
      .mockImplementationOnce(() => 'ethereum')
      .mockImplementationOnce(() => '');

    const error = new Error('API Error');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

    const result = await executePriceFeedsOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('VRFRequests Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.chain.link/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('createVRFRequest', () => {
    it('should create a VRF request successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'createVRFRequest';
          case 'network': return 'ethereum';
          case 'subscriptionId': return '12345';
          case 'keyHash': return '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15';
          case 'callbackGasLimit': return 100000;
          case 'numWords': return 1;
          default: return '';
        }
      });

      const mockResponse = {
        requestId: '987654321',
        status: 'pending',
        transactionHash: '0xabc123',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVRFRequestsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.chain.link/v1/vrf/requests',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          network: 'ethereum',
          subscriptionId: '12345',
          keyHash: '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
          callbackGasLimit: 100000,
          numWords: 1,
        },
        json: true,
      });
    });

    it('should handle errors when creating VRF request', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'createVRFRequest';
        return 'test-value';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeVRFRequestsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getVRFRequest', () => {
    it('should get VRF request successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getVRFRequest';
          case 'requestId': return '987654321';
          case 'network': return 'ethereum';
          default: return '';
        }
      });

      const mockResponse = {
        requestId: '987654321',
        status: 'fulfilled',
        randomWords: ['12345678901234567890'],
        transactionHash: '0xabc123',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVRFRequestsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('listVRFRequests', () => {
    it('should list VRF requests successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'listVRFRequests';
          case 'network': return 'ethereum';
          case 'account': return '0x123456789';
          case 'status': return 'all';
          case 'limit': return 10;
          default: return '';
        }
      });

      const mockResponse = {
        requests: [
          { requestId: '1', status: 'fulfilled' },
          { requestId: '2', status: 'pending' },
        ],
        total: 2,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVRFRequestsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getVRFSubscription', () => {
    it('should get VRF subscription successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getVRFSubscription';
          case 'subscriptionId': return '12345';
          case 'network': return 'ethereum';
          default: return '';
        }
      });

      const mockResponse = {
        subscriptionId: '12345',
        balance: '1.5',
        owner: '0x123456789',
        consumers: ['0xabc123'],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVRFRequestsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('createVRFSubscription', () => {
    it('should create VRF subscription successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'createVRFSubscription';
          case 'network': return 'ethereum';
          default: return '';
        }
      });

      const mockResponse = {
        subscriptionId: '54321',
        transactionHash: '0xdef456',
        status: 'pending',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVRFRequestsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Automation Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.chain.link/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('createUpkeep', () => {
    it('should create upkeep successfully', async () => {
      const mockResponse = {
        upkeepId: '123456789',
        network: 'ethereum',
        target: '0x742d35Cc6543C4532BF81A96C1fbF1E2EE9aEd64',
        gasLimit: 2500000,
        status: 'active',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'createUpkeep';
          case 'network': return 'ethereum';
          case 'target': return '0x742d35Cc6543C4532BF81A96C1fbF1E2EE9aEd64';
          case 'gasLimit': return 2500000;
          case 'checkData': return '0x';
          case 'amount': return '1000000000000000000';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAutomationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.chain.link/v1/automation/upkeeps',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network: 'ethereum',
          target: '0x742d35Cc6543C4532BF81A96C1fbF1E2EE9aEd64',
          gasLimit: 2500000,
          checkData: '0x',
          amount: '1000000000000000000',
        }),
        json: true,
      });
    });
  });

  describe('getUpkeep', () => {
    it('should get upkeep details successfully', async () => {
      const mockResponse = {
        upkeepId: '123456789',
        network: 'ethereum',
        target: '0x742d35Cc6543C4532BF81A96C1fbF1E2EE9aEd64',
        gasLimit: 2500000,
        status: 'active',
        balance: '500000000000000000',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getUpkeep';
          case 'upkeepId': return '123456789';
          case 'network': return 'ethereum';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAutomationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.chain.link/v1/automation/upkeeps/123456789',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        qs: {
          network: 'ethereum',
        },
        json: true,
      });
    });
  });

  describe('listUpkeeps', () => {
    it('should list upkeeps successfully', async () => {
      const mockResponse = {
        upkeeps: [
          {
            upkeepId: '123456789',
            network: 'ethereum',
            status: 'active',
          },
          {
            upkeepId: '987654321',
            network: 'ethereum',
            status: 'paused',
          },
        ],
        total: 2,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'listUpkeeps';
          case 'network': return 'ethereum';
          case 'account': return '0x742d35Cc6543C4532BF81A96C1fbF1E2EE9aEd64';
          case 'status': return 'all';
          case 'limit': return 100;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAutomationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('updateUpkeep', () => {
    it('should update upkeep successfully', async () => {
      const mockResponse = {
        upkeepId: '123456789',
        network: 'ethereum',
        gasLimit: 3000000,
        checkData: '0x1234',
        status: 'updated',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'updateUpkeep';
          case 'upkeepId': return '123456789';
          case 'network': return 'ethereum';
          case 'gasLimit': return 3000000;
          case 'checkData': return '0x1234';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAutomationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('cancelUpkeep', () => {
    it('should cancel upkeep successfully', async () => {
      const mockResponse = {
        upkeepId: '123456789',
        network: 'ethereum',
        status: 'cancelled',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'cancelUpkeep';
          case 'upkeepId': return '123456789';
          case 'network': return 'ethereum';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAutomationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://api.chain.link/v1/automation/upkeeps/123456789',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        qs: {
          network: 'ethereum',
        },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getUpkeep';
          case 'upkeepId': return 'invalid-id';
          case 'network': return 'ethereum';
          default: return undefined;
        }
      });

      const error = new Error('Upkeep not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(
        executeAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getUpkeep';
          case 'upkeepId': return 'invalid-id';
          case 'network': return 'ethereum';
          default: return undefined;
        }
      });

      const error = new Error('Upkeep not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const result = await executeAutomationOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Upkeep not found');
    });
  });
});

describe('CCIP Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.chain.link/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('sendCCIPMessage', () => {
    it('should send cross-chain message successfully', async () => {
      const mockResponse = {
        messageId: '0x123456789',
        status: 'sent',
        transactionHash: '0xabcdef',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'sendCCIPMessage';
          case 'sourceNetwork':
            return 'ethereum';
          case 'destinationNetwork':
            return 'polygon';
          case 'receiver':
            return '0x742d35Cc123C12345678';
          case 'data':
            return '0x1234';
          case 'tokenAmounts':
            return '[{"token":"0xA0b86a33E6441E3D3D4c44c5c6EA2F9F5D8C8943","amount":"1000000000000000000"}]';
          default:
            return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCCIPOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.chain.link/v1/ccip/messages',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          sourceNetwork: 'ethereum',
          destinationNetwork: 'polygon',
          receiver: '0x742d35Cc123C12345678',
          data: '0x1234',
          tokenAmounts: [{ token: '0xA0b86a33E6441E3D3D4c44c5c6EA2F9F5D8C8943', amount: '1000000000000000000' }],
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getCCIPMessage', () => {
    it('should get message status successfully', async () => {
      const mockResponse = {
        messageId: '0x123456789',
        status: 'success',
        sourceNetwork: 'ethereum',
        destinationNetwork: 'polygon',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'getCCIPMessage';
          case 'messageId':
            return '0x123456789';
          case 'network':
            return 'ethereum';
          default:
            return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCCIPOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.chain.link/v1/ccip/messages/0x123456789',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        qs: {
          network: 'ethereum',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('listCCIPMessages', () => {
    it('should list messages successfully', async () => {
      const mockResponse = {
        messages: [
          { messageId: '0x123', status: 'success' },
          { messageId: '0x456', status: 'pending' },
        ],
        total: 2,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'listCCIPMessages';
          case 'sourceNetwork':
            return 'ethereum';
          case 'destinationNetwork':
            return 'polygon';
          case 'account':
            return '0x742d35Cc123C12345678';
          case 'status':
            return 'success';
          case 'limit':
            return 50;
          default:
            return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCCIPOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getCCIPLanes', () => {
    it('should get CCIP lanes successfully', async () => {
      const mockResponse = {
        lanes: [
          {
            sourceNetwork: 'ethereum',
            destinationNetwork: 'polygon',
            isActive: true,
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'getCCIPLanes';
          case 'sourceNetwork':
            return 'ethereum';
          case 'destinationNetwork':
            return 'polygon';
          default:
            return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCCIPOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getCCIPFees', () => {
    it('should calculate fees successfully', async () => {
      const mockResponse = {
        fee: '1000000000000000000',
        currency: 'LINK',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'getCCIPFees';
          case 'sourceNetwork':
            return 'ethereum';
          case 'destinationNetwork':
            return 'polygon';
          case 'data':
            return '0x1234';
          case 'tokenAmounts':
            return '[{"token":"0xA0b86a33E6441E3D3D4c44c5c6EA2F9F5D8C8943","amount":"1000000000000000000"}]';
          default:
            return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCCIPOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });
});
});
