"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"

// Define types for props
type Island = {
  id: number
  name: string
  position: { x: number; y: number }
  unlocked: boolean
  logo: string
  gradient: string
  glowColor: string
  emoji: string
  description: string
  requiredLevel: number
  bridgeFee: string
  chain: string
}

type CurrentChainInfo = {
  gradient: string
  emoji: string
  name: string
}

type BridgeTabProps = {
  blockchainIslands: Island[]
  handleIslandClick: (island: Island) => void
  currentChainInfo: CurrentChainInfo
  characterLevel: number
  currentChain: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// A more detailed, organic-looking island base
const IslandBase = ({ island }: { island: Island }) => (
  <svg width="110" height="110" viewBox="0 0 120 120" className="drop-shadow-2xl">
    <defs>
      <radialGradient id={`island_glow_${island.id}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={island.glowColor} stopOpacity="0.5" />
        <stop offset="100%" stopColor={island.glowColor} stopOpacity="0" />
      </radialGradient>
      <filter id="displacementFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
      </filter>
    </defs>
    
    {/* Island Glow on Hover */}
    <motion.path
      d="M 60,10 A 50,50 0 1,1 59,10 Z"
      fill={`url(#island_glow_${island.id})`}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
    />
    
    {/* Rock Path */}
    <path 
      d="M 20,70 Q 30,50 50,60 T 80,65 Q 100,70 110,80 T 90,100 Q 70,110 50,105 T 20,90 Q 10,80 20,70 Z"
      fill="#5a4d41" 
      stroke="#4e4238"
      strokeWidth="2"
      filter="url(#displacementFilter)"
    />
     {/* Grass Path */}
    <path 
      d="M 25,75 Q 35,55 55,65 T 85,70 Q 100,75 105,85 T 85,95 Q 65,105 45,100 T 25,85 Q 15,75 25,75 Z"
      fill="#4F7942"
      filter="url(#displacementFilter)"
    />
  </svg>
)

export const BridgeTab = ({
  blockchainIslands,
  handleIslandClick,
  currentChainInfo,
  characterLevel,
  currentChain,
}: BridgeTabProps) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 bg-gradient-to-br from-blue-900/30 via-teal-900/30 to-emerald-900/30 rounded-2xl border border-teal-500/30 backdrop-blur-xl p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Title Area */}
      <div className="text-center w-full px-4 pt-2">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">
          🌉 Dragon Bridge - Blockchain Islands 🏝️
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-slate-300">Currently on:</span>
          <Badge className={`bg-gradient-to-r ${currentChainInfo.gradient} text-white border-0`}>
            <span className="mr-1">{currentChainInfo.emoji}</span>
            {currentChainInfo.name}
          </Badge>
        </div>
        <p className="text-slate-300 text-center mt-1">
          Click on any available island to bridge your dragon NFT
        </p>
      </div>

      {/* Island Map Area */}
      <div className="relative w-full h-[550px]">
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

        {/* Blockchain Islands */}
        {blockchainIslands.map((island, index) => {
          const isOnThisChain = currentChain === island.chain
          return (
            <motion.div
              key={island.id}
              className={`absolute group ${!island.unlocked || isOnThisChain ? 'cursor-default' : 'cursor-pointer'}`}
              style={{
                left: `${island.position.x}%`,
                top: `${island.position.y}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2, type: "spring" }}
              whileHover={!isOnThisChain && island.unlocked ? { scale: 1.1, y: -5 } : {}}
              onClick={() => !isOnThisChain && island.unlocked && handleIslandClick(island)}
            >
              {/* Island visuals... */}
              <motion.div
                className={`relative w-28 h-28 ${!island.unlocked ? 'opacity-50' : ''}`}
              >
                {/* Visual indicator for the current chain */}
                {isOnThisChain && (
                   <motion.div className="absolute -inset-2 rounded-full border-4 border-green-400 shadow-lg shadow-green-500/50"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                   />
                )}

                {/* New Island Design with Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <IslandBase island={island} />
                </div>

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
                  <div className="absolute bottom-6 w-full text-center">
                    <span className="text-white text-xs font-bold bg-black/40 px-2 py-1 rounded-full">
                      {island.name}
                    </span>
                  </div>
              </motion.div>

              {/* Enhanced Tooltip - Now appears above the island */}
              <AnimatePresence>
                <div className="absolute -top-28 left-1/2 transform -translate-x-1/2 w-52 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <motion.div
                    className="bg-slate-800/90 backdrop-blur-xl border border-teal-500/50 rounded-lg p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {!island.unlocked ? (
                      // === LOCKED TOOLTIP ===
                      <div>
                        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                          <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <span>{island.name}</span>
                        </h4>
                        <div className="text-red-400 text-xs mt-1 ml-6">
                          Requires Level {island.requiredLevel}
                        </div>
                      </div>
                    ) : (
                      // === UNLOCKED & CURRENT CHAIN TOOLTIP ===
                      <div>
                        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <span>{island.emoji}</span>
                          </div>
                          {island.name}
                        </h4>
                        <p className="text-slate-300 text-xs my-2">{island.description}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Fee:</span>
                          <span className="text-yellow-400 font-mono">{island.bridgeFee}</span>
                        </div>
                        {isOnThisChain && (
                          <div className="text-green-400 text-xs font-semibold mt-2 pt-2 border-t border-slate-700">
                            ✅ You are currently on this chain.
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              </AnimatePresence>
            </motion.div>
          )
        })}

        {/* Bridge Connections - Upgraded to energy flows */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none" style={{ zIndex: 1 }}>
          <defs>
            <linearGradient id="energy-flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(167, 139, 250, 0)" />
              <stop offset="50%" stopColor="rgba(196, 181, 253, 1)" />
              <stop offset="100%" stopColor="rgba(167, 139, 250, 0)" />
            </linearGradient>
          </defs>
          {blockchainIslands.map((island, index) => {
            if (index === 0) return null
            const prevIsland = blockchainIslands[index - 1]
            
            // Convert percentage positions to absolute SVG coordinates based on viewBox
            const x1 = prevIsland.position.x / 100 * 1000
            const y1 = prevIsland.position.y / 100 * 600
            const x2 = island.position.x / 100 * 1000
            const y2 = island.position.y / 100 * 600

            // Create a curved path for a more organic feel
            const pathD = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1 - 50}, ${(x1 + x2) / 2} ${y2 + 50}, ${x2} ${y2}`

            return (
              <motion.path
                key={`connection-${island.id}`}
                d={pathD}
                stroke="url(#energy-flow)"
                strokeWidth="5"
                fill="none"
                strokeDasharray="20 30"
                initial={{ strokeDashoffset: 50 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            )
          })}

          {/* Add a final connection from the last island back to the first one to complete the circle */}
          {blockchainIslands.length > 1 && (() => {
            const lastIsland = blockchainIslands[blockchainIslands.length - 1];
            const firstIsland = blockchainIslands[0];
            
            const x1 = lastIsland.position.x / 100 * 1000;
            const y1 = lastIsland.position.y / 100 * 600;
            const x2 = firstIsland.position.x / 100 * 1000;
            const y2 = firstIsland.position.y / 100 * 600;

            const pathD = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1 + 50}, ${(x1 + x2) / 2} ${y2 - 50}, ${x2} ${y2}`;

            return (
              <motion.path
                key="connection-loop"
                d={pathD}
                stroke="url(#energy-flow)"
                strokeWidth="5"
                fill="none"
                strokeDasharray="20 30"
                initial={{ strokeDashoffset: 50 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: blockchainIslands.length * 0.5 }}
              />
            );
          })()}
        </svg>
      </div>
    </motion.div>
  )
} 