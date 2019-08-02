import Events from 'Events';

cc.Class({
    extends: cc.Component,

    properties: {
        levels: [cc.Node],
        arrowsHolder: cc.Node,

        _currentLevel: 0,
    },

    onLoad() {
        cc.systemEvent.on(Events.NEXT_LEVEL, this.onNextLevel, this);
        cc.systemEvent.on(Events.CLEAR_ARROWS, this.onClearArrows, this);
        
        for (let i = 0, length = this.levels.length; i < length; i++) {
            this.levels[i].active = i === this._currentLevel;
        }
    },

    onNextLevel() {
        this.levels[this._currentLevel].destroy();

        this._currentLevel++;

        this.levels[this._currentLevel].active = true;
    },

    onClearArrows() {
        this.arrowsHolder.destroy();
    },
});
