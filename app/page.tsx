"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { getW3Address } from "@w3vm/react"
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

export default function GameDashboard() {
  const address = getW3Address()

  const [selectedNFT, setSelectedNFT] = useState<any>(null)
  const [showNFTModal, setShowNFTModal] = useState(false)
  const [currentChain, setCurrentChain] = useState("ronin") // Current connected chain

  const [character, setCharacter] = useState({
    name: "Draconius the Wise",
    level: 7,
    exp: 850,
    maxExp: 1837,
    class: "Ancient Scholar Dragon",
    element: "Arcane & Knowledge",
    energy: 3,
    maxEnergy: 5,
    // Sadece Intelligence stat'ı
    intelligence: 485,
    maxIntelligence: 600,
    // Dragon Abilities - Intelligence odaklı
    spellPower: 92,
    knowledge: 88,
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

  // Enhanced NFT Card Component
  const NFTCard = ({ nft }: { nft: any }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={() => handleNFTClick(nft)}
      className="cursor-pointer"
    >
      <Card className="bg-slate-800/70 border-slate-700 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden group shadow-lg shadow-purple-500/10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />

        {/* Chain Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-slate-900/90 text-white border-slate-600 backdrop-blur-sm">
            <span className="mr-1">{nft.chainEmoji}</span>
            {nft.chainName}
          </Badge>
        </div>

        {/* Rarity Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`${getRarityColor(nft.rarity)} text-white border-0`}>✨ {nft.rarity}</Badge>
        </div>

        <CardContent className="p-0 relative z-10">
          {/* NFT Image with enhanced styling */}
          <div className="aspect-square bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-t-lg overflow-hidden relative">
            {/* Placeholder NFT Art */}
            <div className="w-full h-full bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-teal-600/20 flex items-center justify-center relative">
              {/* NFT Art Placeholder */}
              <div className="w-full h-full relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
                </div>

                {/* NFT Character/Art */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {nft.id === 1 && (
                    // Dragon NFT
                    <div className="text-center">
                      <div className="text-8xl mb-2 filter drop-shadow-lg">🐲</div>
                      <div className="text-2xl">👑</div>
                    </div>
                  )}
                  {nft.id === 2 && (
                    // Axie NFT
                    <div className="text-center">
                      <div className="text-8xl mb-2 filter drop-shadow-lg">🦄</div>
                      <div className="text-2xl">⚔️</div>
                    </div>
                  )}
                  {nft.id === 3 && (
                    // CryptoPunk NFT
                    <div className="text-center">
                      <div className="text-8xl mb-2 filter drop-shadow-lg">👽</div>
                      <div className="text-2xl">🕶️</div>
                    </div>
                  )}
                  {nft.id === 4 && (
                    // BAYC NFT
                    <div className="text-center">
                      <div className="text-8xl mb-2 filter drop-shadow-lg">🐵</div>
                      <div className="text-2xl">🤠</div>
                    </div>
                  )}
                  {nft.id === 5 && (
                    // Polygon Ape NFT
                    <div className="text-center">
                      <div className="text-8xl mb-2 filter drop-shadow-lg">🦍</div>
                      <div className="text-2xl">👑</div>
                    </div>
                  )}
                  {nft.id === 6 && (
                    // Arbitrum Knight NFT
                    <div className="text-center">
                      <div className="text-8xl mb-2 filter drop-shadow-lg">🛡️</div>
                      <div className="text-2xl">⚡</div>
                    </div>
                  )}
                </div>

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>

            {/* Hover Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center pb-4"
              transition={{ duration: 0.3 }}
            >
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">Click to Manage</Badge>
            </motion.div>
          </div>

          {/* NFT Info */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-white font-bold text-lg truncate">{nft.name}</h3>
              <p className="text-slate-400 text-sm truncate">{nft.description}</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Level</span>
                <Badge variant="outline" className="border-teal-500 text-teal-400">
                  {nft.level}
                </Badge>
              </div>
              <span className="text-purple-400 font-mono">#{nft.tokenId}</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-700/50 rounded p-2 text-center">
                <div className="text-slate-400">Rarity Score</div>
                <div className="text-white font-bold">
                  {nft.attributes.find((attr: any) => attr.trait_type.includes("Rarity"))?.value ||
                    nft.attributes.find((attr: any) => attr.trait_type.includes("Power"))?.value ||
                    "High"}
                </div>
              </div>
              <div className="bg-slate-700/50 rounded p-2 text-center">
                <div className="text-slate-400">Collection</div>
                <div className="text-white font-bold truncate">{nft.name.split(" ")[0]}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Detaylı Dragon Character Component
  const DragonCharacter = () => (
    <motion.div
      className="w-32 h-32 relative"
      whileHover={{ scale: 1.1, rotate: 5 }}
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" className="drop-shadow-2xl">
        {/* Dragon Body */}
        <ellipse cx="64" cy="80" rx="35" ry="25" fill="url(#dragonBodyGradient)" />

        {/* Dragon Wings */}
        <motion.path
          d="M30 60 Q20 40 35 45 Q45 35 50 50 Q40 65 30 60Z"
          fill="url(#wingGradient)"
          animate={{ rotate: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          style={{ transformOrigin: "40px 50px" }}
        />
        <motion.path
          d="M98 60 Q108 40 93 45 Q83 35 78 50 Q88 65 98 60Z"
          fill="url(#wingGradient)"
          animate={{ rotate: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          style={{ transformOrigin: "88px 50px" }}
        />

        {/* Dragon Head */}
        <ellipse cx="64" cy="45" rx="20" ry="18" fill="url(#dragonHeadGradient)" />

        {/* Dragon Eyes */}
        <motion.circle
          cx="58"
          cy="40"
          r="4"
          fill="#4F46E5"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.circle
          cx="70"
          cy="40"
          r="4"
          fill="#4F46E5"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />
        <circle cx="58" cy="40" r="2" fill="#FFFFFF" />
        <circle cx="70" cy="40" r="2" fill="#FFFFFF" />

        {/* Dragon Horns */}
        <path d="M52 30 L50 20 L56 25 Z" fill="url(#hornGradient)" />
        <path d="M76 30 L78 20 L72 25 Z" fill="url(#hornGradient)" />

        {/* Dragon Nostrils */}
        <ellipse cx="60" cy="48" rx="1.5" ry="1" fill="#7C3AED" />
        <ellipse cx="68" cy="48" rx="1.5" ry="1" fill="#7C3AED" />

        {/* Dragon Scales Pattern */}
        <g opacity="0.3">
          <circle cx="55" cy="70" r="3" fill="#10B981" />
          <circle cx="65" cy="75" r="3" fill="#10B981" />
          <circle cx="75" cy="70" r="3" fill="#10B981" />
          <circle cx="60" cy="85" r="3" fill="#10B981" />
          <circle cx="70" cy="90" r="3" fill="#10B981" />
        </g>

        {/* Dragon Tail */}
        <motion.path
          d="M95 85 Q110 90 115 75 Q120 85 105 95 Q100 90 95 85Z"
          fill="url(#tailGradient)"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          style={{ transformOrigin: "105px 85px" }}
        />

        {/* Magic Aura */}
        <motion.circle
          cx="64"
          cy="64"
          r="50"
          fill="none"
          stroke="url(#auraGradient)"
          strokeWidth="2"
          opacity="0.5"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 2, repeat: Number.POSITIVE_INFINITY },
            rotate: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          }}
        />

        {/* Floating Magic Orbs */}
        <motion.circle
          cx="30"
          cy="30"
          r="3"
          fill="#8B5CF6"
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.circle
          cx="98"
          cy="35"
          r="2"
          fill="#06B6D4"
          animate={{
            y: [0, -8, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.circle
          cx="20"
          cy="80"
          r="2.5"
          fill="#10B981"
          animate={{
            y: [0, -12, 0],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="dragonBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="dragonHeadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="hornGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="tailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="auraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Dragon Breath Effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-purple-400/30"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
    </motion.div>
  )

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

      <motion.div
        className="max-w-7xl mx-auto relative z-10 p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with Wallet Info */}
        <motion.div className="flex items-center justify-between mb-8" variants={itemVariants}>
          <div>
            <motion.h1
              className="text-5xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2 relative"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              🐲 Dragon Realms DeFi ⚔️
              <motion.div
                className="absolute -top-2 -right-2 text-yellow-400"
                animate={{
                  rotate: [0, 360],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                ✨
              </motion.div>
            </motion.h1>
            <motion.p
              className="text-slate-300 text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              🌊 Ancient Seas & Emerald Forests 🌿
            </motion.p>
          </div>

          {/* Wallet Info with Current Chain */}
          <div className="flex items-center gap-4">
            {/* Current Chain Indicator */}
            <Card className="bg-slate-800/70 border-teal-500/50 backdrop-blur-xl px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                    <span className="text-sm">{currentChainInfo.emoji}</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Connected to</div>
                    <div className="text-sm text-white font-semibold">{currentChainInfo.name}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Wallet Address */}
            <Card className="bg-slate-800/70 border-teal-500/50 backdrop-blur-xl px-4 py-2">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <div>
                  <div className="text-xs text-slate-400">🏰 Ronin Wallet</div>
                  <div className="text-sm text-white font-mono">{address}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNFT(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Dragon Character Panel */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Character Card */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/70 border-teal-500/50 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-teal-500/20">
                {/* Dragon Aura Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10 animate-pulse" />

                {/* Magical Border Animation */}
                <motion.div
                  className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-lg"
                  style={{ padding: "2px" }}
                  animate={{
                    background: [
                      "linear-gradient(45deg, #14b8a6, #10b981, #06b6d4)",
                      "linear-gradient(90deg, #10b981, #06b6d4, #14b8a6)",
                      "linear-gradient(135deg, #06b6d4, #14b8a6, #10b981)",
                      "linear-gradient(180deg, #14b8a6, #10b981, #06b6d4)",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="w-full h-full bg-slate-800/70 rounded-md" />
                </motion.div>

                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Detaylı Dragon Character */}
                      <DragonCharacter />
                      <div>
                        <motion.div
                          animate={isLevelingUp ? { scale: [1, 1.2, 1], color: ["#ffffff", "#fbbf24", "#ffffff"] } : {}}
                          transition={{ duration: 0.5, repeat: isLevelingUp ? 3 : 0 }}
                        >
                          <CardTitle className="text-3xl text-white font-bold">{character.name}</CardTitle>
                          <CardDescription className="text-slate-300 text-lg">
                            🧙‍♂️ Level {character.level} {character.class} 🔮
                          </CardDescription>
                          <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-500">
                            {character.element} Element
                          </Badge>
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setShowCharacterDetails(!showCharacterDetails)}
                          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 relative overflow-hidden group shadow-lg shadow-teal-500/25"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {showCharacterDetails ? "Hide Stats" : "View Stats"}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 relative overflow-hidden group shadow-lg shadow-orange-500/25">
                          <Crown className="w-4 h-4 mr-2" />
                          Evolve Dragon
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  {/* Sadece Experience ve Intelligence barları */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Experience Bar */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-300">✨ Dragon Experience</span>
                        <span className="text-sm text-teal-400">
                          {character.exp}/{character.maxExp}
                        </span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                      >
                        <Progress value={expPercentage} className="h-4 bg-slate-700" />
                      </motion.div>
                    </div>

                    {/* Intelligence Bar */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-300">🧠 Dragon Intelligence</span>
                        <span className="text-sm text-purple-400">
                          {character.intelligence}/{character.maxIntelligence}
                        </span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.7 }}
                      >
                        <Progress value={intelligencePercentage} className="h-4 bg-slate-700" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Energy Crystals */}
                  <div className="mt-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-300">⚡ Mystical Energy</span>
                      <span className="text-sm text-cyan-400">
                        {character.energy}/{character.maxEnergy}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {Array.from({ length: character.maxEnergy }).map((_, i) => (
                        <motion.div
                          key={i}
                          className={`w-10 h-10 rounded-full ${
                            i < character.energy
                              ? "bg-gradient-to-r from-cyan-400 to-teal-400 shadow-lg shadow-cyan-400/50"
                              : "bg-slate-600"
                          } flex items-center justify-center`}
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: i * 0.1, type: "spring" }}
                          whileHover={{ scale: 1.2, rotate: 360 }}
                        >
                          <Zap className="w-5 h-5 text-white" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        onClick={handleClaimReward}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 relative overflow-hidden shadow-lg shadow-yellow-500/25"
                      >
                        <AnimatePresence>
                          {showRewardAnimation && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400"
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ scale: 2, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1 }}
                            />
                          )}
                        </AnimatePresence>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <Dice6 className="w-4 h-4 mr-2" />
                        </motion.div>
                        🎲 Dragon Treasure
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats Panel */}
            <div className="lg:col-span-1">
              <AnimatePresence>
                {showCharacterDetails && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    <Card className="bg-slate-800/70 border-emerald-500/50 backdrop-blur-xl shadow-lg shadow-emerald-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Swords className="w-5 h-5 text-emerald-400" />🐲 Dragon Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          {/* Core Stat - Sadece Intelligence */}
                          <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                            <div className="flex items-center justify-center mb-2">
                              <span className="text-4xl mr-2">🧠</span>
                              <div>
                                <div className="text-3xl font-bold text-white">{character.intelligence}</div>
                                <div className="text-sm text-purple-300">Intelligence</div>
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">The source of all dragon wisdom</div>
                            <div className="mt-2">
                              <Progress value={intelligencePercentage} className="h-2" />
                            </div>
                          </div>

                          {/* Dragon Abilities - Intelligence odaklı */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                              <span className="text-lg">🔮</span>🧙‍♂️ Scholar Dragon Abilities
                            </h4>

                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-300">✨ Spell Power</span>
                                  <span className="text-purple-400">{character.spellPower}%</span>
                                </div>
                                <Progress value={character.spellPower} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-300">📚 Knowledge</span>
                                  <span className="text-blue-400">{character.knowledge}%</span>
                                </div>
                                <Progress value={character.knowledge} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-300">🦉 Wisdom</span>
                                  <span className="text-cyan-400">{character.wisdom}%</span>
                                </div>
                                <Progress value={character.wisdom} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-300">🎭 Magic Mastery</span>
                                  <span className="text-indigo-400">{character.magicMastery}%</span>
                                </div>
                                <Progress value={character.magicMastery} className="h-2" />
                              </div>
                            </div>
                          </div>

                          {/* Dragon Evolution Button */}
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              onClick={handleLevelUp}
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 relative overflow-hidden group"
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                              />
                              <span className="text-lg mr-2">🧠</span>Enhance Intelligence
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Tabs with Ocean/Forest Theme */}
        <motion.div variants={itemVariants}>
          {userNFT ? (
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
                <motion.div
                  className="relative h-[600px] bg-gradient-to-br from-blue-900/30 via-teal-900/30 to-emerald-900/30 rounded-2xl overflow-hidden border border-teal-500/30 backdrop-blur-xl"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Ocean Background */}
                  <div className="absolute inset-0">
                    {/* Animated Water Waves */}
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                      }}
                      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.3) 0%, transparent 50%), 
                                         radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)`,
                        backgroundSize: "200px 200px",
                      }}
                    />

                    {/* Floating Particles */}
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-teal-400/40 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.2, 0.8, 0.2],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>

                  {/* Bridge Title with Current Chain Info */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
                    <motion.h2
                      className="text-3xl font-bold text-white text-center"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      🌉 Dragon Bridge - Blockchain Islands 🏝️
                    </motion.h2>
                    <motion.div
                      className="flex items-center justify-center gap-2 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <span className="text-slate-300">Currently on:</span>
                      <Badge className={`bg-gradient-to-r ${currentChainInfo.gradient} text-white border-0`}>
                        <span className="mr-1">{currentChainInfo.emoji}</span>
                        {currentChainInfo.name}
                      </Badge>
                    </motion.div>
                    <motion.p
                      className="text-slate-300 text-center mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      Click on any island to bridge your dragon NFT
                    </motion.p>
                  </div>

                  {/* Blockchain Islands */}
                  {blockchainIslands.map((island, index) => (
                    <motion.div
                      key={island.id}
                      className="absolute cursor-pointer group"
                      style={{
                        left: `${island.position.x}%`,
                        top: `${island.position.y}%`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.2, type: "spring" }}
                      whileHover={island.unlocked ? { scale: 1.1, y: -5 } : {}}
                      onClick={() => handleIslandClick(island)}
                    >
                      {/* Island Base */}
                      <motion.div
                        className={`relative w-24 h-24 rounded-full ${!island.unlocked ? "opacity-50" : ""}`}
                        animate={
                          island.unlocked
                            ? {
                                y: [0, -3, 0],
                              }
                            : {}
                        }
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                      >
                        {/* New Island Design with Logo */}
                        <div className="relative w-full h-full">
                          {/* Island Base */}
                          <svg width="96" height="96" viewBox="0 0 96 96" className="drop-shadow-xl">
                            <defs>
                              <radialGradient id={`gradient-${island.id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" style={{ stopColor: "rgba(132, 204, 22, 0.8)" }} />
                                <stop offset="100%" style={{ stopColor: "rgba(101, 163, 13, 0.6)" }} />
                              </radialGradient>
                            </defs>
                            <ellipse cx="48" cy="70" rx="40" ry="20" fill={`url(#gradient-${island.id})`} />
                            <ellipse cx="48" cy="65" rx="35" ry="15" fill="rgba(132, 204, 22, 0.7)" />
                        </svg>

                          {/* Chain Logo */}
                          <div className="absolute inset-0 flex items-center justify-center -translate-y-4">
                            <motion.img
                              src={island.logo}
                              alt={`${island.name} Logo`}
                              className="w-12 h-12 object-contain drop-shadow-lg"
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            />
                          </div>

                          {/* Island Name */}
                          <div className="absolute bottom-4 w-full text-center">
                            <span className="text-white text-xs font-bold bg-black/30 px-2 py-1 rounded-full">
                              {island.name}
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Island Name Tooltip */}
                      <AnimatePresence>
                        {island.unlocked && (
                      <motion.div
                        className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-xl border border-teal-500/50 rounded-lg p-3 min-w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        initial={{ y: 10 }}
                        whileHover={{ y: 0 }}
                      >
                        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <span>{island.emoji}</span>
                          </div>
                          {island.name}
                        </h4>
                        <p className="text-slate-300 text-xs mb-2">{island.description}</p>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-400">Level {island.requiredLevel}+</span>
                          <span className="text-yellow-400">{island.bridgeFee}</span>
                        </div>
                        {currentChain === island.chain && (
                          <div className="text-green-400 text-xs font-semibold">✅ Current Chain</div>
                        )}
                        {!island.unlocked && <div className="text-red-400 text-xs mt-1">🔒 Sealed</div>}
                        {island.unlocked && character.level < island.requiredLevel && (
                          <div className="text-red-400 text-xs mt-1">📊 Level {island.requiredLevel} Required</div>
                        )}
                      </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Island Particles */}
                      {island.unlocked && (
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${island.gradient}`}
                              style={{
                                left: `${20 + i * 20}%`,
                                top: `${10 + Math.sin(i) * 10}%`,
                              }}
                              animate={{
                                y: [0, -15, 0],
                                opacity: [0.3, 1, 0.3],
                                scale: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 2 + i * 0.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.3,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Bridge Connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                    {blockchainIslands.map((island, index) => {
                      if (index === 0) return null
                      const prevIsland = blockchainIslands[index - 1]
                      return (
                        <motion.line
                          key={`connection-${island.id}`}
                          x1={`${prevIsland.position.x}%`}
                          y1={`${prevIsland.position.y + 5}%`}
                          x2={`${island.position.x}%`}
                          y2={`${island.position.y + 5}%`}
                          stroke="rgba(20, 184, 166, 0.3)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, delay: index * 0.5 }}
                        />
                      )
                    })}
                  </svg>
                </motion.div>
              </TabsContent>
            </Tabs>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center text-center p-12 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700 mt-6"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="text-6xl mb-4">🐲</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Dragon NFT Owned</h3>
              <p className="text-slate-400 mb-6">
                You need a Dragon NFT to participate in quests and battles. <br />
                Mint your first dragon to begin your journey!
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleMintNFT}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Mint Your First Dragon
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* NFT Detail Modal */}
      <AnimatePresence>
        {showNFTModal && selectedNFT && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNFTModal(false)}
          >
            <motion.div
              className="bg-slate-800/90 backdrop-blur-xl border border-purple-500/50 rounded-lg p-6 max-w-2xl w-full relative overflow-hidden"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Background Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />

              <div className="relative z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-slate-900/80 text-white border-slate-600">
                      <span className="mr-1">{selectedNFT.chainEmoji}</span>
                      {selectedNFT.chainName}
                    </Badge>
                    <Badge className={getRarityColor(selectedNFT.rarity)}>{selectedNFT.rarity}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNFTModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* NFT Image */}
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg overflow-hidden relative">
                      {/* Enhanced NFT Display */}
                      <div className="w-full h-full bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-teal-600/20 flex items-center justify-center relative">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
                        </div>

                        {/* Large NFT Character */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {selectedNFT.id === 1 && (
                            <div className="text-center">
                              <div className="text-9xl mb-4 filter drop-shadow-2xl">🐲</div>
                              <div className="text-4xl">👑</div>
                            </div>
                          )}
                          {selectedNFT.id === 2 && (
                            <div className="text-center">
                              <div className="text-9xl mb-4 filter drop-shadow-2xl">🦄</div>
                              <div className="text-4xl">⚔️</div>
                            </div>
                          )}
                          {selectedNFT.id === 3 && (
                            <div className="text-center">
                              <div className="text-9xl mb-4 filter drop-shadow-2xl">👽</div>
                              <div className="text-4xl">🕶️</div>
                            </div>
                          )}
                          {selectedNFT.id === 4 && (
                            <div className="text-center">
                              <div className="text-9xl mb-4 filter drop-shadow-2xl">🐵</div>
                              <div className="text-4xl">🤠</div>
                            </div>
                          )}
                          {selectedNFT.id === 5 && (
                            <div className="text-center">
                              <div className="text-9xl mb-4 filter drop-shadow-2xl">🦍</div>
                              <div className="text-4xl">👑</div>
                            </div>
                          )}
                          {selectedNFT.id === 6 && (
                            <div className="text-center">
                              <div className="text-9xl mb-4 filter drop-shadow-2xl">🛡️</div>
                              <div className="text-4xl">⚡</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                          🌉 Bridge NFT
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full border-slate-600 hover:border-purple-500 bg-transparent"
                        >
                          📊 View on Explorer
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* NFT Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{selectedNFT.name}</h3>
                      <p className="text-slate-400 mb-2">{selectedNFT.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Level {selectedNFT.level}</span>
                        <span>Token ID: #{selectedNFT.tokenId}</span>
                      </div>
                    </div>

                    {/* Contract Info */}
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <h4 className="text-white font-semibold mb-2">📋 Contract Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Contract:</span>
                          <span className="text-white font-mono">{selectedNFT.contractAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Token ID:</span>
                          <span className="text-white">#{selectedNFT.tokenId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Chain:</span>
                          <span className="text-white">
                            {selectedNFT.chainEmoji} {selectedNFT.chainName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attributes */}
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <h4 className="text-white font-semibold mb-3">✨ Attributes</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedNFT.attributes.map((attr: any, index: number) => (
                          <motion.div
                            key={index}
                            className="flex justify-between items-center p-2 bg-slate-600/50 rounded"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <span className="text-slate-300 text-sm">{attr.trait_type}</span>
                            <span className="text-white font-semibold">{attr.value}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Management Actions */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">🛠️ NFT Management</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 hover:border-green-500 bg-transparent"
                          >
                            <span className="mr-2">🎮</span>
                            Use in Game
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 hover:border-blue-500 bg-transparent"
                          >
                            <span className="mr-2">💰</span>
                            List for Sale
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 hover:border-yellow-500 bg-transparent"
                          >
                            <span className="mr-2">🔄</span>
                            Transfer NFT
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bridge Modal */}
      <AnimatePresence>
        {showBridgeModal && selectedRealm && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBridgeModal(false)}
          >
            <motion.div
              className="bg-slate-800/90 backdrop-blur-xl border border-teal-500/50 rounded-lg p-6 max-w-md w-full relative overflow-hidden"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Background Effect */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${selectedRealm.gradient}/20`}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />

              <div className="relative z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedRealm.gradient} flex items-center justify-center text-2xl`}
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {selectedRealm.emoji}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Bridge to {selectedRealm.name}</h3>
                      <p className="text-sm text-slate-400">Chain ID: {selectedRealm.chainId}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBridgeModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>

                {/* Bridge Steps */}
                <div className="space-y-4">
                  {bridgeStep === 1 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {/* Current Chain Info */}
                      <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">📍 Current Location</h4>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentChainInfo.gradient} flex items-center justify-center text-lg`}
                          >
                            {currentChainInfo.emoji}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{currentChainInfo.name}</div>
                            <div className="text-slate-400 text-sm">Chain ID: {currentChainInfo.chainId}</div>
                          </div>
                        </div>
                      </div>

                      {/* NFT Selection */}
                      <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          🐲 Select NFT to Bridge
                        </h4>
                        <div className="space-y-3">
                          {userNFT && userNFT.chain === currentChain ? (
                            <motion.div
                              className="p-3 bg-slate-600/50 rounded border-2 border-teal-500 cursor-pointer transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/50 to-blue-500/50 rounded-lg overflow-hidden flex items-center justify-center">
                                  <span className="text-2xl">
                                    {/* Bu emoji mantığı daha dinamik hale getirilebilir */}
                                    {"🐲"}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm text-white font-medium truncate">{userNFT.name}</p>
                                  <p className="text-xs text-slate-400">
                                    {userNFT.chainEmoji} {userNFT.chainName}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                              <p className="text-slate-400 text-sm">
                                You do not have a bridgeable NFT on the {currentChainInfo.name} chain.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bridge Info */}
                      <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h4 className="text-white font-semibold mb-3">⛓️ Bridge Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">From:</span>
                            <span className="text-white">
                              {currentChainInfo.emoji} {currentChainInfo.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">To:</span>
                            <span className="text-white">
                              {selectedRealm.emoji} {selectedRealm.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Bridge Fee:</span>
                            <span className="text-yellow-400">{selectedRealm.bridgeFee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Estimated Time:</span>
                            <span className="text-cyan-400">~5 minutes</span>
                          </div>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={handleBridgeNFT}
                          className={`w-full bg-gradient-to-r ${selectedRealm.gradient} hover:opacity-90 relative overflow-hidden group shadow-lg`}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                          />
                          🌉 Start Bridge Process
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}

                  {bridgeStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        className="w-20 h-20 mx-auto mb-4 border-4 border-teal-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                      <h4 className="text-xl font-bold text-white mb-2">🌉 Bridging NFT</h4>
                      <p className="text-slate-400 mb-4">Your NFT is traveling between realms...</p>
                      <div className="flex justify-center gap-2">
                        {[currentChainInfo.emoji, "✨", "🌊", "⚡", selectedRealm.emoji].map((emoji, i) => (
                          <motion.div
                            key={i}
                            className="text-2xl"
                            animate={{
                              y: [0, -10, 0],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              delay: i * 0.2,
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                            }}
                          >
                            {emoji}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {bridgeStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-3xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                      >
                        ✅
                      </motion.div>
                      <h4 className="text-xl font-bold text-white mb-2">🎉 Bridge Successful!</h4>
                      <p className="text-slate-400 mb-4">Your NFT has arrived at {selectedRealm.name}</p>
                      <div className="flex justify-center gap-2 text-2xl">
                        <span>{currentChainInfo.emoji}</span>
                        <span>→</span>
                        <motion.span
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          {selectedRealm.emoji}
                        </motion.span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Dragon Level Up Animation */}
      <AnimatePresence>
        {isLevelingUp && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 1 }}
            >
              {/* Dragon Evolution Circle */}
              <motion.div
                className="absolute inset-0 w-96 h-96 border-4 border-orange-400/30 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 w-80 h-80 border-2 border-teal-400/20 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />

              <motion.div
                className="text-8xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4 relative z-10"
                animate={{
                  scale: [1, 1.2, 1],
                  textShadow: [
                    "0 0 30px rgba(147, 51, 234, 0.5)",
                    "0 0 60px rgba(147, 51, 234, 1)",
                    "0 0 30px rgba(147, 51, 234, 0.5)",
                  ],
                }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                🧠 INTELLIGENCE EVOLVED! 🔮
              </motion.div>
              <motion.div
                className="text-3xl text-white mb-4 relative z-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                🧙‍♂️ Level {character.level + 1} Scholar Dragon! 📚
              </motion.div>
              <motion.div
                className="flex justify-center mt-4 relative z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                {["🧠", "🔮", "📚", "✨", "🦉", "🎭", "🏆"].map((emoji, i) => (
                  <motion.div
                    key={i}
                    className="text-4xl mx-2"
                    animate={{
                      y: [0, -30, 0],
                      rotate: [0, 360],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      delay: i * 0.1,
                      duration: 1,
                      repeat: 2,
                    }}
                  >
                    {emoji}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
