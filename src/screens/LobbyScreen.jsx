import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket.js';
import { useGameStore } from '../store/gameStore.js';

const SLOT_COLORS = {
    red: 'border-red-500 bg-red-500/10',
    blue: 'border-blue-500 bg-blue-500/10',
    green: 'border-green-500 bg-green-500/10',
    yellow: 'border-yellow-500 bg-yellow-500/10',
};

const SLOT_TEXT = {
    red: 'text-red-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
};

const CHAR_EMOJIS = ['🤖', '🧨', '👾', '🦊'];
const CHAR_NAMES = ['Robo', 'Kaboom', 'Alien', 'Fox'];
const CHARACTERS = ['bomber1', 'bomber2', 'bomber3', 'bomber4'];

const TAUNT_LIST = ["You'll never catch me!", "Ready to explode?", "Bomb squad activate!", "Say your prayers!"];

export default function LobbyScreen() {
    const { roomCode, roomState, mySocketId, setScreen, addEvent, resetAll } = useGameStore();
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [startError, setStartError] = useState('');
    const chatRef = useRef(null);

    const isHost = roomState?.players?.find(p => p.id === mySocketId)?.isHost;
    const me = roomState?.players?.find(p => p.id === mySocketId);

    useEffect(() => {
        socket.on('chat_message', (msg) => {
            setChatMessages(prev => [...prev, msg].slice(-50));
            setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 50);
        });
        return () => socket.off('chat_message');
    }, []);

    function handleReady() { socket.emit('player_ready'); }

    function handleStart() {
        setStartError('');
        socket.emit('start_game', null, (res) => {
            if (!res.success) setStartError(res.error);
        });
    }

    function handleChat(e) {
        e.preventDefault();
        if (!chatInput.trim()) return;
        socket.emit('chat_message', { text: chatInput.trim() });
        setChatInput('');
    }

    function handleTaunt() {
        const t = TAUNT_LIST[Math.floor(Math.random() * TAUNT_LIST.length)];
        socket.emit('player_taunt', { taunt: t });
    }

    function handleLeave() {
        resetAll();
        socket.disconnect();
        setTimeout(() => socket.connect(), 100);
    }

    function handleCharSelect(char) {
        socket.emit('select_character', { character: char });
    }

    const allSlots = Array.from({ length: 4 }, (_, i) => {
        const player = roomState?.players?.find(p => p.slotIndex === i);
        return { index: i, player };
    });

    return (
        <div className="w-full h-full flex flex-col"
            style={{ background: 'radial-gradient(ellipse at top, #1a0500 0%, #0a0a0f 60%)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">💣</span>
                    <span className="font-black text-2xl text-orange-400">BOMB CHAOS</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">Room Code</span>
                    <span className="glass px-4 py-2 rounded-lg font-mono font-bold text-xl text-orange-400 tracking-widest">
                        {roomCode}
                    </span>
                    <button onClick={() => navigator.clipboard?.writeText(roomCode)}
                        className="text-xs text-slate-500 hover:text-slate-300 transition">📋 Copy</button>
                </div>
                <button onClick={handleLeave}
                    className="text-slate-500 hover:text-red-400 transition text-sm">✕ Leave</button>
            </div>

            <div className="flex flex-1 gap-4 p-4 overflow-hidden">
                {/* Player slots */}
                <div className="flex-1 space-y-3">
                    <h2 className="text-slate-400 text-sm uppercase tracking-widest mb-3">Players</h2>
                    {allSlots.map(({ index, player }) => {
                        const colors = ['red', 'blue', 'green', 'yellow'];
                        const color = colors[index];
                        const isMe = player?.id === mySocketId;

                        return (
                            <motion.div
                                key={index}
                                layout
                                className={`glass rounded-xl p-4 border-2 transition-all ${player ? SLOT_COLORS[color] : 'border-white/10'}`}
                            >
                                {player ? (
                                    <div className="flex items-center gap-4">
                                        {/* Character avatar */}
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl glass border border-white/20">
                                            {CHAR_EMOJIS[CHARACTERS.indexOf(player.character) ?? 0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${SLOT_TEXT[color]}`}>{player.nickname}</span>
                                                {player.isHost && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">HOST</span>}
                                                {isMe && <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded">YOU</span>}
                                            </div>
                                            {/* Character picker for self */}
                                            {isMe && (
                                                <div className="flex gap-2 mt-2">
                                                    {CHARACTERS.map((c, ci) => (
                                                        <button key={c}
                                                            onClick={() => handleCharSelect(c)}
                                                            className={`w-8 h-8 rounded-lg text-lg transition-all ${player.character === c ? 'ring-2 ring-orange-400 bg-orange-500/20' : 'bg-white/5 hover:bg-white/10'}`}
                                                        >
                                                            {CHAR_EMOJIS[ci]}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {(player.ready || player.isHost)
                                                ? <span className="text-green-400 text-sm font-bold">✓ READY</span>
                                                : <span className="text-slate-500 text-sm">Not Ready</span>
                                            }
                                            {isMe && !player.isHost && (
                                                <button
                                                    onClick={handleReady}
                                                    className={`btn-neon text-sm px-3 py-1 ${player.ready ? 'border-red-400 text-red-400' : 'border-green-400 text-green-400'}`}
                                                >
                                                    {player.ready ? 'UNREADY' : 'READY'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 opacity-30">
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center text-xl">
                                            +
                                        </div>
                                        <span className="text-slate-500">Waiting for player...</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {/* Host start button */}
                    {isHost && (
                        <div className="pt-2">
                            {startError && <p className="text-red-400 text-sm mb-2 text-center">{startError}</p>}
                            <button
                                onClick={handleStart}
                                className="btn-neon w-full bg-orange-500 border-orange-400 text-white text-xl py-4"
                            >
                                🚀 START GAME
                            </button>
                            <p className="text-slate-600 text-xs text-center mt-2">All non-host players must be ready</p>
                        </div>
                    )}

                    {!isHost && (
                        <p className="text-center text-slate-600 text-sm pt-4">Waiting for host to start the game...</p>
                    )}
                </div>

                {/* Chat panel */}
                <div className="w-72 flex flex-col glass rounded-xl overflow-hidden border border-white/10">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-300">💬 Chat</span>
                        <button onClick={handleTaunt}
                            className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-500/30 transition">
                            😂 Taunt
                        </button>
                    </div>
                    <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                        {chatMessages.length === 0 && (
                            <p className="text-slate-600 text-xs text-center mt-4">No messages yet…</p>
                        )}
                        {chatMessages.map((msg, i) => (
                            <div key={i} className="text-sm">
                                <span className="font-bold" style={{ color: msg.color === 'red' ? '#f87171' : msg.color === 'blue' ? '#60a5fa' : msg.color === 'green' ? '#4ade80' : '#fbbf24' }}>
                                    {msg.nickname}:
                                </span>
                                <span className="text-slate-300 ml-1">{msg.text}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleChat} className="flex border-t border-white/10">
                        <input
                            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-white placeholder-slate-600"
                            placeholder="Type a message..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            maxLength={200}
                        />
                        <button type="submit"
                            className="px-3 py-2 text-orange-400 hover:text-orange-300 transition text-sm font-bold">
                            →
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
