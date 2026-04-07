import { mulberry32 } from '../utils/seededRng.js';

const TILE_SIZE = 48;
const GRID_W = 15;
const GRID_H = 13;

const TILE = { EMPTY: 0, WALL: 1, SOFT: 2 };

const SPAWN_POSITIONS = [
    { x: 1, y: 1 }, { x: 13, y: 1 },
    { x: 1, y: 11 }, { x: 13, y: 11 },
];

const COLOR_TINTS = [0xff3333, 0x3399ff, 0x33ff66, 0xffcc00];
const PLAYER_KEYS = ['player_red', 'player_blue', 'player_green', 'player_yellow'];

const PU_LABELS = {
    BOMB_UP: '+💣 Bomb Up', FIRE_UP: '+🔥 Range Up',
    SPEED_UP: '+⚡ Speed Up', REMOTE_BOMB: '📡 Remote',
    BOMB_KICK: '🦵 Kick', PIERCING_FLAME: '🔱 Pierce',
};

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.playerSprites = new Map();
        this.bombSprites = new Map();
        this.fireSprites = new Map();
        this.powerupSprites = new Map();
        this.bombTweens = new Map();
        this.softBlockGroup = null;
        this.softBlocks = new Map();
        this.mapSeed = null;
        this.mySocketId = null;
        this.gameStartPlayers = [];
        this.lastGameState = null;
    }

    init(data) {
        const src = (data && data.mapSeed != null) ? data : (window.__bombChaosInit || {});
        this.mapSeed = src.mapSeed ?? 12345;
        this.mySocketId = src.mySocketId ?? null;
        this.gameStartPlayers = src.gameStartPlayers ?? [];
    }

    create() {
        this._generateMap();
        this._setupPlayers();
        this._setupInput();
        this._setupEmitters();
        this._setupExternalListeners();

        this.cameras.main.setBackgroundColor('#0a0a0f');
        this.cameras.main.centerOn(
            (GRID_W * TILE_SIZE) / 2,
            (GRID_H * TILE_SIZE) / 2
        );
    }

    shutdown() {
        window.removeEventListener('phaser_game_state', this._onGameStateUpdate);
        window.removeEventListener('phaser_explosion', this._onExplosion);
        window.removeEventListener('phaser_player_eliminated', this._onPlayerEliminated);
        window.removeEventListener('phaser_power_up_collected', this._onPowerupCollected);
        window.removeEventListener('phaser_bomb_placed', this._onBombPlaced);
    }
}