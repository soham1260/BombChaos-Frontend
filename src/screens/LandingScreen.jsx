import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket.js';
import { useGameStore } from '../store/gameStore.js';


export default function LandingScreen() {
    const { setNickname, setRoomCode, setRoomState, setScreen } = useGameStore();
    const [name, setName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [mode, setMode] = useState(null); // null | 'join'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validName = name.trim().length >= 2;

    function handleCreate() {
        if (!validName) return setError('Enter a nickname (≥2 chars)');
        setLoading(true);
        socket.emit('create_room', { nickname: name.trim() }, (res) => {
            setLoading(false);
            if (res.success) {
                setNickname(name.trim());
                setRoomCode(res.code);
                setScreen('lobby');
            } else {
                setError(res.error || 'Failed to create room');
            }
        });
    }

    function handleJoin() {
        if (!validName) return setError('Enter a nickname (≥2 chars)');
        if (joinCode.trim().length !== 6) return setError('Enter a valid 6-letter room code');
        setLoading(true);
        socket.emit('join_room', { nickname: name.trim(), code: joinCode.trim().toUpperCase() }, (res) => {
            setLoading(false);
            if (res.success) {
                setNickname(name.trim());
                setRoomCode(res.code);
                setScreen('lobby');
            } else {
                setError(res.error || 'Failed to join room');
            }
        });
    }

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden scanlines"
            style={{ background: 'radial-gradient(ellipse at center, #1a0a00 0%, #0a0a0f 70%)' }}>

            <motion.div className="bomb-float mb-4 select-none" style={{ fontSize: 96 }}>
                💣
            </motion.div>

            <h1 className="glow-title text-6xl md:text-8xl font-black tracking-tight mb-2 text-orange-400"
                style={{ letterSpacing: '-0.02em' }}>
                BOMB CHAOS
            </h1>
            <p className="text-slate-400 text-lg mb-10 tracking-widest uppercase">
                Battle Royale · Drop Bombs · Survive
            </p>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-8 w-full max-w-md space-y-4"
            >
                <div>
                    <label className="text-sm text-slate-400 mb-1 block">Your Nickname</label>
                    <input
                        className="input-game"
                        placeholder="Enter nickname..."
                        maxLength={20}
                        value={name}
                        onChange={e => { setName(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && !mode && handleCreate()}
                    />
                </div>

                <AnimatePresence>
                    {mode === 'join' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <label className="text-sm text-slate-400 mb-1 block">Room Code</label>
                            <input
                                className="input-game uppercase tracking-[0.3em] text-center font-bold"
                                placeholder="XXXXXX"
                                maxLength={6}
                                value={joinCode}
                                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-red-400 text-sm text-center">{error}</motion.p>
                )}

                <div className="flex gap-3 pt-2">
                    {mode !== 'join' ? (
                        <>
                            <button
                                disabled={loading}
                                onClick={handleCreate}
                                className="btn-neon flex-1 bg-orange-500 border-orange-400 text-white"
                            >
                                {loading ? '...' : 'CREATE ROOM'}
                            </button>
                            <button
                                onClick={() => { setMode('join'); setError(''); }}
                                className="btn-neon flex-1 bg-transparent border-sky-400 text-sky-400"
                            >
                            JOIN ROOM
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setMode(null)} className="btn-neon px-4 bg-transparent border-slate-600 text-slate-400">
                                ←
                            </button>
                            <button
                                disabled={loading}
                                onClick={handleJoin}
                                className="btn-neon flex-1 bg-sky-500 border-sky-400 text-white"
                            >
                                {loading ? '...' : 'JOIN ROOM'}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>

            <p className="absolute bottom-4 text-slate-600 text-xs">
                2-4 players | WASD / Arrow Keys | SPACE to place bomb
            </p>
        </div>
    );
}
