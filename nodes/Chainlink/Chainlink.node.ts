/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-chainlink/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Chainlink implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chainlink',
    name: 'chainlink',
    icon: 'file:chainlink.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Chainlink API',
    defaults: {
      name: 'Chainlink',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'chainlinkApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'PriceFeeds',
            value: 'priceFeeds',
          },
          {
            name: 'VrfRequests',
            value: 'vrfRequests',
          },
          {
            name: 'AutomationJobs',
            value: 'automationJobs',
          },
          {
            name: 'CrossChainMessaging',
            value: 'crossChainMessaging',
          },
          {
            name: 'Functions',
            value: 'functions',
          }
        ],
        default: 'priceFeeds',
      },
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['priceFeeds'],
		},
	},
	options: [
		{
			name: 'Get All Feeds',
			value: 'getAllFeeds',
			description: 'Get all available price feeds',
			action: 'Get all feeds',
		},
		{
			name: 'Get Feed',
			value: 'getFeed',
			description: 'Get specific price feed data',
			action: 'Get feed',
		},
		{
			name: 'Get Feed Rounds',
			value: 'getFeedRounds',
			description: 'Get historical round data for a feed',
			action: 'Get feed rounds',
		},
		{
			name: 'Get Latest Price',
			value: 'getLatestPrice',
			description: 'Get latest price for a feed',
			action: 'Get latest price',
		},
		{
			name: 'Get Bulk Prices',
			value: 'getBulkPrices',
			description: 'Get latest prices for multiple feeds',
			action: 'Get bulk prices',
		},
    {
      name: 'Search Feeds',
      value: 'searchFeeds',
      description: 'Search price feeds by symbol or name',
      action: 'Search feeds',
    },
	],
	default: 'getAllFeeds',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['vrfRequests'] } },
  options: [
    { name: 'Create VRF Request', value: 'createVrfRequest', description: 'Create a new VRF randomness request', action: 'Create VRF request' },
    { name: 'Get All VRF Requests', value: 'getAllVrfRequests', description: 'Get all VRF requests for account', action: 'Get all VRF requests' },
    { name: 'Get VRF Request', value: 'getVrfRequest', description: 'Get specific VRF request details', action: 'Get VRF request' },
    { name: 'Get VRF Subscription', value: 'getVrfSubscription', description: 'Get VRF subscription details', action: 'Get VRF subscription' },
    { name: 'Create VRF Subscription', value: 'createVrfSubscription', description: 'Create new VRF subscription', action: 'Create VRF subscription' },
    { name: 'List VRF Requests', value: 'listVRFRequests', description: 'List VRF requests for account', action: 'List VRF requests' },
  ],
  default: 'createVrfRequest',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['automationJobs'],
		},
	},
	options: [
		{
			name: 'Create Upkeep',
			value: 'createUpkeep',
			description: 'Register a new automation upkeep',
			action: 'Create upkeep',
		},
		{
			name: 'Get All Upkeeps',
			value: 'getAllUpkeeps',
			description: 'Get all automation upkeeps',
			action: 'Get all upkeeps',
		},
		{
			name: 'Get Upkeep',
			value: 'getUpkeep',
			description: 'Get specific upkeep details',
			action: 'Get upkeep',
		},
		{
			name: 'Update Upkeep',
			value: 'updateUpkeep',
			description: 'Update upkeep configuration',
			action: 'Update upkeep',
		},
		{
			name: 'Cancel Upkeep',
			value: 'cancelUpkeep',
			description: 'Cancel an automation upkeep',
			action: 'Cancel upkeep',
		},
    {
      name: 'List Upkeeps',
      value: 'listUpkeeps',
      description: 'List upkeeps for account',
      action: 'List upkeeps',
    },
	],
	default: 'createUpkeep',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['crossChainMessaging'] } },
  options: [
    { name: 'Send Message', value: 'sendMessage', description: 'Send cross-chain message', action: 'Send message' },
    { name: 'Get All Messages', value: 'getAllMessages', description: 'Get all cross-chain messages', action: 'Get all messages' },
    { name: 'Get Message', value: 'getMessage', description: 'Get specific message details', action: 'Get message' },
    { name: 'Get Supported Lanes', value: 'getSupportedLanes', description: 'Get supported cross-chain lanes', action: 'Get supported lanes' },
    { name: 'Estimate Fees', value: 'estimateFees', description: 'Estimate fees for cross-chain message', action: 'Estimate fees' },
    { name: 'Send Cross-Chain Message', value: 'sendCCIPMessage', description: 'Send a cross-chain message via CCIP', action: 'Send cross-chain message' },
    { name: 'Get Message Status', value: 'getCCIPMessage', description: 'Get the status of a cross-chain message', action: 'Get message status' },
    { name: 'List Messages', value: 'listCCIPMessages', description: 'List cross-chain messages', action: 'List messages' },
    { name: 'Get CCIP Lanes', value: 'getCCIPLanes', description: 'Get available cross-chain lanes', action: 'Get CCIP lanes' },
    { name: 'Calculate Fees', value: 'getCCIPFees', description: 'Calculate cross-chain message fees', action: 'Calculate fees' },
  ],
  default: 'sendMessage',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['functions'] } },
	options: [
		{
			name: 'Create Function Request',
			value: 'createFunctionRequest',
			description: 'Create new function execution request',
			action: 'Create function request',
		},
		{
			name: 'Get All Function Requests',
			value: 'getAllFunctionRequests',
			description: 'Get all function requests',
			action: 'Get all function requests',
		},
		{
			name: 'Get Function Request',
			value: 'getFunctionRequest',
			description: 'Get specific function request details',
			action: 'Get function request',
		},
		{
			name: 'Get Function Subscription',
			value: 'getFunctionSubscription',
			description: 'Get function subscription details',
			action: 'Get function subscription',
		},
		{
			name: 'Create Function Subscription',
			value: 'createFunctionSubscription',
			description: 'Create new function subscription',
			action: 'Create function subscription',
		},
	],
	default: 'createFunctionRequest',
},
{
	displayName: 'Network',
	name: 'network',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['priceFeeds'],
			operation: ['getAllFeeds'],
		},
	},
	default: '',
	placeholder: 'ethereum',
	description: 'The blockchain network to filter feeds by',
},
{
	displayName: 'Category',
	name: 'category',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['priceFeeds'],
			operation: ['getAllFeeds'],
		},
	},
	default: '',
	placeholder: 'crypto',
	description: 'The category to filter feeds by',
},
{
	displayName: 'Feed ID',
	name: 'feedId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['priceFeeds'],
			operation: ['getFeed', 'getFeedRounds', 'getLatestPrice'],
		},
	},
	default: '',
	placeholder: 'btc-usd',
	description: 'The unique identifier for the price feed',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['priceFeeds'],
      operation: ['getFeed', 'getLatestPrice', 'searchFeeds'],
    },
  },
  options: [
    { name: 'Ethereum', value: 'ethereum' },
    { name: 'Polygon', value: 'polygon' },
    { name: 'BSC', value: 'bsc' },
    { name: 'Avalanche', value: 'avalanche' },
    { name: 'Arbitrum', value: 'arbitrum' },
    { name: 'Optimism', value: 'optimism' },
  ],
  default: 'ethereum',
  description: 'The blockchain network to query',
},
{
  displayName: 'From Timestamp',
  name: 'from',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['priceFeeds'],
      operation: ['getFeedRounds'],
    },
  },
  default: 0,
  description: 'Start timestamp for historical data (Unix timestamp)',
  required: false,
},
{
  displayName: 'To Timestamp',
  name: 'to',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['priceFeeds'],
      operation: ['getFeedRounds'],
    },
  },
  default: 0,
  description: 'End timestamp for historical data (Unix timestamp)',
  required: false,
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['priceFeeds'],
			operation: ['getFeedRounds'],
		},
	},
	default: 100,
	description: 'Maximum number of rounds to return',
},
{
	displayName: 'Offset',
	name: 'offset',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['priceFeeds'],
			operation: ['getFeedRounds'],
		},
	},
	default: 0,
	description: 'Number of rounds to skip before returning results',
},
{
	displayName: 'Feed IDs',
	name: 'feedIds',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['priceFeeds'],
			operation: ['getBulkPrices'],
		},
	},
	default: '',
	placeholder: 'btc-usd,eth-usd,link-usd',
	description: 'Comma-separated list of feed IDs to retrieve prices for',
},
{
  displayName: 'Search Query',
  name: 'query',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['priceFeeds'],
      operation: ['searchFeeds'],
    },
  },
  default: '',
  description: 'Symbol or name to search for',
  required: true,
},
{
  displayName: 'Key Hash',
  name: 'keyHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['createVrfRequest', 'createVRFRequest'],
    },
  },
  default: '',
  description: 'The key hash for the VRF request',
},
{
  displayName: 'Subscription ID',
  name: 'subId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['createVrfRequest', 'getAllVrfRequests', 'getVrfSubscription'],
    },
  },
  default: '',
  description: 'The subscription ID for the VRF request',
},
{
  displayName: 'Subscription ID',
  name: 'subscriptionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['createVRFRequest'],
    },
  },
  default: '',
  description: 'The VRF subscription ID to use for the request',
},
{
  displayName: 'Callback Gas Limit',
  name: 'callbackGasLimit',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['createVrfRequest', 'createVRFRequest'],
    },
  },
  default: 100000,
  description: 'Gas limit for the callback function',
},
{
  displayName: 'Request Confirmations',
  name: 'requestConfirmations',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['createVrfRequest'],
    },
  },
  default: 3,
  description: 'Number of confirmations required',
},
{
  displayName: 'Number of Words',
  name: 'numWords',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['createVRFRequest'],
    },
  },
  default: 1,
  description: 'The number of random words to request (max 500)',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['createVRFRequest', 'getVRFRequest', 'listVRFRequests', 'getVRFSubscription', 'createVRFSubscription'],
    },
  },
  options: [
    { name: 'Ethereum Mainnet', value: 'ethereum' },
    { name: 'Polygon', value: 'polygon' },
    { name: 'BSC', value: 'bsc' },
    { name: 'Avalanche', value: 'avalanche' },
    { name: 'Sepolia Testnet', value: 'sepolia' },
  ],
  default: 'ethereum',
  description: 'The blockchain network to use',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  options: [
    { name: 'Pending', value: 'pending' },
    { name: 'Fulfilled', value: 'fulfilled' },
    { name: 'Failed', value: 'failed' },
  ],
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['getAllVrfRequests', 'listVRFRequests'],
    },
  },
  default: '',
  description: 'Filter by request status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['getAllVrfRequests', 'listVRFRequests'],
    },
  },
  default: 50,
  description: 'Maximum number of requests to return',
},
{
  displayName: 'Request ID',
  name: 'requestId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['getVrfRequest', 'getVRFRequest'],
    },
  },
  default: '',
  description: 'The ID of the VRF request to retrieve',
},
{
  displayName: 'Consumer Address',
  name: 'consumerAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['createVrfSubscription', 'createVRFSubscription'],
    },
  },
  default: '',
  description: 'The consumer contract address for the subscription',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vrfRequests'],
      operation: ['listVRFRequests'],
    },
  },
  default: '',
  description: 'The account address to list VRF requests for',
},
{
	displayName: 'Target Contract Address',
	name: 'target',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['automationJobs'],
			operation: ['createUpkeep'],
		},
	},
	default: '',
	description: 'The target contract address for the upkeep',
},
{
	displayName: 'Check Data',
	name: 'checkData',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['automationJobs'],
			operation: ['createUpkeep', 'updateUpkeep'],
		},
	},
	default: '',
	description: 'The check data for the upkeep (encoded bytes)',
},
{
	displayName: 'Gas Limit',
	name: 'gasLimit',
	type: 'number',
	required: true,
	displayOptions: {
		show: {
			resource: ['automationJobs'],
			operation: ['createUpkeep', 'updateUpkeep'],
		},
	},
	default: 100000,
	description: 'The gas limit for performing the upkeep',
},
{
	displayName: 'Admin Address',
	name: 'admin',
	type: 'string',
	required: false,
	displayOptions: {
		show: {
			resource: ['automationJobs'],
			operation: ['createUpkeep', 'getAllUpkeeps', 'listUpkeeps'],
		},
	},
	default: '',
	description: 'The admin address for the upkeep',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['automationJobs'],
      operation: ['createUpkeep', 'getUpkeep', 'listUpkeeps', 'updateUpkeep', 'cancelUpkeep'],
    },
  },
  options: [
    {
      name: 'Ethereum Mainnet',
      value: 'ethereum',
    },
    {
      name: 'Ethereum Goerli',
      value: 'ethereum-goerli',
    },
    {
      name: 'Polygon',
      value: 'polygon',
    },
    {
      name: 'BSC',
      value: 'bsc',
    },
    {
      name: 'Avalanche',
      value: 'avalanche',
    },
  ],
  default: 'ethereum',
  description: 'The blockchain network to use',
},
{
	displayName: 'Active',
	name: 'active',
	type: 'boolean',
	required: false,
	displayOptions: {
		show: {
			resource: ['automationJobs'],
			operation: ['getAllUpkeeps', 'listUpkeeps'],
		},
	},
	default: true,
	description: 'Filter by active status',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	required: false,
	displayOptions: {
		show: {
			resource: ['automationJobs'],
			operation: ['getAllUpkeeps', 'listUpkeeps'],
		},
	},
	default: 100,
	description: 'Limit the number of results',
},
{
	displayName: 'Upkeep ID',
	name: 'upkeepId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['automationJobs'],
			operation: ['getUpkeep', 'updateUpkeep', 'cancelUpkeep'],
		},
	},
	default: '',
	description: 'The ID of the upkeep',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['automationJobs'],
      operation: ['createUpkeep'],
    },
  },
  default: '',
  description: 'Amount of LINK tokens to fund the upkeep (in wei)',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['automationJobs'],
      operation: ['listUpkeeps'],
    },
  },
  default: '',
  description: 'The account address to list upkeeps for',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['automationJobs'],
      operation: ['listUpkeeps'],
    },
  },
  options: [
    {
      name: 'All',
      value: 'all',
    },
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Paused',
      value: 'paused',
    },
    {
      name: 'Cancelled',
      value: 'cancelled',
    },
  ],
  default: 'all',
  description: 'Filter upkeeps by status',
},
{
  displayName: 'Destination Chain',
  name: 'destinationChain',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['crossChainMessaging'], operation: ['sendMessage', 'estimateFees'] } },
  default: '',
  description: 'The destination chain identifier',
},
{
  displayName: 'Source Network',
  name: 'sourceNetwork',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['crossChainMessaging'],
      operation: ['sendCCIPMessage', 'listCCIPMessages', 'getCCIPLanes', 'getCCIPFees'],
    },
  },
  default: '',
  description: 'The source blockchain network',
},
{
  displayName: 'Destination Network',
  name: 'destinationNetwork',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['crossChainMessaging'],
      operation: ['sendCCIPMessage', 'listCCIPMessages', 'getCCIPLanes', 'getCCIPFees'],
    },
  },
  default: '',
  description: 'The destination blockchain network',
},
{
  displayName: 'Receiver',
  name: 'receiver',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['crossChainMessaging'], operation: ['sendMessage', 'sendCCIPMessage'] } },
  default: '',
  description: 'The receiver address on the destination chain',
},
{
  displayName: 'Receiver Address',
  name: 'receiver',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['crossChainMessaging'],
      operation: ['sendCCIPMessage'],
    },
  },
  default: '',
  description: 'The receiver address on the destination network',
},
{
  displayName: 'Data',
  name: 'data',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['crossChainMessaging'], operation: ['sendMessage', 'estimateFees'] } },
  default: '',
  description: 'The message data to send',
},
{
  displayName: 'Message Data',
  name: 'data',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['crossChainMessaging'],
      operation: ['sendCCIPMessage', 'getCCIPFees'],
    },
  },
  default: '',
  description: 'The message data to send',
},
{
  displayName: 'Token Amounts',
  name: 'tokenAmounts',
  type: 'json',
  displayOptions: { show: { resource: ['crossChainMessaging'], operation: ['sendMessage', 'estimateFees'] } },
  default: '[]',
  description: 'Array of token amounts to transfer',
},
{
  displayName: 'Token Amounts',
  name: 'tokenAmounts',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['crossChainMessaging'],
      operation: ['sendCCIPMessage', 'getCCIPFees'],
    },
  },
  default: '',
  description: 'JSON array of token amounts to transfer',
},
{
  displayName: 'Source Chain',
  name: 'sourceChain',
  type: 'string',
  displayOptions: { show: { resource: ['crossChainMessaging'], operation: ['getAllMessages'] } },
  default: '',
  description: 'Filter by source chain identifier',
},
{
  displayName: 'Destination Chain',
  name: 'destinationChain',
  type: 'string',
  displayOptions: { show: { resource: ['crossChainMessaging'], operation: ['getAllMessages'] } },
  default: '',
  description: 'Filter by destination chain identifier',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: { show: { resource: ['crossChainMessaging'], operation: ['getAllMessages', 'listCCIPMessages'] } },
  options: [
    { name: 'All', value: '' },
    { name: 'Pending', value: 'pending' },
    { name: 'Success', value: 'success' },
    { name: 'Failed', value: 'failed' }
  ],
  default: '',
  description: 'Filter by message status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['crossChainMessaging'], operation: ['getAllMessages', 'listCCIPMessages'] } },
  default: 100,
  description: 'Maximum number of messages to return',
},
{
  displayName: 'Message ID',
  name: 'messageId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['crossChainMessaging'], operation: ['getMessage', 'getCCIPMessage'] } },
  default: '',
  description: 'The unique message identifier',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['crossChainMessaging'],
      operation: ['getCCIPMessage'],
    },
  },
  default: '',
  description: 'The blockchain network to query',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['crossChainMessaging'],
      operation: ['listCCIPMessages'],
    },
  },
  default: '',
  description: 'Filter messages by account address',
},
{
	displayName: 'Source',
	name: 'source',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['functions'],
			operation: ['createFunctionRequest'],
		},
	},
	default: '',
	description: 'JavaScript source code for the function',
},
{
	displayName: 'Arguments',
	name: 'args',
	type: 'json',
	required: false,
	displayOptions: {
		show: {
			resource: ['functions'],
			operation: ['createFunctionRequest'],
		},
	},
	default: '[]',
	description: 'Arguments to pass to the function',
},
{
	displayName: 'Subscription ID',
	name: 'subscriptionId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['functions'],
			operation: ['createFunctionRequest', 'getAllFunctionRequests'],
		},
	},
	default: '',
	description: 'Subscription ID for function execution',
},
{
	displayName: 'Status',
	name: 'status',
	type: 'options',
	required: false,
	displayOptions: {
		show: {
			resource: ['functions'],
			operation: ['getAllFunctionRequests'],
		},
	},
	options: [
		{ name: 'Pending', value: 'pending' },
		{ name: 'In Progress', value: 'in_progress' },
		{ name: 'Completed', value: 'completed' },
		{ name: 'Failed', value: 'failed' },
	],
	default: '',
	description: 'Filter by request status',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	required: false,
	displayOptions: {
		show: {
			resource: ['functions'],
			operation: ['getAllFunctionRequests'],
		},
	},
	default: 100,
	description: 'Maximum number of requests to return',
},
{
	displayName: 'Request ID',
	name: 'requestId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['functions'],
			operation: ['getFunctionRequest'],
		},
	},
	default: '',
	description: 'Function request ID',
},
{
	displayName: 'Subscription ID',
	name: 'subId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['functions'],
			operation: ['getFunctionSubscription'],
		},
	},
	default: '',
	description: 'Function subscription ID',
},
{
	displayName: 'Consumer Address',
	name: 'consumerAddress',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['functions'],
			operation: ['createFunctionSubscription'],
		},
	},
	default: '',
	description: 'Ethereum address of the consumer contract',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'priceFeeds':
        return [await executePriceFeedsOperations.call(this, items)];
      case 'vrfRequests':
        return [await executeVrfRequestsOperations.call(this, items)];
      case 'automationJobs':
        return [await executeAutomationJobsOperations.call(this, items)];
      case 'crossChainMessaging':
        return [await executeCrossChainMessagingOperations.call(this, items)];
      case 'functions':
        return [await executeFunctionsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executePriceFeedsOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('chainlinkApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'getAllFeeds': {
					const network = this.getNodeParameter('network', i) as string;
					const category = this.getNodeParameter('category', i) as string;
					
					let url = `${credentials.baseUrl}/v1/feeds`;
					const queryParams: string[] = [];
					
					if (network) {
						queryParams.push(`network=${encodeURIComponent(network)}`);
					}
					if (category) {
						queryParams.push(`category=${encodeURIComponent(category)}`);
					}
					
					if (queryParams.length > 0) {
						url += `?${queryParams.join('&')}`;
					}

					const options: any = {
						method: 'GET',
						url,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getFeed': {
					const feedId = this.getNodeParameter('feedId', i) as string;
          const network = this.getNodeParameter('network', i) as string;

          const queryString = new URLSearchParams({ network }).toString();
					
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/v1/feeds/${encodeURIComponent(feedId)}?${queryString}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getFeedRounds': {
					const feedId = this.getNodeParameter('feedId', i) as string;
          const from = this.getNodeParameter('from', i) as number;
          const to = this.getNodeParameter('to', i) as number;
					const limit = this.getNodeParameter('limit', i) as number;
					const offset = this.getNodeParameter('offset', i) as number;
					
          const queryParams: any = {};
          if (from > 0) queryParams.from = from.toString();
          if (to > 0) queryParams.to = to.toString();
          if (limit > 0) queryParams.limit = limit.toString();
          if (offset > 0) queryParams.offset = offset.toString();

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/v1/feeds/${encodeURIComponent(feedId)}/rounds${queryString ? '?' + queryString : ''}`;
					
					const options: any = {
						method: 'GET',
						url,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getLatestPrice': {
					const feedId = this.getNodeParameter('feedId', i) as string;
          const network = this.getNodeParameter('network', i) as string;

          const queryString = new URLSearchParams({ network }).toString();
					
					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/v1/feeds/${encodeURIComponent(feedId)}/latest?${queryString}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getBulkPrices': {
					const feedIds = this.getNodeParameter('feedIds', i) as string;
					
					const url = `${credentials.baseUrl}/v1/feeds/bulk?feedIds=${encodeURIComponent(feedIds)}`;
					
					const options: any = {
						method: 'GET',
						url,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

        case 'searchFeeds': {
          const query = this.getNodeParameter('query', i) as string;
          const network = this.getNodeParameter('network', i) as string;

          const queryParams = new URLSearchParams({ query, network }).toString();

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.chain.link/v1'}/feeds/search?${queryParams}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

				default:
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation: ${operation}`,
						{ itemIndex: i },
					);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});
		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: {
						error: error.message,
						operation,
					},
					pairedItem: { item: i },
				});
			} else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
			}
		}
	}

	return returnData;
}

async function executeVrfRequestsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('chainlinkApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'createVrfRequest': {
          const keyHash = this.getNodeParameter('keyHash', i) as string;
          const subId = this.getNodeParameter('subId', i) as string;
          const callbackGasLimit = this.getNodeParameter('callbackGasLimit', i) as number;
          const requestConfirmations = this.getNodeParameter('requestConfirmations', i) as number;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/v2/vrf/requests`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              keyHash,
              subId,
              callbackGasLimit,
              requestConfirmations,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAllVrfRequests': {
          const subId = this.getNodeParameter('subId', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams = new URLSearchParams();
          if (subId) queryParams.append('subId', subId);
          if (status) queryParams.append('status', status);
          if (limit) queryParams.append('limit', limit.toString());

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v2/vrf/requests?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getVrfRequest': {
          const requestId = this.getNodeParameter('requestId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v2/vrf/requests/${requestId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getVrfSubscription': {
          const subId = this.getNodeParameter('subId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v2/vrf/subscriptions/${subId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createVrfSubscription': {
          const consumerAddress = this.getNodeParameter('consumerAddress', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/v2/vrf/subscriptions`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              consumerAddress,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createVRFRequest': {
          const network = this.getNodeParameter('network', i) as string;
          const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
          const keyHash = this.getNodeParameter('keyHash', i) as string;
          const callbackGasLimit = this.getNodeParameter('callbackGasLimit', i) as number;
          const numWords = this.getNodeParameter('numWords', i) as number;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/vrf/requests`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              network,
              subscriptionId,
              keyHash,
              callbackGasLimit,
              numWords,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getVRFRequest': {
          const requestId = this.getNodeParameter('requestId', i) as string;
          const network = this.getNodeParameter('network', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/vrf/requests/${requestId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs: {
              network,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listVRFRequests': {
          const network = this.getNodeParameter('network', i) as string;
          const account = this.getNodeParameter('account', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const qs: any = {
            network,
            account,
            limit,
          };

          if (status !== 'all') {
            qs.status = status;
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/vrf/requests`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getVRFSubscription': {
          const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
          const network = this.getNodeParameter('network', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/vrf/subscriptions/${subscriptionId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs: {
              network,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createVRFSubscription': {
          const network = this.getNodeParameter('network', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/vrf/subscriptions`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              network,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeAutomationJobsOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('chainlinkApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'createUpkeep': {
          const network = this.getNodeParameter('network', i) as string;
					const target = this.getNodeParameter('target', i) as string;
					const checkData = this.getNodeParameter('checkData', i) as string;
					const gasLimit = this.getNodeParameter('gasLimit', i) as number;
					const admin = this.getNodeParameter('admin', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;

					const body: any = {
            network,
						target,
						checkData,
						gasLimit,
            amount,
					};

					if (admin) {
						body.admin = admin;
					}

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/v1/automation/upkeeps`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
            body: JSON.stringify(body),
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getAllUpkeeps': {
					const admin = this.getNodeParameter('admin', i) as string;
					const active = this.getNodeParameter('active', i) as boolean;
					const limit = this.getNodeParameter('limit', i) as number;

					const queryParams: any = {};
					if (admin) queryParams.admin = admin;
					if (active !== undefined) queryParams.active = active;
					if (limit) queryParams.limit = limit;

					const queryString = new URLSearchParams(queryParams).toString();
					const url = queryString 
						? `${credentials.baseUrl}/v1/automation/upkeeps?${queryString}`
						: `${credentials.baseUrl}/v1/automation/upkeeps`;

					const options: any = {
						method: 'GET',
						url,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getUpkeep': {
					const upkeepId = this.getNodeParameter('upkeepId', i) as string;
          const network = this.getNodeParameter('network', i) as string;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/v1/automation/upkeeps/${upkeepId}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
						},
            qs: {
              network,
            },
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'updateUpkeep': {
					const upkeepId = this.getNodeParameter('upkeepId', i) as string;
          const network = this.getNodeParameter('network', i) as string;
					const gasLimit = this.getNodeParameter('gasLimit', i) as number;
					const checkData = this.getNodeParameter('checkData', i) as string;

					const body: any = {
            network,
						gasLimit,
						checkData,
					};

					const options: any = {
						method: 'PUT',
						url: `${credentials.baseUrl}/v1/automation/upkeeps/${upkeepId}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
            body: JSON.stringify(body),
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'cancelUpkeep': {
					const upkeepId = this.getNodeParameter('upkeepId', i) as string;
          const network = this.getNodeParameter('network', i) as string;

					const options: any = {
						method: 'DELETE',
						url: `${credentials.baseUrl}/v1/automation/upkeeps/${upkeepId}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
						},
            qs: {
              network,
            },
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

        case 'listUpkeeps': {
          const network = this.getNodeParameter('network', i) as string;
          const account = this.getNodeParameter('account', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams: any = {
            network,
            account,
            limit,
          };

          if (status !== 'all') {
            queryParams.status = status;
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/automation/upkeeps`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs: queryParams,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

				default:
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation: ${operation}`,
						{ itemIndex: i },
					);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
        throw new NodeApiError(this.getNode(), error);
			}
		}
	}

	return returnData;
}

async function executeCrossChainMessagingOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('chainlinkApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'sendMessage': {
          const destinationChain = this.getNodeParameter('destinationChain', i) as string;
          const receiver = this.getNodeParameter('receiver', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const tokenAmounts = this.getNodeParameter('tokenAmounts', i) as any;

          const body = {
            destinationChain,
            receiver,
            data,
            tokenAmounts: typeof tokenAmounts === 'string' ? JSON.parse(tokenAmounts) : tokenAmounts,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/v1/ccip/messages`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAllMessages': {
          const sourceChain = this.getNodeParameter('sourceChain', i) as string;
          const destinationChain = this.getNodeParameter('destinationChain', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams = new URLSearchParams();
          if (sourceChain) queryParams.append('sourceChain', sourceChain);
          if (destinationChain) queryParams.append('destinationChain', destinationChain);
          if (status) queryParams.append('status', status);
          if (limit) queryParams.append('limit', limit.toString());

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/ccip/messages?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getMessage': {
          const messageId = this.getNodeParameter('messageId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/ccip/messages/${messageId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSupportedLanes': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/ccip/lanes`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'estimateFees': {
          const destinationChain = this.getNodeParameter('destinationChain', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const tokenAmounts = this.getNodeParameter('tokenAmounts', i) as any;

          const queryParams = new URLSearchParams();
          queryParams.append('destinationChain', destinationChain);
          queryParams.append('data', data);
          if (tokenAmounts) {
            const tokenAmountsStr = typeof tokenAmounts === 'string' ? tokenAmounts : JSON.stringify(tokenAmounts);
            queryParams.append('tokenAmounts', tokenAmountsStr);
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v1/ccip/fees?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'sendCCIPMessage': {
          const sourceNetwork = this.getNodeParameter('sourceNetwork', i) as string;
          const destinationNetwork = this.getNodeParameter('destinationNetwork', i) as string;
          const receiver = this.getNodeParameter('receiver', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const tokenAmounts = this.getNodeParameter('tokenAmounts', i) as string;

          const body: any = {
            sourceNetwork,
            destinationNetwork,
            receiver,
            data,
          };

          if (tokenAmounts) {
            try {
              body.tokenAmounts = JSON.parse(tokenAmounts);
            } catch (error: any) {
              throw new NodeOperationError(this.getNode(), 'Invalid JSON format for tokenAmounts');
            }
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/ccip/messages`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCCIPMessage': {
          const messageId = this.getNodeParameter('messageId', i) as string;
          const network = this.getNodeParameter('network', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ccip/messages/${messageId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs: {
              network,
            },
            json: true,