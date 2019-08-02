cc.Class({
	extends: cc.Component,

	properties: {
		inPool : false,

		poolReference : {
			default : null,
			type : cc.Component,
		},
	},

	returnToPool() {
		if ((this.poolReference !== null) && !this.inPool) {
			this.poolReference.push(this.node);
		}
	},

	getPool() {
		return this.poolReference;
	},
});
