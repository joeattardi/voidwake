import { useRef, useEffect, useCallback } from 'react';
import './MainMenu.css';

interface MainMenuProps {
    onStartGame: () => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        buttonRef.current?.focus();

        const audio = new Audio('assets/Nebula_Navigator.mp3');
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;

        const playOnInteraction = () => {
            audio.play().catch(() => {});
            window.removeEventListener('click', playOnInteraction);
            window.removeEventListener('keydown', playOnInteraction);
        };

        audio.play().catch(() => {
            window.addEventListener('click', playOnInteraction);
            window.addEventListener('keydown', playOnInteraction);
        });

        return () => {
            audio.pause();
            audio.src = '';
            window.removeEventListener('click', playOnInteraction);
            window.removeEventListener('keydown', playOnInteraction);
        };
    }, []);

    const handleStart = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        onStartGame();
    }, [onStartGame]);

    return (
        <div className="main-menu">
            <div className="menu-content">
                <h1 className="menu-title">GALAXY WAVE</h1>
                <p className="menu-subtitle">A space survival shooter</p>
                <button ref={buttonRef} className="menu-button" onClick={handleStart}>
                    Start Game
                </button>
            </div>
        </div>
    );
}
