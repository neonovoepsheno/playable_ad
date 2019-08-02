var PoolObjectClass = cc.Class({
    name : 'Pool object',

    properties: {
        prefab : {
            default : null,
            type : cc.Prefab,
        },

        initialCount : {
            displayName : 'Quantity',
            default : 1,
        },

        key : 'default',

        parent : {
            default : null,
            type : cc.Node,
        },

        /// Private
        _pool : {
            default : [],
            visible : false,
        },
    },

    start () {
        if (this.key === 'default' && this.prefab !== null) {
            this.key = this.prefab.name;
        }

        for (let i = 0; i < this.initialCount; i++) {
            this._pool.push(this.createInstance());
            this.push(this._pool[i]);
        }
    },

    createInstance() {
        const node = cc.instantiate(this.prefab);
        node.parent = this.parent === null ? this.node : this.parent;

        return node;
    },

    push(object) {
        object.active = false;
    },

    pop() {
        for (let i in this._pool) {
            if (!this._pool[i].active) {
                this._pool[i].active = true;
                return this._pool[i];
            }
        }

        this._pool.push(this.createInstance());
        this._pool[this._pool.length - 1].active = true;

        return this._pool[this._pool.length - 1];
    },
});

let Pool = cc.Class({
    extends: cc.Component,

    properties: {
        poolObjects : {
          default : [],
          type : PoolObjectClass,
          visible : true,
        },
    },

    onLoad () {
        for (let poolObject of this.poolObjects) {
            poolObject.start();
        }
    },

    getPoolObject(key) {
        for (let poolObject of this.poolObjects) {
            if (poolObject.key === key) {
                return poolObject;
            };
        }

        cc.log('Error: pool object with such key is not defined');
    },
});

export default Pool;