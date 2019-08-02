import Events from 'Events';
import CustomLabel from 'CustomLabel';

cc.Class({
    extends: cc.Component,

    properties: {
        label: CustomLabel,
        animation: cc.Animation,
    },

    onLoad() {
		cc.systemEvent.on(Events.SHOW_UI, this.onShowUi, this);
		cc.systemEvent.on(Events.REFRESH_COUNTER, this.onRefreshCounter, this);

        this.node.opacity = 0;
    },

    onShowUi() {
        cc.tweenManager.add(this.node, {
            opacity: 255,
        }, .5);
    },

    onRefreshCounter(amount) {
        this.animation.play('counter_refresh');

        this.label.string = amount;
    },

});
