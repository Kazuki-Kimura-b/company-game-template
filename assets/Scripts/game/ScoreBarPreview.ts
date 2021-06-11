import GameMain from "./GameMain";
import QuestionData from "./QuestionData";
import ScoreBar from "./ScoreBar";
import TestLocalData from "./TestLocalData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ScoreBarPreview extends ScoreBar
{
    private _gameMain:GameMain = null;
    

    //override
    public setup():void
    {
        this.node.active = (location.hostname == "localhost");

        // iframeで読み込まれている場合に親のDOM変更を検知
        if (window !== window.parent)
        {
            const target: HTMLInputElement = (<HTMLInputElement>window.parent.document.getElementById('js_review_game_json_params'));
            const observer: MutationObserver = new MutationObserver(records =>
            {
                console.log(target);
                console.log(target.value);
                let previewQuestionData: QuestionData = null;
                try
                {
                    previewQuestionData = JSON.parse(target.value);
                    console.log(previewQuestionData);
                    this._gameMain.showPreviewQuestion(previewQuestionData);
                }
                catch(error)
                {
                    console.log(error);
                    alert(error);
                }
            });
            observer.observe(target, {
                attributes: true,
                attributeFilter: ['value']
            });
        }
    }



    public setupGameMain(gameMain:GameMain):void
    {
        this._gameMain = gameMain;
    }



    /**
     * 「再表示」ボタンを押した時
     */
    private onPressResetButton():void
    {
        let dummyData:QuestionData = TestLocalData.getPreviewQuestionDataA();
        if(dummyData == null) return;

        //問題を表示
        this._gameMain.showPreviewQuestion(dummyData);
    }



    /**
     * 「再表示」ボタンを押した時
     */
    private onPressResetButton2():void
    {
        let dummyData:QuestionData = TestLocalData.getPreviewQuestionDataB();
        if(dummyData == null) return;

        //問題を表示
        this._gameMain.showPreviewQuestion(dummyData);
    }


    //override
    public addScore(rightAnswer:boolean, gameScore:number):void
    {
        
    }


    //override
    public getBonusLandingPos(parentNode:cc.Node):cc.Vec2
    {
        //プレビューでは必要ないので適当な値
        return cc.v2(0,800);
    }
}
