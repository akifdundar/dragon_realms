// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

/// @title - A simple contract for sending string data across chains.
contract Sender is OwnerIsCreator, ReentrancyGuard {
    // Custom errors to provide more descriptive revert messages.
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
    error InvalidReceiver(address receiver);
    error InvalidChainSelector(uint64 chainSelector);
    error MessageTooLong(string message);

    // Event emitted when a message is sent to another chain.
    event MessageSent(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address receiver, // The address of the receiver on the destination chain.
        string text, // The text being sent.
        address feeToken, // the token address used to pay CCIP fees.
        uint256 fees // The fees paid for sending the CCIP message.
    );

    IRouterClient private s_router;
    LinkTokenInterface private s_linkToken;
    
    // Maximum message length to prevent gas issues
    uint256 private constant MAX_MESSAGE_LENGTH = 1000;

    /// @notice Constructor initializes the contract with the router address.
    /// @param _router The address of the router contract.
    /// @param _link The address of the link contract.
    constructor(address _router, address _link) {
        require(_router != address(0), "Invalid router address");
        require(_link != address(0), "Invalid link address");
        s_router = IRouterClient(_router);
        s_linkToken = LinkTokenInterface(_link);
    }

    /// @notice Sends data to receiver on the destination chain.
    /// @dev Assumes your contract has sufficient LINK.
    /// @param destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param receiver The address of the recipient on the destination blockchain.
    /// @param text The string text to be sent.
    /// @return messageId The ID of the message that was sent.
    function sendMessage(
        uint64 destinationChainSelector,
        address receiver,
        string calldata text
    ) external nonReentrant returns (bytes32 messageId) {
        // Validate inputs
        if (receiver == address(0)) revert InvalidReceiver(receiver);
        if (destinationChainSelector == 0) revert InvalidChainSelector(destinationChainSelector);
        if (bytes(text).length > MAX_MESSAGE_LENGTH) revert MessageTooLong(text);
        
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver), // ABI-encoded receiver address
            data: abi.encode(text), // ABI-encoded string
            tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array indicating no tokens are being sent
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit and allowing out-of-order execution.
                Client.GenericExtraArgsV2({
                    gasLimit: 200_000, // Gas limit for the callback on the destination chain
                    allowOutOfOrderExecution: true // Allows the message to be executed out of order relative to other messages from the same sender
                })
            ),
            // Set the feeToken address, indicating LINK will be used for fees
            feeToken: address(s_linkToken)
        });

        // Get the fee required to send the message
        uint256 fees = s_router.getFee(
            destinationChainSelector,
            evm2AnyMessage
        );

        if (fees > s_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);

        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        s_linkToken.approve(address(s_router), fees);

        // Send the message through the router and store the returned message ID
        messageId = s_router.ccipSend(destinationChainSelector, evm2AnyMessage);

        // Emit an event with message details
        emit MessageSent(
            messageId,
            destinationChainSelector,
            receiver,
            text,
            address(s_linkToken),
            fees
        );

        // Return the message ID
        return messageId;
    }

    /// @notice Allows anyone to send a message (removed onlyOwner restriction)
    /// @param destinationChainSelector The identifier for the destination blockchain.
    /// @param receiver The address of the recipient on the destination blockchain.
    /// @param text The string text to be sent.
    /// @return messageId The ID of the message that was sent.
    function sendMessagePublic(
        uint64 destinationChainSelector,
        address receiver,
        string calldata text
    ) external nonReentrant returns (bytes32 messageId) {
        return sendMessage(destinationChainSelector, receiver, text);
    }

    /// @notice Get the router address
    /// @return The router address
    function getRouter() external view returns (address) {
        return address(s_router);
    }

    /// @notice Get the LINK token address
    /// @return The LINK token address
    function getLinkToken() external view returns (address) {
        return address(s_linkToken);
    }

    /// @notice Get the contract's LINK balance
    /// @return The LINK balance
    function getLinkBalance() external view returns (uint256) {
        return s_linkToken.balanceOf(address(this));
    }

    /// @notice Withdraw LINK tokens from the contract (owner only)
    /// @param amount The amount of LINK to withdraw
    function withdrawLink(uint256 amount) external onlyOwner {
        require(amount <= s_linkToken.balanceOf(address(this)), "Insufficient balance");
        s_linkToken.transfer(msg.sender, amount);
    }
}
