import Phaser from 'phaser';
import MainScene from './MainScene';

export function createGameConfig(parent) {
  return {
    type: Phaser.AUTO,
    parent,
    width: 800,
    height: 650,
    audio: {
      disableWebAudio: false,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [MainScene],
  };
}
