// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/VRFConsumer.sol";

contract DeployVRFConsumer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // VRF Configuration for different networks
        // These are example addresses - replace with actual network addresses
        address vrfCoordinator = vm.envAddress("VRF_COORDINATOR_ADDRESS");
        bytes32 keyHash = vm.envBytes32("VRF_KEY_HASH");
        uint64 subscriptionId = vm.envUint64("VRF_SUBSCRIPTION_ID");
        uint32 callbackGasLimit = vm.envUint32("VRF_CALLBACK_GAS_LIMIT");
        uint16 requestConfirmations = vm.envUint16("VRF_REQUEST_CONFIRMATIONS");
        uint32 numWords = vm.envUint32("VRF_NUM_WORDS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        VRFConsumer vrfConsumer = new VRFConsumer(
            vrfCoordinator,
            keyHash,
            subscriptionId,
            callbackGasLimit,
            requestConfirmations,
            numWords
        );
        
        vm.stopBroadcast();
        
        console.log("VRFConsumer contract deployed at:", address(vrfConsumer));
        console.log("VRF Coordinator address:", vrfCoordinator);
        console.log("Key Hash:", keyHash);
        console.log("Subscription ID:", subscriptionId);
        console.log("Callback Gas Limit:", callbackGasLimit);
        console.log("Request Confirmations:", requestConfirmations);
        console.log("Number of Words:", numWords);
    }
} 