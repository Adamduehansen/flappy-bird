declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PHASER_DEBUG: boolean;
    }
  }
}

export {};
