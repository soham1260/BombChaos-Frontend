import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import MusicToggleButton from './MusicToggleButton.jsx';

const SLOT_COLORS = {
    red: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' },
    blue: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' },
    yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
};
const COLOR_KEYS = ['red', 'blue', 'green', 'yellow'];

function StatBadge({ icon, value, title }) {
    return (
        <span title={title} className="flex items-center gap-1 text-xs bg-white/10 px-2 py-0.5 rounded">
            <span>{icon}</span>
            <span className="text-white font-bold">{value}</span>
        </span>
    );
}

export default function HUD() {
    const { gameState, gameStartPlayers, mySocketId } = useGameStore();
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    if (!gameState) return null;

    const alivePlayers = gameState.players.filter(p => p.alive);
    const me = gameState.players.find(p => p.id === mySocketId);

    function formatTime(s) {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    }

    return (
        <>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2
                      bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                {/* Players */}
                <div className="flex gap-2">
                    {gameState.players.map(p => {
                        const colorKey = COLOR_KEYS[p.slotIndex] || 'red';
                        const c = SLOT_COLORS[colorKey];
                        const lobbyMeta = gameStartPlayers.find(lp => lp.id === p.id);
                        const isMe = p.id === mySocketId;
                        return (
                            <div key={p.id}
                                className={`glass rounded-lg px-3 py-1 border ${c.border} ${c.bg} transition-all
                           ${!p.alive ? 'opacity-40' : ''} ${isMe ? 'ring-1 ring-white/30' : ''}`}>
                                <div className={`text-xs font-bold ${c.text} flex items-center gap-1`}>
                                    {!p.alive && '💀 '}
                                    {lobbyMeta?.nickname || `P${p.slotIndex + 1}`}
                                    {isMe && <span className="text-white/40 font-normal">(you)</span>}
                                </div>
                                {p.alive && (
                                    <div className="flex gap-1 mt-0.5">
                                        <StatBadge icon="💣" value={p.stats.maxBombs} title="Max Bombs" />
                                        <StatBadge icon="🔥" value={p.stats.bombRange} title="Range" />
                                        <StatBadge icon="⚡" value={p.stats.speed} title="Speed" />
                                        {p.stats.hasRemoteBomb && <StatBadge icon="📡" value="" title="Remote Bomb" />}
                                        {p.stats.hasBombKick && <StatBadge icon="🦵" value="" title="Bomb Kick" />}
                                        {p.stats.hasPiercingFlame && <StatBadge icon="🔱" value="" title="Piercing Flame" />}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Timer + alive count + music toggle */}
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <MusicToggleButton className="pointer-events-auto text-base px-2 py-1" />
                        <div className="glass px-4 py-1 rounded-lg text-orange-400 font-mono font-bold text-xl">
                            ⏱ {formatTime(elapsedSeconds)}
                        </div>
                    </div>
                    <div className="glass px-3 py-0.5 rounded-lg text-sm text-slate-300">
                        💚 {alivePlayers.length} alive
                    </div>
                </div>
            </div>

            {/* Bottom controls hint */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 pointer-events-none
                      glass rounded-full px-4 py-1 text-xs text-slate-500">
                WASD / ↑↓←→ move · SPACE place bomb · R detonate (if remote)
            </div>
        </>
    );
}
