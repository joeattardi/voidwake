import './MainMenu.css';

export default function MainMenu({ onStartGame }) {
  return (
    <div className="main-menu">
      <div className="menu-content">
        <h1 className="menu-title">VOID WAKE</h1>
        <p className="menu-subtitle">A space survival shooter</p>
        <button className="menu-button" onClick={onStartGame}>
          Start Game
        </button>
      </div>
    </div>
  );
}
