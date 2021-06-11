const {ccclass, property} = cc._decorator;

@ccclass
export default class BitmapNum extends cc.Component
{
    @property(cc.SpriteAtlas) spriteAtlas:cc.SpriteAtlas = null;
    @property(cc.Sprite) numSprites :cc.Sprite[] = [];
    @property(cc.SpriteFrame) numSpriteFrames :cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame) colonSpriteFrame :cc.SpriteFrame = null;
    @property(cc.Node) centeringNode :cc.Node = null;
    @property({type:cc.AudioClip}) toSE :cc.AudioClip = null;
    @property(cc.Boolean) leftAlign :boolean = false;
    

    private _seID :number = -1;
    private _num: number = 0;
    private _time: number = 0;



    get num():number
    {
        return this._num;
    }

    set num(value: number)
    {
        let intVal:number = Math.floor(value);
        if(intVal == this._num) return;
        
        this._num = intVal;
        
        let strShowNum:string = "" + this._num;
        this.strNum = strShowNum;
    }


    set strNum(strShowNum: string)
    {
        if(strShowNum.length > this.numSprites.length)
        {
            strShowNum = "" + (Math.pow(10, strShowNum.length) - 1);	//カンスト
        }
        
        let startIndex:number = (this.leftAlign || this.centeringNode) ? 0 : this.numSprites.length - strShowNum.length;
        
        for (let i:number = 0 ; i < startIndex ; i ++)
        {
            this.numSprites[i].node.active = false;
        }
        
        for (let i:number = 0 ; i < strShowNum.length ; i ++)
        {
            let char = strShowNum.substr(i, 1);

            if(this.spriteAtlas != null)
            {
                this.numSprites[i + startIndex].spriteFrame = this.spriteAtlas.getSpriteFrames()[Number(char)];
            }
            else
            {
                this.numSprites[i + startIndex].spriteFrame = this.numSpriteFrames[Number(char)];
            }
            this.numSprites[i + startIndex].node.active = true;
        }
        
        for (let i:number = strShowNum.length + startIndex ; i < this.numSprites.length ; i ++)
        {
            this.numSprites[i].node.active = false;
        }

        //センタリング
        if(this.centeringNode)
        {
            this.centeringNode.x = (this.numSprites[0].node.x - this.numSprites[strShowNum.length - 1].node.x) / 2;
        }
    }




    get time():number
    {
        return this._time;
    }


    set time(value:number)
    {
        let intVal:number = Math.floor(value);
        if (intVal == this._time) return;

        this._time = intVal;

        let min:number = Math.floor(intVal / 60);
        let sec:number = intVal - 60 * min;
        let strShowNum:string = (min < 10) ? "0" + min : "" + min;
        strShowNum += (sec < 10) ? ":0" + sec : ":" + sec;

        for (let i:number = 0 ; i < strShowNum.length ; i++)
        {
            let char:string = strShowNum.substr(i, 1);
            if (char == ":")
            {
                this.numSprites[i].spriteFrame = this.colonSpriteFrame;
                continue;
            }
            
            if(this.spriteAtlas != null)
            {
                this.numSprites[i].spriteFrame = this.spriteAtlas.getSpriteFrames()[Number(char)];
            }
            else
            {
                this.numSprites[i].spriteFrame = this.numSpriteFrames[Number(char)];
            }
        }
    }

    
    
    /**
     * 徐々に上昇する
     * @param value 最終的な値
     * @param duration 時間
     */
    public to (value:number, duration:number):void
    {
        this.node.active = true;
        
        if (this.toSE)
        {
            cc.audioEngine.stop(this._seID);
            this._seID = cc.audioEngine.play(this.toSE, true, 0.3);
        }
        
        let startNum:number = this._num;

        this.node.stopAllActions();
        this.node.runAction(
            cc.sequence
            (
                cc.valueTo(duration, startNum, value, (val:number)=>
                {
                    this.num = val;
                }),
                cc.callFunc(()=>
                {
                    this.num = value;       //追加(20210413)
                    if(this.toSE) cc.audioEngine.stop(this._seID);
                })
            )
        );
    }


    

    /**
     * 色を変更
     * @param color 変更カラー
     */
    public setColor (color:cc.Color):void
    {
        for(let i:number = 0 ; i < this.numSprites.length ; i ++)
        {
            this.numSprites[i].node.color = color;
        }
    }

    /**
     * 強制で0にする
     */
    public resetNum():void
    {
        this._num = -1;
        this.num = 0;
    }
    

}
