"use client";

import { useState, useEffect } from "react";
import {
  ConnectorError,
  ConnectorErrorType,
  requestRoninWalletConnector,
} from "@sky-mavis/tanto-connect";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sword,
  Zap,
  Trophy,
  Coins,
  ArrowRightLeft,
  Dice6,
  Crown,
  Swords,
  Eye,
  Wallet,
  ImageIcon,
  Settings,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";
import { GameHeader } from "@/components/game/GameHeader";
import { CharacterProfile } from "@/components/game/CharacterProfile";
import { BridgeTab } from "@/components/game/BridgeTab";
import ConnectRoninWalletButton from "@/providers/connectWallet";

type Quest = {
  id: number;
  title: string;
  description: string;
  reward: string;
  difficulty: string;
  completed: boolean;
  type: string;
};

type ChainQuests = {
  [key: string]: Quest[];
};

export default function GameDashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [currentChain, setCurrentChain] = useState("ronin"); // Current connected chain

  // Wallet connection functions
  const disconnectW3 = () => {
    setAddress(null);
    setUserNFT(null);
  };

  const handleWalletConnect = (connectedAddress: string) => {
    setAddress(connectedAddress);
  };

  const [character, setCharacter] = useState({
    name: "Draonius the Wise",
    level: 1,
    exp: 25,
    maxExp: 100,
    class: "Sage Dragon",
    element: "Aether",
    image: "/assets/cannes.jpg",
    intelligence: 85,
    maxIntelligence: 100,
    spellPower: 90,
    knowledge: 92,
    wisdom: 95,
    magicMastery: 85,
  });

  const [userNFT, setUserNFT] = useState<any | null>(null);

  const [showCharacterDetails, setShowCharacterDetails] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [magicCircles, setMagicCircles] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);

  const chainSpecificQuests: ChainQuests = {
    ronin: [
      {
        id: 1,
        title: "Stake RON Tokens",
        description: "Guard the ancient RON treasury with your dragon might",
        reward: "150 EXP + 50 RON + Dragon Scale",
        difficulty: "Easy",
        completed: false,
        type: "defi",
      },
      {
        id: 2,
        title: "Explore Katana DEX",
        description: "Swap tokens on the Katana decentralized exchange.",
        reward: "100 EXP + Katana Gem",
        difficulty: "Easy",
        completed: false,
        type: "dungeon", // Using dungeon as a generic type for now
      },
    ],
    ethereum: [
      {
        id: 1,
        title: "Stake ETH on Lido",
        description:
          "Contribute to the security of Ethereum by staking your ETH.",
        reward: "250 EXP + stETH token",
        difficulty: "Medium",
        completed: false,
        type: "defi",
      },
      {
        id: 2,
        title: "Provide Liquidity on Uniswap",
        description: "Become a liquidity provider on the premier Ethereum DEX.",
        reward: "300 EXP + LP Token",
        difficulty: "Hard",
        completed: false,
        type: "dungeon",
      },
    ],
    base: [
      {
        id: 1,
        title: "Explore Base Ecosystem",
        description: "Interact with a new dApp on the Base chain.",
        reward: "200 EXP + Based Badge",
        difficulty: "Medium",
        completed: false,
        type: "dungeon",
      },
    ],
    polygon: [
      {
        id: 1,
        title: "Stake MATIC Tokens",
        description: "Secure the Polygon network by staking your MATIC.",
        reward: "200 EXP + 10 MATIC",
        difficulty: "Medium",
        completed: false,
        type: "defi",
      },
    ],
    arbitrum: [
      {
        id: 1,
        title: "Yield Farm on GMX",
        description:
          "Explore advanced DeFi strategies on Arbitrum's top protocol.",
        reward: "400 EXP + GMX token",
        difficulty: "Hard",
        completed: false,
        type: "defi",
      },
    ],
  };

  const [displayedQuests, setDisplayedQuests] = useState<Quest[]>(
    chainSpecificQuests[currentChain] || []
  );

  useEffect(() => {
    setDisplayedQuests(chainSpecificQuests[currentChain] || []);
  }, [currentChain]);

  const blockchainIslands = [
    {
      id: 1,
      name: "Ronin",
      chain: "ronin",
      unlocked: true,
      logo: "/assets/ronin.jpeg",
      gradient: "from-blue-500 to-cyan-400",
      glowColor: "#3b82f6",
      emoji: "🌊",
      description: "The journey begins and ends in the native realm.",
      requiredLevel: 1,
      bridgeFee: "0.001 RON",
      position: { x: 50, y: 20 }, // Top of the circle, moved down
    },
    {
      id: 2,
      name: "Ethereum",
      chain: "ethereum",
      unlocked: character.level >= 5,
      logo: "/assets/ethereum.jpeg",
      gradient: "from-slate-400 to-slate-300",
      glowColor: "#94a3b8",
      emoji: "🔥",
      description: "The ancient and powerful realm of creation.",
      requiredLevel: 5,
      bridgeFee: "0.005 ETH",
      position: { x: 88, y: 45 }, // Top-right, moved down
    },
    {
      id: 3,
      name: "Base",
      chain: "base",
      unlocked: character.level >= 15,
      logo: "/assets/base.jpeg",
      gradient: "from-blue-600 to-sky-400",
      glowColor: "#2563eb",
      emoji: "🏗️",
      description: "A secure, low-cost, builder-friendly chain.",
      requiredLevel: 15,
      bridgeFee: "0.001 ETH",
      position: { x: 80, y: 85 }, // Bottom-right, moved down
    },
    {
      id: 4,
      name: "Polygon",
      chain: "polygon",
      unlocked: character.level >= 20,
      logo: "/assets/polygon.jpeg",
      gradient: "from-purple-500 to-indigo-400",
      glowColor: "#8b5cf6",
      emoji: "🔗",
      description: "An interoperable, scalable Ethereum sidechain.",
      requiredLevel: 20,
      bridgeFee: "0.001 ETH",
      position: { x: 20, y: 85 }, // Bottom-left, moved down
    },
    {
      id: 5,
      name: "Arbitrum",
      chain: "arbitrum",
      unlocked: character.level >= 30,
      logo: "/assets/arbitrum.jpeg",
      gradient: "from-blue-400 to-sky-300",
      glowColor: "#60a5fa",
      emoji: "✨",
      description: "A mysterious civilization with advanced tech.",
      requiredLevel: 30,
      bridgeFee: "0.002 ETH",
      position: { x: 12, y: 45 }, // Top-left, moved down
    },
  ];

  const [selectedIsland, setSelectedIsland] = useState<any>(null);
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [bridgeStep, setBridgeStep] = useState(1);
  const [bridgeLoading, setBridgeLoading] = useState(false);

  const [showStakeModal, setShowStakeModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [stakeStep, setStakeStep] = useState(1);

  const expPercentage = (character.exp / character.maxExp) * 100;
  const intelligencePercentage =
    (character.intelligence / character.maxIntelligence) * 100;

  // Get current chain info
  const getCurrentChainInfo = () => {
    return (
      blockchainIslands.find((island) => island.chain === currentChain) ||
      blockchainIslands[2]
    ); // Default to Ronin
  };

  // Enhanced particle system with dragon-themed elements
  useEffect(() => {
    const interval = setInterval(() => {
      // Dragon breath particles
      setParticles((prev) => [
        ...prev.filter((p) => Date.now() - p.id < 4000),
        {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        },
      ]);

      // Ancient runes circles
      setMagicCircles((prev) => [
        ...prev.filter((c) => Date.now() - c.id < 8000),
        {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: 50 + Math.random() * 100,
        },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const handleLevelUp = () => {
    setIsLevelingUp(true);
    setTimeout(() => {
      setCharacter((prev) => ({ ...prev, level: prev.level + 1 }));
      setIsLevelingUp(false);
    }, 2000);
  };

  const handleClaimReward = () => {
    setShowRewardAnimation(true);
    setTimeout(() => setShowRewardAnimation(false), 3000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Hard":
        return "bg-red-500";
      case "Legendary":
        return "bg-gradient-to-r from-orange-500 to-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500";
      case "Rare":
        return "bg-blue-500";
      case "Epic":
        return "bg-purple-500";
      case "Legendary":
        return "bg-gradient-to-r from-orange-500 to-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const handleIslandClick = (island: any) => {
    if (!island.unlocked) return;
    if (character.level < island.requiredLevel) return;

    setSelectedIsland(island);
    setShowBridgeModal(true);
    setBridgeStep(1);
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    setIsStaking(true);
    setStakeStep(2);

    // Simulate staking process
    setTimeout(() => {
      setStakeStep(3);
      setIsStaking(false);
      // Mark the quest as completed
      if (selectedQuest) {
        setDisplayedQuests((prevQuests: Quest[]) =>
          prevQuests.map((quest: Quest) =>
            quest.id === selectedQuest.id
              ? { ...quest, completed: true }
              : quest
          )
        );
      }
      setTimeout(() => {
        setShowStakeModal(false);
        setStakeStep(1);
      }, 2000);
    }, 3000);
  };

  const handleBridgeNFT = async () => {
    setBridgeLoading(true);
    setBridgeStep(2);

    // Simulate bridge process
    setTimeout(() => {
      setBridgeStep(3);
      setBridgeLoading(false);
      // Update current chain after successful bridge
      setCurrentChain(selectedIsland.chain);
      setTimeout(() => {
        setShowBridgeModal(false);
        setBridgeStep(1);
      }, 2000);
    }, 3000);
  };

  const handleNFTClick = (nft: any) => {
    const newCharacter = {
      ...character,
      name: nft.name,
      level: nft.level,
      class:
        nft.attributes.find((attr: any) => attr.trait_type === "Class")
          ?.value || nft.rarity,
      element:
        nft.attributes.find((attr: any) => attr.trait_type === "Element")
          ?.value || "Unknown",
    };
    setCharacter(newCharacter);
    // Also scroll to top to see the change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMintNFT = () => {
    // This is a mock minting function.
    // In a real scenario, this would interact with a smart contract.
    const newNFT = {
      id: 7,
      name: "Newly Minted Dragon #0001",
      image: "/assets/cannes.jpg",
      chain: "ronin",
      chainName: "Ronin",
      chainEmoji: "🏰",
      rarity: "Common",
      level: 1,
      attributes: [
        { trait_type: "Element", value: "Hatching Fire" },
        { trait_type: "Power Level", value: "100" },
      ],
      contractAddress: "0xMOCK...",
      tokenId: "0001",
      description: "A brand new dragon, ready for adventure.",
    };
    setUserNFT(newNFT);
    // Also select this new NFT as the main character
    // Set low base stats for the newly minted dragon
    const newCharacter = {
      ...character,
      name: newNFT.name,
      level: 1,
      exp: 0,
      class:
        newNFT.attributes.find((attr: any) => attr.trait_type === "Class")
          ?.value || newNFT.rarity,
      element:
        newNFT.attributes.find((attr: any) => attr.trait_type === "Element")
          ?.value || "Unknown",
      image: newNFT.image,
      intelligence: 15,
      spellPower: 20,
      knowledge: 18,
      wisdom: 12,
      magicMastery: 10,
    };
    setCharacter(newCharacter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBeginQuest = (quest: any) => {
    if (quest.completed) return;

    if (quest.type === "defi") {
      setSelectedQuest(quest);
      setShowStakeModal(true);
      setStakeStep(1);
      setStakeAmount("");
    } else {
      // Handle other quest types here if needed
      console.log("Beginning quest:", quest.title);
      handleClaimReward(); // For non-staking quests for now
    }
  };

  // Show a loading or connect state if wallet is not connected
  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-slate-800/50 border-slate-700 text-white backdrop-blur-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              🐲
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Dragon Realms
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg mt-2">
              Connect your Ronin wallet to enter the mystical realm.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mt-4">
              <ConnectRoninWalletButton onConnect={handleWalletConnect} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If wallet is connected but user has no NFT, show Minting Page
  if (!userNFT) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-slate-800/50 border-slate-700 text-white backdrop-blur-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              🐉
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Claim Your Dragon
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg mt-2">
              You don&apos;t have a dragon yet. Mint your first Dragon NFT to
              begin your adventure in Dragon Realms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleMintNFT}
                className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-6"
              >
                Mint Your First Dragon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChainInfo = getCurrentChainInfo();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GameHeader address={address} onDisconnect={() => disconnectW3()} />
      {/* Ocean/Forest Fantasy Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900">
        {/* Mountain Silhouettes */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-slate-900 to-transparent">
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 300"
            fill="none"
          >
            <path
              d="M0 300L50 250C100 200 200 100 300 80C400 60 500 120 600 140C700 160 800 120 900 100C1000 80 1100 80 1150 80L1200 80V300H0Z"
              fill="rgba(15, 23, 42, 0.8)"
            />
            <path
              d="M0 300L80 280C160 260 320 220 480 200C640 180 800 180 960 190C1120 200 1280 220 1360 230L1440 240V300H0Z"
              fill="rgba(30, 41, 59, 0.6)"
            />
          </svg>
        </div>

        {/* Ancient Temple Silhouette */}
        <div className="absolute top-20 right-10 opacity-20 text-teal-300">
          <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
            <rect x="20" y="80" width="160" height="70" fill="currentColor" />
            <rect x="10" y="60" width="30" height="90" fill="currentColor" />
            <rect x="160" y="60" width="30" height="90" fill="currentColor" />
            <rect x="80" y="40" width="40" height="110" fill="currentColor" />
            <polygon points="100,20 85,40 115,40" fill="currentColor" />
            <polygon points="25,50 15,60 35,60" fill="currentColor" />
            <polygon points="175,50 165,60 185,60" fill="currentColor" />
          </svg>
        </div>

        {/* Flying Dragon Silhouette */}
        <div className="absolute top-32 left-20 opacity-15 text-emerald-400">
          <motion.svg
            width="350"
            height="250"
            viewBox="0 0 350 250"
            fill="none"
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
              rotate: [0, 3, 0],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {/* Dragon Body */}
            <path
              d="M50 120C30 100 40 80 60 70C80 60 100 65 120 70L140 60C160 50 180 55 200 65C220 75 240 85 250 100C260 115 250 130 240 140L220 150C200 160 180 155 160 150L140 160C120 170 100 165 80 160C60 155 40 140 50 120Z"
              fill="currentColor"
            />
            {/* Dragon Head */}
            <circle cx="200" cy="80" r="12" fill="currentColor" />
            <path d="M180 75L190 70L185 85Z" fill="currentColor" />
            {/* Dragon Wings */}
            <path
              d="M120 90L100 70L140 75L160 85L140 95Z"
              fill="currentColor"
            />
            <path
              d="M180 85L200 65L220 70L240 80L220 90Z"
              fill="currentColor"
            />
            {/* Dragon Tail */}
            <path
              d="M220 90L240 85L235 100L245 95L250 110L230 105Z"
              fill="currentColor"
            />
          </motion.svg>
        </div>

        {/* Ancient Runes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-teal-300 opacity-20 text-2xl"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + i,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
          >
            {["🐲", "⚡", "🔥", "💎", "🌊", "🌿", "⭐", "🗡️"][i]}
          </motion.div>
        ))}
      </div>

      {/* Enhanced Dragon Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            initial={{ x: particle.x, y: particle.y, scale: 0, opacity: 0 }}
            animate={{
              y: particle.y - 300,
              scale: [0, 1, 0.5, 0],
              opacity: [0, 0.8, 0.4, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 4, ease: "easeOut" }}
            style={{ left: particle.x, top: particle.y }}
          >
            <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full shadow-lg shadow-teal-500/50" />
          </motion.div>
        ))}
      </div>

      {/* Ancient Magic Circles */}
      <div className="fixed inset-0 pointer-events-none">
        {magicCircles.map((circle) => (
          <motion.div
            key={circle.id}
            className="absolute border-2 border-teal-400/20 rounded-full"
            initial={{
              x: circle.x,
              y: circle.y,
              width: 0,
              height: 0,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              width: circle.size,
              height: circle.size,
              opacity: [0, 0.6, 0],
              rotate: 360,
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{ duration: 8, ease: "easeOut" }}
            style={{
              left: circle.x - circle.size / 2,
              top: circle.y - circle.size / 2,
            }}
          >
            <div className="absolute inset-2 border border-teal-300/10 rounded-full" />
            <div className="absolute inset-4 border border-teal-200/5 rounded-full" />
          </motion.div>
        ))}
      </div>

      {/* Mystical Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300"
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      <main className="relative z-10 flex flex-col lg:flex-row">
        <CharacterProfile
          character={character}
          expPercentage={expPercentage}
          intelligencePercentage={intelligencePercentage}
          onLevelUp={handleLevelUp}
          isLevelingUp={isLevelingUp}
        />

        {/* Right Panel - Main Content */}
        <div className="w-full lg:w-2/3 xl:w-3/4 p-6 lg:p-10 space-y-8">
          {/* Top Bar (already part of header, can be removed) */}
          <div className="hidden lg:flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Dragon Realms</h1>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Stats and Leaderboard */}
            <div className="xl:col-span-2 space-y-8">
              {/* Other content here */}
            </div>

            {/* Side Panel - Activity Feed */}
            <div className="space-y-6">{/* Other content here */}</div>
          </div>

          {/* Enhanced Tabs with Ocean/Forest Theme */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="quests" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/70 backdrop-blur-xl border border-teal-500/30">
                <TabsTrigger
                  value="quests"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 transition-all duration-300"
                >
                  <Sword className="w-4 h-4 mr-2" />
                  ⚔️ Dragon Quests
                </TabsTrigger>
                <TabsTrigger
                  value="bridge"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 transition-all duration-300"
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  🌉 Dragon Bridge
                </TabsTrigger>
              </TabsList>

              {/* Enhanced Quests Tab */}
              <TabsContent value="quests">
                <motion.div
                  className="grid gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {displayedQuests.map((quest: Quest, index: number) => (
                    <motion.div
                      key={quest.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="bg-slate-800/70 border-slate-700 backdrop-blur-xl hover:border-teal-500/50 transition-all duration-300 relative overflow-hidden group shadow-lg shadow-teal-500/10">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <motion.h3
                                  className="text-lg font-semibold text-white"
                                  whileHover={{ color: "#14b8a6" }}
                                >
                                  🐲 {quest.title}
                                </motion.h3>
                                <Badge
                                  className={getDifficultyColor(
                                    quest.difficulty
                                  )}
                                >
                                  {quest.difficulty}
                                </Badge>
                                {quest.completed && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                      type: "spring",
                                      delay: index * 0.1,
                                    }}
                                  >
                                    <Badge className="bg-green-600">
                                      <Trophy className="w-3 h-3 mr-1" />✅
                                      Completed
                                    </Badge>
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-slate-300 mb-2">
                                📜 {quest.description}
                              </p>
                              <motion.div
                                className="flex items-center gap-2 text-sm text-yellow-400"
                                whileHover={{ scale: 1.05 }}
                              >
                                <Coins className="w-4 h-4" />
                                💰 {quest.reward}
                              </motion.div>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={() => handleBeginQuest(quest)}
                                disabled={quest.completed}
                                className="ml-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:bg-slate-600 relative overflow-hidden group shadow-lg"
                              >
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                  initial={{ x: "-100%" }}
                                  whileHover={{ x: "100%" }}
                                  transition={{ duration: 0.6 }}
                                />
                                {quest.completed
                                  ? "✅ Completed"
                                  : "🚀 Begin Quest"}
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              {/* Enhanced Dragon Bridge Tab - Blockchain Islands */}
              <TabsContent value="bridge">
                <BridgeTab
                  blockchainIslands={blockchainIslands}
                  handleIslandClick={handleIslandClick}
                  currentChainInfo={currentChainInfo}
                  characterLevel={character.level}
                  currentChain={currentChain}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Modals and Overlays */}
      <AnimatePresence>
        {showStakeModal && selectedQuest && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-teal-500/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                {selectedQuest.title}
              </h2>
              <p className="text-center text-slate-400 mb-6">
                {selectedQuest.description}
              </p>

              {stakeStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="relative mb-6">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-slate-900 p-4 rounded-lg text-white text-2xl font-mono text-right pr-24"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-bold">
                      {currentChainInfo.bridgeFee.split(" ")[1]}
                    </span>
                  </div>

                  <Button
                    onClick={handleStake}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-6"
                    disabled={
                      isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0
                    }
                  >
                    {isStaking
                      ? "Staking..."
                      : `Stake ${
                          currentChainInfo.bridgeFee.split(" ")[1] || "Tokens"
                        }`}
                  </Button>
                  <Button
                    onClick={() => setShowStakeModal(false)}
                    variant="ghost"
                    className="w-full mt-2 text-slate-400"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}

              {stakeStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500 mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-white">
                    Staking in Progress...
                  </h3>
                  <p className="text-slate-300 mt-2">
                    Your tokens are being staked to the treasury.
                  </p>
                </motion.div>
              )}

              {stakeStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-green-500/10 rounded-full border-2 border-green-500">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Stake Successful!
                  </h3>
                  <p className="text-slate-300 mt-2">
                    You have earned your rewards. Your dragon grows stronger!
                  </p>
                  <Button
                    onClick={() => setShowStakeModal(false)}
                    className="w-full mt-6"
                  >
                    Close
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {showBridgeModal && selectedIsland && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-blue-500/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Bridge NFT to {selectedIsland.name}
              </h2>
              <p className="text-center text-slate-400 mb-6">
                You are about to bridge your Dragon to another realm.
              </p>

              {bridgeStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg mb-4">
                    <span className="text-slate-400">From</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {currentChainInfo.name}
                      </span>
                      <img
                        src={currentChainInfo.logo}
                        alt={currentChainInfo.name}
                        className="w-6 h-6"
                      />
                    </div>
                  </div>

                  <div className="text-center my-4 text-slate-500">
                    <ArrowDown className="w-6 h-6 inline-block" />
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 p-4 rounded-lg mb-6">
                    <span className="text-slate-400">To</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {selectedIsland.name}
                      </span>
                      <img
                        src={selectedIsland.logo}
                        alt={selectedIsland.name}
                        className="w-6 h-6"
                      />
                    </div>
                  </div>

                  <div className="text-sm text-slate-400 space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span>Bridge Fee:</span>
                      <span className="text-white font-mono">
                        {selectedIsland.bridgeFee}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Time:</span>
                      <span className="text-white">~5-10 minutes</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBridgeNFT}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  >
                    {bridgeLoading ? "Bridging..." : "Confirm Bridge"}
                  </Button>
                  <Button
                    onClick={() => setShowBridgeModal(false)}
                    variant="ghost"
                    className="w-full mt-2 text-slate-400"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}

              {bridgeStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-green-500/10 rounded-full border-2 border-green-500">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Bridge Initiated!
                  </h3>
                  <p className="text-slate-300 mt-2">
                    Your dragon is on its way to {selectedIsland.name}.
                  </p>
                  <Button
                    onClick={() => setShowBridgeModal(false)}
                    className="w-full mt-6"
                  >
                    Close
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
