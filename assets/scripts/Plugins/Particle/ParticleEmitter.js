import PoolObject from 'PoolObject'

import ParticleValue from 'ParticleValue'

import ParticleLife from 'ParticleLife'
import ParticleRender from 'ParticleRender'
import ParticleEmission from 'ParticleEmission'
import ParticleTrail from 'ParticleTrail'
import ParticleShape from 'ParticleShape'

import ParticleVelocity from 'ParticleVelocity'
import ParticleRotation from 'ParticleRotation'

import ParticleSize from 'ParticleSize'

import ParticleOpacity from 'ParticleOpacity'
import ParticleColor from 'ParticleColor'

//#region classes-helpers
const EditingType = cc.Enum({
	None: 0,
	Extension: 5,
	All: 10,
});
const ExtensionType = cc.Enum({
	None: 0,
	Life: 10,
	Render: 20,
	Emission: 30,
	Trail: 40,
	Shape: 50,
	Velocity: 60,
	Rotation: 70,
	Size: 80,
	Opacity: 90,
	Color: 100,

	Exchange: 1000,
});
//#endregion


const ParticleEmitter = cc.Class({
	extends: cc.Component,

	properties: {
		//#region editors fields and properties

		editingType: {
			default: EditingType.None,
			type: EditingType,
			editorOnly: true,
			notify(old) {
				if (old === EditingType.Extension) {
					this.editingExtension = ExtensionType.None;
				} else {
					if (this.editingType === EditingType.Extension) {
						this.editingExtension = ExtensionType.Life;
					}
				}
			},
		},

		editingExtension: {
			default: ExtensionType.None,
			type: ExtensionType,
			editorOnly: true,
			visible() { return this.editingType === EditingType.Extension; },
		},
		
		life: { default() { return new ParticleLife(); }, type: ParticleLife, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Life; }, },
		render: { default() { return new ParticleRender(); }, type: ParticleRender, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Render; }, },
		emission: { default() { return new ParticleEmission(); }, type: ParticleEmission, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Emission; }, },
		trail: { default() { return new ParticleTrail(); }, type: ParticleTrail, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Trail; }, },
		shape: { default() { return new ParticleShape(); }, type: ParticleShape, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Shape; }, },
		velocity: { default() { return new ParticleVelocity(); }, type: ParticleVelocity, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Velocity; }, },
		rotation: { default() { return new ParticleRotation(); }, type: ParticleRotation, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Rotation; }, },
		size: { default() { return new ParticleSize(); }, type: ParticleSize, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Size; }, },
		opacity: { default() { return new ParticleOpacity(); }, type: ParticleOpacity, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Opacity; }, },
		color: { default() { return new ParticleColor(); }, type: ParticleColor, visible() { return this.editingType === EditingType.All || this.editingExtension === ExtensionType.Color; }, },
		

		file: { default: null, type: cc.JsonAsset, editorOnly: true, visible() { return this.editingExtension === ExtensionType.Exchange; }, },
		SUNC: {
			get() { return false; },
			set (value) { 
				if (value) {
					const data = this.file.json;

					this.life.importData(data.life);
					this.render.importData(data.render);
					this.shape.importData(data.shape);

					this.emission.importData(data.emission);
					this.trail.importData(data.trail);

					this.size.importData(data.size);
					
					this.velocity.importData(data.velocity);
					this.rotation.importData(data.rotation);

					this.opacity.importData(data.opacity);
					this.color.importData(data.color);
				}
			},
			visible() { return this.editingExtension === ExtensionType.Exchange && this.file instanceof cc.JsonAsset;; },
		},

		EXPORT: {
			get() { return false; },
			set(value) {
				if (value) {
					let exportJSON = {
						life: this.life.exportData(),
						render: this.render.exportData(),
						shape: this.shape.exportData(),

						emission: this.emission.exportData(),
						trail: this.trail.exportData(),

						size: this.size.exportData(),
						
						velocity: this.velocity.exportData(),
						rotation: this.rotation.exportData(),

						opacity: this.opacity.exportData(),
						color: this.color.exportData(),
					};

					let content = JSON.stringify(exportJSON);
					let downloadElement = document.createElement("a");
					let file = new Blob([content], {type : 'application/json'});
					downloadElement.href = URL.createObjectURL(file);

					const name = 'Export' + this.node.name + '.json';
					downloadElement.download = name;
					downloadElement.click();
				}
			},
			visible() { return this.editingExtension === ExtensionType.Exchange; },
		},
		//#endregion


		//#region public fields and properties
		//#endregion


		//#region private fields and properties
		_pool: { default: null, type: PoolObject, serializable: false, },
		_liveParticles: { default: [], serializable: false, },

		_isActive: { default: false, serializable: false, },
		_isPause: { default: false, serializable: false, },
		

		_age: { default: 0, serializable: false, },
		_zIndex: { default: 0, serializable: false, },
		//#endregion
	},

	//#region life-cycle callbacks
	onLoad() {	
		this._init();
		this._createPool();
	},

	start() {
		if (this.life.isPlayOnLoad) {
			this.scheduleOnce(() => {
				this.play();
			},0)
		}
	},

	update(dt) {
		const deltaTime = dt * this.life.timeScale;

		if (this._isActive && !this._isPause) {
			this._age += deltaTime;
		
			const emissionSpawn = this.emission.update(deltaTime);
			for (let data of emissionSpawn) {
				for (let i = 0; i < data.count; i++) {
					this.emit(data.time, data.position, data.angle);
				}
			}

			const trailSpawn = this.trail.update(deltaTime);
			for (let data of trailSpawn) {
				for (let i = 0; i < data.count; i++) {
					this.emit(data.time, data.position, data.angle);
				}
			}

			if (this._age >= this.life.duration) {
				if (this.life.isLoop) {
					this._age -= this.life.duration;

					this.emission.reset();
				} else {
					this._isActive = false;
				}
			}
		}

		for (let i = 0; i < this._liveParticles.length; i += 1) {
			if (this._liveParticles[i].destroyed) {
				this._liveParticles[i].dead();
				this._liveParticles.splice(i, 1);
			} else {
				this._liveParticles[i].updateParticle(deltaTime);
			}
		}
	},
	//#endregion


	//#region public methods
	play() {
		if (this._isActive && this._isPause) {
			this.pause(false)
		} else {
			this._isPause = false;
			this._isActive = true;

			this._age = 0;
			this._zIndex = 0;
			this.emission.reset();

			if (this.life.isLoop && this.life.isPrewarm) {
				const step = 1 / 60;
				for (let i = 0; i < this.life.duration; i += step) {
					this.update(step);
				}
			}
		}
	},
	pause(value = true) {
		if (this._isPause !== value) {
			this._isPause = value;
		}
	},
	stop() {
		this._isActive = false;
		this._isPause = false;

		for (let i = 0; i < this._liveParticles.length; i++) {
			this._liveParticles[i].dead();
		}

		this._liveParticles = [];
	},
	restart() {
		this.stop();
		this.play();
	},

	emit(time = 0, position = new cc.Vec2(0, 0), angle = 0) {
		// cc.log(time, position, angle);
		const particle = this._pool.pop();

		if (particle !== null) {
			this._zIndex += 1;
			particle.zIndex = this._zIndex;
			
			let particleHelper = particle.getComponent("ParticleHelper");

			const worldEmitPosition = this.node.convertToWorldSpaceAR(this.shape.getPosition(position, angle));
			const localParticlePosition = (particle.getParent()).convertToNodeSpaceAR(worldEmitPosition);
			
			particle.setPosition(localParticlePosition);


			const data = this.getSpawnData(position, angle);
			particleHelper.init(data);

			if (time !== 0) {
				particleHelper.updateParticle(time);
			}

			this._liveParticles.push(particleHelper);
		}
	},

	getSpawnData(position, angle) {
		const data	= {};

		const dataLife = this.life.data;
		for (let i in dataLife) {
			data[i] = dataLife[i];
		}

		const dataRotation = this.rotation.data;
		for (let i in dataRotation) {
			data[i] = dataRotation[i];
		}

		const dataVelocity = this.velocity.data;
		for (let i in dataVelocity) {
			data[i] = dataVelocity[i];
		}

		const dataSize = this.size.data;
		for (let i in dataSize) {
			data[i] = dataSize[i];
		}

		const dataColor = this.color.data;
		for (let i in dataColor) {
			data[i] = dataColor[i];
		}

		const dataOpacity = this.opacity.data;
		for (let i in dataOpacity) {
			data[i] = dataOpacity[i];
		}

		if (data.rotation) {
			data.rotation.initial += angle;
		} else {
			data.rotation = {
				initial: angle,
				control: null,
			}
		}

		if (data.velocity) {
			if (data.velocity.angle) {
				data.velocity.angle.initial += angle;
			}

			if (data.velocity.isRadialVelocity) {
				if (data.velocity.target === null) {
					data.velocity.target = {
						isLocal: false,
						point: this.node.convertToWorldSpaceAR(position),
					};
				}
			}
		}

		return data;
	},

	calculateDuration() {
		let delay = 0;
		let duration = 0;

		if (this.life.delay._valueType === 0) {
			delay = this.life.delay.value;
		} else if (this.life.delay._valueType === 1) {
			delay = this.life.delay.max;
		}

		if (this.life.lifetime._valueType === 0) {
			duration = this.life.lifetime.value;
		} else if (this.life.lifetime._valueType === 1) {
			duration = this.life.lifetime.max;
		}

		return delay + duration * 2;
	},
	
	//#endregion


	//#region private methods
	_init() {
		this.life.init();
		this.render.init();

		this.emission.init();
		this.trail.init(this.node);

		this.color.init();
	},

	_createPool() {
		const count = this.render.maxParticles;
		const parent = this.render.getParent();
		const prefab = this.render.getPrefab();

		if (prefab.data.getComponent("ParticleHelper") === null) {
			prefab.data.addComponent("ParticleHelper");
		}

		this._pool = this.node.addComponent(PoolObject);	

		this._pool.parent = parent instanceof cc.Node ? parent : cc.director.getScene();
		this._pool.prefab = prefab;
		this._pool.autoExtend = false;
		this._pool.preInstantiateCount = count;
	},

	//#endregion


	//#region event handlers
	//#endregion
});

module.exports = ParticleEmitter;