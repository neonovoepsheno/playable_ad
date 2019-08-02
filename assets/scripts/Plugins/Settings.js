const {ccclass, property} = cc._decorator;

@ccclass('Settings')
class Settings {
    constructor() {
        const instance = this.constructor.instance;
        if (instance) {
            return this.constructor.instance;
        }

        this.constructor.instance = this;

        this._default_width = 640;
        this._default_height = 1136;
        this._game_width = 640;
        this._game_height = 1136;
        this._scale = 1;
        this._is_landscape = false;
        this._half_width = 320;
        this._half_heigth = 568;
        this._world_width  = 1366;
        this._world_height = 1366;

    }

    @property
    get DEFAULT_WIDTH() { return this._default_width; }
    @property
    get DEFAULT_HEIGHT() { return this._default_height; }
    @property
    get GAME_WIDTH() { return this._game_width; }
    @property
    get GAME_HEIGHT() { return this._game_height; }
    @property
    get SCALE() { return this._scale; }
    @property
    get IS_LANDSCAPE() { return this._is_landscape; }
    @property
    get HALF_WIDTH() { return this._half_width; }
    @property
    get HALF_HEIGHT() { return this._half_heigth; }
    @property
    get WORLD_WIDTH() { return this._world_width; }
    @property
    get WORLD_HEIGHT() { return this._world_height; }

    @property
    set WORLD_WIDTH(value) { this._world_width = value; }
    @property
    set WORLD_HEIGHT(value) { this._world_height = value; }

    updateSettings() {
        this._game_width = cc.winSize.width;
        this._game_height = cc.winSize.height;

        this._half_width = this.GAME_WIDTH * .5;
        this._half_heigth = this.GAME_HEIGHT * .5;

        this._is_landscape = this.GAME_WIDTH > this.GAME_HEIGHT;
        this._scale = this.calculateScale();
    }

    chooseDefaultHeight() {
        const height = this.IS_LANDSCAPE ? this.DEFAULT_HEIGHT : this.DEFAULT_WIDTH;
        return height;
    }

    chooseDefaultWidth() {
        const width = this.IS_LANDSCAPE ? this.DEFAULT_WIDTH : this.DEFAULT_HEIGHT;
        return width;
    }

    calculateScale() {
        const widthRatio = this.GAME_WIDTH / this.chooseDefaultWidth();
        const heightRatio = this.GAME_HEIGHT / this.chooseDefaultHeight();
        const minRatio = Math.min(widthRatio, heightRatio);
        return minRatio;
    }
}

cc.Settings = module.export = Settings;
cc.settings = new cc.Settings();