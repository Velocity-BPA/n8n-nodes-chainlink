/**
 * Chainlink Trigger Node for n8n
 * Event monitoring via polling for Chainlink services
 */

import {
  IPollFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  IDataObject,
} from 'n8n-workflow';

import { formatUnits } from 'ethers';
import {
  getPriceFeedContract,
  getVRFCoordinatorContract,
  getAutomationRegistryContract,
  getProvider,
  formatPrice,
  timestampToISO,
  ChainlinkCredentials,
} from './transport/provider';
import { getPriceFeed } from './constants/addresses';
import { getNetworkConfig } from './constants/networks';

export class ChainlinkTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chainlink Trigger',
    name: 'chainlinkTrigger',
    icon: 'file:chainlink.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Monitor Chainlink events - price updates, VRF fulfillment, automation executions',
    defaults: {
      name: 'Chainlink Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'chainlinkRpcApi',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          { name: 'Price Update', value: 'priceUpdate', description: 'Trigger when price changes by threshold' },
          { name: 'Price Threshold Alert', value: 'priceThreshold', description: 'Trigger when price crosses threshold' },
          { name: 'New Round Started', value: 'newRound', description: 'Trigger on new price feed round' },
          { name: 'VRF Request Fulfilled', value: 'vrfFulfilled', description: 'Trigger when VRF request is fulfilled' },
          { name: 'Upkeep Performed', value: 'upkeepPerformed', description: 'Trigger when automation runs' },
          { name: 'L2 Sequencer Status Change', value: 'sequencerChange', description: 'Trigger on L2 sequencer status change' },
        ],
        default: 'priceUpdate',
        required: true,
      },
      { displayName: 'Feed Source', name: 'feedSource', type: 'options', options: [{ name: 'Preset Feed', value: 'preset' }, { name: 'Custom Address', value: 'custom' }], default: 'preset', displayOptions: { show: { event: ['priceUpdate', 'priceThreshold', 'newRound'] } } },
      { displayName: 'Price Pair', name: 'pricePair', type: 'options', options: [{ name: 'ETH/USD', value: 'ETH/USD' }, { name: 'BTC/USD', value: 'BTC/USD' }, { name: 'LINK/USD', value: 'LINK/USD' }, { name: 'USDC/USD', value: 'USDC/USD' }, { name: 'MATIC/USD', value: 'MATIC/USD' }], default: 'ETH/USD', displayOptions: { show: { event: ['priceUpdate', 'priceThreshold', 'newRound'], feedSource: ['preset'] } } },
      { displayName: 'Feed Address', name: 'feedAddress', type: 'string', default: '', placeholder: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', displayOptions: { show: { event: ['priceUpdate', 'priceThreshold', 'newRound'], feedSource: ['custom'] } } },
      { displayName: 'Change Threshold (%)', name: 'changeThreshold', type: 'number', default: 1, description: 'Minimum percentage change to trigger', displayOptions: { show: { event: ['priceUpdate'] } } },
      { displayName: 'Threshold Type', name: 'thresholdType', type: 'options', options: [{ name: 'Above', value: 'above' }, { name: 'Below', value: 'below' }, { name: 'Cross (Either Direction)', value: 'cross' }], default: 'above', displayOptions: { show: { event: ['priceThreshold'] } } },
      { displayName: 'Threshold Price', name: 'thresholdPrice', type: 'number', default: 0, displayOptions: { show: { event: ['priceThreshold'] } } },
      { displayName: 'Subscription ID', name: 'subscriptionId', type: 'number', default: 0, displayOptions: { show: { event: ['vrfFulfilled'] } } },
      { displayName: 'Lookback Blocks', name: 'vrfLookbackBlocks', type: 'number', default: 1000, displayOptions: { show: { event: ['vrfFulfilled'] } } },
      { displayName: 'Upkeep ID', name: 'upkeepId', type: 'string', default: '', displayOptions: { show: { event: ['upkeepPerformed'] } } },
      { displayName: 'Lookback Blocks', name: 'automationLookbackBlocks', type: 'number', default: 1000, displayOptions: { show: { event: ['upkeepPerformed'] } } },
      { displayName: 'Sequencer Feed Address', name: 'sequencerFeedAddress', type: 'string', default: '', displayOptions: { show: { event: ['sequencerChange'] } } },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const event = this.getNodeParameter('event') as string;
    const webhookData = this.getWorkflowStaticData('node');
    
    try {
      const credentials = await getCredentialsForTrigger(this);
      
      switch (event) {
        case 'priceUpdate':
          return await pollPriceUpdate(this, credentials, webhookData);
        case 'priceThreshold':
          return await pollPriceThreshold(this, credentials, webhookData);
        case 'newRound':
          return await pollNewRound(this, credentials, webhookData);
        case 'vrfFulfilled':
          return await pollVRFFulfilled(this, credentials, webhookData);
        case 'upkeepPerformed':
          return await pollUpkeepPerformed(this, credentials, webhookData);
        case 'sequencerChange':
          return await pollSequencerChange(this, credentials, webhookData);
        default:
          throw new NodeOperationError(this.getNode(), `Unknown event: ${event}`);
      }
    } catch (error) {
      throw new NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

async function getCredentialsForTrigger(context: IPollFunctions): Promise<ChainlinkCredentials> {
  const credentials = await context.getCredentials('chainlinkRpcApi') as IDataObject;
  const networkKey = credentials.network as string;
  const networkConfig = getNetworkConfig(networkKey);
  
  if (networkKey === 'custom') {
    return {
      network: 'custom',
      rpcUrl: credentials.rpcUrl as string,
      privateKey: credentials.privateKey as string | undefined,
      chainId: parseInt(credentials.chainId as string, 10),
    };
  }
  
  return {
    network: networkKey,
    rpcUrl: (credentials.rpcUrl as string) || networkConfig?.rpcUrl || '',
    privateKey: credentials.privateKey as string | undefined,
    chainId: networkConfig?.chainId || 1,
  };
}

function getFeedAddressForTrigger(context: IPollFunctions, credentials: ChainlinkCredentials): string {
  const feedSource = context.getNodeParameter('feedSource') as string;
  
  if (feedSource === 'preset') {
    const pricePair = context.getNodeParameter('pricePair') as string;
    const feedInfo = getPriceFeed(credentials.network, pricePair);
    if (!feedInfo) {
      throw new Error(`Price feed ${pricePair} not available on ${credentials.network}`);
    }
    return feedInfo.address;
  }
  
  return context.getNodeParameter('feedAddress') as string;
}

async function pollPriceUpdate(context: IPollFunctions, credentials: ChainlinkCredentials, webhookData: IDataObject): Promise<INodeExecutionData[][] | null> {
  const feedAddress = getFeedAddressForTrigger(context, credentials);
  const changeThreshold = context.getNodeParameter('changeThreshold') as number;
  
  const contract = getPriceFeedContract(feedAddress, credentials);
  const [roundId, answer, , updatedAt] = await contract.latestRoundData();
  const decimals = await contract.decimals();
  const description = await contract.description();
  
  const currentPrice = parseFloat(formatPrice(answer, Number(decimals)));
  const lastPrice = webhookData.lastPrice as number | undefined;
  const lastRoundId = webhookData.lastRoundId as string | undefined;
  
  webhookData.lastPrice = currentPrice;
  webhookData.lastRoundId = roundId.toString();
  
  if (lastPrice === undefined || lastRoundId === roundId.toString()) {
    return null;
  }
  
  const changePercent = Math.abs((currentPrice - lastPrice) / lastPrice) * 100;
  
  if (changePercent >= changeThreshold) {
    return [[{
      json: {
        event: 'priceUpdate',
        pair: description,
        currentPrice: currentPrice.toString(),
        previousPrice: lastPrice.toString(),
        changePercent: changePercent.toFixed(4),
        changeDirection: currentPrice > lastPrice ? 'up' : 'down',
        roundId: roundId.toString(),
        updatedAt: timestampToISO(updatedAt),
        feedAddress,
        network: credentials.network,
        timestamp: new Date().toISOString(),
      },
    }]];
  }
  
  return null;
}

async function pollPriceThreshold(context: IPollFunctions, credentials: ChainlinkCredentials, webhookData: IDataObject): Promise<INodeExecutionData[][] | null> {
  const feedAddress = getFeedAddressForTrigger(context, credentials);
  const thresholdType = context.getNodeParameter('thresholdType') as string;
  const thresholdPrice = context.getNodeParameter('thresholdPrice') as number;
  
  const contract = getPriceFeedContract(feedAddress, credentials);
  const [roundId, answer, , updatedAt] = await contract.latestRoundData();
  const decimals = await contract.decimals();
  const description = await contract.description();
  
  const currentPrice = parseFloat(formatPrice(answer, Number(decimals)));
  const lastPrice = webhookData.lastPrice as number | undefined;
  const wasTriggered = webhookData.wasTriggered as boolean | undefined;
  
  webhookData.lastPrice = currentPrice;
  
  let triggered = false;
  let triggerReason = '';
  
  if (thresholdType === 'above') {
    if (currentPrice > thresholdPrice && !wasTriggered) {
      triggered = true;
      triggerReason = `Price ${currentPrice} is above threshold ${thresholdPrice}`;
    }
    webhookData.wasTriggered = currentPrice > thresholdPrice;
  } else if (thresholdType === 'below') {
    if (currentPrice < thresholdPrice && !wasTriggered) {
      triggered = true;
      triggerReason = `Price ${currentPrice} is below threshold ${thresholdPrice}`;
    }
    webhookData.wasTriggered = currentPrice < thresholdPrice;
  } else if (thresholdType === 'cross' && lastPrice !== undefined) {
    const crossedUp = lastPrice <= thresholdPrice && currentPrice > thresholdPrice;
    const crossedDown = lastPrice >= thresholdPrice && currentPrice < thresholdPrice;
    if (crossedUp || crossedDown) {
      triggered = true;
      triggerReason = crossedUp ? `Price crossed above ${thresholdPrice}` : `Price crossed below ${thresholdPrice}`;
    }
  }
  
  if (triggered) {
    return [[{
      json: {
        event: 'priceThreshold',
        pair: description,
        currentPrice: currentPrice.toString(),
        thresholdPrice: thresholdPrice.toString(),
        thresholdType,
        triggerReason,
        roundId: roundId.toString(),
        updatedAt: timestampToISO(updatedAt),
        feedAddress,
        network: credentials.network,
        timestamp: new Date().toISOString(),
      },
    }]];
  }
  
  return null;
}

async function pollNewRound(context: IPollFunctions, credentials: ChainlinkCredentials, webhookData: IDataObject): Promise<INodeExecutionData[][] | null> {
  const feedAddress = getFeedAddressForTrigger(context, credentials);
  
  const contract = getPriceFeedContract(feedAddress, credentials);
  const [roundId, answer, startedAt, updatedAt] = await contract.latestRoundData();
  const decimals = await contract.decimals();
  const description = await contract.description();
  
  const currentRoundId = roundId.toString();
  const lastRoundId = webhookData.lastRoundId as string | undefined;
  
  webhookData.lastRoundId = currentRoundId;
  
  if (lastRoundId === undefined || currentRoundId === lastRoundId) {
    return null;
  }
  
  return [[{
    json: {
      event: 'newRound',
      pair: description,
      price: formatPrice(answer, Number(decimals)),
      roundId: currentRoundId,
      previousRoundId: lastRoundId,
      startedAt: timestampToISO(startedAt),
      updatedAt: timestampToISO(updatedAt),
      feedAddress,
      network: credentials.network,
      timestamp: new Date().toISOString(),
    },
  }]];
}

async function pollVRFFulfilled(context: IPollFunctions, credentials: ChainlinkCredentials, webhookData: IDataObject): Promise<INodeExecutionData[][] | null> {
  const lookbackBlocks = context.getNodeParameter('vrfLookbackBlocks') as number;
  
  const coordinator = getVRFCoordinatorContract(credentials);
  if (!coordinator) {
    throw new Error(`VRF not available on ${credentials.network}`);
  }
  
  const provider = getProvider(credentials);
  const currentBlock = await provider.getBlockNumber();
  const lastProcessedBlock = (webhookData.lastBlock as number) || (currentBlock - lookbackBlocks);
  
  webhookData.lastBlock = currentBlock;
  
  const filter = coordinator.filters.RandomWordsFulfilled();
  const events = await coordinator.queryFilter(filter, lastProcessedBlock + 1, currentBlock);
  
  if (events.length === 0) {
    return null;
  }
  
  const results: INodeExecutionData[] = [];
  
  for (const event of events) {
    const eventData = event as unknown as { args?: { requestId?: bigint; randomWords?: bigint[] } };
    const block = await event.getBlock();
    
    results.push({
      json: {
        event: 'vrfFulfilled',
        requestId: eventData.args?.requestId?.toString(),
        randomWords: eventData.args?.randomWords?.map((w: bigint) => w.toString()),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block ? new Date(block.timestamp * 1000).toISOString() : null,
        network: credentials.network,
      },
    });
  }
  
  return results.length > 0 ? [results] : null;
}

async function pollUpkeepPerformed(context: IPollFunctions, credentials: ChainlinkCredentials, webhookData: IDataObject): Promise<INodeExecutionData[][] | null> {
  const upkeepId = context.getNodeParameter('upkeepId') as string;
  const lookbackBlocks = context.getNodeParameter('automationLookbackBlocks') as number;
  
  const registry = getAutomationRegistryContract(credentials);
  if (!registry) {
    throw new Error(`Automation not available on ${credentials.network}`);
  }
  
  const provider = getProvider(credentials);
  const currentBlock = await provider.getBlockNumber();
  const lastProcessedBlock = (webhookData.lastBlock as number) || (currentBlock - lookbackBlocks);
  
  webhookData.lastBlock = currentBlock;
  
  const filter = registry.filters.UpkeepPerformed(BigInt(upkeepId));
  const events = await registry.queryFilter(filter, lastProcessedBlock + 1, currentBlock);
  
  if (events.length === 0) {
    return null;
  }
  
  const results: INodeExecutionData[] = [];
  
  for (const event of events) {
    const eventData = event as unknown as { args?: { id?: bigint; success?: boolean; totalPayment?: bigint; gasUsed?: bigint } };
    const block = await event.getBlock();
    
    results.push({
      json: {
        event: 'upkeepPerformed',
        upkeepId,
        success: eventData.args?.success,
        totalPayment: eventData.args?.totalPayment ? formatUnits(eventData.args.totalPayment, 18) : null,
        gasUsed: eventData.args?.gasUsed?.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block ? new Date(block.timestamp * 1000).toISOString() : null,
        network: credentials.network,
      },
    });
  }
  
  return results.length > 0 ? [results] : null;
}

async function pollSequencerChange(context: IPollFunctions, credentials: ChainlinkCredentials, webhookData: IDataObject): Promise<INodeExecutionData[][] | null> {
  const SEQUENCER_FEEDS: Record<string, string> = {
    'arbitrum-mainnet': '0xFdB631F5EE196F0ed6FAa767959853A9F217697D',
    'optimism-mainnet': '0x371EAD81c9102C9BF4874A9075FFFf170F2Ee389',
    'base-mainnet': '0xBCF85224fc0756B9Fa45aA7892530B47e10b6433',
  };
  
  let feedAddress = context.getNodeParameter('sequencerFeedAddress', '') as string;
  if (!feedAddress) {
    feedAddress = SEQUENCER_FEEDS[credentials.network];
    if (!feedAddress) {
      throw new Error(`L2 sequencer feed not available on ${credentials.network}`);
    }
  }
  
  const contract = getPriceFeedContract(feedAddress, credentials);
  const [, answer, startedAt] = await contract.latestRoundData();
  
  const isUp = answer === BigInt(0);
  const lastStatus = webhookData.lastStatus as boolean | undefined;
  
  webhookData.lastStatus = isUp;
  
  if (lastStatus === undefined || isUp === lastStatus) {
    return null;
  }
  
  return [[{
    json: {
      event: 'sequencerChange',
      isSequencerUp: isUp,
      previousStatus: lastStatus ? 'UP' : 'DOWN',
      currentStatus: isUp ? 'UP' : 'DOWN',
      statusCode: Number(answer),
      stateStartedAt: timestampToISO(startedAt),
      feedAddress,
      network: credentials.network,
      timestamp: new Date().toISOString(),
      alert: isUp ? 'Sequencer is back online. Grace period may be in effect.' : 'CRITICAL: Sequencer is down. Price feeds may be stale.',
    },
  }]];
}
