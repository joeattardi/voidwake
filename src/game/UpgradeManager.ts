import Phaser from 'phaser';
import { Player } from './Player';
import { ShipStats } from './ShipStats';
import { UpgradeState } from './UpgradeState';
import { Weapons, WeaponData } from './Weapons';
import { GameState } from './GameState';
import shipUpgradeDefs from './shipUpgrades.json';
import weaponUpgradeDefs from './weaponUpgrades.json';

export interface UpgradeDisplayItem {
    id: string;
    name: string;
    description: string;
    currentLevel: number;
    maxLevel: number;
    nextCost: number | null;
    category: 'ship' | 'weapon';
}

interface ShipUpgradeDef {
    id: string;
    name: string;
    description: string;
    stat: string;
    levels: { level: number; value: number; cost: number }[];
}

interface WeaponUpgradeDef {
    id: string;
    name: string;
    description: string;
    type: 'modifier' | 'weapon';
    targetWeapon?: string;
    modifies?: string;
    levels: { level: number; value?: number; cost: number }[];
    weaponData?: WeaponData;
}

export class UpgradeManager {
    readonly stats: ShipStats;
    readonly upgradeState: UpgradeState;
    private weaponInstances: Weapons[] = [];
    private readonly shipUpgrades: ShipUpgradeDef[] = shipUpgradeDefs;
    private readonly weaponUpgrades: WeaponUpgradeDef[] = weaponUpgradeDefs as WeaponUpgradeDef[];

    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        private enemyGroup: Phaser.Physics.Arcade.Group,
        private gameState: GameState,
        stats: ShipStats,
        initialWeapon: WeaponData
    ) {
        this.stats = stats;
        this.upgradeState = new UpgradeState();

        // Create initial forward laser
        const weapon = new Weapons(this.scene, this.player, initialWeapon);
        this.weaponInstances.push(weapon);
    }

    getWeapons(): Weapons[] {
        return this.weaponInstances;
    }

    handlePurchase(upgradeId: string): { success: boolean; upgrades: UpgradeDisplayItem[]; coins: number } {
        // Find the upgrade definition
        const shipUpgrade = this.shipUpgrades.find(u => u.id === upgradeId);
        const weaponUpgrade = this.weaponUpgrades.find(u => u.id === upgradeId);
        const def = shipUpgrade ?? weaponUpgrade;

        if (!def) return { success: false, upgrades: this.buildUpgradeDisplayItems(), coins: this.gameState.coins };

        const currentLevel = this.upgradeState.getLevel(upgradeId);
        const nextLevel = def.levels.find(l => l.level === currentLevel + 1);

        if (!nextLevel) return { success: false, upgrades: this.buildUpgradeDisplayItems(), coins: this.gameState.coins };

        if (!this.gameState.spendCoins(nextLevel.cost)) {
            return { success: false, upgrades: this.buildUpgradeDisplayItems(), coins: this.gameState.coins };
        }

        this.upgradeState.purchase(upgradeId);
        this.applyUpgrade(upgradeId, shipUpgrade, weaponUpgrade, nextLevel);

        return { success: true, upgrades: this.buildUpgradeDisplayItems(), coins: this.gameState.coins };
    }

    private applyUpgrade(
        _upgradeId: string,
        shipUpgrade: ShipUpgradeDef | undefined,
        weaponUpgrade: WeaponUpgradeDef | undefined,
        levelData: { level: number; value?: number; cost: number }
    ): void {
        if (shipUpgrade && levelData.value != null) {
            const oldMaxHealth = this.stats.maxHealth;
            this.stats.applyStat(shipUpgrade.stat, levelData.value);

            // If shield strength upgraded, heal by the increase
            if (shipUpgrade.stat === 'maxHealth') {
                const increase = this.stats.maxHealth - oldMaxHealth;
                this.gameState.health = Math.min(
                    this.gameState.health + increase,
                    this.stats.maxHealth
                );
            }
            return;
        }

        if (weaponUpgrade) {
            if (weaponUpgrade.type === 'modifier') {
                // Modify existing weapon's property
                const target = this.weaponInstances.find(
                    w => w.definition.id === weaponUpgrade.targetWeapon
                );
                if (target && weaponUpgrade.modifies && levelData.value != null) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (target.definition as any)[weaponUpgrade.modifies] = levelData.value;
                }
            } else if (weaponUpgrade.type === 'weapon' && weaponUpgrade.weaponData) {
                // Add a new weapon
                this.addWeapon(weaponUpgrade.weaponData);
            }
        }
    }

    private addWeapon(weaponData: WeaponData): void {
        const weapon = new Weapons(this.scene, this.player, weaponData);
        this.weaponInstances.push(weapon);

        // Register collision with enemy group
        this.scene.physics.add.overlap(
            weapon.bullets,
            this.enemyGroup,
            (this.scene.registry.get('hitEnemyCallback') as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback),
            undefined,
            this.scene
        );
    }

    buildUpgradeDisplayItems(): UpgradeDisplayItem[] {
        const items: UpgradeDisplayItem[] = [];

        for (const def of this.shipUpgrades) {
            const currentLevel = this.upgradeState.getLevel(def.id);
            const nextLevel = def.levels.find(l => l.level === currentLevel + 1);
            items.push({
                id: def.id,
                name: def.name,
                description: def.description,
                currentLevel,
                maxLevel: def.levels.length,
                nextCost: nextLevel?.cost ?? null,
                category: 'ship',
            });
        }

        for (const def of this.weaponUpgrades) {
            const currentLevel = this.upgradeState.getLevel(def.id);
            const nextLevel = def.levels.find(l => l.level === currentLevel + 1);
            items.push({
                id: def.id,
                name: def.name,
                description: def.description,
                currentLevel,
                maxLevel: def.levels.length,
                nextCost: nextLevel?.cost ?? null,
                category: 'weapon',
            });
        }

        return items;
    }
}
