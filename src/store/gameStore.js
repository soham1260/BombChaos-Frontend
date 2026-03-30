import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
    // Connection 
    connected: false,
    setConnected: (v) => set({ connected: v }),

    // Player identity 
    nickname: '',
    mySocketId: null,
    setNickname: (nickname) => set({ nickname }),
    setMySocketId: (id) => set({ mySocketId: id }),

    // Room / Lobby 
    roomCode: null,
    roomState: null,
    setRoomCode: (code) => set({ roomCode: code }),
    setRoomState: (state) => set({ roomState: state }),

    // Game
    mapSeed: null,
    gameStartPlayers: [],
    gameState: null,
    setMapSeed: (seed) => set({ mapSeed: seed }),
    setGameStartPlayers: (players) => set({ gameStartPlayers: players }),
    setGameState: (state) => set({ gameState: state }),

    // Results 
    gameOverData: null,
    setGameOverData: (data) => set({ gameOverData: data }),

    // Event Feed 
    eventFeed: [],
    addEvent: (text, color = '#f97316') => {
        const id = Date.now() + Math.random();
        set(s => ({ eventFeed: [{ id, text, color, ts: Date.now() }, ...s.eventFeed].slice(0, 8) }));
        
        setTimeout(() => {
            set(s => ({ eventFeed: s.eventFeed.filter(e => e.id !== id) }));
        }, 4000);
    },

    // Power-up notifications 
    powerupNotifications: [],
    addPowerupNotification: (type) => {
        const id = Date.now() + Math.random();
        set(s => ({ powerupNotifications: [...s.powerupNotifications, { id, type }] }));
        setTimeout(() => {
            set(s => ({ powerupNotifications: s.powerupNotifications.filter(n => n.id !== id) }));
        }, 3000);
    },

    // Navigation 
    screen: 'landing',   // 'landing' | 'lobby' | 'game' | 'results'
    setScreen: (screen) => set({ screen }),

    // Reset 
    resetGame: () => set({
        mapSeed: null,
        gameStartPlayers: [],
        gameState: null,
        gameOverData: null,
        eventFeed: [],
        powerupNotifications: [],
        screen: 'lobby',
    }),
    resetAll: () => set({
        roomCode: null,
        roomState: null,
        mapSeed: null,
        gameStartPlayers: [],
        gameState: null,
        gameOverData: null,
        eventFeed: [],
        powerupNotifications: [],
        screen: 'landing',
    }),
}));
