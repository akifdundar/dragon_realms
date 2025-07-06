// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Character is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Character classes
    enum CharacterClass { Fire, Water, Earth, Air }
    
    // Character data structure
    struct CharacterData {
        uint256 level;
        uint256 exp;
        CharacterClass class;
        uint256 lastUpdated;
        uint256 questCount;
        uint256 dungeonCount;
        // Direct attributes
        uint256 attack;
        uint256 defense;
        uint256 speed;
        uint256 health;
        uint256 energy;
    }

    // State variables
    uint256 private _nextTokenId;
    uint256 public constant MINT_PRICE = 0.01 ether;
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    
    // Base stats by class
    mapping(CharacterClass => uint256) public baseAttack;
    mapping(CharacterClass => uint256) public baseDefense;
    mapping(CharacterClass => uint256) public baseSpeed;
    mapping(CharacterClass => uint256) public baseHealth;
    mapping(CharacterClass => uint256) public baseEnergy;
    
    // Mappings
    mapping(uint256 => CharacterData) public characters;
    mapping(address => bool) public authorizedContracts;
    
    // Events
    event CharacterMinted(address indexed to, uint256 indexed tokenId, CharacterClass class);
    event LevelUp(uint256 indexed tokenId, uint256 newLevel);
    event ExpGained(uint256 indexed tokenId, uint256 expGained, uint256 totalExp);
    event AttributeUpgraded(uint256 indexed tokenId, string attribute, uint256 newValue);
    event QuestCompleted(uint256 indexed tokenId, uint256 questId);
    event DungeonCompleted(uint256 indexed tokenId, uint256 dungeonId);

    // Errors
    error InsufficientPayment();
    error CharacterNotFound();
    error NotOwnerOfCharacter();
    error CharacterOnCooldown();
    error UnauthorizedContract();
    error InvalidClass();
    error InsufficientEnergy();

    constructor() ERC721("DeFi Adventure Character", "DEFI_CHAR") Ownable(msg.sender) {
        _setupBaseStats();
    }

    /**
     * @dev Setup base stats for each character class
     */
    function _setupBaseStats() internal {
        // Fire class - High attack, medium defense
        baseAttack[CharacterClass.Fire] = 15;
        baseDefense[CharacterClass.Fire] = 8;
        baseSpeed[CharacterClass.Fire] = 10;
        baseHealth[CharacterClass.Fire] = 100;
        baseEnergy[CharacterClass.Fire] = 5;
        
        // Water class - Balanced stats
        baseAttack[CharacterClass.Water] = 10;
        baseDefense[CharacterClass.Water] = 12;
        baseSpeed[CharacterClass.Water] = 12;
        baseHealth[CharacterClass.Water] = 120;
        baseEnergy[CharacterClass.Water] = 6;
        
        // Earth class - High defense, low speed
        baseAttack[CharacterClass.Earth] = 8;
        baseDefense[CharacterClass.Earth] = 18;
        baseSpeed[CharacterClass.Earth] = 6;
        baseHealth[CharacterClass.Earth] = 150;
        baseEnergy[CharacterClass.Earth] = 4;
        
        // Air class - High speed, low defense
        baseAttack[CharacterClass.Air] = 12;
        baseDefense[CharacterClass.Air] = 6;
        baseSpeed[CharacterClass.Air] = 18;
        baseHealth[CharacterClass.Air] = 80;
        baseEnergy[CharacterClass.Air] = 8;
    }

    /**
     * @dev Mint a new character NFT
     * @param to Address to mint the character to
     * @param class Character class to assign
     */
    function mintCharacter(address to, CharacterClass class) external payable nonReentrant {
        if (msg.value < MINT_PRICE) revert InsufficientPayment();
        if (uint256(class) > 3) revert InvalidClass();

        uint256 tokenId = _nextTokenId++;
        
        // Initialize character data with base stats
        characters[tokenId] = CharacterData({
            level: 1,
            exp: 0,
            class: class,
            lastUpdated: block.timestamp,
            questCount: 0,
            dungeonCount: 0,
            attack: baseAttack[class],
            defense: baseDefense[class],
            speed: baseSpeed[class],
            health: baseHealth[class],
            energy: baseEnergy[class]
        });

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _generateTokenURI(tokenId));

        emit CharacterMinted(to, tokenId, class);
    }

    /**
     * @dev Add EXP to a character and handle level ups
     * @param tokenId Character token ID
     * @param expAmount Amount of EXP to add
     */
    function gainExp(uint256 tokenId, uint256 expAmount) external {
        if (!_exists(tokenId)) revert CharacterNotFound();
        if (!authorizedContracts[msg.sender]) revert UnauthorizedContract();
        
        CharacterData storage character = characters[tokenId];
        character.exp += expAmount;
        character.lastUpdated = block.timestamp;

        // Check for level up
        uint256 requiredExp = _getRequiredExp(character.level);
        if (character.exp >= requiredExp) {
            character.level++;
            
            // Increase stats on level up
            character.attack += 2;
            character.defense += 2;
            character.speed += 1;
            character.health += 10;
            character.energy += 1;
            
            emit LevelUp(tokenId, character.level);
        }

        emit ExpGained(tokenId, expAmount, character.exp);
    }

    /**
     * @dev Upgrade a character attribute
     * @param tokenId Character token ID
     * @param attribute Attribute to upgrade (0=attack, 1=defense, 2=speed, 3=health, 4=energy)
     * @param amount Amount to upgrade
     */
    function upgradeAttribute(uint256 tokenId, uint256 attribute, uint256 amount) external {
        if (!_exists(tokenId)) revert CharacterNotFound();
        if (!authorizedContracts[msg.sender]) revert UnauthorizedContract();
        
        CharacterData storage character = characters[tokenId];
        
        if (attribute == 0) {
            character.attack += amount;
            emit AttributeUpgraded(tokenId, "attack", character.attack);
        } else if (attribute == 1) {
            character.defense += amount;
            emit AttributeUpgraded(tokenId, "defense", character.defense);
        } else if (attribute == 2) {
            character.speed += amount;
            emit AttributeUpgraded(tokenId, "speed", character.speed);
        } else if (attribute == 3) {
            character.health += amount;
            emit AttributeUpgraded(tokenId, "health", character.health);
        } else if (attribute == 4) {
            character.energy += amount;
            emit AttributeUpgraded(tokenId, "energy", character.energy);
        }
    }

    /**
     * @dev Use energy for dungeon entry
     * @param tokenId Character token ID
     * @param energyCost Energy cost for the action
     */
    function useEnergy(uint256 tokenId, uint256 energyCost) external {
        if (!_exists(tokenId)) revert CharacterNotFound();
        if (!authorizedContracts[msg.sender]) revert UnauthorizedContract();
        
        CharacterData storage character = characters[tokenId];
        if (character.energy < energyCost) revert InsufficientEnergy();
        
        character.energy -= energyCost;
        character.lastUpdated = block.timestamp;
    }

    /**
     * @dev Regenerate energy over time
     * @param tokenId Character token ID
     */
    function regenEnergy(uint256 tokenId) external {
        if (!_exists(tokenId)) revert CharacterNotFound();
        
        CharacterData storage character = characters[tokenId];
        uint256 maxEnergy = baseEnergy[character.class] + (character.level * 2);
        
        if (character.energy < maxEnergy) {
            // Regenerate 1 energy per hour
            uint256 timePassed = block.timestamp - character.lastUpdated;
            uint256 energyToRegen = timePassed / 3600; // 1 energy per hour
            
            if (energyToRegen > 0) {
                character.energy = character.energy + energyToRegen > maxEnergy ? 
                    maxEnergy : character.energy + energyToRegen;
                character.lastUpdated = block.timestamp;
            }
        }
    }

    /**
     * @dev Complete a quest and gain EXP
     * @param tokenId Character token ID
     * @param questId Quest identifier
     * @param expReward EXP reward for the quest
     */
    function completeQuest(uint256 tokenId, uint256 questId, uint256 expReward) external {
        if (!_exists(tokenId)) revert CharacterNotFound();
        if (!authorizedContracts[msg.sender]) revert UnauthorizedContract();
        if (block.timestamp < characters[tokenId].lastUpdated + COOLDOWN_PERIOD) {
            revert CharacterOnCooldown();
        }

        characters[tokenId].questCount++;
        gainExp(tokenId, expReward);

        emit QuestCompleted(tokenId, questId);
    }

    /**
     * @dev Complete a dungeon and gain EXP
     * @param tokenId Character token ID
     * @param dungeonId Dungeon identifier
     * @param expReward EXP reward for the dungeon
     */
    function completeDungeon(uint256 tokenId, uint256 dungeonId, uint256 expReward) external {
        if (!_exists(tokenId)) revert CharacterNotFound();
        if (!authorizedContracts[msg.sender]) revert UnauthorizedContract();
        if (block.timestamp < characters[tokenId].lastUpdated + COOLDOWN_PERIOD) {
            revert CharacterOnCooldown();
        }

        characters[tokenId].dungeonCount++;
        gainExp(tokenId, expReward);

        emit DungeonCompleted(tokenId, dungeonId);
    }

    /**
     * @dev Get character data
     * @param tokenId Character token ID
     * @return CharacterData struct
     */
    function getCharacter(uint256 tokenId) external view returns (CharacterData memory) {
        if (!_exists(tokenId)) revert CharacterNotFound();
        return characters[tokenId];
    }

    /**
     * @dev Get character's total power level
     * @param tokenId Character token ID
     * @return Total power level
     */
    function getCharacterPower(uint256 tokenId) external view returns (uint256) {
        if (!_exists(tokenId)) revert CharacterNotFound();
        CharacterData memory character = characters[tokenId];
        
        // Calculate total power from all attributes
        uint256 totalPower = character.attack + character.defense + character.speed;
        
        // Add bonuses based on quest and dungeon completion
        uint256 questBonus = character.questCount / 10; // 1 bonus per 10 quests
        uint256 dungeonBonus = character.dungeonCount / 5; // 1 bonus per 5 dungeons
        
        return totalPower + questBonus + dungeonBonus;
    }

    /**
     * @dev Get required EXP for next level
     * @param currentLevel Current character level
     * @return Required EXP for next level
     */
    function getRequiredExpForLevel(uint256 currentLevel) external pure returns (uint256) {
        return _getRequiredExp(currentLevel);
    }

    /**
     * @dev Check if character can perform action (not on cooldown and has energy)
     * @param tokenId Character token ID
     * @return true if character can perform action
     */
    function canPerformAction(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) return false;
        CharacterData memory character = characters[tokenId];
        return block.timestamp >= character.lastUpdated + COOLDOWN_PERIOD && character.energy > 0;
    }

    /**
     * @dev Get character attributes for display
     * @param tokenId Character token ID
     * @return attack, defense, speed, health, energy
     */
    function getCharacterAttributes(uint256 tokenId) external view returns (
        uint256 attack,
        uint256 defense,
        uint256 speed,
        uint256 health,
        uint256 energy
    ) {
        if (!_exists(tokenId)) revert CharacterNotFound();
        CharacterData memory character = characters[tokenId];
        return (character.attack, character.defense, character.speed, character.health, character.energy);
    }

    /**
     * @dev Authorize a contract to interact with characters
     * @param contractAddress Contract address to authorize
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedContract(address contractAddress, bool authorized) external onlyOwner {
        authorizedContracts[contractAddress] = authorized;
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Calculate required EXP for a level (100 * level^1.5)
     * @param level Character level
     * @return Required EXP
     */
    function _getRequiredExp(uint256 level) internal pure returns (uint256) {
        if (level == 1) return 100;
        
        // Approximation of level^1.5 using integer math
        uint256 levelSquared = level * level;
        uint256 levelCubed = levelSquared * level;
        uint256 levelToOnePointFive = levelSquared + (levelCubed / (level * 2));
        
        return 100 * levelToOnePointFive / level;
    }

    /**
     * @dev Generate token URI based on character data
     * @param tokenId Character token ID
     * @return Token URI string
     */
    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        CharacterData memory character = characters[tokenId];
        string memory className = _getClassName(character.class);
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(abi.encodePacked(
                '{"name": "', className, ' Warrior #', tokenId.toString(), '",',
                '"description": "A brave ', className, ' warrior in the DeFi Adventure",',
                '"attributes": [',
                '{"trait_type": "Level", "value": ', character.level.toString(), '},',
                '{"trait_type": "EXP", "value": ', character.exp.toString(), '},',
                '{"trait_type": "Class", "value": "', className, '"},',
                '{"trait_type": "Attack", "value": ', character.attack.toString(), '},',
                '{"trait_type": "Defense", "value": ', character.defense.toString(), '},',
                '{"trait_type": "Speed", "value": ', character.speed.toString(), '},',
                '{"trait_type": "Health", "value": ', character.health.toString(), '},',
                '{"trait_type": "Energy", "value": ', character.energy.toString(), '},',
                '{"trait_type": "Quests Completed", "value": ', character.questCount.toString(), '},',
                '{"trait_type": "Dungeons Completed", "value": ', character.dungeonCount.toString(), '}',
                ']}'
            )))
        ));
    }

    /**
     * @dev Get class name as string
     * @param class Character class enum
     * @return Class name string
     */
    function _getClassName(CharacterClass class) internal pure returns (string memory) {
        if (class == CharacterClass.Fire) return "Fire";
        if (class == CharacterClass.Water) return "Water";
        if (class == CharacterClass.Earth) return "Earth";
        if (class == CharacterClass.Air) return "Air";
        return "Unknown";
    }

    /**
     * @dev Base64 encode function
     * @param data Data to encode
     * @return Base64 encoded string
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        string memory result = new string(4 * ((data.length + 2) / 3));
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let dataPtr := data
                let endPtr := add(dataPtr, mload(data))
            } lt(dataPtr, endPtr) {
                
            } {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 2), 0x3d)
                mstore8(sub(resultPtr, 1), 0x3d)
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d)
            }
        }
        
        return result;
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}    