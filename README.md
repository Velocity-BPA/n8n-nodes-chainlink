# n8n-nodes-chainlink

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node enables seamless integration with Chainlink's decentralized oracle network, providing access to 4+ resources including price feeds, VRF (Verifiable Random Function), automation services, and Cross-Chain Interoperability Protocol (CCIP) for building reliable Web3 workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Chainlink](https://img.shields.io/badge/Chainlink-Oracle-375BD2)
![Web3](https://img.shields.io/badge/Web3-DeFi-FF6B35)
![Blockchain](https://img.shields.io/badge/Blockchain-Multi--Chain-00D4AA)

## Features

- **Price Feed Integration** - Access real-time and historical price data from Chainlink's decentralized price feeds
- **VRF (Verifiable Random Function)** - Generate cryptographically secure random numbers for gaming, NFTs, and fair selection processes
- **Automation Services** - Monitor and trigger smart contract functions based on time, price, or custom conditions
- **CCIP Cross-Chain** - Enable secure cross-chain token transfers and message passing between different blockchains
- **Multi-Network Support** - Works across Ethereum, Polygon, BSC, Avalanche, and other supported networks
- **Real-time Monitoring** - Subscribe to oracle updates and contract events for instant notifications
- **Developer-Friendly** - Simple configuration with comprehensive error handling and validation

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-chainlink`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-chainlink
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-chainlink.git
cd n8n-nodes-chainlink
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-chainlink
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Chainlink node operator API key or service provider key | Yes |
| Network | Target blockchain network (mainnet, testnet, polygon, etc.) | Yes |
| Node URL | Custom Chainlink node endpoint (optional, uses default if empty) | No |
| Private Key | Wallet private key for transaction signing (encrypted storage) | No |

## Resources & Operations

### 1. Price Feeds

| Operation | Description |
|-----------|-------------|
| Get Latest Price | Retrieve the most recent price data for a trading pair |
| Get Historical Data | Fetch historical price information within a date range |
| Get Round Data | Access specific round data by round ID |
| List Available Feeds | Get all available price feed contracts for a network |
| Subscribe to Updates | Set up real-time price update notifications |

### 2. VRF Requests

| Operation | Description |
|-----------|-------------|
| Request Random Number | Initiate a VRF request for cryptographically secure randomness |
| Get Request Status | Check the fulfillment status of a VRF request |
| Get Random Result | Retrieve the generated random number from a fulfilled request |
| List VRF Coordinators | Get available VRF coordinator contracts by network |
| Estimate Request Cost | Calculate the LINK token cost for a VRF request |

### 3. Automation

| Operation | Description |
|-----------|-------------|
| Create Upkeep | Register a new automation upkeep for smart contract monitoring |
| Get Upkeep Info | Retrieve details about an existing upkeep registration |
| Fund Upkeep | Add LINK tokens to fund an upkeep's execution |
| Cancel Upkeep | Cancel and withdraw remaining funds from an upkeep |
| List Active Upkeeps | Get all active automation upkeeps for your account |
| Get Execution History | View past automation executions and their results |

### 4. CCIP

| Operation | Description |
|-----------|-------------|
| Send Cross-Chain Message | Initiate a cross-chain message or token transfer |
| Get Message Status | Track the status of a cross-chain transaction |
| Estimate Fees | Calculate cross-chain transfer fees between networks |
| List Supported Chains | Get all blockchain networks supported by CCIP |
| Get Lane Configuration | Retrieve configuration for specific cross-chain lanes |

## Usage Examples

```javascript
// Get latest ETH/USD price from Chainlink price feed
const priceData = await chainlink.priceFeeds.getLatestPrice({
  pair: 'ETH/USD',
  network: 'ethereum-mainnet'
});
console.log(`Current ETH price: $${priceData.price}`);
```

```javascript
// Request verifiable random number for NFT minting
const vrfRequest = await chainlink.vrfRequests.requestRandomNumber({
  keyHash: '0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef',
  fee: '100000000000000000', // 0.1 LINK
  network: 'polygon'
});
console.log(`VRF Request ID: ${vrfRequest.requestId}`);
```

```javascript
// Set up automation for DeFi position monitoring
const upkeep = await chainlink.automation.createUpkeep({
  name: 'DeFi Position Monitor',
  contractAddress: '0x742d35Cc6635C0532925a3b8D400631d',
  checkData: '0x',
  gasLimit: 500000,
  adminAddress: '0x8ba1f109551bD432803012645Hac136c',
  network: 'ethereum-mainnet'
});
```

```javascript
// Send cross-chain USDC transfer via CCIP
const ccipTransfer = await chainlink.ccip.sendCrossChainMessage({
  destinationChain: 'polygon',
  tokenAddress: '0xA0b86a33E6441e7c7D7D4d33c51D5E3F95A9C0b0',
  amount: '100000000', // 100 USDC
  receiver: '0x742d35Cc6635C0532925a3b8D400631d',
  sourceNetwork: 'ethereum'
});
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has proper permissions |
| Insufficient LINK Balance | Not enough LINK tokens for VRF or automation requests | Fund your wallet with LINK tokens for the target network |
| Network Not Supported | Requested blockchain network is not available | Check supported networks list and use valid network identifier |
| Feed Not Found | Price feed contract doesn't exist for the requested pair | Verify trading pair symbol and network combination |
| Transaction Failed | Blockchain transaction was reverted or failed | Check gas limits, token balances, and contract parameters |
| Rate Limit Exceeded | Too many API requests in short timeframe | Implement request throttling and retry logic |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-chainlink/issues)
- **Chainlink Documentation**: [docs.chain.link](https://docs.chain.link)
- **Chainlink Discord**: [Official Discord Community](https://discord.gg/chainlink)