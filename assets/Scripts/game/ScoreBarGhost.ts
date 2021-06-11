import BitmapNum from "../common/BitmapNum";
import BugTracking from "../common/BugTracking";
import SE from "../common/SE";
import GameMain from "./GameMain";
import QuestionData from "./QuestionData";
import ScoreBar from "./ScoreBar";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ScoreBarGhost extends ScoreBar
{
    @property(cc.Sprite) ghostResultSprites:cc.Sprite[] = [];
    @property(BitmapNum) ghostScoreCounter:BitmapNum = null;

    private _ghostResults:boolean[];
    private _ghostGameScores:number[];


    //override
    public setup():void
    {
        super.setup();
        
        for(let i:number = 0 ; i < this.ghostResultSprites.length ; i ++)
        {
            this.ghostResultSprites[i].spriteFrame = this.resNotSpriteFrame;
        }
        this.ghostScoreCounter.resetNum();
    }


    /**
     * 問題データに付随するゴーストのレコードから点数を再現する
     * @param qDatas 
     * @returns 
     */
    public setupGhostScore(qDatas:QuestionData[]):void
    {
        this._ghostGameScores = [];
        this._ghostResults = [];
        let gBase:number = 0;
        let gTime:number = 0;
        let gCombo:number = 0;
        let gComboCount:number = 0;
        let logRequiredTimes:number[] = [];
        let logRemainingTimes:number[] = [];

        cc.log("ゴーストのスコア詳細");

        //ゴーストデータが全てあるか確認と、先に１０ゲームのスコアを作る
        for(let i:number = 0 ; i < qDatas.length ; i ++)
        {
            if(qDatas[i].ghost_required_time == null || qDatas[i].ghost_result == null)
            {
                BugTracking.notify("ゴーストの回答情報の取得に失敗", "SchoolBarGhost.setupGhostScore",
                {
                    msg:"ゴーストの回答情報の取得に失敗\n問題id: " + qDatas[i].id,
                    index:i,
                    ghost_required_time:qDatas[i].ghost_required_time,
                    ghost_result:qDatas[i].ghost_result,
                    qDatas:qDatas
                });
                return;
            }

            let gCorrect:boolean = qDatas[i].ghost_result;

            //ゴースト正解
            if(gCorrect)
            {
                gComboCount ++;

                gBase += 10;
                gTime += (40 - qDatas[i].ghost_required_time);
                gCombo += GameMain.COMBO_SCORE_LIST[gComboCount];
            }
            //ゴースト間違い
            else
            {
                gComboCount = 0;
            }

            let gScore:number = gBase + Math.floor(gTime * 0.25 * 10) / 10 + gCombo;
            this._ghostGameScores.push(gScore);
            this._ghostResults.push(gCorrect);

            logRequiredTimes.push(qDatas[i].ghost_required_time);
            logRemainingTimes.push(40 - qDatas[i].ghost_required_time);
        }

        cc.log("ゴーストのスコアの流れ:");
        cc.log(this._ghostGameScores);
        cc.log("かかった時間:");
        cc.log(logRequiredTimes);
        cc.log("残り時間:");
        cc.log(logRemainingTimes);
    }


    public getGhostCurrentScore(qNum:number):number
    {
        return this._ghostGameScores[qNum];
    }


    //override
    public addScore(rightAnswer:boolean, gameScore:number):void
    {
        super.addScore(rightAnswer, gameScore);

        //ゴーストのスコア加算

        //何問目かの確認はプレーヤーの解答数を利用する
        let qNum:number = this._results.length - 1;


        cc.tween({})
        .delay(0.5)
        .call(()=>
        {
            SE.play(this.seAddScore);
            
            this.ghostScoreCounter.to(this._ghostGameScores[qNum], 0.8);
            let resultSprite:cc.Sprite = this.ghostResultSprites[qNum];
            resultSprite.spriteFrame = (this._ghostResults[qNum]) ? this.resMaruSpriteFrame : this.resBatsuSpriteFrame;
        })
        .start();
    }


    //override
    public getResultData():any
    {
        return { lastScore: this._ghostGameScores[this._ghostGameScores.length - 1] };
    }

}
