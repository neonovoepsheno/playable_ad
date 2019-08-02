import Events from 'Events';

cc.Class({
    extends: cc.Component,

    properties: {
        shadow: cc.Node,

        animationComponent: cc.Animation,

        _isActive: false,
    },

    onLoad() {
		cc.systemEvent.on(Events.SHOW_TUTORIAL, this.onShowTutorial, this);
		cc.systemEvent.on(Events.HIDE_TUTORIAL, this.onHideTutorial, this);

        this.node.opacity = 0;
        this.shadow.opacity = 0;
    },


    onShowTutorial(withShadow = false) {
        if (this._isActive) {
            return;
        }

        this._isActive = true;

        withShadow && cc.tweenManager.add(this.shadow, {
            opacity: 200,
        }, .5);

        cc.tweenManager.add(this.node, {
            opacity: 256,
        }, .5);

        this.animationComponent.play('tutorial');
    },

    onHideTutorial() {
        cc.tweenManager.add(this.shadow, {
            opacity: 0,
        }, .5);

        cc.tweenManager.add(this.node, {
            opacity: 0,
        }, .5).onComplete = () => {
            this._isActive = false;
        };
    },
});
