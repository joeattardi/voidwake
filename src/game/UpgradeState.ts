export class UpgradeState {
    private purchases = new Map<string, number>();

    getLevel(upgradeId: string): number {
        return this.purchases.get(upgradeId) ?? 0;
    }

    purchase(upgradeId: string): void {
        const current = this.getLevel(upgradeId);
        this.purchases.set(upgradeId, current + 1);
    }

    reset(): void {
        this.purchases.clear();
    }
}
