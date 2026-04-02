# n8n-nodes-chainlink

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Chainlink's decentralized oracle network, offering access to 5 core resources including price feeds, VRF requests, automation jobs, cross-chain messaging, and serverless functions. Streamline your blockchain data workflows with real-time oracle data, verifiable randomness, and cross-chain interoperability.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Chainlink](https://img.shields.io/badge/Chainlink-Oracle-375BD2)
![Web3](https://img.shields.io/badge/Web3-DeFi-orange)
![Blockchain](https://img.shields.io/badge/Blockchain-Integration-green)

## Features

- **Real-time Price Feeds** - Access live cryptocurrency and asset pricing data from Chainlink's decentralized oracle network
- **Verifiable Random Functions** - Generate cryptographically secure randomness for gaming, NFTs, and fair selection processes
- **Automation Jobs** - Create and manage Chainlink Keepers for automated smart contract execution and maintenance
- **Cross-chain Messaging** - Enable secure communication and data transfer between different blockchain networks
- **Serverless Functions** - Execute custom logic with Chainlink Functions for off-chain computation and API integration
- **Multi-network Support** - Compatible with Ethereum, Polygon, Avalanche, BSC, and other supported networks
- **Event Monitoring** - Track oracle updates, job completions, and cross-chain message status in real-time
- **Gas Optimization** - Built-in tools for monitoring and optimizing transaction costs across networks

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
| API Key | Your Chainlink API key for accessing premium features and higher rate limits | Yes |
| Network | Target blockchain network (mainnet, testnet, polygon, etc.) | Yes |
| Environment | Production or sandbox environment | Yes |

## Resources & Operations

### 1. Price Feeds

| Operation | Description |
|-----------|-------------|
| Get Latest Price | Retrieve the most recent price data for a specific asset pair |
| Get Historical Prices | Fetch historical price data within a specified time range |
| Get Price Feed Info | Obtain metadata about available price feeds and their configurations |
| Subscribe to Updates | Set up real-time price update notifications for specified feeds |

### 2. VRF Requests

| Operation | Description |
|-----------|-------------|
| Request Random Number | Submit a new VRF request for verifiable random number generation |
| Get Request Status | Check the fulfillment status of a submitted VRF request |
| Get Random Result | Retrieve the generated random number from a completed VRF request |
| List Requests | Get a list of all VRF requests for the authenticated account |

### 3. Automation Jobs

| Operation | Description |
|-----------|-------------|
| Create Job | Set up a new Chainlink Keeper automation job with specified conditions |
| Update Job | Modify the parameters or conditions of an existing automation job |
| Delete Job | Remove an automation job and stop its execution |
| Get Job Status | Check the current status and execution history of an automation job |
| List Jobs | Retrieve all automation jobs associated with the account |

### 4. Cross Chain Messaging

| Operation | Description |
|-----------|-------------|
| Send Message | Initiate a cross-chain message to another blockchain network |
| Get Message Status | Track the delivery status of a cross-chain message |
| List Messages | View all sent and received cross-chain messages |
| Get Supported Chains | Retrieve the list of blockchain networks available for messaging |

### 5. Functions

| Operation | Description |
|-----------|-------------|
| Execute Function | Run a Chainlink Function with specified parameters and data sources |
| Get Function Result | Retrieve the output from a completed function execution |
| List Functions | Get all available functions and their descriptions |
| Get Execution History | View the execution history and logs for function calls |

## Usage Examples

```javascript
// Get latest ETH/USD price from Chainlink price feeds
{
  "operation": "getLatestPrice",
  "resource": "priceFeeds",
  "pair": "ETH/USD",
  "network": "ethereum"
}
```

```javascript
// Request verifiable random number for NFT minting
{
  "operation": "requestRandomNumber",
  "resource": "vrfRequests",
  "keyHash": "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
  "fee": "2000000000000000000",
  "seed": 12345
}
```

```javascript
// Create automation job for liquidity monitoring
{
  "operation": "createJob",
  "resource": "automationJobs",
  "name": "Liquidity Monitor",
  "target": "0x742d35Cc6639C2532e29141fBC8c8C3C6b8D7B6f",
  "condition": "balance < 1000000000000000000",
  "action": "refillLiquidity"
}
```

```javascript
// Send cross-chain message from Ethereum to Polygon
{
  "operation": "sendMessage",
  "resource": "crossChainMessaging",
  "sourceChain": "ethereum",
  "destinationChain": "polygon",
  "recipient": "0x1234567890123456789012345678901234567890",
  "data": "0xabcdef",
  "gasLimit": 500000
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | The provided API key is invalid or expired | Verify your API key in Chainlink dashboard and update credentials |
| Insufficient Funds | Account has insufficient LINK tokens or ETH for gas | Add LINK tokens to your account and ensure adequate gas fees |
| Network Not Supported | The specified blockchain network is not available | Check supported networks list and use a valid network identifier |
| Rate Limit Exceeded | Too many requests sent in a short time period | Implement request throttling or upgrade to higher tier API access |
| VRF Request Failed | Random number generation request could not be fulfilled | Check VRF subscription balance and request parameters |
| Job Execution Error | Automation job failed to execute properly | Review job conditions and target contract status |

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
- **Developer Community**: [Chainlink Discord](https://discord.gg/chainlink)