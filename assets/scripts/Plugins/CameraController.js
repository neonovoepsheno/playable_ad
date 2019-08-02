import Events from 'Events';
import Settings from 'Settings';

let ShakeData = cc.Class({
	name: 'ShakeData',

	properties: {
		//#region editors fields and properties

		amplitude: {
			default: 30,
			visible: true,
		},

		duration: {
			default: .4,
			visible: true,
		},

		curve: {
			default: [],
			type: cc.Vec2,
			visible: true,
		},

		//#endregion

		_currentAmplitude: 0,
	},
});

cc.Class({
	extends: cc.Component,

	properties: {
		settings: { default() { return new Settings(); }, type: Settings, visible: false },

		camera: { default: null, type: cc.Camera },
		target: { default: null, type: cc.Node },

		focus: cc.v2(0.5, 0.5),
		isFollow: true,

		defaultCaptureBox: cc.Node,

		shakeInfo: {
			default: [],
			type: ShakeData,
		},

		_currentShakeData: null,
		_isShaking: false,

		_currentVelocity: cc.v2(0, 0),

		_nowSizeCamera: {
			get() {
				if (this.settings === undefined || this.settings === null
					|| this.camera === undefined || this.camera === null) {
					return null;
				}

				return {
					width: this.settings.GAME_WIDTH / this.camera.zoomRatio,
					height: this.settings.GAME_HEIGHT / this.camera.zoomRatio,
				};
			},
			visible: false,
		},

		_bottomLeftDotCamera: {
			get() {
				if (this.settings === undefined || this.settings === null
					|| this.camera === undefined || this.camera === null) {
					return null;
				}

				const scaleOffset = {
					x: (-(this.settings.GAME_WIDTH - this._nowSizeCamera.width) * .5),
					y: (-(this.settings.GAME_HEIGHT - this._nowSizeCamera.height) * .5),
				};

				return {
					x: this.node.x - scaleOffset.x,
					y: this.node.y - scaleOffset.y,
				};
			},
			visible: false,
		},
	},

	onLoad() {
		if (!this.camera) {
			this.camera = this.node.getComponent(cc.Camera);
		}

		cc.systemEvent.on(Events.SIZE_CHANGE, this.onSizeChange, this);
		cc.systemEvent.on(Events.ADD_CAMERA_SHAKE, this.onCameraShake, this);
	},

	update(dt) {
		if (this.isFollow && this.target) {
			const targetWorldPosition = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);

			const offset = new cc.Vec2(this.target.width * this.target.scaleX * (this.focus.x - this.target.anchorX),
				this.target.height * this.target.scaleY * (this.focus.y - this.target.anchorY));

			const cameraWorldPosition = targetWorldPosition.add(offset);

			const cameraParent = this.node.getParent();
			const cameraLocalPosition = cameraParent instanceof cc.Node ? cameraParent.convertToNodeSpaceAR(cameraWorldPosition) : cameraWorldPosition.clone();

			this.node.x = cameraLocalPosition.x;
			this.node.y = cameraLocalPosition.y;
		}

		if (this._isShaking) {
			this._shakeUpdate(dt);
		}
	},

	onSizeChange() {
		this.camera.width = this.settings.GAME_WIDTH;
		this.camera.height = this.settings.GAME_HEIGHT;

		this._captureTarget();
	},

	getPositionFromView(xRelPos, yRelPos) {
		return {
			x: this._bottomLeftDotCamera.x + xRelPos * this._nowSizeCamera.width,
			y: this._bottomLeftDotCamera.y + yRelPos * this._nowSizeCamera.height,
		};
	},

	getViewPositionFromWorld(xPos, yPos) {
		return {
			x: (xPos - this._bottomLeftDotCamera.x) / this._nowSizeCamera.width,
			y: (yPos - this._bottomLeftDotCamera.y) / this._nowSizeCamera.height,
		};
	},

	_shakeUpdate(dt) {
		if (this._currentShakeData === null) {
			return;
		}
		const type = this._currentShakeData.type;

		let timeRatio = this._currentShakeData.shakeTime % this.shakeInfo[type].duration / this.shakeInfo[type].duration;

		if (timeRatio === 1) {
			return;
		}

		const curveValue = this._evaluateCurve(this.shakeInfo[type].curve, timeRatio);

		let currentShakeSlide = this.shakeInfo[type]._currentAmplitude * curveValue;
		let newPos = currentShakeSlide - this._currentShakeData.previousShakeSlide;

		this._currentShakeData.cashback += newPos;

		if (this._currentShakeData.cashback >= 1) {
			this.node.x = this.node.x + Math.floor(this._currentShakeData.cashback);
			this.node.y = this.node.y + Math.floor(this._currentShakeData.cashback);
			this._currentShakeData.cashback -= Math.floor(this._currentShakeData.cashback);
		} else if (this._currentShakeData.cashback <= -1) {
			this.node.x = this.node.x + Math.ceil(this._currentShakeData.cashback);
			this.node.y = this.node.y + Math.ceil(this._currentShakeData.cashback);
			this._currentShakeData.cashback -= Math.ceil(this._currentShakeData.cashback);
		}

		this._currentShakeData.previousShakeSlide = currentShakeSlide;

		this._currentShakeData.shakeTime += dt;

		if (this._currentShakeData.shakeTime > this._currentShakeData.shakeDuration) {
			this._isShaking = false;
			this._currentShakeData = null;
		}
	},

	_evaluateCurve(curve, time) {
		let prevFrame;
		let nextFrame;

		for (let i in curve) {
			if (time >= curve[i].x) {
				prevFrame = i;
			} else if (time <= curve[i].x) {
				nextFrame = i;
				break;
			}
		}

		let t = (time - curve[prevFrame].x) / (curve[nextFrame].x - curve[prevFrame].x);


		let x1 = curve[prevFrame].x;
		let x2 = curve[nextFrame].x;
		let p1 = curve[prevFrame].y;
		let p2 = curve[nextFrame].y;
		let m1 = 0;
		let m2 = 0;

		let h00 = 2 * t * t * t - 3 * t * t + 1;
		let h10 = t * t * t - 2 * t * t + t;
		let h01 = -2 * t * t * t + 3 * t * t;
		let h11 = t * t * t - t * t;

		let result = h00 * p1 + h10 * (x2 - x1) * m1 + h01 * p2 + h11 * (x2 - x1) * m2;

		return result;
	},

	_setCameraZoomRatio(zoomRatio) {
		this.camera.zoomRatio = zoomRatio;

		this.camera.width = this.settings.GAME_WIDTH / zoomRatio;
		this.camera.height = this.settings.GAME_HEIGHT / zoomRatio;
	},

	_captureTarget(newBoxes) {
		let zoomRatio = 1;

		if (newBoxes) {
			this.setNewBoxes(newBoxes);
		}

		if (this.defaultCaptureBox) {
			const tw = this.defaultCaptureBox.width;
			const th = this.defaultCaptureBox.height;
			const gw = this.settings.GAME_WIDTH;
			const gh = this.settings.GAME_HEIGHT;

			const zX = gw / tw;
			const zY = gh / th;

			zoomRatio = zX < zY ? zX : zY;

			this.target = this.defaultCaptureBox;
		}

		this._setCameraZoomRatio(zoomRatio);
	},

	onCameraShake(type = 0, duration, amplitudeMultiplier = 1) {
		if (!this.shakeInfo[type]) {
			return;
		}
		
		const defaultAmplitude = this.shakeInfo[type].amplitude;
		this._isShaking = true;
		
		this._currentShakeData = {};
		this._currentShakeData.shakeTime = 0;
		this._currentShakeData.cashback = 0;
		this._currentShakeData.type = type;
		this._currentShakeData.previousShakeSlide = 0;

		if (!duration) {
			duration = this.shakeInfo[type].duration;
		}

		this.shakeInfo[type]._currentAmplitude = defaultAmplitude * amplitudeMultiplier;

		this._currentShakeData.shakeDuration = duration;
	},
});
