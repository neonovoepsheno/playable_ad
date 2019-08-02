import ParticleExtension from 'ParticleExtension'
import ParticleValue from 'ParticleValue'

const SPAWN_POSITION = new cc.Vec2(0, 0);

//#region classes-helpers
const Burst = cc.Class({
	name : 'Burst',

	properties: {
		//#region editors fields and properties
		delay: { default: 0, min: 0, max: 5, },
		count: { default: 1, type: 'Integer', min: 1, step: 1, },
		cycles: { default: 1, type: 'Integer', min: -1, step: 1, }, 
		interval: { default: 0.01, min: 0.01, max: 5, step: 0.01, },
		//#endregion

		//#region public fields and properties
		active: { get() { return this._active; }, visible : false, },
		//#endregion

		//#region private fields and properties
		_active: { default: false, serializable: false, },
		_delay: { default: 0, serializable: false, },
		_age: { default: 0, serializable: false, },
		_leftCycles: { default: 0, serializable: false, },

		_result: { default: [], serializable: false, },
		//#endregion
	},

	exportData: CC_EDITOR && function() {
		const data = {
			delay: this.delay,
			count: this.count,
			cycles: this.cycles,
			interval: this.interval,
		};

		return data;
	},

	ctor(...args) {
		if (typeof args[0] === 'object') {
			this.delay = args[0].delay || 0;
			this.count = args[0].count || 1;
			this.cycles = args[0].cycles || 1;
			this.interval = args[0].interval || 0.01;
		} else {
			this.delay = args[0] || 0;
			this.count = args[1] || 1;
			this.cycles = args[2] || 1;
			this.interval = args[3] || 0.01;
		}
	},

	//#region public methods
	init() {
		this.reset();
	},

	reset() {
		this._active = true;
		this._age = 0;

		this._delay = this.delay;
		this._leftCycles = this.cycles;
	},

	update(dt) {
		this._result = [];

		if (this._active) {
			this._age += dt;

			if (this._delay !== 0) {
				if (this._age >= this._delay) {
					this._age -= this._delay;
					this._delay = 0;
				}
			} else {
				this._calculate();
			}
			

			if (this._leftCycles === 0) {
				this._active = false;
			}
		}

		return this._result;
	},

	calculateDuration() {
		let delay = 0;
		let duration = 0;

		if (this.delay.valueType === ValueType.Value) {
			delay = this.delay.value;
		} else if (this.delay.valueType === ValueType.MinMax) {
			delay = this.delay.max;
		}

		if (this.lifetime.valueType === ValueType.Value) {
			duration = this.lifetime.value;
		} else if (this.lifetime.valueType === ValueType.MinMax) {
			duration = this.lifetime.max;
		}

		return delay + duration;
	},
	//#endregion

	//#region private methods
	_calculate() {
		if (this._age >= this.interval) {
			this._age -= this.interval;

			this._leftCycles -= 1;
			this._result.push({ count: this.count, time: this._age, position: SPAWN_POSITION, angle: 0, });

			if (this._leftCycles !== 0 && this._age > this._delay) {
				this._calculate();
			}
		}
	},
	//#endregion
});
//#endregion


const ParticleEmission = cc.Class({
	name : 'ParticleEmission',
	extends : ParticleExtension,

	properties: {
		//#region editors fields and properties
		_isActive: false,
		isActive: { 
			displayName: "Emission",
			get() { return this._isActive; },
			set(value) {
				if (this._isActive !== value) {
					this._isActive = value;

					if (this._isActive) {
						this.rateOverTime = 1;
					} else {
						this.rateOverTime = 0;
					}

					this.bursts = [];
				}
			},
		},
		rateOverTime: {
			default: 1,
			displayName: "Rate Over Time",
			notify: function() { this._interval = 1 / this.rateOverTime },
			visible() { return this.isActive; }, 
		},
		bursts: {
			default: [],
			displayName: "Burst",
			type: [Burst],
			visible() { return this.isActive; }, 
		},
		//#endregion


		//#region public fields and properties
		//#endregion


		//#region private fields and properties
		_interval: { default: 1, serializable: false, },

		_rateTime: { default: 0, serializable: false, },
		_countActiveBurst: { default: 0, serializable: false, },

		_result: { default: [], serializable: false, },
		//#endregion
	},

	exportData: CC_EDITOR && function() {
		const data = {
			_isActive: this._isActive,
			rateOverTime: this.rateOverTime,
			bursts: [],
		};

		for (let burst of this.bursts) {
			data.bursts.push(burst.exportData());
		}

		return data;
	},

	//#region public methods
	init() {
		this._interval = 1 / this.rateOverTime;

		this._countActiveBurst = this.bursts.length;

		for (let i in this.bursts) {
			this.bursts[i].init();
		}
	},

	reset() {
		this._rateTime = 0;
		this._countActiveBurst = this.bursts.length;

		for (let i in this.bursts) {
			this.bursts[i].reset();
		}
	},

	update(dt) {
		this._result = [];

		this._rateTime += dt;
		this._calculate();

		if (this._countActiveBurst !== 0) {
			this._countActiveBurst = 0;

			for (let burst of this.bursts) {
				if (burst.active) {
					this._countActiveBurst += 1;

					const result = burst.update(dt);

					if (result.length !== 0) {
						this._result = [...this._result, ...result];
					}
				}
			}
		}

		return this._result;
	},
	//#endregion


	//#region private methods
	_calculate() {
		if (this._rateTime >= this._interval) {
			this._rateTime -= this._interval;

			this._result.push({ count: 1, time: this._rateTime, position: SPAWN_POSITION, angle: 0, });

			if (this._rateTime >= this._interval) {
				this._calculate();
			}
		}
	},
	//#endregion


	//#region event handlers
	//#endregion
});

if (CC_EDITOR) {
	ParticleEmission.template = [
		{ name: '_isActive', type: 'boolean', default: false, },
		{ name: 'rateOverTime', type: 'number', default: 1, },

		{ name: 'bursts', type: 'object', view: Array, filler: Burst, },
	];


	Burst.template = [
		{ name: 'delay', type: 'number', default: 0, },
		{ name: 'count', type: 'number', default: 1, },
		{ name: 'cycles', type: 'number', default: 1, },
		{ name: 'interval', type: 'number', default: 1, },
	];
}

module.exports = ParticleEmission;
