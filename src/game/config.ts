import Phaser from 'phaser';
import MainScene from './MainScene';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
    return {
        type: Phaser.AUTO,
        parent,
        width: 800,
        height: 650,
        audio: {
            disableWebAudio: false
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 },
                debug: false
            }
        },
        scene: [MainScene]
    };
}
