import classes from './PauseView.module.css';
import useGameContext from './useGameContext';

export default function PauseView() {
    const { game, setPaused } = useGameContext();

    function resume() {
        setPaused(false);
        game?.events.emit('pause-toggled', false);
    }

    return (
        <div className={classes.pauseContainer}>
            <div className={classes.pauseText}>Paused</div>
            <button onClick={resume}>Continue</button>
        </div>
    );
}
