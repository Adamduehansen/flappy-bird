declare interface IBird extends Phaser.GameObjects.Sprite {
  pushUp(): void;
  freeze(value: boolean): void;
  setImmovable(): void;
  resetVelocity(): void;
}

declare namespace Phaser.GameObjects {
  interface GameObjectFactory {
    bird(x: number, y: number): IBird;
  }
}
