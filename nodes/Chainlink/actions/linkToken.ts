/**
 * LINK Token Resource Actions
 * Operations for the LINK token across networks
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { formatUnits, parseUnits } from 'ethers';
import {
  getChainlinkCredentials,
  getLINKTokenContract,
  getPriceFeedContract,
  getWallet,
  handleChainlinkError,
  getNetworkFromCredentials
} from '../transport/provider';
import { PRICE_FEEDS } from '../constants/addresses';

/**
 * Get LINK token balance for an address
 */
export async function getLinkBalance(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const linkContract = getLINKTokenContract(credentials);
    if (!linkContract) {
      throw new Error(`LINK token not configured for ${credentials.network}`);
    }
    
    const addressToCheck = this.getNodeParameter('addressToCheck', index, '') as string;
    
    // If no address provided, use the wallet address from credentials
    let targetAddress = addressToCheck;
    if (!targetAddress) {
      const wallet = getWallet(credentials);
      if (!wallet) {
        throw new Error('No address provided and no private key configured');
      }
      targetAddress = await wallet.getAddress();
    }
    
    const balance = await linkContract.balanceOf(targetAddress);
    const decimals = await linkContract.decimals();
    
    // Get LINK price if available
    let linkPriceUSD: string | null = null;
    let balanceUSD: string | null = null;
    
    const networkFeeds = PRICE_FEEDS[credentials.network];
    if (networkFeeds && networkFeeds['LINK/USD']) {
      try {
        const priceFeed = getPriceFeedContract(networkFeeds['LINK/USD'].address, credentials);
        const [, answer] = await priceFeed.latestRoundData();
        linkPriceUSD = formatUnits(answer, 8);
        
        // Calculate USD value
        const balanceNum = parseFloat(formatUnits(balance, Number(decimals)));
        const priceNum = parseFloat(linkPriceUSD);
        balanceUSD = (balanceNum * priceNum).toFixed(2);
      } catch {
        // Price feed not available
      }
    }
    
    const network = getNetworkFromCredentials(credentials);
    
    return [{
      json: {
        address: targetAddress,
        balance: formatUnits(balance, Number(decimals)),
        balanceRaw: balance.toString(),
        decimals: Number(decimals),
        balanceUSD,
        linkPriceUSD,
        tokenAddress: network?.linkToken || await linkContract.getAddress(),
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get current LINK token price
 */
export async function getLinkPrice(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const networkFeeds = PRICE_FEEDS[credentials.network];
    if (!networkFeeds || !networkFeeds['LINK/USD']) {
      throw new Error(`LINK/USD price feed not available on ${credentials.network}`);
    }
    
    const feedInfo = networkFeeds['LINK/USD'];
    const priceFeed = getPriceFeedContract(feedInfo.address, credentials);
    
    const [roundId, answer, startedAt, updatedAt, answeredInRound] = await priceFeed.latestRoundData();
    const decimals = await priceFeed.decimals();
    
    const price = formatUnits(answer, Number(decimals));
    
    return [{
      json: {
        price,
        priceRaw: answer.toString(),
        decimals: Number(decimals),
        pair: 'LINK/USD',
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
 * Transfer LINK tokens
 */
export async function transferLink(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const wallet = getWallet(credentials);
    if (!wallet) {
      throw new Error('Private key required for LINK transfers');
    }
    
    const linkContract = getLINKTokenContract(credentials);
    if (!linkContract) {
      throw new Error(`LINK token not configured for ${credentials.network}`);
    }
    
    const toAddress = this.getNodeParameter('toAddress', index) as string;
    const amount = this.getNodeParameter('amount', index) as string;
    
    // Parse amount to wei (LINK has 18 decimals)
    const amountWei = parseUnits(amount, 18);
    
    // Check balance before transfer
    const senderAddress = await wallet.getAddress();
    const balance = await linkContract.balanceOf(senderAddress);
    
    if (balance < amountWei) {
      throw new Error(`Insufficient LINK balance. Have: ${formatUnits(balance, 18)}, Need: ${amount}`);
    }
    
    // Execute transfer
    const tx = await linkContract.transfer(toAddress, amountWei);
    const receipt = await tx.wait();
    
    return [{
      json: {
        success: receipt.status === 1,
        transactionHash: receipt.hash,
        from: senderAddress,
        to: toAddress,
        amount,
        amountRaw: amountWei.toString(),
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        network: credentials.network,
        explorerUrl: getExplorerTxUrl(credentials.network, receipt.hash),
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get LINK token address for a network
 */
export async function getLinkTokenAddress(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    const network = getNetworkFromCredentials(credentials);
    
    if (!network?.linkToken) {
      throw new Error(`LINK token address not configured for ${credentials.network}`);
    }
    
    return [{
      json: {
        tokenAddress: network.linkToken,
        tokenName: 'ChainLink Token',
        tokenSymbol: 'LINK',
        decimals: 18,
        network: credentials.network,
        networkName: network.name,
        explorerUrl: getExplorerTokenUrl(credentials.network, network.linkToken),
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Check LINK allowance
 */
export async function checkLinkAllowance(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const linkContract = getLINKTokenContract(credentials);
    if (!linkContract) {
      throw new Error(`LINK token not configured for ${credentials.network}`);
    }
    
    const ownerAddress = this.getNodeParameter('ownerAddress', index) as string;
    const spenderAddress = this.getNodeParameter('spenderAddress', index) as string;
    
    const allowance = await linkContract.allowance(ownerAddress, spenderAddress);
    
    // Check if allowance is "unlimited" (max uint256)
    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    const isUnlimited = allowance >= maxUint256 / BigInt(2);
    
    return [{
      json: {
        owner: ownerAddress,
        spender: spenderAddress,
        allowance: formatUnits(allowance, 18),
        allowanceRaw: allowance.toString(),
        isUnlimited,
        hasAllowance: allowance > BigInt(0),
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get LINK token total supply
 */
export async function getLinkTotalSupply(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const linkContract = getLINKTokenContract(credentials);
    if (!linkContract) {
      throw new Error(`LINK token not configured for ${credentials.network}`);
    }
    
    const totalSupply = await linkContract.totalSupply();
    
    return [{
      json: {
        totalSupply: formatUnits(totalSupply, 18),
        totalSupplyRaw: totalSupply.toString(),
        decimals: 18,
        notes: 'LINK has a fixed supply of 1 billion tokens',
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get all LINK token addresses across networks
 */
export async function getAllLinkAddresses(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const { NETWORKS } = await import('../constants/networks');
    
    const addresses = Object.entries(NETWORKS)
      .filter(([, config]) => config.linkToken)
      .map(([key, config]) => ({
        network: key,
        name: config.name,
        linkToken: config.linkToken,
        chainId: config.chainId,
        isTestnet: config.isTestnet
      }));
    
    return [{
      json: {
        addresses,
        totalNetworks: addresses.length,
        mainnetCount: addresses.filter(a => !a.isTestnet).length,
        testnetCount: addresses.filter(a => a.isTestnet).length,
        tokenInfo: {
          name: 'ChainLink Token',
          symbol: 'LINK',
          decimals: 18,
          totalSupply: '1,000,000,000'
        },
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Helper: Get explorer transaction URL
 */
function getExplorerTxUrl(network: string, txHash: string): string {
  const explorers: Record<string, string> = {
    'ethereum-mainnet': 'https://etherscan.io/tx/',
    'ethereum-sepolia': 'https://sepolia.etherscan.io/tx/',
    'polygon-mainnet': 'https://polygonscan.com/tx/',
    'polygon-amoy': 'https://amoy.polygonscan.com/tx/',
    'arbitrum-mainnet': 'https://arbiscan.io/tx/',
    'arbitrum-sepolia': 'https://sepolia.arbiscan.io/tx/',
    'optimism-mainnet': 'https://optimistic.etherscan.io/tx/',
    'optimism-sepolia': 'https://sepolia-optimism.etherscan.io/tx/',
    'avalanche-mainnet': 'https://snowtrace.io/tx/',
    'avalanche-fuji': 'https://testnet.snowtrace.io/tx/',
    'bnb-mainnet': 'https://bscscan.com/tx/',
    'bnb-testnet': 'https://testnet.bscscan.com/tx/',
    'base-mainnet': 'https://basescan.org/tx/',
    'base-sepolia': 'https://sepolia.basescan.org/tx/'
  };
  
  const baseUrl = explorers[network] || 'https://etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
}

/**
 * Helper: Get explorer token URL
 */
function getExplorerTokenUrl(network: string, tokenAddress: string): string {
  const explorers: Record<string, string> = {
    'ethereum-mainnet': 'https://etherscan.io/token/',
    'ethereum-sepolia': 'https://sepolia.etherscan.io/token/',
    'polygon-mainnet': 'https://polygonscan.com/token/',
    'polygon-amoy': 'https://amoy.polygonscan.com/token/',
    'arbitrum-mainnet': 'https://arbiscan.io/token/',
    'arbitrum-sepolia': 'https://sepolia.arbiscan.io/token/',
    'optimism-mainnet': 'https://optimistic.etherscan.io/token/',
    'optimism-sepolia': 'https://sepolia-optimism.etherscan.io/token/',
    'avalanche-mainnet': 'https://snowtrace.io/token/',
    'avalanche-fuji': 'https://testnet.snowtrace.io/token/',
    'bnb-mainnet': 'https://bscscan.com/token/',
    'bnb-testnet': 'https://testnet.bscscan.com/token/',
    'base-mainnet': 'https://basescan.org/token/',
    'base-sepolia': 'https://sepolia.basescan.org/token/'
  };
  
  const baseUrl = explorers[network] || 'https://etherscan.io/token/';
  return `${baseUrl}${tokenAddress}`;
}
