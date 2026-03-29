import { createContext } from 'react';

interface GameContextType {
    game: Phaser.Game | null;
    setPaused: (paused: boolean) => void;
    resetGame: () => void;
}

export default createContext<GameContextType | undefined>(undefined);
