/**
 * Automation Resource Actions
 * Operations for Chainlink Automation (formerly Keepers)
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { formatUnits } from 'ethers';
import {
  getChainlinkCredentials,
  getAutomationRegistryContract,
  getProvider,
  handleChainlinkError,
  getNetworkFromCredentials
} from '../transport/provider';

/**
 * Upkeep failure reasons
 */
const UPKEEP_FAILURE_REASONS: Record<number, string> = {
  0: 'NONE - No failure',
  1: 'UPKEEP_CANCELLED - Upkeep has been cancelled',
  2: 'UPKEEP_PAUSED - Upkeep is paused',
  3: 'TARGET_CHECK_REVERTED - checkUpkeep call reverted',
  4: 'UPKEEP_NOT_NEEDED - checkUpkeep returned false',
  5: 'PERFORM_DATA_EXCEEDS_LIMIT - performData exceeds size limit',
  6: 'INSUFFICIENT_BALANCE - Not enough LINK balance',
  7: 'CALLBACK_REVERTED - performUpkeep reverted',
  8: 'REVERT_DATA_EXCEEDS_LIMIT - Revert data exceeds limit',
  9: 'REGISTRY_PAUSED - Registry is paused'
};

/**
 * Get upkeep details by ID
 */
export async function getUpkeepDetails(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const registry = getAutomationRegistryContract(credentials);
    if (!registry) {
      throw new Error(`Automation Registry not available on ${credentials.network}`);
    }
    
    const upkeepId = this.getNodeParameter('upkeepId', index) as string;
    
    const upkeepInfo = await registry.getUpkeep(BigInt(upkeepId));
    
    // Parse the upkeep info tuple
    const {
      target,
      performGas,
      checkData,
      balance,
      admin,
      maxValidBlocknumber,
      lastPerformedBlockNumber,
      amountSpent,
      paused,
      offchainConfig
    } = upkeepInfo;
    
    const balanceFormatted = formatUnits(balance, 18);
    const amountSpentFormatted = formatUnits(amountSpent, 18);
    
    // Determine status
    let status = 'ACTIVE';
    if (paused) status = 'PAUSED';
    if (maxValidBlocknumber !== BigInt(0) && maxValidBlocknumber < BigInt(2 ** 32 - 1)) {
      status = 'CANCELLED';
    }
    
    return [{
      json: {
        upkeepId,
        status,
        target,
        admin,
        performGas: Number(performGas),
        checkData: checkData || '0x',
        balance: balanceFormatted,
        balanceRaw: balance.toString(),
        amountSpent: amountSpentFormatted,
        amountSpentRaw: amountSpent.toString(),
        lastPerformedBlockNumber: Number(lastPerformedBlockNumber),
        maxValidBlocknumber: maxValidBlocknumber.toString(),
        paused,
        hasOffchainConfig: offchainConfig && offchainConfig !== '0x',
        network: credentials.network,
        registryAddress: await registry.getAddress(),
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Check upkeep status (active/paused/cancelled)
 */
export async function checkUpkeepStatus(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const registry = getAutomationRegistryContract(credentials);
    if (!registry) {
      throw new Error(`Automation Registry not available on ${credentials.network}`);
    }
    
    const upkeepId = this.getNodeParameter('upkeepId', index) as string;
    
    const upkeepInfo = await registry.getUpkeep(BigInt(upkeepId));
    
    const { paused, maxValidBlocknumber, balance, target } = upkeepInfo;
    const balanceFormatted = formatUnits(balance, 18);
    
    // Determine detailed status
    let status = 'ACTIVE';
    const statusDetails: string[] = [];
    
    if (paused) {
      status = 'PAUSED';
      statusDetails.push('Upkeep is paused by admin');
    }
    
    if (maxValidBlocknumber !== BigInt(0) && maxValidBlocknumber < BigInt(2 ** 32 - 1)) {
      status = 'CANCELLED';
      statusDetails.push('Upkeep has been cancelled');
    }
    
    // Check if balance is low
    const minBalance = await registry.getMinBalance(BigInt(upkeepId));
    const minBalanceFormatted = formatUnits(minBalance, 18);
    const isLowBalance = balance < minBalance;
    
    if (isLowBalance) {
      statusDetails.push('Balance is below minimum required');
    }
    
    return [{
      json: {
        upkeepId,
        status,
        isActive: status === 'ACTIVE',
        isPaused: paused,
        isCancelled: status === 'CANCELLED',
        isLowBalance,
        target,
        balance: balanceFormatted,
        minimumBalance: minBalanceFormatted,
        balanceDeficit: isLowBalance ? formatUnits(minBalance - balance, 18) : '0',
        statusDetails,
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get upkeep LINK balance
 */
export async function getUpkeepBalance(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const registry = getAutomationRegistryContract(credentials);
    if (!registry) {
      throw new Error(`Automation Registry not available on ${credentials.network}`);
    }
    
    const upkeepId = this.getNodeParameter('upkeepId', index) as string;
    
    const balance = await registry.getBalance(BigInt(upkeepId));
    const minBalance = await registry.getMinBalance(BigInt(upkeepId));
    
    const balanceFormatted = formatUnits(balance, 18);
    const minBalanceFormatted = formatUnits(minBalance, 18);
    
    const isHealthy = balance >= minBalance;
    const balanceRatio = minBalance > BigInt(0) 
      ? Number(balance * BigInt(100) / minBalance) 
      : 100;
    
    return [{
      json: {
        upkeepId,
        balance: balanceFormatted,
        balanceRaw: balance.toString(),
        minimumBalance: minBalanceFormatted,
        minimumBalanceRaw: minBalance.toString(),
        isHealthy,
        balanceHealthPercent: Math.min(balanceRatio, 100),
        deficit: isHealthy ? '0' : formatUnits(minBalance - balance, 18),
        recommendation: isHealthy 
          ? 'Balance is healthy' 
          : `Add at least ${formatUnits(minBalance - balance, 18)} LINK to maintain upkeep`,
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get minimum balance required for upkeep
 */
export async function getMinimumBalance(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const registry = getAutomationRegistryContract(credentials);
    if (!registry) {
      throw new Error(`Automation Registry not available on ${credentials.network}`);
    }
    
    const upkeepId = this.getNodeParameter('upkeepId', index) as string;
    
    const minBalance = await registry.getMinBalance(BigInt(upkeepId));
    const balance = await registry.getBalance(BigInt(upkeepId));
    
    return [{
      json: {
        upkeepId,
        minimumBalance: formatUnits(minBalance, 18),
        minimumBalanceRaw: minBalance.toString(),
        currentBalance: formatUnits(balance, 18),
        hasEnoughBalance: balance >= minBalance,
        shortfall: balance < minBalance ? formatUnits(minBalance - balance, 18) : '0',
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Simulate upkeep (call checkUpkeep)
 */
export async function simulateUpkeep(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const registry = getAutomationRegistryContract(credentials);
    if (!registry) {
      throw new Error(`Automation Registry not available on ${credentials.network}`);
    }
    
    const upkeepId = this.getNodeParameter('upkeepId', index) as string;
    const simulateFrom = this.getNodeParameter('simulateFrom', index, '0x0000000000000000000000000000000000000000') as string;
    
    const [
      upkeepNeeded,
      performData,
      upkeepFailureReason,
      gasUsed,
      gasLimit,
      fastGasWei,
      linkNativeFeed
    ] = await registry.checkUpkeep(BigInt(upkeepId), simulateFrom);
    
    const failureReasonText = UPKEEP_FAILURE_REASONS[Number(upkeepFailureReason)] || 'UNKNOWN';
    
    return [{
      json: {
        upkeepId,
        upkeepNeeded,
        willPerform: upkeepNeeded && upkeepFailureReason === 0,
        performData: performData || '0x',
        upkeepFailureReason: Number(upkeepFailureReason),
        upkeepFailureReasonText: failureReasonText,
        gasUsed: gasUsed.toString(),
        gasLimit: gasLimit.toString(),
        fastGasWei: fastGasWei.toString(),
        fastGasGwei: formatUnits(fastGasWei, 'gwei'),
        linkNativeFeed: linkNativeFeed.toString(),
        simulatedFrom: simulateFrom,
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get global registry state
 */
export async function getRegistryState(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const registry = getAutomationRegistryContract(credentials);
    if (!registry) {
      throw new Error(`Automation Registry not available on ${credentials.network}`);
    }
    
    const [state, config, signers, transmitters, f] = await registry.getState();
    
    return [{
      json: {
        state: {
          nonce: Number(state.nonce),
          ownerLinkBalance: formatUnits(state.ownerLinkBalance, 18),
          expectedLinkBalance: formatUnits(state.expectedLinkBalance, 18),
          totalPremium: formatUnits(state.totalPremium, 18),
          numUpkeeps: state.numUpkeeps.toString(),
          configCount: Number(state.configCount),
          latestConfigBlockNumber: Number(state.latestConfigBlockNumber),
          latestConfigDigest: state.latestConfigDigest,
          latestEpoch: Number(state.latestEpoch),
          paused: state.paused
        },
        config: {
          paymentPremiumPPB: Number(config.paymentPremiumPPB),
          flatFeeMicroLink: Number(config.flatFeeMicroLink),
          flatFeeLINK: Number(config.flatFeeMicroLink) / 1000000,
          checkGasLimit: Number(config.checkGasLimit),
          stalenessSeconds: Number(config.stalenessSeconds),
          gasCeilingMultiplier: Number(config.gasCeilingMultiplier),
          minUpkeepSpend: formatUnits(config.minUpkeepSpend, 18),
          maxPerformGas: Number(config.maxPerformGas),
          maxCheckDataSize: Number(config.maxCheckDataSize),
          maxPerformDataSize: Number(config.maxPerformDataSize),
          maxRevertDataSize: Number(config.maxRevertDataSize),
          fallbackGasPrice: formatUnits(config.fallbackGasPrice, 'gwei'),
          fallbackLinkPrice: formatUnits(config.fallbackLinkPrice, 8),
          transcoder: config.transcoder,
          registrars: config.registrars,
          upkeepPrivilegeManager: config.upkeepPrivilegeManager
        },
        ocrConfig: {
          signerCount: signers.length,
          transmitterCount: transmitters.length,
          f: Number(f),
          faultTolerance: Number(f)
        },
        network: credentials.network,
        registryAddress: await registry.getAddress(),
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * Get recent upkeep performed events
 */
export async function getUpkeepHistory(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const credentials = await getChainlinkCredentials(this);
    
    const registry = getAutomationRegistryContract(credentials);
    if (!registry) {
      throw new Error(`Automation Registry not available on ${credentials.network}`);
    }
    
    const upkeepId = this.getNodeParameter('upkeepId', index) as string;
    const lookbackBlocks = this.getNodeParameter('lookbackBlocks', index, 10000) as number;
    
    const provider = getProvider(credentials);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - lookbackBlocks);
    
    // Filter for UpkeepPerformed events
    const filter = registry.filters.UpkeepPerformed(BigInt(upkeepId));
    const events = await registry.queryFilter(filter, fromBlock, currentBlock);
    
    const performances = await Promise.all(events.map(async (event) => {
      const block = await event.getBlock();
      const eventData = event as any;
      
      return {
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block ? new Date(block.timestamp * 1000).toISOString() : 'Unknown',
        success: eventData.args?.success,
        totalPayment: formatUnits(eventData.args?.totalPayment || 0, 18),
        gasUsed: eventData.args?.gasUsed?.toString(),
        gasOverhead: eventData.args?.gasOverhead?.toString()
      };
    }));
    
    return [{
      json: {
        upkeepId,
        totalPerformances: performances.length,
        performances: performances.reverse(), // Most recent first
        searchRange: {
          fromBlock,
          toBlock: currentBlock,
          blocksSearched: lookbackBlocks
        },
        network: credentials.network,
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}

/**
 * List available Automation networks
 */
export async function listAutomationNetworks(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  try {
    const { NETWORKS } = await import('../constants/networks');
    
    const automationNetworks = Object.entries(NETWORKS)
      .filter(([, config]) => config.automationRegistry)
      .map(([key, config]) => ({
        network: key,
        name: config.name,
        registryAddress: config.automationRegistry,
        isTestnet: config.isTestnet
      }));
    
    return [{
      json: {
        networks: automationNetworks,
        totalNetworks: automationNetworks.length,
        mainnetCount: automationNetworks.filter(n => !n.isTestnet).length,
        testnetCount: automationNetworks.filter(n => n.isTestnet).length,
        description: 'Chainlink Automation enables smart contract automation with decentralized, reliable execution',
        useCases: [
          'DEX limit orders',
          'Liquidation protection',
          'Yield harvesting',
          'Cross-chain bridging triggers',
          'Rebasing token operations',
          'DAO proposal execution'
        ],
        timestamp: new Date().toISOString()
      }
    }];
  } catch (error) {
    handleChainlinkError(error);
  }
}
