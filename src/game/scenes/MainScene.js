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

    // Apply server game state

    _applyGameState(state) {
        if (!state) return;
        this.lastGameState = state;

        state.players.forEach(p => {
            const sprite = this.playerSprites.get(p.id);
            if (!sprite) return;
            if (!p.alive) {
                sprite.setVisible(false);
                return;
            }
            sprite.setVisible(true);
            this.tweens.add({
                targets: sprite,
                x: p.x,
                y: p.y,
                duration: 50,
                ease: 'Linear',
            });
        });

        this._syncBombs(state.bombs);

        this._syncFires(state.fires);

        this._syncPowerups(state.powerups);

        if (state.grid) this._syncGrid(state.grid);
    }

    // Sync client-side soft block sprites against the authoritative server grid
    _syncGrid(grid) {
        for (const [key, block] of this.softBlocks) {
            if (!block.active) {
                // Already destroyed, clean up the map entry
                this.softBlocks.delete(key);
                continue;
            }
            const [x, y] = key.split(',').map(Number);
            
            if (grid[y]?.[x] !== TILE.SOFT) {
                block.destroy();
                this.softBlocks.delete(key);
            }
        }
    }

    _syncBombs(bombs) {
        const currentIds = new Set();
        bombs.forEach(b => {
            currentIds.add(b.id);
            if (!this.bombSprites.has(b.id)) {
                const sprite = this.add.sprite(
                    b.x * TILE_SIZE + TILE_SIZE / 2,
                    b.y * TILE_SIZE + TILE_SIZE / 2,
                    'bomb'
                ).setDepth(2);

                // Pulsing tween accelerating as timer runs low
                const tween = this.tweens.add({
                    targets: sprite,
                    scaleX: 1.2, scaleY: 1.2,
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });

                // Fuse spark
                this.sparkEmitter.explode(3, b.x * TILE_SIZE + TILE_SIZE / 2, b.y * TILE_SIZE + 8);

                this.bombSprites.set(b.id, sprite);
                this.bombTweens.set(b.id, tween);
            }

            // Accelerate pulse as fuse runs low
            const sprite = this.bombSprites.get(b.id);
            const tween = this.bombTweens.get(b.id);
            if (tween && b.ticksLeft < 60) {
                const speed = Phaser.Math.Linear(80, 400, b.ticksLeft / 60);
                tween.timeScale = 400 / Math.max(speed, 80);
            }
        });

        // Remove detonated bomb sprites
        for (const [id, sprite] of this.bombSprites) {
            if (!currentIds.has(id)) {
                this.bombTweens.get(id)?.stop();
                this.bombTweens.delete(id);
                sprite.destroy();
                this.bombSprites.delete(id);
            }
        }
    }

    _syncFires(fires) {
        const currentKeys = new Set();
        fires.forEach(f => {
            const key = `${f.x},${f.y}`;
            currentKeys.add(key);
            if (!this.fireSprites.has(key)) {
                const sprite = this.add.sprite(
                    f.x * TILE_SIZE + TILE_SIZE / 2,
                    f.y * TILE_SIZE + TILE_SIZE / 2,
                    'fire'
                ).setDepth(2).setAlpha(0.9);
                this.fireSprites.set(key, sprite);
            }
        });
        for (const [key, sprite] of this.fireSprites) {
            if (!currentKeys.has(key)) {
                sprite.destroy();
                this.fireSprites.delete(key);
            }
        }
    }

    _syncPowerups(powerups) {
        const currentKeys = new Set();
        powerups.forEach(pu => {
            const key = `${pu.x},${pu.y}`;
            currentKeys.add(key);
            if (!this.powerupSprites.has(key)) {
                const sprite = this.add.sprite(
                    pu.x * TILE_SIZE + TILE_SIZE / 2,
                    pu.y * TILE_SIZE + TILE_SIZE / 2,
                    `pu_${pu.type}`
                ).setDepth(2).setScale(0.7);
                sprite.setData('type', pu.type);
                // Spinning animation
                this.tweens.add({
                    targets: sprite,
                    angle: 360,
                    duration: 2000,
                    repeat: -1,
                    ease: 'Linear',
                });
                this.powerupSprites.set(key, sprite);
            }
        });
        for (const [key, sprite] of this.powerupSprites) {
            if (!currentKeys.has(key)) {
                sprite.destroy();
                this.powerupSprites.delete(key);
            }
        }
    }

    _handleExplosion({ cells, x, y }) {
        this.cameras.main.shake(200, 0.015);

        this.playSound('bomb_explosion', { volume: 0.7 });

        this.fireEmitter.explode(30, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);

        let hasDestroyedBlock = false;
        cells?.forEach(cell => {
            const key = `${cell.x},${cell.y}`;
            const block = this.softBlocks.get(key);
            
            if (block && block.active) {
                hasDestroyedBlock = true;
                this.softBlocks.delete(key);
                this.tweens.add({
                    targets: block,
                    x: block.x + 4,
                    duration: 40,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        if (block.active) block.destroy();
                    },
                });
            }
        });
        // Play box break sound only when at least one box was destroyed
        if (hasDestroyedBlock) {
            this.playSound('box_explosion', { volume: 0.55 });
        }
    }

    _handlePlayerElimination({ playerId, slotIndex }) {
        const sprite = this.playerSprites.get(playerId);
        if (!sprite) return;
        // Death confetti burst
        this.deathEmitter.explode(40, sprite.x, sprite.y);
        // Shrink and fade
        this.tweens.add({
            targets: sprite,
            scaleX: 0, scaleY: 0,
            alpha: 0,
            duration: 400,
            ease: 'Back.In',
            onComplete: () => sprite.setVisible(false),
        });
    }

    _handlePowerupCollected({ x, y, type }) {
        const key = `${x},${y}`;
        const sprite = this.powerupSprites.get(key);
        if (sprite) {
            this.starEmitter.explode(15, sprite.x, sprite.y);
            sprite.destroy();
            this.powerupSprites.delete(key);
        }

        this.playSound('powerup', { volume: 0.7 });

        const label = PU_LABELS[type] || type;
        const tx = x * TILE_SIZE + TILE_SIZE / 2;
        const ty = y * TILE_SIZE;
        const text = this.add.text(tx, ty, label, {
            fontSize: '14px', fontFamily: 'Outfit', color: '#ffd700',
            stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5, 1).setDepth(20);
        this.tweens.add({
            targets: text,
            y: ty - 40,
            alpha: 0,
            duration: 1500,
            ease: 'Quad.Out',
            onComplete: () => text.destroy(),
        });
    }

    _handleBombPlaced(bomb) {
        this.sparkEmitter.explode(5,
            bomb.x * TILE_SIZE + TILE_SIZE / 2,
            bomb.y * TILE_SIZE + TILE_SIZE / 2
        );
        this.playSound('bomb_placement', { volume: 0.65 });
    }

    shutdown() {
        window.removeEventListener('phaser_game_state', this._onGameStateUpdate);
        window.removeEventListener('phaser_explosion', this._onExplosion);
        window.removeEventListener('phaser_player_eliminated', this._onPlayerEliminated);
        window.removeEventListener('phaser_power_up_collected', this._onPowerupCollected);
        window.removeEventListener('phaser_bomb_placed', this._onBombPlaced);
    }
}