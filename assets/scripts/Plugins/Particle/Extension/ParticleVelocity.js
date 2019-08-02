import ParticleExtension from 'ParticleExtension'
import ParticleData from 'ParticleData'

const {ccclass, property} = cc._decorator;

//#region classes-helpers
const VelocityType = cc.Enum({
	None : 0,
	Angle : 10,
	Fasing : 20,
	Radial : 30,
});

const ParticleSeparateVelocityHelper = @ccclass('ParticleSeparateVelocityHelper')
class ParticleSeparateVelocityHelper extends ParticleExtension {
	constructor() {
		super();
		this.velocityX = new ParticleData();
		this.velocityY = new ParticleData();
	}

	@property velocityX = null;
	@property velocityY = null;

	get data() {
		return {
			velocityX: this.velocityX.data,
			velocityY: this.velocityY.data,
		};
	};

	exportData = CC_EDITOR && function() {
		const data = {
			view: 'ParticleSeparateVelocityHelper',
			velocityX: null,
			velocityY: null,
		};

		if (this.velocityX !== null) data.velocityX = this.velocityX.exportData();
		if (this.velocityY !== null) data.velocityY = this.velocityY.exportData();

		return data;
	};
};

const ParticleAngleVelocityHelper = @ccclass('ParticleAngleVelocityHelper')
class ParticleAngleVelocityHelper extends ParticleExtension {
	constructor() {
		super();
		this.angle = new ParticleData();
		this.velocity = new ParticleData();
	}

	@property angle = null;
	@property velocity = null;

	get data() {
		return {
			angle: this.angle.data,
			velocity: this.velocity.data,
		}
	};

	exportData = CC_EDITOR && function() {
		const data = {
			view: 'ParticleAngleVelocityHelper',
			angle: null,
			velocity: null,
		};

		if (this.angle !== null) data.angle = this.angle.exportData();
		if (this.velocity !== null) data.velocity = this.velocity.exportData();

		return data;
	};
};

const ParticleFasingVelocityHelper = @ccclass('ParticleFasingVelocityHelper')
class ParticleFasingVelocityHelper extends ParticleExtension {
	constructor() {
		super();
		this.velocity = new ParticleData();
	}

	@property velocity = null;

	get data() {
		return {
			isFasingVelocity: true,
			velocity: this.velocity.data,
		}
	};

	exportData = CC_EDITOR && function() {
		const data = {
			view: 'ParticleFasingVelocityHelper',
			velocity: null,
		};

		if (this.velocity !== null) data.velocity = this.velocity.exportData();

		return data;
	};
};

const TargetRadialVelocityType = cc.Enum({
	Spawn : 0,

	LocalPoint : 10,
	WorldPoint : 20,

	LocalTarget : 30,
	WorldTarget : 40,
});

const LocalTargetRadialVelocityHelper = @ccclass('LocalTargetRadialVelocityHelper')
class LocalTargetRadialVelocityHelper extends ParticleExtension {
	constructor() { super(); }

	@property(cc.Node) target = null;

	get data() {
		const target = this.target ? this.target : new cc.Vec2(0, 0);
		return {
			isLocal: true,
			get point() {
				return new cc.Vec2(target.x, target.y);
			} 
		}
	};

	exportData = CC_EDITOR && function() {
		return {
			view: 'LocalTargetRadialVelocityHelper',
			target: null,
		};
	};
};
const WorldTargetRadialVelocityHelper = @ccclass('WorldTargetRadialVelocityHelper')
class WorldTargetRadialVelocityHelper extends ParticleExtension {
	constructor() { super(); }

	@property(cc.Node) target = null;

	get data() {
		const target = this.target;
		return {
			isLocal: false,
			get point() {
				if (target instanceof cc.Node) {
					return target.convertToWorldSpaceAR(cc.Vec2.ZERO);
				}

				return cc.Vec2.ZERO;
			} 
		}
	};

	exportData = CC_EDITOR && function() {
		return {
			view: 'WorldTargetRadialVelocityHelper',
			target: null,
		};
	};
};

const LocalPointRadialVelocityHelper = @ccclass('LocalPointRadialVelocityHelper')
class LocalPointRadialVelocityHelper extends ParticleExtension {
	constructor() { super(); }

	@property point = new cc.Vec2(0, 0);

	get data() {
		const point = this.point;
		return {
			isLocal: true,
			get point() {
				return point.clone();
			} 
		}
	};

	exportData = CC_EDITOR && function() {
		return {
			view: 'LocalPointRadialVelocityHelper',
			point: this.point,
		};
	};
};
const WorldPointRadialVelocityHelper = @ccclass('WorldPointRadialVelocityHelper')
class WorldPointRadialVelocityHelper extends ParticleExtension {
	constructor() { super(); }

	@property point = new cc.Vec2(0, 0);

	get data() {
		const point = this.point;
		return {
			isLocal: false,
			get point() {
				return point.clone();
			} 
		}
	};

	exportData = CC_EDITOR && function() {
		return {
			view: 'WorldPointRadialVelocityHelper',
			point: this.point,
		};
	};
};

const ParticleRadialVelocityHelper = @ccclass('ParticleRadialVelocityHelper')
class ParticleRadialVelocityHelper extends ParticleExtension {
	constructor() {
		super();
		this.velocity = new ParticleData();
	}

	@property _targetType = TargetRadialVelocityType.Spawn;
	@property({ type : TargetRadialVelocityType, }) get targetType() { return this._targetType; };
	@property({ type : TargetRadialVelocityType, }) set targetType(value) {
		if (this._targetType !== value) {
			this._targetType = value;

			switch(this._targetType) {
				case TargetRadialVelocityType.LocalPoint:
					this.target = new LocalPointRadialVelocityHelper();
					break;

				case TargetRadialVelocityType.WorldPoint:
					this.target = new WorldPointRadialVelocityHelper();
					break;

				case TargetRadialVelocityType.LocalTarget: 
					this.target = new LocalTargetRadialVelocityHelper;
					break;

				case TargetRadialVelocityType.WorldTarget: 
					this.target = new WorldTargetRadialVelocityHelper;
					break;

				default:
					this.target = null;
					break;
			}
		}

	};
	@property({ visible() { return this._targetType !== TargetRadialVelocityType.Spawn; }, }) target = null;
	@property velocity = null;

	get data() {
		return {
			isRadialVelocity: true,
			target: this.target ? this.target.data : this.target,
			velocity: this.velocity.data,
		}
	}

	exportData = CC_EDITOR && function() {
		const data = {
			view: 'ParticleRadialVelocityHelper',
			_targetType: this._targetType,
			target: null,
			velocity: null,
		};

		if (this.target !== null) data.target = this.target.exportData();
		if (this.velocity !== null) data.velocity = this.velocity.exportData();

		return data;
	};
};
//#endregion

const ParticleVelocity = @ccclass('ParticleVelocity')
class ParticleVelocity extends ParticleExtension {
	constructor() {
		super();
	}

	@property _isActive = false;
	@property({ displayName : "Velocity over Lifetime" }) get isActive() { return this._isActive; };
	@property({ displayName : "Velocity over Lifetime" }) set isActive(value) { 
		this._isActive = value;

		if (this._isActive) {
			this.velocityType = VelocityType.Angle;
			this._isSeparateAxis = false;
		} else {
			this.velocityType = VelocityType.None;
			this._isSeparateAxis = false;
			this.separateVelocity = null;
		}
	};

	@property _isSeparateAxis = false;
	@property({ displayName : "SeparateAxis", visible() { return this._isActive } }) get isSeparateAxis() { return this._isSeparateAxis; };
	@property({ displayName : "SeparateAxis", visible() { return this._isActive } }) set isSeparateAxis(value) { 
		this._isSeparateAxis = value;

		if (this._isActive) {
			if (this._isSeparateAxis) {
				this.separateVelocity = new ParticleSeparateVelocityHelper();
			} else {
				this.separateVelocity = null;
			}
		}
	};

	@property _velocityType = VelocityType.None;
	@property({ type: VelocityType, visible() { return this._isActive; }, }) get velocityType() { return this._velocityType; };
	@property({ type: VelocityType, visible() { return this._isActive; }, }) set velocityType(value) { 
		if (this._velocityType !== value) {
			this._velocityType = value;

			switch(this._velocityType) {
				case VelocityType.Angle:
					this.velocity = new ParticleAngleVelocityHelper();
					break;

				case VelocityType.Fasing:
					this.velocity = new ParticleFasingVelocityHelper();
					break;

				case VelocityType.Radial: 
					this.velocity = new ParticleRadialVelocityHelper;
					break;

				default:
					this.velocity = null;
					break;
			}
		}
	};


	@property({ visible() { return this._velocityType !== VelocityType.None; } }) velocity = null;
	@property({ visible() { return this._isSeparateAxis; } }) separateVelocity = null;

	get data() {
		const data = {
			velocity: null,
			velocityX: null,
			velocityY: null,
		};

		if (this._isSeparateAxis) {
			const dataSeparateVelocity = this.separateVelocity.data;

			data.velocityX = dataSeparateVelocity.velocityX;
			data.velocityY = dataSeparateVelocity.velocityY;
		}

		if (this.velocity !== null) {
			data.velocity = this.velocity.data;
		}

		return data;
	}

	exportData = CC_EDITOR && function() {
		const data = {
			_isActive: this._isActive,
			_isSeparateAxis: this._isSeparateAxis,
			_velocityType: this._velocityType,
			velocity: null,
			separateVelocity: null,
		};

		if (this.velocity !== null) data.velocity = this.velocity.exportData();
		if (this.separateVelocity !== null) data.separateVelocity = this.separateVelocity.exportData();

		return data;
	};
};

if (CC_EDITOR) {
	ParticleSeparateVelocityHelper.template = [
		{ name: 'velocityX', type: 'object', view: ParticleData, },
		{ name: 'velocityY', type: 'object', view: ParticleData, },
	];

	ParticleAngleVelocityHelper.template = [
		{ name: 'angle', type: 'object', view: ParticleData, },
		{ name: 'velocity', type: 'object', view: ParticleData, },
	];

	ParticleFasingVelocityHelper.template = [
		{ name: 'velocity', type: 'object', view: ParticleData, },
	];


	LocalTargetRadialVelocityHelper.template = [
		{ name: 'target', type: 'object', view: null, },
	];

	WorldTargetRadialVelocityHelper.template = [
		{ name: 'target', type: 'object', view: null, },
	];

	LocalPointRadialVelocityHelper.template = [
		{ name: 'point', type: 'object', view: cc.Vec2, },
	];

	WorldPointRadialVelocityHelper.template = [
		{ name: 'point', type: 'object', view: cc.Vec2, },
	];

	ParticleRadialVelocityHelper.template = [
		{ name: '_targetType', type: 'number', default: 0, },
		{ name: 'target', type: 'object', view: [
				LocalTargetRadialVelocityHelper,
				WorldTargetRadialVelocityHelper,
				LocalPointRadialVelocityHelper,
				WorldPointRadialVelocityHelper,
				null,
			], 
		},
		{ name: 'velocity', type: 'object', view: ParticleData, },
	];

	ParticleVelocity.template = [
		{ name: '_isActive', type: 'boolean', default: false, },
		{ name: '_isSeparateAxis', type: 'boolean', default: false, },
		{ name: '_velocityType', type: 'number', default: 0, },

		{ name: 'velocity', type: 'object', view: [
				ParticleAngleVelocityHelper,
				ParticleFasingVelocityHelper,
				ParticleRadialVelocityHelper,
				null,
			], 
		},

		{ name: 'separateVelocity', type: 'object', view: [
				ParticleSeparateVelocityHelper,
				null,
			], 
		},
	];
}

module.exports = ParticleVelocity;
