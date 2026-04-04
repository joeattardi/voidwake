import { useEffect, useRef } from 'react';
import classes from './StoreView.module.css';
import type { UpgradeDisplayItem } from '../game/UpgradeManager';

interface Props {
    wave: number;
    coins: number;
    upgrades: UpgradeDisplayItem[];
    onPurchase: (upgradeId: string) => void;
    onContinue: () => void;
}

export default function StoreView({ wave, coins, upgrades, onPurchase, onContinue }: Props) {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    const shipUpgrades = upgrades.filter(u => u.category === 'ship');
    const weaponUpgrades = upgrades.filter(u => u.category === 'weapon');

    return (
        <div className={classes.overlay}>
            <div className={classes.panel}>
                <div className={classes.header}>
                    <span className={classes.title}>Wave {wave} cleared!</span>
                    <span className={classes.coins}>{coins} coins</span>
                </div>

                <div className={classes.upgradeGrid}>
                    <div className={classes.sectionLabel}>Ship Systems</div>
                    {shipUpgrades.map(u => (
                        <UpgradeCard key={u.id} upgrade={u} coins={coins} onPurchase={onPurchase} />
                    ))}

                    <div className={classes.sectionLabel}>Weapons</div>
                    {weaponUpgrades.map(u => (
                        <UpgradeCard key={u.id} upgrade={u} coins={coins} onPurchase={onPurchase} />
                    ))}
                </div>

                <button ref={ref} className={classes.continueButton} onClick={onContinue}>
                    Continue
                </button>
            </div>
        </div>
    );
}

function UpgradeCard({ upgrade, coins, onPurchase }: {
    upgrade: UpgradeDisplayItem;
    coins: number;
    onPurchase: (id: string) => void;
}) {
    const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
    const canAfford = upgrade.nextCost != null && coins >= upgrade.nextCost;

    return (
        <div className={classes.upgradeCard}>
            <div className={classes.upgradeInfo}>
                <div className={classes.upgradeName}>{upgrade.name}</div>
                <div className={classes.upgradeDesc}>{upgrade.description}</div>
                <div className={classes.levelDots}>
                    {Array.from({ length: upgrade.maxLevel }, (_, i) => (
                        <div
                            key={i}
                            className={`${classes.levelDot} ${i < upgrade.currentLevel ? classes.levelDotFilled : ''}`}
                        />
                    ))}
                </div>
            </div>
            {isMaxed ? (
                <span className={classes.maxedLabel}>Max</span>
            ) : (
                <button
                    className={classes.buyButton}
                    disabled={!canAfford}
                    onClick={() => onPurchase(upgrade.id)}
                >
                    {upgrade.nextCost} coins
                </button>
            )}
        </div>
    );
}
