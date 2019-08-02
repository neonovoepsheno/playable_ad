import ParticleExtension from 'ParticleExtension'
import ParticleSpriteRandomHelper from 'ParticleSpriteRandomHelper'

//#region classes-helpers
const RenderType = cc.Enum({
	Sprite: 0,
	Prefab: 10,
});

const BlendType = cc.Enum({
	Normal : 0,
	Additive: 2,
});

const RenderHelper = cc.Class({
	name : 'RenderHelper',
	extends : ParticleExtension,

	getPrefab() {
		const prefab = new cc.Prefab();
		const node = new cc.Node();

		prefab._name = 'Prefab';
		node._name = 'Prefab';
		node._prefab = prefab;

		prefab.data = node;
		return prefab;
	},
});

const PrefabRenderHelper = cc.Class({
	name : 'PrefabRenderHelper',
	extends : RenderHelper,

	properties : {
		prefab : { default : null, type : cc.Prefab, },
	},

	exportData: CC_EDITOR && function() {
		return {
			view: 'PrefabRenderHelper',
		};
	},

	getPrefab() {
		if (this.prefab === null) {
			return this._super();
		} else {
			return this.prefab;
		}
	},
});

const SpriteRenderHelper = cc.Class({
	name : 'SpriteRenderHelper',
	extends : RenderHelper,

	properties : {
		blend : { default : BlendType.Normal, type : BlendType, },
		spriteFrames : { default : [], type : [cc.SpriteFrame], },	
	},

	exportData: CC_EDITOR && function() {
		const data = {
			view: 'SpriteRenderHelper',
			blend: this.blend,
		};

		return data;
	},

	getPrefab() {
		const prefab = this._super();
		const node = prefab.data;

		const sprite = node.addComponent(cc.Sprite);

		if (this.spriteFrames.length === 1) {
			sprite.spriteFrame = this.spriteFrames[0];
		} else {
			if (this.spriteFrames.length > 1) {
				const spriteRandomHelper = node.addComponent(ParticleSpriteRandomHelper);
				spriteRandomHelper.spriteFrames = this.spriteFrames;
			}
		}

		switch(this.blend) {
			case BlendType.Additive : {
				sprite.srcBlendFactor = cc.macro.BlendFactor.SRC_ALPHA;
				sprite.dstBlendFactor = cc.macro.BlendFactor.ONE;
			} break;

			default : {
				sprite.srcBlendFactor = cc.macro.BlendFactor.SRC_ALPHA;
				sprite.dstBlendFactor = cc.macro.BlendFactor.ONE_MINUS_SRC_ALPHA;
			} break;
		}

		return prefab;
	},
});
//#endregion


const ParticleRender = cc.Class({
	name : 'ParticleRender',
	extends : ParticleExtension,

	properties: {
		//#region editors fields and properties
		maxParticles : { default : 20, min : 1, max : 1000, type : cc.Integer, },
		parent : { default : null, type : cc.Node, },

		_renderType: { default: RenderType.Sprite, type : RenderType, },
		renderType : {
			type : RenderType,
			get() { return this._renderType; },
			set(value) {
				if (this._renderType !== value) {
					this._renderType = value;

					switch(this._renderType) {
						case RenderType.Sprite : 
							this.render = new SpriteRenderHelper();
						break;

						case RenderType.Prefab : 
							this.render = new PrefabRenderHelper();
						break;

						default : 
							this.render = new SpriteRenderHelper();
						break;
					}
				}
			},
		},

		render : { default() { return new SpriteRenderHelper(); }, type : RenderHelper, visible() { return this.renderType !== RenderType.None; }, },
		//#endregion


		//#region public fields and properties
		//#endregion


		//#region private fields and properties
		_prefab : { default : null, type : cc.Prefab, serializable : false, },
		//#endregion
	},

	exportData: CC_EDITOR && function() {
		const data = {
			maxParticles: this.maxParticles,
			_renderType: this._renderType,
			render: this.render.exportData(),
		};

		return data;
	},

	//#region public methods
	init() {
		this._prefab = this.render.getPrefab();
	},

	getPrefab() {
		return this._prefab;
	},

	getParent() {
		return this.parent;
	},
	//#endregion


	//#region private methods
	//#endregion


	//#region event handlers
	//#endregion
});

if (CC_EDITOR) {
	PrefabRenderHelper.template = [];
	SpriteRenderHelper.template = [
		{ name: 'blend', type: 'number', default: 0, },
	];


	ParticleRender.template = [
		{ name: 'maxParticles', type: 'number', default: 20, },
		{ name: '_renderType', type: 'number', default: 20, },
		{ name: 'render', type: 'object', view: [PrefabRenderHelper, SpriteRenderHelper], },
	];
}


module.exports = ParticleRender;