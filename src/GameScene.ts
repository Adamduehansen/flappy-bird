import { Scene, Physics, GameObjects, Types, Tweens, Animations } from 'phaser';

class GameScene extends Scene {
  #stageRunning = false;
  #enablePlayerControl = true;
  #animateGround = true;

  #groundGroup!: Physics.Arcade.StaticGroup;
  #player!: Types.Physics.Arcade.SpriteWithDynamicBody;
  #playerGroundCollider!: Physics.Arcade.Collider;
  #message!: GameObjects.Image;

  #messageFadeOutTween!: Tweens.Tween;

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
    this.createMessage();
    this.createPlayer();
    this.createGround();

    this.#playerGroundCollider = this.physics.add.collider(
      this.#player,
      this.#groundGroup,
      this.gameOver.bind(this)
    );

    this.resetStage();

    this.input.on('pointerdown', () => {
      if (!this.#enablePlayerControl) {
        return;
      } else {
        if (!this.#stageRunning) {
          this.newGame();
        } else {
          this.pushPlayer();
        }
      }
    });
  }

  public update() {
    this.#groundGroup.children.each((ground) => {
      if (this.#animateGround) {
        const image = ground as GameObjects.Image;
        image.x -= 2;

        if (image.x + this.cameras.main.width / 2 < 0) {
          image.x = this.cameras.main.width + 4;
        }
      }
    });
  }

  private createMessage() {
    this.#message = this.add
      .image(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        'message'
      )
      .setScale(2.5, 2);

    this.#messageFadeOutTween = this.tweens.add({
      targets: this.#message,
      alpha: { value: 0, duration: 500, ease: 'Power1' },
      loop: 0,
      paused: true,
    });
  }

  private createPlayer() {
    this.anims.create({
      key: 'flap',
      frames: this.anims.generateFrameNames('yellowbird'),
      frameRate: 10,
    }) as Animations.Animation;

    this.#player = this.physics.add
      .sprite(150, this.cameras.main.height / 2, 'yellowbird')
      .setScale(2, 2)
      .setDepth(1);
  }

  private createGround() {
    this.#groundGroup = this.physics.add.staticGroup();
    this.createGroundElement(0);
    this.createGroundElement(503);
    this.createGroundElement(1005);
  }

  private createGroundElement(x: number) {
    this.#groundGroup.add(
      this.add.image(x, 700, 'base').setScale(1.5, 1.5).setOrigin(0, undefined)
    );
  }

  private pushPlayer() {
    this.#player.setVelocityY(-300);
  }

  private newGame() {
    this.#player.setY(this.cameras.main.height / 2);
    this.#messageFadeOutTween.play();
    this.pushPlayer();
    this.physics.resume();
    this.#stageRunning = true;
  }

  private gameOver() {
    this.#stageRunning = false;
    this.#enablePlayerControl = false;
    this.#player.stop();
    this.#player.setVelocityY(-300);
    this.#playerGroundCollider.active = false;
    this.#animateGround = false;
  }

  public resetStage() {
    this.physics.pause();
    this.#player.play({
      key: 'flap',
      repeat: -1,
    });
  }
}

export default GameScene;
