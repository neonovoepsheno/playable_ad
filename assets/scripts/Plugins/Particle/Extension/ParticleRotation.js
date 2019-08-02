import ParticleExtension from 'ParticleExtension'
import ParticleData from 'ParticleData'

const {ccclass, property} = cc._decorator;

const ParticleRotation = @ccclass('ParticleRotation')
class ParticleRotation extends ParticleExtension {
	constructor() { super(); }

	@property _isActive = false;
	@property({ displayName : "Rotation over Lifetime" }) get isActive() { return this._isActive; };
	@property({ displayName : "Rotation over Lifetime" }) set isActive(value) { 
		this._isActive = value;

		if (this._isActive) {
            this.isFollowMovement = false;         
		} else {
			this.isFollowMovement = false;
			this.rotation = null;
		}
	};

	@property() _isFollowMovement = false;
	@property({ displayName : "Follow Movement", visible() { return this.isActive } }) get isFollowMovement() { return this._isFollowMovement; };
	@property({ displayName : "Follow Movement", visible() { return this.isActive } }) set isFollowMovement(value) { 
		this._isFollowMovement = value;

		this.rotation = this._isFollowMovement ? null : new ParticleData();
	};
		
	@property({ visible() { return this.isActive && !this.isFollowMovement } }) rotation = null;

	get data() {
		const data = {
			isFollowMovement: this.isFollowMovement,
			rotation: null, 
		};

		if (this._isActive && this.rotation !== null) data.rotation = this.rotation.data;

		return data;
	};


	exportData = CC_EDITOR && function() {
		const data = {
			_isActive: this._isActive,
			_isFollowMovement: this._isFollowMovement,
			rotation: null,
		};

		if (this.rotation !== null) data.rotation = this.rotation.exportData();

		return data;
	};
};

if (CC_EDITOR) {
	ParticleRotation.template = [
		{ name: '_isActive', type: 'boolean', default: false, },
		{ name: '_isFollowMovement', type: 'boolean', default: false, },
		{ name: 'rotation', type: 'object', view: [null, ParticleData], },
	];
}

module.exports = ParticleRotation;
