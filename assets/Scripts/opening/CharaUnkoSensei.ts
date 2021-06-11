import SE from "../common/SE";
import IjinScreen from "../game/IjinScreen";
import { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CharaUnkoSensei extends IjinScreen
{
    @property(cc.Sprite) faceSprite:cc.Sprite = null;
    @property(cc.Sprite) bodySprite:cc.Sprite = null;
    @property(cc.Node) ikariMark:cc.Node = null;
    @property(cc.Node) kiraEffects:cc.Node[] = [];
    @property(cc.Node) kouhunEffects:cc.Node[] = [];
    @property(cc.SpriteFrame) faceNormalSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) faceSmileSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) faceTereSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) faceAngrySpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) faceKouhunSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) faceWaruiSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) bodyNormalSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) bodyHandUpSpriteFrame:cc.SpriteFrame = null;
    @property({type:cc.AudioClip}) seIkari:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seKirakira:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seWarui:cc.AudioClip = null;


    private _kiraPoss:cc.Vec3[] = [];
    private _kouhunPoss:cc.Vec3[] = [];

    public static readonly SENSEI_POS_Y:number = -267;


    public setup():void
    {
        this._resetAllEffects();
        for(let i:number = 0 ; i < this.kiraEffects.length ; i ++)
        {
            this._kiraPoss.push(this.kiraEffects[i].position);
        }
        for(let i:number = 0 ; i < this.kouhunEffects.length ; i ++)
        {
            this._kouhunPoss.push(this.kouhunEffects[i].position);
        }
    }

    //override
    public ijinScaleTo(scale:number, duration:number):void
    {

    }

    //override
    public show(action:boolean = false):void
    {
        if(! action)
        {
            this.node.active = true;
            return;
        }
        
        this.node.x = 100;
        this.node.opacity = 0;
        this.node.active = true;
        
        cc.tween(this.node)
        .to(0.3, { x:0, opacity:255 } )
        .start();
    }

    //override
    public hide(action:boolean = false):void
    {
        if(! action)
        {
            this.node.active = false;
            return;
        }
        
        cc.tween(this.node)
        .to(0.3, { x:100, opacity:0 })
        .call(()=>
        {
            this.node.active = false;
        })
        .start();
    }

    //override
    public ijinStopAction():void
    {

    }


    public faceChange(face:string):void
    {
        let changeFace:cc.SpriteFrame = null;
        if(face == "normal") changeFace = this.faceNormalSpriteFrame;
        else if(face == "smile") changeFace = this.faceSmileSpriteFrame;
        else if(face == "tere") changeFace = this.faceTereSpriteFrame;
        else if(face == "angry")
        {
            changeFace = this.faceAngrySpriteFrame;
            this.effectIkari();
        }
        else if(face == "kouhun") changeFace = this.faceKouhunSpriteFrame;
        else if(face == "warui")
        {
            changeFace = this.faceWaruiSpriteFrame;
            SE.play(this.seWarui);
        }

        this.faceSprite.spriteFrame = changeFace;
    }


    public bodyChange(body:string):void
    {
        if(body == "normal") this.bodySprite.spriteFrame = this.bodyNormalSpriteFrame;
        else if(body == "handUp") this.bodySprite.spriteFrame = this.bodyHandUpSpriteFrame;
    }


    public toColor(duration:number, color:cc.Color, callback:()=>void):void
    {
        if(duration == 0)
        {
            this.bodySprite.node.color = color;
            this.faceSprite.node.color = color;
            return;
        }

        cc.tween(this.bodySprite.node)
        .to(duration, { color:color })
        .start();

        cc.tween(this.faceSprite.node)
        .to(duration, { color:color })
        .call(()=>
        {
            if(callback != null) callback();
        })
        .start();
    }


    public unazuki()
    {
        cc.tween(this.faceSprite.node)
        .by(0.08, { y:-10 })
        .by(0.08, { y:10 })
        .start();
    }



    //---------------------------------------------------------------
    // エフェクト
    //

    private _resetAllEffects():void
    {
        cc.Tween.stopAllByTarget(this.ikariMark);
        this.ikariMark.active = false;

        for(let i = 0 ; i < this.kiraEffects.length ; i ++)
        {
            cc.Tween.stopAllByTarget(this.kiraEffects[i]);
            this.kiraEffects[i].active = false;
        }
        
        for(let i = 0 ; i < this.kouhunEffects.length ; i ++)
        {
            cc.Tween.stopAllByTarget(this.kouhunEffects[i]);
            this.kouhunEffects[i].active = false;
        }
    }


    public effectIkari():void
    {
        this._resetAllEffects();

        SE.play(this.seIkari);

        this.ikariMark.active = true;
        this.ikariMark.scale = 0.1;
        cc.tween(this.ikariMark)
        .to(0.3, { scale:2 }, { easing:EasingName.backOut })
        .delay(0.5)
        .to(0.3, { scale:1 }, { easing:EasingName.sineInOut })
        .delay(0.5)
        .call(()=>{ this.ikariMark.active = false; })
        .start();
    }


    public effectKirakira():void
    {
        this._resetAllEffects();

        SE.play(this.seKirakira);
        
        for(let i:number = 0 ; i < this.kiraEffects.length ; i ++)
        {
            this.kiraEffects[i].opacity = 0;
            this.kiraEffects[i].active = true;

            cc.tween(this.kiraEffects[i])
            .delay(i * 0.2)
            .repeatForever(
                cc.tween()
                .call(()=>{
                    this.kiraEffects[i].x = this._kiraPoss[i].x + Math.random() * 100 - 50;
                    this.kiraEffects[i].y = this._kiraPoss[i].y + Math.random() * 60 - 30;
                    this.kiraEffects[i].scale = 0.5 + Math.random();
                })
                .to(0.2, { opacity:255 })
                .to(0.2, { opacity:0 })
            )
            .start();
        }
    }


    public effectKouhun():void
    {
        this._resetAllEffects();

        SE.play(this.seIkari);

        const scX:number[] = [1,-1];

        for(let i:number = 0 ; i < this.kouhunEffects.length ; i ++)
        {
            this.kouhunEffects[i].active = true;

            cc.tween(this.kouhunEffects[i])
            .repeatForever(
                cc.tween()
                .call(()=>{
                    this.kouhunEffects[i].position = this._kouhunPoss[i];
                    this.kouhunEffects[i].scale = 0.4;
                    this.kouhunEffects[i].opacity = 255;
                })
                .by(1.0, { x:50 * scX[i], y:30, scale:1, opacity:-255 })
                .delay(0.2)
            )
            .start();
        }
    }


    public effect(code:string):void
    {
        if(code == "ikari") this.effectIkari();
        else if(code == "kirakira") this.effectKirakira();
        else if(code == "kouhun") this.effectKouhun();
        else if(code == "end") this.effectStop();
    }


    public effectStop():void
    {
        this._resetAllEffects();
    }

}
