import SE from "../common/SE";
import { GameMode } from "../StaticData";

const {ccclass, property} = cc._decorator;


export class FinishColor
{
    public static readonly YELLOW:cc.Color = cc.color(255,255,0);
    public static readonly GORIBEN_S:cc.Color = cc.color(255,0,140);        //多分あってる
    public static readonly GORIBEN_L:cc.Color = cc.color(0,225,205);        //多分あってる
    public static readonly HAYABEN_S:cc.Color = cc.color(255,0,140);
    public static readonly HAYABEN_L:cc.Color = cc.color(0,40,255);
    public static readonly GHOST_S:cc.Color = cc.color(158,90,255);
    public static readonly GHOST_L:cc.Color = cc.color(255,240,0);

}



@ccclass
export default class FinishScreen extends cc.Component {

    @property(cc.Node) lineLs:cc.Node[] = [];
    @property(cc.Node) lineSs:cc.Node[] = [];
    @property(cc.Node) finishTexts:cc.Node[] = [];
    @property({type:cc.AudioClip}) seStart:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seEnd:cc.AudioClip = null;


    public setupAtGameMode(gameMode:GameMode):void
    {
        if (gameMode == GameMode.GORIBEN) this.setup(FinishColor.GORIBEN_L, FinishColor.GORIBEN_S);
        else if (gameMode == GameMode.HAYABEN) this.setup(FinishColor.HAYABEN_L, FinishColor.HAYABEN_S);
        else if (gameMode == GameMode.GHOST) this.setup(FinishColor.GHOST_L, FinishColor.GHOST_S);
    }


    public setupWithCloseAtGameMode(gameMode:GameMode):void
    {
        if (gameMode == GameMode.GORIBEN) this.setupWithClose(FinishColor.GORIBEN_L, FinishColor.GORIBEN_S);
        else if (gameMode == GameMode.HAYABEN) this.setupWithClose(FinishColor.HAYABEN_L, FinishColor.HAYABEN_S);
        else if (gameMode == GameMode.GHOST) this.setupWithClose(FinishColor.GHOST_L, FinishColor.GHOST_S);
    }

    
    public setup(colorL:cc.Color, colorS:cc.Color):void
    {
        this._setup(colorL, colorS, 1800);
    }



    public setupWithClose(colorL:cc.Color, colorS:cc.Color):void
    {
        this._setup(colorL, colorS, 0);
    }


    private _setup(colorL:cc.Color, colorS:cc.Color, startX:number):void
    {
        for(let i:number = 0 ; i < this.lineLs.length ; i ++)
        {
            this.lineLs[i].children[0].color = colorL;
            this.lineLs[i].children[1].color = colorL;
            this.lineLs[i].x = startX;
        }

        for(let i:number = 0 ; i < this.lineSs.length ; i ++)
        {
            this.lineSs[i].children[0].color = colorS;
            this.lineSs[i].children[1].color = colorS;
            this.lineSs[i].x = -startX;
        }

        //最後これ有効に
        this.hideFinishTexts();
    }


    /**
     * 帯についてるFinishのテキストを隠す
     */
    public hideFinishTexts():void
    {
        for(let i:number = 0 ; i < this.finishTexts.length ; i ++)
        {
            this.finishTexts[i].active = false;
        }
    }
    

    /**
     * 帯についてるFinishのテキストを表示する
     */
    public showFinishTexts():void
    {
        for(let i:number = 0 ; i < this.finishTexts.length ; i ++)
        {
            this.finishTexts[i].active = true;
        }
    }
    

    /**
     * 画面外から帯が出てきて90度回転する
     * @param callback 
     */
    public finishShow(callback:()=>void):void
    {
        this.node.angle = -45;
        SE.play(this.seStart);
        
        //それぞれの帯が外から中央(x:0)へ集まる
        for(let i:number = 0 ; i < this.lineLs.length ; i ++)
        {
            this.lineLs[i].active = true;
            this.lineLs[i].runAction(
                cc.sequence(
                    cc.delayTime(i * 0.1),
                    cc.moveTo(0.5, 0, this.lineLs[i].y)
                )
            );
        }

        //それぞれの帯が外から中央(x:0)へ集まる
        for(let i:number = 0 ; i < this.lineSs.length ; i ++)
        {
            this.lineSs[i].active = true;
            this.lineSs[i].runAction(
                cc.sequence(
                    cc.delayTime(i * 0.1),
                    cc.moveTo(0.5, 0, this.lineSs[i].y)
                )
            );
        }

        //帯全体を回転させる
        this.node.runAction(
            cc.sequence(
                cc.delayTime(0.7),
                cc.rotateTo(0.7, 45).easing(cc.easeInOut(2.0)),
                cc.callFunc(()=>{ callback(); })
            )
        );
    }



    /**
     * 
     * @param callback 
     */
    public endFinishAction(callback:()=>void):void
    {
        this.node.angle = 45;
        SE.play(this.seEnd);
        
        //それぞれの帯が画面外へはける
        for(let i:number = 0 ; i < this.lineLs.length ; i ++)
        {
            this.lineLs[i].runAction(
                cc.sequence(
                    cc.delayTime(i * 0.1),
                    cc.moveTo(0.5, 1800, this.lineLs[i].y),
                    cc.callFunc(()=>{ this.lineLs[i].active = false; })
                )
            );
        }

        //それぞれの帯が画面外へはける
        for(let i:number = 0 ; i < this.lineSs.length ; i ++)
        {
            this.lineSs[i].runAction(
                cc.sequence(
                    cc.delayTime(i * 0.1),
                    cc.moveTo(0.5, -1800, this.lineSs[i].y),
                    cc.callFunc(()=>{ this.lineSs[i].active = false; })
                )
            );
        }


        this.node.runAction(
            cc.sequence(
                cc.delayTime(0.7),
                cc.callFunc(()=>{ callback(); })
            )
        );
    }


}
