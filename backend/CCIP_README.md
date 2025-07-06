# CCIP Sender and Receiver Contracts

This directory contains Sender and Receiver contracts for cross-chain messaging using Chainlink CCIP (Cross-Chain Interoperability Protocol).

## Contracts

### Sender.sol

Contract used for sending cross-chain messages.

**Features:**

- `sendMessage()`: Sends cross-chain messages (anyone can use)
- `sendMessagePublic()`: Public message sending function
- `getRouter()`: Returns router address
- `getLinkToken()`: Returns LINK token address
- `getLinkBalance()`: Returns contract's LINK balance
- `withdrawLink()`: Allows owner to withdraw LINK

**Security Features:**

- Reentrancy protection
- Input validation
- Message length limitation (1000 characters)
- Error handling

### Receiver.sol

Contract used for receiving cross-chain messages.

**Features:**

- `_ccipReceive()`: Processes incoming messages
- `addAuthorizedSender()`: Adds authorized sender
- `removeAuthorizedSender()`: Removes authorized sender
- `isAuthorizedSender()`: Checks if sender is authorized
- `getLastReceivedMessageDetails()`: Returns details of last received message
- `getMessageCount()`: Returns total message count
- `isMessageProcessed()`: Checks if message has been processed

**Security Features:**

- Reentrancy protection
- Message replay protection
- Authorized sender validation
- Message validation

## Deployment

### Required Environment Variables

Define these variables in your `.env` file:

```env
PRIVATE_KEY=your_private_key_here
ROUTER_ADDRESS=0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C
LINK_TOKEN_ADDRESS=0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C
```

### Deploy Sender Contract

```bash
forge script script/DeploySender.s.sol --rpc-url <RPC_URL> --broadcast
```

### Deploy Receiver Contract

```bash
forge script script/DeployReceiver.s.sol --rpc-url <RPC_URL> --broadcast
```

## Usage

### 1. Using Sender Contract

```javascript
// Send message
const messageId = await sender.sendMessage(
  destinationChainSelector, // Destination chain selector
  receiverAddress, // Receiver contract address
  "Hello World!" // Message to send
);
```

### 2. Using Receiver Contract

```javascript
// Get last received message
const [messageId, text] = await receiver.getLastReceivedMessageDetails();

// Get message count
const messageCount = await receiver.getMessageCount();

// Add authorized sender (owner only)
await receiver.addAuthorizedSender(chainSelector, senderAddress);
```

## Network Addresses

### Ronin Mainnet

- Router: `0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C`
- LINK Token: `0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C`

### Ronin Testnet (Saigon)

- Router: `0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C`
- LINK Token: `0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C`

## Security Notes

1. **LINK Balance**: Ensure sufficient LINK balance in Sender contract
2. **Authorized Senders**: Define authorized senders in Receiver contract for security
3. **Message Validation**: Always validate incoming messages
4. **Gas Limits**: Allocate sufficient gas for cross-chain transactions

## Testing

```bash
# Run tests
forge test

# Run specific test file
forge test --match-test testSender
```

## Events

### Sender Events

- `MessageSent`: Emitted when message is sent

### Receiver Events

- `MessageReceived`: Emitted when message is received
- `MessageProcessed`: Emitted when message is processed

## Error Codes

### Sender Errors

- `NotEnoughBalance`: Insufficient LINK balance
- `InvalidReceiver`: Invalid receiver address
- `InvalidChainSelector`: Invalid chain selector
- `MessageTooLong`: Message too long

### Receiver Errors

- `InvalidMessage`: Invalid message
- `MessageTooLong`: Message too long
- `UnauthorizedSender`: Unauthorized sender
