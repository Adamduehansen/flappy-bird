import {
  Scene,
  Physics,
  GameObjects,
  Types,
  Tweens,
  Animations,
  Time,
} from 'phaser';

const PIPE_SPAWN_TIME_MS = 1250;
const PIPE_TOP_MAX_HEIGHT = 300;
const PIPE_TOP_PUSH_UPWARDS = 100;

class GameScene extends Scene {
  #stageRunning = false;
  #enablePlayerControl = true;
  #animateGround = true;

  #groundGroup!: Physics.Arcade.Group;
  #pipesGroup!: Physics.Arcade.StaticGroup;
  #player!: Types.Physics.Arcade.SpriteWithDynamicBody;
  #playerGroundCollider!: Physics.Arcade.Collider;
  #playerPipeCollider!: Physics.Arcade.Collider;
  #message!: GameObjects.Image;

  #messageFadeOutTween!: Tweens.Tween;
  #gameOverFadeInTween!: Tweens.Tween;
  #gameFadeInTween!: Tweens.Tween;

  #spawnPipesEvent!: Time.TimerEvent;

  public preload(): void {
    this.load.image('background', 'assets/background-day.png');
    this.load.image('base', 'assets/base.png');
    this.load.image('message', 'assets/message.png');
    this.load.spritesheet('yellowbird', 'assets/yellowbird-spritesheet.png', {
      frameWidth: 36,
      frameHeight: 24,
    });
    this.load.image('gameover', 'assets/gameover.png');
    this.load.image('pipe', 'assets/pipe-green.png');
  }

  public create(): void {
    this.add.image(0, 0, 'background').setScale(3.5).setOrigin(0, 0.4);
    this.createMessage();
    this.createPlayer();
    this.createGround();
    this.createGameOver();

    this.#pipesGroup = this.physics.add.staticGroup();

    this.#playerGroundCollider = this.physics.add.collider(
      this.#player,
      this.#groundGroup,
      this.gameOver,
      undefined,
      this
    );

    this.#playerPipeCollider = this.physics.add.collider(
      this.#player,
      this.#pipesGroup,
      this.gameOver,
      undefined,
      this
    );

    this.#gameFadeInTween = this.tweens.add({
      targets: [this.#player, this.#message],
      paused: true,
      alpha: {
        value: 1,
        duration: 500,
        ease: 'Power1',
      },
    });

    this.#spawnPipesEvent = this.time.addEvent({
      paused: true,
      delay: PIPE_SPAWN_TIME_MS,
      callback: this.spawnPipes,
      callbackScope: this,
      loop: true,
    });

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

  public update(): void {
    this.#groundGroup.children.each((ground) => {
      const image = ground as Types.Physics.Arcade.SpriteWithDynamicBody;
      if (this.#animateGround) {
        image.setVelocityX(-200);

        if (image.x + this.cameras.main.width / 2 < 0) {
          image.x = this.cameras.main.width + 4;
        }
      } else {
        image.setVelocityX(0);
      }
    });

    this.#pipesGroup.children.each((pipe) => {
      if (this.#animateGround) {
        const image = pipe as GameObjects.Image;
        image.body.position.x -= 2;
        image.x -= 2;
      }
    });
  }

  private createMessage(): void {
    this.#message = this.add
      .image(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        'message'
      )
      .setScale(2.5, 2);

    this.#messageFadeOutTween = this.tweens.add({
      targets: this.#message,
      alpha: {
        value: 0,
        duration: 500,
        ease: 'Power1',
      },
      paused: true,
    });
  }

  private createPlayer(): void {
    this.anims.create({
      key: 'flap',
      frames: this.anims.generateFrameNames('yellowbird'),
      frameRate: 10,
    }) as Animations.Animation;

    this.#player = this.physics.add
      .sprite(150, this.cameras.main.height / 2, 'yellowbird')
      .setScale(2)
      .setDepth(2);
  }

  private createGround(): void {
    this.#groundGroup = this.physics.add.group();
    this.createGroundElement(0);
    this.createGroundElement(503);
    this.createGroundElement(1005);
  }

  private createGroundElement(x: number): void {
    const ground = (
      this.#groundGroup.create(
        x,
        700,
        'base'
      ) as Types.Physics.Arcade.SpriteWithDynamicBody
    )
      .setScale(1.5)
      .setOrigin(0, undefined)
      .setDepth(1)
      .setImmovable(true);
    ground.body.setAllowGravity(false);
  }

  private createGameOver(): void {
    const gameOver = this.add
      .image(this.cameras.main.width / 2, 200, 'gameover')
      .setScale(2)
      .setAlpha(0)
      .setDepth(1);

    this.#gameOverFadeInTween = this.tweens.add({
      targets: gameOver,
      alpha: {
        value: 1,
        duration: 1000,
        ease: 'Power1',
      },
      hold: 1000,
      paused: true,
      yoyo: true,
      onComplete: this.resetStage,
      onCompleteScope: this,
    });
  }

  private pushPlayer(): void {
    this.#player.setVelocityY(-500);
  }

  private spawnPipes(): void {
    const topPipeHeight =
      Math.floor(Math.random() * PIPE_TOP_MAX_HEIGHT) + PIPE_TOP_PUSH_UPWARDS;
    const pipeSpawnX = this.cameras.main.width + 50;

    // Top pipe
    this.#pipesGroup.add(
      this.add
        .image(pipeSpawnX, topPipeHeight, 'pipe')
        .setScale(2)
        .setOrigin(0.5, 1)
        .setFlipY(true)
        .setDepth(0)
    );

    // Bottom pipe
    this.#pipesGroup.add(
      this.add
        .image(pipeSpawnX, topPipeHeight + 200, 'pipe')
        .setScale(2)
        .setOrigin(0.5, 0)
        .setDepth(0)
    );
  }

  private newGame(): void {
    this.#messageFadeOutTween.play();
    this.#spawnPipesEvent.paused = false;
    this.pushPlayer();
    this.physics.resume();
    this.#stageRunning = true;
  }

  private gameOver(): void {
    this.#stageRunning = false;
    this.#enablePlayerControl = false;
    this.#player.stop();
    this.pushPlayer();
    this.#playerGroundCollider.active = false;
    this.#playerPipeCollider.active = false;
    this.#animateGround = false;
    this.#gameOverFadeInTween.play();
    this.#spawnPipesEvent.paused = true;
  }

  public resetStage(): void {
    this.#player.setAlpha(0);
    this.#message.setAlpha(0);
    this.#player.setY(this.cameras.main.height / 2);
    this.physics.pause();
    this.#player.play({
      key: 'flap',
      repeat: -1,
    });
    this.#gameFadeInTween.play();
    this.#enablePlayerControl = true;
    this.#playerGroundCollider.active = true;
    this.#playerPipeCollider.active = true;
    this.#animateGround = true;
    this.#pipesGroup.clear(true, true);
  }
}

export default GameScene;
