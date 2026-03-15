import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(SERVER_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
});

socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
socket.on('disconnect', (reason) => console.warn('[Socket] Disconnected:', reason));
socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));
