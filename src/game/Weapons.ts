import Phaser from 'phaser';
import { Player } from './Player';

export class Weapons {
    readonly bullets: Phaser.Physics.Arcade.Group;
    private lastFired = 0;
    private readonly fireRate: number;
    private readonly maxDistance: number;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        { fireRate = 500, maxDistance = 1600 } = {}
    ) {
        this.fireRate = fireRate;
        this.maxDistance = maxDistance;

        this.bullets = this.scene.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 50
        });
    }

    update(time: number): void {
        if (time > this.lastFired) {
            this.fire();
            this.lastFired = time + this.fireRate;
        }
        this.cullDistant();
    }

    reset(): void {
        this.lastFired = 0;
    }

    private fire(): void {
        const offset = 20;
        const spawnX = this.player.x + Math.cos(this.player.rotation) * offset;
        const spawnY = this.player.y + Math.sin(this.player.rotation) * offset;

        const bullet = this.bullets.get(
            spawnX,
            spawnY
        ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null;

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);

            const bulletSpeed = 500;
            const vx = Math.cos(this.player.rotation) * bulletSpeed;
            const vy = Math.sin(this.player.rotation) * bulletSpeed;

            bullet.body.setVelocity(vx, vy);
        }
    }

    private cullDistant(): void {
        const px = this.player.x;
        const py = this.player.y;
        const bd2 = this.maxDistance * this.maxDistance;
        this.bullets.getChildren().forEach((obj) => {
            const bullet = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
            if (!bullet.active) return;
            const dx = bullet.x - px;
            const dy = bullet.y - py;
            if (dx * dx + dy * dy > bd2) {
                bullet.setActive(false);
                bullet.setVisible(false);
                bullet.body.setVelocity(0, 0);
            }
        });
    }
}
