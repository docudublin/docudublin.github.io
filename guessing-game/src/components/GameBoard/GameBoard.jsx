import { useState, useEffect } from 'react';
import styles from './GameBoard.module.css';

const GameBoard = ({ players }) => {
  const rowNumbers = [7, 6, 5, 4, 3, 2, 3, 4, 5, 6, 7];
  const [scores, setScores] = useState(
    players.reduce((acc, player) => ({
      ...acc,
      [player]: Array(13).fill(null)
    }), {})
  );
  const [guesses, setGuesses] = useState(players.reduce((acc, player) => ({
    ...acc,
    [player]: ''
  }), {}));
  const [currentScores, setCurrentScores] = useState(players.reduce((acc, player) => ({
    ...acc,
    [player]: ''
  }), {}));
  const [currentRow, setCurrentRow] = useState(0);
  const [totalGuessesWarning, setTotalGuessesWarning] = useState(false);

  const getCurrentRowTarget = () => rowNumbers[currentRow];

  const calculateTotalGuesses = () => {
    return Object.values(guesses).reduce(
      (sum, guess) => sum + (guess === '' ? 0 : Number(guess)),
      0
    );
  };

  useEffect(() => {
    const totalGuesses = calculateTotalGuesses();
    const targetNumber = getCurrentRowTarget();
    setTotalGuessesWarning(
      Object.values(guesses).every(guess => guess !== '') && 
      totalGuesses === targetNumber
    );
  }, [guesses]);

  const handleGuessChange = (player, value) => {
    const numValue = value === '' ? '' : Number(value);
    if (numValue === '' || (numValue >= 0 && Number.isInteger(numValue))) {
      setGuesses(prev => ({
        ...prev,
        [player]: value
      }));
    }
  };

  const handleScoreChange = (player, value) => {
    const numValue = value === '' ? '' : Number(value);
    if (numValue === '' || (numValue >= 0 && Number.isInteger(numValue))) {
      setCurrentScores(prev => ({
        ...prev,
        [player]: value
      }));
    }
  };

  const calculateScores = () => {
    const hasEmptyFields = players.some(
      player => guesses[player] === '' || currentScores[player] === ''
    );
    if (hasEmptyFields) {
      alert('Please fill in all guesses and scores');
      return;
    }

    const targetNumber = getCurrentRowTarget();
    const totalGuesses = calculateTotalGuesses();
    if (totalGuesses === targetNumber) {
      alert(`Total guesses cannot equal ${targetNumber}`);
      return;
    }

    const newScores = { ...scores };
    players.forEach(player => {
      const guess = Number(guesses[player]);
      const score = Number(currentScores[player]);
      let calculatedScore;

      if (guess === score) {
        calculatedScore = 10 + (guess * 2);
      } else {
        calculatedScore = (guess - score) * -2;
      }

      newScores[player][currentRow] = calculatedScore;
    });

    setScores(newScores);
    setCurrentRow(prev => prev + 1);
    
    setGuesses(players.reduce((acc, player) => ({
      ...acc,
      [player]: ''
    }), {}));
    setCurrentScores(players.reduce((acc, player) => ({
      ...acc,
      [player]: ''
    }), {}));
    setTotalGuessesWarning(false);
  };

  const isGameComplete = currentRow === 13;

  return (
    <div className={styles.container}>
      <div className={styles.gameBoard}>
        <div className={styles.header}>
          <div className={styles.labelCell}></div>
          {players.map(player => (
            <div key={player} className={styles.playerName}>
              {player}
            </div>
          ))}
        </div>

        {/* Guess row */}
        <div className={styles.row}>
          <div className={styles.labelCell}>Guess</div>
          {players.map(player => (
            <div key={`guess-${player}`} className={styles.cell}>
              <input
                type="number"
                min="0"
                value={guesses[player]}
                onChange={(e) => handleGuessChange(player, e.target.value)}
                disabled={isGameComplete}
                className={`${styles.input} ${totalGuessesWarning ? styles.warning : ''}`}
              />
            </div>
          ))}
        </div>

        {totalGuessesWarning && (
          <div className={styles.warningMessage}>
            Total guesses cannot equal {getCurrentRowTarget()}
          </div>
        )}

        {/* Score row */}
        <div className={styles.row}>
          <div className={styles.labelCell}>Score</div>
          {players.map(player => (
            <div key={`score-${player}`} className={styles.cell}>
              <input
                type="number"
                min="0"
                value={currentScores[player]}
                onChange={(e) => handleScoreChange(player, e.target.value)}
                disabled={isGameComplete}
                className={styles.input}
              />
            </div>
          ))}
        </div>

        {/* Score grid */}
        {rowNumbers.map((number, index) => (
          <div key={index} className={styles.row}>
            <div className={styles.labelCell}>{number}</div>
            {players.map(player => (
              <div key={`${player}-${index}`} className={styles.cell}>
                {scores[player][index] !== null ? scores[player][index] : ''}
              </div>
            ))}
          </div>
        ))}

        {/* Calculate button */}
        {!isGameComplete && (
          <button 
            onClick={calculateScores}
            className={styles.calculateButton}
            disabled={totalGuessesWarning}
          >
            Calculate
          </button>
        )}

        {/* Game complete message */}
        {isGameComplete && (
          <div className={styles.gameComplete}>
            Game Complete! Final scores:
            {players.map(player => (
              <div key={`final-${player}`}>
                {player}: {scores[player].reduce((sum, score) => sum + score, 0)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
