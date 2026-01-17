import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Chainlink RPC Credentials
 * Supports multiple EVM networks where Chainlink operates
 */
export class ChainlinkRpc implements ICredentialType {
  name = 'chainlinkRpcApi';
  displayName = 'Chainlink RPC';
  documentationUrl = 'https://docs.chain.link/';
  
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      default: 'ethereum-mainnet',
      description: 'Select the EVM network to connect to',
      options: [
        // Ethereum
        { name: 'Ethereum Mainnet', value: 'ethereum-mainnet' },
        { name: 'Ethereum Sepolia (Testnet)', value: 'ethereum-sepolia' },
        // Polygon
        { name: 'Polygon Mainnet', value: 'polygon-mainnet' },
        { name: 'Polygon Amoy (Testnet)', value: 'polygon-amoy' },
        // Arbitrum
        { name: 'Arbitrum One', value: 'arbitrum-mainnet' },
        { name: 'Arbitrum Sepolia (Testnet)', value: 'arbitrum-sepolia' },
        // Optimism
        { name: 'Optimism Mainnet', value: 'optimism-mainnet' },
        { name: 'Optimism Sepolia (Testnet)', value: 'optimism-sepolia' },
        // Avalanche
        { name: 'Avalanche C-Chain', value: 'avalanche-mainnet' },
        { name: 'Avalanche Fuji (Testnet)', value: 'avalanche-fuji' },
        // BNB Chain
        { name: 'BNB Chain Mainnet', value: 'bnb-mainnet' },
        { name: 'BNB Chain Testnet', value: 'bnb-testnet' },
        // Base
        { name: 'Base Mainnet', value: 'base-mainnet' },
        { name: 'Base Sepolia (Testnet)', value: 'base-sepolia' },
        // Custom
        { name: 'Custom Network', value: 'custom' },
      ],
    },
    {
      displayName: 'RPC URL',
      name: 'rpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
      description: 'Custom RPC endpoint URL. Leave empty to use default public RPC for the selected network. For production, use a dedicated RPC provider (Alchemy, Infura, QuickNode).',
      hint: 'Using a dedicated RPC provider improves reliability and performance',
    },
    {
      displayName: 'Chain ID',
      name: 'chainId',
      type: 'number',
      default: 1,
      description: 'The chain ID of the network (required for custom networks)',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: '0x...',
      description: 'Private key for write operations (LINK transfers, etc.). Optional for read-only operations. Never share or expose this key.',
      hint: 'Only required for operations that need to sign transactions',
    },
  ];

  // Connection test
  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.rpcUrl || "https://eth.llamarpc.com"}}',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    },
  };
}
