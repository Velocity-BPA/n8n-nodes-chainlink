# n8n-nodes-chainlink

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node package for interacting with Chainlink oracle services across multiple EVM networks. Provides access to price feeds, VRF (verifiable randomness), automation (keepers), CCIP (cross-chain messaging), functions (serverless compute), and LINK token operations.

![n8n](https://img.shields.io/badge/n8n-community--node-blue)
![Chainlink](https://img.shields.io/badge/Chainlink-Oracle-375BD2)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- **🔮 Price Feeds** - Access real-time asset prices from Chainlink Data Feeds
- **🎲 VRF (Verifiable Random Function)** - Cryptographically secure randomness
- **⚙️ Automation (Keepers)** - Decentralized smart contract automation
- **🌉 CCIP** - Cross-Chain Interoperability Protocol for multi-chain messaging
- **⚡ Functions** - Serverless compute for custom oracle logic
- **🔗 LINK Token** - Token balance, transfers, and allowances
- **📊 Data Feeds** - Proof of Reserve, NFT Floor Prices, L2 Sequencer Status
- **🌐 Network Utilities** - Gas prices, network status, and helpers

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-chainlink` and click **Install**

### Manual Installation

```bash
# In your n8n installation directory
npm install n8n-nodes-chainlink
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-chainlink.zip
cd n8n-nodes-chainlink

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-chainlink

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-chainlink %CD%

# 5. Restart n8n
n8n start
```

### Docker

Add to your Dockerfile:

```dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-chainlink
```

## Credentials Setup

### Chainlink RPC Credentials

| Field | Description | Required |
|-------|-------------|----------|
| Network | Select EVM network (Ethereum, Polygon, etc.) | Yes |
| RPC URL | Custom RPC endpoint (optional, uses public if empty) | No |
| Private Key | For write operations (LINK transfers) | No |
| Chain ID | Auto-detected from network selection | No |

### Chainlink Functions Credentials

| Field | Description | Required |
|-------|-------------|----------|
| Network | Select Functions-enabled network | Yes |
| RPC URL | Custom RPC endpoint | No |
| Subscription ID | Functions subscription ID | Yes |
| DON ID | Decentralized Oracle Network ID | No |
| Router Address | Functions router address | No |
| Private Key | For sending requests | Yes |

**Recommended RPC Providers:**
- [Alchemy](https://www.alchemy.com/)
- [Infura](https://www.infura.io/)
- [QuickNode](https://www.quicknode.com/)

## Resources & Operations

### Price Feed Resource (8 operations)

| Operation | Description |
|-----------|-------------|
| Get Latest Price | Fetch current price from a feed |
| Get Price Feed Data | Full round data with timestamps |
| Get Historical Price | Price at a specific round |
| Get Feed Description | Feed metadata |
| Get Multiple Prices | Batch fetch multiple feeds |
| List Available Feeds | Known feeds for network |
| Calculate Derived Price | Cross-rates (e.g., ETH/EUR) |
| Get Feed Registry Price | Query via Feed Registry |

### Data Feed Resource (6 operations)

| Operation | Description |
|-----------|-------------|
| Get Proof of Reserve | PoR feed data |
| Get NFT Floor Price | Collection floor prices |
| Get L2 Sequencer Status | L2 sequencer uptime |
| List PoR Feeds | Available PoR feeds |
| List NFT Floor Feeds | Available NFT feeds |
| List Sequencer Feeds | Available sequencer feeds |

### VRF Resource (7 operations)

| Operation | Description |
|-----------|-------------|
| Get Subscription Details | Balance, consumers, owner |
| Get VRF Coordinator Info | Configuration and key hashes |
| List Subscription Consumers | Consumer contracts |
| Calculate Request Price | Estimate VRF cost |
| Check Request Status | Fulfillment status |
| Decode VRF Request | Parse request data |
| Get VRF Networks | Available VRF networks |

### Automation Resource (8 operations)

| Operation | Description |
|-----------|-------------|
| Get Upkeep Details | Full upkeep configuration |
| Check Upkeep Status | Active/paused/cancelled |
| Get Upkeep Balance | LINK balance and health |
| Get Minimum Balance | Required balance calculation |
| Simulate Upkeep | Call checkUpkeep |
| Get Registry State | Global registry info |
| Get Upkeep History | Recent performances |
| List Automation Networks | Supported networks |

### CCIP Resource (7 operations)

| Operation | Description |
|-----------|-------------|
| Get Supported Lanes | Available cross-chain routes |
| Check Lane Support | Verify specific lane |
| Calculate Message Fee | Estimate cross-chain fee |
| Get Router Configuration | Router and lane info |
| Track Cross-Chain Message | Message status by ID |
| List Chain Selectors | All CCIP chain IDs |
| Get Token Transfer Limits | Lane token limits |

### Functions Resource (6 operations)

| Operation | Description |
|-----------|-------------|
| Get Subscription Info | Functions subscription |
| Get DON Configuration | Network config |
| Estimate Request Cost | Execution cost estimate |
| Decode Response | Parse function response |
| Get Supported Networks | Available networks |
| Validate Source Code | Check JS code validity |

### LINK Token Resource (7 operations)

| Operation | Description |
|-----------|-------------|
| Get LINK Balance | Token balance |
| Get LINK Price | Current LINK/USD price |
| Transfer LINK | Send LINK tokens |
| Get LINK Token Address | Address for network |
| Check LINK Allowance | Spending allowance |
| Get LINK Total Supply | Total supply |
| Get All LINK Addresses | Addresses per network |

### Network Utilities (8 operations)

| Operation | Description |
|-----------|-------------|
| Get Gas Price | Current gas price |
| Get ETH Price | Native token price |
| Get Network Status | Network info |
| Validate Address | Checksum validation |
| List Supported Networks | All networks |
| Check Contract Exists | Contract vs EOA |
| Convert Units | Wei/Gwei/Ether conversion |
| Get Block Info | Block details |

## Trigger Node

The **Chainlink Trigger** node supports polling for:

| Event | Description |
|-------|-------------|
| Price Update | Price changes by threshold % |
| Price Threshold Alert | Price crosses target value |
| New Round Started | New price feed round |
| VRF Request Fulfilled | Random words delivered |
| Upkeep Performed | Automation executed |
| L2 Sequencer Status Change | Sequencer up/down |

## Usage Examples

### Get Latest ETH/USD Price

```json
{
  "resource": "priceFeed",
  "operation": "getLatestPrice",
  "feedSource": "preset",
  "pricePair": "ETH/USD"
}
```

### Monitor Price Changes (Trigger)

1. Add a **Chainlink Trigger** node
2. Select **Price Update** event
3. Choose your price pair (e.g., ETH/USD)
4. Set change threshold (e.g., 1%)
5. The workflow triggers when price changes by the threshold

### Get VRF Subscription Details

```json
{
  "resource": "vrf",
  "operation": "getSubscriptionDetails",
  "subscriptionId": 1234
}
```

### Calculate CCIP Cross-Chain Fee

```json
{
  "resource": "ccip",
  "operation": "calculateMessageFee",
  "destinationNetwork": "polygon-mainnet",
  "receiverAddress": "0x...",
  "gasLimit": 200000
}
```

### Check L2 Sequencer Status

```json
{
  "resource": "dataFeed",
  "operation": "getL2SequencerStatus",
  "sequencerFeedSource": "auto"
}
```

## Chainlink Concepts

### Price Feeds
Chainlink Data Feeds provide reliable, tamper-proof price data for DeFi applications. Each feed is updated by a decentralized network of oracle nodes.

### VRF (Verifiable Random Function)
Chainlink VRF provides cryptographically secure randomness for blockchain applications. Each random value comes with a cryptographic proof.

### Automation (Keepers)
Chainlink Automation enables smart contract automation through a decentralized network of nodes that monitor and execute upkeep functions.

### CCIP (Cross-Chain Interoperability Protocol)
CCIP enables secure cross-chain communication, allowing smart contracts to send messages and transfer tokens across different blockchains.

### Functions
Chainlink Functions allows smart contracts to execute custom JavaScript/TypeScript code in a decentralized manner.

## Networks

| Network | Mainnet | Testnet |
|---------|---------|---------|
| Ethereum | ✅ Mainnet | ✅ Sepolia |
| Polygon | ✅ Mainnet | ✅ Amoy |
| Arbitrum | ✅ One | ✅ Sepolia |
| Optimism | ✅ Mainnet | ✅ Sepolia |
| Avalanche | ✅ C-Chain | ✅ Fuji |
| BNB Chain | ✅ Mainnet | ✅ Testnet |
| Base | ✅ Mainnet | ✅ Sepolia |

## Error Handling

The node provides detailed error messages:

```json
{
  "error": "Contract call reverted. The feed address may be invalid..."
}
```

Common errors:
- **Invalid feed address** - Verify address and network
- **Network not supported** - Check available features per network
- **Insufficient funds** - Add LINK/ETH for write operations
- **Rate limited** - Use dedicated RPC provider

## Security Best Practices

1. **Use Dedicated RPC Providers** - Public endpoints have rate limits
2. **Check Sequencer Status on L2** - Before using price feeds for critical operations
3. **Handle Stale Data** - Monitor `updatedAt` timestamps
4. **Monitor LINK Balances** - Ensure sufficient balance for VRF/Automation
5. **Secure Private Keys** - Never expose private keys in workflows

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Watch mode (development)
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Ensure tests pass
4. Submit a pull request

## Support

- **Issues:** [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-chainlink/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Velocity-BPA/n8n-nodes-chainlink/discussions)

## Acknowledgments

- [Chainlink](https://chain.link/) - Decentralized oracle network
- [n8n](https://n8n.io/) - Workflow automation platform
- [ethers.js](https://docs.ethers.org/) - Ethereum library
