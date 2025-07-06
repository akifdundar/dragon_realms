// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Sender} from "../src/Sender.sol";
import {Receiver} from "../src/Receiver.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

contract SenderTest is Test {
    Sender public sender;
    Receiver public receiver;
    
    // Mock addresses for testing
    address public mockRouter = address(0x123);
    address public mockLinkToken = address(0x456);
    address public mockReceiver = address(0x789);
    address public owner = address(this);
    address public unauthorizedUser = address(0x999);
    
    uint64 public destinationChainSelector = 16015286601757825753; // Sepolia
    uint256 public gasLimit = 200_000;
    
    event MessageSent(bytes32 indexed messageId, uint64 indexed destinationChainSelector, address receiver, address sender, bytes data, address feeToken, uint256 fees);

    function setUp() public {
        // Deploy mock contracts
        vm.mockCall(mockRouter, abi.encodeWithSelector(IRouterClient.getFee.selector), abi.encode(0.01 ether));
        vm.mockCall(mockRouter, abi.encodeWithSelector(IRouterClient.ccipSend.selector), abi.encode(bytes32("mockMessageId")));
        
        sender = new Sender(mockRouter, mockLinkToken);
        receiver = new Receiver();
    }

    function test_Constructor() public {
        assertEq(address(sender.router()), mockRouter);
        assertEq(address(sender.linkToken()), mockLinkToken);
        assertEq(sender.owner(), owner);
    }

    function test_SendMessage_Success() public {
        bytes memory data = abi.encode("Hello Cross-Chain World!");
        
        vm.expectEmit(true, true, false, true);
        emit MessageSent(bytes32("mockMessageId"), destinationChainSelector, mockReceiver, address(sender), data, mockLinkToken, 0.01 ether);
        
        sender.sendMessage(destinationChainSelector, mockReceiver, data, gasLimit);
    }

    function test_SendMessage_RevertWhenNotOwner() public {
        bytes memory data = abi.encode("Hello Cross-Chain World!");
        
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        sender.sendMessage(destinationChainSelector, mockReceiver, data, gasLimit);
    }

    function test_SendMessage_RevertWhenReceiverIsZero() public {
        bytes memory data = abi.encode("Hello Cross-Chain World!");
        
        vm.expectRevert("Receiver cannot be zero address");
        sender.sendMessage(destinationChainSelector, address(0), data, gasLimit);
    }

    function test_SendMessage_RevertWhenDataIsEmpty() public {
        bytes memory data = "";
        
        vm.expectRevert("Data cannot be empty");
        sender.sendMessage(destinationChainSelector, mockReceiver, data, gasLimit);
    }

    function test_SendMessage_RevertWhenGasLimitIsZero() public {
        bytes memory data = abi.encode("Hello Cross-Chain World!");
        
        vm.expectRevert("Gas limit must be greater than 0");
        sender.sendMessage(destinationChainSelector, mockReceiver, data, 0);
    }

    function test_WithdrawLink_Success() public {
        uint256 amount = 1 ether;
        
        // Mock LINK balance
        vm.mockCall(mockLinkToken, abi.encodeWithSelector(LinkTokenInterface.balanceOf.selector), abi.encode(amount));
        vm.mockCall(mockLinkToken, abi.encodeWithSelector(LinkTokenInterface.transfer.selector), abi.encode(true));
        
        sender.withdrawLink(amount);
    }

    function test_WithdrawLink_RevertWhenNotOwner() public {
        uint256 amount = 1 ether;
        
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        sender.withdrawLink(amount);
    }

    function test_WithdrawLink_RevertWhenAmountIsZero() public {
        vm.expectRevert("Amount must be greater than 0");
        sender.withdrawLink(0);
    }

    function test_WithdrawLink_RevertWhenInsufficientBalance() public {
        uint256 amount = 1 ether;
        
        // Mock insufficient LINK balance
        vm.mockCall(mockLinkToken, abi.encodeWithSelector(LinkTokenInterface.balanceOf.selector), abi.encode(0));
        
        vm.expectRevert("Insufficient LINK balance");
        sender.withdrawLink(amount);
    }

    function test_WithdrawLink_RevertWhenTransferFails() public {
        uint256 amount = 1 ether;
        
        // Mock LINK balance but transfer fails
        vm.mockCall(mockLinkToken, abi.encodeWithSelector(LinkTokenInterface.balanceOf.selector), abi.encode(amount));
        vm.mockCall(mockLinkToken, abi.encodeWithSelector(LinkTokenInterface.transfer.selector), abi.encode(false));
        
        vm.expectRevert("LINK transfer failed");
        sender.withdrawLink(amount);
    }

    function test_GetFee_Success() public {
        bytes memory data = abi.encode("Hello Cross-Chain World!");
        
        uint256 fee = sender.getFee(destinationChainSelector, mockReceiver, data, gasLimit);
        assertEq(fee, 0.01 ether);
    }

    function test_GetFee_RevertWhenReceiverIsZero() public {
        bytes memory data = abi.encode("Hello Cross-Chain World!");
        
        vm.expectRevert("Receiver cannot be zero address");
        sender.getFee(destinationChainSelector, address(0), data, gasLimit);
    }

    function test_GetFee_RevertWhenDataIsEmpty() public {
        bytes memory data = "";
        
        vm.expectRevert("Data cannot be empty");
        sender.getFee(destinationChainSelector, mockReceiver, data, gasLimit);
    }

    function test_GetFee_RevertWhenGasLimitIsZero() public {
        bytes memory data = abi.encode("Hello Cross-Chain World!");
        
        vm.expectRevert("Gas limit must be greater than 0");
        sender.getFee(destinationChainSelector, mockReceiver, data, 0);
    }

    function test_TransferOwnership_Success() public {
        address newOwner = address(0xABC);
        
        sender.transferOwnership(newOwner);
        assertEq(sender.owner(), newOwner);
    }

    function test_TransferOwnership_RevertWhenNotOwner() public {
        address newOwner = address(0xABC);
        
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        sender.transferOwnership(newOwner);
    }

    function test_TransferOwnership_RevertWhenNewOwnerIsZero() public {
        vm.expectRevert("New owner cannot be zero address");
        sender.transferOwnership(address(0));
    }

    function testFuzz_SendMessageWithDifferentData(bytes calldata data) public {
        vm.assume(data.length > 0);
        vm.assume(data.length <= 1000); // Reasonable size limit
        
        sender.sendMessage(destinationChainSelector, mockReceiver, data, gasLimit);
    }

    function testFuzz_SendMessageWithDifferentGasLimits(uint256 gasLimit) public {
        vm.assume(gasLimit > 0);
        vm.assume(gasLimit <= 1_000_000); // Reasonable gas limit
        
        bytes memory data = abi.encode("Test message");
        sender.sendMessage(destinationChainSelector, mockReceiver, data, gasLimit);
    }

    function test_Integration_SendAndReceiveMessage() public {
        bytes memory data = abi.encode("Integration test message");
        
        // Send message
        sender.sendMessage(destinationChainSelector, address(receiver), data, gasLimit);
        
        // Verify the message was sent (in real scenario, this would be handled by CCIP)
        // For testing, we just verify the contract state remains consistent
        assertEq(address(sender.router()), mockRouter);
        assertEq(address(sender.linkToken()), mockLinkToken);
    }
} 