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
        // Always fetch the current room state when entering the lobby so
        // we reflect the real server phase (important after "Go to Lobby" from results).
        socket.emit('request_room_state');

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
