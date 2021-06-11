const {ccclass, property} = cc._decorator;

@ccclass
export default class GhostPlayer extends cc.Component
{

    @property(cc.Node) swingNode:cc.Node = null;
    @property(cc.Node) ghostParentNode:cc.Node = null;
    @property(cc.Node) goodNode:cc.Node = null;
    @property(cc.Node) badNode:cc.Node = null;


    public setup():void
    {
        this.goodNode.active = false;
        this.badNode.active = false;

        this.swingNode.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(1.0, cc.v2(20, 0)).easing(cc.easeInOut(2)),
                    cc.moveBy(1.0, cc.v2(-20, 0)).easing(cc.easeInOut(2))
                )
            )
        );

        this.swingNode.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.7, cc.v2(0, -10)).easing(cc.easeInOut(2)),
                    cc.moveBy(0.7, cc.v2(0, 10)).easing(cc.easeInOut(2))
                )
            )
        );
    }


    public goodAction():void
    {
        //ジャンプする
        this.ghostParentNode.runAction(
            cc.jumpBy(0.5, cc.v2(0,0), 30, 3)
        )
        this.goodNode.active = true;
    }


    public badAction():void
    {
        //縮む
        this.ghostParentNode.runAction(
            cc.scaleTo(0.2, 1, 0.3)
        )
        this.badNode.active = true;
    }
    

    public setDefault():void
    {
        this.goodNode.active = false;
        this.badNode.active = false;
        this.ghostParentNode.scaleY = 0.8;
        this.ghostParentNode.runAction(
            cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
        )
    }

}
