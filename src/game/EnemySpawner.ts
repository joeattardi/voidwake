import Phaser from 'phaser';
import { Player } from './Player';

export class EnemySpawner {
    readonly group: Phaser.Physics.Arcade.Group;
    private readonly maxEnemies: number;
    private readonly cullDistance: number;
    private readonly maxSpeed: number;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        { maxEnemies = 220, cullDistance = 3400, maxSpeed = 200, spawnRate = 1000 } = {}
    ) {
        this.maxEnemies = maxEnemies;
        this.cullDistance = cullDistance;
        this.maxSpeed = maxSpeed;

        this.group = this.scene.physics.add.group();

        this.scene.time.addEvent({
            delay: spawnRate,
            callback: this.spawn,
            callbackScope: this,
            loop: true
        });
    }

    update(): void {
        this.group.getChildren().forEach((enemy) => {
            this.scene.physics.moveToObject(enemy, this.player, this.maxSpeed);
        });
        this.cullDistant();
    }

    private spawn(): void {
        if (this.player?.health <= 0) {
            return;
        }
        if (this.group.countActive(true) >= this.maxEnemies) {
            return;
        }

        const cam = this.scene.cameras.main;
        const halfW = cam.width * 0.5;
        const halfH = cam.height * 0.5;
        const margin = 90;
        const minR = Math.sqrt(halfW * halfW + halfH * halfH) + margin;
        const maxR = minR + 520;

        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const dist = Phaser.Math.FloatBetween(minR, maxR);
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        const enemy = this.group.create(
            x,
            y,
            'enemy'
        ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        enemy.setCollideWorldBounds(false);
    }

    private cullDistant(): void {
        const px = this.player.x;
        const py = this.player.y;
        const d2 = this.cullDistance * this.cullDistance;
        (this.group.getChildren() as Phaser.GameObjects.Sprite[]).forEach((enemy) => {
            const dx = enemy.x - px;
            const dy = enemy.y - py;
            if (dx * dx + dy * dy > d2) {
                enemy.destroy();
            }
        });
    }
}
