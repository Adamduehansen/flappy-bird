import { Scene, Physics, GameObjects } from 'phaser';

class GameScene extends Scene {
  #groundGroup!: Physics.Arcade.StaticGroup;

  public preload() {
    this.load.image('background', 'assets/background-day.png');
    this.load.image('base', 'assets/base.png');
    this.load.image('message', 'assets/message.png');
    this.load.spritesheet('yellowbird', 'assets/yellowbird-spritesheet.png', {
      frameWidth: 36,
      frameHeight: 24,
    });
  }

  public create() {
    this.add.image(0, 0, 'background').setScale(3.5, 3.5).setOrigin(0, 0.4);
    this.add
      .image(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        'message'
      )
      .setScale(2.5, 2);
    this.createPlayer();
    this.createGround();
  }

  public update() {
    this.#groundGroup.children.each((ground) => {
      const image = ground as GameObjects.Image;
      image.x -= 2;

      if (image.x + this.cameras.main.width / 2 < 0) {
        image.x = this.cameras.main.width + 4;
      }
    });
  }

  private createPlayer() {
    this.anims.create({
      key: 'flap',
      frames: this.anims.generateFrameNames('yellowbird'),
      frameRate: 10,
    });
    const player = this.physics.add
      .sprite(150, this.cameras.main.height / 2, 'yellowbird')
      .setScale(2, 2);
    player.play({
      key: 'flap',
      repeat: -1,
    });
  }

  private createGround() {
    this.#groundGroup = this.physics.add.staticGroup();
    this.#groundGroup.add(
      this.add.image(0, 700, 'base').setScale(1.5, 1.5).setOrigin(0, undefined)
    );
    this.#groundGroup.add(
      this.add
        .image(503, 700, 'base')
        .setScale(1.5, 1.5)
        .setOrigin(0, undefined)
    );
    this.#groundGroup.add(
      this.add
        .image(1005, 700, 'base')
        .setScale(1.5, 1.5)
        .setOrigin(0, undefined)
    );
  }
}

export default GameScene;
