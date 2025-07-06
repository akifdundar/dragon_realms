// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VRFConsumer
 * @dev A contract that uses Chainlink VRF to generate random numbers
 * @dev This is an example contract - DO NOT USE IN PRODUCTION
 */
contract VRFConsumer is VRFConsumerBaseV2, Ownable, ReentrancyGuard {
    // VRF Coordinator interface
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    
    // VRF configuration
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private immutable i_requestConfirmations;
    uint32 private immutable i_numWords;
    
    // Request tracking
    mapping(uint256 => address) private s_requestIdToSender;
    mapping(uint256 => uint256[]) private s_requestIdToRandomWords;
    mapping(address => uint256[]) private s_userToRandomWords;
    
    // Events
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
    
    // Errors
    error InsufficientLinkBalance();
    error InvalidRequestId();
    error RequestNotFulfilled();
    error InvalidSubscriptionId();
    
    /**
     * @notice Constructor initializes the VRF consumer
     * @param vrfCoordinatorV2 The address of the VRF Coordinator V2
     * @param keyHash The key hash for the VRF
     * @param subscriptionId The subscription ID for VRF
     * @param callbackGasLimit The gas limit for the callback
     * @param requestConfirmations The number of confirmations required
     * @param numWords The number of random words to request
     */
    constructor(
        address vrfCoordinatorV2,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint16 requestConfirmations,
        uint32 numWords
    ) VRFConsumerBaseV2(vrfCoordinatorV2) Ownable(msg.sender) {
        require(vrfCoordinatorV2 != address(0), "Invalid VRF Coordinator");
        require(keyHash != bytes32(0), "Invalid key hash");
        require(subscriptionId > 0, "Invalid subscription ID");
        require(callbackGasLimit > 0, "Invalid callback gas limit");
        require(requestConfirmations > 0, "Invalid request confirmations");
        require(numWords > 0, "Invalid number of words");
        
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_requestConfirmations = requestConfirmations;
        i_numWords = numWords;
    }
    
    /**
     * @notice Request random words from VRF
     * @return requestId The ID of the request
     */
    function requestRandomWords() external nonReentrant returns (uint256 requestId) {
        // Check if subscription has sufficient balance
        (bool success, ) = address(i_vrfCoordinator).call(
            abi.encodeWithSignature("getSubscription(uint64)", i_subscriptionId)
        );
        require(success, "Invalid subscription");
        
        // Request random words
        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            i_requestConfirmations,
            i_callbackGasLimit,
            i_numWords
        );
        
        // Store the sender for this request
        s_requestIdToSender[requestId] = msg.sender;
        
        emit RandomWordsRequested(requestId, msg.sender, block.timestamp);
        
        return requestId;
    }
    
    /**
     * @notice Callback function used by VRF Coordinator to return random words
     * @param requestId The ID of the request
     * @param randomWords Array of random words
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address sender = s_requestIdToSender[requestId];
        require(sender != address(0), "Invalid request ID");
        
        // Store the random words
        s_requestIdToRandomWords[requestId] = randomWords;
        s_userToRandomWords[sender] = randomWords;
        
        emit RandomWordsReceived(requestId, sender, randomWords, block.timestamp);
    }
    
    /**
     * @notice Get random words for a specific request
     * @param requestId The request ID
     * @return randomWords Array of random words
     */
    function getRandomWords(uint256 requestId) external view returns (uint256[] memory) {
        uint256[] memory randomWords = s_requestIdToRandomWords[requestId];
        require(randomWords.length > 0, "Request not fulfilled");
        return randomWords;
    }
    
    /**
     * @notice Get random words for a specific user
     * @param user The user address
     * @return randomWords Array of random words
     */
    function getUserRandomWords(address user) external view returns (uint256[] memory) {
        return s_userToRandomWords[user];
    }
    
    /**
     * @notice Get the sender for a specific request
     * @param requestId The request ID
     * @return sender The sender address
     */
    function getRequestSender(uint256 requestId) external view returns (address) {
        return s_requestIdToSender[requestId];
    }
    
    /**
     * @notice Check if a request has been fulfilled
     * @param requestId The request ID
     * @return fulfilled True if fulfilled
     */
    function isRequestFulfilled(uint256 requestId) external view returns (bool) {
        return s_requestIdToRandomWords[requestId].length > 0;
    }
    
    /**
     * @notice Get VRF configuration
     * @return vrfCoordinator The VRF coordinator address
     * @return keyHash The key hash
     * @return subscriptionId The subscription ID
     * @return callbackGasLimit The callback gas limit
     * @return requestConfirmations The request confirmations
     * @return numWords The number of words
     */
    function getVRFConfig() external view returns (
        address vrfCoordinator,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint16 requestConfirmations,
        uint32 numWords
    ) {
        return (
            address(i_vrfCoordinator),
            i_keyHash,
            i_subscriptionId,
            i_callbackGasLimit,
            i_requestConfirmations,
            i_numWords
        );
    }
    
    /**
     * @notice Emergency function to cancel subscription (owner only)
     */
    function cancelSubscription() external onlyOwner {
        i_vrfCoordinator.cancelSubscription(i_subscriptionId, msg.sender);
    }
    
    /**
     * @notice Withdraw LINK tokens from the contract (owner only)
     * @param amount The amount to withdraw
     */
    function withdrawLink(uint256 amount) external onlyOwner {
        require(amount <= LINK.balanceOf(address(this)), "Insufficient balance");
        LINK.transfer(msg.sender, amount);
    }
    
    /**
     * @notice Get the contract's LINK balance
     * @return balance The LINK balance
     */
    function getLinkBalance() external view returns (uint256) {
        return LINK.balanceOf(address(this));
    }
} 