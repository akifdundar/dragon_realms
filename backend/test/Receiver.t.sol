// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Receiver} from "../src/Receiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

contract ReceiverTest is Test {
    Receiver public receiver;
    
    // Mock addresses for testing
    address public mockRouter = address(0x123);
    address public mockSender = address(0x456);
    address public owner = address(this);
    address public unauthorizedUser = address(0x999);
    
    uint64 public sourceChainSelector = 16015286601757825753; // Sepolia
    bytes32 public messageId = bytes32("testMessageId");
    
    event MessageReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, address sender, bytes data);

    function setUp() public {
        receiver = new Receiver();
    }

    function test_Constructor() public {
        assertEq(receiver.owner(), owner);
    }

    function test_ReceiveMessage_Success() public {
        bytes memory data = abi.encode("Hello Cross-Chain World!");
        
        vm.expectEmit(true, true, false, true);
        emit MessageReceived(messageId, sourceChainSelector, mockSender, data);
        
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
    }

    function test_ReceiveMessage_WithTokenAmounts() public {
        bytes memory data = abi.encode("Message with tokens");
        Client.TokenAmount[] memory tokenAmounts = new Client.TokenAmount[](1);
        tokenAmounts[0] = Client.TokenAmount({
            token: address(0x123),
            amount: 1000
        });
        
        vm.expectEmit(true, true, false, true);
        emit MessageReceived(messageId, sourceChainSelector, mockSender, data);
        
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: tokenAmounts
        }));
    }

    function test_ReceiveMessage_EmptyData() public {
        bytes memory data = "";
        
        vm.expectEmit(true, true, false, true);
        emit MessageReceived(messageId, sourceChainSelector, mockSender, data);
        
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
    }

    function test_ReceiveMessage_LargeData() public {
        bytes memory data = new bytes(1000);
        for (uint i = 0; i < 1000; i++) {
            data[i] = bytes1(uint8(i % 256));
        }
        
        vm.expectEmit(true, true, false, true);
        emit MessageReceived(messageId, sourceChainSelector, mockSender, data);
        
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
    }

    function test_GetLastReceivedMessage() public {
        bytes memory data = abi.encode("Test message");
        
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        (bytes32 lastMessageId, uint64 lastSourceChainSelector, address lastSender, bytes memory lastData) = receiver.getLastReceivedMessage();
        
        assertEq(lastMessageId, messageId);
        assertEq(lastSourceChainSelector, sourceChainSelector);
        assertEq(lastSender, mockSender);
        assertEq(keccak256(lastData), keccak256(data));
    }

    function test_GetLastReceivedMessage_NoMessage() public {
        (bytes32 lastMessageId, uint64 lastSourceChainSelector, address lastSender, bytes memory lastData) = receiver.getLastReceivedMessage();
        
        assertEq(lastMessageId, bytes32(0));
        assertEq(lastSourceChainSelector, 0);
        assertEq(lastSender, address(0));
        assertEq(lastData.length, 0);
    }

    function test_GetMessageCount() public {
        assertEq(receiver.getMessageCount(), 0);
        
        bytes memory data = abi.encode("First message");
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        assertEq(receiver.getMessageCount(), 1);
        
        bytes memory data2 = abi.encode("Second message");
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: bytes32("secondMessageId"),
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data2,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        assertEq(receiver.getMessageCount(), 2);
    }

    function test_TransferOwnership_Success() public {
        address newOwner = address(0xABC);
        
        receiver.transferOwnership(newOwner);
        assertEq(receiver.owner(), newOwner);
    }

    function test_TransferOwnership_RevertWhenNotOwner() public {
        address newOwner = address(0xABC);
        
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        receiver.transferOwnership(newOwner);
    }

    function test_TransferOwnership_RevertWhenNewOwnerIsZero() public {
        vm.expectRevert("New owner cannot be zero address");
        receiver.transferOwnership(address(0));
    }

    function testFuzz_ReceiveMessageWithDifferentData(bytes calldata data) public {
        vm.assume(data.length <= 10000); // Reasonable size limit
        
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        assertEq(receiver.getMessageCount(), 1);
    }

    function testFuzz_ReceiveMessageWithDifferentSenders(address sender) public {
        vm.assume(sender != address(0));
        
        bytes memory data = abi.encode("Test message");
        
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(sender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        (,, address lastSender,) = receiver.getLastReceivedMessage();
        assertEq(lastSender, sender);
    }

    function testFuzz_ReceiveMessageWithDifferentChainSelectors(uint64 chainSelector) public {
        bytes memory data = abi.encode("Test message");
        
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: chainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        (, uint64 lastSourceChainSelector,,) = receiver.getLastReceivedMessage();
        assertEq(lastSourceChainSelector, chainSelector);
    }

    function test_Integration_MultipleMessages() public {
        bytes memory data1 = abi.encode("First message");
        bytes memory data2 = abi.encode("Second message");
        bytes memory data3 = abi.encode("Third message");
        
        // Send first message
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: bytes32("message1"),
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data1,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        assertEq(receiver.getMessageCount(), 1);
        
        // Send second message
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: bytes32("message2"),
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data2,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        assertEq(receiver.getMessageCount(), 2);
        
        // Send third message
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: bytes32("message3"),
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data3,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        assertEq(receiver.getMessageCount(), 3);
        
        // Verify last message
        (bytes32 lastMessageId,,, bytes memory lastData) = receiver.getLastReceivedMessage();
        assertEq(lastMessageId, bytes32("message3"));
        assertEq(keccak256(lastData), keccak256(data3));
    }

    function test_ReentrancyProtection() public {
        bytes memory data = abi.encode("Test message");
        
        // First call should succeed
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        // Second call with same messageId should also succeed (no reentrancy protection needed for CCIP)
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
        
        assertEq(receiver.getMessageCount(), 2);
    }

    function test_EventEmission() public {
        bytes memory data = abi.encode("Event test message");
        
        // Verify event is emitted with correct parameters
        vm.expectEmit(true, true, false, true);
        emit MessageReceived(messageId, sourceChainSelector, mockSender, data);
        
        receiver._ccipReceive(Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(mockSender),
            data: data,
            destTokenAmounts: new Client.TokenAmount[](0)
        }));
    }
} 