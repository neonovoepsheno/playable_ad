import ParticleExtension from 'ParticleExtension'
import ParticleData from 'ParticleData'

const {ccclass, property} = cc._decorator;

const ParticleOpacity = @ccclass('ParticleOpacity')
class ParticleOpacity extends ParticleExtension {
	constructor() { super(); }

	@property _isActive = false;
	@property({ displayName : "Opacity over Lifetime" }) get isActive() { return this._isActive; };
	@property({ displayName : "Opacity over Lifetime" }) set isActive(value) { 
		this._isActive = value;

		this.opacity = this._isActive ? new ParticleData() : null;
	};
		
	@property({ visible() { return this.isActive } }) opacity = null;

	get data() {
		const data = { opacity: null, };

		if (this._isActive) data.opacity = this.opacity.data;

		return data;
	};

	exportData = CC_EDITOR && function() {
		const data = {
			_isActive: this._isActive,
			opacity: null,
		};

		if (this.opacity !== null) data.opacity = this.opacity.exportData();

		return data;
	};
};

if (CC_EDITOR) {
	ParticleOpacity.template = [
		{ name: '_isActive', type: 'boolean', default: false, },
		{ name: 'opacity', type: 'object', view: [null, ParticleData], },
	];
}


module.exports = ParticleOpacity;
