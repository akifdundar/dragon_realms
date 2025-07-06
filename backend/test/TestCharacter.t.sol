// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Character} from "../src/Character.sol";

contract CharacterTest is Test {
    Character public character;
    
    address public owner = address(this);
    address public user1 = address(0x111);
    address public user2 = address(0x222);
    address public unauthorizedUser = address(0x999);
    
    string public baseTokenURI = "https://ipfs.io/ipfs/QmYourMetadataHash/";

    function setUp() public {
        character = new Character(baseTokenURI);
    }

    function test_Constructor() public {
        Character newCharacter = new Character(baseTokenURI);
        assertEq(newCharacter.owner(), owner);
    }

    function test_MintCharacter_Success() public {
        vm.prank(user1);
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass.Fire);
        
        assertEq(character.balanceOf(user1), 1);
        assertEq(character.ownerOf(1), user1);
    }

    function test_MintCharacter_InsufficientPayment() public {
        vm.prank(user1);
        vm.expectRevert("InsufficientPayment()");
        character.mintCharacter{value: 0.005 ether}(user1, Character.CharacterClass.Fire);
    }

    function test_MintCharacter_InvalidClass() public {
        vm.prank(user1);
        vm.expectRevert("InvalidClass()");
        // Try to use an invalid class by casting a number that's out of range
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass(uint8(4)));
    }

    function test_MintCharacter_MultipleTokens() public {
        vm.prank(user1);
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass.Fire);
        
        vm.prank(user2);
        character.mintCharacter{value: 0.01 ether}(user2, Character.CharacterClass.Water);
        
        assertEq(character.balanceOf(user1), 1);
        assertEq(character.balanceOf(user2), 1);
        assertEq(character.ownerOf(1), user1);
        assertEq(character.ownerOf(2), user2);
    }

    function test_GetCharacter() public {
        vm.prank(user1);
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass.Fire);
        
        Character.CharacterData memory charData = character.getCharacter(1);
        assertEq(charData.level, 1);
        assertEq(charData.exp, 0);
        assertEq(uint256(charData.class), uint256(Character.CharacterClass.Fire));
        assertEq(charData.attack, 15); // Fire class base attack
        assertEq(charData.defense, 8);  // Fire class base defense
        assertEq(charData.speed, 10);   // Fire class base speed
        assertEq(charData.health, 100); // Fire class base health
        assertEq(charData.energy, 5);   // Fire class base energy
    }

    function test_GetCharacter_RevertWhenTokenDoesNotExist() public {
        vm.expectRevert("CharacterNotFound()");
        character.getCharacter(1);
    }

    function test_GetCharacterAttributes() public {
        vm.prank(user1);
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass.Water);
        
        (uint256 attack, uint256 defense, uint256 speed, uint256 health, uint256 energy) = character.getCharacterAttributes(1);
        assertEq(attack, 10);  // Water class base attack
        assertEq(defense, 12);  // Water class base defense
        assertEq(speed, 12);    // Water class base speed
        assertEq(health, 120);  // Water class base health
        assertEq(energy, 6);    // Water class base energy
    }

    function test_GetCharacterAttributes_RevertWhenTokenDoesNotExist() public {
        vm.expectRevert("CharacterNotFound()");
        character.getCharacterAttributes(1);
    }

    function test_GetCharacterPower() public {
        vm.prank(user1);
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass.Earth);
        
        uint256 power = character.getCharacterPower(1);
        // Earth class: attack(8) + defense(18) + speed(6) = 32
        assertEq(power, 32);
    }

    function test_GetCharacterPower_RevertWhenTokenDoesNotExist() public {
        vm.expectRevert("CharacterNotFound()");
        character.getCharacterPower(1);
    }

    function test_GetRequiredExpForLevel() public {
        uint256 expForLevel1 = character.getRequiredExpForLevel(1);
        uint256 expForLevel2 = character.getRequiredExpForLevel(2);
        uint256 expForLevel3 = character.getRequiredExpForLevel(3);
        
        assertEq(expForLevel1, 100);
        assertGt(expForLevel2, expForLevel1);
        assertGt(expForLevel3, expForLevel2);
    }

    function test_CanPerformAction() public {
        vm.prank(user1);
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass.Air);
        
        // Initially should be able to perform action
        assertTrue(character.canPerformAction(1));
        
        // After using energy, should not be able to perform action
        character.setAuthorizedContract(address(this), true);
        character.useEnergy(1, 8); // Use all energy
        
        assertFalse(character.canPerformAction(1));
    }

    function test_CanPerformAction_RevertWhenTokenDoesNotExist() public {
        assertFalse(character.canPerformAction(1));
    }

    function test_SetAuthorizedContract_Success() public {
        address contractAddress = address(0x123);
        
        character.setAuthorizedContract(contractAddress, true);
        assertTrue(character.authorizedContracts(contractAddress));
        
        character.setAuthorizedContract(contractAddress, false);
        assertFalse(character.authorizedContracts(contractAddress));
    }

    function test_SetAuthorizedContract_RevertWhenNotOwner() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        character.setAuthorizedContract(address(0x123), true);
    }

    function test_SetBaseTokenURI_Success() public {
        string memory newURI = "https://new-ipfs-hash.com/";
        character.setBaseTokenURI(newURI);
        
        assertEq(character.getBaseTokenURI(), newURI);
    }

    function test_SetBaseTokenURI_RevertWhenNotOwner() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        character.setBaseTokenURI("https://new-uri.com/");
    }

    function test_TokenURI() public {
        vm.prank(user1);
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass.Fire);
        
        string memory tokenURI = character.tokenURI(1);
        assertEq(tokenURI, string(abi.encodePacked(baseTokenURI, "1")));
    }

    function test_TokenURI_RevertWhenTokenDoesNotExist() public {
        vm.expectRevert("ERC721: invalid token ID");
        character.tokenURI(1);
    }

    function test_TransferOwnership_Success() public {
        address newOwner = address(0xABC);
        
        character.transferOwnership(newOwner);
        assertEq(character.owner(), newOwner);
    }

    function test_TransferOwnership_RevertWhenNotOwner() public {
        address newOwner = address(0xABC);
        
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        character.transferOwnership(newOwner);
    }

    function test_TransferOwnership_RevertWhenNewOwnerIsZero() public {
        vm.expectRevert("Ownable: new owner is the zero address");
        character.transferOwnership(address(0));
    }

    function test_Integration_CompleteCharacterLifecycle() public {
        // 1. Mint character
        vm.prank(user1);
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass.Fire);
        
        assertEq(character.balanceOf(user1), 1);
        
        // 2. Check initial stats
        Character.CharacterData memory charData = character.getCharacter(1);
        assertEq(charData.level, 1);
        assertEq(charData.exp, 0);
        assertEq(uint256(charData.class), uint256(Character.CharacterClass.Fire));
        
        // 3. Check attributes
        (uint256 attack, uint256 defense, uint256 speed, uint256 health, uint256 energy) = character.getCharacterAttributes(1);
        assertEq(attack, 15);
        assertEq(defense, 8);
        assertEq(speed, 10);
        assertEq(health, 100);
        assertEq(energy, 5);
        
        // 4. Check power level
        uint256 power = character.getCharacterPower(1);
        assertEq(power, 33); // 15 + 8 + 10
        
        // 5. Check if can perform action
        assertTrue(character.canPerformAction(1));
    }

    function test_Withdraw_Success() public {
        // Mint a character to add funds to contract
        vm.prank(user1);
        character.mintCharacter{value: 0.01 ether}(user1, Character.CharacterClass.Fire);
        
        uint256 initialBalance = address(this).balance;
        character.withdraw();
        uint256 finalBalance = address(this).balance;
        
        assertGt(finalBalance, initialBalance);
    }

    function test_Withdraw_RevertWhenNoFunds() public {
        vm.expectRevert("No funds to withdraw");
        character.withdraw();
    }

    function test_Withdraw_RevertWhenNotOwner() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert("Ownable: caller is not the owner");
        character.withdraw();
    }

    function test_AllCharacterClasses() public {
        Character.CharacterClass[] memory classes = new Character.CharacterClass[](4);
        classes[0] = Character.CharacterClass.Fire;
        classes[1] = Character.CharacterClass.Water;
        classes[2] = Character.CharacterClass.Earth;
        classes[3] = Character.CharacterClass.Air;
        
        for (uint i = 0; i < 4; i++) {
            vm.prank(address(uint160(i + 1)));
            character.mintCharacter{value: 0.01 ether}(address(uint160(i + 1)), classes[i]);
            
            Character.CharacterData memory charData = character.getCharacter(i + 1);
            assertEq(uint256(charData.class), uint256(classes[i]));
        }
    }
}
