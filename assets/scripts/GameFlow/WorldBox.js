
cc.Class({
    extends: cc.Component,

    properties: {
        camera: cc.Component,

        top: cc.Node,
        bot: cc.Node,
    },

    start() {
        setTimeout(() => {
            this.top.y = this.camera.getPositionFromView(1, 1).y;
            this.bot.y = this.camera.getPositionFromView(1, 0).y;
        }, 300);
    },
});
