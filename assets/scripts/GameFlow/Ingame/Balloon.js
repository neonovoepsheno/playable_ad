import Events from 'Events';

cc.Class({
    extends: cc.Component,

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.group === 'arrow') {
            const worldPosition = this.node.convertToWorldSpaceAR(cc.v2(0, 0));

            cc.systemEvent.emit(Events.SPAWN_EFFECT, 'FxRedBalloonExplosion', {
                x: worldPosition.x,
                y: worldPosition.y,
            });

            cc.systemEvent.emit(Events.REFRESH_PLAYER_BALLOON_COUNTER);
            this.node.destroy();
        }
    },
});
