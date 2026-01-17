/**
 * VRF Resource Actions
 * Operations for Chainlink VRF (Verifiable Random Function)
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { formatUnits } from 'ethers';
import {
  getChainlinkCredentials,
  getVRFCoordinatorContract,
  getProvider,
  handleChainlinkError,
  getNetworkFromCredentials
} from '../transport/provider';

/**
 * VRF Key Hashes by network (for gas estimation)
 */
const VRF_KEY_HASHES: Record<string, { keyHash: string; gasLane: string }[]> = {
  'ethereum-mainnet': [
    { keyHash: '0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef', gasLane: '200 gwei' },
    { keyHash: '0xff8dedfbfa60af186cf3c830acbc32c05aae823045ae5ea7da1e45fbfaba4f92', gasLane: '500 gwei' },
    { keyHash: '0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805', gasLane: '1000 gwei' }
  ],
  'ethereum-sepolia': [
    { keyHash: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c', gasLane: '150 gwei' }
  ],
  'polygon-mainnet': [
    { keyHash: '0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd', gasLane: '200 gwei' },
    { keyHash: '0xd729dc84e21ae57ffb6be0053bf2b0668aa2aaf300a2a7b2ddf7dc0bb6e875a8', gasLane: '500 gwei' },
    { keyHash: '0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93', gasLane: '1000 gwei' }
  ],
  'arbitrum-mainnet': [
    { keyHash: '0x72d2b016bb5b62912afea355ebf33b91319f828738b111b723b78696b9847b63', gasLane: '2 gwei' },
    { keyHash: '0x68d24f9a037a649944f1460893fbc57b987b3736c1ca749726a8ddc4f7e5b320', gasLane: '30 gwei' }
  ]
};

/**
 * Get VRF subscription details
 */
export async function getSubscriptionDetails(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const coordinator = getVRFCoordinatorContract(credentials);
    if (!coordinator) {
      throw new Error(`VRF Coordinator not available on ${credentials.network}`);
    }
    
    const subscriptionId = this.getNodeParameter('subscriptionId', index) as number;
    
    const [balance, reqCount, owner, consumers] = await coordinator.getSubscription(subscriptionId);
    
    // Format balance from wei to LINK (18 decimals)
    const balanceFormatted = formatUnits(balance, 18);
    
    return [{
      json: {
        subscriptionId,
        balance: balanceFormatted,
        balanceRaw: balance.toString(),
        requestCount: Number(reqCount),
        owner,
        consumers: consumers.map((c: string) => c),
        consumerCount: consumers.length,
        network: credentials.network,
        coordinatorAddress: await coordinator.getAddress(),
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get VRF Coordinator configuration
 */
export async function getVRFCoordinatorInfo(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const coordinator = getVRFCoordinatorContract(credentials);
    if (!coordinator) {
      throw new Error(`VRF Coordinator not available on ${credentials.network}`);
    }
    
    const [minimumRequestConfirmations, maxGasLimit, stalenessSeconds, gasAfterPaymentCalculation] = 
      await coordinator.getConfig();
    
    const network = getNetworkFromCredentials(credentials);
    const keyHashes = VRF_KEY_HASHES[credentials.network] || [];
    
    return [{
      json: {
        coordinatorAddress: await coordinator.getAddress(),
        minimumRequestConfirmations: Number(minimumRequestConfirmations),
        maxGasLimit: Number(maxGasLimit),
        stalenessSeconds: Number(stalenessSeconds),
        gasAfterPaymentCalculation: Number(gasAfterPaymentCalculation),
        availableKeyHashes: keyHashes.map(kh => ({
          keyHash: kh.keyHash,
          gasLane: kh.gasLane
        })),
        network: credentials.network,
        linkToken: network?.linkToken || 'Unknown',
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * List subscription consumers
 */
export async function listSubscriptionConsumers(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const coordinator = getVRFCoordinatorContract(credentials);
    if (!coordinator) {
      throw new Error(`VRF Coordinator not available on ${credentials.network}`);
    }
    
    const subscriptionId = this.getNodeParameter('subscriptionId', index) as number;
    
    const [, , owner, consumers] = await coordinator.getSubscription(subscriptionId);
    
    return [{
      json: {
        subscriptionId,
        owner,
        consumers: consumers.map((consumer: string, idx: number) => ({
          index: idx,
          address: consumer
        })),
        totalConsumers: consumers.length,
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Calculate estimated VRF request price
 */
export async function calculateRequestPrice(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const coordinator = getVRFCoordinatorContract(credentials);
    if (!coordinator) {
      throw new Error(`VRF Coordinator not available on ${credentials.network}`);
    }
    
    const callbackGasLimit = this.getNodeParameter('callbackGasLimit', index, 100000) as number;
    const numWords = this.getNodeParameter('numWords', index, 1) as number;
    
    // Get current gas price for estimation
    const provider = getProvider(credentials);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    
    // Try to estimate request price if the function exists
    let estimatedCost: string;
    try {
      const estimate = await coordinator.estimateRequestPrice(callbackGasLimit, numWords);
      estimatedCost = formatUnits(estimate, 18);
    } catch {
      // If estimate function not available, provide rough calculation
      const baseGas = BigInt(100000); // Base overhead
      const perWordGas = BigInt(20000); // Gas per random word
      const totalGas = baseGas + BigInt(callbackGasLimit) + (perWordGas * BigInt(numWords));
      const costInWei = totalGas * gasPrice;
      estimatedCost = formatUnits(costInWei, 18) + ' (rough estimate)';
    }
    
    const keyHashes = VRF_KEY_HASHES[credentials.network] || [];
    
    return [{
      json: {
        callbackGasLimit,
        numWords,
        estimatedCostLINK: estimatedCost,
        currentGasPriceGwei: formatUnits(gasPrice, 'gwei'),
        recommendedKeyHashes: keyHashes,
        notes: [
          'Actual cost depends on gas price at fulfillment time',
          'Higher gas lane key hashes provide faster fulfillment but cost more',
          'Ensure subscription has sufficient LINK balance before requesting'
        ],
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Check VRF request status by searching logs
 */
export async function checkRequestStatus(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const coordinator = getVRFCoordinatorContract(credentials);
    if (!coordinator) {
      throw new Error(`VRF Coordinator not available on ${credentials.network}`);
    }
    
    const requestId = this.getNodeParameter('requestId', index) as string;
    const provider = getProvider(credentials);
    
    // Get the current block number
    const currentBlock = await provider.getBlockNumber();
    
    // Search for fulfillment event (look back up to 10000 blocks)
    const lookbackBlocks = 10000;
    const fromBlock = Math.max(0, currentBlock - lookbackBlocks);
    
    // Filter for RandomWordsFulfilled event with this request ID
    const fulfilledFilter = coordinator.filters.RandomWordsFulfilled(BigInt(requestId));
    const fulfilledEvents = await coordinator.queryFilter(fulfilledFilter, fromBlock, currentBlock);
    
    if (fulfilledEvents.length > 0) {
      const event = fulfilledEvents[0];
      const block = await event.getBlock();
      
      // Parse random words from event
      const eventData = event as any;
      const randomWords = eventData.args?.randomWords?.map((w: bigint) => w.toString()) || [];
      
      return [{
        json: {
          requestId,
          status: 'FULFILLED',
          fulfilled: true,
          fulfillmentBlock: event.blockNumber,
          fulfillmentTimestamp: block ? new Date(block.timestamp * 1000).toISOString() : 'Unknown',
          transactionHash: event.transactionHash,
          randomWords,
          randomWordsCount: randomWords.length,
          network: credentials.network,
          timestamp: new Date().toISOString()
        }
      }];
    }
    
    // Check if request exists by looking for the request event
    const requestedFilter = coordinator.filters.RandomWordsRequested();
    const requestedEvents = await coordinator.queryFilter(requestedFilter, fromBlock, currentBlock);
    
    const requestEvent = requestedEvents.find(e => {
      const eventData = e as any;
      return eventData.args?.requestId?.toString() === requestId;
    });
    
    if (requestEvent) {
      const eventData = requestEvent as any;
      const block = await requestEvent.getBlock();
      
      return [{
        json: {
          requestId,
          status: 'PENDING',
          fulfilled: false,
          requestBlock: requestEvent.blockNumber,
          requestTimestamp: block ? new Date(block.timestamp * 1000).toISOString() : 'Unknown',
          requestTransactionHash: requestEvent.transactionHash,
          subscriptionId: eventData.args?.subId?.toString(),
          callbackGasLimit: eventData.args?.callbackGasLimit?.toString(),
          numWords: eventData.args?.numWords?.toString(),
          sender: eventData.args?.sender,
          network: credentials.network,
          message: 'Request is pending fulfillment. VRF fulfillment typically takes 2-10 blocks.',
          timestamp: new Date().toISOString()
        }
      }];
    }
    
    return [{
      json: {
        requestId,
        status: 'NOT_FOUND',
        fulfilled: false,
        message: `Request ID ${requestId} not found in the last ${lookbackBlocks} blocks. The request may be older or may not exist.`,
        network: credentials.network,
        searchedBlockRange: {
          from: fromBlock,
          to: currentBlock
        },
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Decode VRF request data (helpful for debugging)
 */
export async function decodeVRFRequest(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const requestId = this.getNodeParameter('requestId', index) as string;
    
    // Parse request ID to extract information
    // VRF request IDs encode information about the request
    const requestIdBigInt = BigInt(requestId);
    
    return [{
      json: {
        requestId,
        requestIdHex: '0x' + requestIdBigInt.toString(16),
        requestIdDecimal: requestId,
        notes: [
          'VRF request IDs are generated deterministically from request parameters',
          'They include: keyHash, sender address, nonce, and block data',
          'Use checkRequestStatus to get detailed fulfillment information'
        ],
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get available VRF networks
 */
export async function getVRFNetworks(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const networks = Object.entries(VRF_KEY_HASHES).map(([network, keyHashes]) => ({
      network,
      keyHashCount: keyHashes.length,
      gasLanes: keyHashes.map(kh => kh.gasLane),
      keyHashes: keyHashes.map(kh => kh.keyHash)
    }));
    
    return [{
      json: {
        networks,
        totalNetworks: networks.length,
        description: 'VRF (Verifiable Random Function) provides cryptographically secure random numbers on-chain',
        useCases: [
          'Gaming and lotteries',
          'Random NFT trait assignment',
          'Fair selection processes',
          'Randomized airdrops'
        ],
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}
