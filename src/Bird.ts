import { GameObjects, Physics, Scene, Sound } from 'phaser';

class Bird extends Physics.Arcade.Sprite {
  #wingSound!: Sound.BaseSound;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'yellowbird');
    this.setScale(2).setDepth(2);
  }

  freeze(value: boolean): void {
    (this.body as Physics.Arcade.Body).setAllowGravity(!value);
  }

  pushUp(): void {
    this.#wingSound = this.scene.sound.get('wing');
    this.#wingSound.play();
    this.setVelocityY(-600);
  }

  resetVelocity(): void {
    this.setVelocityY(0);
  }
}

export function register(): void {
  GameObjects.GameObjectFactory.register(
    'bird',
    function (this: GameObjects.GameObjectFactory, x: number, y: number) {
      const bird = new Bird(this.scene, x, y);

      this.displayList.add(bird);
      this.updateList.add(bird);

      this.scene.physics.world.enableBody(bird, Physics.Arcade.DYNAMIC_BODY);

      bird.setImmovable(true);

      return bird;
    }
  );
}

export default Bird;
