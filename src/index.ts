import { Game } from 'phaser';
import MainScene from './GameScene';

new Game({
  width: 1000,
  height: 800,
  scene: MainScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
});
