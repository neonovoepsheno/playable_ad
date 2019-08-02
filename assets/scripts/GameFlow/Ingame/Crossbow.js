import Events from 'Events';

cc.Class({
    extends: cc.Component,

    properties: {
        speed: 100,
        slowDownCoef: 20,

        arrowPrefab: cc.Prefab,
        arrowsHolder: cc.Node,

        animationComponent: cc.Animation,

        _isActive: false,
        _isSlowingDown: false,

        _speed: 0,
    },

    onLoad() {
        cc.systemEvent.on(Events.ACTIVATE_CROSSBOW, this.onActivateCrossbow, this);
        cc.systemEvent.on(Events.DEFINE_TUTORIAL_TARGET, this.onDefineTutorialTarget, this);
        cc.systemEvent.on(Events.SHOOT, this.onShoot, this);
        cc.systemEvent.on(Events.DEACTIVATE_CROSSBOW, this.onDeactivateCrossbow, this);
    },

    update(dt) {
        if (this._isSlowingDown) {
            this._speed -= dt * this.slowDownCoef;

            if (this._speed <= 0) {
                this._speed = 0;
                
                this._isActive = false;
                this._isSlowingDown = false;
            }
        }
        
        if (this._isActive) {
            this.node.angle += dt * this._speed;

            if (this.node.angle > 360) {
                this.node.angle -= 360;
            } else if (this.node.angle < 0) {
                this.node.angle += 360;
            }
        }
    },

    onActivateCrossbow() {
        this._isActive = true;
        this._isSlowingDown = false;

        this._speed = this.speed;
    },

    onDefineTutorialTarget(targetPosition) {
        const angle = Math.atan2(targetPosition.y - this.node.y, targetPosition.x - this.node.x);

        this.node.angle = angle * 180 / Math.PI;
    },

    onShoot() {
        const arrow = cc.instantiate(this.arrowPrefab);
        arrow.parent = this.arrowsHolder;

        arrow.setPosition = this.node.getPosition();
        arrow.angle = this.node.angle;

        this.animationComponent.play('shot');
    },

    onDeactivateCrossbow() {
        this._isSlowingDown = true;
    },
});
