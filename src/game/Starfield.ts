import Phaser from 'phaser';

interface StarEntry {
    img: Phaser.GameObjects.Image;
    baseAlpha: number;
    twinkle: number;
    twinklePhase: number;
}

interface StarfieldLayer {
    stars: StarEntry[];
    scrollFactor: number;
}

export class Starfield {
    private layers: StarfieldLayer[] | null = null;
    private readonly ambientVx = 6;
    private readonly ambientVy = -2.5;

    constructor(private scene: Phaser.Scene) {}

    setup(): void {
        const W = this.scene.scale.width;
        const H = this.scene.scale.height;

        const sky = this.scene.add.graphics();
        sky.fillGradientStyle(0x03050c, 0x050a18, 0x080c28, 0x10082a, 1);
        sky.fillRect(0, 0, W, H);
        sky.setDepth(-400);
        sky.setScrollFactor(0);

        const nebula = this.scene.add.graphics();
        const mist = (cx: number, cy: number, r: number, color: number, a: number): void => {
            nebula.fillStyle(color, a);
            nebula.fillCircle(cx, cy, r);
        };
        mist(W * 0.18, H * 0.72, 220, 0x1a2a6e, 0.08);
        mist(W * 0.82, H * 0.22, 260, 0x3d1a5c, 0.07);
        mist(W * 0.55, H * 0.48, 180, 0x0d3d55, 0.06);
        mist(W * 0.08, H * 0.18, 140, 0x2244aa, 0.05);
        mist(W * 0.35, H * 0.85, 190, 0x2a1b3d, 0.04);
        mist(W * 0.75, H * 0.15, 160, 0x1a4a6e, 0.055);
        mist(W * 0.92, H * 0.78, 120, 0x4a2a5c, 0.045);
        nebula.setDepth(-390);
        nebula.setScrollFactor(0);

        const tints = [0xffffff, 0xdde8ff, 0xffeedd, 0xccd8ff, 0xaaccff, 0xffdddd];
        const layerDefs = [
            {
                key: 'cosmicDust',
                count: 300,
                depth: -385,
                scaleMin: 0.2,
                scaleMax: 0.8,
                alphaMin: 0.05,
                alphaMax: 0.2,
                scrollFactor: 0.08,
                twinkle: 0
            },
            {
                key: 'starPin',
                count: 400,
                depth: -380,
                scaleMin: 0.3,
                scaleMax: 1.2,
                alphaMin: 0.2,
                alphaMax: 0.8,
                scrollFactor: 0.12,
                twinkle: 0
            },
            {
                key: 'starPin',
                count: 250,
                depth: -375,
                scaleMin: 0.4,
                scaleMax: 1.0,
                alphaMin: 0.3,
                alphaMax: 0.9,
                scrollFactor: 0.25,
                twinkle: 0.08
            },
            {
                key: 'starSoft',
                count: 180,
                depth: -370,
                scaleMin: 0.35,
                scaleMax: 1.1,
                alphaMin: 0.35,
                alphaMax: 0.95,
                scrollFactor: 0.4,
                twinkle: 0.15
            },
            {
                key: 'starGlow',
                count: 80,
                depth: -360,
                scaleMin: 0.4,
                scaleMax: 1.3,
                alphaMin: 0.4,
                alphaMax: 1,
                scrollFactor: 0.68,
                twinkle: 0.25
            }
        ];

        const spreadX = W * 6;
        const spreadY = H * 6;

        this.layers = layerDefs.map((def) => {
            const stars: StarEntry[] = [];
            for (let i = 0; i < def.count; i++) {
                const img = this.scene.add.image(
                    Phaser.Math.FloatBetween(-spreadX * 0.5, spreadX * 0.5),
                    Phaser.Math.FloatBetween(-spreadY * 0.5, spreadY * 0.5),
                    def.key
                );
                const s = Phaser.Math.FloatBetween(def.scaleMin, def.scaleMax);
                img.setScale(s);
                const baseA = Phaser.Math.FloatBetween(def.alphaMin, def.alphaMax);
                img.setAlpha(baseA);
                img.setDepth(def.depth);
                img.setTint(Phaser.Utils.Array.GetRandom(tints));
                if (def.key === 'starGlow' || def.key === 'starSoft') {
                    img.setBlendMode(Phaser.BlendModes.ADD);
                } else if (def.key === 'cosmicDust') {
                    img.setBlendMode(Phaser.BlendModes.NORMAL);
                }
                img.setScrollFactor(def.scrollFactor, def.scrollFactor);
                stars.push({
                    img,
                    baseAlpha: baseA,
                    twinkle: def.twinkle,
                    twinklePhase: Phaser.Math.FloatBetween(0, Math.PI * 2)
                });
            }
            return { stars, scrollFactor: def.scrollFactor };
        });
    }

    update(time: number, delta: number): void {
        if (!this.layers) return;

        const dt = delta / 1000;
        const driftX = this.ambientVx * dt * 0.14;
        const driftY = this.ambientVy * dt * 0.14;

        const cam = this.scene.cameras.main;
        const W = this.scene.scale.width;
        const H = this.scene.scale.height;
        const halfDiag = Math.sqrt((W * 0.5) ** 2 + (H * 0.5) ** 2);
        const recycleR = halfDiag + Math.max(W, H) * 0.62;
        const recycleR2 = recycleR * recycleR;
        const minSpawnR = halfDiag + 55;

        this.layers.forEach((layer) => {
            const sf = layer.scrollFactor;
            const centerX = cam.scrollX * sf + W * 0.5;
            const centerY = cam.scrollY * sf + H * 0.5;

            layer.stars.forEach((star) => {
                star.img.x += driftX;
                star.img.y += driftY;

                const dx = star.img.x - centerX;
                const dy = star.img.y - centerY;
                if (dx * dx + dy * dy > recycleR2) {
                    const ang = Phaser.Math.FloatBetween(0, Math.PI * 2);
                    const d = Phaser.Math.FloatBetween(minSpawnR, recycleR * 0.94);
                    star.img.setPosition(centerX + Math.cos(ang) * d, centerY + Math.sin(ang) * d);
                }

                if (star.twinkle > 0) {
                    const pulse = Math.sin(time * 0.0028 + star.twinklePhase) * 0.5 + 0.5;
                    star.img.setAlpha(star.baseAlpha * (1 - star.twinkle + pulse * star.twinkle));
                }
            });
        });
    }

    recenter(ox: number, oy: number): void {
        if (!this.layers) return;
        this.layers.forEach((layer) => {
            const sf = layer.scrollFactor;
            layer.stars.forEach((star) => {
                star.img.x -= ox * sf;
                star.img.y -= oy * sf;
            });
        });
    }
}
