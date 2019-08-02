import ParticleExtension from 'ParticleExtension'

//#region classes-helpers
const ShapeType = cc.Enum({
	Point: 0,
	Circle: 10,
	Donut: 20,
	Rectangle: 30,
	Edge: 40,
	Vector: 50,
});

const ShapeHelper = cc.Class({
	name: 'ShapeHelper',
	extends: ParticleExtension,

	properties: { position: new cc.Vec2(0, 0), },

	exportData() {
		const data = {
			view: 'ShapeHelper',
			position: this.position,
		};
		
		return data;
	},

	getSpawnPosition(position = new cc.Vec2(0, 0)) {
		let x = this.position.x + position.x;
		let y = this.position.y + position.y;

		return new cc.Vec2(x, y);
	},
});

const ExtendedShapeHelper = cc.Class({
	name: 'ExtendedShapeHelper',
	extends: ShapeHelper,

	properties: {
		rotation: { default: 0, min: 0, max: 360, },
		scale: new cc.Vec2(1, 1),
	},
});

const RectangleShapeHelper = cc.Class({
	name: 'RectangleShapeHelper',
	extends: ExtendedShapeHelper,

	properties: {
		anchor: new cc.Vec2(.5, .5),
		size: new cc.Size(100, 100),
	},

	exportData() {
		const data = {
			view: 'RectangleShapeHelper',

			position: this.position,
			rotation: this.rotation,

			scale: this.scale,
			anchor: this.anchor,
			size: this.size,
		};
		
		return data;
	},


	getSpawnPosition(position = new cc.Vec2(0, 0), angle = 0) {
		let x = this.position.x + position.x;
		let y = this.position.y + position.y;

		const w = this.size.width * (Math.random() - this.anchor.x);
		const h = this.size.height * (Math.random() - this.anchor.y);

		const angleRadian = 0.01749 * (this.rotation + angle);

		const sin = Math.sin(angleRadian);
		const cos = Math.cos(angleRadian);

		x += (w * cos - h * sin) * this.scale.x;
		y += (w * sin + h * cos) * this.scale.y;

		return new cc.Vec2(x, y);
	},
});

const VectorShapeHelper = cc.Class({
	name: 'VectorShapeHelper',
	extends: ExtendedShapeHelper,

	properties: { radius: { default: 100, min: 0, }, },

	exportData() {
		const data = {
			view: 'VectorShapeHelper',

			position: this.position,
			rotation: this.rotation,
			
			radius: this.radius,
		};
		
		return data;
	},

	getSpawnPosition(position = new cc.Vec2(0, 0), angle = 0) {
		let x = this.position.x + position.x;
		let y = this.position.y + position.y;

		const radius = this.radius * Math.random();
		const angleRadian = 0.01749 * (this.rotation + angle);
		
		x += radius * Math.cos(angleRadian) * this.scale.x;
		y += radius * Math.sin(angleRadian) * this.scale.y;

		return new cc.Vec2(x, y);
	},
});

const EdgeShapeHelper = cc.Class({
	name: 'EdgeShapeHelper',
	extends: VectorShapeHelper,

	exportData() {
		const data = {
			view: 'EdgeShapeHelper',

			position: this.position,
			rotation: this.rotation,
			
			radius: this.radius,
		};
		
		return data;
	},

	getSpawnPosition(position = new cc.Vec2(0, 0), angle = 0) {
		let x = this.position.x + position.x;
		let y = this.position.y + position.y;

		const radius = this.radius * (Math.random() - .5);
		const angleRadian = 0.01749 * (this.rotation + angle);
		
		x += radius * Math.cos(angleRadian) * this.scale.x;
		y += radius * Math.sin(angleRadian) * this.scale.y;

		return new cc.Vec2(x, y);
	},
});

const CircleShapeHelper = cc.Class({
	name: 'CircleShapeHelper',
	extends: VectorShapeHelper,

	properties: { 
		thickness: { default: 1, min: 0, max: 1, },
		arc: { default: 360, min: 0, max: 360, },
	},

	exportData() {
		const data = {
			view: 'CircleShapeHelper',

			position: this.position,
			rotation: this.rotation,
			
			radius: this.radius,
			thickness: this.thickness,
			arc: this.arc,
		};
		
		return data;
	},

	getSpawnPosition(position = new cc.Vec2(0, 0), angle = 0) {
		let x = this.position.x + position.x;
		let y = this.position.y + position.y;

		const delta = this.thickness * this.radius * Math.random();
		const radius = this.radius * (1 - this.thickness) + delta;
		const angleRadian = 0.01749 * (this.arc * Math.random() + this.rotation + angle);

		x += radius * Math.cos(angleRadian) * this.scale.x;
		y += radius * Math.sin(angleRadian) * this.scale.y;

		return new cc.Vec2(x, y);
	},
});

const DonutShapeHelper = cc.Class({
	name: 'DonutShapeHelper',
	extends: VectorShapeHelper,

	properties: { 
		donutRadius: { default: 50, },
		arc: { default: 360, min: 0, max: 360, },
	},

	exportData() {
		const data = {
			view: 'DonutShapeHelper',

			position: this.position,
			rotation: this.rotation,
			
			radius: this.radius,
			donutRadius: this.donutRadius,
			arc: this.arc,
		};
		
		return data;
	},

	getSpawnPosition(position = new cc.Vec2(0, 0), angle = 0) {
		let x = this.position.x + position.x;
		let y = this.position.y + position.y;

		const delta = (2 * Math.random() - 1) * this.donutRadius;
		const radius = this.radius + delta;
		const angleRadian = 0.01749 * (this.arc * Math.random() + this.rotation + angle);

		x += radius * Math.cos(angleRadian) * this.scale.x;
		y += radius * Math.sin(angleRadian) * this.scale.y;

		return new cc.Vec2(x, y);
	},
});
//#endregion


const ParticleShape = cc.Class({
	name: 'ParticleShape',
	extends: ParticleExtension,
	
	properties: {
		//#region editors fields and properties

		isActive: {
			displayName: "Shaping",
			get() { return this._isActive; },
			set(value) {
				this._isActive = value;
				this.shapeType = ShapeType.Point;
			},
		},

		shapeType: {
			type: ShapeType,
			visible() { return this._isActive; },

			get() { return this._shapeType; },
			set(value) {
				if (this._shapeType !== value) {
					this._shapeType = value
					const oldShape = this.shape;

					switch(this._shapeType) {
						case ShapeType.Vector: {
							this.shape = new VectorShapeHelper();
							this.checkTemplate(new VectorShapeHelper(), oldShape, this.shape);
						} break;

						case ShapeType.Edge: {
							this.shape = new EdgeShapeHelper();
							this.checkTemplate(new EdgeShapeHelper(), oldShape, this.shape);
						} break;

						case ShapeType.Circle: {
							this.shape = new CircleShapeHelper();
							this.checkTemplate(new CircleShapeHelper(), oldShape, this.shape);
						} break;

						case ShapeType.Donut: {
							this.shape = new DonutShapeHelper();
							this.checkTemplate(new DonutShapeHelper(), oldShape, this.shape);
						} break;

						case ShapeType.Rectangle: {
							this.shape = new RectangleShapeHelper();
							this.checkTemplate(new RectangleShapeHelper(), oldShape, this.shape);
						} break;

						default: {
							this.shape = new ShapeHelper();
						} break;
					}
				}
			},
		},

		shape: { default() { return new ShapeHelper(); }, type: ShapeHelper, visible() { return this._isActive; }, },
		//#endregion

		//#region private fields and properties
		_isActive: false,
		_shapeType: { default: ShapeType.Point, type: ShapeType, },
		//#endregion
	},

	exportData() {
		const data = {
			_isActive: this._isActive,
			_shapeType: this._shapeType,

			shape: this.shape.exportData(),
		};

		return data;
	},

	//#region life-cycle callbacks
	//#endregion


	//#region public methods
	getPosition(position, angle) {
		return this.shape.getSpawnPosition(position, angle);
	},
	//#endregion
});

if (CC_EDITOR) {
	ParticleShape.template = [
		{ name: '_isActive', type: 'boolean', default: false, },
		{ name: '_shapeType', type: 'number', default: 0, },
		{ name: 'shape', type: 'object', view: [
			ShapeHelper, 
			CircleShapeHelper, 
			DonutShapeHelper, 
			RectangleShapeHelper, 
			VectorShapeHelper, 
			EdgeShapeHelper
		], },
	];

	ShapeHelper.template = [
		{ name: 'position', type: 'object', view: cc.Vec2, },
	];

	RectangleShapeHelper.template = [
		{ name: 'position', type: 'object', view: cc.Vec2, },
		{ name: 'rotation', type: 'number', default: 0, },
		{ name: 'scale', type: 'object', view: cc.Vec2, },

		{ name: 'anchor', type: 'object', view: cc.Vec2, },
		{ name: 'size', type: 'object', view: cc.Size, },
	];

	VectorShapeHelper.template = [
		{ name: 'position', type: 'object', view: cc.Vec2, },
		{ name: 'rotation', type: 'number', default: 0, },
		{ name: 'scale', type: 'object', view: cc.Vec2, },

		{ name: 'radius', type: 'number', view: 100, },
	];

	EdgeShapeHelper.template = [
		{ name: 'position', type: 'object', view: cc.Vec2, },
		{ name: 'rotation', type: 'number', default: 0, },
		{ name: 'scale', type: 'object', view: cc.Vec2, },

		{ name: 'radius', type: 'number', view: 100, },
	];

	CircleShapeHelper.template = [
		{ name: 'position', type: 'object', view: cc.Vec2, },
		{ name: 'rotation', type: 'number', default: 0, },
		{ name: 'scale', type: 'object', view: cc.Vec2, },

		{ name: 'radius', type: 'number', view: 100, },
		{ name: 'thickness', type: 'number', view: 1, },
		{ name: 'arc', type: 'number', view: 360, },
	];

	DonutShapeHelper.template = [
		{ name: 'position', type: 'object', view: cc.Vec2, },
		{ name: 'rotation', type: 'number', default: 0, },
		{ name: 'scale', type: 'object', view: cc.Vec2, },

		{ name: 'radius', type: 'number', view: 100, },
		{ name: 'donutRadius', type: 'number', view: 50, },
		{ name: 'arc', type: 'number', view: 360, },
	];
}

module.exports = ParticleShape;
