import Events from 'Events';

cc.Class({
    extends: cc.Component,

    properties: {
        rigidbody: cc.RigidBody,
        force: 1000,
        animation: cc.Animation,
    },


    start() {
        const angleRadian = this.node.angle * Math.PI / 180;

        this.rigidbody.linearVelocity = cc.v2(Math.cos(angleRadian) * this.force,
            Math.sin(angleRadian) * this.force);
    },

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.group === 'world') {
            this.rigidbody.linearVelocity = cc.Vec2.ZERO;

            this.animation.play('arrow_collide_world');

            this.scheduleOnce(() => {
                this.node.removeComponent(cc.PhysicsCircleCollider);
                this.node.removeComponent(cc.RigidBody);
            }, 0);

            cc.systemEvent.emit(Events.ADD_CAMERA_SHAKE, 0, .2);
        }
    },
});
