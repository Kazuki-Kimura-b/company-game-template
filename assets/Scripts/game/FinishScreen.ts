import SE from "../common/SE";
import StaticData from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FinishScreen extends cc.Component {

    @property(cc.Node) lineLs:cc.Node[] = [];
    @property(cc.Node) lineSs:cc.Node[] = [];
    @property(cc.Node) finishTexts:cc.Node[] = [];
    @property({type:cc.AudioClip}) seStart:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seEnd:cc.AudioClip = null;

    _defaultColor: cc.Color = cc.color(255, 255, 0);
    _costomColor: cc.Color[] = [];

    public setupAtGameMode(mode: string):void
    {
        switch (mode) {
            case "default":
                this.setup(this._defaultColor, this._defaultColor);
                break;
            case "start":
                this.setup(StaticData.gameSetting.startColor1, StaticData.gameSetting.startColor2);
                break;
            case "end":
                this.setup(StaticData.gameSetting.endColor1, StaticData.gameSetting.endColor2);
                break;
        }
    }


    public setupWithCloseAtGameMode(mode: string):void
    {
        switch (mode) {
            case "default":
                this.setup(this._defaultColor, this._defaultColor);
                break;
            case "start":
                this.setup(StaticData.gameSetting.startColor1, StaticData.gameSetting.startColor2);
                break;
            case "end":
                this.setup(StaticData.gameSetting.endColor1, StaticData.gameSetting.endColor2);
                break;
        }
    }


    public setup(colorL:cc.Color, colorS:cc.Color):void
    {
        this._setup(colorL, colorS, 1800);
    }



    public setupWithClose(mode: string):void
    {
        switch (mode) {
            case "default":
                this._setup(this._defaultColor, this._defaultColor, 0);
                break;
            case "start":
                this._setup(StaticData.gameSetting.startColor1, StaticData.gameSetting.startColor2, 0);
                break;
            case "end":
                this._setup(StaticData.gameSetting.endColor1, StaticData.gameSetting.endColor2, 0);
                break;
        }
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
