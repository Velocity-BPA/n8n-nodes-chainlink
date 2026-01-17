/**
 * Network Utilities Resource Actions
 * General network utilities and Chainlink helpers
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { formatUnits, isAddress, getAddress } from 'ethers';
import {
  getChainlinkCredentials,
  getProvider,
  getPriceFeedContract,
  handleChainlinkError,
  getNetworkFromCredentials,
  isValidAddress,
  checksumAddress
} from '../transport/provider';
import { PRICE_FEEDS } from '../constants/addresses';
import { NETWORKS } from '../constants/networks';

/**
 * Get gas price from Chainlink Fast Gas feed or network
 */
export async function getGasPrice(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    const provider = getProvider(credentials);
    
    // Get gas price from network
    const feeData = await provider.getFeeData();
    const networkGasPrice = feeData.gasPrice || BigInt(0);
    const maxFeePerGas = feeData.maxFeePerGas;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    
    // Try to get from Chainlink Fast Gas feed (Ethereum mainnet only)
    let chainlinkGasPrice: string | null = null;
    let chainlinkFeedUsed = false;
    
    const networkFeeds = PRICE_FEEDS[credentials.network];
    if (networkFeeds && networkFeeds['FAST_GAS']) {
      try {
        const gasFeed = getPriceFeedContract(networkFeeds['FAST_GAS'].address, credentials);
        const [, answer, , updatedAt] = await gasFeed.latestRoundData();
        
        // Fast Gas feed returns gas price in Gwei (no decimals)
        chainlinkGasPrice = answer.toString();
        chainlinkFeedUsed = true;
      } catch {
        // Fast Gas feed not available
      }
    }
    
    return [{
      json: {
        gasPrice: {
          network: {
            gwei: formatUnits(networkGasPrice, 'gwei'),
            wei: networkGasPrice.toString()
          },
          chainlink: chainlinkFeedUsed ? {
            gwei: chainlinkGasPrice,
            source: 'Chainlink Fast Gas Feed'
          } : null
        },
        eip1559: maxFeePerGas ? {
          maxFeePerGas: formatUnits(maxFeePerGas, 'gwei'),
          maxPriorityFeePerGas: maxPriorityFeePerGas ? formatUnits(maxPriorityFeePerGas, 'gwei') : null
        } : null,
        supportsEIP1559: maxFeePerGas !== null,
        chainlinkFeedAvailable: chainlinkFeedUsed,
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get ETH (native token) price
 */
export async function getEthPrice(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    // Find the appropriate native/USD feed for this network
    const networkFeeds = PRICE_FEEDS[credentials.network];
    if (!networkFeeds) {
      throw new Error(`Price feeds not available for ${credentials.network}`);
    }
    
    // Determine native token based on network
    let nativePair: string;
    let nativeSymbol: string;
    
    if (credentials.network.includes('polygon')) {
      nativePair = 'MATIC/USD';
      nativeSymbol = 'MATIC';
    } else if (credentials.network.includes('avalanche')) {
      nativePair = 'AVAX/USD';
      nativeSymbol = 'AVAX';
    } else if (credentials.network.includes('bnb')) {
      nativePair = 'BNB/USD';
      nativeSymbol = 'BNB';
    } else {
      nativePair = 'ETH/USD';
      nativeSymbol = 'ETH';
    }
    
    const feedInfo = networkFeeds[nativePair];
    if (!feedInfo) {
      throw new Error(`${nativePair} price feed not available on ${credentials.network}`);
    }
    
    const priceFeed = getPriceFeedContract(feedInfo.address, credentials);
    const [roundId, answer, startedAt, updatedAt, answeredInRound] = await priceFeed.latestRoundData();
    const decimals = await priceFeed.decimals();
    
    const price = formatUnits(answer, Number(decimals));
    
    return [{
      json: {
        nativeToken: nativeSymbol,
        pair: nativePair,
        price,
        priceRaw: answer.toString(),
        decimals: Number(decimals),
        roundId: roundId.toString(),
        updatedAt: new Date(Number(updatedAt) * 1000).toISOString(),
        feedAddress: feedInfo.address,
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get network status and info
 */
export async function getNetworkStatus(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    const provider = getProvider(credentials);
    const network = getNetworkFromCredentials(credentials);
    
    // Get current block
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    
    // Get gas price
    const feeData = await provider.getFeeData();
    
    // Check network sync status
    const networkInfo = await provider.getNetwork();
    
    return [{
      json: {
        network: credentials.network,
        networkName: network?.name || 'Unknown',
        chainId: Number(networkInfo.chainId),
        isTestnet: network?.isTestnet || false,
        currentBlock: blockNumber,
        blockTimestamp: block ? new Date(block.timestamp * 1000).toISOString() : null,
        gasPrice: feeData.gasPrice ? formatUnits(feeData.gasPrice, 'gwei') : null,
        supportsEIP1559: feeData.maxFeePerGas !== null,
        chainlinkContracts: {
          linkToken: network?.linkToken || null,
          vrfCoordinator: network?.vrfCoordinator || null,
          automationRegistry: network?.automationRegistry || null,
          ccipRouter: network?.ccipRouter || null,
          feedRegistry: network?.feedRegistry || null
        },
        explorerUrl: network?.explorerUrl || null,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Validate and checksum an Ethereum address
 */
export async function validateAddress(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const address = this.getNodeParameter('addressToValidate', index) as string;
    
    const isValid = isValidAddress(address);
    let checksummed: string | null = null;
    let isChecksumValid = false;
    
    if (isValid) {
      checksummed = checksumAddress(address);
      // Check if original was already properly checksummed
      isChecksumValid = address === checksummed;
    }
    
    return [{
      json: {
        originalAddress: address,
        isValid,
        checksummedAddress: checksummed,
        isProperlyChecksummed: isChecksumValid,
        addressType: isValid ? 'EOA or Contract' : 'Invalid',
        notes: isValid 
          ? (isChecksumValid ? 'Address is valid and properly checksummed' : 'Address is valid but not checksummed - use checksummed version')
          : 'Invalid Ethereum address format',
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get list of all supported networks
 */
export async function listSupportedNetworks(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const networks = Object.entries(NETWORKS)
      .filter(([key]) => key !== 'custom')
      .map(([key, config]) => ({
        key,
        name: config.name,
        chainId: config.chainId,
        isTestnet: config.isTestnet,
        hasVRF: !!config.vrfCoordinator,
        hasAutomation: !!config.automationRegistry,
        hasCCIP: !!config.ccipRouter,
        hasFeedRegistry: !!config.feedRegistry,
        explorerUrl: config.explorerUrl
      }));
    
    const mainnets = networks.filter(n => !n.isTestnet);
    const testnets = networks.filter(n => n.isTestnet);
    
    return [{
      json: {
        networks,
        summary: {
          total: networks.length,
          mainnets: mainnets.length,
          testnets: testnets.length,
          withVRF: networks.filter(n => n.hasVRF).length,
          withAutomation: networks.filter(n => n.hasAutomation).length,
          withCCIP: networks.filter(n => n.hasCCIP).length
        },
        mainnets,
        testnets,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Check if a contract exists at an address
 */
export async function checkContractExists(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    const provider = getProvider(credentials);
    
    const address = this.getNodeParameter('contractAddress', index) as string;
    
    if (!isValidAddress(address)) {
      throw new Error('Invalid Ethereum address format');
    }
    
    const code = await provider.getCode(address);
    const isContract = code !== '0x' && code !== '0x0';
    
    // Get balance
    const balance = await provider.getBalance(address);
    
    return [{
      json: {
        address: checksumAddress(address),
        isContract,
        hasCode: isContract,
        codeSize: isContract ? (code.length - 2) / 2 : 0, // bytes
        balance: formatUnits(balance, 18),
        balanceWei: balance.toString(),
        addressType: isContract ? 'Contract' : 'EOA (Externally Owned Account)',
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Convert between wei and other units
 */
export async function convertUnits(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const value = this.getNodeParameter('value', index) as string;
    const fromUnit = this.getNodeParameter('fromUnit', index, 'ether') as string;
    const toUnit = this.getNodeParameter('toUnit', index, 'wei') as string;
    
    // Unit decimals
    const unitDecimals: Record<string, number> = {
      wei: 0,
      kwei: 3,
      mwei: 6,
      gwei: 9,
      szabo: 12,
      finney: 15,
      ether: 18
    };
    
    const fromDecimals = unitDecimals[fromUnit];
    const toDecimals = unitDecimals[toUnit];
    
    if (fromDecimals === undefined || toDecimals === undefined) {
      throw new Error(`Invalid unit. Valid units: ${Object.keys(unitDecimals).join(', ')}`);
    }
    
    // Convert to wei first, then to target unit
    const valueInWei = BigInt(Math.floor(parseFloat(value) * Math.pow(10, fromDecimals)));
    
    let result: string;
    if (toDecimals === 0) {
      result = valueInWei.toString();
    } else {
      result = formatUnits(valueInWei, toDecimals);
    }
    
    return [{
      json: {
        input: {
          value,
          unit: fromUnit
        },
        output: {
          value: result,
          unit: toUnit
        },
        inWei: valueInWei.toString(),
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get block information
 */
export async function getBlockInfo(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    const provider = getProvider(credentials);
    
    const blockIdentifier = this.getNodeParameter('blockIdentifier', index, 'latest') as string;
    
    let block;
    if (blockIdentifier === 'latest') {
      block = await provider.getBlock('latest');
    } else if (blockIdentifier === 'pending') {
      block = await provider.getBlock('pending');
    } else {
      // Assume it's a block number
      block = await provider.getBlock(parseInt(blockIdentifier, 10));
    }
    
    if (!block) {
      throw new Error(`Block ${blockIdentifier} not found`);
    }
    
    return [{
      json: {
        blockNumber: block.number,
        blockHash: block.hash,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        timestampISO: new Date(block.timestamp * 1000).toISOString(),
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        gasUsagePercent: ((Number(block.gasUsed) / Number(block.gasLimit)) * 100).toFixed(2),
        baseFeePerGas: block.baseFeePerGas ? formatUnits(block.baseFeePerGas, 'gwei') : null,
        transactionCount: block.transactions?.length || 0,
        miner: block.miner,
        nonce: block.nonce,
        network: credentials.network,
        requestedBlock: blockIdentifier
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}
