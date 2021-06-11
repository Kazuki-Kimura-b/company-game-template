const {ccclass, property} = cc._decorator;

@ccclass
export default class OneScaler extends cc.Component {

    //@property(cc.Node) contentsNode: cc.Node = null;

    private _contentsNode:cc.Node = null;


    public setup (canvasNode:cc.Node, contentsNode:cc.Node):void
    {
        this._contentsNode = contentsNode;

        let widget:cc.Widget = this.getComponent(cc.Widget);
        widget.target = canvasNode;
        widget.bottom = 0;
    }


    lateUpdate ():void
    {
        this.node.scale = 1 / this._contentsNode.scale;
    }
}
