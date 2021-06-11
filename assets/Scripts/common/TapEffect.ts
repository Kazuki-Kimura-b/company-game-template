const {ccclass, property} = cc._decorator;

@ccclass
export default class TapEffect extends cc.Component {

    @property(cc.Prefab) tapEffectPrefab:cc.Prefab = null;

    private _effectParent:cc.Node = null;
    private _canvas:cc.Canvas = null;
    private static _instance:TapEffect = null;

    public static instance():TapEffect
    {
        return this._instance;
    };

    public static setInstance(instance:TapEffect):void
    {
        this._instance = instance;
    }
    
    
    start ()
    {
        TapEffect.setInstance(this);
        
        let canvas:cc.Canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        this._canvas = canvas;

        /*
        let node:cc.Node = new cc.Node();
        canvas.node.addChild(node);
        node.width = canvas.node.width;
        node.height = canvas.node.height;
        */

        this._effectParent = new cc.Node();
        canvas.node.addChild(this._effectParent);


        
        canvas.node.on(cc.Node.EventType.TOUCH_START, this._onTouch, this);

    }


    /**
     * タップ位置にパーティクルを出す
     */
    private _onTouch(event:cc.Event.EventTouch):void
    {
        let touches:cc.Touch[] = event.getTouches();
        let touchLoc:cc.Vec2 = touches[0].getLocation();
        this.setParticle(touchLoc);
    }

    
    onDestroy()
    {
        //これを入れるとゲームシーンの偉人勝利メッセージの直後にフリーズする
        /*
        if(this._canvas)
        {
            if(this._canvas.node) this._canvas.node.off(cc.Node.EventType.TOUCH_START, this._onTouch, this);
        }
        */
        TapEffect.setInstance(null);
    }
    



    public setParticleFromNode(node:cc.Node, localPos:cc.Vec2)
    {
        let worldPos:cc.Vec2 = node.convertToWorldSpaceAR(localPos);
        this.setParticle(worldPos);
    }



    public setParticle(worldPos:cc.Vec2)
    {
        if(this._effectParent == null) return;
        
        let lPos:cc.Vec2 = this._effectParent.convertToNodeSpaceAR(worldPos);
            
        let perticleNode:cc.Node = cc.instantiate(this.tapEffectPrefab);
        perticleNode.x = lPos.x;
        perticleNode.y = lPos.y;
        this._effectParent.addChild(perticleNode);

        this.node.runAction(
            cc.sequence(
                cc.delayTime(1.0),
                cc.callFunc(()=>
                {
                    if(perticleNode) perticleNode.removeFromParent(true);
                })
            )
        );
    }


    public setParticeFromEvent(event)
    {
        if(this._canvas)
        {
            this._canvas.node.emit(cc.Node.EventType.TOUCH_START, event);
        }
    }

    
}
