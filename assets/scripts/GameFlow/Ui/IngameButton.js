//#region import

import Events from 'Events';

//#endregion


cc.Class({
    extends: cc.Component,

    //#region life-cycle callbacks

    onLoad() {
		cc.systemEvent.on(Events.HIDE_INGAME_BUTTON, this.onHideIngameButton, this);

        this.node.on('touchstart', (event) => {
            cc.systemEvent.emit(Events.REDIRECT);
        }, this);
    },

    //#endregion

    onHideIngameButton() {
        this.node.destroy();
    },
});