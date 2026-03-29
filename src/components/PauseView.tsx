import { useEffect, useRef } from 'react';
import classes from './PauseView.module.css';
import useGameContext from './useGameContext';

export default function PauseView() {
    const { game, setPaused } = useGameContext();
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    function resume() {
        setPaused(false);
        game?.events.emit('pause-toggled', false);
    }

    return (
        <div className={classes.pauseContainer}>
            <div className={classes.pauseText}>Paused</div>
            <button 
                ref={ref} 
                className={classes.continueButton} 
                onClick={resume}
            >
                Continue
            </button>
        </div>
    );
}
