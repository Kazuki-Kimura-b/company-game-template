import SceneChanger from "../common/SceneChanger";
import SleepListener from "../common/SleepListener";
import TapEffect from "../common/TapEffect";
import SE from "../common/SE";
import AnsButton from "../answerComponents/AnsButton";

const {ccclass, property} = cc._decorator;





@ccclass
export default class TitleMain extends cc.Component {

    @property(cc.Canvas) canvas:cc.Canvas = null;
    @property(cc.Node) contentsNode: cc.Node = null;
    @property(cc.Node) markR: cc.Node = null;
    @property(cc.Node) markU: cc.Node = null;
    @property(cc.Node) loadingBar: cc.Node = null;
    @property({type:cc.AudioClip}) seStartButton:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seShowAnswerButton:cc.AudioClip = null;  //ここでは使わない。ボタン初期化のため




    private _sceneChanger :SceneChanger = null;

    /**
     * ゲーム開始時
     */
    start ()
    {

        AnsButton.setShowAnswreButtonSE(this.seShowAnswerButton);

        // BGMの音量を初期化するため
        SE.bgmSetVolume(1.0);

        this.loadingBar.active = false;

        this._sceneChanger = this.getComponent(SceneChanger);

        let sleepListener:SleepListener = this.node.getComponent(SleepListener);
        sleepListener.setup();

        //動的にGoogle Analyticsを入れる
        {
            let el:HTMLScriptElement = document.createElement("script");
            el.src = "https://www.googletagmanager.com/gtag/js?id=UA-59291210-17";
            document.body.appendChild(el);

            let el2:HTMLScriptElement = document.createElement("script");
            el2.innerHTML = "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'UA-59291210-17');";
            document.body.appendChild(el2);
        }

        //フェードインが終わった
        this._sceneChanger.sceneStart(()=>
        {
        });
    }

    /**
     * スタートボタンを押した
     * @param event 
     */
    private onPressStartButton(event):void
    {
        //スタートボタン音
        SE.play(this.seStartButton);
        
        //タップエフェクト
        TapEffect.instance().setParticeFromEvent(event);

        //ロード開始
        this.loadingBar.active = true;
        this.loadingBar.scaleX = 0;

        //読み込むシーン名
        let loadSceneName:string = "introduction";

        //初回なら次は絶対ゲーム画面なのでonLoadの中で実行しといた方がよい。
        //2回目以降はメニューを読み込むのが良い
        cc.director.preloadScene(loadSceneName,
            //ロード中
            (completeCount:number, totalCount:number, item:any)=>
            {
                this.loadingBar.scaleX = completeCount / totalCount;
            },
            //ロード完了
            (error:Error)=>
            {
                this.loadingBar.active = false;
                //フェードアウト (このsceneChangerがnullになる可能性？ #132)
                this._sceneChanger.sceneEnd(event, ()=>
                {
                    //ステージ選択画面へ
                    //cc.director.loadScene("menu");
                    cc.director.loadScene(loadSceneName);
                });

            }
        );
    }
}
