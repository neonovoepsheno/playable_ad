//#region import

import Events from 'Events';
import Transform from 'Transform';
import ResizeRelativeValue from 'ResizeRelativeValue';

//#endregion


cc.Class({
    extends: cc.Component,

    properties: {
        //#region editors fields and properties

        transformPortrait: {
            default: [],
            notify() {
                for (let info of this.transformPortrait) {
                    if (info.isSameToAnotherOrientation) {
                        for (let anotherInfo of this.transformLandscape) {
                            if (anotherInfo.property === info.property) {
                                this.transformLandscape.splice(this.transformLandscape.indexOf(anotherInfo), 1);
                                break;
                            }
                        }

                        this._refreshTransform(new Transform(), info, this.transformLandscape);
                    }
                }
            },
            type: Transform,
        },

        transformLandscape: {
            default: [],
            notify() {
                for (let info of this.transformLandscape) {
                    if (info.isSameToAnotherOrientation) {
                        for (let anotherInfo of this.transformPortrait) {
                            if (anotherInfo.property === info.property) {
                                this.transformPortrait.splice(this.transformPortrait.indexOf(anotherInfo), 1);
                                break;
                            }
                        }

                        this._refreshTransform(new Transform(), info, this.transformPortrait);
                    }
                }
            },
            type: Transform,
        },

        //#endregion
    },

    //#region life-cycle callbacks

    onLoad() {
        cc.systemEvent.on(Events.SIZE_CHANGE, this.onSizeChange, this);
    },

    //#endregion


    //#region private methods

    _refreshTransform(newInfo, oldInfo, transform) {
        newInfo.property = oldInfo.property;
        newInfo.value = oldInfo.value;
        newInfo.isRelative = oldInfo.isRelative;
        newInfo.relativeSettingsProperty = oldInfo.relativeSettingsProperty;
        newInfo.isSameToAnotherOrientation = false;
        newInfo.offset = oldInfo.offset;

        transform.push(newInfo);
    },

    //#endregion


    //#region event handlers

    onSizeChange(settings) {
        const transform = settings.IS_LANDSCAPE ? this.transformLandscape : this.transformPortrait;

        for (let info of transform) {
            let value = 0;

            if (info.isRelative) {
                value = info.value * settings[ResizeRelativeValue[info.relativeSettingsProperty]];
            } else {
                value = info.value;
            }

            this.node[info.property] = value + info.offset * settings.SCALE;
        }
    },

    //#endregion
});