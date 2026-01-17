/**
 * Data Feed Resource Actions
 * Operations for specialized Chainlink Data Feeds:
 * - Proof of Reserve (PoR)
 * - NFT Floor Price
 * - L2 Sequencer Uptime
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  getChainlinkCredentials,
  getPriceFeedContract,
  getSequencerUptimeFeedContract,
  formatPrice,
  timestampToISO,
  handleChainlinkError
} from '../transport/provider';

/**
 * Proof of Reserve Feed Addresses (partial list)
 */
const POR_FEEDS: Record<string, Record<string, { address: string; asset: string; decimals: number }>> = {
  'ethereum-mainnet': {
    'WBTC': {
      address: '0xa81FE04086865e63E12dD3776978E49DEEa2ea4e',
      asset: 'WBTC Reserve',
      decimals: 8
    },
    'TUSD': {
      address: '0x478f4c42b877c697C4b19E396865D4D533EcB6ea',
      asset: 'TUSD Reserve',
      decimals: 18
    },
    'USDC': {
      address: '0x2c78EFd57d907D8C16A1d17F3C9Bc6fE9DE86E6a',
      asset: 'USDC Reserve',
      decimals: 18
    }
  }
};

/**
 * NFT Floor Price Feed Addresses
 */
const NFT_FLOOR_FEEDS: Record<string, Record<string, { address: string; collection: string; decimals: number }>> = {
  'ethereum-mainnet': {
    'BAYC': {
      address: '0xB677bfBc9B09a3469695f40477d05bc9BcB15F50',
      collection: 'Bored Ape Yacht Club',
      decimals: 18
    },
    'CRYPTOPUNKS': {
      address: '0x01B6710B01cF3dd8Ae64243097d91aFb03728Fdd',
      collection: 'CryptoPunks',
      decimals: 18
    },
    'MAYC': {
      address: '0x1823C89715Fe3fB96A24d11c917aCA918894A090',
      collection: 'Mutant Ape Yacht Club',
      decimals: 18
    },
    'AZUKI': {
      address: '0xA8B9A447C73191744D5B79BcE864F343455E1150',
      collection: 'Azuki',
      decimals: 18
    },
    'DOODLES': {
      address: '0x027828052840a43Cc2D0187BcfA6e3D6AcE60336',
      collection: 'Doodles',
      decimals: 18
    }
  }
};

/**
 * L2 Sequencer Uptime Feed Addresses
 */
const SEQUENCER_FEEDS: Record<string, string> = {
  'arbitrum-mainnet': '0xFdB631F5EE196F0ed6FAa767959853A9F217697D',
  'optimism-mainnet': '0x371EAD81c9102C9BF4874A9075FFFf170F2Ee389',
  'base-mainnet': '0xBCF85224fc0756B9Fa45aA7892530B47e10b6433',
  'metis-mainnet': '0x58218ea7422255EBE94e56b504035a784b7AA7A8'
};

/**
 * Get Proof of Reserve feed data
 */
export async function getProofOfReserve(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const feedSource = this.getNodeParameter('porFeedSource', index) as string;
    let feedAddress: string;
    let assetName: string;
    let expectedDecimals: number;
    
    if (feedSource === 'preset') {
      const asset = this.getNodeParameter('porAsset', index) as string;
      const networkFeeds = POR_FEEDS[credentials.network];
      
      if (!networkFeeds || !networkFeeds[asset]) {
        throw new Error(`PoR feed for ${asset} not available on ${credentials.network}`);
      }
      
      feedAddress = networkFeeds[asset].address;
      assetName = networkFeeds[asset].asset;
      expectedDecimals = networkFeeds[asset].decimals;
    } else {
      feedAddress = this.getNodeParameter('porFeedAddress', index) as string;
      assetName = 'Custom PoR Feed';
      expectedDecimals = 18;
    }
    
    const contract = getPriceFeedContract(feedAddress, credentials);
    
    const [roundId, answer, startedAt, updatedAt, answeredInRound] = await contract.latestRoundData();
    const decimals = await contract.decimals();
    const description = await contract.description();
    
    const reserve = formatPrice(answer, Number(decimals));
    
    return [{
      json: {
        asset: assetName,
        reserve,
        rawReserve: answer.toString(),
        decimals: Number(decimals),
        description,
        roundId: roundId.toString(),
        startedAt: timestampToISO(startedAt),
        updatedAt: timestampToISO(updatedAt),
        answeredInRound: answeredInRound.toString(),
        feedAddress,
        network: credentials.network,
        feedType: 'Proof of Reserve',
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get NFT Floor Price feed data
 */
export async function getNFTFloorPrice(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const feedSource = this.getNodeParameter('nftFeedSource', index) as string;
    let feedAddress: string;
    let collectionName: string;
    
    if (feedSource === 'preset') {
      const collection = this.getNodeParameter('nftCollection', index) as string;
      const networkFeeds = NFT_FLOOR_FEEDS[credentials.network];
      
      if (!networkFeeds || !networkFeeds[collection]) {
        throw new Error(`NFT floor price feed for ${collection} not available on ${credentials.network}`);
      }
      
      feedAddress = networkFeeds[collection].address;
      collectionName = networkFeeds[collection].collection;
    } else {
      feedAddress = this.getNodeParameter('nftFeedAddress', index) as string;
      collectionName = 'Custom Collection';
    }
    
    const contract = getPriceFeedContract(feedAddress, credentials);
    
    const [roundId, answer, startedAt, updatedAt, answeredInRound] = await contract.latestRoundData();
    const decimals = await contract.decimals();
    const description = await contract.description();
    
    // Floor price is typically in ETH (18 decimals)
    const floorPriceETH = formatPrice(answer, Number(decimals));
    
    return [{
      json: {
        collection: collectionName,
        floorPriceETH,
        rawFloorPrice: answer.toString(),
        decimals: Number(decimals),
        description,
        roundId: roundId.toString(),
        startedAt: timestampToISO(startedAt),
        updatedAt: timestampToISO(updatedAt),
        answeredInRound: answeredInRound.toString(),
        feedAddress,
        network: credentials.network,
        feedType: 'NFT Floor Price',
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get L2 Sequencer Status (uptime feed)
 */
export async function getL2SequencerStatus(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const feedSource = this.getNodeParameter('sequencerFeedSource', index, 'auto') as string;
    let feedAddress: string;
    
    if (feedSource === 'auto') {
      const autoAddress = SEQUENCER_FEEDS[credentials.network];
      if (!autoAddress) {
        throw new Error(`L2 Sequencer uptime feed not available on ${credentials.network}. This feed is only available on L2 networks (Arbitrum, Optimism, Base).`);
      }
      feedAddress = autoAddress;
    } else {
      feedAddress = this.getNodeParameter('sequencerFeedAddress', index) as string;
    }
    
    const contract = getSequencerUptimeFeedContract(feedAddress, credentials);
    
    const [roundId, answer, startedAt, updatedAt, answeredInRound] = await contract.latestRoundData();
    
    // answer = 0 means sequencer is up, answer = 1 means sequencer is down
    const isSequencerUp = answer === BigInt(0);
    
    // Calculate how long the sequencer has been in current state
    const currentTime = Math.floor(Date.now() / 1000);
    const stateStartTime = Number(startedAt);
    const stateDurationSeconds = currentTime - stateStartTime;
    
    // Grace period consideration (typically 1 hour after sequencer comes back up)
    const gracePeriodSeconds = 3600;
    const isWithinGracePeriod = isSequencerUp && stateDurationSeconds < gracePeriodSeconds;
    
    return [{
      json: {
        isSequencerUp,
        status: isSequencerUp ? 'UP' : 'DOWN',
        statusCode: Number(answer),
        stateStartedAt: timestampToISO(startedAt),
        stateStartedAtTimestamp: stateStartTime,
        stateDurationSeconds,
        stateDurationMinutes: Math.floor(stateDurationSeconds / 60),
        stateDurationHours: (stateDurationSeconds / 3600).toFixed(2),
        isWithinGracePeriod,
        gracePeriodSeconds,
        gracePeriodRemainingSeconds: isWithinGracePeriod ? gracePeriodSeconds - stateDurationSeconds : 0,
        roundId: roundId.toString(),
        updatedAt: timestampToISO(updatedAt),
        answeredInRound: answeredInRound.toString(),
        feedAddress,
        network: credentials.network,
        feedType: 'L2 Sequencer Uptime',
        recommendation: isSequencerUp && !isWithinGracePeriod 
          ? 'Safe to use price feeds' 
          : isWithinGracePeriod 
            ? 'Grace period active - consider waiting before using stale-sensitive data'
            : 'Sequencer is down - price feeds may be stale',
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * List available PoR feeds
 */
export async function listPorFeeds(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const networkFeeds = POR_FEEDS[credentials.network] || {};
    
    const feeds = Object.entries(networkFeeds).map(([symbol, info]) => ({
      symbol,
      asset: info.asset,
      address: info.address,
      decimals: info.decimals
    }));
    
    return [{
      json: {
        feeds,
        totalFeeds: feeds.length,
        network: credentials.network,
        feedType: 'Proof of Reserve'
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * List available NFT floor price feeds
 */
export async function listNftFloorFeeds(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const networkFeeds = NFT_FLOOR_FEEDS[credentials.network] || {};
    
    const feeds = Object.entries(networkFeeds).map(([symbol, info]) => ({
      symbol,
      collection: info.collection,
      address: info.address,
      decimals: info.decimals
    }));
    
    return [{
      json: {
        feeds,
        totalFeeds: feeds.length,
        network: credentials.network,
        feedType: 'NFT Floor Price'
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * List L2 networks with sequencer uptime feeds
 */
export async function listSequencerFeeds(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const feeds = Object.entries(SEQUENCER_FEEDS).map(([network, address]) => ({
      network,
      address,
      feedType: 'L2 Sequencer Uptime'
    }));
    
    return [{
      json: {
        feeds,
        totalFeeds: feeds.length,
        description: 'L2 Sequencer uptime feeds monitor the availability of the L2 sequencer. When the sequencer is down, price feeds may become stale.',
        usage: 'Always check sequencer status before using price feed data on L2 networks for critical operations.'
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}
