/**
 * @file ResultsScreen.jsx
 * @description Post-game results with Framer Motion confetti, scoreboard, and navigation.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket.js';
import { useGameStore } from '../store/gameStore.js';

const COLORS = { red: '#f87171', blue: '#60a5fa', green: '#4ade80', yellow: '#fbbf24' };
const EMOJIS = ['🥇', '🥈', '🥉', '4️⃣'];

function ConfettiPiece({ delay }) {
    const colors = ['#f97316', '#fbbf24', '#f472b6', '#60a5fa', '#4ade80'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 100;
    return (
        <motion.div
            className="absolute w-3 h-3 rounded-sm"
            style={{ left: `${x}%`, top: '-5%', backgroundColor: color }}
            animate={{
                y: ['0vh', '110vh'],
                rotate: [0, 720 * (Math.random() > 0.5 ? 1 : -1)],
                x: [(0), (Math.random() - 0.5) * 200],
            }}
            transition={{ duration: 3 + Math.random() * 2, delay, ease: 'linear', repeat: Infinity, repeatDelay: Math.random() * 3 }}
        />
    );
}

export default function ResultsScreen() {
    const { gameOverData, gameStartPlayers, mySocketId, roomState, resetGame, setScreen, resetAll } = useGameStore();
    const [showScoreboard, setShowScoreboard] = useState(false);

    const scoreboard = gameOverData?.scoreboard || [];
    const winner = scoreboard.find(p => p.won);
    const isWinner = winner?.id === mySocketId;

    // Sort by: won > kills > survivalTime
    const sorted = [...scoreboard].sort((a, b) => {
        if (a.won !== b.won) return a.won ? -1 : 1;
        if (b.kills !== a.kills) return b.kills - a.kills;
        return b.survivalTime - a.survivalTime;
    });

    useEffect(() => {
        const t = setTimeout(() => setShowScoreboard(true), 1200);
        return () => clearTimeout(t);
    }, []);

    const isHost = gameOverData && useGameStore.getState().roomState?.hostId === mySocketId;

    function handlePlayAgain() {
        socket.emit('return_to_lobby');
        // Navigation happens via room_update received in App.jsx
    }

    function handleMainMenu() {
        socket.emit('leave_room');
        resetAll();
    }

    const slotColorKeys = ['red', 'blue', 'green', 'yellow'];

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at top, #1a0000 0%, #0a0a0f 60%)' }}>

            {/* Confetti */}
            {[...Array(30)].map((_, i) => <ConfettiPiece key={i} delay={i * 0.15} />)}

            {/* Winner announcement */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="text-center mb-8"
            >
                <div className="text-7xl mb-3">{isWinner ? '🏆' : '💥'}</div>
                <h1 className="glow-title text-5xl font-black text-orange-400 mb-2">
                    {winner ? `${winner.nickname} WINS!` : 'DRAW!'}
                </h1>
                <p className="text-slate-400 text-lg">
                    {isWinner ? '🎉 Congratulations, you are the Bomb Master!' : `Better luck next time!`}
                </p>
            </motion.div>

            {/* Scoreboard */}
            <AnimatePresence>
                {showScoreboard && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-6 w-full max-w-2xl space-y-3"
                    >
                        <h2 className="text-center text-slate-400 text-sm uppercase tracking-widest mb-4">Scoreboard</h2>
                        {sorted.map((player, rank) => {
                            const colorKey = slotColorKeys[player.slotIndex] || 'red';
                            const isMe = player.id === mySocketId;
                            return (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: rank * 0.1 }}
                                    className={`flex items-center gap-4 p-3 rounded-xl border ${player.won ? 'border-orange-500 bg-orange-500/10' :
                                        isMe ? 'border-white/20 bg-white/5' : 'border-white/5'
                                        }`}
                                >
                                    <span className="text-2xl">{EMOJIS[rank] || '💥'}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold" style={{ color: COLORS[colorKey] }}>
                                                {player.nickname}
                                            </span>
                                            {isMe && <span className="text-xs bg-white/10 text-slate-400 px-1 py-0.5 rounded">YOU</span>}
                                            {player.won && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">WINNER</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-6 text-center">
                                        {[
                                            { label: 'Kills', value: player.kills, icon: '💀' },
                                            { label: 'Bombs', value: player.bombsPlaced, icon: '💣' },
                                            { label: 'Power-ups', value: player.powerupsCollected, icon: '⚡' },
                                            { label: 'Survived', value: `${player.survivalTime}s`, icon: '⏱️' },
                                        ].map(stat => (
                                            <div key={stat.label} className="w-16">
                                                <div className="text-lg font-bold text-white">{stat.value}</div>
                                                <div className="text-xs text-slate-500">{stat.icon} {stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Buttons */}
            {showScoreboard && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-4 mt-6"
                >
                    {isHost ? (
                        <button onClick={handlePlayAgain}
                            className="btn-neon bg-orange-500 border-orange-400 text-white px-8 py-3">
                            🔄 Play Again
                        </button>
                    ) : (
                        <button onClick={() => resetGame()}
                            className="btn-neon bg-orange-500 border-orange-400 text-white px-8 py-3">
                            🏟️ Go to Lobby
                        </button>
                    )}
                    <button onClick={handleMainMenu}
                        className="btn-neon bg-transparent border-slate-600 text-slate-400 px-8 py-3">
                        🏠 Main Menu
                    </button>
                </motion.div>
            )}
        </div>
    );
}
