cc.Class({
	extends: cc.Component,

	properties: {

	},

	onLoad() {
		this.callbacks = {
			onCreateFromPool : [],
			onReturnToPool : [],
			onPop : [],
			onPush : [],
		};
	},

	add(key, callback, context, ...args) {
		if (typeof this.callbacks[key] !== undefined) {
			this.callbacks[key].push(() => {
				callback.apply(context, args);
			});
		}
		else {
			console.log('Event not found', key);
		}
	},

	onCreateFromPool() {

		for (let i in this.callbacks.onCreateFromPool) {
			this.callbacks.onCreateFromPool[i]();
		}		
	},

	onReturnToPool() {

		for (let i in this.callbacks.onReturnToPool) {
			this.callbacks.onReturnToPool[i]();
		}
	},

	onPop() {

		for (let i in this.callbacks.onPop) {
			this.callbacks.onPop[i]();
		}
	},

	onPush() {
		for (let i in this.callback.onPush) {
			this.callback.onPush[i]();
		}
	},

});
