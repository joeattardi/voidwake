import Phaser from 'phaser';
import { Player } from './Player';

export interface WeaponData {
    id: string;
    name: string;
    fireRate: number;
    fireDelay: number;
    bulletSpeed: number;
    damage: number;
    maxDistance: number;
    texture: string;
    trailTexture: string;
    tint: string;
    sound: string;
    firingAngleOffset?: number;
    homing?: boolean;
    turnRate?: number;
}

export class Weapons {
    readonly bullets: Phaser.Physics.Arcade.Group;
    private lastFired = Infinity;
    private readonly trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private readonly muzzleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    readonly definition: WeaponData;

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        definition: WeaponData
    ) {
        this.definition = { ...definition };

        this.bullets = this.scene.physics.add.group({
            defaultKey: this.definition.texture,
            maxSize: 50
        });

        this.trailEmitter = this.scene.add.particles(0, 0, this.definition.trailTexture, {
            speed: { min: 5, max: 20 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: [0x66bbff, 0x88ddff],
            lifespan: 200,
            blendMode: Phaser.BlendModes.ADD,
            emitting: false
        });

        this.muzzleEmitter = this.scene.add.particles(0, 0, 'muzzleFlash', {
            speed: { min: 30, max: 80 },
            scale: { start: 1.2, end: 0 },
            alpha: { start: 0.9, end: 0 },
            tint: [0x66bbff, 0xaaddff, 0xffffff],
            lifespan: 120,
            blendMode: Phaser.BlendModes.ADD,
            emitting: false
        });
    }

    update(time: number, delta: number): void {
        if (this.lastFired === Infinity) {
            this.lastFired = time + this.definition.fireDelay;
        }
        if (time > this.lastFired) {
            this.fire();
            this.lastFired = time + this.definition.fireRate;
        }
        if (this.definition.homing) {
            this.updateHoming(delta);
        }
        this.cullDistant();
        this.emitTrails();
    }

    reset(): void {
        this.lastFired = Infinity;
    }

    private fire(): void {
        const angle = this.player.rotation + (this.definition.firingAngleOffset ?? 0);
        const offset = 20;
        const spawnX = this.player.x + Math.cos(angle) * offset;
        const spawnY = this.player.y + Math.sin(angle) * offset;

        const bullet = this.bullets.get(
            spawnX,
            spawnY
        ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null;

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.enable = true;
            bullet.setTint(parseInt(this.definition.tint, 16));
            bullet.setBlendMode(Phaser.BlendModes.ADD);
            bullet.setData('damage', this.definition.damage);

            const vx = Math.cos(angle) * this.definition.bulletSpeed;
            const vy = Math.sin(angle) * this.definition.bulletSpeed;

            bullet.body.setVelocity(vx, vy);
            if (this.definition.homing) {
                bullet.setRotation(angle);
            }
            this.scene.sound.play(this.definition.sound, { volume: 0.25 });

            // Muzzle flash burst
            this.muzzleEmitter.explode(5, spawnX, spawnY);

            // Attach a glow sprite behind the bullet
            const glow = this.scene.add.image(spawnX, spawnY, 'bulletGlow')
                .setBlendMode(Phaser.BlendModes.ADD)
                .setAlpha(0.5)
                .setScale(1.5);
            bullet.setData('glow', glow);
        }
    }

    private updateHoming(delta: number): void {
        const enemyGroup = this.scene.registry.get('enemyGroup') as Phaser.Physics.Arcade.Group | undefined;
        if (!enemyGroup) return;

        const turnRate = this.definition.turnRate ?? 3.0;
        const dt = delta / 1000;

        this.bullets.getChildren().forEach((obj) => {
            const bullet = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
            if (!bullet.active) return;

            let nearest: Phaser.Physics.Arcade.Sprite | null = null;
            let nearestDist = Infinity;
            enemyGroup.getChildren().forEach((e) => {
                const enemy = e as Phaser.Physics.Arcade.Sprite;
                if (!enemy.active) return;
                const dx = enemy.x - bullet.x;
                const dy = enemy.y - bullet.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < nearestDist) {
                    nearestDist = d2;
                    nearest = enemy;
                }
            });

            if (!nearest) return;
            const target = nearest as Phaser.Physics.Arcade.Sprite;
            const desired = Math.atan2(target.y - bullet.y, target.x - bullet.x);
            const current = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);

            let diff = desired - current;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;

            const maxTurn = turnRate * dt;
            const steer = Math.max(-maxTurn, Math.min(maxTurn, diff));
            const newAngle = current + steer;

            const speed = this.definition.bulletSpeed;
            bullet.body.setVelocity(
                Math.cos(newAngle) * speed,
                Math.sin(newAngle) * speed
            );
            bullet.setRotation(newAngle);
        });
    }

    private emitTrails(): void {
        this.bullets.getChildren().forEach((obj) => {
            const bullet = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
            if (!bullet.active) {
                this.destroyGlow(bullet);
                return;
            }
            this.trailEmitter.emitParticleAt(bullet.x, bullet.y, 1);
            // Update glow position to follow bullet
            const glow = bullet.getData('glow') as Phaser.GameObjects.Image | null;
            if (glow) {
                glow.setPosition(bullet.x, bullet.y);
            }
        });
    }

    private destroyGlow(bullet: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): void {
        const glow = bullet.getData('glow') as Phaser.GameObjects.Image | null;
        if (glow) {
            glow.destroy();
            bullet.setData('glow', null);
        }
    }

    private cullDistant(): void {
        const px = this.player.x;
        const py = this.player.y;
        const bd2 = this.definition.maxDistance * this.definition.maxDistance;
        this.bullets.getChildren().forEach((obj) => {
            const bullet = obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
            if (!bullet.active) return;
            const dx = bullet.x - px;
            const dy = bullet.y - py;
            if (dx * dx + dy * dy > bd2) {
                bullet.setActive(false);
                bullet.setVisible(false);
                bullet.body.setVelocity(0, 0);
                this.destroyGlow(bullet);
            }
        });
    }
}
