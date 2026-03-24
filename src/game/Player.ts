import Phaser from 'phaser';
import { ThrusterEffect } from './ThrusterEffect';
import { RcsEffect } from './RcsEffect';

const DEFAULT_MAX_SPEED = 220;

export class Player extends Phaser.Physics.Arcade.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    health: number;

    private thruster: ThrusterEffect;
    private rcs: RcsEffect;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setRotation(-Math.PI / 2);
        this.setDamping(true);
        this.setDrag(0.99);
        this.setMaxVelocity(DEFAULT_MAX_SPEED, DEFAULT_MAX_SPEED);

        this.thruster = new ThrusterEffect(scene);
        this.rcs = new RcsEffect(scene);

        this.health = 100;
    }

    update(
        cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        keys: Record<string, Phaser.Input.Keyboard.Key>
    ) {
        this.updateMovement(cursors, keys);

        const velocityX = this.body.velocity.x;
        const velocityY = this.body.velocity.y;

        const m2 = velocityX * velocityX + velocityY * velocityY;
        const max = DEFAULT_MAX_SPEED;
        const max2 = max * max;

        if (m2 <= max2 || m2 < 1e-6) {
            return;
        }

        const inv = max / Math.sqrt(m2);
        this.body.setVelocity(velocityX * inv, velocityY * inv);
    }

    stopEffects(): void {
        this.thruster.stop();
        this.rcs.stop();
    }

    private updateMovement(
        cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        keys: Record<string, Phaser.Input.Keyboard.Key>
    ): void {
        const thrust = 300;

        const isRotatingLeft = cursors.left.isDown || keys.A.isDown;
        const isRotatingRight = cursors.right.isDown || keys.D.isDown;

        if (isRotatingLeft && isRotatingRight) {
            this.setAngularVelocity(0);
        } else if (isRotatingLeft) {
            this.setAngularVelocity(-220);
        } else if (isRotatingRight) {
            this.setAngularVelocity(220);
        } else {
            this.setAngularVelocity(0);
        }

        let acceleration = { x: 0, y: 0 };

        if (cursors.up.isDown || keys.W.isDown) {
            acceleration.x += Math.cos(this.rotation) * thrust;
            acceleration.y += Math.sin(this.rotation) * thrust;
        } else if (cursors.down.isDown || keys.S.isDown) {
            acceleration.x -= Math.cos(this.rotation) * thrust;
            acceleration.y -= Math.sin(this.rotation) * thrust;
        }

        if (keys.Q.isDown) {
            acceleration.x += Math.cos(this.rotation - Math.PI / 2) * thrust;
            acceleration.y += Math.sin(this.rotation - Math.PI / 2) * thrust;
        }

        if (keys.E.isDown) {
            acceleration.x += Math.cos(this.rotation + Math.PI / 2) * thrust;
            acceleration.y += Math.sin(this.rotation + Math.PI / 2) * thrust;
        }

        this.setAcceleration(acceleration.x, acceleration.y);
        this.thruster.update(this.x, this.y, acceleration);
        this.rcs.update(this.x, this.y, this.rotation, isRotatingLeft, isRotatingRight);
    }
}
