import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { useGameStore } from '../store/gameStore.js';
import { connectSocket } from '../socket.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function Register() {
    const { setAuth } = useAuthStore();
    const { setScreen } = useGameStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();
        setError('');
        if (!username.trim() || !password) return setError('Please fill in all fields');
        if (username.trim().length < 2) return setError('Username must be at least 2 characters');
        if (password.length < 6) return setError('Password must be at least 6 characters');
        if (password !== confirm) return setError('Passwords do not match');
        setLoading(true);

        try {
            const res = await fetch(`${SERVER_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error || 'Registration failed');

            setAuth(data.user, data.token);
            connectSocket(data.token);
            setScreen('landing');
        } catch {
            setError('Could not connect to server');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden scanlines"
            style={{ background: 'radial-gradient(ellipse at center, #1a0a00 0%, #0a0a0f 70%)' }}>


            <motion.div className="bomb-float mb-4 select-none" style={{ fontSize: 80 }}>💣</motion.div>

            <h1 className="glow-title text-5xl md:text-7xl font-black tracking-tight mb-1 text-orange-400">BOMB CHAOS</h1>
            <p className="text-slate-400 text-sm mb-8 tracking-widest uppercase">Create your account</p>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-8 w-full max-w-md space-y-4"
            >
                <h2 className="text-white text-xl font-bold text-center mb-2">Register</h2>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Username</label>
                        <input
                            id="reg-username"
                            className="input-game"
                            placeholder="Choose a username..."
                            value={username}
                            onChange={e => { setUsername(e.target.value); setError(''); }}
                            autoComplete="username"
                            maxLength={20}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Password</label>
                        <input
                            id="reg-password"
                            type="password"
                            className="input-game"
                            placeholder="Choose a password (min 6)..."
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            autoComplete="new-password"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Confirm Password</label>
                        <input
                            id="reg-confirm"
                            type="password"
                            className="input-game"
                            placeholder="Confirm your password..."
                            value={confirm}
                            onChange={e => { setConfirm(e.target.value); setError(''); }}
                            autoComplete="new-password"
                        />
                    </div>

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-red-400 text-sm text-center">{error}</motion.p>
                    )}

                    <button
                        id="reg-submit"
                        type="submit"
                        disabled={loading}
                        className="btn-neon w-full bg-orange-500 border-orange-400 text-white py-3 text-lg font-bold"
                    >
                        {loading ? '...' : ' CREATE ACCOUNT'}
                    </button>
                </form>

                <p className="text-center text-slate-500 text-sm">
                    Already have an account?{' '}
                    <button
                        id="goto-login"
                        onClick={() => setScreen('login')}
                        className="text-orange-400 hover:text-orange-300 transition font-bold"
                    >
                        Login here
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
