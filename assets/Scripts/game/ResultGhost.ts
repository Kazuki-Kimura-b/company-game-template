import BitmapNum from "../common/BitmapNum";
import PlayTrackLog from "../common/PlayTrackLog";
import SE from "../common/SE";
import EventUnkoSensei from "../opening/EventUnkoSensei";
import StaticData, { EasingName, SpecialEvent } from "../StaticData";
import GameBG_Ghost from "./bg/GameBG_Ghost";
import Result from "./Result";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ResultGhost extends Result
{

    @property(cc.Widget) headerWidget:cc.Widget = null;
    @property(cc.Node) winText: cc.Node = null;
    @property(cc.Node) loseText: cc.Node = null;
    @property(cc.Node) playerNode:cc.Node = null;
    @property(cc.Node) playerScoreBoard:cc.Node = null;
    @property(BitmapNum) playerScoreCounter:BitmapNum = null;
    @property(cc.Node) ghostNode:cc.Node = null;
    @property(cc.Node) ghostScoreBoard:cc.Node = null;
    @property(cc.Node) blackCover:cc.Node = null;
    @property(cc.Node) loseCover:cc.Node = null;
    @property(BitmapNum) ghostScoreCounter:BitmapNum = null;
    @property(cc.Prefab) eventUnkoSnsei:cc.Prefab = null;
    @property({type:cc.AudioClip}) seWinJingle: cc.AudioClip = null;
    @property({type:cc.AudioClip}) seLoseJingle: cc.AudioClip = null;

    private _senseiDefSpriteFrame:cc.SpriteFrame = null;
    private _gameBG:GameBG_Ghost = null;
    private _playerScore:number = 0;
    private _ghostScore:number = 0;
    private _canvasNode:cc.Node = null;


    //override
    public setup(data:any, compCallback:(code:number)=>void):void
    {
        PlayTrackLog.add("ResultGhost.setup()");
        
        super.setup(data, compCallback);

        this.headerWidget.target = data.canvasNode;
        this.headerWidget.top = 26;

        let res:any = data.response;        //サーバから返ってきたデータそのまま
        this._playerScore = res.scoring_total;
        this._ghostScore = res.high_score;

        this._gameBG = data.ghostBG;
        this._canvasNode = data.canvasNode;

        this.winText.active = false;
        this.loseText.active = false;
        
        this.ghostScoreCounter.resetNum();
        this.playerScoreCounter.resetNum();

        this.ghostNode.active = false;
        this.playerNode.active = false;

        this.loseCover.active = false;
        this.blackCover.active = true;
    }


    /**
    * リザルトの開始
    */
    public startAction():void
    {
        PlayTrackLog.add("ResultGhost.startAction()");
        
        let highScore:number = (this._playerScore > this._ghostScore) ? this._playerScore : this._ghostScore;

        let __ACTION__:(node:cc.Node, counter:BitmapNum, score:number)=>void = (node:cc.Node, counter:BitmapNum, score:number)=>
        {
            node.active = true;
            node.scale = 0;
            cc.tween(node)
            .delay(0.5)
            .to(0.3, { scale:0.75 }, { easing:EasingName.backOut })
            .delay(0.1)
            .call(()=>
            {
                counter.to(score, score / 200);
            })
            .start();
        };

        __ACTION__(this.playerNode, this.playerScoreCounter, this._playerScore);
        __ACTION__(this.ghostNode, this.ghostScoreCounter, this._ghostScore);

        cc.tween(this.blackCover)
        .delay(highScore / 200 + 1.3)
        .to(0.2, { opacity:0 })
        .call(()=>
        {
            //結果発表
            if(this._isWin()) this._win();
            else this._lose();
        })
        .removeSelf()
        .start();
    }


    /**
     * 勝敗を判定
     * @returns 
     */
    private _isWin():boolean
    {
        let pSc:number = Math.floor(this._playerScore);
        let gSc:number = Math.floor(this._ghostScore);
        return (pSc >= gSc);
    }



    /**
     * 勝ち演出
     */
    private _win():void
    {
        StaticData.ghostWin = true;
        
        this._winnerAction(this.playerNode);
        this._loserAction(this.ghostNode, this.ghostScoreBoard);


        //スコアを消す
        //this.yourScoreNode.active = false;
        //this.ghostScoreCounter.node.active = false;
        
        
        //背景を明るいのに変更
        //this._gameBG.changeWinBG();

        //ジングル
        SE.play(this.seWinJingle, false, 1.0);


        //勝ちテキスト
        this.winText.scale = 0.0;
        this.winText.active = true;
        this.winText.runAction(
            cc.sequence(
                cc.delayTime(0.8),
                cc.spawn(
                    cc.scaleTo(0.3, 1.5).easing(cc.easeIn(2.0)),
                    cc.rotateBy(0.3, 360)
                ),
                cc.delayTime(0.2),
                cc.scaleTo(0.3, 0.8).easing(cc.easeInOut(2.0))
            )
        );

        cc.tween({})
        .delay(2.5)
        .call(()=>
        {
            this._showScoreResult();
        })
        .start();
    }



    /**
     * 負け演出
     */
    private _lose():void
    {
        StaticData.ghostWin = false;
        
        this._winnerAction(this.ghostNode);
        this._loserAction(this.playerNode, this.playerScoreBoard);

        //負けた時の幕
        this.loseCover.active = true;
        this.loseCover.y += 800;
        cc.tween(this.loseCover)
        .to(0.3, { y:800 })
        .start();
        
        
        //ジングル
        SE.play(this.seLoseJingle, false, 1.0);

        //負けテキスト
        this.loseText.y = 900;
        this.loseText.active = true;
        this.loseText.runAction(
            cc.sequence(
                cc.delayTime(0.4),
                cc.moveTo(0.3, 0, 286).easing(cc.easeIn(2.0)),
                cc.jumpBy(0.3, 0, 0, 50, 1),
                cc.rotateTo(0.1, -15)
            )
        );
        
        cc.tween({})
        .delay(2.5)
        .call(()=>
        {
            this._showScoreResult();
        })
        .start();
    }


    private _winnerAction(node:cc.Node):void
    {
        cc.tween(node)
        .to(0.4, { scale:1.0 }, { easing:EasingName.backOut })
        .start();
    }

    private _loserAction(node:cc.Node, boardNode:cc.Node):void
    {
        cc.tween(node)
        .to(0.2, { scale:0.66 }, { easing:EasingName.sineInOut })
        .start();

        cc.tween(boardNode)
        .to(0.2, { color:cc.color(80, 80, 80) }, { easing:EasingName.sineInOut })
        .start();
    }



    /**
     * 先生との会話を挟んでハヤ勉と同じ結果画面を出す
     */
    private _showScoreResult():void
    {
        let node:cc.Node = cc.instantiate(this.eventUnkoSnsei);
        this.node.addChild(node);

        let sensei:EventUnkoSensei = node.getComponent(EventUnkoSensei);
        let canvas:cc.Canvas = this._canvasNode.getComponent(cc.Canvas);
        sensei.setup(canvas, SpecialEvent.GHOST_END);

        //導入シーンで取得した勝利、敗北メッセージを利用する
        let script:string = StaticData.ghostWin ? StaticData.navigatorConversations.win_result[0] : StaticData.navigatorConversations.lose_result[0];

        sensei.startEventStory(script, ()=>
        {
            this._compCallback(Result.RTN_GHOST_NEXT);
        });
    }


}
