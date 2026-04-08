import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MainScene } from './scenes/MainScene.js';
import { socket } from '../socket.js';
import { useGameStore } from '../store/gameStore.js';

const TILE_SIZE = 48;
const GRID_W = 15;
const GRID_H = 13;

function relay(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
}

export default function PhaserGame({ onLoaded }) {
    const containerRef = useRef(null);
    const gameRef = useRef(null);
    const { mapSeed, mySocketId, gameStartPlayers } = useGameStore();

    useEffect(() => {
        if (!containerRef.current || gameRef.current) return;

        // Store init data where MainScene can read it synchronously
        window.__bombChaosInit = { mapSeed, mySocketId, gameStartPlayers };

        const config = {
            type: Phaser.AUTO,
            width: GRID_W * TILE_SIZE,
            height: GRID_H * TILE_SIZE,
            parent: containerRef.current,
            backgroundColor: '#0a0a0f',
            scene: [PreloadScene, MainScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        };

        gameRef.current = new Phaser.Game(config);

        // Signal React that Phaser has started
        // Use a short delay so the canvas actually appears first
        const loadedTimer = setTimeout(() => onLoaded?.(), 500);

        // Forward socket events to Phaser custom events
        const onGameState = (state) => relay('phaser_game_state', state);
        const onExplosion = (data) => relay('phaser_explosion', data);
        const onPlayerEliminated = (data) => relay('phaser_player_eliminated', data);
        const onPowerupCollected = (data) => relay('phaser_power_up_collected', data);
        const onBombPlaced = (data) => relay('phaser_bomb_placed', data);

        socket.on('game_state_update', onGameState);
        socket.on('explosion', onExplosion);
        socket.on('player_eliminated', onPlayerEliminated);
        socket.on('power_up_collected', onPowerupCollected);
        socket.on('bomb_placed', onBombPlaced);

        // Forward Phaser input events to socket
        const onMove = (e) => socket.emit('player_move', e.detail);
        const onPlaceBomb = () => socket.emit('place_bomb');
        const onDetonateBomb = () => socket.emit('detonate_bomb');

        window.addEventListener('game_player_move', onMove);
        window.addEventListener('game_place_bomb', onPlaceBomb);
        window.addEventListener('game_detonate_bomb', onDetonateBomb);

        return () => {
            clearTimeout(loadedTimer);
            socket.off('game_state_update', onGameState);
            socket.off('explosion', onExplosion);
            socket.off('player_eliminated', onPlayerEliminated);
            socket.off('power_up_collected', onPowerupCollected);
            socket.off('bomb_placed', onBombPlaced);
            window.removeEventListener('game_player_move', onMove);
            window.removeEventListener('game_place_bomb', onPlaceBomb);
            window.removeEventListener('game_detonate_bomb', onDetonateBomb);
            gameRef.current?.destroy(true);
            gameRef.current = null;
            delete window.__bombChaosInit;
        };
    }, []);

    return (
        <div
            ref={containerRef}
            id="phaser-container"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        />
    );
}
