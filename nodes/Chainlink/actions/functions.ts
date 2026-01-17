/**
 * Functions Resource Actions
 * Operations for Chainlink Functions (Serverless Compute)
 */

import { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { formatUnits, toUtf8String, hexlify, toUtf8Bytes } from 'ethers';
import {
  getChainlinkCredentials,
  getFunctionsRouterContract,
  getProvider,
  handleChainlinkError
} from '../transport/provider';

/**
 * Functions Router Addresses by Network
 */
const FUNCTIONS_ROUTERS: Record<string, string> = {
  'ethereum-mainnet': '0x65Dcc24F8ff9e51F10DCc7Ed1e4e2A61e6E14bd6',
  'ethereum-sepolia': '0xb83E47C2bC239B3bf370bc41e1459A34b41238D0',
  'polygon-mainnet': '0xdc2AAF042Aeff2E68B3e8E33F19e4B9fA7C73F10',
  'polygon-amoy': '0xC22a79eBA640940ABB6dF0f7982cc119578E11De',
  'arbitrum-mainnet': '0x97083E831F8F0638855e2A515c90EdCF158DF238',
  'arbitrum-sepolia': '0x234a5fb5Bd614a7AA2FfAB244D603BFA0E2BB6b9',
  'avalanche-mainnet': '0x9f82a6A0758517FD0AfA463820F586999AF314a0',
  'avalanche-fuji': '0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0',
  'base-mainnet': '0xf9B8fc078197181C841c296C876945aaa425B278',
  'base-sepolia': '0xf9B8fc078197181C841c296C876945aaa425B278'
};

/**
 * DON IDs by Network
 */
const DON_IDS: Record<string, string> = {
  'ethereum-mainnet': 'fun-ethereum-mainnet-1',
  'ethereum-sepolia': 'fun-ethereum-sepolia-1',
  'polygon-mainnet': 'fun-polygon-mainnet-1',
  'polygon-amoy': 'fun-polygon-amoy-1',
  'arbitrum-mainnet': 'fun-arbitrum-mainnet-1',
  'arbitrum-sepolia': 'fun-arbitrum-sepolia-1',
  'avalanche-mainnet': 'fun-avalanche-mainnet-1',
  'avalanche-fuji': 'fun-avalanche-fuji-1',
  'base-mainnet': 'fun-base-mainnet-1',
  'base-sepolia': 'fun-base-sepolia-1'
};

/**
 * Get Functions subscription info
 */
export async function getSubscriptionInfo(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const routerAddress = FUNCTIONS_ROUTERS[credentials.network];
    if (!routerAddress) {
      throw new Error(`Chainlink Functions not available on ${credentials.network}`);
    }
    
    const router = getFunctionsRouterContract(routerAddress, credentials);
    const subscriptionId = this.getNodeParameter('subscriptionId', index) as number;
    
    const [balance, owner, requestedOwner, consumers] = await router.getSubscription(subscriptionId);
    
    return [{
      json: {
        subscriptionId,
        balance: formatUnits(balance, 18),
        balanceRaw: balance.toString(),
        owner,
        requestedOwner: requestedOwner !== '0x0000000000000000000000000000000000000000' ? requestedOwner : null,
        hasPendingOwnerTransfer: requestedOwner !== '0x0000000000000000000000000000000000000000',
        consumers: consumers.map((c: string) => c),
        consumerCount: consumers.length,
        routerAddress,
        donId: DON_IDS[credentials.network] || 'Unknown',
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get DON (Decentralized Oracle Network) configuration
 */
export async function getDONConfiguration(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const routerAddress = FUNCTIONS_ROUTERS[credentials.network];
    if (!routerAddress) {
      throw new Error(`Chainlink Functions not available on ${credentials.network}`);
    }
    
    const router = getFunctionsRouterContract(routerAddress, credentials);
    const donId = DON_IDS[credentials.network];
    
    // Get router config
    const [
      maxConsumersPerSubscription,
      adminFee,
      handleOracleFulfillmentSelector,
      gasForCallExactCheck,
      maxCallbackGasLimits
    ] = await router.getConfig();
    
    return [{
      json: {
        donId,
        routerAddress,
        config: {
          maxConsumersPerSubscription: Number(maxConsumersPerSubscription),
          adminFee: formatUnits(adminFee, 18),
          adminFeeRaw: adminFee.toString(),
          handleOracleFulfillmentSelector,
          gasForCallExactCheck: Number(gasForCallExactCheck),
          maxCallbackGasLimits: maxCallbackGasLimits.map((limit: bigint) => Number(limit))
        },
        capabilities: [
          'HTTP Requests (GET, POST)',
          'JavaScript Execution',
          'Secrets Management',
          'Custom Computation'
        ],
        limitations: [
          'Execution time limit: 10 seconds',
          'Memory limit: 128 MB',
          'HTTP response size: 2 MB',
          'No persistent storage between calls'
        ],
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Estimate Functions request cost
 */
export async function estimateRequestCost(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const routerAddress = FUNCTIONS_ROUTERS[credentials.network];
    if (!routerAddress) {
      throw new Error(`Chainlink Functions not available on ${credentials.network}`);
    }
    
    const callbackGasLimit = this.getNodeParameter('callbackGasLimit', index, 300000) as number;
    
    // Get current gas price
    const provider = getProvider(credentials);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    
    // Estimate based on typical Functions overhead
    const baseOverhead = BigInt(100000); // Base gas overhead
    const totalGas = baseOverhead + BigInt(callbackGasLimit);
    const estimatedCostWei = totalGas * gasPrice;
    
    // Add premium (typically 1.1x - 1.5x)
    const premiumMultiplier = BigInt(120); // 1.2x
    const estimatedWithPremium = (estimatedCostWei * premiumMultiplier) / BigInt(100);
    
    return [{
      json: {
        callbackGasLimit,
        gasPrice: formatUnits(gasPrice, 'gwei'),
        estimatedCostNative: formatUnits(estimatedWithPremium, 18),
        estimatedCostWei: estimatedWithPremium.toString(),
        breakdown: {
          baseOverhead: Number(baseOverhead),
          callbackGas: callbackGasLimit,
          totalGas: Number(totalGas),
          premiumPercent: 20
        },
        notes: [
          'Actual cost depends on execution complexity and gas price at fulfillment',
          'Subscription must have sufficient LINK balance',
          'Cost paid in LINK token',
          'Complex JavaScript executions may use more gas'
        ],
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Decode Functions response
 */
export async function decodeResponse(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const responseHex = this.getNodeParameter('responseHex', index) as string;
    const responseType = this.getNodeParameter('responseType', index, 'string') as string;
    
    let decodedValue: unknown;
    let decodedString: string | null = null;
    
    // Clean the hex string
    const cleanHex = responseHex.startsWith('0x') ? responseHex : `0x${responseHex}`;
    
    try {
      switch (responseType) {
        case 'string':
          decodedString = toUtf8String(cleanHex);
          decodedValue = decodedString;
          break;
        
        case 'uint256':
          decodedValue = BigInt(cleanHex).toString();
          break;
        
        case 'int256':
          // Handle signed integers
          const bigIntValue = BigInt(cleanHex);
          const maxPositive = BigInt(2) ** BigInt(255) - BigInt(1);
          if (bigIntValue > maxPositive) {
            decodedValue = (bigIntValue - BigInt(2) ** BigInt(256)).toString();
          } else {
            decodedValue = bigIntValue.toString();
          }
          break;
        
        case 'bytes32':
          decodedValue = cleanHex.padEnd(66, '0').slice(0, 66);
          // Also try to decode as string
          try {
            decodedString = toUtf8String(cleanHex).replace(/\0/g, '');
          } catch {
            // Not a valid UTF-8 string
          }
          break;
        
        case 'json':
          decodedString = toUtf8String(cleanHex);
          decodedValue = JSON.parse(decodedString);
          break;
        
        default:
          decodedValue = cleanHex;
      }
    } catch (decodeError) {
      throw new Error(`Failed to decode response as ${responseType}: ${decodeError}`);
    }
    
    return [{
      json: {
        originalHex: cleanHex,
        responseType,
        decodedValue: decodedValue as string | number | object,
        decodedString,
        byteLength: (cleanHex.length - 2) / 2,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get supported Functions networks
 */
export async function getSupportedNetworks(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const networks = Object.entries(FUNCTIONS_ROUTERS).map(([network, router]) => ({
      network,
      routerAddress: router,
      donId: DON_IDS[network] || 'Unknown',
      isTestnet: network.includes('sepolia') || network.includes('fuji') || network.includes('amoy')
    }));
    
    const mainnets = networks.filter(n => !n.isTestnet);
    const testnets = networks.filter(n => n.isTestnet);
    
    return [{
      json: {
        networks,
        mainnets,
        testnets,
        totalNetworks: networks.length,
        mainnetCount: mainnets.length,
        testnetCount: testnets.length,
        description: 'Chainlink Functions enables serverless JavaScript/TypeScript execution with oracle capabilities',
        useCases: [
          'API data fetching and processing',
          'Off-chain computation',
          'Custom oracle logic',
          'Web2 to Web3 bridging',
          'Complex data transformations'
        ],
        documentation: 'https://docs.chain.link/chainlink-functions',
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Validate Functions source code
 */
export async function validateSourceCode(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const sourceCode = this.getNodeParameter('sourceCode', index) as string;
    
    const issues: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation checks
    if (!sourceCode.trim()) {
      issues.push('Source code is empty');
    }
    
    // Check for return statement
    if (!sourceCode.includes('return')) {
      issues.push('Source code must include a return statement');
    }
    
    // Check for Functions.encodeString or Functions.encodeUint256
    if (!sourceCode.includes('Functions.encode')) {
      warnings.push('Consider using Functions.encodeString() or Functions.encodeUint256() for return values');
    }
    
    // Check for async patterns
    if (sourceCode.includes('await') && !sourceCode.includes('async')) {
      issues.push('Using await without async function declaration');
    }
    
    // Check for common forbidden patterns
    const forbiddenPatterns = [
      { pattern: 'process.', message: 'Node.js process object is not available' },
      { pattern: 'require(', message: 'require() is not available, use Functions.makeHttpRequest' },
      { pattern: 'import ', message: 'ES6 imports are not available' },
      { pattern: '__dirname', message: '__dirname is not available' },
      { pattern: 'fs.', message: 'File system operations are not available' }
    ];
    
    for (const { pattern, message } of forbiddenPatterns) {
      if (sourceCode.includes(pattern)) {
        issues.push(message);
      }
    }
    
    // Check source code size
    const sizeBytes = new TextEncoder().encode(sourceCode).length;
    if (sizeBytes > 50000) {
      issues.push('Source code exceeds 50KB limit');
    } else if (sizeBytes > 40000) {
      warnings.push('Source code is approaching 50KB limit');
    }
    
    // Encode source for transmission
    const encodedSource = hexlify(toUtf8Bytes(sourceCode));
    
    return [{
      json: {
        isValid: issues.length === 0,
        issues,
        warnings,
        sourceCodeSize: sizeBytes,
        encodedSource,
        maxSize: 50000,
        tips: [
          'Use Functions.makeHttpRequest() for API calls',
          'Return encoded values using Functions.encodeString() or Functions.encodeUint256()',
          'Secrets are accessed via secrets object',
          'Arguments are passed via args array',
          'Execution timeout is 10 seconds'
        ],
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}
