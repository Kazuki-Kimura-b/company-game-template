const {ccclass, property} = cc._decorator;

@ccclass
export default class FitWidth extends cc.Component
{

    @property(cc.Node) markR:cc.Node = null;

    update (dt)
    {
        if(this.markR == null) return;
        
        let wPos:cc.Vec2 = this.markR.convertToWorldSpaceAR(cc.v2());
        let lPos:cc.Vec2 = this.node.parent.convertToNodeSpaceAR(wPos);
        let contentsWidth:number = lPos.x * 2;

        let scaleX:number = contentsWidth / this.node.width;
        if(scaleX > 1) scaleX = 1;
        this.node.scale = scaleX;
    }
}
