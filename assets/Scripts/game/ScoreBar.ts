import BitmapNum from "../common/BitmapNum";
import SE from "../common/SE";
import StaticData from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ScoreBar extends cc.Component
{
    @property(cc.Sprite) resultSprites:cc.Sprite[] = [];
    @property(cc.SpriteFrame) resMaruSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) resBatsuSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) resNotSpriteFrame:cc.SpriteFrame = null;
    @property(cc.Label) nameOutput:cc.Label = null;
    @property(BitmapNum) scoreCounter:BitmapNum = null;
    @property({type:cc.AudioClip}) seAddScore:cc.AudioClip = null;

    protected _results:boolean[] = [];


    public setup():void
    {
        for(let i:number = 0 ; i < this.resultSprites.length ; i ++)
        {
            this.resultSprites[i].spriteFrame = this.resNotSpriteFrame;
        }
        this.nameOutput.string = StaticData.playerData.nickname;
        this.scoreCounter.resetNum();
    }


    public addScore(rightAnswer:boolean, gameScore:number):void
    {
        this.scoreCounter.to(gameScore, 0.8);

        if(rightAnswer) SE.play(this.seAddScore);

        //10問以上はバグるので外す。単体テストだけ11問目がある
        if(this._results.length < 10)
        {
            let resultSprite:cc.Sprite = this.resultSprites[this._results.length];
            resultSprite.spriteFrame = (rightAnswer) ? this.resMaruSpriteFrame : this.resBatsuSpriteFrame;
        }

        this._results.push(rightAnswer);
    }


    public getResultData():any
    {
        return null;
    }


    public getBonusLandingPos(parentNode:cc.Node):cc.Vec2
    {
        let wPos:cc.Vec2 = this.scoreCounter.node.convertToWorldSpaceAR(cc.v2());
        let lPos:cc.Vec2 = parentNode.convertToNodeSpaceAR(wPos);
        return lPos;
    }



}
