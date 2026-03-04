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
      // Resource selector
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
            name: 'VRFRequests',
            value: 'vRFRequests',
          },
          {
            name: 'Automation',
            value: 'automation',
          },
          {
            name: 'CCIP',
            value: 'cCIP',
          },
          {
            name: 'unknown',
            value: 'unknown',
          }
        ],
        default: 'priceFeeds',
      },
      // Operation dropdowns per resource
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
      description: 'Get list of all available price feeds',
      action: 'Get all feeds',
    },
    {
      name: 'Get Feed',
      value: 'getFeed',
      description: 'Get specific price feed details',
      action: 'Get feed details',
    },
    {
      name: 'Get Feed Rounds',
      value: 'getFeedRounds',
      description: 'Get historical price rounds for a feed',
      action: 'Get feed rounds',
    },
    {
      name: 'Get Latest Price',
      value: 'getLatestPrice',
      description: 'Get latest price data for a feed',
      action: 'Get latest price',
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
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
    },
  },
  options: [
    {
      name: 'Create VRF Request',
      value: 'createVRFRequest',
      description: 'Submit new VRF randomness request',
      action: 'Create VRF request',
    },
    {
      name: 'Get VRF Request',
      value: 'getVRFRequest',
      description: 'Get VRF request details and status',
      action: 'Get VRF request',
    },
    {
      name: 'List VRF Requests',
      value: 'listVRFRequests',
      description: 'List VRF requests for account',
      action: 'List VRF requests',
    },
    {
      name: 'Get VRF Subscription',
      value: 'getVRFSubscription',
      description: 'Get VRF subscription details',
      action: 'Get VRF subscription',
    },
    {
      name: 'Create VRF Subscription',
      value: 'createVRFSubscription',
      description: 'Create new VRF subscription',
      action: 'Create VRF subscription',
    },
  ],
  default: 'createVRFRequest',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['automation'],
    },
  },
  options: [
    {
      name: 'Create Upkeep',
      value: 'createUpkeep',
      description: 'Register new upkeep for automation',
      action: 'Create upkeep',
    },
    {
      name: 'Get Upkeep',
      value: 'getUpkeep',
      description: 'Get upkeep details and status',
      action: 'Get upkeep',
    },
    {
      name: 'List Upkeeps',
      value: 'listUpkeeps',
      description: 'List upkeeps for account',
      action: 'List upkeeps',
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
      description: 'Cancel upkeep registration',
      action: 'Cancel upkeep',
    },
  ],
  default: 'createUpkeep',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['cCIP'],
    },
  },
  options: [
    {
      name: 'Send Cross-Chain Message',
      value: 'sendCCIPMessage',
      description: 'Send a cross-chain message via CCIP',
      action: 'Send cross-chain message',
    },
    {
      name: 'Get Message Status',
      value: 'getCCIPMessage',
      description: 'Get the status of a cross-chain message',
      action: 'Get message status',
    },
    {
      name: 'List Messages',
      value: 'listCCIPMessages',
      description: 'List cross-chain messages',
      action: 'List messages',
    },
    {
      name: 'Get CCIP Lanes',
      value: 'getCCIPLanes',
      description: 'Get available cross-chain lanes',
      action: 'Get CCIP lanes',
    },
    {
      name: 'Calculate Fees',
      value: 'getCCIPFees',
      description: 'Calculate cross-chain message fees',
      action: 'Calculate fees',
    },
  ],
  default: 'sendCCIPMessage',
},
      // Parameter definitions
{
  displayName: 'Network',
  name: 'network',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['priceFeeds'],
      operation: ['getAllFeeds', 'getFeed', 'getLatestPrice', 'searchFeeds'],
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
  displayName: 'Category',
  name: 'category',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['priceFeeds'],
      operation: ['getAllFeeds'],
    },
  },
  options: [
    { name: 'All', value: '' },
    { name: 'Cryptocurrency', value: 'crypto' },
    { name: 'Forex', value: 'forex' },
    { name: 'Commodities', value: 'commodities' },
    { name: 'Indices', value: 'indices' },
  ],
  default: '',
  description: 'Filter feeds by category',
  required: false,
},
{
  displayName: 'Feed ID',
  name: 'feedId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['priceFeeds'],
      operation: ['getFeed', 'getFeedRounds', 'getLatestPrice'],
    },
  },
  default: '',
  description: 'The unique identifier of the price feed',
  required: true,
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
  required: false,
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
  displayName: 'Network',
  name: 'network',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
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
  displayName: 'Subscription ID',
  name: 'subscriptionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
      operation: ['createVRFRequest'],
    },
  },
  default: '',
  description: 'The VRF subscription ID to use for the request',
},
{
  displayName: 'Key Hash',
  name: 'keyHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
      operation: ['createVRFRequest'],
    },
  },
  default: '',
  description: 'The key hash identifying which oracle key pair to use',
},
{
  displayName: 'Callback Gas Limit',
  name: 'callbackGasLimit',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
      operation: ['createVRFRequest'],
    },
  },
  default: 100000,
  description: 'The gas limit for the callback function',
},
{
  displayName: 'Number of Words',
  name: 'numWords',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
      operation: ['createVRFRequest'],
    },
  },
  default: 1,
  description: 'The number of random words to request (max 500)',
},
{
  displayName: 'Request ID',
  name: 'requestId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
      operation: ['getVRFRequest'],
    },
  },
  default: '',
  description: 'The VRF request ID to retrieve',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
      operation: ['listVRFRequests'],
    },
  },
  default: '',
  description: 'The account address to list VRF requests for',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
      operation: ['listVRFRequests'],
    },
  },
  options: [
    { name: 'All', value: 'all' },
    { name: 'Pending', value: 'pending' },
    { name: 'Fulfilled', value: 'fulfilled' },
    { name: 'Failed', value: 'failed' },
  ],
  default: 'all',
  description: 'Filter requests by status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
      operation: ['listVRFRequests'],
    },
  },
  default: 10,
  description: 'Maximum number of requests to return',
},
{
  displayName: 'Subscription ID',
  name: 'subscriptionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['vRFRequests'],
      operation: ['getVRFSubscription'],
    },
  },
  default: '',
  description: 'The VRF subscription ID to retrieve',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['automation'],
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
  displayName: 'Target Contract',
  name: 'target',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['automation'],
      operation: ['createUpkeep'],
    },
  },
  default: '',
  description: 'The target contract address for automation',
},
{
  displayName: 'Gas Limit',
  name: 'gasLimit',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['automation'],
      operation: ['createUpkeep', 'updateUpkeep'],
    },
  },
  default: 2500000,
  description: 'Gas limit for upkeep execution',
},
{
  displayName: 'Check Data',
  name: 'checkData',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['automation'],
      operation: ['createUpkeep', 'updateUpkeep'],
    },
  },
  default: '0x',
  description: 'ABI-encoded data for checkUpkeep function',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['automation'],
      operation: ['createUpkeep'],
    },
  },
  default: '',
  description: 'Amount of LINK tokens to fund the upkeep (in wei)',
},
{
  displayName: 'Upkeep ID',
  name: 'upkeepId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['automation'],
      operation: ['getUpkeep', 'updateUpkeep', 'cancelUpkeep'],
    },
  },
  default: '',
  description: 'The ID of the upkeep',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['automation'],
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
      resource: ['automation'],
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
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['automation'],
      operation: ['listUpkeeps'],
    },
  },
  default: 100,
  description: 'Maximum number of upkeeps to return',
},
{
  displayName: 'Source Network',
  name: 'sourceNetwork',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['cCIP'],
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
      resource: ['cCIP'],
      operation: ['sendCCIPMessage', 'listCCIPMessages', 'getCCIPLanes', 'getCCIPFees'],
    },
  },
  default: '',
  description: 'The destination blockchain network',
},
{
  displayName: 'Receiver Address',
  name: 'receiver',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['cCIP'],
      operation: ['sendCCIPMessage'],
    },
  },
  default: '',
  description: 'The receiver address on the destination network',
},
{
  displayName: 'Message Data',
  name: 'data',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['cCIP'],
      operation: ['sendCCIPMessage', 'getCCIPFees'],
    },
  },
  default: '',
  description: 'The message data to send',
},
{
  displayName: 'Token Amounts',
  name: 'tokenAmounts',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['cCIP'],
      operation: ['sendCCIPMessage', 'getCCIPFees'],
    },
  },
  default: '',
  description: 'JSON array of token amounts to transfer',
},
{
  displayName: 'Message ID',
  name: 'messageId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['cCIP'],
      operation: ['getCCIPMessage'],
    },
  },
  default: '',
  description: 'The CCIP message ID',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['cCIP'],
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
      resource: ['cCIP'],
      operation: ['listCCIPMessages'],
    },
  },
  default: '',
  description: 'Filter messages by account address',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['cCIP'],
      operation: ['listCCIPMessages'],
    },
  },
  options: [
    {
      name: 'Pending',
      value: 'pending',
    },
    {
      name: 'Success',
      value: 'success',
    },
    {
      name: 'Failed',
      value: 'failed',
    },
  ],
  default: '',
  description: 'Filter messages by status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['cCIP'],
      operation: ['listCCIPMessages'],
    },
  },
  default: 100,
  description: 'Maximum number of messages to return',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'priceFeeds':
        return [await executePriceFeedsOperations.call(this, items)];
      case 'vRFRequests':
        return [await executeVRFRequestsOperations.call(this, items)];
      case 'automation':
        return [await executeAutomationOperations.call(this, items)];
      case 'cCIP':
        return [await executeCCIPOperations.call(this, items)];
      case 'unknown':
        return [await executeunknownOperations.call(this, items)];
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

          const queryParams: any = { network };
          if (category) {
            queryParams.category = category;
          }

          const queryString = new URLSearchParams(queryParams).toString();

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.chain.link/v1'}/feeds?${queryString}`,
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
            url: `${credentials.baseUrl || 'https://api.chain.link/v1'}/feeds/${feedId}?${queryString}`,
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

          const queryParams: any = {};
          if (from > 0) queryParams.from = from.toString();
          if (to > 0) queryParams.to = to.toString();
          if (limit > 0) queryParams.limit = limit.toString();

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl || 'https://api.chain.link/v1'}/feeds/${feedId}/rounds${queryString ? '?' + queryString : ''}`;

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
            url: `${credentials.baseUrl || 'https://api.chain.link/v1'}/feeds/${feedId}/latest?${queryString}`,
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
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ 
        json: result,
        pairedItem: { item: i }
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message },
          pairedItem: { item: i }
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

async function executeVRFRequestsOperations(
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

async function executeAutomationOperations(
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
          const gasLimit = this.getNodeParameter('gasLimit', i) as number;
          const checkData = this.getNodeParameter('checkData', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;

          const body: any = {
            network,
            target,
            gasLimit,
            checkData,
            amount,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/automation/upkeeps`,
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

        case 'getUpkeep': {
          const upkeepId = this.getNodeParameter('upkeepId', i) as string;
          const network = this.getNodeParameter('network', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/automation/upkeeps/${upkeepId}`,
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
            url: `${credentials.baseUrl}/automation/upkeeps/${upkeepId}`,
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
            url: `${credentials.baseUrl}/automation/upkeeps/${upkeepId}`,
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

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ 
        json: result, 
        pairedItem: { item: i } 
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeCCIPOperations(
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
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listCCIPMessages': {
          const sourceNetwork = this.getNodeParameter('sourceNetwork', i) as string;
          const destinationNetwork = this.getNodeParameter('destinationNetwork', i) as string;
          const account = this.getNodeParameter('account', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const qs: any = {
            sourceNetwork,
            destinationNetwork,
            limit,
          };

          if (account) {
            qs.account = account;
          }

          if (status) {
            qs.status = status;
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ccip/messages`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCCIPLanes': {
          const sourceNetwork = this.getNodeParameter('sourceNetwork', i) as string;
          const destinationNetwork = this.getNodeParameter('destinationNetwork', i) as string;

          const qs: any = {};

          if (sourceNetwork) {
            qs.sourceNetwork = sourceNetwork;
          }

          if (destinationNetwork) {
            qs.destinationNetwork = destinationNetwork;
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ccip/lanes`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCCIPFees': {
          const sourceNetwork = this.getNodeParameter('sourceNetwork', i) as string;
          const destinationNetwork = this.getNodeParameter('destinationNetwork', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const tokenAmounts = this.getNodeParameter('tokenAmounts', i) as string;

          const qs: any = {
            sourceNetwork,
            destinationNetwork,
            data,
          };

          if (tokenAmounts) {
            try {
              qs.tokenAmounts = JSON.stringify(JSON.parse(tokenAmounts));
            } catch (error: any) {
              throw new NodeOperationError(this.getNode(), 'Invalid JSON format for tokenAmounts');
            }
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ccip/fees`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message },
          pairedItem: { item: i }
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error, { httpCode: error.httpCode });
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

// PARSE ERROR for unknown — manual fix needed
// Raw: // No additional imports

{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['functions'],
    },
  },
  options: [
    {
      name: 'Create Function Request',
      value: 'createFunctionRequest',
      d
