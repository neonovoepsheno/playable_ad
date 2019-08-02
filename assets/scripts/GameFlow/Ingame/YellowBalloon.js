
cc.Class({
    extends: cc.Component,

    properties: {
        radius: {
            set(value) {
                this._radius = value;

                this._setRandomPosition();
            },

            visible: false,
        },

        speed: {
            set(value) {
                this._speed = value;
            },
            get() {
                return this._speed;
            },
        },

        _radius: 0,
        _speed: 100,

        _currentAngle: 0,

        _isActive: false,
    },

    update(dt) {
        if (this._isActive) {
            this._currentAngle += dt * this._speed;

            if (this._currentAngle > 360) {
                this._currentAngle -= 360;
            } else if (this._currentAngle < 0) {
                this._currentAngle += 360;
            }

            this._setPosition(this._currentAngle);
        }
    },


    _setRandomPosition() {
        this._currentAngle = Math.random() * 360;

        this._setPosition(this._currentAngle);

        this._isActive = true;
    },

    _setPosition(angle) {
        const currentAngleRadian = angle * Math.PI / 180;

        const currentPosition = cc.v2(this._radius * Math.cos(currentAngleRadian),
            this._radius * Math.sin(currentAngleRadian));

            this.node.setPosition(currentPosition);
    },
});
