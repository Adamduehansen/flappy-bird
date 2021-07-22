import { Scene } from 'phaser';

class GameScene extends Scene {
  public preload() {
    this.load.image('background', 'assets/background-day.png');
  }

  public create() {
    this.add.sprite(0, 0, 'background').setScale(4, 4);
    this.add.sprite(500, 0, 'background').setScale(4, 4);
  }
}

export default GameScene;
