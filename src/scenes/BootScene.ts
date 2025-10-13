import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
	constructor() {
		super('BootScene');
	}

	preload() {
		// Preload placeholder assets here later
		this.add.text(10, 10, 'Loading...', { color: '#ffffff' });
	}

	create() {
		// Don't start MainMenu since we're using React overlays
		this.add.text(this.cameras.main.width/2, this.cameras.main.height/2, 'Ozone City Express', { 
			fontSize: '32px', 
			color: '#ffffff',
			align: 'center'
		}).setOrigin(0.5);
	}
}
