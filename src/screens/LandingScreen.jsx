import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket.js';
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/authStore.js';
import MusicToggleButton from '../components/MusicToggleButton.jsx';

export default function LandingScreen() {
    const { setRoomCode, setScreen } = useGameStore();
    const { user, logout } = useAuthStore();
    const [joinCode, setJoinCode] = useState('');
    const [mode, setMode] = useState(null); // null | 'join'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleCreate() {
        setLoading(true);
        socket.emit('create_room', {}, (res) => {
            setLoading(false);
            if (res.success) {
                setRoomCode(res.code);
                setScreen('lobby');
            } else {
                setError(res.error || 'Failed to create room');
            }
        });
    }

    function handleJoin() {
        if (joinCode.trim().length !== 6) return setError('Enter a valid 6-letter room code');
        setLoading(true);
        socket.emit('join_room', { code: joinCode.trim().toUpperCase() }, (res) => {
            setLoading(false);
            if (res.success) {
                setRoomCode(res.code);
                setScreen('lobby');
            } else {
                setError(res.error || 'Failed to join room');
            }
        });
    }

    function handleLogout() {
        logout();
        socket.disconnect();
        useGameStore.getState().resetAll();
        setScreen('login');
    }

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at center, #1a0a00 0%, #0a0a0f 70%)' }}>

            {/* Floating ember particles */}
            {/* {[...Array(16)].map((_, i) => (
                <motion.div key={i}
                    className="absolute w-1 h-1 rounded-full bg-orange-400 opacity-70"
                    style={{ left: `${Math.random() * 100}%`, bottom: 0 }}
                    animate={{ y: [0, -(300 + Math.random() * 400)], opacity: [0.7, 0], x: [0, (Math.random() - 0.5) * 80] }}
                    transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }}
                />
            ))} */}

            {/* Music toggle — top left */}
            <div className="absolute top-4 left-4 z-10">
                <MusicToggleButton />
            </div>

            {/* User badge — top right */}
            {user && (
                <div className="absolute top-4 right-4 flex items-center gap-3">
                    <div className="glass rounded-xl px-4 py-2 flex items-center gap-3">
                        <div>
                            <p className="text-white font-bold text-sm">{user.username}</p>
                            <p className="text-orange-400 text-xs font-mono">⭐ {user.rating} Rating</p>
                        </div>
                    </div>
                    <button
                        id="logout-btn"
                        onClick={handleLogout}
                        className="glass rounded-xl px-3 py-2 text-slate-400 hover:text-red-400 transition text-sm"
                    >
                        Logout
                    </button>
                </div>
            )}

            {/* Bomb SVG */}
            <motion.div className="bomb-float mb-4 select-none" style={{ fontSize: 96 }}>
                💣
            </motion.div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-2 text-orange-400"
                style={{ letterSpacing: '-0.02em' }}>
                BOMB CHAOS
            </h1>
            <p className="text-slate-400 text-lg mb-10 tracking-widest uppercase">
                Battle Royale · Drop Bombs · Survive
            </p>

            {/* Action card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-8 w-full max-w-md space-y-4"
            >
                {/* Greeting */}
                {user && (
                    <p className="text-center text-slate-400 text-sm">
                        Welcome back, <span className="text-orange-400 font-bold">{user.username}</span>! Ready to bomb?
                    </p>
                )}

                <AnimatePresence>
                    {mode === 'join' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <label className="text-sm text-slate-400 mb-1 block">Room Code</label>
                            <input
                                id="join-code-input"
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
                                id="create-room-btn"
                                disabled={loading}
                                onClick={handleCreate}
                                className="btn-neon flex-1 bg-orange-500 border-orange-400 text-white"
                            >
                                {loading ? '...' : ' CREATE ROOM'}
                            </button>
                            <button
                                id="join-room-btn"
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
                                id="join-submit-btn"
                                disabled={loading}
                                onClick={handleJoin}
                                className="btn-neon flex-1 bg-sky-500 border-sky-400 text-white"
                            >
                                {loading ? '...' : '🔗 JOIN ROOM'}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Footer */}
            <p className="absolute bottom-4 text-slate-600 text-xs">
                2–4 players · WASD / Arrow Keys · SPACE to place bomb
            </p>
        </div>
    );
}
