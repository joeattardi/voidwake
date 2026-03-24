import { useState } from 'react';
import MainMenu from './components/MainMenu';
import PhaserGame from './components/PhaserGame';

type Screen = 'menu' | 'game';

export default function App() {
    const [screen, setScreen] = useState<Screen>('menu');

    return (
        <>
            {screen === 'menu' && <MainMenu onStartGame={() => setScreen('game')} />}
            {screen === 'game' && <PhaserGame />}
        </>
    );
}
