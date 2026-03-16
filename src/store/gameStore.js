import { create } from 'zustand';

export const useGameStore = create((set) => ({
    // Connection
    connected: false,
    setConnected: (v) => set({ connected: v }),

    // Player identity 
    nickname: '',
    mySocketId: null,
    setNickname: (nickname) => set({ nickname }),
    setMySocketId: (id) => set({ mySocketId: id }),

    //  Room / Lobby 
    roomCode: null,
    roomState: null,     
    setRoomCode: (code) => set({ roomCode: code }),
    setRoomState: (state) => set({ roomState: state }),

    // Navigation
    screen: 'landing',   // 'landing' | 'lobby'
    setScreen: (screen) => set({ screen }),

    // Reset 
    resetAll: () => set({
        roomCode: null,
        roomState: null,
        screen: 'landing',
    }),
}));
