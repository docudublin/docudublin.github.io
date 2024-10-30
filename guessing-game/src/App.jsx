import { useState } from 'react';
import PlayerInput from './components/PlayerInput/PlayerInput';
import GameBoard from './components/GameBoard/GameBoard';
import styles from './App.module.css';

function App() {
  const [players, setPlayers] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handlePlayersSubmit = (playerNames) => {
    setPlayers(playerNames);
    setGameStarted(true);
  };

  const handleNewGame = () => {
    setPlayers(null);
    setGameStarted(false);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>The Guessing Game</h1>
        {gameStarted && (
          <button onClick={handleNewGame} className={styles.newGameButton}>
            New Game
          </button>
        )}
      </header>

      <main className={styles.main}>
        {!gameStarted ? (
          <PlayerInput onPlayersSubmit={handlePlayersSubmit} />
        ) : (
          <GameBoard players={players} />
        )}
      </main>
    </div>
  );
}

export default App;
