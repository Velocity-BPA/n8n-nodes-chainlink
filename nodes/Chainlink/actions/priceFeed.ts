/**
 * Price Feed Resource Actions
 * Operations for Chainlink Data Feeds (Price Oracles)
 */

import { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import {
  getChainlinkCredentials,
  getPriceFeedContract,
  getFeedRegistryContract,
  formatPrice,
  timestampToISO,
  calculateDerivedPrice,
  handleChainlinkError,
  getNetworkFromCredentials
} from '../transport/provider';
import { PRICE_FEEDS, getPriceFeed, FEED_REGISTRY_TOKENS } from '../constants/addresses';

/**
 * Get latest price from a Chainlink price feed
 */
export async function getLatestPrice(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const feedSource = this.getNodeParameter('feedSource', index) as string;
    let feedAddress: string;
    
    if (feedSource === 'preset') {
      const pair = this.getNodeParameter('pricePair', index) as string;
      const feedInfo = getPriceFeed(credentials.network, pair);
      if (!feedInfo) {
        throw new Error(`Price feed ${pair} not available on ${credentials.network}`);
      }
      feedAddress = feedInfo.address;
    } else {
      feedAddress = this.getNodeParameter('feedAddress', index) as string;
    }
    
    const contract = getPriceFeedContract(feedAddress, credentials);
    
    const [roundId, answer, startedAt, updatedAt, answeredInRound] = await contract.latestRoundData();
    const decimals = await contract.decimals();
    const description = await contract.description();
    
    const formattedPrice = formatPrice(answer, Number(decimals));
    
    return [{
      json: {
        price: formattedPrice,
        rawPrice: answer.toString(),
        decimals: Number(decimals),
        pair: description,
        roundId: roundId.toString(),
        startedAt: timestampToISO(startedAt),
        updatedAt: timestampToISO(updatedAt),
        answeredInRound: answeredInRound.toString(),
        feedAddress,
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get full round data from a price feed
 */
export async function getPriceFeedData(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const feedAddress = this.getNodeParameter('feedAddress', index) as string;
    const contract = getPriceFeedContract(feedAddress, credentials);
    
    const [roundId, answer, startedAt, updatedAt, answeredInRound] = await contract.latestRoundData();
    const decimals = await contract.decimals();
    const description = await contract.description();
    const version = await contract.version();
    
    // Calculate staleness
    const currentTime = Math.floor(Date.now() / 1000);
    const lastUpdate = Number(updatedAt);
    const stalenessSeconds = currentTime - lastUpdate;
    
    return [{
      json: {
        price: formatPrice(answer, Number(decimals)),
        rawPrice: answer.toString(),
        decimals: Number(decimals),
        pair: description,
        version: version.toString(),
        roundId: roundId.toString(),
        phaseId: (roundId >> BigInt(64)).toString(),
        aggregatorRoundId: (roundId & BigInt('0xFFFFFFFFFFFFFFFF')).toString(),
        startedAt: timestampToISO(startedAt),
        startedAtTimestamp: Number(startedAt),
        updatedAt: timestampToISO(updatedAt),
        updatedAtTimestamp: Number(updatedAt),
        answeredInRound: answeredInRound.toString(),
        stalenessSeconds,
        isStale: stalenessSeconds > 3600, // Consider stale if > 1 hour
        feedAddress,
        network: credentials.network
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get historical price by round ID
 */
export async function getHistoricalPrice(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const feedAddress = this.getNodeParameter('feedAddress', index) as string;
    const roundId = this.getNodeParameter('roundId', index) as string;
    
    const contract = getPriceFeedContract(feedAddress, credentials);
    
    const [returnedRoundId, answer, startedAt, updatedAt, answeredInRound] = 
      await contract.getRoundData(BigInt(roundId));
    const decimals = await contract.decimals();
    const description = await contract.description();
    
    return [{
      json: {
        price: formatPrice(answer, Number(decimals)),
        rawPrice: answer.toString(),
        decimals: Number(decimals),
        pair: description,
        roundId: returnedRoundId.toString(),
        startedAt: timestampToISO(startedAt),
        updatedAt: timestampToISO(updatedAt),
        answeredInRound: answeredInRound.toString(),
        feedAddress,
        network: credentials.network
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get price feed description and metadata
 */
export async function getFeedDescription(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const feedAddress = this.getNodeParameter('feedAddress', index) as string;
    const contract = getPriceFeedContract(feedAddress, credentials);
    
    const description = await contract.description();
    const decimals = await contract.decimals();
    const version = await contract.version();
    
    // Parse pair from description (usually "ETH / USD" format)
    const parts = description.split(' / ');
    
    return [{
      json: {
        description,
        decimals: Number(decimals),
        version: version.toString(),
        baseAsset: parts[0] || 'Unknown',
        quoteAsset: parts[1] || 'Unknown',
        feedAddress,
        network: credentials.network
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get multiple prices in batch
 */
export async function getMultiplePrices(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const feedAddresses = this.getNodeParameter('feedAddresses', index) as string;
    const addresses = feedAddresses.split(',').map(a => a.trim()).filter(a => a);
    
    const results: IDataObject[] = [];
    
    for (const address of addresses) {
      try {
        const contract = getPriceFeedContract(address, credentials);
        
        const [roundId, answer, startedAt, updatedAt] = await contract.latestRoundData();
        const decimals = await contract.decimals();
        const description = await contract.description();
        
        results.push({
          pair: description,
          price: formatPrice(answer, Number(decimals)),
          rawPrice: answer.toString(),
          decimals: Number(decimals),
          roundId: roundId.toString(),
          updatedAt: timestampToISO(updatedAt),
          feedAddress: address,
          status: 'success'
        });
      } catch (err) {
        results.push({
          feedAddress: address,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
    
    return [{
      json: {
        prices: results,
        totalFeeds: addresses.length,
        successfulFeeds: results.filter(r => r.status === 'success').length,
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * List available price feeds for a network
 */
export async function listAvailableFeeds(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    const category = this.getNodeParameter('feedCategory', index, 'all') as string;
    
    const networkFeeds = PRICE_FEEDS[credentials.network] || {};
    
    let feeds = Object.entries(networkFeeds).map(([pair, info]) => ({
      pair,
      address: info.address,
      decimals: info.decimals,
      category: info.category
    }));
    
    if (category !== 'all') {
      feeds = feeds.filter(f => f.category === category);
    }
    
    return [{
      json: {
        feeds,
        totalFeeds: feeds.length,
        network: credentials.network,
        categories: [...new Set(feeds.map(f => f.category))]
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Calculate derived price (e.g., ETH/EUR via ETH/USD and EUR/USD)
 */
export async function getDerivedPrice(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const baseFeedAddress = this.getNodeParameter('baseFeedAddress', index) as string;
    const quoteFeedAddress = this.getNodeParameter('quoteFeedAddress', index) as string;
    
    // Get base price (e.g., ETH/USD)
    const baseContract = getPriceFeedContract(baseFeedAddress, credentials);
    const [, baseAnswer] = await baseContract.latestRoundData();
    const baseDecimals = await baseContract.decimals();
    const baseDescription = await baseContract.description();
    
    // Get quote price (e.g., EUR/USD)
    const quoteContract = getPriceFeedContract(quoteFeedAddress, credentials);
    const [, quoteAnswer] = await quoteContract.latestRoundData();
    const quoteDecimals = await quoteContract.decimals();
    const quoteDescription = await quoteContract.description();
    
    // Calculate derived price
    const derived = calculateDerivedPrice(
      baseAnswer,
      Number(baseDecimals),
      quoteAnswer,
      Number(quoteDecimals),
      8
    );
    
    // Parse asset names
    const baseParts = baseDescription.split(' / ');
    const quoteParts = quoteDescription.split(' / ');
    
    return [{
      json: {
        derivedPrice: derived.formatted,
        rawDerivedPrice: derived.price.toString(),
        derivedPair: `${baseParts[0]} / ${quoteParts[0]}`,
        basePrice: formatPrice(baseAnswer, Number(baseDecimals)),
        basePair: baseDescription,
        quotePrice: formatPrice(quoteAnswer, Number(quoteDecimals)),
        quotePair: quoteDescription,
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get price from Feed Registry (Ethereum mainnet only)
 */
export async function getFeedRegistryPrice(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const registry = getFeedRegistryContract(credentials);
    if (!registry) {
      throw new Error('Feed Registry is only available on Ethereum Mainnet');
    }
    
    const baseAsset = this.getNodeParameter('baseAsset', index) as string;
    const quoteAsset = this.getNodeParameter('quoteAsset', index) as string;
    
    // Get token addresses
    const baseAddress = FEED_REGISTRY_TOKENS[baseAsset as keyof typeof FEED_REGISTRY_TOKENS] || baseAsset;
    const quoteAddress = FEED_REGISTRY_TOKENS[quoteAsset as keyof typeof FEED_REGISTRY_TOKENS] || quoteAsset;
    
    const [roundId, answer, startedAt, updatedAt, answeredInRound] = 
      await registry.latestRoundData(baseAddress, quoteAddress);
    const decimals = await registry.decimals(baseAddress, quoteAddress);
    const description = await registry.description(baseAddress, quoteAddress);
    const feedAddress = await registry.getFeed(baseAddress, quoteAddress);
    
    return [{
      json: {
        price: formatPrice(answer, Number(decimals)),
        rawPrice: answer.toString(),
        decimals: Number(decimals),
        pair: description,
        roundId: roundId.toString(),
        startedAt: timestampToISO(startedAt),
        updatedAt: timestampToISO(updatedAt),
        answeredInRound: answeredInRound.toString(),
        feedAddress,
        baseAsset,
        quoteAsset,
        network: credentials.network
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}
