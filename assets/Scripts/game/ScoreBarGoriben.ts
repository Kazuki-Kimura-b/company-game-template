import BitmapNum from "../common/BitmapNum";
import { CPUData } from "../common/Models";
import SchoolAPI from "../common/SchoolAPI";
import SE from "../common/SE";
import StaticData, { EasingName } from "../StaticData";
import GameMain from "./GameMain";
import ScoreBar from "./ScoreBar";

const {ccclass, property} = cc._decorator;


@ccclass("IjinScoreBoard")
export class IjinScoreBoard
{
    @property(cc.Sprite) icon:cc.Sprite = null;
    @property(BitmapNum) scoreCounter:BitmapNum = null;
    @property(BitmapNum) scoreOutlineCounter:BitmapNum = null;
    @property(cc.Sprite) resultIcon:cc.Sprite = null;
}



@ccclass
export default class ScoreBarGoriben extends ScoreBar
{
    @property(IjinScoreBoard) ijinBoards:IjinScoreBoard[] = [];
    @property(BitmapNum) playerRankCounter:BitmapNum = null;
    @property(cc.SpriteFrame) ijinResultIconMaru:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) ijinResultIconBatsu:cc.SpriteFrame = null;


    private _ijinAddScoreList:number[][];
    private _ijinTotalScores:number[];
    private _ijinLastCorrect:boolean = false;


    //override
    public setup():void
    {
        super.setup();

        this.playerRankCounter.resetNum();
        this.playerRankCounter.node.active = false;
        
        //偉人３人のアイコンを読み込む
        this._loadIcon(0, this.ijinBoards[0].icon);
        this._loadIcon(1, this.ijinBoards[1].icon);
        this._loadIcon(2, this.ijinBoards[2].icon);

        for(let i:number = 0 ; i < 3 ; i ++)
        {
            this.ijinBoards[i].scoreCounter.resetNum();
            this.ijinBoards[i].scoreOutlineCounter.resetNum();
            this.ijinBoards[i].resultIcon.node.active = false;
        }
        
        let cpuDatas:CPUData[] = StaticData.opponentCPUs.cpu_data;
        let targetScores:number[] = [ cpuDatas[0].target_score, cpuDatas[1].target_score, cpuDatas[2].target_score ];

        this._ijinTotalScores = [0,0,0];

        //-------------------------------------- 最終的なスコアを決める---------------------------------

        cc.log(targetScores);       //偉人に設定されたスコア

        let scores:number[] = [];
        for(let i:number = 0 ; i < targetScores.length ; i ++)
        {
            let sc:number = targetScores[i];
            let rate:number = 0;

            //ちょっと減らす
            if(sc < 500) rate = 10;
            else if(sc < 1000) rate = 30;
            else rate = 50;

            scores.push( sc - Math.floor(Math.random() * rate) );
        }

        cc.log(scores);     //補正をかけたスコア

        //-------------------------------------- 正解数を決める（ターゲット偉人を決め、残り2人はさらに2~5問減らす--------------

        /*
        10問・・・20%
        9問・・・35%
        8問・・・40%
        7問・・・5%
        */

        let correctCount:number = 0;
        let rNum:number = Math.random();
        if(rNum < 0.05) correctCount = 7;
        else if(rNum < 0.45) correctCount = 8;
        else if(rNum < 0.8) correctCount = 9;
        else correctCount = 10;

        let subCorrectCountA:number = Math.random() < 0.6 ? correctCount - 2 : correctCount - 3;
        let subCorrectCountB:number = Math.random() < 0.3 ? correctCount - 3 : correctCount - 4;

        let correctCounts:number[] = [ correctCount, subCorrectCountA, subCorrectCountB ];

        cc.log(correctCounts);      //最終的な正解数

        //-------------------------------------- 正解、不正解、その時入るスコアを決める--------------

        //正解、不正解のリストを作る
        let __createCorrectList:(correctCount:number)=>boolean[] = (correctCount:number)=>
        {
            let list:boolean[] = [];
            //正解
            for(let i:number = 0 ; i < correctCount ; i ++)
            {
                list.push(true);
            }
            //不正解
            for(let i:number = 0 ; i < 10 - correctCount ; i ++)
            {
                list.splice(Math.floor(Math.random() * list.length + 1), 0, false);
            }
            return list;
        };

        //てんさいパワーのブースト無し(400点)の基準で何点取るか算出
        let __createNativeGetPoints:(correctList:boolean[])=>number[] = (correctList:boolean[])=>
        {
            let list:number[] = [];
            let combo:number = 0;

            for(let i:number = 0 ; i < 10 ; i ++)
            {
                //正解
                if(correctList[i])
                {
                    combo ++;
                    
                    let baseScore:number = 10;
                    let timeBonus:number = (Math.random() * 5 + 3) * 0.25;
                    let comboBonus:number = GameMain.COMBO_SCORE_LIST[combo];
                    let noHintBonus:number = 5;
                    let sc:number = baseScore + timeBonus + comboBonus + noHintBonus;
                    list.push(sc);
                }
                //不正解
                else
                {
                    combo = 0;
                    list.push(0);
                }
            }
            return list;
        };

        //合計値
        let __SUM:(list:number[])=>number = (list:number[])=>
        {
            let total:number = 0;
            for(let i:number = 0 ; i < list.length ; i ++)
            {
                total += list[i];
            }
            return total;
        };

        let __PROD:(list:number[], value:number)=>number[] = (list:number[], value:number)=>
        {
            for(let i:number = 0 ; i < list.length ; i ++)
            {
                list[i] *= value;
            }
            return list;
        };


        this._ijinAddScoreList = [];

        for(let i:number = 0 ; i < 3 ; i ++)
        {
            let correctList:boolean[] = __createCorrectList(correctCounts[i]);      //正解、不正解のリストを作成
            let nativeScores:number[] = __createNativeGetPoints(correctList);       //ブースト無しの点数を算出
            let totalScore:number = __SUM(nativeScores);        //ブースト無しの合計スコア
            totalScore += 20 * (10 - correctCounts[i]);         //不正解の箇所は20点として計算
            let rate = scores[i] / totalScore;                  //天才パワーの倍率を決める

            //コンボボーナスを考慮したスコア
            this._ijinAddScoreList.push(__PROD(nativeScores, rate));
        }

        cc.log("偉人たちのスコア遷移");
        cc.log(this._ijinAddScoreList);



        /*
        //ライバルの正解数仕様
        let __createAnsResultList:(score:number, correctCount:number)=>number[] = (score:number, correctCount:number)=>
        {
            let list:number[] = [];
            //let oneScore:number = Math.floor(score / correctCount);     //1問正解で入る点数
            let oneScore:number = Math.floor(score / 10);     //1問正解で入る点数
            
            //正解
            for(let i:number = 0 ; i < correctCount ; i ++)
            {
                list.push(oneScore);
            }
            //不正解
            for(let i:number = 0 ; i < 10 - correctCount ; i ++)
            {
                list.splice(Math.floor(Math.random() * list.length + 1), 0, 0);
            }
            return list;
        };

        //--------------------------------------

        this._ijinAddScoreList = [];

        for(let i:number = 0 ; i < 3 ; i ++)
        {
            //this.rivalScroeOuputs[i].string = this._showScore(0);
            this._ijinAddScoreList.push(__createAnsResultList(scores[i], correctCounts[i]));
        }
        */

    }

    
    private _loadIcon(index:number, iconSprite:cc.Sprite):void
    {
        let cpuData:CPUData = StaticData.opponentCPUs.cpu_data[index];
        if(cpuData.iconSpriteFrame != null)
        {
            iconSprite.spriteFrame = cpuData.iconSpriteFrame;
            return;
        }

        SchoolAPI.loadImage("ijin_icon" + index, cpuData.icon_image_url, (response:any)=>
        {
            StaticData.opponentCPUs.cpu_data[index].iconSpriteFrame = response.image;
            iconSprite.spriteFrame = response.image;
        });
    }


    //override
    public addScore(rightAnswer:boolean, gameScore:number):void
    {
        super.addScore(rightAnswer, gameScore);
        
        let ijinScores:number[];
        let ijinCorrects:boolean[];

        //これの意図が分からない
        if(this._ijinAddScoreList[0].length == 0)
        {
            ijinScores = [0,0,0];
            ijinCorrects = [false, false, false];
        }
        else
        {
            ijinScores = [this._ijinAddScoreList[0][0], this._ijinAddScoreList[1][0], this._ijinAddScoreList[2][0]];
            this._ijinAddScoreList[0].shift();
            this._ijinAddScoreList[1].shift();
            this._ijinAddScoreList[2].shift();

            ijinCorrects = [ijinScores[0] > 0, ijinScores[1] > 0, ijinScores[2] > 0];
        }

        //順番に偉人に加点、〇×が出てくる
        for(let i:number = 0 ; i < 3 ; i ++)
        {
            this._ijinTotalScores[i] += ijinScores[i];
            this.ijinBoards[i].resultIcon.spriteFrame = (ijinCorrects[i]) ? this.ijinResultIconMaru : this.ijinResultIconBatsu;
            
            cc.tween({})
            .delay(0.3 * (i + 1))
            .call(()=>
            {
                this.ijinBoards[i].scoreCounter.to(this._ijinTotalScores[i], 0.8);
                this.ijinBoards[i].scoreOutlineCounter.to(this._ijinTotalScores[i], 0.8);
                this.ijinBoards[i].resultIcon.node.active = true;
                this.ijinBoards[i].resultIcon.node.scale = 0.3;

                if(ijinCorrects[i]) SE.play(this.seAddScore);

                cc.tween(this.ijinBoards[i].resultIcon.node)
                .to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
                .delay(0.5)
                .call(()=>
                {
                    this.ijinBoards[i].resultIcon.node.active = false;
                })
                .start();
            })
            .start();
        }

        //プレーヤーの現在の順位を表示
        let rank:number = 4;
        if(gameScore >= this._ijinTotalScores[0]) rank --;
        if(gameScore >= this._ijinTotalScores[1]) rank --;
        if(gameScore >= this._ijinTotalScores[2]) rank --;

        this.playerRankCounter.node.active = true;
        this.playerRankCounter.num = rank;
        this._ijinLastCorrect = ijinCorrects[0];        //メイン偉人が正解したかどうか
    }


    //override
    public getResultData():any
    {
        return { ijinScores:this._ijinTotalScores };
    }


    //今の問題、偉人は正解したか返す
    public isIjinCorrect():boolean
    {
        return this._ijinLastCorrect;
    }


}
