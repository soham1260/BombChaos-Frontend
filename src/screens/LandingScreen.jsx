import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket.js';


export default function LandingScreen() {
    const [name, setName] = useState('');
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

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden scanlines"
            style={{ background: 'radial-gradient(ellipse at center, #1a0a00 0%, #0a0a0f 70%)' }}>

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

                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-red-400 text-sm text-center">{error}</motion.p>
                )}
            </motion.div>

            <p className="absolute bottom-4 text-slate-600 text-xs">
                2-4 players | WASD / Arrow Keys | SPACE to place bomb
            </p>
        </div>
    );
}
