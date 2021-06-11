import QuestionData from "./QuestionData";
import StaticData, { GameMode } from "../StaticData";
import BitmapNum from "../common/BitmapNum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FormatDisplay extends cc.Component {

    @property(cc.Sprite) formatImageSprite: cc.Sprite = null;
    @property(BitmapNum) shutokuQuestionDisp: BitmapNum = null;
    @property(cc.Node) shutokuQuestion10Node: cc.Node = null;
    @property(cc.Sprite) shutokuQuestionNumSprite: cc.Sprite = null;
    @property(cc.Label) challengeCountAndRateOutput: cc.Label = null;

    @property(cc.SpriteFrame) spInputNum: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spInputText: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spExchange: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spGroup: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spLine: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spMarubatsu: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spMulti: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spNitaku: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spOrder: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spSel4: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spSlot: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spRensou: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) spMushikui: cc.SpriteFrame = null;
    

    public setup():void
    {
        if(StaticData.gameModeID == GameMode.HAYABEN || StaticData.gameModeID == GameMode.GHOST)
        {
            this.formatImageSprite.node.active = false;
            this.shutokuQuestionDisp.node.active = true;
        }
        else
        {
            this.shutokuQuestionDisp.node.active = false;
        }
    }


    /**
     * 問題のフォーマットを表示
     * @param questionData 問題データ
     */
    public showFormat(questionData:QuestionData):void
    {
        if(StaticData.gameModeID == GameMode.HAYABEN || StaticData.gameModeID == GameMode.GHOST) return;

        let format:string = questionData.format;
        let spriteFrame:cc.SpriteFrame = null;
        if (format == "交換") spriteFrame = this.spExchange;
        else if (format == "フリーもじ入力" || format == "指定もじ入力")
        {
            if(questionData.option1 == "") spriteFrame = this.spInputNum;
            else spriteFrame = this.spInputText;
        }
        else if (format == "グルーピング") spriteFrame = this.spGroup;
        else if (format == "ペアリング") spriteFrame = this.spLine;
        else if (format == "ならべかえ") spriteFrame = this.spExchange;
        else if (format == "マルバツ") spriteFrame = this.spMarubatsu;
        else if (format == "複数回答") spriteFrame = this.spMulti;
        else if (format == "ヨコ2択" || format == "タテ2択") spriteFrame = this.spNitaku;
        else if (format == "順番") spriteFrame = this.spOrder;
        else if (format == "ヨコ4択" || format == "タテ4択" || format == "スクエア4択") spriteFrame = this.spSel4;
        else if (format == "連想") spriteFrame = this.spRensou;
        else if (format == "スロット") spriteFrame = this.spSlot;
        else if (format == "虫食い入力") spriteFrame = this.spMushikui;

        this.formatImageSprite.spriteFrame = spriteFrame;

        /*
        this.node.scale = 0.3;
        this.node.runAction(
            cc.scaleTo(0.2, 1.0).easing(cc.easeBackOut())
        );*/
    }


    public showShutokuQuestionNum(questionNum:number):void
    {
        if(questionNum >= 10)
        {
            this.shutokuQuestion10Node.active = true;
            this.shutokuQuestionNumSprite.node.x = 38;
            this.shutokuQuestionDisp.num = questionNum % 10;
        }
        else
        {
            this.shutokuQuestion10Node.active = false;
            this.shutokuQuestionNumSprite.node.x = 0;
            this.shutokuQuestionDisp.num = questionNum;
        }
    }


    public showChallengeCountAndRate(questionData:QuestionData):void
    {
        this.challengeCountAndRateOutput.string = questionData.challenging_num + "回目   正解率" + questionData.correct_answer_rate + "%";
    }


    /*
    public hide():void
    {
        this.node.runAction(
            cc.sequence
            (
                cc.scaleTo(0.3, 0.7).easing(cc.easeBackIn()),
                cc.callFunc(()=>
                {
                    this.node.active = false;
                })
            )
        );
    }
    */
    
}
