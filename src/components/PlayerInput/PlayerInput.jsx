import { useState } from 'react';
import styles from './PlayerInput.module.css';

const PlayerInput = ({ onPlayersSubmit }) => {
  const [players, setPlayers] = useState(['', '', '']); // Minimum 3 players
  const [error, setError] = useState('');

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    if (players.length < 7) {
      setPlayers([...players, '']);
    }
  };

  const removePlayer = () => {
    if (players.length > 3) {
      setPlayers(players.slice(0, -1));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (players.some(player => !player.trim())) {
      setError('All player names are required');
      return;
    }
    if (new Set(players.map(p => p.trim())).size !== players.length) {
      setError('All player names must be unique');
      return;
    }
    setError('');
    onPlayersSubmit(players);
  };

  return (
    <div className={styles.container}>
      <h2>Enter Player Names</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {players.map((player, index) => (
          <input
            key={index}
            type="text"
            value={player}
            onChange={(e) => handlePlayerChange(index, e.target.value)}
            placeholder={`Player ${index + 1}`}
            className={styles.input}
          />
        ))}
        <div className={styles.buttons}>
          {players.length < 7 && (
            <button type="button" onClick={addPlayer} className={styles.button}>
              Add Player
            </button>
          )}
          {players.length > 3 && (
            <button type="button" onClick={removePlayer} className={styles.button}>
              Remove Player
            </button>
          )}
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.submitButton}>
          Start Game
        </button>
      </form>
    </div>
  );
};

export default PlayerInput;
