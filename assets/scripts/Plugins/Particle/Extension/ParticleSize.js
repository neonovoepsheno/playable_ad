import ParticleExtension from 'ParticleExtension'
import ParticleData from 'ParticleData'

const {ccclass, property} = cc._decorator;

//#region classes-helpers
const ParticleSeparateSizeHelper = @ccclass('ParticleSeparateSizeHelper')
class ParticleSeparateSizeHelper extends ParticleExtension {
	constructor() { super(); }

	@property() sizeX = new ParticleData();
	@property() sizeY = new ParticleData();

	get data() {
		return {
			scaleX: this.sizeX.data,
			scaleY: this.sizeY.data,
		}
	};


	exportData = CC_EDITOR && function() {
		const data = {
			view: 'ParticleSeparateSizeHelper',
			sizeX: null,
			sizeY: null,
		};

		if (this.sizeX !== null) data.sizeX = this.sizeX.exportData();
		if (this.sizeY !== null) data.sizeY = this.sizeY.exportData();

		return data;
	};
}
//#endregion

const ParticleSize = @ccclass('ParticleSize')
class ParticleSize extends ParticleExtension {
	constructor() {
		super();
	}

	@property _isActive = false;
	@property({ displayName : "Size over Lifetime" }) get isActive() { return this._isActive; };
	@property({ displayName : "Size over Lifetime" }) set isActive(value) { 
		this._isActive = value;

		if (value) {
			this._isSeparateAxis = false;
			this.size = new ParticleData();
		} else {
			this._isSeparateAxis = false;
			this.size = null;
		}
	};

	@property() _isSeparateAxis = false;
	@property({ displayName : "SeparateAxis", visible() { return this._isActive } }) get isSeparateAxis() { return this._isSeparateAxis; };
	@property({ displayName : "SeparateAxis", visible() { return this._isActive } }) set isSeparateAxis(value) { 
		this._isSeparateAxis = value;

		if (this._isActive) {
			if (this._isSeparateAxis) {
				this.size = new ParticleSeparateSizeHelper();
			} else {
				this.size = new ParticleData();
			}
		}
	};
		
	@property({ visible() { return this._isActive } }) size = null;

	get data() {
		let data = {
			scaleX: null,
			scaleY: null,
		};

		if (this._isActive) {
			if (this._isSeparateAxis) {
				data = this.size.data;
			} else {
				const scale = this.size.data;

				data.scaleX = scale;
				data.scaleY = scale;
			}
			
		}

		return data;
	};

	exportData = CC_EDITOR && function() {
		const data = {
			view: 'ParticleSeparateSizeHelper',
			_isActive: this._isActive,
			_isSeparateAxis: this._isSeparateAxis,
			size: null,
		};

		if (this.size !== null) data.size = this.size.exportData();

		return data;
	};
};

if (CC_EDITOR) {
	ParticleSeparateSizeHelper.template = [
		{ name: 'sizeX', type: 'object', view: ParticleData, },
		{ name: 'sizeY', type: 'object', view: ParticleData, },
	];

	ParticleSize.template = [
		{ name: '_isActive', type: 'boolean', default: false, },
		{ name: '_isSeparateAxis', type: 'boolean', default: false, },
		{ name: 'size', type: 'object', view: [
				ParticleSeparateSizeHelper,
				ParticleData,
				null,
			], 
		},
	];
}



