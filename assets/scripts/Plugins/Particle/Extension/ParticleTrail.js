import ParticleExtension from 'ParticleExtension'

const {ccclass, property} = cc._decorator;

const MAX_CYCLES = 100;

//#region classes-helpers
const TrailType = cc.Enum({
	None : 0,
	
	LocalPoint : 10,
	LocalTarget : 20,

	WorldPoint : 30,
	WorldTarget : 40,
});

const TrailHelper = cc.Class({
	name: 'TrailHelper',
	extends: ParticleExtension,

	properties: {
		//#region editors fields and properties
		count: { default: 1, type: 'Integer', min: 1, },
		delta: { default: 10, min: 0.1, notify() { this._sqrtDelta = this.delta * this.delta; }, },
		//#endregion


		//#region private fields and properties
		_sqrtDelta: { default: 100, serializable: false, },

		_result: { default: [], serializable: false, },

		_main: { default: null, type: cc.Node, serializable: false, },

		_position: { default: new cc.Vec2(0, 0), serializable: false, },
		_oldPosition: { default: new cc.Vec2(0, 0), serializable: false, },

		_oldOffset: { default: new cc.Vec2(0, 0), serializable: false, },
		//#endregion
	},

	init(main) {
		this._main = main;
	},

	reset() {
		this._position.set(this._main.position);
		this._oldPosition.set(this._position);

		this._oldOffset = this._countOffset();
	},

	update(dt) {
		this._result = [];

		this._oldPosition.set(this._position);
		this._position.set(this._main.position);

		this._calculate(dt);

		return this._result
	},

	_calculate(dt) {
		const offset = this._countOffset();

		const deltaVector = offset.sub(this._oldOffset);
		const magSqrtDeltaVector = deltaVector.x * deltaVector.x + deltaVector.y * deltaVector.y;

		if (magSqrtDeltaVector >= this._sqrtDelta) {
			const deltaCurrentPosition = this._position.sub(this._oldPosition);
			const angle = Math.atan2(deltaCurrentPosition.y, deltaCurrentPosition.x) * 57.2958;
			const normalizeOffset = deltaVector.normalize();
			const deltaCurrentOffset = new cc.Vec2(0, 0);
			const magDeltaVector = Math.sqrt(magSqrtDeltaVector);

			let delta = magDeltaVector;
			let time = 0;

			let cycles = 0;
			while(delta >= this.delta) {
				delta -= this.delta;

				const ratio = 1 - delta / magDeltaVector;
				const position = deltaCurrentPosition.mul(ratio);

				time = dt * ratio;

				this._result.push({ count: this.count, time, position, angle });
				deltaCurrentOffset.addSelf((normalizeOffset.mul(this.delta)));
				
				cycles += 1;
				if (cycles >= MAX_CYCLES) {
					break;
				}
			}
			this._oldOffset.addSelf(deltaCurrentOffset);
		}

	},

	_countOffset() {
		return this._position.clone();
	}, 
});

const LocalPointTrailHelper = cc.Class({
	name: 'LocalPointTrailHelper',
	extends: TrailHelper,

	properties: { 
		point: { default() { return new cc.Vec2(0, 0); }, },
	},

	exportData: CC_EDITOR && function() {
		const data = {
			view: 'LocalPointTrailHelper',
			count: this.count,
			delta: this.delta,
			point: this.point,
		};

		return data;
	},

	_countOffset() {
		return new cc.Vec2(this._position.x - this.point.x, this._position.y - this.point.y);
	},
});

const LocalTargetTrailHelper = cc.Class({
	name: 'LocalTargetTrailHelper',
	extends: TrailHelper,

	properties: { 
		target: { default: null, type: cc.Node, },
	},

	exportData: CC_EDITOR && function() {
		const data = {
			view: 'LocalTargetTrailHelper',
			count: this.count,
			delta: this.delta,
			target: null,
		};

		return data;
	},

	_countOffset() {
		if (!(this.target instanceof cc.Node)) {
			return new cc.Vec2(this._position.x, this._position.y);
		}

		return new cc.Vec2(this._position.x - this.target.x, this._position.y - this.target.y);
	},
});

const WorldPointTrailHelper = cc.Class({
	name: 'WorldPointTrailHelper',
	extends: TrailHelper,

	properties: { 
		point: { default() { return new cc.Vec2(0, 0); }, },
	},

	exportData: CC_EDITOR && function() {
		const data = {
			view: 'WorldPointTrailHelper',
			count: this.count,
			delta: this.delta,
			point: this.point,
		};

		return data;
	},

	_countOffset() {
		const worldPosition = this._main.convertToWorldSpaceAR(new cc.Vec2(0, 0));

		return new cc.Vec2(worldPosition.x - this.point.x, worldPosition.y - this.point.y);
	},
});

const WorldTargetTrailHelper = cc.Class({
	name: 'WorldTargetTrailHelper',
	extends: TrailHelper,

	properties: { 
		target: { default: null, type: cc.Node, },
	},

	exportData: CC_EDITOR && function() {
		const data = {
			view: 'WorldTargetTrailHelper',
			count: this.count,
			delta: this.delta,
			target: null,
		};

		return data;
	},

	_countOffset() {
		const worldPosition = this._main.convertToWorldSpaceAR(new cc.Vec2(0, 0));
		let worldPositionTarget = new cc.Vec2(0, 0);

		if (this.target instanceof cc.Node) {
			worldPositionTarget = this.target.convertToWorldSpaceAR(new cc.Vec2(0, 0));
		}

		return new cc.Vec2(worldPosition.x - worldPositionTarget.x, worldPosition.y - worldPositionTarget.y);
	},
});
//#endregion

const ParticleTrail = @ccclass('ParticleTrail')
class ParticleTrail extends ParticleExtension {
	constructor() { super(); };

	@property _isActive = false;
	@property({ displayName : "Trail" }) get isActive() { return this._isActive; };
	@property({ displayName : "Trail" }) set isActive(value) {
		if (this._isActive !== value) {
			this._isActive = value;

			if (this._isActive) {
				this.trailType = TrailType.LocalPoint;
			} else {
				this.trailType = TrailType.None;
			}
		}
	};

	@property _trailType = TrailType.None;
	@property({ type : TrailType, visible() { return this._isActive }, }) get trailType() { return this._trailType; };
	@property({ type : TrailType, visible() { return this._isActive }, }) set trailType(value) {
		if (this._trailType !== value) {
			this._trailType = value;

			switch(this.trailType) {
				case TrailType.LocalPoint:
					this.trail = new LocalPointTrailHelper();
				break;

				case TrailType.LocalTarget:
					this.trail = new LocalTargetTrailHelper();
				break;

				case TrailType.WorldPoint:
					this.trail = new WorldPointTrailHelper();
				break;

				case TrailType.WorldTarget:
					this.trail = new WorldTargetTrailHelper();
				break;

				default:
					this.trail = null;
				break;
			}
		}
	};

	@property({ type : TrailHelper, visible() { return this.trailType !== TrailType.None; }, }) trail = null;

	_result = [];

	init(node) {
		if (this.trail instanceof TrailHelper) {
			this.trail.init(node);
		}
	};

	update(dt) {
		this._result = [];

		if (this.trail instanceof TrailHelper) {
			this._result = this.trail.update(dt);
		}
		
		return this._result;
	};

	exportData = CC_EDITOR && function() {
		const data = {
			_isActive: this._isActive,
			_trailType: this._trailType,
			trail: null,
		};

		if (this.trail !== null) data.trail = this.trail.exportData();

		return data;
	};
};

if (CC_EDITOR) {
	LocalPointTrailHelper.template = [
		{ name: 'delta', type: 'number', default: 10, },
		{ name: 'count', type: 'number', default: 1, },
		{ name: 'point', type: 'object', view: cc.Vec2, },
	];

	LocalTargetTrailHelper.template = [
		{ name: 'delta', type: 'number', default: 10, },
		{ name: 'count', type: 'number', default: 1, },

		{ name: 'target', type: 'object', view: null, },
	];

	WorldPointTrailHelper.template = [
		{ name: 'delta', type: 'number', default: 10, },
		{ name: 'count', type: 'number', default: 1, },
		{ name: 'point', type: 'object', view: cc.Vec2, },
	];

	WorldTargetTrailHelper.template = [
		{ name: 'delta', type: 'number', default: 10, },
		{ name: 'count', type: 'number', default: 1, },

		{ name: 'target', type: 'object', view: null, },
	];

	ParticleTrail.template = [
		{ name: '_isActive', type: 'boolean', default: false, },
		{ name: '_trailType', type: 'number', default: 0, },

		{ name: 'trail', type: 'object', view: [
				null,
				LocalPointTrailHelper,
				LocalTargetTrailHelper,
				WorldPointTrailHelper,
				WorldTargetTrailHelper,
			], 
		},
	];
}

module.exports = ParticleTrail;
