import { AUTO, Game } from 'phaser';
import MainScene from './GameScene';
import HighScoreManager from './HighScoreManager';
import * as Bird from './Bird';

Bird.register();

const highScoreManager = new HighScoreManager();

const mainScene = new MainScene(highScoreManager);

new Game({
  type: AUTO,
  width: 1000,
  height: 800,
  scene: [mainScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: process.env.PHASER_DEBUG,
      gravity: {
        y: 1600,
      },
    },
  },
});
