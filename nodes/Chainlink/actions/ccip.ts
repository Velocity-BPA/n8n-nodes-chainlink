/**
 * CCIP Resource Actions
 * Operations for Chainlink Cross-Chain Interoperability Protocol
 */

import { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { formatUnits, AbiCoder } from 'ethers';
import {
  getChainlinkCredentials,
  getCCIPRouterContract,
  getProvider,
  handleChainlinkError,
  getNetworkFromCredentials
} from '../transport/provider';

/**
 * CCIP Chain Selectors (unique identifiers for each chain in CCIP)
 */
export const CCIP_CHAIN_SELECTORS: Record<string, { selector: string; name: string }> = {
  'ethereum-mainnet': { selector: '5009297550715157269', name: 'Ethereum Mainnet' },
  'ethereum-sepolia': { selector: '16015286601757825753', name: 'Ethereum Sepolia' },
  'polygon-mainnet': { selector: '4051577828743386545', name: 'Polygon Mainnet' },
  'polygon-amoy': { selector: '16281711391670634445', name: 'Polygon Amoy' },
  'arbitrum-mainnet': { selector: '4949039107694359620', name: 'Arbitrum One' },
  'arbitrum-sepolia': { selector: '3478487238524512106', name: 'Arbitrum Sepolia' },
  'optimism-mainnet': { selector: '3734403246176062136', name: 'Optimism Mainnet' },
  'optimism-sepolia': { selector: '5224473277236331295', name: 'Optimism Sepolia' },
  'avalanche-mainnet': { selector: '6433500567565415381', name: 'Avalanche C-Chain' },
  'avalanche-fuji': { selector: '14767482510784806043', name: 'Avalanche Fuji' },
  'bnb-mainnet': { selector: '11344663589394136015', name: 'BNB Chain Mainnet' },
  'bnb-testnet': { selector: '13264668187771770619', name: 'BNB Chain Testnet' },
  'base-mainnet': { selector: '15971525489660198786', name: 'Base Mainnet' },
  'base-sepolia': { selector: '10344971235874465080', name: 'Base Sepolia' }
};

/**
 * CCIP Supported Lanes (source -> destinations)
 */
const CCIP_LANES: Record<string, string[]> = {
  'ethereum-mainnet': ['polygon-mainnet', 'arbitrum-mainnet', 'optimism-mainnet', 'avalanche-mainnet', 'bnb-mainnet', 'base-mainnet'],
  'ethereum-sepolia': ['polygon-amoy', 'arbitrum-sepolia', 'optimism-sepolia', 'avalanche-fuji', 'bnb-testnet', 'base-sepolia'],
  'polygon-mainnet': ['ethereum-mainnet', 'arbitrum-mainnet', 'avalanche-mainnet'],
  'arbitrum-mainnet': ['ethereum-mainnet', 'polygon-mainnet', 'optimism-mainnet', 'base-mainnet'],
  'optimism-mainnet': ['ethereum-mainnet', 'arbitrum-mainnet', 'base-mainnet'],
  'avalanche-mainnet': ['ethereum-mainnet', 'polygon-mainnet'],
  'bnb-mainnet': ['ethereum-mainnet'],
  'base-mainnet': ['ethereum-mainnet', 'arbitrum-mainnet', 'optimism-mainnet']
};

/**
 * Get supported CCIP lanes from current network
 */
export async function getSupportedLanes(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const router = getCCIPRouterContract(credentials);
    if (!router) {
      throw new Error(`CCIP Router not available on ${credentials.network}`);
    }
    
    const sourceSelector = CCIP_CHAIN_SELECTORS[credentials.network];
    if (!sourceSelector) {
      throw new Error(`CCIP not configured for ${credentials.network}`);
    }
    
    // Get configured lanes from our mapping
    const configuredDestinations = CCIP_LANES[credentials.network] || [];
    
    // Verify each lane on-chain
    const lanes: IDataObject[] = [];
    
    for (const destNetwork of configuredDestinations) {
      const destSelector = CCIP_CHAIN_SELECTORS[destNetwork];
      if (!destSelector) continue;
      
      try {
        const isSupported = await router.isChainSupported(BigInt(destSelector.selector));
        
        if (isSupported) {
          lanes.push({
            destination: destNetwork,
            destinationName: destSelector.name,
            destinationSelector: destSelector.selector,
            isSupported: true
          });
        }
      } catch {
        // Lane not supported or error checking
      }
    }
    
    return [{
      json: {
        sourceNetwork: credentials.network,
        sourceName: sourceSelector.name,
        sourceSelector: sourceSelector.selector,
        supportedDestinations: lanes,
        totalLanes: lanes.length,
        routerAddress: await router.getAddress(),
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Check if a specific lane is supported
 */
export async function checkLaneSupport(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const router = getCCIPRouterContract(credentials);
    if (!router) {
      throw new Error(`CCIP Router not available on ${credentials.network}`);
    }
    
    const destinationNetwork = this.getNodeParameter('destinationNetwork', index) as string;
    const destSelector = CCIP_CHAIN_SELECTORS[destinationNetwork];
    
    if (!destSelector) {
      throw new Error(`Unknown destination network: ${destinationNetwork}`);
    }
    
    const isSupported = await router.isChainSupported(BigInt(destSelector.selector));
    
    // Get supported tokens if lane is supported
    let supportedTokens: string[] = [];
    if (isSupported) {
      try {
        supportedTokens = await router.getSupportedTokens(BigInt(destSelector.selector));
      } catch {
        // Some routers may not have this function
      }
    }
    
    return [{
      json: {
        sourceNetwork: credentials.network,
        destinationNetwork,
        destinationName: destSelector.name,
        destinationSelector: destSelector.selector,
        isSupported,
        supportedTokens,
        supportedTokenCount: supportedTokens.length,
        routerAddress: await router.getAddress(),
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Calculate CCIP message fee
 */
export async function calculateMessageFee(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const router = getCCIPRouterContract(credentials);
    if (!router) {
      throw new Error(`CCIP Router not available on ${credentials.network}`);
    }
    
    const destinationNetwork = this.getNodeParameter('destinationNetwork', index) as string;
    const receiver = this.getNodeParameter('receiverAddress', index) as string;
    const data = this.getNodeParameter('messageData', index, '0x') as string;
    const gasLimit = this.getNodeParameter('gasLimit', index, 200000) as number;
    
    const destSelector = CCIP_CHAIN_SELECTORS[destinationNetwork];
    if (!destSelector) {
      throw new Error(`Unknown destination network: ${destinationNetwork}`);
    }
    
    // Encode receiver address as bytes
    const abiCoder = new AbiCoder();
    const encodedReceiver = abiCoder.encode(['address'], [receiver]);
    
    // Build extra args for gas limit
    // EVMExtraArgsV1 tag (0x97a657c9) + encoded gas limit
    const extraArgs = abiCoder.encode(
      ['bytes4', 'uint256'],
      ['0x97a657c9', gasLimit]
    );
    
    // Build the message struct
    const message = {
      receiver: encodedReceiver,
      data: data || '0x',
      tokenAmounts: [], // No tokens in this fee estimation
      feeToken: '0x0000000000000000000000000000000000000000', // Pay in native
      extraArgs
    };
    
    const fee = await router.getFee(BigInt(destSelector.selector), message);
    
    return [{
      json: {
        sourceNetwork: credentials.network,
        destinationNetwork,
        destinationSelector: destSelector.selector,
        receiver,
        dataSize: data ? (data.length - 2) / 2 : 0, // bytes
        gasLimit,
        feeInNative: formatUnits(fee, 18),
        feeRaw: fee.toString(),
        feeToken: 'Native (ETH/MATIC/etc)',
        notes: [
          'Fee is for native token payment',
          'Actual fee may vary slightly at execution time',
          'Add buffer for price fluctuations'
        ],
        routerAddress: await router.getAddress(),
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get router configuration
 */
export async function getRouterConfiguration(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const router = getCCIPRouterContract(credentials);
    if (!router) {
      throw new Error(`CCIP Router not available on ${credentials.network}`);
    }
    
    const network = getNetworkFromCredentials(credentials);
    const chainSelector = CCIP_CHAIN_SELECTORS[credentials.network];
    
    // Get off-ramps (incoming lanes)
    let offRamps: IDataObject[] = [];
    try {
      const offRampData = await router.getOffRamps();
      offRamps = offRampData.map((ramp: { sourceChainSelector: bigint; offRamp: string }) => {
        // Find network name for this selector
        const sourceNetwork = Object.entries(CCIP_CHAIN_SELECTORS)
          .find(([, config]) => config.selector === ramp.sourceChainSelector.toString());
        
        return {
          sourceChainSelector: ramp.sourceChainSelector.toString(),
          sourceNetwork: sourceNetwork ? sourceNetwork[0] : 'Unknown',
          offRampAddress: ramp.offRamp
        };
      });
    } catch {
      // May not be available
    }
    
    return [{
      json: {
        network: credentials.network,
        networkName: chainSelector?.name || 'Unknown',
        chainSelector: chainSelector?.selector || 'Unknown',
        routerAddress: await router.getAddress(),
        linkToken: network?.linkToken || 'Unknown',
        incomingLanes: offRamps,
        incomingLaneCount: offRamps.length,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Track cross-chain message by ID
 */
export async function trackCrossChainMessage(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const messageId = this.getNodeParameter('messageId', index) as string;
    const sourceTxHash = this.getNodeParameter('sourceTxHash', index, '') as string;
    
    const provider = getProvider(credentials);
    
    // If we have source tx hash, get details from it
    let sourceDetails: IDataObject = {};
    if (sourceTxHash) {
      try {
        const receipt = await provider.getTransactionReceipt(sourceTxHash);
        if (receipt) {
          const block = await provider.getBlock(receipt.blockNumber);
          sourceDetails = {
            sourceTransactionHash: sourceTxHash,
            sourceBlockNumber: receipt.blockNumber,
            sourceTimestamp: block ? new Date(block.timestamp * 1000).toISOString() : 'Unknown',
            sourceStatus: receipt.status === 1 ? 'SUCCESS' : 'FAILED'
          };
        }
      } catch {
        // Could not fetch tx details
      }
    }
    
    // CCIP messages can be tracked via the CCIP Explorer
    // We provide the tracking info
    const explorerUrl = `https://ccip.chain.link/msg/${messageId}`;
    
    return [{
      json: {
        messageId,
        ...sourceDetails,
        trackingUrl: explorerUrl,
        network: credentials.network,
        notes: [
          'Use the CCIP Explorer URL to track full message journey',
          'Cross-chain finality typically takes 15-30 minutes',
          'Message status: PENDING -> SOURCE_FINALIZED -> DESTINATION_EXECUTING -> SUCCESS'
        ],
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * List all CCIP chain selectors
 */
export async function listChainSelectors(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const selectors = Object.entries(CCIP_CHAIN_SELECTORS).map(([network, config]) => ({
      network,
      name: config.name,
      selector: config.selector,
      isTestnet: network.includes('sepolia') || network.includes('fuji') || network.includes('testnet') || network.includes('amoy')
    }));
    
    const mainnets = selectors.filter(s => !s.isTestnet);
    const testnets = selectors.filter(s => s.isTestnet);
    
    return [{
      json: {
        allSelectors: selectors,
        mainnets,
        testnets,
        totalNetworks: selectors.length,
        mainnetCount: mainnets.length,
        testnetCount: testnets.length,
        description: 'CCIP Chain Selectors are unique identifiers for each blockchain in the CCIP network',
        explorerUrl: 'https://ccip.chain.link',
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get CCIP token transfer limits
 */
export async function getTokenTransferLimits(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const router = getCCIPRouterContract(credentials);
    if (!router) {
      throw new Error(`CCIP Router not available on ${credentials.network}`);
    }
    
    const destinationNetwork = this.getNodeParameter('destinationNetwork', index) as string;
    const destSelector = CCIP_CHAIN_SELECTORS[destinationNetwork];
    
    if (!destSelector) {
      throw new Error(`Unknown destination network: ${destinationNetwork}`);
    }
    
    // Get supported tokens for this lane
    let supportedTokens: string[] = [];
    try {
      supportedTokens = await router.getSupportedTokens(BigInt(destSelector.selector));
    } catch {
      // Function may not be available
    }
    
    return [{
      json: {
        sourceNetwork: credentials.network,
        destinationNetwork,
        destinationSelector: destSelector.selector,
        supportedTokens,
        tokenCount: supportedTokens.length,
        notes: [
          'Token transfer limits vary by token and lane',
          'Rate limits are enforced per lane',
          'Large transfers may require multiple transactions',
          'Check CCIP documentation for specific limits'
        ],
        docsUrl: 'https://docs.chain.link/ccip/supported-networks',
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}
