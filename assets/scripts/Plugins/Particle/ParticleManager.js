import ParticleEmitter from 'ParticleEmitter';
import Events from 'Events';

cc.Class({
	extends: cc.Component,

	properties: {
		playOnLoad : false,

		_timeScale : {
			default : 1,
			visible : false,
		},

		emitters : {
			default : [],
			visible : false,
		},

		timeScale :	{
			get: function () {
				return this._timeScale;
			},
			set: function (value) {
				this._timeScale = value;

				for (let i = 0; i < this.emitters.length; i += 1) {
					this.emitters[i].life.timeScale = this._timeScale;
				}	 
			}
		},

		_isAlive: false,
		_lifeTime: 0,
		_duration: 1,
	},

	onLoad() {
		this.emitters = [];
		const children = this.node.children;
		for (let i in children) {
			const emitter = children[i].getComponent("ParticleEmitter");
			if (emitter) {
				this.emitters.push(emitter);
			}
		}

		let durationArray = [];

		for (let i of this.emitters) {
			durationArray.push(i.calculateDuration());
		}

		this._duration = Math.max(...durationArray);
		this._duration += .2;
	},

	start() {
		this.timeScale = this.timeScale;

		if (this.playOnLoad) {
			setTimeout(() => {
				this.play();
			}, 100);
		}
	},

	update(dt) {
		if (this._isAlive) {
			this._lifeTime += dt * this.timeScale;

			if (this._lifeTime > this._duration) {
				this._isAlive = false;
				typeof this.callback === 'function' && this.callback();
				// cc.systemEvent.emit(Events.RETURN_EFFECT_TO_POOL, this.node);
			}
		}
	},

	play() {
		for (let i = 0; i < this.emitters.length; i++) {
			if (this.emitters[i] instanceof ParticleEmitter) {
				this._isAlive = true;
				this.emitters[i].play();
			} else {
				this.emitters.splice(i, 1);
				i --;
			}	
		}
	},

	pause(value = true) {
		for (let i = 0; i < this.emitters.length; i++) {
			if (this.emitters[i] instanceof ParticleEmitter) {
				this.emitters[i].pause(value);
			} else {
				this.emitters.splice(i, 1);
				i --;
			}
			
		}
	},

	restart() {
		for (let i = 0; i < this.emitters.length; i++) {
			if (this.emitters[i] instanceof ParticleEmitter) {
				this.emitters[i].restart();
			} else {
				this.emitters.splice(i, 1);
				i --;
			}
			
		}
	},

	stop() {
		for (let i = 0; i < this.emitters.length; i++) {
			if (this.emitters[i] instanceof ParticleEmitter) {
				this.emitters[i].stop();
			} else {
				this.emitters.splice(i, 1);
				i --;
			}
			
		}
	},
});



















