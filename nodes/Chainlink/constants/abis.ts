/**
 * Chainlink Contract ABIs
 * Minimal ABIs containing only the functions we need to interact with
 */

/**
 * AggregatorV3Interface - Standard Price Feed ABI
 * Used for reading price data from Chainlink Data Feeds
 */
export const AGGREGATOR_V3_ABI = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'description',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint80', name: '_roundId', type: 'uint80' }],
    name: 'getRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'int256', name: 'current', type: 'int256' },
      { indexed: true, internalType: 'uint256', name: 'roundId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'updatedAt', type: 'uint256' }
    ],
    name: 'AnswerUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'roundId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'startedBy', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'startedAt', type: 'uint256' }
    ],
    name: 'NewRound',
    type: 'event'
  }
] as const;

/**
 * Feed Registry ABI - For accessing feeds via registry (Ethereum mainnet)
 */
export const FEED_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' }
    ],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' }
    ],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' }
    ],
    name: 'description',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' }
    ],
    name: 'getFeed',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * VRF Coordinator V2 ABI
 */
export const VRF_COORDINATOR_V2_ABI = [
  {
    inputs: [{ internalType: 'uint64', name: 'subId', type: 'uint64' }],
    name: 'getSubscription',
    outputs: [
      { internalType: 'uint96', name: 'balance', type: 'uint96' },
      { internalType: 'uint64', name: 'reqCount', type: 'uint64' },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address[]', name: 'consumers', type: 'address[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'requestId', type: 'uint256' }],
    name: 'getRequestConfig',
    outputs: [
      { internalType: 'uint16', name: 'minimumRequestConfirmations', type: 'uint16' },
      { internalType: 'uint32', name: 'maxGasLimit', type: 'uint32' },
      { internalType: 'bytes32[]', name: 's_provingKeyHashes', type: 'bytes32[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getConfig',
    outputs: [
      { internalType: 'uint16', name: 'minimumRequestConfirmations', type: 'uint16' },
      { internalType: 'uint32', name: 'maxGasLimit', type: 'uint32' },
      { internalType: 'uint32', name: 'stalenessSeconds', type: 'uint32' },
      { internalType: 'uint32', name: 'gasAfterPaymentCalculation', type: 'uint32' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint32', name: 'callbackGasLimit', type: 'uint32' },
      { internalType: 'uint32', name: 'numWords', type: 'uint32' }
    ],
    name: 'estimateRequestPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'requestId', type: 'uint256' },
      { indexed: false, internalType: 'uint256[]', name: 'randomWords', type: 'uint256[]' }
    ],
    name: 'RandomWordsFulfilled',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'keyHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'requestId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'preSeed', type: 'uint256' },
      { indexed: true, internalType: 'uint64', name: 'subId', type: 'uint64' },
      { indexed: false, internalType: 'uint16', name: 'minimumRequestConfirmations', type: 'uint16' },
      { indexed: false, internalType: 'uint32', name: 'callbackGasLimit', type: 'uint32' },
      { indexed: false, internalType: 'uint32', name: 'numWords', type: 'uint32' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' }
    ],
    name: 'RandomWordsRequested',
    type: 'event'
  }
] as const;

/**
 * Automation Registry V2 ABI (Keepers)
 */
export const AUTOMATION_REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'getUpkeep',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'uint32', name: 'performGas', type: 'uint32' },
          { internalType: 'bytes', name: 'checkData', type: 'bytes' },
          { internalType: 'uint96', name: 'balance', type: 'uint96' },
          { internalType: 'address', name: 'admin', type: 'address' },
          { internalType: 'uint64', name: 'maxValidBlocknumber', type: 'uint64' },
          { internalType: 'uint32', name: 'lastPerformedBlockNumber', type: 'uint32' },
          { internalType: 'uint96', name: 'amountSpent', type: 'uint96' },
          { internalType: 'bool', name: 'paused', type: 'bool' },
          { internalType: 'bytes', name: 'offchainConfig', type: 'bytes' }
        ],
        internalType: 'struct KeeperRegistryBase2_1.UpkeepInfo',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'getBalance',
    outputs: [{ internalType: 'uint96', name: 'balance', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'getMinBalance',
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getState',
    outputs: [
      {
        components: [
          { internalType: 'uint32', name: 'nonce', type: 'uint32' },
          { internalType: 'uint96', name: 'ownerLinkBalance', type: 'uint96' },
          { internalType: 'uint256', name: 'expectedLinkBalance', type: 'uint256' },
          { internalType: 'uint96', name: 'totalPremium', type: 'uint96' },
          { internalType: 'uint256', name: 'numUpkeeps', type: 'uint256' },
          { internalType: 'uint32', name: 'configCount', type: 'uint32' },
          { internalType: 'uint32', name: 'latestConfigBlockNumber', type: 'uint32' },
          { internalType: 'bytes32', name: 'latestConfigDigest', type: 'bytes32' },
          { internalType: 'uint32', name: 'latestEpoch', type: 'uint32' },
          { internalType: 'bool', name: 'paused', type: 'bool' }
        ],
        internalType: 'struct KeeperRegistryBase2_1.State',
        name: 'state',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'uint32', name: 'paymentPremiumPPB', type: 'uint32' },
          { internalType: 'uint32', name: 'flatFeeMicroLink', type: 'uint32' },
          { internalType: 'uint32', name: 'checkGasLimit', type: 'uint32' },
          { internalType: 'uint24', name: 'stalenessSeconds', type: 'uint24' },
          { internalType: 'uint16', name: 'gasCeilingMultiplier', type: 'uint16' },
          { internalType: 'uint96', name: 'minUpkeepSpend', type: 'uint96' },
          { internalType: 'uint32', name: 'maxPerformGas', type: 'uint32' },
          { internalType: 'uint32', name: 'maxCheckDataSize', type: 'uint32' },
          { internalType: 'uint32', name: 'maxPerformDataSize', type: 'uint32' },
          { internalType: 'uint32', name: 'maxRevertDataSize', type: 'uint32' },
          { internalType: 'uint256', name: 'fallbackGasPrice', type: 'uint256' },
          { internalType: 'uint256', name: 'fallbackLinkPrice', type: 'uint256' },
          { internalType: 'address', name: 'transcoder', type: 'address' },
          { internalType: 'address[]', name: 'registrars', type: 'address[]' },
          { internalType: 'address', name: 'upkeepPrivilegeManager', type: 'address' }
        ],
        internalType: 'struct KeeperRegistryBase2_1.OnchainConfig',
        name: 'config',
        type: 'tuple'
      },
      { internalType: 'address[]', name: 'signers', type: 'address[]' },
      { internalType: 'address[]', name: 'transmitters', type: 'address[]' },
      { internalType: 'uint8', name: 'f', type: 'uint8' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'address', name: 'from', type: 'address' }
    ],
    name: 'checkUpkeep',
    outputs: [
      { internalType: 'bool', name: 'upkeepNeeded', type: 'bool' },
      { internalType: 'bytes', name: 'performData', type: 'bytes' },
      { internalType: 'uint8', name: 'upkeepFailureReason', type: 'uint8' },
      { internalType: 'uint256', name: 'gasUsed', type: 'uint256' },
      { internalType: 'uint256', name: 'gasLimit', type: 'uint256' },
      { internalType: 'uint256', name: 'fastGasWei', type: 'uint256' },
      { internalType: 'uint256', name: 'linkNativeFeed', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: true, internalType: 'bool', name: 'success', type: 'bool' },
      { indexed: false, internalType: 'uint96', name: 'totalPayment', type: 'uint96' },
      { indexed: false, internalType: 'uint256', name: 'gasUsed', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'gasOverhead', type: 'uint256' },
      { indexed: false, internalType: 'bytes', name: 'trigger', type: 'bytes' }
    ],
    name: 'UpkeepPerformed',
    type: 'event'
  }
] as const;

/**
 * CCIP Router ABI
 */
export const CCIP_ROUTER_ABI = [
  {
    inputs: [
      { internalType: 'uint64', name: 'destinationChainSelector', type: 'uint64' },
      {
        components: [
          { internalType: 'bytes', name: 'receiver', type: 'bytes' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
          {
            components: [
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' }
            ],
            internalType: 'struct Client.EVMTokenAmount[]',
            name: 'tokenAmounts',
            type: 'tuple[]'
          },
          { internalType: 'address', name: 'feeToken', type: 'address' },
          { internalType: 'bytes', name: 'extraArgs', type: 'bytes' }
        ],
        internalType: 'struct Client.EVM2AnyMessage',
        name: 'message',
        type: 'tuple'
      }
    ],
    name: 'getFee',
    outputs: [{ internalType: 'uint256', name: 'fee', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint64', name: 'chainSelector', type: 'uint64' }],
    name: 'isChainSupported',
    outputs: [{ internalType: 'bool', name: 'supported', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint64', name: 'destChainSelector', type: 'uint64' }],
    name: 'getSupportedTokens',
    outputs: [{ internalType: 'address[]', name: 'tokens', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getOffRamps',
    outputs: [
      {
        components: [
          { internalType: 'uint64', name: 'sourceChainSelector', type: 'uint64' },
          { internalType: 'address', name: 'offRamp', type: 'address' }
        ],
        internalType: 'struct Router.OffRamp[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'messageId', type: 'bytes32' },
      { indexed: true, internalType: 'uint64', name: 'sourceChainSelector', type: 'uint64' },
      { indexed: false, internalType: 'address', name: 'sender', type: 'address' },
      { indexed: false, internalType: 'address', name: 'receiver', type: 'address' }
    ],
    name: 'MessageReceived',
    type: 'event'
  }
] as const;

/**
 * ERC20 LINK Token ABI (minimal)
 */
export const LINK_TOKEN_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' }
    ],
    name: 'transferAndCall',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

/**
 * L2 Sequencer Uptime Feed ABI
 */
export const SEQUENCER_UPTIME_FEED_ABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * Functions Router ABI
 */
export const FUNCTIONS_ROUTER_ABI = [
  {
    inputs: [{ internalType: 'uint64', name: 'subscriptionId', type: 'uint64' }],
    name: 'getSubscription',
    outputs: [
      { internalType: 'uint96', name: 'balance', type: 'uint96' },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'requestedOwner', type: 'address' },
      { internalType: 'address[]', name: 'consumers', type: 'address[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getConfig',
    outputs: [
      { internalType: 'uint16', name: 'maxConsumersPerSubscription', type: 'uint16' },
      { internalType: 'uint72', name: 'adminFee', type: 'uint72' },
      { internalType: 'bytes4', name: 'handleOracleFulfillmentSelector', type: 'bytes4' },
      { internalType: 'uint16', name: 'gasForCallExactCheck', type: 'uint16' },
      { internalType: 'uint32[]', name: 'maxCallbackGasLimits', type: 'uint32[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'donId', type: 'bytes32' }],
    name: 'getContractById',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;
