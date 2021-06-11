import { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;


export enum APIErrorType
{
    OFFLINE,        // オフラインで通信に失敗、再接続をさせる
    FAILED_RETRY,   // API側でエラー、再度同じ処理をする
    FAILED_CLOSE,   // API側でエラー、ゲームをリセット
    WARNING,        // 警告のみ出す。ゲームは進行できる
    TIME_OUT        // APIからの応答なし
}


@ccclass
export default class APIErrorPopup extends cc.Component {

    @property(cc.Node) board:cc.Node = null;
    @property(cc.Label) output:cc.Label = null;
    @property(cc.Label) buttonsLabel:cc.Label = null;
    @property(cc.Button) btnRetry:cc.Button = null;

    private _callback:()=>void = null;


    /**
     * エラーポップアップの表示、タイプごとに異なる処理をする
     * @param errorType 
     * @param callback 
     */
    public setup(errorType:APIErrorType, callback:()=>void):void
    {
        this._callback = callback;

        if(errorType == APIErrorType.OFFLINE)
        {
            this.output.string = "インターネットに\nせつぞくできませんでした。\n\n通信環境のよい場所で\n「再接続」ボタンを\n押してください。";
            this.buttonsLabel.string = "再接続";
            this.output.node.color = cc.color(43, 60, 255);
            this.btnRetry.node.active = true;
        }
        else if(errorType == APIErrorType.FAILED_RETRY)
        {
            this.output.string = "システムとのつうしんに\nしっぱいしました。\n\n通信環境のよい場所で\n「通信」ボタンを\n押してください。";
            this.buttonsLabel.string = "通 信";
            this.output.node.color = cc.color(150, 0, 150);
            this.btnRetry.node.active = true;
        }
        else if(errorType == APIErrorType.FAILED_CLOSE)
        {
            this.output.string = "システムとのつうしんに\nしっぱいしました。\n\nブラウザのリロードボタンで\n再度読み込んでください。";
            this.output.node.color = cc.color(148, 0, 0);
            this.btnRetry.node.active = false;
        }
        else if(errorType == APIErrorType.WARNING)
        {
            this.output.string = "システムとのつうしんに\nしっぱいしました。\n\n後でもう一度\nお試しください。";
            this.buttonsLabel.string = "O K";
            this.output.node.color = cc.color(255, 120, 30);
            this.btnRetry.node.active = true;
        }
        else if(errorType == APIErrorType.TIME_OUT)
        {
            this.output.string = "システムからへんじが\nかえってきません。\n\nブラウザのリロードボタンで\n再度読み込んでください。";
            this.output.node.color = cc.color(36, 92, 14);
            this.btnRetry.node.active = false;
        }

        this.board.scale = 0;
        cc.tween(this.board)
        .to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
        .start();
    }


    private onPressOKButton(event:any):void
    {
        event.target.active = false;

        cc.tween(this.board)
        .to(0.3, { scale:0.0 }, { easing:EasingName.backIn })
        .call(()=>
        {
            this._callback();
            this.node.removeFromParent(true);
        })
        .start();
    }

}
