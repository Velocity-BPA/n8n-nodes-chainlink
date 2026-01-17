/**
 * Chainlink Price Feed Addresses
 * Curated list of common price feed addresses per network
 */

export interface PriceFeedInfo {
  address: string;
  pair: string;
  decimals: number;
  category: 'crypto' | 'forex' | 'commodity' | 'equity' | 'other';
}

export type NetworkFeeds = Record<string, PriceFeedInfo>;

/**
 * Price Feed Addresses by Network
 */
export const PRICE_FEEDS: Record<string, NetworkFeeds> = {
  'ethereum-mainnet': {
    'ETH/USD': {
      address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDC/USD': {
      address: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      pair: 'USDC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDT/USD': {
      address: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
      pair: 'USDT / USD',
      decimals: 8,
      category: 'crypto'
    },
    'DAI/USD': {
      address: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
      pair: 'DAI / USD',
      decimals: 8,
      category: 'crypto'
    },
    'AAVE/USD': {
      address: '0x547a514d5e3769680Ce22B2361c10Ea13619e8a9',
      pair: 'AAVE / USD',
      decimals: 8,
      category: 'crypto'
    },
    'UNI/USD': {
      address: '0x553303d460EE0afB37EdFf9bE42922D8FF63220e',
      pair: 'UNI / USD',
      decimals: 8,
      category: 'crypto'
    },
    'MATIC/USD': {
      address: '0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676',
      pair: 'MATIC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'SOL/USD': {
      address: '0x4ffC43a60e009B551865A93d232E33Fce9f01507',
      pair: 'SOL / USD',
      decimals: 8,
      category: 'crypto'
    },
    'AVAX/USD': {
      address: '0xFF3EEb22B22c8F9c7ACf2a7d5d81b67E3a07f7CA',
      pair: 'AVAX / USD',
      decimals: 8,
      category: 'crypto'
    },
    'EUR/USD': {
      address: '0xb49f677943BC038e9857d61E7d053CaA2C1734C1',
      pair: 'EUR / USD',
      decimals: 8,
      category: 'forex'
    },
    'GBP/USD': {
      address: '0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5',
      pair: 'GBP / USD',
      decimals: 8,
      category: 'forex'
    },
    'JPY/USD': {
      address: '0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3',
      pair: 'JPY / USD',
      decimals: 8,
      category: 'forex'
    },
    'XAU/USD': {
      address: '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6',
      pair: 'XAU / USD',
      decimals: 8,
      category: 'commodity'
    },
    'XAG/USD': {
      address: '0x379589227b15F1a12195D3f2d90bBc9F31f95235',
      pair: 'XAG / USD',
      decimals: 8,
      category: 'commodity'
    },
    'FAST_GAS': {
      address: '0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C',
      pair: 'Fast Gas / Gwei',
      decimals: 0,
      category: 'other'
    }
  },
  
  'ethereum-sepolia': {
    'ETH/USD': {
      address: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0xc59E3633BAAC79493d908e63626716e204A45EdF',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDC/USD': {
      address: '0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E',
      pair: 'USDC / USD',
      decimals: 8,
      category: 'crypto'
    }
  },

  'polygon-mainnet': {
    'MATIC/USD': {
      address: '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
      pair: 'MATIC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'ETH/USD': {
      address: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0xc907E116054Ad103354f2D350FD2514433D57F6f',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0xd9FFdb71EbE7496cC440152d43986Aae0AB76665',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDC/USD': {
      address: '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
      pair: 'USDC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDT/USD': {
      address: '0x0A6513e40db6EB1b165753AD52E80663aeA50545',
      pair: 'USDT / USD',
      decimals: 8,
      category: 'crypto'
    },
    'AAVE/USD': {
      address: '0x72484B12719E23115761D5DA1646945632979bB6',
      pair: 'AAVE / USD',
      decimals: 8,
      category: 'crypto'
    }
  },

  'polygon-amoy': {
    'MATIC/USD': {
      address: '0x001382149eBa3441043c1c66972b4772963f5D43',
      pair: 'MATIC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'ETH/USD': {
      address: '0xF0d50568e3A7e8259E16663972b11910F89BD8e7',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0xe7656e23fE8077D438aEfbec2fAbDf2D8e070C4f',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0xc2e2848e28B9fE430Ab44F55a8437a33802a219C',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    }
  },

  'arbitrum-mainnet': {
    'ETH/USD': {
      address: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x6ce185860a4963106506C203335A583Af92a5538',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0x86E53CF1B870786351Da77A57575e79CB55812CB',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    },
    'ARB/USD': {
      address: '0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6',
      pair: 'ARB / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDC/USD': {
      address: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
      pair: 'USDC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDT/USD': {
      address: '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7',
      pair: 'USDT / USD',
      decimals: 8,
      category: 'crypto'
    },
    'SEQUENCER_UPTIME': {
      address: '0xFdB631F5EE196F0ed6FAa767959853A9F217697D',
      pair: 'Sequencer Uptime',
      decimals: 0,
      category: 'other'
    }
  },

  'arbitrum-sepolia': {
    'ETH/USD': {
      address: '0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    }
  },

  'optimism-mainnet': {
    'ETH/USD': {
      address: '0x13e3Ee699D1909E989722E753853AE30b17e08c5',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0xCc232dcFAAE6354cE191Bd574108c1aD03f86ceE',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    },
    'OP/USD': {
      address: '0x0D276FC14719f9292D5C1eA2198673d1f4269246',
      pair: 'OP / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDC/USD': {
      address: '0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3',
      pair: 'USDC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'SEQUENCER_UPTIME': {
      address: '0x371EAD81c9102C9BF4874A9075FFFf170F2Ee389',
      pair: 'Sequencer Uptime',
      decimals: 0,
      category: 'other'
    }
  },

  'optimism-sepolia': {
    'ETH/USD': {
      address: '0x61Ec26aA57019C486B10502285c5A3D4A4750AD7',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x3015aa11f5c2D4Bd0f891E708C8927961b38cE7D',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    }
  },

  'avalanche-mainnet': {
    'AVAX/USD': {
      address: '0x0A77230d17318075983913bC2145DB16C7366156',
      pair: 'AVAX / USD',
      decimals: 8,
      category: 'crypto'
    },
    'ETH/USD': {
      address: '0x976B3D034E162d8bD72D6b9C989d545b839003b0',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0x49ccd9ca821EfEab2b98c60dC60F518E765EDe9a',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDC/USD': {
      address: '0xF096872672F44d6EBA71458D74fe67F9a77a23B9',
      pair: 'USDC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDT/USD': {
      address: '0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a',
      pair: 'USDT / USD',
      decimals: 8,
      category: 'crypto'
    }
  },

  'avalanche-fuji': {
    'AVAX/USD': {
      address: '0x5498BB86BC934c8D34FDA08E81D444153d0D06aD',
      pair: 'AVAX / USD',
      decimals: 8,
      category: 'crypto'
    },
    'ETH/USD': {
      address: '0x86d67c3D38D2bCeE722E601025C25a575021c6EA',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x31CF013A08c6Ac228C94551d535d5BAfE19c602a',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0x34C4c526902d88a3Aa98DB8a9b802603EB1E3470',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    }
  },

  'bnb-mainnet': {
    'BNB/USD': {
      address: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
      pair: 'BNB / USD',
      decimals: 8,
      category: 'crypto'
    },
    'ETH/USD': {
      address: '0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0xca236E327F629f9Fc2c30A4E95775EbF0B89fac8',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDC/USD': {
      address: '0x51597f405303C4377E36123cBc172b13269EA163',
      pair: 'USDC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDT/USD': {
      address: '0xB97Ad0E74fa7d920791E90258A6E2085088b4320',
      pair: 'USDT / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BUSD/USD': {
      address: '0xcBb98864Ef56E9042e7d2efef76141f15731B82f',
      pair: 'BUSD / USD',
      decimals: 8,
      category: 'crypto'
    }
  },

  'bnb-testnet': {
    'BNB/USD': {
      address: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
      pair: 'BNB / USD',
      decimals: 8,
      category: 'crypto'
    },
    'ETH/USD': {
      address: '0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x5741306c21795FdCBb9b265Ea0255F499DFe515C',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0x1B329402Cb1825C6F30A0d92aB9E2862BE47333f',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    }
  },

  'base-mainnet': {
    'ETH/USD': {
      address: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x64c911996D3c6aC71E9b8932F89C3fC7Bf4c8B5e',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0x17CAb8FE31E32f08326e5E27412894e49B0f9D65',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    },
    'USDC/USD': {
      address: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
      pair: 'USDC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'CBETH/USD': {
      address: '0xd7818272B9e248357d13057AAb0B417aF31E817d',
      pair: 'cbETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'SEQUENCER_UPTIME': {
      address: '0xBCF85224fc0756B9Fa45aA7892530B47e10b6433',
      pair: 'Sequencer Uptime',
      decimals: 0,
      category: 'other'
    }
  },

  'base-sepolia': {
    'ETH/USD': {
      address: '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1',
      pair: 'ETH / USD',
      decimals: 8,
      category: 'crypto'
    },
    'BTC/USD': {
      address: '0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298',
      pair: 'BTC / USD',
      decimals: 8,
      category: 'crypto'
    },
    'LINK/USD': {
      address: '0xb113F5A928BCfF189C998ab20d753a47F9dE5A61',
      pair: 'LINK / USD',
      decimals: 8,
      category: 'crypto'
    }
  }
};

/**
 * Common Feed Registry Token Addresses (Ethereum Mainnet)
 * Used with the Feed Registry for base/quote lookups
 */
export const FEED_REGISTRY_TOKENS = {
  // Base tokens
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  BTC: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  
  // Quote currencies
  USD: '0x0000000000000000000000000000000000000348',
  EUR: '0x000000000000000000000000000000000000007f',
  GBP: '0x000000000000000000000000000000000000033a',
  JPY: '0x0000000000000000000000000000000000000188'
};

/**
 * Get price feed info by network and pair
 */
export function getPriceFeed(networkKey: string, pair: string): PriceFeedInfo | undefined {
  const networkFeeds = PRICE_FEEDS[networkKey];
  if (!networkFeeds) return undefined;
  return networkFeeds[pair];
}

/**
 * Get all price feeds for a network
 */
export function getNetworkPriceFeeds(networkKey: string): NetworkFeeds | undefined {
  return PRICE_FEEDS[networkKey];
}

/**
 * Get price feed dropdown options for n8n UI
 */
export function getPriceFeedOptions(networkKey: string): Array<{ name: string; value: string }> {
  const feeds = PRICE_FEEDS[networkKey];
  if (!feeds) return [];
  
  return Object.entries(feeds).map(([pair, info]) => ({
    name: `${pair} (${info.category})`,
    value: pair
  }));
}
