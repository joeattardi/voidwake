import { useContext } from 'react';
import GameContext from './GameContext';

export default function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameContext.Provider');
    }
    return context;
}
