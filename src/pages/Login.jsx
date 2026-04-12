import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { useGameStore } from '../store/gameStore.js';
import { connectSocket } from '../socket.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function Login() {
    const { setAuth } = useAuthStore();
    const { setScreen } = useGameStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        if (!username.trim() || !password) return setError('Please fill in all fields');
        setLoading(true);

        try {
            const res = await fetch(`${SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error || 'Login failed');

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
            <p className="text-slate-400 text-sm mb-8 tracking-widest uppercase">Welcome back, bomber</p>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-8 w-full max-w-md space-y-4"
            >
                <h2 className="text-white text-xl font-bold text-center mb-2">Login</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Username</label>
                        <input
                            id="login-username"
                            className="input-game"
                            placeholder="Enter username..."
                            value={username}
                            onChange={e => { setUsername(e.target.value); setError(''); }}
                            autoComplete="username"
                            maxLength={20}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            className="input-game"
                            placeholder="Enter password..."
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-red-400 text-sm text-center">{error}</motion.p>
                    )}

                    <button
                        id="login-submit"
                        type="submit"
                        disabled={loading}
                        className="btn-neon w-full bg-orange-500 border-orange-400 text-white py-3 text-lg font-bold"
                    >
                        {loading ? '...' : ' LOGIN'}
                    </button>
                </form>

                <p className="text-center text-slate-500 text-sm">
                    No account?{' '}
                    <button
                        id="goto-register"
                        onClick={() => setScreen('register')}
                        className="text-orange-400 hover:text-orange-300 transition font-bold"
                    >
                        Register here
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
