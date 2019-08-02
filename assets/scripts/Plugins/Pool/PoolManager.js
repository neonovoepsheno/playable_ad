var PoolObject = require("PoolObject");

cc.Class({
	extends: cc.Component,

	properties: {
		pools : {
			default : [],
			type: [PoolObject],
		},
	},

	findPool(prefab) {
		let pool = null;

		for (let i in pools) {
			if (pools[i].prefab.name === prefab.name) {
				pool = pools[i];
				break;
			}
		}

		if (pool !== null) {
			console.log("Cant find pool for prefab : " + prefab.name);
		}

		return pool;
	},

	poolForObject(prefab) {
		let pool = this.findPool(prefab);

		if (pool === null) {
			var poolObject = new cc.Node();
			poolObject.name = prefab.name + "Pool";

			poolObject.setPosition(0, 0);
			poolObject.parent = this.node;

			pool = poolObject.addComponent('PoolObject');
			pool.prefab = prefab;
			pool.autoExtend = true;

			pools.push(pool);
		}

		return pool;
	},

	removeObjectPool(pool = null) {
		if (pool !== null) {
			for (let i in pools) {
				if (pools[i].prefab.name === pool.prefab.name) {
					pools.splice(1, 1);
					break;
				}
			}
		}
	},

});





















