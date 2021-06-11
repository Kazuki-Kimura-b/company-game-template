import SE from "../common/SE";
import { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NextIjinWarp extends cc.Component
{

    @property(cc.Node) maskNode:cc.Node = null;
    @property(cc.Material) timeHoleMaterial:cc.Material = null;
    @property(cc.Node) unkoRobo:cc.Node = null;
    @property(cc.Node) eyeLightL:cc.Node = null;
    @property(cc.Node) eyeLightR:cc.Node = null;
    @property(cc.Node) yellowCover:cc.Node = null;
    @property({ type:cc.AudioClip }) seWarp:cc.AudioClip = null;
    @property({ type:cc.AudioClip }) seRobo:cc.AudioClip = null;
    @property({ type:cc.AudioClip }) seEyeBeam:cc.AudioClip = null;

    private _callback:()=>void = null;
    private _warpTween:cc.Tween = null;


    public setup(callback:()=>void):void
    {
        this._callback = callback;
        
        this.maskNode.width = 0;
        this.maskNode.height = 0;
        this.unkoRobo.y = -600;
        this.eyeLightL.active = false;
        this.eyeLightR.active = false;
        this.yellowCover.active = false;


        //タイムトンネルの動き
        this._timeHoleEffect();

        SE.play(this.seWarp);

        //ホールが開く
        cc.tween(this.maskNode)
        .to(1.0, { width:500, height:500 }, { easing:EasingName.backOut })
        .delay(0.3)
        .call(()=>{ this._appearRobo(); })
        .start();


    }


    //タイムマシーンの演出開始
    private _timeHoleEffect():void
    {

        let posY_st:number = -1;
        let posY_ed:number = 3.5;

        this._warpTween = cc.tween({})
        .to(3.0, {}, { onUpdate:(target:object, ratio: number)=>
        {
            let positionX:number = ratio * 0.2;
            let positionY:number = ratio * (posY_ed - posY_st) + posY_st;
            
            this.timeHoleMaterial.setProperty("positionX", positionX);
            this.timeHoleMaterial.setProperty("positionY", positionY);
        }})
        .start();
    }



    /**
     * うんこロボ登場
     */
    private _appearRobo():void
    {
        SE.play(this.seRobo);
        
        cc.tween(this.unkoRobo)
        .to(0.3, { y:0 }, { easing:EasingName.backOut })
        .delay(0.3)
        .call(()=>{ this._beam(); })
        .start();
    }


    /**
     * うんこロボからビーム
     */
    private _beam():void
    {
        this.eyeLightL.active = true;
        this.eyeLightR.active = true;
        this.yellowCover.active = true;
        this.yellowCover.opacity = 0;

        SE.play(this.seEyeBeam);
        
        cc.tween(this.eyeLightL)
        .to(0.6, { scale:8 }, { easing:EasingName.expoIn })
        .start();

        cc.tween(this.eyeLightR)
        .to(0.6, { scale:8 }, { easing:EasingName.expoIn })
        .start();

        cc.tween(this.yellowCover)
        .delay(0.4)
        .to(0.3, { opacity:255 })
        .call(()=>
        {
            this._warpTween.stop();
            this._callback();
        })
        .start();
    }


}
