import PoolerHelper from 'PoolerHelper'
import PoolCallback from 'PoolCallback'

//#region classes-helpers
const GO_POOL_POSITION = new cc.Vec2(-3000, -3000);
//#endregion


cc.Class({
	extends: cc.Component,

	properties: {
		//#region editors fields and properties
		prefab : {
			default : null,
			type :	cc.Prefab,
		},

		parent : {
			default : null,
			type : cc.Node,
		},

		preInstantiateCount : {
			default : 0,
		},
		
		autoExtend : {
			default : true,
		},
		//#endregion


		//#region public fields and properties
		countObject : { get() { return this._stack.length; }, visible : false, },
		//#endregion


		//#region private fields and properties
		_stack : {
			default : [],
			type: [cc.Prefab],
			visible : false,
		},
		//#endregion
	},

	//#region life-cycle callbacks
	start() {
		if (this.prefab.data.getComponent(PoolerHelper) === null) {
			this.prefab.data.addComponent(PoolerHelper);
		}

		for (let i = 0; i < this.preInstantiateCount; i++) {
			var go = this._createNewObject();
			this.push(go);
		}
	},
	//#endregion


	//#region public methods
	push(go) {
		go.getComponent(PoolerHelper).inPool = true;

		this._pushObject(go);

		const poolCallback = go.getComponent(PoolCallback);

		if (poolCallback) {
			poolCallback.onReturnToPool();
			poolCallback.onPush();
		}

		go.active = false;
		go.setPosition(GO_POOL_POSITION);
	},

	pop(preAction = null) {
		let go = null;

		if (this.countObject === 0) {
			if (this.autoExtend) {
				go = this._createNewObject();
			}
		} else {
			go = this._popObject();
		}

		if (go !== null) {
			if (go.parent !== this.parent) {
				go.parent = this.parent;
			}

			go.active = true;
			go.getComponent(PoolerHelper).inPool = false;

			if (preAction !== null && typeof preAction === 'function') {
				preAction(go);
			}

			const poolCallback = go.getComponent(PoolCallback);

			if (poolCallback) {
				poolCallback.onCreateFromPool();
				poolCallback.onPop();
			}
		}

		return go;
	},

	//#endregion


	//#region private methods
	_pushObject(go) {
		this._stack.push(go);
	},

	_popObject() {
		return this._stack.pop();
	},

	_createNewObject() {
		let go = null;

		if (this.prefab === null) {
			cc.warn('Missing prefab in pool', this);
		} else {
			go = cc.instantiate(this.prefab);

			if (this.parent === null) {
				this.parent = cc.director.getScene();
			}
			this.parent.addChild(go);

			let poolInfo = go.getComponent(PoolerHelper);
			if (poolInfo === null) { 
				poolInfo = go.addComponent(PoolerHelper);
			}

			poolInfo.poolReference = this;
		}

		return go;
	},
	//#endregion


	//#region event handlers
	//#endregion
});

