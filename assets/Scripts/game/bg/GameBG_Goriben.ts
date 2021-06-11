import GameBG from "./GameBG";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBG_Goriben extends GameBG {

    @property(cc.Node) izinNodes: cc.Node[] = [];
    @property(cc.Node) startCover: cc.Node = null;
    

    //初期化
    public setup():void
    {
        cc.log("GameBG_Goriben::setup");
        
        //顔を上下に動かす

        this.node.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.delayTime(0.5),
                    cc.callFunc(()=>
                    {
                        let rNum:number = Math.floor(Math.random() * this.izinNodes.length);
                        let izin:cc.Node = this.izinNodes[rNum];

                        izin.runAction(
                            cc.jumpBy(0.5, 0, 0, 8, 1)
                        );
                    })
                )
            )
        );
    }


    //問題表示直前
    public showQuestion (questionCount: number):void
    {
        cc.log("GameBG_Goriben::showQuestion");
    }


    //正解
    public rightAnswer (comboCount:number):void
    {
        cc.log("GameBG_Goriben::rightAnswer");
        
        /*
        let interval:number = 0.1;
        
        for(let i:number = 0 ; i < this.lightNodes.length ; i ++)
        {
            this.lightNodes[i].opacity = 32;
            this.lightNodes[i].runAction(
                cc.repeat(
                    cc.sequence(
                        cc.delayTime(interval * i),
                        cc.fadeTo(0.0, 255),
                        cc.delayTime(interval),
                        cc.fadeTo(0.0, 32),
                        cc.delayTime(interval * (2 - i))
                    ),
                    6
                )
            );
        }
        */
    }


    //不正解
    public wrongAnswer (comboCount:number):void
    {
        cc.log("GameBG_Goriben::wrongAnswer");
        
        /*
        for(let i:number = 0 ; i < this.lightNodes.length ; i ++)
        {
            this.lightNodes[i].opacity = 32;
        }
        */
    }


    //タイムアップ
    public timeUp (comboCount:number):void
    {
        cc.log("GameBG_Goriben::timeUp");
        
        this.wrongAnswer(comboCount);
    }


    /**
     * すべての問題が終了した時 (これないとAPIで演出が止まる。どうしたものか)
     */
    public finish (callback:()=>void):void
    {
        cc.log("GameBG_Goriben::finish");
        
        //2秒待つ。本当はフィニッシュ演出
        this.node.runAction(
            cc.sequence(
                cc.delayTime(2.0),
                cc.callFunc(()=>
                {
                    callback();
                })
            )
        );
    }


    public showStartCover():void
    {
        this.startCover.active = true;
    }

    public hideStartCover():void
    {
        this.startCover.active = false;
    }
    
    
}
