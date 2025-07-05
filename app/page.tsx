"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { getW3Address, useConnect } from "@w3vm/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { GameHeader } from "@/components/game/GameHeader"
import { CharacterProfile } from "@/components/game/CharacterProfile"
import { BridgeTab } from "@/components/game/BridgeTab"

export default function GameDashboard() {
  const address = getW3Address()
  const { disconnectW3 } = useConnect()

  const [selectedNFT, setSelectedNFT] = useState<any>(null)
  const [showNFTModal, setShowNFTModal] = useState(false)
  const [currentChain, setCurrentChain] = useState("ronin") // Current connected chain

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
  })

  const [userNFT, setUserNFT] = useState<any | null>(null)

  const [showCharacterDetails, setShowCharacterDetails] = useState(false)
  const [isLevelingUp, setIsLevelingUp] = useState(false)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [magicCircles, setMagicCircles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])

  const [quests] = useState([
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
      title: "Bridge USDC",
      description: "Fly between realms carrying precious USDC treasures",
      reward: "200 EXP + Bridge Fee Refund + Ancient Rune",
      difficulty: "Medium",
      completed: true,
      type: "bridge",
    },
    {
      id: 3,
      title: "Defeat Shadow Dragon",
      description: "Challenge the legendary Shadow Dragon in epic combat",
      reward: "500 EXP + Legendary Dragon Heart + Shadow Essence",
      difficulty: "Legendary",
      completed: false,
      type: "dungeon",
    },
    {
      id: 4,
      title: "Cross-Chain NFT Bridge",
      description: "Successfully bridge an NFT between different blockchain realms",
      reward: "300 EXP + Bridge Master Badge + Multiverse Key",
      difficulty: "Medium",
      completed: false,
      type: "bridge",
    },
  ])

  const [blockchainIslands] = useState([
    {
      id: 1,
      name: "Ethereum Citadel",
      chainId: 1,
      chain: "ethereum",
      difficulty: 3,
      requiredLevel: 5,
      bridgeFee: "0.005 ETH",
      rewards: ["ETH Rewards", "Ethereum NFTs", "Gas Optimization"],
      unlocked: true,
      icon: "⚡",
      emoji: "⚡",
      logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
      gradient: "from-blue-600 to-indigo-600",
      glowColor: "#3b82f6",
      description: "The ancient citadel of Ethereum, where smart contracts were born",
      position: { x: 15, y: 20 },
    },
    {
      id: 2,
      name: "Polygon Sanctuary",
      chainId: 137,
      chain: "polygon",
      difficulty: 2,
      requiredLevel: 3,
      bridgeFee: "0.1 MATIC",
      rewards: ["MATIC Rewards", "Polygon NFTs", "Fast Transactions"],
      unlocked: true,
      icon: "🔮",
      emoji: "🔮",
      logo: "https://cryptologos.cc/logos/polygon-matic-logo.svg",
      gradient: "from-purple-600 to-pink-600",
      glowColor: "#a855f7",
      description: "The mystical sanctuary of fast and cheap transactions",
      position: { x: 70, y: 15 },
    },
    {
      id: 3,
      name: "Ronin Fortress",
      chainId: 2020,
      chain: "ronin",
      difficulty: 7,
      requiredLevel: 7,
      bridgeFee: "1 RON",
      rewards: ["RON Rewards", "Gaming NFTs", "Axie Benefits"],
      unlocked: true,
      icon: "🏰",
      emoji: "🏰",
      logo: "https://cdn.axieinfinity.com/ronin/logo.svg",
      gradient: "from-teal-600 to-emerald-600",
      glowColor: "#3b82f6",
      description: "The gaming fortress built for play-to-earn adventures",
      position: { x: 25, y: 65 },
    },
    {
      id: 4,
      name: "Arbitrum Spire",
      chainId: 42161,
      chain: "arbitrum",
      difficulty: 5,
      requiredLevel: 6,
      bridgeFee: "0.002 ETH",
      rewards: ["ARB Rewards", "L2 NFTs", "Scaling Solutions"],
      unlocked: character.level >= 6,
      icon: "🗼",
      emoji: "🗼",
      logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg",
      gradient: "from-cyan-600 to-blue-600",
      glowColor: "#60a5fa",
      description: "The towering spire of Layer 2 scaling solutions",
      position: { x: 75, y: 70 },
    },
    {
      id: 5,
      name: "Celestial Nexus",
      chainId: 999999,
      chain: "multiverse",
      difficulty: 12,
      requiredLevel: 10,
      bridgeFee: "Unknown",
      rewards: ["Legendary NFTs", "Cross-Chain Mastery", "Ultimate Power"],
      unlocked: false,
      icon: "🌌",
      emoji: "🌌",
      logo: "https://via.placeholder.com/64x64/FFD700/000000?text=∞",
      gradient: "from-yellow-500 to-orange-600",
      glowColor: "#ef4444",
      description: "The legendary nexus connecting all blockchain realms",
      position: { x: 45, y: 40 },
    },
  ])

  const [selectedRealm, setSelectedRealm] = useState<any>(null)
  const [showBridgeModal, setShowBridgeModal] = useState(false)
  const [bridgeStep, setBridgeStep] = useState(1)
  const [bridgeLoading, setBridgeLoading] = useState(false)

  const expPercentage = (character.exp / character.maxExp) * 100
  const intelligencePercentage = (character.intelligence / character.maxIntelligence) * 100

  // Get current chain info
  const getCurrentChainInfo = () => {
    return blockchainIslands.find((island) => island.chain === currentChain) || blockchainIslands[2] // Default to Ronin
  }

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
      ])

      // Ancient runes circles
      setMagicCircles((prev) => [
        ...prev.filter((c) => Date.now() - c.id < 8000),
        {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: 50 + Math.random() * 100,
        },
      ])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

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
  }

  const handleLevelUp = () => {
    setIsLevelingUp(true)
    setTimeout(() => {
      setCharacter((prev) => ({ ...prev, level: prev.level + 1 }))
      setIsLevelingUp(false)
    }, 2000)
  }

  const handleClaimReward = () => {
    setShowRewardAnimation(true)
    setTimeout(() => setShowRewardAnimation(false), 3000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500"
      case "Medium":
        return "bg-yellow-500"
      case "Hard":
        return "bg-red-500"
      case "Legendary":
        return "bg-gradient-to-r from-orange-500 to-red-600"
      default:
        return "bg-gray-500"
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500"
      case "Rare":
        return "bg-blue-500"
      case "Epic":
        return "bg-purple-500"
      case "Legendary":
        return "bg-gradient-to-r from-orange-500 to-red-600"
      default:
        return "bg-gray-500"
    }
  }

  const handleIslandClick = (island: any) => {
    if (!island.unlocked) return
    if (character.level < island.requiredLevel) return

    setSelectedRealm(island)
    setShowBridgeModal(true)
    setBridgeStep(1)
  }

  const handleBridgeNFT = async () => {
    setBridgeLoading(true)
    setBridgeStep(2)

    // Simulate bridge process
    setTimeout(() => {
      setBridgeStep(3)
      setBridgeLoading(false)
      // Update current chain after successful bridge
      setCurrentChain(selectedRealm.chain)
      setTimeout(() => {
        setShowBridgeModal(false)
        setBridgeStep(1)
      }, 2000)
    }, 3000)
  }

  const handleNFTClick = (nft: any) => {
    const newCharacter = {
      ...character,
      name: nft.name,
      level: nft.level,
      class: nft.attributes.find((attr: any) => attr.trait_type === "Class")?.value || nft.rarity,
      element: nft.attributes.find((attr: any) => attr.trait_type === "Element")?.value || "Unknown",
    }
    setCharacter(newCharacter)
    // Also scroll to top to see the change
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleMintNFT = () => {
    // This is a mock minting function.
    // In a real scenario, this would interact with a smart contract.
    const newNFT = {
      id: 7,
      name: "Newly Minted Dragon #0001",
      image: "/placeholder.svg?height=300&width=300",
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
    }
    setUserNFT(newNFT)
    // Also select this new NFT as the main character
    handleNFTClick(newNFT)
  }

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
              <ronin-button />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentChainInfo = getCurrentChainInfo()

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GameHeader address={address} onDisconnect={() => disconnectW3()} />
      {/* Ocean/Forest Fantasy Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900">
        {/* Mountain Silhouettes */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-slate-900 to-transparent">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 300" fill="none">
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
            <path d="M120 90L100 70L140 75L160 85L140 95Z" fill="currentColor" />
            <path d="M180 85L200 65L220 70L240 80L220 90Z" fill="currentColor" />
            {/* Dragon Tail */}
            <path d="M220 90L240 85L235 100L245 95L250 110L230 105Z" fill="currentColor" />
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
            <div className="space-y-6">
              {/* Other content here */}
            </div>
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
                  <ArrowRightLeft className="w-4 h-4 mr-2" />🌉 Dragon Bridge
                </TabsTrigger>
              </TabsList>

              {/* Enhanced Quests Tab */}
              <TabsContent value="quests">
                <motion.div className="grid gap-4" variants={containerVariants} initial="hidden" animate="visible">
                  {quests.map((quest, index) => (
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
                                <motion.h3 className="text-lg font-semibold text-white" whileHover={{ color: "#14b8a6" }}>
                                  🐲 {quest.title}
                                </motion.h3>
                                <Badge className={getDifficultyColor(quest.difficulty)}>{quest.difficulty}</Badge>
                                {quest.completed && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", delay: index * 0.1 }}
                                  >
                                    <Badge className="bg-green-600">
                                      <Trophy className="w-3 h-3 mr-1" />✅ Completed
                                    </Badge>
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-slate-300 mb-2">📜 {quest.description}</p>
                              <motion.div
                                className="flex items-center gap-2 text-sm text-yellow-400"
                                whileHover={{ scale: 1.05 }}
                              >
                                <Coins className="w-4 h-4" />💰 {quest.reward}
                              </motion.div>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                disabled={quest.completed}
                                className="ml-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:bg-slate-600 relative overflow-hidden group shadow-lg"
                              >
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                  initial={{ x: "-100%" }}
                                  whileHover={{ x: "100%" }}
                                  transition={{ duration: 0.6 }}
                                />
                                {quest.completed ? "✅ Completed" : "🚀 Begin Quest"}
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
      {/* ... */}
    </div>
  )
}
