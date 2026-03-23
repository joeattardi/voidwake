import { useState } from 'react';
import MainMenu from './components/MainMenu';
import PhaserGame from './components/PhaserGame';

export default function App() {
  const [screen, setScreen] = useState('menu');

  return (
    <>
      {screen === 'menu' && <MainMenu onStartGame={() => setScreen('game')} />}
      {screen === 'game' && <PhaserGame />}
    </>
  );
}
