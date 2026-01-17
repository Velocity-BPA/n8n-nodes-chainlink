/**
 * Chainlink Provider Transport
 * Handles EVM provider connections and contract interactions
 */

import { ethers, Contract, JsonRpcProvider, Wallet, formatUnits } from 'ethers';
import { IExecuteFunctions, ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import { NETWORKS, getNetworkConfig, NetworkConfig } from '../constants/networks';
import {
  AGGREGATOR_V3_ABI,
  FEED_REGISTRY_ABI,
  VRF_COORDINATOR_V2_ABI,
  AUTOMATION_REGISTRY_ABI,
  CCIP_ROUTER_ABI,
  LINK_TOKEN_ABI,
  SEQUENCER_UPTIME_FEED_ABI,
  FUNCTIONS_ROUTER_ABI
} from '../constants/abis';

/**
 * Chainlink credential interface
 */
export interface ChainlinkCredentials {
  network: string;
  rpcUrl: string;
  privateKey?: string;
  chainId: number;
}

/**
 * Provider cache for connection reuse
 */
const providerCache: Map<string, JsonRpcProvider> = new Map();

/**
 * Get credentials from n8n execution context
 */
export async function getChainlinkCredentials(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialType = 'chainlinkRpcApi'
): Promise<ChainlinkCredentials> {
  const credentials = await context.getCredentials(credentialType) as IDataObject;
  
  const networkKey = credentials.network as string;
  const networkConfig = getNetworkConfig(networkKey);
  
  // For custom network, use provided values
  if (networkKey === 'custom') {
    return {
      network: 'custom',
      rpcUrl: credentials.rpcUrl as string,
      privateKey: credentials.privateKey as string | undefined,
      chainId: parseInt(credentials.chainId as string, 10)
    };
  }
  
  // For predefined networks, use config or override
  return {
    network: networkKey,
    rpcUrl: (credentials.rpcUrl as string) || networkConfig?.rpcUrl || '',
    privateKey: credentials.privateKey as string | undefined,
    chainId: networkConfig?.chainId || 1
  };
}

/**
 * Create or get cached provider instance
 */
export function getProvider(credentials: ChainlinkCredentials): JsonRpcProvider {
  const cacheKey = `${credentials.network}-${credentials.rpcUrl}`;
  
  if (providerCache.has(cacheKey)) {
    return providerCache.get(cacheKey)!;
  }
  
  const provider = new JsonRpcProvider(credentials.rpcUrl, {
    chainId: credentials.chainId,
    name: credentials.network
  });
  
  providerCache.set(cacheKey, provider);
  return provider;
}

/**
 * Create wallet (signer) for write operations
 */
export function getWallet(credentials: ChainlinkCredentials): Wallet | null {
  if (!credentials.privateKey) {
    return null;
  }
  
  const provider = getProvider(credentials);
  return new Wallet(credentials.privateKey, provider);
}

/**
 * Get network configuration from credentials
 */
export function getNetworkFromCredentials(credentials: ChainlinkCredentials): NetworkConfig | undefined {
  return getNetworkConfig(credentials.network);
}

// ============================================
// Contract Factory Functions
// ============================================

/**
 * Get Price Feed (Aggregator V3) contract instance
 */
export function getPriceFeedContract(
  address: string,
  credentials: ChainlinkCredentials
): Contract {
  const provider = getProvider(credentials);
  return new Contract(address, AGGREGATOR_V3_ABI, provider);
}

/**
 * Get Feed Registry contract instance (Ethereum mainnet only)
 */
export function getFeedRegistryContract(credentials: ChainlinkCredentials): Contract | null {
  const network = getNetworkFromCredentials(credentials);
  if (!network?.feedRegistry) {
    return null;
  }
  
  const provider = getProvider(credentials);
  return new Contract(network.feedRegistry, FEED_REGISTRY_ABI, provider);
}

/**
 * Get VRF Coordinator contract instance
 */
export function getVRFCoordinatorContract(credentials: ChainlinkCredentials): Contract | null {
  const network = getNetworkFromCredentials(credentials);
  if (!network?.vrfCoordinator) {
    return null;
  }
  
  const provider = getProvider(credentials);
  return new Contract(network.vrfCoordinator, VRF_COORDINATOR_V2_ABI, provider);
}

/**
 * Get Automation Registry contract instance
 */
export function getAutomationRegistryContract(credentials: ChainlinkCredentials): Contract | null {
  const network = getNetworkFromCredentials(credentials);
  if (!network?.automationRegistry) {
    return null;
  }
  
  const provider = getProvider(credentials);
  return new Contract(network.automationRegistry, AUTOMATION_REGISTRY_ABI, provider);
}

/**
 * Get CCIP Router contract instance
 */
export function getCCIPRouterContract(credentials: ChainlinkCredentials): Contract | null {
  const network = getNetworkFromCredentials(credentials);
  if (!network?.ccipRouter) {
    return null;
  }
  
  const provider = getProvider(credentials);
  return new Contract(network.ccipRouter, CCIP_ROUTER_ABI, provider);
}

/**
 * Get LINK Token contract instance
 */
export function getLINKTokenContract(credentials: ChainlinkCredentials): Contract | null {
  const network = getNetworkFromCredentials(credentials);
  if (!network?.linkToken) {
    return null;
  }
  
  const provider = getProvider(credentials);
  const wallet = getWallet(credentials);
  return new Contract(network.linkToken, LINK_TOKEN_ABI, wallet || provider);
}

/**
 * Get Sequencer Uptime Feed contract instance
 */
export function getSequencerUptimeFeedContract(
  address: string,
  credentials: ChainlinkCredentials
): Contract {
  const provider = getProvider(credentials);
  return new Contract(address, SEQUENCER_UPTIME_FEED_ABI, provider);
}

/**
 * Get Functions Router contract instance
 */
export function getFunctionsRouterContract(
  address: string,
  credentials: ChainlinkCredentials
): Contract {
  const provider = getProvider(credentials);
  return new Contract(address, FUNCTIONS_ROUTER_ABI, provider);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format price from BigInt with decimals
 */
export function formatPrice(price: bigint, decimals: number): string {
  return formatUnits(price, decimals);
}

/**
 * Parse price to BigInt from string
 */
export function parsePrice(price: string, decimals: number): bigint {
  return ethers.parseUnits(price, decimals);
}

/**
 * Convert timestamp to ISO string
 */
export function timestampToISO(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toISOString();
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Checksum an Ethereum address
 */
export function checksumAddress(address: string): string {
  return ethers.getAddress(address);
}

/**
 * Get block timestamp
 */
export async function getBlockTimestamp(credentials: ChainlinkCredentials): Promise<number> {
  const provider = getProvider(credentials);
  const block = await provider.getBlock('latest');
  return block?.timestamp || Math.floor(Date.now() / 1000);
}

/**
 * Calculate derived price (e.g., ETH/EUR from ETH/USD and EUR/USD)
 * priceA = base/USD (e.g., ETH/USD)
 * priceB = quote/USD (e.g., EUR/USD)
 * result = base/quote (e.g., ETH/EUR)
 */
export function calculateDerivedPrice(
  priceA: bigint,
  decimalsA: number,
  priceB: bigint,
  decimalsB: number,
  resultDecimals: number = 8
): { price: bigint; formatted: string } {
  // Convert to same decimal precision for calculation
  const scaleFactor = BigInt(10 ** resultDecimals);
  
  // priceA / priceB with precision handling
  // (priceA * scaleFactor * 10^decimalsB) / (priceB * 10^decimalsA)
  const numerator = priceA * scaleFactor * BigInt(10 ** decimalsB);
  const denominator = priceB * BigInt(10 ** decimalsA);
  
  const derivedPrice = numerator / denominator;
  
  return {
    price: derivedPrice,
    formatted: formatPrice(derivedPrice, resultDecimals)
  };
}

/**
 * Clear provider cache (useful for cleanup)
 */
export function clearProviderCache(): void {
  providerCache.clear();
}

/**
 * Get gas price from network
 */
export async function getGasPrice(credentials: ChainlinkCredentials): Promise<{
  gasPrice: bigint;
  formatted: string;
}> {
  const provider = getProvider(credentials);
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || BigInt(0);
  
  return {
    gasPrice,
    formatted: formatUnits(gasPrice, 'gwei')
  };
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  credentials: ChainlinkCredentials,
  to: string,
  data: string
): Promise<bigint> {
  const provider = getProvider(credentials);
  return await provider.estimateGas({ to, data });
}

/**
 * Error handler for Chainlink operations
 */
export function handleChainlinkError(error: unknown): never {
  if (error instanceof Error) {
    // Check for common errors
    if (error.message.includes('call revert exception')) {
      throw new Error('Contract call reverted. The feed address may be invalid or the contract may not exist on this network.');
    }
    if (error.message.includes('network does not support ENS')) {
      throw new Error('ENS resolution is not supported on this network. Please use a valid contract address.');
    }
    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient funds for transaction. Please ensure your wallet has enough ETH for gas.');
    }
    if (error.message.includes('nonce')) {
      throw new Error('Transaction nonce error. Please wait for pending transactions to complete.');
    }
    throw new Error(`Chainlink operation failed: ${error.message}`);
  }
  throw new Error('An unknown error occurred during Chainlink operation');
}
