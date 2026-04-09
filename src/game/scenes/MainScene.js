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

    // Input
    _setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        // M key — mute / unmute all Phaser sounds
        this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this._lastMoveEmit = 0;
        this._spaceDown = false;
    }

    // Emitters
    _setupEmitters() {
        // Keep emitters stopped (quantity:0) and use .explode(count,x,y) for bursts.
        this.sparkEmitter = this.add.particles(0, 0, 'spark', {
            speed: { min: 20, max: 60 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            emitting: false,
            blendMode: 'ADD',
        }).setDepth(10);

        this.fireEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 60, max: 180 },
            scale: { start: 1, end: 0 },
            lifespan: 700,
            emitting: false,
            tint: [0xff4500, 0xff6500, 0xffaa00],
            blendMode: 'ADD',
        }).setDepth(10);

        this.starEmitter = this.add.particles(0, 0, 'spark', {
            speed: { min: 80, max: 150 },
            scale: { start: 0.8, end: 0 },
            lifespan: 600,
            emitting: false,
            tint: [0xffd700, 0x00ffff, 0xff69b4],
            blendMode: 'ADD',
        }).setDepth(10);

        this.deathEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 100, max: 300 },
            scale: { start: 1.2, end: 0 },
            lifespan: 900,
            emitting: false,
            tint: [0xff3333, 0xff9900, 0xffffff],
            blendMode: 'ADD',
        }).setDepth(10);
    }

    // External event listeners (events from React)
    _setupExternalListeners() {
        this._onGameStateUpdate = (e) => this._applyGameState(e.detail);
        this._onExplosion = (e) => this._handleExplosion(e.detail);
        this._onPlayerEliminated = (e) => this._handlePlayerElimination(e.detail);
        this._onPowerupCollected = (e) => this._handlePowerupCollected(e.detail);
        this._onBombPlaced = (e) => this._handleBombPlaced(e.detail);

        window.addEventListener('phaser_game_state', this._onGameStateUpdate);
        window.addEventListener('phaser_explosion', this._onExplosion);
        window.addEventListener('phaser_player_eliminated', this._onPlayerEliminated);
        window.addEventListener('phaser_power_up_collected', this._onPowerupCollected);
        window.addEventListener('phaser_bomb_placed', this._onBombPlaced);
    }

    // Update loop

    update(time) {
        this._handleInput(time);
    }

    _handleInput(time) {
        const up = this.cursors.up.isDown || this.wasd.W.isDown;
        const down = this.cursors.down.isDown || this.wasd.S.isDown;
        const left = this.cursors.left.isDown || this.wasd.A.isDown;
        const right = this.cursors.right.isDown || this.wasd.D.isDown;

        let dx = 0, dy = 0;
        if (left) dx = -1;
        else if (right) dx = 1;
        if (up) dy = -1;
        else if (down) dy = 1;

        // Throttle move events to 30 Hz
        if ((dx !== 0 || dy !== 0) && time - this._lastMoveEmit > 33) {
            this._lastMoveEmit = time;
            window.dispatchEvent(new CustomEvent('game_player_move', { detail: { dx, dy } }));
        } else if (dx === 0 && dy === 0) {
            // Send stop
            if (time - this._lastMoveEmit > 100) {
                this._lastMoveEmit = time;
                window.dispatchEvent(new CustomEvent('game_player_move', { detail: { dx: 0, dy: 0 } }));
            }
        }

        // Bomb placement
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            window.dispatchEvent(new CustomEvent('game_place_bomb'));
        }

        // Remote detonate
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            window.dispatchEvent(new CustomEvent('game_detonate_bomb'));
        }
    }

    shutdown() {
        window.removeEventListener('phaser_game_state', this._onGameStateUpdate);
        window.removeEventListener('phaser_explosion', this._onExplosion);
        window.removeEventListener('phaser_player_eliminated', this._onPlayerEliminated);
        window.removeEventListener('phaser_power_up_collected', this._onPowerupCollected);
        window.removeEventListener('phaser_bomb_placed', this._onBombPlaced);
    }
}