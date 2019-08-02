import ParticleExtension from 'ParticleExtension'
import ParticleValue from 'ParticleValue'

//#region classes-helpers
//#endregion


const ParticleLife = cc.Class({
	name: 'ParticleLife',
	extends: ParticleExtension,

	properties: {
		//#region editors fields and properties
		isPlayOnLoad: { default: false, displayName: "Play On Load", },

		timeScale: { default: 1, },
		duration: { default: 1, min: 0.01, max: 10, },	
		
		isLoop: { default: false, displayName: "Looping", },
		isPrewarm: { default: false, displayName: "Prewarm", visible() { return this.isLoop; }, },
		
		delay: { default() { return new ParticleValue(0, 0, 1)}, type: ParticleValue, },
		lifetime: { default() { return new ParticleValue(1, 0, 1)}, type: ParticleValue, },
		//#endregion


		//#region public fields and properties

		data: {
			get() {
				return {
					delay: this.delay.data,
					lifetime: this.lifetime.data,
				};
			},

			visible: false,
		},
		//#endregion


		//#region private fields and properties
		//#endregion
	},

	exportData : CC_EDITOR && function() {
		return {
			duration: this.duration,
			isPlayOnLoad: this.isPlayOnLoad,
			isLoop: this.isLoop,
			isPrewarm: this.isPrewarm,

			delay: this.delay.exportData(),
			lifetime: this.lifetime.exportData(),
		};
	},

	//#region life-cycle callbacks
	init() {
	},
	//#endregion


	//#region public methods
	//#endregion


	//#region private methods
	//#endregion


	//#region event handlers
	//#endregion
});

if (CC_EDITOR) {
	ParticleLife.template = [
		{ name: 'duration', type: 'number', default: 1, },
		{ name: 'isPlayOnLoad', type: 'boolean', default: false, },
		{ name: 'isLoop', type: 'boolean', default: false, },
		{ name: 'isPrewarm', type: 'boolean', default: false, },

		{ name: 'delay', type: 'object', view: ParticleValue, },
		{ name: 'lifetime', type: 'object', view: ParticleValue, },
	];
}


module.exports = ParticleLife;
