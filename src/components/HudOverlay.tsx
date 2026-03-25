import './HudOverlay.css';

interface HudOverlayProps {
    score: number;
    health: number;
    coins: number;
}

export default function HudOverlay({ score, health, coins }: HudOverlayProps) {
    const healthPercent = Math.max(0, Math.min(100, health));

    return (
        <div className="hud-overlay">
            <span className="hud-item">SCORE {score}</span>
            <div className="hud-item health-bar-container">
                <span className="health-label">SHIELDS</span>
                <div className="health-bar-track">
                    <div
                        className="health-bar-fill"
                        style={{ width: `${healthPercent}%` }}
                    />
                    <div
                        className="health-bar-glow"
                        style={{ width: `${healthPercent}%` }}
                    />
                </div>
            </div>
            <span className="hud-item">COINS {coins}</span>
        </div>
    );
}
