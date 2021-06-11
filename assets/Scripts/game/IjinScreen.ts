import OneScaler from "../common/OneScaler";
import { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class IjinScreen extends cc.Component {

    @property(cc.Sprite) ijinSprite:cc.Sprite = null;   //びっくり、ブルブルなど担当
    @property(cc.Node) baseNode:cc.Node = null;         //移動を担当
    @property(cc.Node) scaleNode:cc.Node = null;        //スケールを担当
    
    private _ijinTween:cc.Tween = null;


    public static readonly SCALE_STORY:number = 1.5;
    public static readonly Y_STORY:number = 200;


    public setup():void
    {

    }


    public setIjinImage(image:cc.SpriteFrame):void
    {
        this.ijinSprite.spriteFrame = image;
    }


    /**
     * 偉人を拡大縮小
     * @param scale 
     * @param duration 
     * @returns 
     */
    public ijinScaleTo(scale:number, duration:number):void
    {
        if(duration == 0)
        {
            this.scaleNode.scale = scale;
            return;
        }

        cc.tween(this.scaleNode)
        .to(duration, { scale:scale }, { easing:EasingName.sineOut })
        .start();
    }


    /**
     * 偉人のx座標を変更
     * @param x 
     * @param duration 
     * @returns 
     */
    public ijinMoveTo(position:cc.Vec2, duration:number):void
    {
        if(duration == 0)
        {
            this.baseNode.x = position.x;
            this.baseNode.y = position.y;
            return;
        }

        cc.tween(this.baseNode)
        .to(duration, { position: cc.v3(position.x, position.y, 0) }, { easing:EasingName.sineOut })   //https://docs.cocos.com/creator/api/en/classes/Easing.html
        .start();
    }


    /**
     * 偉人を表示
     */
    public show(action:boolean = false):void
    {
        if(! action)
        {
            this.baseNode.active = true;
            return;
        }
        
        this.scaleNode.x = 100;
        this.ijinSprite.node.opacity = 0;
        this.baseNode.active = true;
        
        cc.tween(this.scaleNode)
        .to(0.3, { position:cc.v3(0, 0, 0) } )
        .start();
        
        cc.tween(this.ijinSprite.node)
        .to(0.3, { opacity:255 })
        .start();
    }


    /**
     * 偉人を非表示
     */
    public hide(action:boolean = false):void
    {
        if(! action)
        {
            this.baseNode.active = false;
            return;
        }
        
        cc.tween(this.scaleNode)
        .to(0.3, { position:cc.v3(100, 0, 0) } )
        .start();
        
        cc.tween(this.ijinSprite.node)
        .to(0.3, { opacity:0 })
        .call(()=>
        {
            this.baseNode.active = false;
        })
        .start();
    }


    /**
     * 偉人を止める
     */
    public ijinStopAction():void
    {
        if(this._ijinTween != null)
        {
            this._ijinTween.stop();
            this._ijinTween = null;
            this.ijinSprite.node.x = 0;
            this.ijinSprite.node.y = 0;
        }
        this.ijinActionColor(cc.color(255,255,255), 0);
    }


    /**
     * 偉人が横にブルブルする
     */
    public ijinActionBuruburu():void
    {
        this._ijinTween = cc.tween(this.ijinSprite.node)
        .repeatForever(
            cc.tween()
            .to(0.0, { position: cc.v2(3, 0) })
            .delay(0.05)
            .to(0.0, { position: cc.v2(-3, 0) })
            .delay(0.05)
        )
        .start();
    }


    /**
     * 偉人が飛び上がる
     */
    public ijinActionBikkuri():void
    {
        this.ijinSprite.node.y = -40;
        cc.tween(this.ijinSprite.node)
        .to(0.2, { position:cc.v3(0, 30, 0) }, { easing:EasingName.cubicOut })
        .to(0.1, { position:cc.v3(0, 0, 0) }, { easing:EasingName.cubicIn })
        .start();
    }



    public ijinActionColor(color:cc.Color, duration:number):void
    {
        if(duration == 0)
        {
            this.ijinSprite.node.color = color;
            return;
        }

        cc.tween(this.ijinSprite.node)
        .to(duration, { color: color })
        .start();
    }



    public ijinActionBig():void
    {
        cc.tween(this.ijinSprite.node)
        .to(0.3, { scale:1.5 }, { easing:EasingName.backOut })
        .delay(0.5)
        .to(0.2, { scale:1 }, { easing:EasingName.sineInOut })
        .start();
    }


    public ijinActionSmall():void
    {
        cc.tween(this.ijinSprite.node)
        .to(0.3, { scale:0.7 }, { easing:EasingName.backOut })
        .delay(0.5)
        .to(0.2, { scale:1 }, { easing:EasingName.sineInOut })
        .start();
    }


}
