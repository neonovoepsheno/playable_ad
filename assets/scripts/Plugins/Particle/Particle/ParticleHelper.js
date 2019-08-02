import PoolerHelper from 'PoolerHelper';

//#region classes-helpers
//#endregion


cc.Class({
	extends: cc.Component,

	properties: {
		//#region editors fields and properties

		//#endregion


		//#region public fields and properties
		destroyed: { get() { return this._isDestroy; }, visible: false, },
		actived: {
			get() { return this._isActive; },
			set(value) { this._isActive = value; },
			visible: false,
		},
		visible: {
			get() { return this._isVisible; },
			set(value) {
				if (this._isVisible !== value) {
					this._isVisible = value;

					for (let i in this.node._components) {			
						if (this.node._components[i] instanceof cc.RenderComponent) {
							this.node._components[i].setVisible(this._isVisible);
						}
					}

					if (this.node.childrenCount > 0) {
						for (let i in this.node.children) {
							this.node.children[i].active = this._isVisible;
						}
					}
				}
			},
			visible: false,
		},
		//#endregion


		//#region private fields and properties
		_isActive: { default: false, serializable: false, },
		_isVisible: { default: true, serializable: true, },
		_isDestroy: { default: true, serializable: true, },

		_poolerHelper: { default: null, type: PoolerHelper, serializable: true, },
		_spawnPosition: { default() { return new cc.Vec2(0, 0); }, serializable: true, },
		_parent: { default: null, type: cc.Node, serializable: true, },

		_data: { default: null, serializable: true, },

		_age: { default: 0, serializable: true, },

		_tempDeltaX: { default: 0, serializable: true, },
		_tempDeltaY: { default: 0, serializable: true, },
		//#endregion
	},

	//#region life-cycle callbacks
	onLoad() { this._poolerHelper = this.node.getComponent(PoolerHelper); },

	updateParticle(dt) {
		if (this.actived) {
			this._age += dt;

			if (this.data.delay !== 0) {
				if (this._age < this.data.delay) {
					return;
				} else {
					this._age -= this.data.delay;
					this.data.delay = 0;

					this.visible = true;
				}
			}

			const life = Math.min(this._age / this.data.lifetime, 1);

			this.updateTransform(life, dt);
			this.updateColor(life);

			if (life === 1) {
				this._isDestroy = true;
			}
		}
	},

	updateTransform(life, dt) {
		this._tempDeltaX = 0;
		this._tempDeltaY = 0;

		if (this.data.scaleX) {
			this.node.scaleX = this.data.scaleX.initial;

			if (this.data.scaleX.control) {
				this.node.scaleX += this.data.scaleX.control.value * this._getValue(this.data.scaleX.control.curve, life);
			}
		}

		if (this.data.scaleY) {
			this.node.scaleY = this.data.scaleY.initial

			if (this.data.scaleY.control) {
				this.node.scaleY += this.data.scaleY.control.value * this._getValue(this.data.scaleY.control.curve, life);
			}
		}

		if (this.data.rotation) {
			this.node.angle = this.data.rotation.initial;

			if (this.data.rotation.control) {
				this.node.angle += this.data.rotation.control.value * this._getValue(this.data.rotation.control.curve, life);
			}
		}

		if (this.data.velocityX) {
			this._tempDeltaX = this.data.velocityX.initial * dt;

			if (this.data.velocityX.control) {
				this._tempDeltaX += this.data.velocityX.control.value * this._getValue(this.data.velocityX.control.curve, life) * dt;
			}
		}

		if (this.data.velocityY) {
			this._tempDeltaY = this.data.velocityY.initial * dt;

			if (this.data.velocityY.control) {
				this._tempDeltaY += this.data.velocityY.control.value * this._getValue(this.data.velocityY.control.curve, life) * dt;
			}
		}

		if (this.data.velocity) {
			let angle = 0;
			let velocity = 0;

			if (this.data.velocity.angle) {
				angle = this.data.velocity.angle.initial;

				if (this.data.velocity.angle.control) {
					angle += this.data.velocity.angle.control.value * this._getValue(this.data.velocity.angle.control.curve, life);
				}

				angle *= Math.PI / 180;
			}

			if (this.data.velocity.isFasingVelocity) {
				angle = this.node.angle;
				angle *= Math.PI / 180;
			}

			if (this.data.velocity.isRadialVelocity) {
				if (this.data.velocity.target) {
					const point = this.data.velocity.target.point;					

					if (this.data.velocity.target.isLocal) {
						angle = Math.atan2(this.node.y - point.y, this.node.x - point.x);
					} else {
						const worldPosition = this.node.convertToWorldSpaceAR(new cc.Vec2(0, 0));
						angle = Math.atan2(worldPosition.y - point.y, worldPosition.x - point.x);
					}
				}
			}


			if (this.data.velocity.velocity) {
				velocity = this.data.velocity.velocity.initial;

				if (this.data.velocity.velocity.control) {
					velocity += this.data.velocity.velocity.control.value * this._getValue(this.data.velocity.velocity.control.curve, life);
				}
			}

			this._tempDeltaX += velocity * Math.cos(angle) * dt;
			this._tempDeltaY += velocity * Math.sin(angle) * dt;
		}

		this.node.x += this._tempDeltaX;
		this.node.y += this._tempDeltaY;

		if (this.data.isFollowMovement) {
			this.node.angle = Math.atan2(this._tempDeltaY, this._tempDeltaX) * 180 / Math.PI;
		}
	},

	updateColor(life) {
		if (this.data.opacity) {
			this.node.opacity = this.data.opacity.initial;

			if (this.data.opacity.control) {
				this.node.opacity += this.data.opacity.control.value * this._getValue(this.data.opacity.control.curve, life);
			}
		}

		if (this.data.color) {
			this.node.color = this.data.color;
		} else {
			if (this.data.colorCurve) {
				this.node.color = new cc.Color(
					this._getValue(this.data.colorCurve.r, life),
					this._getValue(this.data.colorCurve.g, life),
					this._getValue(this.data.colorCurve.b, life),
				);
			}
		}
	},
	//#endregion


	//#region public methods
	init(data = {}) {
		this._spawnPosition = new cc.Vec2(this.node.x, this.node.y);

		this.data = data;

		this.updateTransform(0, 0);
		this.updateColor(0);

		this._age = 0;
		this.visible = this.data.delay === 0;

		this._isDestroy = false;
		this.actived = true;
	},

	dead() {
		this._isDestroy = false;
		this.actived = false;
		this.visible = false;

		this._poolerHelper.returnToPool();
	},
	//#endregion


	//#region private methods

	_getValue(control, percent) {
		if (!control || percent === undefined) {
			return 1;
		}

		let point = control[0];

		if (point.x === percent) {
			return point.y;
		}

		let index = control.length - 1;

		let last = control[index];

		if (last.x === percent) {
			return last.y;
		}

		index = 0;

		while (point.x <= percent) {
			if (index >= control.length - 1) {
				return point.y;
			}

			point = control[++index];
		}

		let prev = control[index - 1];

		return (prev.y + (percent - prev.x) * (point.y - prev.y) / (point.x - prev.x));
	},
	//#endregion


	//#region event handlers
	//#endregion
});

