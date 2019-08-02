import Events from 'Events';
import GameStates from 'GameStates';

cc.Class({
    extends: cc.Component,

    properties: {
        _currentBalloonAmount: 0,
        _maxBalloonAmount: 0,
    },

    onLoad() {
		cc.systemEvent.on(Events.REFRESH_PLAYER_BALLOON_COUNTER, this.onRefreshBlayerBalloonCounter, this);
		cc.systemEvent.on(Events.SET_PLAYER_GOAL, this.onSetPlayerGoal, this);
    },

    start() {
        cc.systemEvent.emit(Events.REFRESH_COUNTER, this._currentBalloonAmount);
    },

    onRefreshBlayerBalloonCounter() {
        this._currentBalloonAmount++;

        cc.systemEvent.emit(Events.REFRESH_COUNTER, this._currentBalloonAmount);

        if (this._currentBalloonAmount === this._maxBalloonAmount) {
            cc.systemEvent.emit(Events.SWITCH_GAME_STATE, GameStates.Result);
        }
    },

    onSetPlayerGoal(value) {
        this._maxBalloonAmount = value;
        this._currentBalloonAmount = 0;

        cc.systemEvent.emit(Events.REFRESH_COUNTER, this._currentBalloonAmount);
    }
});
