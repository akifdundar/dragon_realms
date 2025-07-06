// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Character.sol";

contract DeployCharacter is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        string memory baseTokenURI = "ipfs://bafkreihw33wttxue4llp3yn2bsbik6xrvweef77d53evlh75i677ciu6oq/";
        
        vm.startBroadcast(deployerPrivateKey);
        
        Character character = new Character(baseTokenURI);
        
        vm.stopBroadcast();
        
        console.log("Character contract deployed at:", address(character));
        console.log("Base Token URI:", baseTokenURI);
    }
} 