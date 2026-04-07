export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    // Game UI elements
    create() {
        const g = this.add.graphics();

        // Floor tile
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, 48, 48);
        g.lineStyle(1, 0x16213e, 1);
        g.strokeRect(0, 0, 48, 48);
        g.generateTexture('floor', 48, 48);
        g.clear();

        // Wall tile
        g.fillStyle(0x0f3460);
        g.fillRect(0, 0, 48, 48);
        g.fillStyle(0x16213e);
        g.fillRect(2, 2, 44, 44);
        g.fillStyle(0x0f3460);
        g.fillRect(6, 6, 36, 36);
        g.generateTexture('wall', 48, 48);
        g.clear();

        // Soft block
        g.fillStyle(0x8B4513);
        g.fillRect(0, 0, 48, 48);
        g.fillStyle(0xA0522D);
        g.fillRect(2, 2, 44, 44);
        g.fillStyle(0x6B3410);
        // Wood grain lines
        for (let i = 0; i < 4; i++) {
            g.fillRect(4 + i * 11, 4, 2, 40);
        }
        g.generateTexture('soft', 48, 48);
        g.clear();

        // Bomb
        g.fillStyle(0x1a1a1a);
        g.fillCircle(24, 26, 18);
        g.fillStyle(0x333333);
        g.fillCircle(18, 20, 6);
        g.fillStyle(0x8B4513);
        g.fillRect(22, 4, 4, 12);
        g.fillStyle(0xFFAA00);
        g.fillCircle(24, 4, 5);
        g.generateTexture('bomb', 48, 48);
        g.clear();

        // Fire
        g.fillStyle(0xFF4500);
        g.fillRect(16, 0, 16, 48);
        g.fillRect(0, 16, 48, 16);
        g.fillStyle(0xFF6500, 0.7);
        g.fillRect(20, 4, 8, 40);
        g.fillRect(4, 20, 40, 8);
        g.fillStyle(0xFFFF00, 0.5);
        g.fillRect(22, 8, 4, 32);
        g.fillRect(8, 22, 32, 4);
        g.generateTexture('fire', 48, 48);
        g.clear();

        // 4 Player
        const playerColors = [0xff3333, 0x3399ff, 0x33ff66, 0xffcc00];
        const playerKeys = ['player_red', 'player_blue', 'player_green', 'player_yellow'];
        playerColors.forEach((c, i) => {
            g.fillStyle(c);
            g.fillCircle(24, 30, 16);
            g.fillStyle(0xffddb0);
            g.fillCircle(24, 18, 12);
            g.fillStyle(0x222222);
            g.fillCircle(20, 16, 3);
            g.fillCircle(28, 16, 3);
            g.fillStyle(c);
            g.fillRect(16, 38, 12, 8);
            g.fillRect(20, 38, 8, 6);
            g.generateTexture(playerKeys[i], 48, 48);
            g.clear();
        });

        // Power ups
        const puColors = {
            BOMB_UP: 0xff6b35,
            FIRE_UP: 0xff2d55,
            SPEED_UP: 0x00d4ff,
            REMOTE_BOMB: 0xaa00ff,
            BOMB_KICK: 0xffcc00,
            PIERCING_FLAME: 0xff5500,
        };
        Object.entries(puColors).forEach(([key, color]) => {
            g.fillStyle(color, 0.3);
            g.fillCircle(24, 24, 22);
            g.fillStyle(color);
            g.fillCircle(24, 24, 14);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(24, 24, 8);
            g.generateTexture(`pu_${key}`, 48, 48);
            g.clear();
        });

        // Particle dot
        g.fillStyle(0xffffff);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle', 8, 8);
        g.clear();

        // Spark
        g.fillStyle(0xFFAA00);
        g.fillCircle(3, 3, 3);
        g.generateTexture('spark', 6, 6);
        g.clear();

        g.destroy();

        this.scene.start('MainScene');
    }
}
