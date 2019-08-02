//#region import

import ResizeRelativeValue from 'ResizeRelativeValue';

//#endregion

let Transform = cc.Class({
    name: 'Transform',

    properties: {
        //#region editors fields and properties

        property: '',
        value: 0,

        isRelative: false,
        relativeSettingsProperty: {
            default: ResizeRelativeValue.GAME_WIDTH,
            visible: function () {
                return this.isRelative;
            },
            type: ResizeRelativeValue,
        },

        offset: 0,

        isSameToAnotherOrientation: false,

        //#endregion
    },
});


//#region export

export default Transform;

//#endregion