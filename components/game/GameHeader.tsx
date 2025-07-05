"use client"

import { Button } from "@/components/ui/button"

type GameHeaderProps = {
  address: string
  onDisconnect: () => void
}

export const GameHeader = ({ address, onDisconnect }: GameHeaderProps) => {
  return (
    <header className="absolute top-4 right-4 z-20">
      <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <div className="text-xs text-slate-400">🏰 Ronin Wallet</div>
          <div className="text-sm text-white font-mono">{`${address.slice(
            0,
            6
          )}...${address.slice(-4)}`}</div>
        </div>
        {/* Disconnect functionality can be handled by the ronin-button itself if configured,
            or a custom disconnect function can be passed as a prop.
            For now, this button is for UI representation. */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDisconnect}
          className="text-slate-400 hover:text-white"
        >
          Disconnect
        </Button>
      </div>
    </header>
  )
} 