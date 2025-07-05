"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// Define the type for the character prop
type Character = {
  name: string
  level: number
  exp: number
  maxExp: number
  class: string
  element: string
  image?: string
  intelligence: number
  maxIntelligence: number
  spellPower: number
  knowledge: number
  wisdom: number
  magicMastery: number
}

type CharacterProfileProps = {
  character: Character
  expPercentage: number
  intelligencePercentage: number
  onLevelUp: () => void
  isLevelingUp: boolean
}

const StatBar = ({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className={color}>{value}%</span>
    </div>
    <Progress value={value} className="h-2" />
  </div>
)

export const CharacterProfile = ({
  character,
  expPercentage,
  intelligencePercentage,
  onLevelUp,
  isLevelingUp,
}: CharacterProfileProps) => {
  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 p-6 lg:p-10 bg-slate-800/50 border-r border-slate-700/50 space-y-8">
      <AnimatePresence>
        <motion.div
          layout
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: "spring", stiffness: 50 }}
          className="sticky top-10"
        >
          <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
            <CardHeader className="text-center">
              <motion.div
                className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-purple-600/50 to-indigo-600/50 border-2 border-purple-400 shadow-lg flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                {character.image ? (
                  <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl drop-shadow-lg">🐲</span>
                )}
              </motion.div>
              <CardTitle className="text-2xl font-bold text-white">{character.name}</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge variant="secondary">{character.class}</Badge>
                <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                  {character.element}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Level and EXP */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300">Level {character.level}</span>
                  <span className="text-xs text-slate-400">
                    {character.exp} / {character.maxExp} EXP
                  </span>
                </div>
                <Progress value={expPercentage} className="h-3" />
              </div>

              {/* Main Stat: Intelligence */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-purple-400">🧠 Intelligence</span>
                  <span className="text-lg font-bold text-white">{character.intelligence}</span>
                </div>
                <Progress value={intelligencePercentage} className="h-2 bg-purple-400/20" />
              </div>

              {/* Sub-stats */}
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <StatBar label="🔮 Spell Power" value={character.spellPower} color="text-pink-400" />
                <StatBar label="📚 Knowledge" value={character.knowledge} color="text-blue-400" />
                <StatBar label="🦉 Wisdom" value={character.wisdom} color="text-cyan-400" />
                <StatBar label="🎭 Magic Mastery" value={character.magicMastery} color="text-indigo-400" />
              </div>

              {/* Dragon Evolution Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onLevelUp}
                  disabled={isLevelingUp}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={isLevelingUp ? { x: ["-100%", "100%"] } : {}}
                    transition={{ duration: 1.5, repeat: isLevelingUp ? Number.POSITIVE_INFINITY : 0 }}
                  />
                  <span className="text-lg mr-2">🧠</span>
                  {isLevelingUp ? "Evolving..." : "Enhance Intelligence"}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
} 