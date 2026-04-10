import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { socket, connectSocket } from './socket.js';
import { useGameStore } from './store/gameStore.js';
import { useAuthStore } from './store/authStore.js';
import { audioManager } from './game/utils/audioManager.js';
import LandingScreen from './screens/LandingScreen.jsx';
import LobbyScreen from './screens/LobbyScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import ResultsScreen from './screens/ResultsScreen.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

export default function App() {
    const {
        screen, setScreen,
        setConnected, setMySocketId,
        setRoomState,
        setMapSeed, setGameStartPlayers, setGameState,
        setGameOverData,
        addEvent, addPowerupNotification,
        mySocketId,
    } = useGameStore();

    const { loadFromStorage, updateRating } = useAuthStore();

    // Keep audioManager in sync with the Zustand mute state
    const isMusicMuted = useGameStore(s => s.isMusicMuted);
    useEffect(() => {
        audioManager.setMuted(isMusicMuted);
        // Also fire the window event so Phaser's MainScene reacts
        window.dispatchEvent(new CustomEvent('music_muted_change', { detail: isMusicMuted }));
    }, [isMusicMuted]);

    useEffect(() => {
        audioManager.startLobbyMusic();

        // Auto login from localStorage 
        const saved = loadFromStorage();
        if (saved?.token) {
            connectSocket(saved.token);
        }

        // Connection 
        if (socket.connected) {
            setConnected(true);
            setMySocketId(socket.id);
        }
        socket.on('connect', () => {
            setConnected(true);
            setMySocketId(socket.id);
            const currentScreen = useGameStore.getState().screen;
            if (currentScreen === 'login' || currentScreen === 'register') {
                setScreen('landing');
            }
        });
        socket.on('disconnect', () => setConnected(false));

        // Room events 
        socket.on('room_update', (state) => {
            setRoomState(state);
            if (state.phase === 'lobby' && useGameStore.getState().screen === 'results') {
                useGameStore.getState().resetGame();
                audioManager.startLobbyMusic();
            }
        });

        // Game start 
        socket.on('game_start', ({ mapSeed, playerIds, players }) => {
            // Guarantee lobby music stops before game music starts
            audioManager.stopLobbyMusic();
            setMapSeed(mapSeed);
            setGameStartPlayers(players);
            setScreen('game');
        });

        // Game state (60 Hz) 
        socket.on('game_state_update', (state) => {
            setGameState(state);
        });

        // Discrete game events 
        socket.on('player_eliminated', ({ playerId, slotIndex }) => {
            const isSelf = playerId === socket.id;
            addEvent(
                isSelf ? '💀 You were eliminated!' : `💥 Player ${slotIndex + 1} eliminated!`,
                isSelf ? '#ef4444' : '#f97316'
            );
        });

        socket.on('power_up_collected', ({ playerId, type }) => {
            if (playerId === socket.id) {
                addPowerupNotification(type);
                addEvent(`⚡ You got ${type.replace('_', ' ')}!`, '#4ade80');
            }
        });

        socket.on('player_taunt', ({ nickname, taunt }) => {
            addEvent(`😂 ${nickname}: "${taunt}"`, '#a78bfa');
        });

        socket.on('chat_message', () => { });

        //Game over 
        socket.on('game_over', (data) => {
            setGameOverData(data);
            setScreen('results');
            audioManager.startLobbyMusic();
        });

        // Rating update  
        socket.on('rating_update', ({ delta, newRating }) => {
            updateRating(newRating);
            addEvent(`${delta > 0 ? '📈' : '📉'} Rating ${delta > 0 ? '+' : ''}${delta} → ${newRating}`, delta > 0 ? '#4ade80' : '#f87171');
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('room_update');
            socket.off('game_start');
            socket.off('game_state_update');
            socket.off('player_eliminated');
            socket.off('power_up_collected');
            socket.off('player_taunt');
            socket.off('chat_message');
            socket.off('game_over');
            socket.off('rating_update');
        };
    }, []);

    const screens = {
        login: <Login />,
        register: <Register />,
        landing: <LandingScreen />,
        lobby: <LobbyScreen />,
        game: <GameScreen />,
        results: <ResultsScreen />,
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={screen}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', height: '100%' }}
            >
                {screens[screen]}
            </motion.div>
        </AnimatePresence>
    );
}
