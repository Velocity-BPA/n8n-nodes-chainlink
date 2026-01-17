/**
 * Chainlink Network Configuration Constants
 * Defines supported EVM networks where Chainlink services operate
 */

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  linkToken: string;
  vrfCoordinator?: string;
  automationRegistry?: string;
  ccipRouter?: string;
  feedRegistry?: string;
  isTestnet: boolean;
}

/**
 * Supported Networks for Chainlink Services
 * Each network includes default RPC URLs and contract addresses
 */
export const NETWORKS: Record<string, NetworkConfig> = {
  // Ethereum Networks
  'ethereum-mainnet': {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    linkToken: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    vrfCoordinator: '0x271682DEB8C4E0901D1a1550aD2e64D568E69909',
    automationRegistry: '0x6593c7De001fC8542bB1703532EE1E5aA0D458fD',
    ccipRouter: '0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D',
    feedRegistry: '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf',
    isTestnet: false
  },
  'ethereum-sepolia': {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    vrfCoordinator: '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625',
    automationRegistry: '0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad',
    ccipRouter: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    isTestnet: true
  },

  // Polygon Networks
  'polygon-mainnet': {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    linkToken: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
    vrfCoordinator: '0xAE975071Be8F8eE67addBC1A82488F1C24858067',
    automationRegistry: '0x08a8eea76D2395807Ce7D1FC942382515469cCA1',
    ccipRouter: '0x849c5ED5a80F5B408Dd4969b78c2C8fdf0565Bfe',
    isTestnet: false
  },
  'polygon-amoy': {
    name: 'Polygon Amoy',
    chainId: 80002,
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
    linkToken: '0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904',
    vrfCoordinator: '0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2',
    ccipRouter: '0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2',
    isTestnet: true
  },

  // Arbitrum Networks
  'arbitrum-mainnet': {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    linkToken: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
    vrfCoordinator: '0x41034678D6C633D8a95c75e1138A360a28bA15d1',
    automationRegistry: '0x75c0530885F385721fddA23C539AF3701d6183D4',
    ccipRouter: '0x141fa059441E0ca23ce184B6A78bafD2A517DdE8',
    isTestnet: false
  },
  'arbitrum-sepolia': {
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    linkToken: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
    vrfCoordinator: '0x50d47e4142598E3411aA864e08a44284e471AC6f',
    ccipRouter: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
    isTestnet: true
  },

  // Optimism Networks
  'optimism-mainnet': {
    name: 'Optimism Mainnet',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    linkToken: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
    automationRegistry: '0x75c0530885F385721fddA23C539AF3701d6183D4',
    ccipRouter: '0x3206695CaE29952f4b0c22a169725a865bc8Ce0f',
    isTestnet: false
  },
  'optimism-sepolia': {
    name: 'Optimism Sepolia',
    chainId: 11155420,
    rpcUrl: 'https://sepolia.optimism.io',
    explorerUrl: 'https://sepolia-optimism.etherscan.io',
    linkToken: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
    ccipRouter: '0x114A20A10b43D4115e5aeef7345a1A71d2a60C57',
    isTestnet: true
  },

  // Avalanche Networks
  'avalanche-mainnet': {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    linkToken: '0x5947BB275c521040051D82396192181b413227A3',
    vrfCoordinator: '0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634',
    automationRegistry: '0x7f00a3Cd4590009C349192510D51F8e6312E08CB',
    ccipRouter: '0xF4c7E640EdA248ef95972845a62bdC74237805dB',
    isTestnet: false
  },
  'avalanche-fuji': {
    name: 'Avalanche Fuji',
    chainId: 43113,
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    linkToken: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846',
    vrfCoordinator: '0x2eD832Ba664535e5886b75D64C46EB9a228C2610',
    ccipRouter: '0xF694E193200268f9a4868e4Aa017A0118C9a8177',
    isTestnet: true
  },

  // BNB Chain Networks
  'bnb-mainnet': {
    name: 'BNB Chain Mainnet',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    linkToken: '0x404460C6A5EdE2D891e8297795264fDe62ADBB75',
    vrfCoordinator: '0xc587d9053cd1118f25F645F9E08BB98c9712A4EE',
    automationRegistry: '0x7B3EC232b08BD7b4b3305BE0C044D907B2DF960B',
    ccipRouter: '0x34B03Cb9086d7D758AC55af71584F81A598759FE',
    isTestnet: false
  },
  'bnb-testnet': {
    name: 'BNB Chain Testnet',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com',
    linkToken: '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06',
    vrfCoordinator: '0x6A2AAd07396B36Fe02a22b33cf443582f682c82f',
    ccipRouter: '0xE1053aE1857476f36A3C62580FF9b016E8EE8F6f',
    isTestnet: true
  },

  // Base Networks
  'base-mainnet': {
    name: 'Base Mainnet',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    linkToken: '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196',
    automationRegistry: '0xE226D5aCae908252CcA3F6CEFa577527650a9e1e',
    ccipRouter: '0x881e3A65B4d4a04dD529061dd0071cf975F58bCD',
    isTestnet: false
  },
  'base-sepolia': {
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    linkToken: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
    vrfCoordinator: '0xD21ae5C71C5D1E9F1E5Edc6e9D8CfF4B8B8E5Bb1',
    ccipRouter: '0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93',
    isTestnet: true
  },

  // Custom network option
  'custom': {
    name: 'Custom Network',
    chainId: 0,
    rpcUrl: '',
    explorerUrl: '',
    linkToken: '',
    isTestnet: false
  }
};

/**
 * Network selection options for n8n UI dropdown
 */
export const NETWORK_OPTIONS = Object.entries(NETWORKS).map(([value, config]) => ({
  name: config.name,
  value
}));

/**
 * Get network configuration by network key
 */
export function getNetworkConfig(networkKey: string): NetworkConfig | undefined {
  return NETWORKS[networkKey];
}

/**
 * Get network configuration by chain ID
 */
export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
}
