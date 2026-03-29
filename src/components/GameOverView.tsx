import classes from './GameOverView.module.css';
import useGameContext from './useGameContext';

export default function GameOverView() {
    const { resetGame } = useGameContext();

    return (
        <div className={classes.gameOverOverlay}>
            <div className={classes.gameOverMessage}>
                Game Over
            </div>
            <button
                className={classes.resetButton}
                onClick={resetGame}
            >
                Try Again
            </button>
        </div>
    );
}