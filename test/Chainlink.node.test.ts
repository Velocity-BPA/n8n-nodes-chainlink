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
				apiKey: 'test-key',
				baseUrl: 'https://api.chain.link',
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

	test('should get all feeds successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAllFeeds')
			.mockReturnValueOnce('ethereum')
			.mockReturnValueOnce('crypto');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			feeds: [{ id: 'btc-usd', name: 'BTC/USD' }],
		});

		const result = await executePriceFeedsOperations.call(mockExecuteFunctions, [{ json: {} }]);
		
		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ feeds: [{ id: 'btc-usd', name: 'BTC/USD' }] });
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.chain.link/v1/feeds?network=ethereum&category=crypto',
			headers: {
				'Authorization': 'Bearer test-key',
				'Content-Type': 'application/json',
			},
			json: true,
		});
	});

	test('should get specific feed successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getFeed')
			.mockReturnValueOnce('btc-usd');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'btc-usd',
			price: '45000',
		});

		const result = await executePriceFeedsOperations.call(mockExecuteFunctions, [{ json: {} }]);
		
		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ id: 'btc-usd', price: '45000' });
	});

	test('should handle API errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllFeeds');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		const result = await executePriceFeedsOperations.call(mockExecuteFunctions, [{ json: {} }]);
		
		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('API Error');
	});

	test('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllFeeds');
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		await expect(
			executePriceFeedsOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('API Error');
	});

	test('should get latest price successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getLatestPrice')
			.mockReturnValueOnce('eth-usd');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			price: '3200',
			timestamp: '2023-01-01T00:00:00Z',
		});

		const result = await executePriceFeedsOperations.call(mockExecuteFunctions, [{ json: {} }]);
		
		expect(result[0].json).toEqual({
			price: '3200',
			timestamp: '2023-01-01T00:00:00Z',
		});
	});

	test('should get bulk prices successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getBulkPrices')
			.mockReturnValueOnce('btc-usd,eth-usd');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			prices: [
				{ feedId: 'btc-usd', price: '45000' },
				{ feedId: 'eth-usd', price: '3200' },
			],
		});

		const result = await executePriceFeedsOperations.call(mockExecuteFunctions, [{ json: {} }]);
		
		expect(result[0].json.prices).toHaveLength(2);
	});
});

describe('VrfRequests Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-api-key', 
        baseUrl: 'https://api.chain.link' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('createVrfRequest', () => {
    it('should create VRF request successfully', async () => {
      const mockResponse = { requestId: 'req_123', status: 'pending' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createVrfRequest')
        .mockReturnValueOnce('0x123hash')
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce(100000)
        .mockReturnValueOnce(3);
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVrfRequestsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.chain.link/v2/vrf/requests',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        body: {
          keyHash: '0x123hash',
          subId: 'sub_123',
          callbackGasLimit: 100000,
          requestConfirmations: 3,
        },
      });
    });

    it('should handle createVrfRequest error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('createVrfRequest');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeVrfRequestsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{
        json: { error: 'API Error' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getAllVrfRequests', () => {
    it('should get all VRF requests successfully', async () => {
      const mockResponse = { requests: [{ requestId: 'req_123' }], total: 1 };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllVrfRequests')
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('pending')
        .mockReturnValueOnce(50);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVrfRequestsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getVrfRequest', () => {
    it('should get specific VRF request successfully', async () => {
      const mockResponse = { requestId: 'req_123', status: 'fulfilled' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getVrfRequest')
        .mockReturnValueOnce('req_123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVrfRequestsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.chain.link/v2/vrf/requests/req_123',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getVrfSubscription', () => {
    it('should get VRF subscription successfully', async () => {
      const mockResponse = { subId: 'sub_123', balance: '10.5' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getVrfSubscription')
        .mockReturnValueOnce('sub_123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVrfRequestsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('createVrfSubscription', () => {
    it('should create VRF subscription successfully', async () => {
      const mockResponse = { subId: 'sub_456', consumerAddress: '0x123abc' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createVrfSubscription')
        .mockReturnValueOnce('0x123abc');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVrfRequestsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.chain.link/v2/vrf/subscriptions',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        body: {
          consumerAddress: '0x123abc',
        },
      });
    });
  });
});

describe('AutomationJobs Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.chain.link',
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

	describe('createUpkeep operation', () => {
		it('should create upkeep successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createUpkeep')
				.mockReturnValueOnce('0x123456789')
				.mockReturnValueOnce('0xabcdef')
				.mockReturnValueOnce(100000)
				.mockReturnValueOnce('0x987654321');

			const mockResponse = { upkeepId: '1', status: 'created' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAutomationJobsOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});

		it('should handle createUpkeep error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createUpkeep');
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			const result = await executeAutomationJobsOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.error).toBe('API Error');
		});
	});

	describe('getAllUpkeeps operation', () => {
		it('should get all upkeeps successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllUpkeeps')
				.mockReturnValueOnce('0x123')
				.mockReturnValueOnce(true)
				.mockReturnValueOnce(50);

			const mockResponse = { upkeeps: [{ id: '1' }, { id: '2' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAutomationJobsOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('getUpkeep operation', () => {
		it('should get upkeep successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getUpkeep')
				.mockReturnValueOnce('123');

			const mockResponse = { upkeepId: '123', target: '0x123', gasLimit: 100000 };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAutomationJobsOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('updateUpkeep operation', () => {
		it('should update upkeep successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateUpkeep')
				.mockReturnValueOnce('123')
				.mockReturnValueOnce(150000)
				.mockReturnValueOnce('0xnewdata');

			const mockResponse = { upkeepId: '123', status: 'updated' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAutomationJobsOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('cancelUpkeep operation', () => {
		it('should cancel upkeep successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('cancelUpkeep')
				.mockReturnValueOnce('123');

			const mockResponse = { upkeepId: '123', status: 'cancelled' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAutomationJobsOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});
	});
});

describe('CrossChainMessaging Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.chain.link' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should send message successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('sendMessage')
      .mockReturnValueOnce('ethereum')
      .mockReturnValueOnce('0x123')
      .mockReturnValueOnce('test-data')
      .mockReturnValueOnce('[]');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      messageId: 'msg-123',
      status: 'pending'
    });

    const result = await executeCrossChainMessagingOperations.call(
      mockExecuteFunctions, 
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('messageId');
  });

  it('should get all messages successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAllMessages')
      .mockReturnValueOnce('ethereum')
      .mockReturnValueOnce('polygon')
      .mockReturnValueOnce('pending')
      .mockReturnValueOnce(10);
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      messages: [{ messageId: 'msg-123' }]
    });

    const result = await executeCrossChainMessagingOperations.call(
      mockExecuteFunctions, 
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('messages');
  });

  it('should get specific message successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getMessage')
      .mockReturnValueOnce('msg-123');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      messageId: 'msg-123',
      status: 'success'
    });

    const result = await executeCrossChainMessagingOperations.call(
      mockExecuteFunctions, 
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.messageId).toBe('msg-123');
  });

  it('should get supported lanes successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSupportedLanes');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      lanes: [{ source: 'ethereum', destination: 'polygon' }]
    });

    const result = await executeCrossChainMessagingOperations.call(
      mockExecuteFunctions, 
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('lanes');
  });

  it('should estimate fees successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('estimateFees')
      .mockReturnValueOnce('polygon')
      .mockReturnValueOnce('test-data')
      .mockReturnValueOnce('[]');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      feeTokenAmount: '1000000000000000000',
      gasLimit: '200000'
    });

    const result = await executeCrossChainMessagingOperations.call(
      mockExecuteFunctions, 
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('feeTokenAmount');
  });

  it('should handle errors when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('sendMessage');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
      new Error('Network error')
    );

    const result = await executeCrossChainMessagingOperations.call(
      mockExecuteFunctions, 
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('sendMessage');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
      new Error('Network error')
    );

    await expect(
      executeCrossChainMessagingOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Network error');
  });
});

describe('Functions Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.chain.link',
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

	it('should create function request successfully', async () => {
		const mockResponse = { requestId: 'req_123', status: 'pending' };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createFunctionRequest')
			.mockReturnValueOnce('return Functions.encodeString("Hello World")')
			.mockReturnValueOnce(['arg1', 'arg2'])
			.mockReturnValueOnce('sub_123');

		const result = await executeFunctionsOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});

	it('should get all function requests successfully', async () => {
		const mockResponse = { requests: [{ requestId: 'req_123', status: 'completed' }] };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAllFunctionRequests')
			.mockReturnValueOnce('sub_123')
			.mockReturnValueOnce('completed')
			.mockReturnValueOnce(50);

		const result = await executeFunctionsOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});

	it('should handle errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createFunctionRequest');

		const result = await executeFunctionsOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
	});
});
});
