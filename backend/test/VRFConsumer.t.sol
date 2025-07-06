// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {VRFConsumer} from "../src/VRFConsumer.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

contract VRFConsumerTest is Test {
    VRFConsumer public vrfConsumer;
    
    // Mock addresses for testing
    address public mockVRFCoordinator = address(0x123);
    address public mockLinkToken = address(0x456);
    address public owner = address(this);
    address public user1 = address(0x111);
    address public user2 = address(0x222);
    address public unauthorizedUser = address(0x999);
    
    // VRF configuration
    bytes32 public keyHash = bytes32("0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15");
    uint64 public subscriptionId = 1;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    
    // Mock request ID
    uint256 public mockRequestId = 12345;
    
    event RandomWordsRequested(
        uint256 indexed requestId,
        address indexed sender,
        uint256 timestamp
    );
    
    event RandomWordsReceived(
        uint256 indexed requestId,
        address indexed sender,
        uint256[] randomWords,
        uint256 timestamp
    );

    function setUp() public {
        // Mock VRF Coordinator calls
        vm.mockCall(mockVRFCoordinator, abi.encodeWithSelector(VRFCoordinatorV2Interface.requestRandomWords.selector), abi.encode(mockRequestId));
        vm.mockCall(mockVRFCoordinator, abi.encodeWithSelector(VRFCoordinatorV2Interface.getSubscription.selector), abi.encode(true));
        vm.mockCall(mockVRFCoordinator, abi.encodeWithSelector(VRFCoordinatorV2Interface.cancelSubscription.selector), abi.encode());
        
        // Mock LINK token calls
        vm.mockCall(mockLinkToken, abi.encodeWithSelector(LinkTokenInterface.balanceOf.selector), abi.encode(1000 ether));
        vm.mockCall(mockLinkToken, abi.encodeWithSelector(LinkTokenInterface.transfer.selector), abi.encode(true));
        
        vrfConsumer = new VRFConsumer(
            mockVRFCoordinator,
            keyHash,
            subscriptionId,
            callbackGasLimit,
            requestConfirmations,
            numWords
        );
    }

    function test_Constructor() public {
        VRFConsumer newConsumer = new VRFConsumer(
            mockVRFCoordinator,
            keyHash,
            subscriptionId,
            callbackGasLimit,
            requestConfirmations,
            numWords
        );
        
        assertEq(newConsumer.owner(), owner);
        
        (address vrfCoordinator, bytes32 configKeyHash, uint64 configSubscriptionId, uint32 configCallbackGasLimit, uint16 configRequestConfirmations, uint32 configNumWords) = newConsumer.getVRFConfig();
        
        assertEq(vrfCoordinator, mockVRFCoordinator);
        assertEq(configKeyHash, keyHash);
        assertEq(configSubscriptionId, subscriptionId);
        assertEq(configCallbackGasLimit, callbackGasLimit);
        assertEq(configRequestConfirmations, requestConfirmations);
        assertEq(configNumWords, numWords);
    }

    function test_Constructor_RevertWhenInvalidVRFCoordinator() public {
        vm.expectRevert("Invalid VRF Coordinator");
        new VRFConsumer(
            address(0),
            keyHash,
            subscriptionId,
            callbackGasLimit,
            requestConfirmations,
            numWords
        );
    }

    function test_Constructor_RevertWhenInvalidKeyHash() public {
        vm.expectRevert("Invalid key hash");
        new VRFConsumer(
            mockVRFCoordinator,
            bytes32(0),
            subscriptionId,
            callbackGasLimit,
            requestConfirmations,
            numWords
        );
    }

    function test_Constructor_RevertWhenInvalidSubscriptionId() public {
        vm.expectRevert("Invalid subscription ID");
        new VRFConsumer(
            mockVRFCoordinator,
            keyHash,
            0,
            callbackGasLimit,
            requestConfirmations,
            numWords
        );
    }

    function test_Constructor_RevertWhenInvalidCallbackGasLimit() public {
        vm.expectRevert("Invalid callback gas limit");
        new VRFConsumer(
            mockVRFCoordinator,
            keyHash,
            subscriptionId,
            0,
            requestConfirmations,
            numWords
        );
    }

    function test_Constructor_RevertWhenInvalidRequestConfirmations() public {
        vm.expectRevert("Invalid request confirmations");
        new VRFConsumer(
            mockVRFCoordinator,
            keyHash,
            subscriptionId,
            callbackGasLimit,
            0,
            numWords
        );
    }

    function test_Constructor_RevertWhenInvalidNumWords() public {
        vm.expectRevert("Invalid number of words");
        new VRFConsumer(
            mockVRFCoordinator,
            keyHash,
            subscriptionId,
            callbackGasLimit,
            requestConfirmations,
            0
        );
    }

    function test_RequestRandomWords_Success() public {
        vm.expectEmit(true, true, false, true);
        emit RandomWordsRequested(mockRequestId, user1, block.timestamp);
        
        vm.prank(user1);
        uint256 requestId = vrfConsumer.requestRandomWords();
        
        assertEq(requestId, mockRequestId);
        assertEq(vrfConsumer.getRequestSender(requestId), user1);
        assertFalse(vrfConsumer.isRequestFulfilled(requestId));
    }

    function test_RequestRandomWords_RevertWhenInvalidSubscription() public {
        // Mock invalid subscription
        vm.mockCall(mockVRFCoordinator, abi.encodeWithSelector(VRFCoordinatorV2Interface.getSubscription.selector), abi.encode(false));
        
        vm.prank(user1);
        vm.expectRevert("Invalid subscription");
        vrfConsumer.requestRandomWords();
    }

    function test_FulfillRandomWords_Success() public {
        // First request random words
        vm.prank(user1);
        uint256 requestId = vrfConsumer.requestRandomWords();
        
        // Mock random words
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 123456789;
        
        vm.expectEmit(true, true, false, true);
        emit RandomWordsReceived(requestId, user1, randomWords, block.timestamp);
        
        // Simulate VRF Coordinator calling fulfillRandomWords
        vrfConsumer.fulfillRandomWords(requestId, randomWords);
        
        // Verify the random words are stored
        uint256[] memory storedWords = vrfConsumer.getRandomWords(requestId);
        assertEq(storedWords.length, 1);
        assertEq(storedWords[0], 123456789);
        
        // Verify user's random words
        uint256[] memory userWords = vrfConsumer.getUserRandomWords(user1);
        assertEq(userWords.length, 1);
        assertEq(userWords[0], 123456789);
        
        // Verify request is fulfilled
        assertTrue(vrfConsumer.isRequestFulfilled(requestId));
    }

    function test_FulfillRandomWords_RevertWhenInvalidRequestId() public {
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 123456789;
        
        vm.expectRevert("Invalid request ID");
        vrfConsumer.fulfillRandomWords(99999, randomWords);
    }

    function test_GetRandomWords_RevertWhenRequestNotFulfilled() public {
        vm.expectRevert("Request not fulfilled");
        vrfConsumer.getRandomWords(mockRequestId);
    }

    function test_GetUserRandomWords_EmptyArray() public {
        uint256[] memory userWords = vrfConsumer.getUserRandomWords(user1);
        assertEq(userWords.length, 0);
    }

    function test_GetUserRandomWords_WithRandomWords() public {
        // Request and fulfill random words
        vm.prank(user1);
        uint256 requestId = vrfConsumer.requestRandomWords();
        
        uint256[] memory randomWords = new uint256[](2);
        randomWords[0] = 123456789;
        randomWords[1] = 987654321;
        
        vrfConsumer.fulfillRandomWords(requestId, randomWords);
        
        uint256[] memory userWords = vrfConsumer.getUserRandomWords(user1);
        assertEq(userWords.length, 2);
        assertEq(userWords[0], 123456789);
        assertEq(userWords[1], 987654321);
    }

    function test_GetRequestSender() public {
        vm.prank(user1);
        uint256 requestId = vrfConsumer.requestRandomWords();
        
        address sender = vrfConsumer.getRequestSender(requestId);
        assertEq(sender, user1);
    }

    function test_IsRequestFulfilled() public {
        vm.prank(user1);
        uint256 requestId = vrfConsumer.requestRandomWords();
        
        // Initially not fulfilled
        assertFalse(vrfConsumer.isRequestFulfilled(requestId));
        
        // Fulfill the request
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 123456789;
        vrfConsumer.fulfillRandomWords(requestId, randomWords);
        
        // Now fulfilled
        assertTrue(vrfConsumer.isRequestFulfilled(requestId));
    }

    function test_GetVRFConfig() public {
        (address vrfCoordinator, bytes32 configKeyHash, uint64 configSubscriptionId, uint32 configCallbackGasLimit, uint16 configRequestConfirmations, uint32 configNumWords) = vrfConsumer.getVRFConfig();
        
        assertEq(vrfCoordinator, mockVRFCoordinator);
        assertEq(configKeyHash, keyHash);
        assertEq(configSubscriptionId, subscriptionId);
        assertEq(configCallbackGasLimit, callbackGasLimit);
        assertEq(configRequestConfirmations, requestConfirmations);
        assertEq(configNumWords, numWords);
    }

    function test_CancelSubscription_Success() public {
        vrfConsumer.cancelSubscription();
        // No revert means success
    }

    function test_CancelSubscription_RevertWhenNotOwner() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        vrfConsumer.cancelSubscription();
    }

    function test_WithdrawLink_Success() public {
        uint256 amount = 100 ether;
        vrfConsumer.withdrawLink(amount);
        // No revert means success
    }

    function test_WithdrawLink_RevertWhenNotOwner() public {
        uint256 amount = 100 ether;
        
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        vrfConsumer.withdrawLink(amount);
    }

    function test_WithdrawLink_RevertWhenInsufficientBalance() public {
        uint256 amount = 2000 ether; // More than balance
        
        vm.expectRevert("Insufficient balance");
        vrfConsumer.withdrawLink(amount);
    }

    function test_GetLinkBalance() public {
        uint256 balance = vrfConsumer.getLinkBalance();
        assertEq(balance, 1000 ether);
    }

    function testFuzz_RequestRandomWordsWithDifferentUsers(address user) public {
        vm.assume(user != address(0));
        
        vm.prank(user);
        uint256 requestId = vrfConsumer.requestRandomWords();
        
        assertEq(vrfConsumer.getRequestSender(requestId), user);
        assertFalse(vrfConsumer.isRequestFulfilled(requestId));
    }

    function testFuzz_FulfillRandomWordsWithDifferentSizes(uint256 numWords) public {
        vm.assume(numWords > 0);
        vm.assume(numWords <= 10); // Reasonable limit
        
        // Request random words
        vm.prank(user1);
        uint256 requestId = vrfConsumer.requestRandomWords();
        
        // Create random words array
        uint256[] memory randomWords = new uint256[](numWords);
        for (uint i = 0; i < numWords; i++) {
            randomWords[i] = i + 1;
        }
        
        // Fulfill the request
        vrfConsumer.fulfillRandomWords(requestId, randomWords);
        
        // Verify the random words
        uint256[] memory storedWords = vrfConsumer.getRandomWords(requestId);
        assertEq(storedWords.length, numWords);
        
        for (uint i = 0; i < numWords; i++) {
            assertEq(storedWords[i], i + 1);
        }
    }

    function test_Integration_MultipleRequests() public {
        // First user requests
        vm.prank(user1);
        uint256 requestId1 = vrfConsumer.requestRandomWords();
        
        // Second user requests
        vm.prank(user2);
        uint256 requestId2 = vrfConsumer.requestRandomWords();
        
        // Fulfill first request
        uint256[] memory randomWords1 = new uint256[](1);
        randomWords1[0] = 111111;
        vrfConsumer.fulfillRandomWords(requestId1, randomWords1);
        
        // Fulfill second request
        uint256[] memory randomWords2 = new uint256[](1);
        randomWords2[0] = 222222;
        vrfConsumer.fulfillRandomWords(requestId2, randomWords2);
        
        // Verify both requests
        assertTrue(vrfConsumer.isRequestFulfilled(requestId1));
        assertTrue(vrfConsumer.isRequestFulfilled(requestId2));
        
        uint256[] memory storedWords1 = vrfConsumer.getRandomWords(requestId1);
        uint256[] memory storedWords2 = vrfConsumer.getRandomWords(requestId2);
        
        assertEq(storedWords1[0], 111111);
        assertEq(storedWords2[0], 222222);
        
        // Verify user random words
        uint256[] memory user1Words = vrfConsumer.getUserRandomWords(user1);
        uint256[] memory user2Words = vrfConsumer.getUserRandomWords(user2);
        
        assertEq(user1Words[0], 111111);
        assertEq(user2Words[0], 222222);
    }

    function test_ReentrancyProtection() public {
        // First request should succeed
        vm.prank(user1);
        uint256 requestId1 = vrfConsumer.requestRandomWords();
        
        // Second request should also succeed
        vm.prank(user2);
        uint256 requestId2 = vrfConsumer.requestRandomWords();
        
        assertEq(vrfConsumer.getRequestSender(requestId1), user1);
        assertEq(vrfConsumer.getRequestSender(requestId2), user2);
    }

    function test_EventEmission_RandomWordsRequested() public {
        vm.expectEmit(true, true, false, true);
        emit RandomWordsRequested(mockRequestId, user1, block.timestamp);
        
        vm.prank(user1);
        vrfConsumer.requestRandomWords();
    }

    function test_EventEmission_RandomWordsReceived() public {
        vm.prank(user1);
        uint256 requestId = vrfConsumer.requestRandomWords();
        
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 123456789;
        
        vm.expectEmit(true, true, false, true);
        emit RandomWordsReceived(requestId, user1, randomWords, block.timestamp);
        
        vrfConsumer.fulfillRandomWords(requestId, randomWords);
    }
} 