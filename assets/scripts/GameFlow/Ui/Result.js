import Events from 'Events';
import GameStates from 'GameStates';

cc.Class({
    extends: cc.Component,

    properties: {
        shadow: cc.Node,

        _isActive: false,
    },

    onLoad() {
        cc.systemEvent.on(Events.SHOW_RESULT, this.onShowResult, this);
        cc.systemEvent.on(Events.SIZE_CHANGE, this.onSizeChange, this);

        this.node.opacity = 0;
        this.shadow.opacity = 0;
    },

    onShowResult() {
        if (this._isActive) {
            return;
        }

        this._isActive = true;

        this.scheduleOnce(() => {
            cc.tweenManager.add(this.shadow, {
                opacity: 255,
            }, .5).onComplete = () => {
                this.node.opacity = 255;
                cc.systemEvent.emit(Events.SWITCH_GAME_STATE, GameStates.PostResult);
    
                cc.tweenManager.add(this.shadow, {
                    opacity: 0,
                }, .5);
            };
        }, 1.4);
    },

    onSizeChange(settings) {
        this.shadow.width = settings.GAME_WIDTH;
        this.shadow.height = settings.GAME_HEIGHT;
    },
});
