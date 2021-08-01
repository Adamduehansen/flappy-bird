export interface IHighScoreManger {
  getHighScore(): number;
  setHighScore(score: number): void;
}

const HEIGH_SCORE_LOCALSTORAGE_KEY = 'highScore';

class HighScoreManager implements IHighScoreManger {
  getHighScore(): number {
    const highScore = localStorage.getItem(HEIGH_SCORE_LOCALSTORAGE_KEY);
    if (highScore) {
      return parseInt(highScore);
    } else {
      return 0;
    }
  }
  setHighScore(score: number): void {
    localStorage.setItem(HEIGH_SCORE_LOCALSTORAGE_KEY, score.toString());
  }
}

export default HighScoreManager;
