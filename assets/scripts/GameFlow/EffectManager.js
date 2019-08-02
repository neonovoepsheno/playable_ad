//#region import

import Events from 'Events';
import Pool from 'Pool'

//#endregion

cc.Class({
    extends: cc.Component,

    properties: {
        pool: Pool,


        //#region private field and properties

        _effectsPoolObjects: {
            default: {},
            serializable: false,
        },

        _timeScale: {
            default: 1,
            serializable: false,
        },

        _trailsInfo: [],

        //#endregion
    },

    //#region life-cycle callbacks

    onLoad() {
        cc.systemEvent.on(Events.RETURN_EFFECT_TO_POOL, this.handleEffectToPool, this);
        cc.systemEvent.on(Events.SPAWN_EFFECT, this.handleSpawnEffect, this);
    },

    update(dt) {
        for (let info of this._trailsInfo) {
            info.timer += dt * this._timeScale;

            if (info.timer >= info.delay) {
                info.timer = 0;

                const effectNode = info.pool.pop();
                const particleManagerComponent = effectNode.getComponent('ParticleManager');
                particleManagerComponent.play();

                particleManagerComponent.timeScale = info.target.timeScale;

                effectNode.setPosition(info.target.getPosition());
                effectNode.angle = info.target.angle;

                effectNode.key = info.key;
            }
        }
    },

    //#endregion


    //#region event handlers

    handleSpawnEffect(key, data) {
        if (this._effectsPoolObjects[key] === undefined) {
            this._effectsPoolObjects[key] = this.pool.getPoolObject(key);
 
            if (!this._effectsPoolObjects[key]) {
                cc.error('Effect by ID', key, 'doesnt exist');
                return;
            }
        }

        const effectNode = this._effectsPoolObjects[key].pop();
        const particleManagerComponent = effectNode.getComponent('ParticleManager');

        particleManagerComponent.play();

        for (let i in data) {
            effectNode[i] = data[i];
        }

        effectNode.key = key;

        this.scheduleOnce(() => {
            cc.systemEvent.emit(Events.RETURN_EFFECT_TO_POOL, effectNode);
        }, 2);
    },

    handleEffectToPool(node) {
        if (this._effectsPoolObjects[node.key]) {
            this._effectsPoolObjects[node.key].push(node);
        }
    },

    //#endregion
});
