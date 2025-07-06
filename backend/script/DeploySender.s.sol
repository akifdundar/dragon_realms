// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Sender.sol";

contract DeploySender is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Router addresses for different networks
        // Ronin Mainnet: 0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C
        // Ronin Testnet: 0x536d7E53D0aDeB1F20E7c81fea45d02eC8dC8C8C
        address router = vm.envAddress("ROUTER_ADDRESS");
        address linkToken = vm.envAddress("LINK_TOKEN_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        Sender sender = new Sender(router, linkToken);
        
        vm.stopBroadcast();
        
        console.log("Sender contract deployed at:", address(sender));
        console.log("Router address:", router);
        console.log("LINK token address:", linkToken);
    }
} 