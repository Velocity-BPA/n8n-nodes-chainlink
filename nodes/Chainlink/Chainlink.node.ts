/**
 * Chainlink Node for n8n
 * Comprehensive integration with Chainlink oracle services
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

// Import action handlers
import * as priceFeed from './actions/priceFeed';
import * as dataFeed from './actions/dataFeed';
import * as vrf from './actions/vrf';
import * as automation from './actions/automation';
import * as ccip from './actions/ccip';
import * as functions from './actions/functions';
import * as linkToken from './actions/linkToken';
import * as networkUtils from './actions/networkUtils';

export class Chainlink implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chainlink',
    name: 'chainlink',
    icon: 'file:chainlink.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: 'Interact with Chainlink oracle services - Price Feeds, VRF, Automation, CCIP, and more',
    defaults: {
      name: 'Chainlink',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'chainlinkRpcApi',
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
          { name: 'Price Feed', value: 'priceFeed', description: 'Chainlink Data Feeds for asset prices' },
          { name: 'Data Feed', value: 'dataFeed', description: 'Specialized feeds (PoR, NFT Floor, L2 Sequencer)' },
          { name: 'VRF', value: 'vrf', description: 'Verifiable Random Function' },
          { name: 'Automation', value: 'automation', description: 'Chainlink Automation (Keepers)' },
          { name: 'CCIP', value: 'ccip', description: 'Cross-Chain Interoperability Protocol' },
          { name: 'Functions', value: 'functions', description: 'Chainlink Functions (Serverless)' },
          { name: 'LINK Token', value: 'linkToken', description: 'LINK token operations' },
          { name: 'Network Utilities', value: 'networkUtils', description: 'Network helpers and utilities' },
        ],
        default: 'priceFeed',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['priceFeed'] } },
        options: [
          { name: 'Get Latest Price', value: 'getLatestPrice', action: 'Get latest price' },
          { name: 'Get Price Feed Data', value: 'getPriceFeedData', action: 'Get price feed data' },
          { name: 'Get Historical Price', value: 'getHistoricalPrice', action: 'Get historical price' },
          { name: 'Get Feed Description', value: 'getFeedDescription', action: 'Get feed description' },
          { name: 'Get Multiple Prices', value: 'getMultiplePrices', action: 'Get multiple prices' },
          { name: 'List Available Feeds', value: 'listAvailableFeeds', action: 'List available feeds' },
          { name: 'Calculate Derived Price', value: 'getDerivedPrice', action: 'Calculate derived price' },
          { name: 'Get Feed Registry Price', value: 'getFeedRegistryPrice', action: 'Get feed registry price' },
        ],
        default: 'getLatestPrice',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['dataFeed'] } },
        options: [
          { name: 'Get Proof of Reserve', value: 'getProofOfReserve', action: 'Get proof of reserve' },
          { name: 'Get NFT Floor Price', value: 'getNFTFloorPrice', action: 'Get NFT floor price' },
          { name: 'Get L2 Sequencer Status', value: 'getL2SequencerStatus', action: 'Get L2 sequencer status' },
          { name: 'List PoR Feeds', value: 'listPorFeeds', action: 'List PoR feeds' },
          { name: 'List NFT Floor Feeds', value: 'listNftFloorFeeds', action: 'List NFT floor feeds' },
          { name: 'List Sequencer Feeds', value: 'listSequencerFeeds', action: 'List sequencer feeds' },
        ],
        default: 'getProofOfReserve',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['vrf'] } },
        options: [
          { name: 'Get Subscription Details', value: 'getSubscriptionDetails', action: 'Get subscription details' },
          { name: 'Get VRF Coordinator Info', value: 'getVRFCoordinatorInfo', action: 'Get VRF coordinator info' },
          { name: 'List Subscription Consumers', value: 'listSubscriptionConsumers', action: 'List subscription consumers' },
          { name: 'Calculate Request Price', value: 'calculateRequestPrice', action: 'Calculate request price' },
          { name: 'Check Request Status', value: 'checkRequestStatus', action: 'Check request status' },
          { name: 'Decode VRF Request', value: 'decodeVRFRequest', action: 'Decode VRF request' },
          { name: 'Get VRF Networks', value: 'getVRFNetworks', action: 'Get VRF networks' },
        ],
        default: 'getSubscriptionDetails',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['automation'] } },
        options: [
          { name: 'Get Upkeep Details', value: 'getUpkeepDetails', action: 'Get upkeep details' },
          { name: 'Check Upkeep Status', value: 'checkUpkeepStatus', action: 'Check upkeep status' },
          { name: 'Get Upkeep Balance', value: 'getUpkeepBalance', action: 'Get upkeep balance' },
          { name: 'Get Minimum Balance', value: 'getMinimumBalance', action: 'Get minimum balance' },
          { name: 'Simulate Upkeep', value: 'simulateUpkeep', action: 'Simulate upkeep' },
          { name: 'Get Registry State', value: 'getRegistryState', action: 'Get registry state' },
          { name: 'Get Upkeep History', value: 'getUpkeepHistory', action: 'Get upkeep history' },
          { name: 'List Automation Networks', value: 'listAutomationNetworks', action: 'List automation networks' },
        ],
        default: 'getUpkeepDetails',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['ccip'] } },
        options: [
          { name: 'Get Supported Lanes', value: 'getSupportedLanes', action: 'Get supported lanes' },
          { name: 'Check Lane Support', value: 'checkLaneSupport', action: 'Check lane support' },
          { name: 'Calculate Message Fee', value: 'calculateMessageFee', action: 'Calculate message fee' },
          { name: 'Get Router Configuration', value: 'getRouterConfiguration', action: 'Get router configuration' },
          { name: 'Track Cross-Chain Message', value: 'trackCrossChainMessage', action: 'Track cross-chain message' },
          { name: 'List Chain Selectors', value: 'listChainSelectors', action: 'List chain selectors' },
          { name: 'Get Token Transfer Limits', value: 'getTokenTransferLimits', action: 'Get token transfer limits' },
        ],
        default: 'getSupportedLanes',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['functions'] } },
        options: [
          { name: 'Get Subscription Info', value: 'getSubscriptionInfo', action: 'Get subscription info' },
          { name: 'Get DON Configuration', value: 'getDONConfiguration', action: 'Get DON configuration' },
          { name: 'Estimate Request Cost', value: 'estimateRequestCost', action: 'Estimate request cost' },
          { name: 'Decode Response', value: 'decodeResponse', action: 'Decode response' },
          { name: 'Get Supported Networks', value: 'getSupportedNetworks', action: 'Get supported networks' },
          { name: 'Validate Source Code', value: 'validateSourceCode', action: 'Validate source code' },
        ],
        default: 'getSubscriptionInfo',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['linkToken'] } },
        options: [
          { name: 'Get LINK Balance', value: 'getLinkBalance', action: 'Get LINK balance' },
          { name: 'Get LINK Price', value: 'getLinkPrice', action: 'Get LINK price' },
          { name: 'Transfer LINK', value: 'transferLink', action: 'Transfer LINK' },
          { name: 'Get LINK Token Address', value: 'getLinkTokenAddress', action: 'Get LINK token address' },
          { name: 'Check LINK Allowance', value: 'checkLinkAllowance', action: 'Check LINK allowance' },
          { name: 'Get LINK Total Supply', value: 'getLinkTotalSupply', action: 'Get LINK total supply' },
          { name: 'Get All LINK Addresses', value: 'getAllLinkAddresses', action: 'Get all LINK addresses' },
        ],
        default: 'getLinkBalance',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['networkUtils'] } },
        options: [
          { name: 'Get Gas Price', value: 'getGasPrice', action: 'Get gas price' },
          { name: 'Get ETH Price', value: 'getEthPrice', action: 'Get ETH price' },
          { name: 'Get Network Status', value: 'getNetworkStatus', action: 'Get network status' },
          { name: 'Validate Address', value: 'validateAddress', action: 'Validate address' },
          { name: 'List Supported Networks', value: 'listSupportedNetworks', action: 'List supported networks' },
          { name: 'Check Contract Exists', value: 'checkContractExists', action: 'Check contract exists' },
          { name: 'Convert Units', value: 'convertUnits', action: 'Convert units' },
          { name: 'Get Block Info', value: 'getBlockInfo', action: 'Get block info' },
        ],
        default: 'getGasPrice',
      },
      // Price Feed Parameters
      { displayName: 'Feed Source', name: 'feedSource', type: 'options', options: [{ name: 'Preset Feed', value: 'preset' }, { name: 'Custom Address', value: 'custom' }], default: 'preset', displayOptions: { show: { resource: ['priceFeed'], operation: ['getLatestPrice'] } } },
      { displayName: 'Price Pair', name: 'pricePair', type: 'options', options: [{ name: 'ETH/USD', value: 'ETH/USD' }, { name: 'BTC/USD', value: 'BTC/USD' }, { name: 'LINK/USD', value: 'LINK/USD' }, { name: 'USDC/USD', value: 'USDC/USD' }, { name: 'USDT/USD', value: 'USDT/USD' }, { name: 'MATIC/USD', value: 'MATIC/USD' }, { name: 'AVAX/USD', value: 'AVAX/USD' }, { name: 'BNB/USD', value: 'BNB/USD' }], default: 'ETH/USD', displayOptions: { show: { resource: ['priceFeed'], operation: ['getLatestPrice'], feedSource: ['preset'] } } },
      { displayName: 'Feed Address', name: 'feedAddress', type: 'string', default: '', placeholder: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', displayOptions: { show: { resource: ['priceFeed'], operation: ['getLatestPrice'], feedSource: ['custom'] } } },
      { displayName: 'Feed Address', name: 'feedAddress', type: 'string', default: '', placeholder: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', displayOptions: { show: { resource: ['priceFeed'], operation: ['getPriceFeedData', 'getHistoricalPrice', 'getFeedDescription'] } } },
      { displayName: 'Round ID', name: 'roundId', type: 'string', default: '', displayOptions: { show: { resource: ['priceFeed'], operation: ['getHistoricalPrice'] } } },
      { displayName: 'Feed Addresses', name: 'feedAddresses', type: 'string', default: '', placeholder: '0x...,0x...', displayOptions: { show: { resource: ['priceFeed'], operation: ['getMultiplePrices'] } } },
      { displayName: 'Feed Category', name: 'feedCategory', type: 'options', options: [{ name: 'All', value: 'all' }, { name: 'Crypto', value: 'crypto' }, { name: 'Forex', value: 'forex' }, { name: 'Commodity', value: 'commodity' }], default: 'all', displayOptions: { show: { resource: ['priceFeed'], operation: ['listAvailableFeeds'] } } },
      { displayName: 'Base Feed Address', name: 'baseFeedAddress', type: 'string', default: '', displayOptions: { show: { resource: ['priceFeed'], operation: ['getDerivedPrice'] } } },
      { displayName: 'Quote Feed Address', name: 'quoteFeedAddress', type: 'string', default: '', displayOptions: { show: { resource: ['priceFeed'], operation: ['getDerivedPrice'] } } },
      { displayName: 'Base Asset', name: 'baseAsset', type: 'options', options: [{ name: 'ETH', value: 'ETH' }, { name: 'BTC', value: 'BTC' }, { name: 'LINK', value: 'LINK' }], default: 'ETH', displayOptions: { show: { resource: ['priceFeed'], operation: ['getFeedRegistryPrice'] } } },
      { displayName: 'Quote Asset', name: 'quoteAsset', type: 'options', options: [{ name: 'USD', value: 'USD' }, { name: 'EUR', value: 'EUR' }], default: 'USD', displayOptions: { show: { resource: ['priceFeed'], operation: ['getFeedRegistryPrice'] } } },
      // Data Feed Parameters
      { displayName: 'PoR Feed Source', name: 'porFeedSource', type: 'options', options: [{ name: 'Preset Feed', value: 'preset' }, { name: 'Custom Address', value: 'custom' }], default: 'preset', displayOptions: { show: { resource: ['dataFeed'], operation: ['getProofOfReserve'] } } },
      { displayName: 'PoR Asset', name: 'porAsset', type: 'options', options: [{ name: 'WBTC', value: 'WBTC' }, { name: 'TUSD', value: 'TUSD' }, { name: 'USDC', value: 'USDC' }], default: 'WBTC', displayOptions: { show: { resource: ['dataFeed'], operation: ['getProofOfReserve'], porFeedSource: ['preset'] } } },
      { displayName: 'PoR Feed Address', name: 'porFeedAddress', type: 'string', default: '', displayOptions: { show: { resource: ['dataFeed'], operation: ['getProofOfReserve'], porFeedSource: ['custom'] } } },
      { displayName: 'NFT Feed Source', name: 'nftFeedSource', type: 'options', options: [{ name: 'Preset Collection', value: 'preset' }, { name: 'Custom Address', value: 'custom' }], default: 'preset', displayOptions: { show: { resource: ['dataFeed'], operation: ['getNFTFloorPrice'] } } },
      { displayName: 'NFT Collection', name: 'nftCollection', type: 'options', options: [{ name: 'Bored Ape Yacht Club', value: 'BAYC' }, { name: 'CryptoPunks', value: 'CRYPTOPUNKS' }, { name: 'Mutant Ape Yacht Club', value: 'MAYC' }], default: 'BAYC', displayOptions: { show: { resource: ['dataFeed'], operation: ['getNFTFloorPrice'], nftFeedSource: ['preset'] } } },
      { displayName: 'NFT Feed Address', name: 'nftFeedAddress', type: 'string', default: '', displayOptions: { show: { resource: ['dataFeed'], operation: ['getNFTFloorPrice'], nftFeedSource: ['custom'] } } },
      { displayName: 'Sequencer Feed Source', name: 'sequencerFeedSource', type: 'options', options: [{ name: 'Auto-detect', value: 'auto' }, { name: 'Custom Address', value: 'custom' }], default: 'auto', displayOptions: { show: { resource: ['dataFeed'], operation: ['getL2SequencerStatus'] } } },
      { displayName: 'Sequencer Feed Address', name: 'sequencerFeedAddress', type: 'string', default: '', displayOptions: { show: { resource: ['dataFeed'], operation: ['getL2SequencerStatus'], sequencerFeedSource: ['custom'] } } },
      // VRF Parameters
      { displayName: 'Subscription ID', name: 'subscriptionId', type: 'number', default: 0, displayOptions: { show: { resource: ['vrf'], operation: ['getSubscriptionDetails', 'listSubscriptionConsumers'] } } },
      { displayName: 'Subscription ID', name: 'subscriptionId', type: 'number', default: 0, displayOptions: { show: { resource: ['functions'], operation: ['getSubscriptionInfo'] } } },
      { displayName: 'Callback Gas Limit', name: 'callbackGasLimit', type: 'number', default: 100000, displayOptions: { show: { resource: ['vrf'], operation: ['calculateRequestPrice'] } } },
      { displayName: 'Callback Gas Limit', name: 'callbackGasLimit', type: 'number', default: 300000, displayOptions: { show: { resource: ['functions'], operation: ['estimateRequestCost'] } } },
      { displayName: 'Number of Words', name: 'numWords', type: 'number', default: 1, displayOptions: { show: { resource: ['vrf'], operation: ['calculateRequestPrice'] } } },
      { displayName: 'Request ID', name: 'requestId', type: 'string', default: '', displayOptions: { show: { resource: ['vrf'], operation: ['checkRequestStatus', 'decodeVRFRequest'] } } },
      // Automation Parameters
      { displayName: 'Upkeep ID', name: 'upkeepId', type: 'string', default: '', displayOptions: { show: { resource: ['automation'], operation: ['getUpkeepDetails', 'checkUpkeepStatus', 'getUpkeepBalance', 'getMinimumBalance', 'simulateUpkeep', 'getUpkeepHistory'] } } },
      { displayName: 'Simulate From Address', name: 'simulateFrom', type: 'string', default: '0x0000000000000000000000000000000000000000', displayOptions: { show: { resource: ['automation'], operation: ['simulateUpkeep'] } } },
      { displayName: 'Lookback Blocks', name: 'lookbackBlocks', type: 'number', default: 10000, displayOptions: { show: { resource: ['automation'], operation: ['getUpkeepHistory'] } } },
      // CCIP Parameters
      { displayName: 'Destination Network', name: 'destinationNetwork', type: 'options', options: [{ name: 'Ethereum Mainnet', value: 'ethereum-mainnet' }, { name: 'Polygon Mainnet', value: 'polygon-mainnet' }, { name: 'Arbitrum One', value: 'arbitrum-mainnet' }, { name: 'Optimism Mainnet', value: 'optimism-mainnet' }, { name: 'Base Mainnet', value: 'base-mainnet' }], default: 'ethereum-mainnet', displayOptions: { show: { resource: ['ccip'], operation: ['checkLaneSupport', 'calculateMessageFee', 'getTokenTransferLimits'] } } },
      { displayName: 'Receiver Address', name: 'receiverAddress', type: 'string', default: '', displayOptions: { show: { resource: ['ccip'], operation: ['calculateMessageFee'] } } },
      { displayName: 'Message Data', name: 'messageData', type: 'string', default: '0x', displayOptions: { show: { resource: ['ccip'], operation: ['calculateMessageFee'] } } },
      { displayName: 'Gas Limit', name: 'gasLimit', type: 'number', default: 200000, displayOptions: { show: { resource: ['ccip'], operation: ['calculateMessageFee'] } } },
      { displayName: 'Message ID', name: 'messageId', type: 'string', default: '', displayOptions: { show: { resource: ['ccip'], operation: ['trackCrossChainMessage'] } } },
      { displayName: 'Source Transaction Hash', name: 'sourceTxHash', type: 'string', default: '', displayOptions: { show: { resource: ['ccip'], operation: ['trackCrossChainMessage'] } } },
      // Functions Parameters
      { displayName: 'Response Hex', name: 'responseHex', type: 'string', default: '', displayOptions: { show: { resource: ['functions'], operation: ['decodeResponse'] } } },
      { displayName: 'Response Type', name: 'responseType', type: 'options', options: [{ name: 'String', value: 'string' }, { name: 'Uint256', value: 'uint256' }, { name: 'Int256', value: 'int256' }, { name: 'Bytes32', value: 'bytes32' }, { name: 'JSON', value: 'json' }], default: 'string', displayOptions: { show: { resource: ['functions'], operation: ['decodeResponse'] } } },
      { displayName: 'Source Code', name: 'sourceCode', type: 'string', typeOptions: { rows: 10 }, default: '', displayOptions: { show: { resource: ['functions'], operation: ['validateSourceCode'] } } },
      // LINK Token Parameters
      { displayName: 'Address to Check', name: 'addressToCheck', type: 'string', default: '', displayOptions: { show: { resource: ['linkToken'], operation: ['getLinkBalance'] } } },
      { displayName: 'To Address', name: 'toAddress', type: 'string', default: '', displayOptions: { show: { resource: ['linkToken'], operation: ['transferLink'] } } },
      { displayName: 'Amount', name: 'amount', type: 'string', default: '0', displayOptions: { show: { resource: ['linkToken'], operation: ['transferLink'] } } },
      { displayName: 'Owner Address', name: 'ownerAddress', type: 'string', default: '', displayOptions: { show: { resource: ['linkToken'], operation: ['checkLinkAllowance'] } } },
      { displayName: 'Spender Address', name: 'spenderAddress', type: 'string', default: '', displayOptions: { show: { resource: ['linkToken'], operation: ['checkLinkAllowance'] } } },
      // Network Utils Parameters
      { displayName: 'Address to Validate', name: 'addressToValidate', type: 'string', default: '', displayOptions: { show: { resource: ['networkUtils'], operation: ['validateAddress'] } } },
      { displayName: 'Contract Address', name: 'contractAddress', type: 'string', default: '', displayOptions: { show: { resource: ['networkUtils'], operation: ['checkContractExists'] } } },
      { displayName: 'Value', name: 'value', type: 'string', default: '1', displayOptions: { show: { resource: ['networkUtils'], operation: ['convertUnits'] } } },
      { displayName: 'From Unit', name: 'fromUnit', type: 'options', options: [{ name: 'Wei', value: 'wei' }, { name: 'Gwei', value: 'gwei' }, { name: 'Ether', value: 'ether' }], default: 'ether', displayOptions: { show: { resource: ['networkUtils'], operation: ['convertUnits'] } } },
      { displayName: 'To Unit', name: 'toUnit', type: 'options', options: [{ name: 'Wei', value: 'wei' }, { name: 'Gwei', value: 'gwei' }, { name: 'Ether', value: 'ether' }], default: 'wei', displayOptions: { show: { resource: ['networkUtils'], operation: ['convertUnits'] } } },
      { displayName: 'Block Identifier', name: 'blockIdentifier', type: 'string', default: 'latest', displayOptions: { show: { resource: ['networkUtils'], operation: ['getBlockInfo'] } } },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[] = [];
        switch (resource) {
          case 'priceFeed':
            result = await executePriceFeed(this, operation, i);
            break;
          case 'dataFeed':
            result = await executeDataFeed(this, operation, i);
            break;
          case 'vrf':
            result = await executeVRF(this, operation, i);
            break;
          case 'automation':
            result = await executeAutomation(this, operation, i);
            break;
          case 'ccip':
            result = await executeCCIP(this, operation, i);
            break;
          case 'functions':
            result = await executeFunctions(this, operation, i);
            break;
          case 'linkToken':
            result = await executeLinkToken(this, operation, i);
            break;
          case 'networkUtils':
            result = await executeNetworkUtils(this, operation, i);
            break;
          default:
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }
        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error instanceof Error ? error.message : 'Unknown error' }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }
    return [returnData];
  }
}

async function executePriceFeed(ctx: IExecuteFunctions, op: string, i: number): Promise<INodeExecutionData[]> {
  switch (op) {
    case 'getLatestPrice': return priceFeed.getLatestPrice.call(ctx, i);
    case 'getPriceFeedData': return priceFeed.getPriceFeedData.call(ctx, i);
    case 'getHistoricalPrice': return priceFeed.getHistoricalPrice.call(ctx, i);
    case 'getFeedDescription': return priceFeed.getFeedDescription.call(ctx, i);
    case 'getMultiplePrices': return priceFeed.getMultiplePrices.call(ctx, i);
    case 'listAvailableFeeds': return priceFeed.listAvailableFeeds.call(ctx, i);
    case 'getDerivedPrice': return priceFeed.getDerivedPrice.call(ctx, i);
    case 'getFeedRegistryPrice': return priceFeed.getFeedRegistryPrice.call(ctx, i);
    default: throw new Error(`Unknown operation: ${op}`);
  }
}

async function executeDataFeed(ctx: IExecuteFunctions, op: string, i: number): Promise<INodeExecutionData[]> {
  switch (op) {
    case 'getProofOfReserve': return dataFeed.getProofOfReserve.call(ctx, i);
    case 'getNFTFloorPrice': return dataFeed.getNFTFloorPrice.call(ctx, i);
    case 'getL2SequencerStatus': return dataFeed.getL2SequencerStatus.call(ctx, i);
    case 'listPorFeeds': return dataFeed.listPorFeeds.call(ctx, i);
    case 'listNftFloorFeeds': return dataFeed.listNftFloorFeeds.call(ctx, i);
    case 'listSequencerFeeds': return dataFeed.listSequencerFeeds.call(ctx, i);
    default: throw new Error(`Unknown operation: ${op}`);
  }
}

async function executeVRF(ctx: IExecuteFunctions, op: string, i: number): Promise<INodeExecutionData[]> {
  switch (op) {
    case 'getSubscriptionDetails': return vrf.getSubscriptionDetails.call(ctx, i);
    case 'getVRFCoordinatorInfo': return vrf.getVRFCoordinatorInfo.call(ctx, i);
    case 'listSubscriptionConsumers': return vrf.listSubscriptionConsumers.call(ctx, i);
    case 'calculateRequestPrice': return vrf.calculateRequestPrice.call(ctx, i);
    case 'checkRequestStatus': return vrf.checkRequestStatus.call(ctx, i);
    case 'decodeVRFRequest': return vrf.decodeVRFRequest.call(ctx, i);
    case 'getVRFNetworks': return vrf.getVRFNetworks.call(ctx, i);
    default: throw new Error(`Unknown operation: ${op}`);
  }
}

async function executeAutomation(ctx: IExecuteFunctions, op: string, i: number): Promise<INodeExecutionData[]> {
  switch (op) {
    case 'getUpkeepDetails': return automation.getUpkeepDetails.call(ctx, i);
    case 'checkUpkeepStatus': return automation.checkUpkeepStatus.call(ctx, i);
    case 'getUpkeepBalance': return automation.getUpkeepBalance.call(ctx, i);
    case 'getMinimumBalance': return automation.getMinimumBalance.call(ctx, i);
    case 'simulateUpkeep': return automation.simulateUpkeep.call(ctx, i);
    case 'getRegistryState': return automation.getRegistryState.call(ctx, i);
    case 'getUpkeepHistory': return automation.getUpkeepHistory.call(ctx, i);
    case 'listAutomationNetworks': return automation.listAutomationNetworks.call(ctx, i);
    default: throw new Error(`Unknown operation: ${op}`);
  }
}

async function executeCCIP(ctx: IExecuteFunctions, op: string, i: number): Promise<INodeExecutionData[]> {
  switch (op) {
    case 'getSupportedLanes': return ccip.getSupportedLanes.call(ctx, i);
    case 'checkLaneSupport': return ccip.checkLaneSupport.call(ctx, i);
    case 'calculateMessageFee': return ccip.calculateMessageFee.call(ctx, i);
    case 'getRouterConfiguration': return ccip.getRouterConfiguration.call(ctx, i);
    case 'trackCrossChainMessage': return ccip.trackCrossChainMessage.call(ctx, i);
    case 'listChainSelectors': return ccip.listChainSelectors.call(ctx, i);
    case 'getTokenTransferLimits': return ccip.getTokenTransferLimits.call(ctx, i);
    default: throw new Error(`Unknown operation: ${op}`);
  }
}

async function executeFunctions(ctx: IExecuteFunctions, op: string, i: number): Promise<INodeExecutionData[]> {
  switch (op) {
    case 'getSubscriptionInfo': return functions.getSubscriptionInfo.call(ctx, i);
    case 'getDONConfiguration': return functions.getDONConfiguration.call(ctx, i);
    case 'estimateRequestCost': return functions.estimateRequestCost.call(ctx, i);
    case 'decodeResponse': return functions.decodeResponse.call(ctx, i);
    case 'getSupportedNetworks': return functions.getSupportedNetworks.call(ctx, i);
    case 'validateSourceCode': return functions.validateSourceCode.call(ctx, i);
    default: throw new Error(`Unknown operation: ${op}`);
  }
}

async function executeLinkToken(ctx: IExecuteFunctions, op: string, i: number): Promise<INodeExecutionData[]> {
  switch (op) {
    case 'getLinkBalance': return linkToken.getLinkBalance.call(ctx, i);
    case 'getLinkPrice': return linkToken.getLinkPrice.call(ctx, i);
    case 'transferLink': return linkToken.transferLink.call(ctx, i);
    case 'getLinkTokenAddress': return linkToken.getLinkTokenAddress.call(ctx, i);
    case 'checkLinkAllowance': return linkToken.checkLinkAllowance.call(ctx, i);
    case 'getLinkTotalSupply': return linkToken.getLinkTotalSupply.call(ctx, i);
    case 'getAllLinkAddresses': return linkToken.getAllLinkAddresses.call(ctx, i);
    default: throw new Error(`Unknown operation: ${op}`);
  }
}

async function executeNetworkUtils(ctx: IExecuteFunctions, op: string, i: number): Promise<INodeExecutionData[]> {
  switch (op) {
    case 'getGasPrice': return networkUtils.getGasPrice.call(ctx, i);
    case 'getEthPrice': return networkUtils.getEthPrice.call(ctx, i);
    case 'getNetworkStatus': return networkUtils.getNetworkStatus.call(ctx, i);
    case 'validateAddress': return networkUtils.validateAddress.call(ctx, i);
    case 'listSupportedNetworks': return networkUtils.listSupportedNetworks.call(ctx, i);
    case 'checkContractExists': return networkUtils.checkContractExists.call(ctx, i);
    case 'convertUnits': return networkUtils.convertUnits.call(ctx, i);
    case 'getBlockInfo': return networkUtils.getBlockInfo.call(ctx, i);
    default: throw new Error(`Unknown operation: ${op}`);
  }
}
