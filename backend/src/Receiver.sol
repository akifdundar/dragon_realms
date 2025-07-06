// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

/// @title - A simple contract for receiving string data across chains.
contract Receiver is CCIPReceiver, ReentrancyGuard {
    // Custom errors
    error InvalidMessage();
    error MessageTooLong(string message);
    error UnauthorizedSender(address sender);

    // Event emitted when a message is received from another chain.
    event MessageReceived(
        bytes32 indexed messageId, // The unique ID of the message.
        uint64 indexed sourceChainSelector, // The chain selector of the source chain.
        address sender, // The address of the sender from the source chain.
        string text // The text that was received.
    );

    // Event emitted when a message is processed
    event MessageProcessed(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        string text,
        uint256 timestamp
    );

    bytes32 private s_lastReceivedMessageId; // Store the last received messageId.
    string private s_lastReceivedText; // Store the last received text.
    uint256 private s_messageCount; // Count of received messages
    mapping(bytes32 => bool) private s_processedMessages; // Track processed messages
    mapping(uint64 => address[]) private s_authorizedSenders; // Authorized senders per chain

    // Maximum message length
    uint256 private constant MAX_MESSAGE_LENGTH = 1000;

    /// @notice Constructor initializes the contract with the router address.
    /// @param router The address of the router contract.
    constructor(address router) CCIPReceiver(router) {
        require(router != address(0), "Invalid router address");
    }

    /// @notice Add authorized sender for a specific chain
    /// @param chainSelector The chain selector
    /// @param sender The authorized sender address
    function addAuthorizedSender(uint64 chainSelector, address sender) external onlyOwner {
        require(sender != address(0), "Invalid sender address");
        s_authorizedSenders[chainSelector].push(sender);
    }

    /// @notice Remove authorized sender for a specific chain
    /// @param chainSelector The chain selector
    /// @param sender The sender address to remove
    function removeAuthorizedSender(uint64 chainSelector, address sender) external onlyOwner {
        address[] storage senders = s_authorizedSenders[chainSelector];
        for (uint i = 0; i < senders.length; i++) {
            if (senders[i] == sender) {
                senders[i] = senders[senders.length - 1];
                senders.pop();
                break;
            }
        }
    }

    /// @notice Check if sender is authorized for a specific chain
    /// @param chainSelector The chain selector
    /// @param sender The sender address
    /// @return True if authorized
    function isAuthorizedSender(uint64 chainSelector, address sender) public view returns (bool) {
        address[] storage senders = s_authorizedSenders[chainSelector];
        for (uint i = 0; i < senders.length; i++) {
            if (senders[i] == sender) {
                return true;
            }
        }
        return false;
    }

    /// @notice handle a received message
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        // Validate message
        if (any2EvmMessage.data.length == 0) revert InvalidMessage();
        
        // Decode the message
        string memory receivedText = abi.decode(any2EvmMessage.data, (string));
        
        // Check message length
        if (bytes(receivedText).length > MAX_MESSAGE_LENGTH) {
            revert MessageTooLong(receivedText);
        }

        // Check if sender is authorized (optional - remove if you want to accept all messages)
        address sender = abi.decode(any2EvmMessage.sender, (address));
        if (s_authorizedSenders[any2EvmMessage.sourceChainSelector].length > 0) {
            if (!isAuthorizedSender(any2EvmMessage.sourceChainSelector, sender)) {
                revert UnauthorizedSender(sender);
            }
        }

        // Check if message was already processed
        if (s_processedMessages[any2EvmMessage.messageId]) {
            return; // Message already processed
        }

        // Mark message as processed
        s_processedMessages[any2EvmMessage.messageId] = true;

        // Update state
        s_lastReceivedMessageId = any2EvmMessage.messageId;
        s_lastReceivedText = receivedText;
        s_messageCount++;

        // Emit events
        emit MessageReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector,
            sender,
            receivedText
        );

        emit MessageProcessed(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector,
            sender,
            receivedText,
            block.timestamp
        );
    }

    /// @notice Fetches the details of the last received message.
    /// @return messageId The ID of the last received message.
    /// @return text The last received text.
    function getLastReceivedMessageDetails()
        external
        view
        returns (bytes32 messageId, string memory text)
    {
        return (s_lastReceivedMessageId, s_lastReceivedText);
    }

    /// @notice Get the total number of messages received
    /// @return The message count
    function getMessageCount() external view returns (uint256) {
        return s_messageCount;
    }

    /// @notice Check if a message has been processed
    /// @param messageId The message ID to check
    /// @return True if processed
    function isMessageProcessed(bytes32 messageId) external view returns (bool) {
        return s_processedMessages[messageId];
    }

    /// @notice Get authorized senders for a specific chain
    /// @param chainSelector The chain selector
    /// @return Array of authorized sender addresses
    function getAuthorizedSenders(uint64 chainSelector) external view returns (address[] memory) {
        return s_authorizedSenders[chainSelector];
    }

    /// @notice Emergency function to pause message processing (owner only)
    /// @dev This is a basic implementation - you might want to add a pause mechanism
    function emergencyPause() external onlyOwner {
        // Implementation depends on your needs
        // You could add a pause state variable and check it in _ccipReceive
    }
}
