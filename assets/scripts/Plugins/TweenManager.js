// quad     In Out InOut
// cubic    In Out InOut
// quart    In Out InOut
// quint    In Out InOut
// sine     In Out InOut
// expo     In Out InOut
// circ     In Out InOut
// elastic  In Out InOut
// back     In Out InOut
// bounce   In Out InOut
// smooth
// fade
// linear

const { ccclass } = cc._decorator;

@ccclass('TweenManager')
class TweenManager {

    static _instance = null;

    constructor() {
        if (TweenManager._instance) {
            return TweenManager._instance;
        }

        TweenManager._instance = this;

        this._director = cc.director;
        cc.director.on(cc.Director.EVENT_BEFORE_UPDATE, this.update, this)

        this.tweens = [];

        return TweenManager._instance;
    }

    /**  Public
    * add tween to tween manager pool
    * @param {cc.Node} node - target node
    * @param {Object} finishProps - finite values properties
    *        finishProps = {
    *             property1 : value1,
    *             property2 : value2,
    *             ...
    *             propertyN : valueN,
    *        }
    * @param {number} duration - tween duration (seconds) - 1 second by default
    * @param {string} easing - easing function type - 'linear' by default
    * @param {boolean} autoStart - should tween run immediately - true by default
    * @param {number} delay - delay before tween will start - 0 by default
    * @param {Function} initCallback - callback that will be called right before tween's start - null by default 
    * @param {Function} completeCallback - callback that will be called right after tween's stop, will be called if tween is looped - null by default
    * @param {Function} updateCallback - callback that will be called every tween's update - null by default
    * @example 
    * cc.tweenManager.add(targetNode, {opacity : 255}, .5, 'sineOut', false, 0);
    */
    add(node, finishProps, duration = 1, easing = 'linear', autoStart = true, delay = 0, initCallback = null, completeCallback = null, updateCallback = null) {
        const tween = new Tween(this);
        tween.create(node, finishProps, duration, easing, autoStart, delay, initCallback, completeCallback, updateCallback);

        if (autoStart && delay === 0) {
            tween.start();
        }

        this.tweens.push(tween);

        return tween;
    }

    /// Private
    addTween(tween) {
        const index = this.tweens.indexOf(tween);

        if (index === -1) {
            this.tweens.push(tween);
        }
    }

    deleteTween(tween, callback) {
        const index = this.tweens.indexOf(tween);

        if (index !== -1) {
            this.tweens.splice(index, 1);

            if (callback !== null) {
                callback();
            }
        }
    }

    update() {
        const dt = this._director._deltaTime;
        if (this.tweens !== null) {
            for (let i in this.tweens) {
                if (this.tweens[i] !== null) {
                    this.tweens[i].update(dt);
                }
            }
        }
    }
};

class Tween {
    constructor(manager) {
        this.manager = manager;

        this.timeScale = 1;

        this.states = {
            isLoop: false,
            isYoyo: false,
            isReverse: false,
            isPingPong: false,
        };

        this.reverseCoef = 1;

        this.isWaitingForDelay = false;
    }

    set TimeScale(value) {
        this.timeScale = value;
    }

    get TimeScale() {
        return this.timeScale;
    }

    get IsActive() {
        return this.isActive;
    }

    get IsLoop() {
        return this.states.isLoop;
    }

    get IsReverse() {
        return this.states.isReverse;
    }

    get IsYoyo() {
        return this.states.isYoyo;
    }

    get IsPingPong() {
        return this.states.isPingPong;
    }

    set onComplete(value) {
        if (typeof value === 'function') {
            this.completeCallback = value;
        }
    }

    set onUpdate(value) {
        if (typeof value === 'function') {
            this.updateCallback = value;
        }
    }

    set onStart(value) {
        if (typeof value === 'function') {
            this.startCallback = value;
        }
    }

    /// Public
    // start tween
    start() {
        if (!this.isActive) {
            if (this.delay === 0) {
                this.activate();
            } else {
                this.isWaitingForDelay = true;
                this.delayTimer = 0;
            }
        }

        this.manager.addTween(this);
    }

    // stop tween
    stop(shouldCallCallback = false) {
        this.isActive = false;
        this.manager.deleteTween(this, shouldCallCallback && typeof this.completeCallback === 'function' ? this.completeCallback : null);
    }

    /** change node's properties initial and finish values
    * @param {Object} props = {
    *             property1 : {
    *                 initial : 0,
    *                 finish : 1,
    *             },
    *             property2 : {
    *                 initial : 1,
    *                 finish : 2,
    *             },
    *         }
    */
    changeProperties(props) {
        for (let i in props) {
            if (this.properties.indexOf(i) !== -1) {
                this.initialProperies[i] = props[i].initial === null || props[i].initial === undefined ? this.node[i] : props[i].initial;
                this.finishProperies[i] = props[i].finish === null || props[i].initial === undefined ? 0 : props[i].finish;

                if (props[i].finish.length === 0 || props[i].finish.length === undefined) {
                    this.durations[i] = this.commonDuration;
                    this.interpols[i] = this.commonInterpol;
                    this.iterators[i] = null;
                } else {
                    this.durations[i] = this.commonDuration / props[i].finish.length;
                    this.iterators[i] = 0;

                    for (let j = props[i].finish.length - 1; j >= 0; j--) {
                        if (this.commonInterpol >= this.durations[i] * j) {
                            this.interpols[i] = this.commonInterpol - j;
                            break;
                        }
                    }
                }

                if (this.IsReverse && this.reverseCoef < 0) {
                    this.reverseProperty(i);
                }
            }
        }
    }

    /** add callback that will be called right before tween's start 
    * @param {Function} startCallback - callback function
    */
    addStartCallback(startCallback) {
        this.startCallback = startCallback;
    }

    /** add callback that will be called right after tween's stop, will be called if tween is looped
    * @param {Function} completeCallback - callback function
    */
    addCompleteCallback(completeCallback) {
        this.completeCallback = completeCallback;
    }

    /** add callback that will be called every tween's update
    * @param {Function} updateCallback - callback function
    */
    addUpdateCallback(updateCallback) {
        this.updateCallback = updateCallback;
    }

    // loop tween [0 -> 1, 0 -> 1, .., 0 -> 1]
    loop(isInternalCall = false) {
        this.updateStates('isLoop');
    }

    // reverse tween [1 -> 0]
    reverse(isInternalCall = false) {
        if (isInternalCall) {
            this.states.isReverse = true;
        } else {
            this.updateStates('isReverse');
        }
        this.reverseCoef *= -1;

        for (let i in this.properties) {
            this.reverseProperty(this.properties[i]);
        }
    }

    // [0 -> 1, 1 -> 0]
    yoyo(isInternalCall = false) {
        if (this.states.isYoyo) {
            return;
        }

        this.updateStates('isYoyo');
        this.states.isYoyo = true;
        this.yoyoCounter = 0;
    }

    // loop yoyo [0 -> 1, 1 -> 0, 0 -> 1, 1 -> 0, .., 0 -> 1, 1 -> 0]
    pingPong(isInternalCall = false) {
        this.updateStates('isPingPong');
    }

    // reverse and loop yoyo [1 -> 0, 0 -> 1, 1 -> 0, 0 -> 1, .., 1 -> 0, 0 -> 1]
    pingPongReverse() {
        this.reverse(true);

        this.pingPong();
    }

    // revserse and loop tween [1 -> 0, 1 -> 0, .., 1 -> 0]
    reverseLoop() {
        this.reverse(true);
        this.loop();
    }

    // reverse tween and yoyo [1 -> 0, 0 -> 1]
    yoyoReverse() {
        this.reverse(true);
        this.yoyo();
    }

    /// Private
    create(node, finishProps, duration, easing, isAutoStart, delay, initCallback, completeCallback, updateCallback) {
        this.node = node;

        this.delay = delay;
        this.delayTimer = 0;

        this.commonDuration = duration;
        this.commonInterpol = 0;

        this.properties = [];
        this.initialProperies = {};
        this.finishProperies = {};

        this.easingFunc = cc.Easing[easing];
        // this.getEasingFunc(easing);

        this.durations = {};
        this.interpols = {};
        this.iterators = {};

        for (let i in finishProps) {
            this.properties.push(i);
            this.initialProperies[i] = this.node[i];
            this.finishProperies[i] = finishProps[i];

            if (finishProps[i].length === 0 || finishProps[i].length === undefined) {
                this.durations[i] = duration;
                this.iterators[i] = null;
            } else {
                this.durations[i] = duration / finishProps[i].length;
                this.iterators[i] = 0;
            }
            this.interpols[i] = 0;
        }

        this.startCallback = initCallback;
        this.completeCallback = completeCallback;
        this.updateCallback = updateCallback;

        this.isActive = false;

        if (this.delay !== 0 && isAutoStart) {
            this.isWaitingForDelay = true;
        }

        return this;
    }

    activate() {
        if (typeof this.startCallback === 'function') {
            this.startCallback();
        }

        this.isActive = true;

        this.commonInterpol = 0;

        for (let property in this.finishProperies) {
            this.initialProperies[property] = this.node[property];

            if (this.finishProperies[property].length !== 0 && this.finishProperies[property].length !== undefined) {
                this.iterators[property] = 0;
            }

            this.interpols[property] = 0;
        }
    }

    restart(withCompleteCallback = true) {
        if (withCompleteCallback && typeof this.completeCallback === 'function') {
            this.completeCallback();
        }

        this.commonInterpol = 0;

        for (let i in this.properties) {
            const property = this.properties[i];

            this.iterators[property] = this.iterators[property] === null ? null : 0;
            this.interpols[property] = this.timeScale < 0 ? this.durations[property] : 0;
        }

        this.isActive = false;

        if (this.delay !== 0) {
            this.isWaitingForDelay = true;
            this.delayTimer = 0;
        } else {
            this.activate();
        }
    }

    update(dt) {
        if (this.isActive) {
            dt *= this.timeScale;
            this.commonInterpol += Math.abs(dt);

            if (this.commonInterpol > this.commonDuration) {
                this.updateProperties(dt, true);

                if (this.states.isLoop) {
                    this.restart();
                } else if (this.states.isYoyo && this.yoyoCounter === 0) {
                    this.yoyoCounter++;

                    this.reverse(true);
                    this.restart();
                } else if (this.states.isPingPong) {
                    this.reverse(true);
                    this.restart();
                } else {
                    this.stop(true);
                }
            } else {
                this.updateProperties(dt);

                if (typeof this.updateCallback === 'function') {
                    this.updateCallback();
                }
            }
        } else if (this.isWaitingForDelay) {
            this.delayTimer += dt;

            if (this.delayTimer >= this.delay) {
                this.activate();
            }
        }
    }

    updateProperties(dt, isFinish = false) {
        for (let i in this.properties) {
            const property = this.properties[i];

            if (this.iterators[property] === null) {
                this.interpols[property] += dt;

                this.node[property] = this.initialProperies[property] + (this.finishProperies[property] - this.initialProperies[property]) * (isFinish ? 1 : this.easingFunc(this.interpols[property] / this.durations[property]));
            } else {
                if (this.iterators[property] < this.finishProperies[property].length) {
                    this.interpols[property] += dt;

                    if (this.interpols[property] > this.durations[property]) {
                        this.iterators[property]++;

                        this.interpols[property] = 0;
                    } else {
                        const startPropertyValue = this.iterators[property] === 0 ? this.initialProperies[property] : this.finishProperies[property][this.iterators[property] - 1];
                        this.node[property] = startPropertyValue + (this.finishProperies[property][this.iterators[property]] - startPropertyValue) * (isFinish ? 1 : this.easingFunc(this.interpols[property] / this.durations[property]));
                    }
                }
            }
        }
    }

    updateStates(currentState) {
        for (let i in this.states) {
            this.states[i] = false;
        }

        this.states[currentState] = true;
    }

    reverseProperty(property) {
        if (this.iterators[property] === null) {
            const finishProperty = this.finishProperies[property];
            this.finishProperies[property] = this.initialProperies[property];
            this.initialProperies[property] = finishProperty;
        } else {
            let properties = [];
            properties.push(this.initialProperies[property]);

            for (let i in this.finishProperies[property]) {
                properties.push(this.finishProperies[property][i]);
            }

            properties = properties.reverse(true);

            this.initialProperies[property] = properties[0];
            this.finishProperies[property] = [];

            for (let i = 1; i < properties.length; i++) {
                this.finishProperies[property].push(properties[i]);
            }
        }
    }
};


cc.Tween = module.exports = Tween;
cc.TweenManager = module.exports = TweenManager;
cc.tweenManager = new TweenManager();