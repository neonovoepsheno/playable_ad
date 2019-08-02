
cc.Class({
    extends: cc.Component,

    properties: {
        speed: 100,

        radius: 50,

        _isActive: false,
        _currentAngle: 0,

        _startPosition: cc.v2(),
    },

    start() {
        this._startPosition = this.node.getPosition();
        this._isActive = true;
    },

    update(dt) {
        if (this._isActive) {
            this._currentAngle += dt * this.speed;

            if (this._currentAngle > 360) {
                this._currentAngle -= 360;
            } else if (this._currentAngle < 0) {
                this._currentAngle += 360;
            }

            const currentAngleRadian = this._currentAngle * Math.PI / 180;

            const currentPosition = cc.v2(this._startPosition.x + this.radius * Math.cos(currentAngleRadian),
                this._startPosition.y + this.radius * Math.sin(currentAngleRadian));

            this.node.setPosition(currentPosition);
        }
    },
});
