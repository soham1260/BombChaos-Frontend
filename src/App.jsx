import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { socket } from './socket.js';
import { useGameStore } from './store/gameStore.js';
import LandingScreen from './screens/LandingScreen.jsx';
import LobbyScreen from './screens/LobbyScreen.jsx';

export default function App() {
    const {
        screen,
        setConnected, setMySocketId,
        setRoomState,
    } = useGameStore();

    useEffect(() => {
        if (socket.connected) {
            setConnected(true);
            setMySocketId(socket.id);
        }
        socket.on('connect', () => {
            setConnected(true);
            setMySocketId(socket.id);
        });
        socket.on('disconnect', () => setConnected(false));

        socket.on('room_update', (state) => {
            setRoomState(state);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('room_update');
        };
    }, []);

    const screens = {
        landing: <LandingScreen />,
        lobby: <LobbyScreen />,
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
                {screens[screen] ?? <LandingScreen />}
            </motion.div>
        </AnimatePresence>
    );
}
