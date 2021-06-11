const {ccclass, property} = cc._decorator;

@ccclass
export default class FitHeight extends cc.Component {

    @property(cc.Node) markU:cc.Node = null;

    update (dt)
    {
        if(this.markU == null) return;
        
        let wPos:cc.Vec2 = this.markU.convertToWorldSpaceAR(cc.v2());
        let lPos:cc.Vec2 = this.node.parent.convertToNodeSpaceAR(wPos);
        let contentsHeight:number = lPos.y * 2;

        let scaleY:number = contentsHeight / this.node.height;
        this.node.scale = scaleY;
    }
}
