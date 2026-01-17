import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Chainlink Functions Credentials
 * Advanced credentials for Chainlink Functions (serverless compute)
 */
export class ChainlinkFunctions implements ICredentialType {
  name = 'chainlinkFunctionsApi';
  displayName = 'Chainlink Functions';
  documentationUrl = 'https://docs.chain.link/chainlink-functions';
  
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      default: 'ethereum-sepolia',
      description: 'Select the network where Chainlink Functions is deployed',
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
        // Avalanche
        { name: 'Avalanche C-Chain', value: 'avalanche-mainnet' },
        { name: 'Avalanche Fuji (Testnet)', value: 'avalanche-fuji' },
        // Base
        { name: 'Base Mainnet', value: 'base-mainnet' },
        { name: 'Base Sepolia (Testnet)', value: 'base-sepolia' },
      ],
    },
    {
      displayName: 'RPC URL',
      name: 'rpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://eth-sepolia.g.alchemy.com/v2/your-api-key',
      description: 'RPC endpoint URL. For production, use a dedicated RPC provider.',
    },
    {
      displayName: 'Subscription ID',
      name: 'subscriptionId',
      type: 'number',
      default: 0,
      description: 'Your Chainlink Functions subscription ID. Create one at functions.chain.link',
      required: true,
    },
    {
      displayName: 'DON ID',
      name: 'donId',
      type: 'string',
      default: 'fun-ethereum-sepolia-1',
      placeholder: 'fun-ethereum-mainnet-1',
      description: 'Decentralized Oracle Network ID for Functions. Format: fun-{network}-{version}',
      hint: 'Find DON IDs in the Chainlink Functions documentation',
    },
    {
      displayName: 'Router Address',
      name: 'routerAddress',
      type: 'string',
      default: '',
      placeholder: '0x...',
      description: 'Chainlink Functions Router contract address for the selected network. Leave empty to use default.',
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
      description: 'Private key for signing Functions requests. Must be a subscription consumer.',
      required: true,
    },
    {
      displayName: 'Gateway URLs',
      name: 'gatewayUrls',
      type: 'string',
      default: '',
      placeholder: 'https://01.functions-gateway.chain.link/,https://02.functions-gateway.chain.link/',
      description: 'Comma-separated list of Chainlink Functions gateway URLs. Leave empty to use defaults.',
    },
    {
      displayName: 'Encryption Secret',
      name: 'encryptionSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Optional encryption secret for encrypting request secrets. Must be 32+ characters.',
    },
  ];
}
