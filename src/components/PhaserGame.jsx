import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config';

export default function PhaserGame({ onGameOver }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = createGameConfig(containerRef.current);
    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} id="game-container" />;
}
