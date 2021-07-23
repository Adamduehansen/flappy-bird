import { AUTO, Game } from 'phaser';
import MainScene from './GameScene';

new Game({
  type: AUTO,
  width: 1000,
  height: 800,
  scene: MainScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {
        y: 1600,
      },
    },
  },
});
