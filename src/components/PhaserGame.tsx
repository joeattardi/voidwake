import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config';
import HudOverlay from './HudOverlay';
import PauseView from './PauseView';
import GameContext from './GameContext';
import GameOverView from './GameOverView';

export default function PhaserGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const [showGameOver, setShowGameOver] = useState(false);
    const [paused, setPaused] = useState(false);
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);
    const [coins, setCoins] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const config = createGameConfig(containerRef.current);
        const game = new Phaser.Game(config);
        gameRef.current = game;

        game.events.on('game-over', () => {
            setPaused(false);
            setShowGameOver(true);
        });
        game.events.on('score-changed', (value: number) => setScore(value));
        game.events.on('health-changed', (value: number) => setHealth(value));
        game.events.on('coin-collected', (value: number) => setCoins(value));

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            const scene = game.scene.getScene('MainScene');
            if (!scene || (!scene.scene.isActive() && !scene.scene.isPaused())) return;
            const isPaused = scene.scene.isPaused();
            setPaused(!isPaused);
            game.events.emit('pause-toggled', !isPaused);
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    const resetGame = () => {
        const game = gameRef.current;
        if (!game) return;
        setShowGameOver(false);
        setPaused(false);
        setScore(0);
        setHealth(100);
        setCoins(0);
        const scene = game.scene.getScene('MainScene');
        if (scene) {
            scene.sound.stopAll();
            scene.scene.restart();
        }
    };

    const contextValue = {
        game: gameRef.current,
        setPaused,
        resetGame
    };

    return (
        <GameContext.Provider value={contextValue}>
            <div id="game-wrapper">
                <div ref={containerRef} id="game-container">
                    {paused && !showGameOver && <PauseView />}
                    {showGameOver && <GameOverView />}
                </div>
                <HudOverlay score={score} health={health} coins={coins} gameOver={showGameOver} />
            </div>
        </GameContext.Provider>
    );
}
