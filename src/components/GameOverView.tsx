import { useEffect, useRef } from 'react';
import classes from './GameOverView.module.css';
import useGameContext from './useGameContext';

export default function GameOverView() {
    const { resetGame } = useGameContext();
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div className={classes.gameOverOverlay}>
            <div className={classes.gameOverMessage}>
                Game Over
            </div>
            <button
                className={classes.resetButton}
                onClick={resetGame}
                ref={ref}
            >
                Try Again
            </button>
        </div>
    );
}
