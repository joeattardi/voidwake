export class ShipStats {
    maxSpeed = 220;
    maxHealth = 100;
    angularSpeed = 220;
    thrust = 300;

    applyStat(stat: string, value: number): void {
        if (stat === 'maxSpeed') this.maxSpeed = value;
        else if (stat === 'maxHealth') this.maxHealth = value;
        else if (stat === 'angularSpeed') this.angularSpeed = value;
        else if (stat === 'thrust') this.thrust = value;
    }

    reset(): void {
        this.maxSpeed = 220;
        this.maxHealth = 100;
        this.angularSpeed = 220;
        this.thrust = 300;
    }
}
