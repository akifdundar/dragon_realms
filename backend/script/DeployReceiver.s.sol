// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Receiver.sol";

contract DeployReceiver is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Router addresses for different networks
        // Ronin Mainnet: 0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C
        // Ronin Testnet: 0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C
        address router = vm.envAddress("ROUTER_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        Receiver receiver = new Receiver(router);
        
        vm.stopBroadcast();
        
        console.log("Receiver contract deployed at:", address(receiver));
        console.log("Router address:", router);
    }
} 