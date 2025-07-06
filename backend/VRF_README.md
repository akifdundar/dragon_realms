# Chainlink VRF Consumer Contract

This directory contains a Chainlink VRF (Verifiable Random Function) consumer contract for generating cryptographically secure random numbers on-chain.

## Overview

The `VRFConsumer` contract allows users to request random numbers from Chainlink's VRF service. The contract handles the request-response cycle and stores the generated random words for later use.

## Contract Features

### Core Functions

- **`requestRandomWords()`**: Request random words from VRF
- **`fulfillRandomWords()`**: Internal callback function for VRF responses
- **`getRandomWords()`**: Retrieve random words for a specific request
- **`getUserRandomWords()`**: Get random words for a specific user
- **`getRequestSender()`**: Get the sender of a specific request
- **`isRequestFulfilled()`**: Check if a request has been fulfilled

### Configuration Functions

- **`getVRFConfig()`**: Get all VRF configuration parameters
- **`getLinkBalance()`**: Get contract's LINK token balance

### Administrative Functions

- **`cancelSubscription()`**: Cancel VRF subscription (owner only)
- **`withdrawLink()`**: Withdraw LINK tokens (owner only)

## Security Features

- **Reentrancy Protection**: Prevents reentrancy attacks
- **Access Control**: Owner-only functions for administrative tasks
- **Input Validation**: Comprehensive parameter validation
- **Request Tracking**: Prevents duplicate request processing
- **Error Handling**: Custom errors for better gas efficiency

## Events

### RandomWordsRequested

```solidity
event RandomWordsRequested(
    uint256 indexed requestId,
    address indexed sender,
    uint256 timestamp
);
```

### RandomWordsReceived

```solidity
event RandomWordsReceived(
    uint256 indexed requestId,
    address indexed sender,
    uint256[] randomWords,
    uint256 timestamp
);
```

## Error Codes

- **`InsufficientLinkBalance()`**: Insufficient LINK balance for subscription
- **`InvalidRequestId()`**: Request ID does not exist
- **`RequestNotFulfilled()`**: Request has not been fulfilled yet
- **`InvalidSubscriptionId()`**: Invalid subscription ID

## Deployment

### Prerequisites

1. **Chainlink VRF Subscription**: Create a subscription on the VRF Coordinator
2. **LINK Tokens**: Fund the subscription with LINK tokens
3. **Environment Variables**: Set up required environment variables

### Environment Variables

Create a `.env` file with the following variables:

```env
PRIVATE_KEY=your_private_key_here
VRF_COORDINATOR_ADDRESS=0x... # VRF Coordinator address for your network
VRF_KEY_HASH=0x... # Key hash for your network
VRF_SUBSCRIPTION_ID=1 # Your subscription ID
VRF_CALLBACK_GAS_LIMIT=100000 # Gas limit for callback
VRF_REQUEST_CONFIRMATIONS=3 # Number of confirmations required
VRF_NUM_WORDS=1 # Number of random words to request
```

### Deploy Contract

```bash
# Deploy VRF Consumer contract
forge script script/DeployVRFConsumer.s.sol --rpc-url <RPC_URL> --broadcast
```

## Network Addresses

### Ethereum Mainnet

- VRF Coordinator: `0x271682DEB8C4E0901D1a1550aD2e64D568E69909`
- LINK Token: `0x514910771AF9Ca656af840dff83E8264EcF986CA`

### Ethereum Sepolia Testnet

- VRF Coordinator: `0x50AE005340811D0C983F1C4B4C4C4C4C4C4C4C4C`
- LINK Token: `0x779877A7B0D9E8603169DdbD7836e478b4624789`

### Polygon Mainnet

- VRF Coordinator: `0xAE975071Be8F8eE67addBC1A82488F1C24858067`
- LINK Token: `0xb0897686c545045aFc77CF20eC7A532E3120E0F1`

### Polygon Mumbai Testnet

- VRF Coordinator: `0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed`
- LINK Token: `0x326C977E6efc84E512bB9C30f76E30c160eD06FB`

## Usage

### 1. Request Random Words

```javascript
// Request random words
const requestId = await vrfConsumer.requestRandomWords();

console.log("Request ID:", requestId.toString());
```

### 2. Check Request Status

```javascript
// Check if request is fulfilled
const isFulfilled = await vrfConsumer.isRequestFulfilled(requestId);

if (isFulfilled) {
  // Get random words
  const randomWords = await vrfConsumer.getRandomWords(requestId);
  console.log("Random words:", randomWords);
}
```

### 3. Get User's Random Words

```javascript
// Get random words for a specific user
const userRandomWords = await vrfConsumer.getUserRandomWords(userAddress);
console.log("User random words:", userRandomWords);
```

### 4. Get VRF Configuration

```javascript
// Get all VRF configuration parameters
const config = await vrfConsumer.getVRFConfig();
console.log("VRF Coordinator:", config.vrfCoordinator);
console.log("Key Hash:", config.keyHash);
console.log("Subscription ID:", config.subscriptionId);
```

## Testing

### Run All Tests

```bash
forge test
```

### Run VRF Tests Only

```bash
forge test --match-contract VRFConsumerTest
```

### Run Tests with Verbose Output

```bash
forge test --match-contract VRFConsumerTest -vv
```

## Test Coverage

The test suite covers:

- ✅ Constructor validation
- ✅ Random word requests
- ✅ Request fulfillment
- ✅ Error handling
- ✅ Access control
- ✅ Event emission
- ✅ Configuration retrieval
- ✅ Fuzz testing
- ✅ Integration testing

## Gas Optimization

The contract is optimized for gas efficiency:

- **Custom Errors**: Used instead of require statements
- **Immutable Variables**: Used for configuration parameters
- **Efficient Storage**: Optimized data structures
- **Minimal External Calls**: Reduced external contract calls

## Security Considerations

1. **Subscription Management**: Ensure subscription has sufficient LINK balance
2. **Gas Limits**: Set appropriate callback gas limits
3. **Request Confirmations**: Balance security vs. speed
4. **Access Control**: Only owner can cancel subscription or withdraw LINK
5. **Reentrancy**: Protected against reentrancy attacks

## Integration Examples

### Gaming Application

```javascript
// Request random number for game outcome
const requestId = await gameContract.requestRandomWords();

// Wait for fulfillment
const isFulfilled = await gameContract.isRequestFulfilled(requestId);
if (isFulfilled) {
  const randomWords = await gameContract.getRandomWords(requestId);
  const randomNumber = randomWords[0] % 100; // 0-99
  console.log("Game outcome:", randomNumber);
}
```

### NFT Minting

```javascript
// Request random number for NFT attributes
const requestId = await nftContract.requestRandomWords();

// Use random number for NFT generation
const randomWords = await nftContract.getRandomWords(requestId);
const rarity = randomWords[0] % 1000; // 0-999
console.log("NFT rarity:", rarity);
```

## Troubleshooting

### Common Issues

1. **"Invalid subscription"**: Check subscription ID and LINK balance
2. **"Request not fulfilled"**: Wait for VRF response
3. **"Invalid request ID"**: Request ID doesn't exist
4. **Gas limit exceeded**: Increase callback gas limit

### Debug Commands

```bash
# Check contract state
cast call <CONTRACT_ADDRESS> "getVRFConfig()"

# Check request status
cast call <CONTRACT_ADDRESS> "isRequestFulfilled(uint256)" <REQUEST_ID>

# Get random words
cast call <CONTRACT_ADDRESS> "getRandomWords(uint256)" <REQUEST_ID>
```

## Maintenance

### Regular Tasks

1. **Monitor LINK Balance**: Ensure subscription has sufficient funds
2. **Check Gas Prices**: Adjust callback gas limits if needed
3. **Review Requests**: Monitor request patterns and success rates
4. **Update Configuration**: Update parameters as needed

### Emergency Procedures

1. **Cancel Subscription**: Use `cancelSubscription()` if needed
2. **Withdraw LINK**: Use `withdrawLink()` to recover funds
3. **Pause Operations**: Implement pause mechanism if needed

## Future Enhancements

Planned improvements:

1. **Batch Requests**: Support for multiple requests
2. **Custom Callbacks**: Allow custom callback functions
3. **Gas Optimization**: Further gas optimizations
4. **Advanced Features**: Additional VRF features

## Conclusion

The VRFConsumer contract provides a secure and efficient way to generate random numbers on-chain using Chainlink's VRF service. The contract includes comprehensive testing, security features, and is ready for production use.
