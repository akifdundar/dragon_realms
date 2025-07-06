# Test Suite Documentation

This document describes the comprehensive test suite for the Dragon Realms smart contracts.

## Overview

The test suite covers three main contracts:

- **Sender.sol** - Cross-chain message sending contract using Chainlink CCIP
- **Receiver.sol** - Cross-chain message receiving contract using Chainlink CCIP
- **Character.sol** - NFT character contract with game mechanics

## Test Files

### 1. Sender.t.sol

Tests for the cross-chain message sending functionality.

**Key Test Categories:**

- Constructor tests
- Message sending functionality
- Access control (owner-only functions)
- Input validation
- Error handling
- Fee calculation
- LINK token withdrawal
- Ownership management
- Fuzz testing for different data sizes and gas limits
- Integration tests

**Key Functions Tested:**

- `sendMessage()` - Sends cross-chain messages
- `getFee()` - Calculates message fees
- `withdrawLink()` - Withdraws LINK tokens
- `transferOwnership()` - Transfers contract ownership

### 2. Receiver.t.sol

Tests for the cross-chain message receiving functionality.

**Key Test Categories:**

- Constructor tests
- Message receiving functionality
- Message storage and retrieval
- Message counting
- Event emission
- Access control
- Input validation
- Fuzz testing for different message types
- Integration tests with multiple messages

**Key Functions Tested:**

- `_ccipReceive()` - Receives cross-chain messages
- `getLastReceivedMessage()` - Retrieves last message details
- `getMessageCount()` - Gets total message count
- `transferOwnership()` - Transfers contract ownership

### 3. TestCharacter.t.sol

Tests for the NFT character contract with game mechanics.

**Key Test Categories:**

- Constructor tests
- Character minting functionality
- Character data retrieval
- Character attributes and stats
- Power level calculations
- Energy system
- Access control
- Token URI generation
- Withdrawal functionality
- All character classes

**Key Functions Tested:**

- `mintCharacter()` - Mints new character NFTs
- `getCharacter()` - Retrieves character data
- `getCharacterAttributes()` - Gets character stats
- `getCharacterPower()` - Calculates power level
- `canPerformAction()` - Checks if character can act
- `setAuthorizedContract()` - Authorizes contracts
- `withdraw()` - Withdraws contract funds

## Running Tests

### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install
```

### Run All Tests

```bash
cd backend
forge test
```

### Run Specific Test Files

```bash
# Run Sender tests
forge test --match-contract SenderTest

# Run Receiver tests
forge test --match-contract ReceiverTest

# Run Character tests
forge test --match-contract CharacterTest
```

### Run Tests with Verbose Output

```bash
forge test -vv
```

### Run Tests with Gas Reporting

```bash
forge test --gas-report
```

### Run Fuzz Tests

```bash
# Run with more iterations for fuzz tests
forge test --fuzz-runs 1000
```

## Test Coverage

### Sender Contract Coverage

- ✅ Constructor validation
- ✅ Message sending with valid parameters
- ✅ Access control for owner-only functions
- ✅ Input validation (zero addresses, empty data, zero gas limit)
- ✅ Fee calculation functionality
- ✅ LINK token withdrawal with various scenarios
- ✅ Ownership transfer functionality
- ✅ Fuzz testing for different data sizes
- ✅ Integration testing

### Receiver Contract Coverage

- ✅ Constructor validation
- ✅ Message receiving with valid parameters
- ✅ Message storage and retrieval
- ✅ Message counting functionality
- ✅ Event emission verification
- ✅ Access control for owner functions
- ✅ Fuzz testing for different message types
- ✅ Integration testing with multiple messages
- ✅ Reentrancy protection

### Character Contract Coverage

- ✅ Constructor validation
- ✅ Character minting with payment validation
- ✅ Character class assignment and validation
- ✅ Character data retrieval and validation
- ✅ Character attributes and stats calculation
- ✅ Power level calculations
- ✅ Energy system functionality
- ✅ Access control for authorized contracts
- ✅ Token URI generation
- ✅ Withdrawal functionality
- ✅ All character classes (Fire, Water, Earth, Air)
- ✅ Integration testing for complete character lifecycle

## Test Patterns Used

### 1. Setup Pattern

```solidity
function setUp() public {
    // Initialize contracts and mock addresses
    sender = new Sender(mockRouter, mockLinkToken);
    receiver = new Receiver();
}
```

### 2. Positive Test Pattern

```solidity
function test_FunctionName_Success() public {
    // Arrange
    // Act
    // Assert
}
```

### 3. Negative Test Pattern

```solidity
function test_FunctionName_RevertWhenCondition() public {
    // Arrange
    // Act & Assert
    vm.expectRevert("Expected error message");
    contract.functionName();
}
```

### 4. Event Testing Pattern

```solidity
function test_EventEmission() public {
    vm.expectEmit(true, true, false, true);
    emit ExpectedEvent(param1, param2);

    contract.functionName();
}
```

### 5. Fuzz Testing Pattern

```solidity
function testFuzz_FunctionNameWithDifferentInputs(bytes calldata data) public {
    vm.assume(data.length > 0);
    vm.assume(data.length <= 1000);

    contract.functionName(data);
}
```

### 6. Integration Testing Pattern

```solidity
function test_Integration_CompleteWorkflow() public {
    // Step 1: Setup
    // Step 2: Execute workflow
    // Step 3: Verify results
    // Step 4: Verify state
}
```

## Mock Contracts and Addresses

The tests use mock contracts and addresses to simulate external dependencies:

```solidity
// Mock addresses for testing
address public mockRouter = address(0x123);
address public mockLinkToken = address(0x456);
address public mockReceiver = address(0x789);
address public owner = address(this);
address public unauthorizedUser = address(0x999);
```

## Error Handling Tests

All contracts include comprehensive error handling tests:

- **Access Control**: Tests that only authorized users can call restricted functions
- **Input Validation**: Tests that invalid inputs are properly rejected
- **State Validation**: Tests that functions fail when contract state is invalid
- **Resource Limits**: Tests that functions fail when resources are insufficient

## Gas Optimization Tests

The test suite includes gas optimization considerations:

- **Gas Limit Tests**: Tests with different gas limits to ensure efficiency
- **Batch Operations**: Tests for efficient batch processing
- **Storage Optimization**: Tests that minimize storage operations

## Security Tests

Security-focused tests include:

- **Reentrancy Protection**: Tests that prevent reentrancy attacks
- **Access Control**: Tests that verify proper authorization
- **Input Validation**: Tests that prevent invalid inputs
- **Resource Exhaustion**: Tests that prevent resource exhaustion attacks

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    cd backend
    forge test --gas-report
```

## Test Maintenance

### Adding New Tests

1. Follow the existing naming convention: `test_FunctionName_Scenario()`
2. Include both positive and negative test cases
3. Add fuzz tests for functions with variable inputs
4. Include integration tests for complex workflows

### Updating Tests

1. Update tests when contract interfaces change
2. Maintain test coverage above 90%
3. Update mock contracts when external dependencies change
4. Review and update gas optimization tests regularly

## Troubleshooting

### Common Issues

1. **Mock Contract Errors**: Ensure mock contracts are properly initialized
2. **Gas Limit Errors**: Adjust gas limits in test setup
3. **Event Emission Errors**: Verify event signatures match contract events
4. **Access Control Errors**: Ensure proper authorization in test setup

### Debug Commands

```bash
# Run specific test with debug output
forge test --match-test testFunctionName -vvv

# Run tests with trace
forge test --match-test testFunctionName --trace

# Run tests with debugger
forge test --match-test testFunctionName --debug
```

## Performance Benchmarks

The test suite includes performance benchmarks:

- **Gas Usage**: Tests measure gas consumption for key operations
- **Execution Time**: Tests measure execution time for complex operations
- **Memory Usage**: Tests verify memory efficiency
- **Storage Efficiency**: Tests verify storage optimization

## Future Enhancements

Planned test improvements:

1. **Property-Based Testing**: Add more comprehensive property-based tests
2. **Stress Testing**: Add tests for high-load scenarios
3. **Cross-Contract Testing**: Add tests for contract interactions
4. **Upgrade Testing**: Add tests for contract upgrade scenarios
5. **Integration Testing**: Add tests with real external contracts

## Conclusion

This comprehensive test suite ensures the reliability, security, and efficiency of the Dragon Realms smart contracts. The tests cover all critical functionality while maintaining high code coverage and following best practices for smart contract testing.
