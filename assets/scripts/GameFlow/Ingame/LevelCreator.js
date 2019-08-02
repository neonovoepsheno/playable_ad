import BalloonsPrefabs from 'BalloonsPrefabs';
import Events from 'Events';

cc.Class({
    extends: cc.Component,

    properties: {
        balloonsAmount: {
            default: 0,
            notify() {
                this._checkCommonBalloonsAmount();
            },
        },

        blueBalloonsAmount: {
            default: 0,
            notify() {
                this._checkCommonBalloonsAmount();
            },
        },
        yellowBalloonsAmount: {
            default: 0,
            notify() {
                this._checkCommonBalloonsAmount();
            },
        },

        radius: 345,

        shadow: cc.Node,

        prefabInfo: BalloonsPrefabs,

        _balloonsTypes: [],
        _tutorialBalloon: null,
    },

    onLoad() {
        this._createLevel();
        cc.systemEvent.emit(Events.SET_PLAYER_GOAL, this.balloonsAmount);
    },

    start() {
        cc.systemEvent.emit(Events.DEFINE_TUTORIAL_TARGET, this._tutorialBalloon.convertToWorldSpaceAR(cc.v2(0, 0)));

        this.shadow && (this.shadow.zIndex = 3);
        this._tutorialBalloon.zIndex = 5;
    },


    _checkCommonBalloonsAmount() {
        if (this.balloonsAmount < this.blueBalloonsAmount) {
            this.balloonsAmount = this.blueBalloonsAmount;
        }
    },

    _createLevel() {
        const angleDelta = 360 / this.balloonsAmount;

        this._defineBalloonTypes();

        for (let i = 0; i < this.balloonsAmount; i++) {
            const currentAngleRadian = i * angleDelta * Math.PI / 180;

            const currentPosition = cc.v2(this.radius * Math.cos(currentAngleRadian),
                this.radius * Math.sin(currentAngleRadian));

            const balloon = this._createBalloon(currentPosition, this._balloonsTypes[i]);

            if (this._tutorialBalloon === i) {
                this._tutorialBalloon = balloon;
            }
        }

        for (let i = 0; i < this.yellowBalloonsAmount; i++) {
            this._createYellowBalloon();
        }
    },

    _defineBalloonTypes() {
        this._balloonsTypes = new Array(this.balloonsAmount);

        this._definePositionForType('blue', this.blueBalloonsAmount);
        this._definePositionForType();
    },

    _definePositionForType(type, amount) {
        if (type === undefined) {
            for (let i = 0; i < this.balloonsAmount; i++) {
                if (this._balloonsTypes[i] === undefined) {
                    this._balloonsTypes[i] = 'red';

                    this._tutorialBalloon === null && (this._tutorialBalloon = i);
                }
            }
        } else {
            for (let i = 0; i < amount; i++) {
                let randomId;

                while (randomId === undefined || this._balloonsTypes[randomId] !== undefined) {
                    randomId = Math.floor(Math.random() * this.balloonsAmount);
                }

                this._balloonsTypes[randomId] = type;
            }
        }
    },

    _createBalloon(position, type) {
        const balloon = cc.instantiate(this.prefabInfo[type]);
        balloon.parent = this.node;

        balloon.setPosition(position);

        return balloon;
    },

    _createYellowBalloon() {
        const ballon = cc.instantiate(this.prefabInfo['yellow']);
        ballon.parent = this.node;

        ballon.getComponent('YellowBalloon').radius = this.radius;
    },
});
