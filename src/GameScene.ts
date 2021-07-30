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
const HEIGH_SCORE_LOCALSTORAGE_KEY = 'highScore';

class GameScene extends Scene {
  #stageRunning = false;
  #enablePlayerControl = true;
  #score = 0;
  #highScore = 0;

  #groundGroup!: Physics.Arcade.Group;
  #pipesGroup!: Physics.Arcade.Group;
  #gapGroup!: Physics.Arcade.Group;
  #player!: Types.Physics.Arcade.SpriteWithDynamicBody;
  #playerGroundCollider!: Physics.Arcade.Collider;
  #playerPipeCollider!: Physics.Arcade.Collider;
  #message!: GameObjects.Image;
  #scoreText!: GameObjects.Text;
  #highScoreText!: GameObjects.Text;

  #messageFadeOutTween!: Tweens.Tween;
  #gameOverFadeInTween!: Tweens.Tween;
  #gameFadeInTween!: Tweens.Tween;

  #spawnPipesEvent!: Time.TimerEvent;

  public preload(): void {
    this.load.image('background', 'images/background-day.png');
    this.load.image('base', 'images/base.png');
    this.load.image('message', 'images/message.png');
    this.load.spritesheet('yellowbird', 'images/yellowbird-spritesheet.png', {
      frameWidth: 36,
      frameHeight: 24,
    });
    this.load.image('gameover', 'images/gameover.png');
    this.load.image('pipe', 'images/pipe-green.png');
    this.#highScore = this.getHighScore();
  }

  public create(): void {
    this.add.image(0, 0, 'background').setScale(3.5).setOrigin(0, 0.4);
    this.createMessage();
    this.createPlayer();
    this.createGround();
    this.createScoreTexts();
    this.createGameOver();

    this.#pipesGroup = this.physics.add.group();
    this.#gapGroup = this.physics.add.group();

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

    this.physics.add.collider(
      this.#player,
      this.#gapGroup,
      this.increaseScore,
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

  private createScoreTexts(): void {
    const textConfig: Types.GameObjects.Text.TextStyle = {
      fontFamily: 'PressStart2P',
      fontSize: '48px',
    };

    this.#scoreText = this.add
      .text(this.cameras.main.width / 2, 50, '0', textConfig)
      .setOrigin(0.5, 0)
      .setDepth(2);

    this.#highScoreText = this.add
      .text(this.cameras.main.width / 2, 300, '', textConfig)
      .setOrigin(0.5, 0)
      .setDepth(2)
      .setAlpha(0);
  }

  public update(): void {
    this.#groundGroup.children.each((ground) => {
      const image = ground as Types.Physics.Arcade.SpriteWithDynamicBody;
      if (image.x + this.cameras.main.width / 2 < 0) {
        image.x = this.cameras.main.width + 4;
      }
    });

    this.#highScoreText.setText(`High Score: ${this.#highScore}`);
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

  private getHighScore(): number {
    const highScore = localStorage.getItem(HEIGH_SCORE_LOCALSTORAGE_KEY);
    if (highScore) {
      return parseInt(highScore);
    } else {
      return 0;
    }
  }

  private async setHighScore(score: number): Promise<void> {
    return new Promise<void>((resolve) => {
      localStorage.setItem(HEIGH_SCORE_LOCALSTORAGE_KEY, score.toString());
      resolve();
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
      .setDepth(2)
      .setImmovable(true);
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
      targets: [gameOver, this.#highScoreText],
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

  private increaseScore(
    _: Types.Physics.Arcade.GameObjectWithBody,
    gap: Types.Physics.Arcade.GameObjectWithBody
  ): void {
    gap.destroy();
    this.#score += 1;
    this.#scoreText.setText(this.#score.toString());
  }

  private updateHighScore(): void {
    if (this.#score > this.#highScore) {
      this.setHighScore(this.#score);
      this.#highScore = this.#score;
    }
  }

  private spawnPipes(): void {
    const topPipeHeight =
      Math.floor(Math.random() * PIPE_TOP_MAX_HEIGHT) + PIPE_TOP_PUSH_UPWARDS;
    const pipeSpawnX = this.cameras.main.width + 50;

    const topPipe = this.#pipesGroup.create(
      pipeSpawnX,
      topPipeHeight,
      'pipe'
    ) as Types.Physics.Arcade.SpriteWithDynamicBody;
    topPipe
      .setScale(2)
      .setOrigin(0.5, 1)
      .setFlipY(true)
      .setDepth(0)
      .setVelocityX(-200)
      .setImmovable(true);
    topPipe.body.setAllowGravity(false);

    const gap = this.#gapGroup.create(
      pipeSpawnX + 50,
      topPipeHeight,
      undefined
    ) as Types.Physics.Arcade.SpriteWithDynamicBody;
    gap.setVelocityX(-200).setVisible(false).setScale(1, 6.2).setOrigin(1, 0);
    gap.body.setAllowGravity(false);

    const bottomPipe = this.#pipesGroup.create(
      pipeSpawnX,
      topPipeHeight + 200,
      'pipe'
    ) as Types.Physics.Arcade.SpriteWithDynamicBody;
    bottomPipe
      .setScale(2)
      .setOrigin(0.5, 0)
      .setDepth(0)
      .setVelocityX(-200)
      .setImmovable(true);
    bottomPipe.body.setAllowGravity(false);
  }

  private newGame(): void {
    this.#messageFadeOutTween.play();
    this.#spawnPipesEvent.paused = false;
    this.pushPlayer();
    this.physics.resume();
    this.#stageRunning = true;
    this.#player.body.setAllowGravity(true);
    this.#score = 0;
    this.#scoreText.setText(this.#score.toString());
  }

  private gameOver(): void {
    this.#stageRunning = false;
    this.#enablePlayerControl = false;
    this.#player.stop();
    this.pushPlayer();
    this.#playerGroundCollider.active = false;
    this.#playerPipeCollider.active = false;
    this.updateHighScore();
    this.#gameOverFadeInTween.play();
    this.#spawnPipesEvent.paused = true;
    this.#groundGroup.setVelocityX(0);
    this.#pipesGroup.setVelocityX(0);
    this.#gapGroup.setVelocityX(0);
  }

  public resetStage(): void {
    this.#player.setAlpha(0);
    this.#player.setY(this.cameras.main.height / 2);
    this.#player.body.setAllowGravity(false);
    this.#player.setVelocityY(0);
    this.#player.play({
      key: 'flap',
      repeat: -1,
    });
    this.#message.setAlpha(0);
    this.#groundGroup.setVelocityX(-200);
    this.#gameFadeInTween.play();
    this.#enablePlayerControl = true;
    this.#playerGroundCollider.active = true;
    this.#playerPipeCollider.active = true;
    this.#pipesGroup.clear(true, true);
    this.#gapGroup.clear(true, true);
  }
}

export default GameScene;
