//#region import

import Events from 'Events';

//#endregion


cc.Class({
    extends: cc.Component,

    properties: {
        //#region editors fields and properties

        back: {
            default: null,
            type: cc.Node,
        },
        label: {
            default: null,
            type: cc.Node,
        },

        scaleLandscape: 1,
        scalePortrait: 1,

        // labelOffset: 120,

        //#endregion
    },

    //#region life-cycle callbacks

    onLoad() {
        cc.systemEvent.on(Events.SIZE_CHANGE, this.onSizeChange, this);
    },

    //#endregion


    //#region event handlers

    onSizeChange(settings) {
        const scale = settings.IS_LANDSCAPE ? this.scaleLandscape : this.scalePortrait;

        this.node.x = .5 * settings.GAME_WIDTH;
        this.node.y = settings.GAME_HEIGHT;
        this.node.scale = scale * settings.SCALE;

        this.back.width = settings.GAME_WIDTH / (scale * settings.SCALE);

        // this.label.x = -this.back.width * .5 + this.labelOffset;
    },

    //#endregion
});