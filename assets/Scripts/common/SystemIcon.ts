import { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SystemIcon extends cc.Component
{

    @property(cc.Sprite) moveSprite: cc.Sprite = null;


    public static create(prefab:cc.Prefab):SystemIcon
    {
        let scene:cc.Scene = cc.director.getScene();
        let canvas:cc.Canvas = scene.getComponentInChildren(cc.Canvas);
        let contentsNode:cc.Node = canvas.node.getChildByName("contents");

        let node:cc.Node = cc.instantiate(prefab);
        contentsNode.addChild(node);

        let systemIcon:SystemIcon = node.getComponent(SystemIcon);
        return systemIcon;
    }
    

    public setup(waitTime:number):void
    {
        // 開始、数秒後に表示
        this.node.scale = 0;
        cc.tween(this.node)
        .delay(waitTime)
        .to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
        .start();

        // アイコンが動く
        cc.tween(this.moveSprite)
        .repeatForever(
            cc.tween()
            .to(0.0, { fillRange:0 })
            .to(0.7, { fillRange:1.0 }, { easing:EasingName.sineInOut })
        )
        .start();
    }

    public remove():void
    {
        cc.Tween.stopAllByTarget(this.moveSprite);
        cc.Tween.stopAllByTarget(this.node);

        if(this.node != null) this.node.removeFromParent(true);
    }


    // update (dt) {}
}
