import BitmapNum from "../common/BitmapNum";
import FitHeight from "../common/FitHeight";
import PlayTrackLog from "../common/PlayTrackLog";
import SchoolText from "../common/SchoolText";
import SE from "../common/SE";
import STFormat from "../common/STFormat";
import { EasingName } from "../StaticData";
import Result from "./Result";

const {ccclass, property} = cc._decorator;



@ccclass("RankBoard")
class RankBoard
{
    @property(cc.Node) rankBoardNode:cc.Node = null;
    @property(cc.Sprite) boardSprite:cc.Sprite = null;
    @property(cc.Sprite) iconSprite:cc.Sprite = null;
    @property(SchoolText) nameOutput:SchoolText = null;
    @property(BitmapNum) scoreCounter:BitmapNum = null;
}



class BoardUsers
{
    constructor
    (
        public face:cc.SpriteFrame,
        public name:string,
        public score:number,
        public me:boolean
    ){}
}


@ccclass
export default class ResultGoriben extends Result
{
    @property(cc.Node) izinImageNode:cc.Node = null;
    @property(cc.Node) izinMsgNode:cc.Node = null;
    @property(cc.Node) backgroundNode:cc.Node = null;
    @property(cc.Widget) topWidget: cc.Widget = null;
    @property(cc.Widget) bottomWidget: cc.Widget = null;
    @property(cc.Node) winnerHukidashiNode:cc.Node = null;
    @property(cc.Node) tapScreenIcon:cc.Node = null;
    @property(cc.Node) tapScreenIconEffect:cc.Node = null;
    @property(cc.SpriteFrame) playerBoardSpriteFrame:cc.SpriteFrame = null;
    @property(RankBoard) rankBoards:RankBoard[] = [];
    @property({type:cc.AudioClip}) seSlideIn:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seBtnNext:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seShowResult:cc.AudioClip = null;


    private _users:BoardUsers[] = null;


    
    //override
    public setup(data:any, compCallback:(code:number)=>void):void
    {
        PlayTrackLog.add("ResultGoriben.setup()");
        
        super.setup(data, compCallback);

        //レイアウト調整
        this.topWidget.target = data.canvasNode;
        this.topWidget.top = 0;
        this.bottomWidget.target = data.canvasNode;
        this.bottomWidget.bottom = 0;



        let rowData:{faces:cc.SpriteFrame[], names:string[], scores:number[]} = data;

        //let users:{face:cc.SpriteFrame, name:string, score:number, me:boolean}[] = [];
        let users:BoardUsers[] = [];

        for(let i:number = 0 ; i < rowData.names.length ; i ++)
        {
            users.push({face:rowData.faces[i], name:rowData.names[i], score:rowData.scores[i], me:false });
        }
        users[0].me = true;

        //降順ソート(ランキングの順位に並ぶ)
        users.sort((a,b)=>{ return (a.score < b.score) ? 1 : -1; });

        //準備、いったん隠す
        for(let i:number = 0 ; i < users.length ; i ++)
        {
            this.rankBoards[i].iconSprite.spriteFrame = users[i].face;

            let format:STFormat = STFormat.create({
                size: (i < 2) ? 38 : 35,
                margin: 2,
                lineHeight: 60,
                rows: 1,
                columns: 10,
                horizontalAlign: SchoolText.HORIZONTAL_ALIGH_LEFT_ZERO,
                verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
                color: cc.color(0,0,0),
                yomiganaSize: 20,
                yomiganaMarginY: 2
            });

            this.rankBoards[i].nameOutput.createText(users[i].name, format);
            this.rankBoards[i].nameOutput.flushText();




            this.rankBoards[i].scoreCounter.resetNum();

            //プレーヤーのボード
            if(users[i].me)
            {
                this.rankBoards[i].boardSprite.spriteFrame = this.playerBoardSpriteFrame;
            }

            this.rankBoards[i].rankBoardNode.active = false;
            this.rankBoards[i].rankBoardNode.x += 750;      //画面外に出す
        }
        
        this.izinImageNode.active = false;
        this.izinMsgNode.active = false;
        this.winnerHukidashiNode.active = false;
        this.tapScreenIcon.active = false;
        this.tapScreenIconEffect.active = false;

        this._users = users;
    }


    /**
     * リザルトの開始
     */
    public startAction():void
    {
        PlayTrackLog.add("ResultGoriben.startAction()");
        
        //スコアボードが４つ出てくる
        for(let i:number = this._users.length - 1 ; i >= 0 ; i --)
        {
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(0.6 * (3 - i) + 0.5),
                    cc.callFunc(()=>
                    {
                        //スライド音
                        this._SE(this.seSlideIn);
                        
                        this.rankBoards[i].rankBoardNode.active = true;
                        this.rankBoards[i].rankBoardNode.runAction(
                            cc.sequence(
                                cc.moveBy(0.3, -750, 0).easing(cc.easeBackOut()),
                                cc.callFunc(()=>
                                {
                                    this.rankBoards[i].scoreCounter.to(this._users[i].score, 0.5);

                                    //プレーヤーが1位なら音が鳴る
                                    if(i == 0 && this._users[i].me)
                                    {
                                        SE.play(this.seShowResult);
                                    }
                                })
                            )
                        );

                    })
                )
            );
        }

        //画面下の偉人が出てくる
        this.node.runAction(
            cc.sequence(
                cc.delayTime(3.0),
                cc.callFunc(()=>
                {
                    //「勝利！」マーク
                    if(this._users[0].me)
                    {
                        this.winnerHukidashiNode.active = true;
                        this.winnerHukidashiNode.scale = 0.5;
                        cc.tween(this.winnerHukidashiNode)
                        .to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
                        .delay(0.7)
                        .to(0.3, { scale:0.0 }, { easing:EasingName.backIn })
                        .removeSelf()
                        .start();
                    }
                    

                    //偉人が出てくる
                    this.izinImageNode.x = 800;
                    this.izinImageNode.active = true;
                    this.izinImageNode.runAction(
                        cc.sequence(
                            cc.jumpTo(1.0, cc.v2(0,0), 40, 4),
                            //cc.moveBy(0.4, 0, 200).easing(cc.easeBackOut()),
                            cc.callFunc(()=>
                            {
                                //this.izinMsgNode.active = true;
                                //this.btnNext.node.active = true;

                                this._showTapScreenIcon();
                            })
                        )
                    );
                })
            )
        );
    }


    private _showTapScreenIcon():void
    {
        this.tapScreenIcon.active = true;
        this.tapScreenIconEffect.active = true;
        this.tapScreenIconEffect.opacity = 0;

        this.tapScreenIcon.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0, 0.5),
                    cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
                    cc.callFunc(()=>
                    {
                        this.tapScreenIconEffect.opacity = 128;
                        this.tapScreenIconEffect.scale = 1;
                        this.tapScreenIconEffect.runAction(
                            cc.spawn(
                                cc.fadeTo(0.5, 0),
                                cc.scaleTo(0.5, 2.0)
                            )
                        );
                    }),
                    cc.delayTime(0.6)
                )
            )
        );


        this.backgroundNode.once(cc.Node.EventType.TOUCH_START, (event:any)=>
        {
            //次のボタン音
            this._SE(this.seBtnNext);
            
            this.tapScreenIconEffect.stopAllActions();
            this.tapScreenIcon.stopAllActions();
            this.tapScreenIconEffect.active = false;
            this.tapScreenIcon.active = false;

            cc.tween({})
            .delay(0.8)
            .call(()=>
            {  
                this._compCallback(Result.RTN_GORIBEN_NEXT);
            })
            .start();
        });
    }



    /**
     * 数値を小数点第一までの文字列にして返す
     * @param score 
     */
    private _showScore(score:number):string
    {
        return Math.floor(score) + "";
        /*
        let str:string = score + "";
        let index:number = str.indexOf(".");
        if(index == -1) return str + ".0";
        return str.substr(0, index + 2);     //小数点第1位まで
        */
    }

}
