import SceneChanger from "../common/SceneChanger";
import SleepListener from "../common/SleepListener";
import TapEffect from "../common/TapEffect";
import SE from "../common/SE";
import AnsButton from "../answerComponents/AnsButton";
import StaticData from "../StaticData";
import ExAPI from "../common/ExAPI";

const {ccclass, property} = cc._decorator;





@ccclass
export default class TitleMain extends cc.Component {

    @property(cc.Canvas) canvas:cc.Canvas = null;
    @property(cc.Node) contentsNode: cc.Node = null;
    @property(cc.Node) markR: cc.Node = null;
    @property(cc.Node) markU: cc.Node = null;
    @property(cc.Node) loadingBar: cc.Node = null;
    @property(cc.Node) startButton: cc.Node = null;
    @property({type:cc.AudioClip}) seStartButton:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seShowAnswerButton:cc.AudioClip = null;  //ここでは使わない。ボタン初期化のため

    private _sceneChanger :SceneChanger = null;

    /**
     * ゲーム開始時
     */
    start ()
    {
        this.startButton.active = false;
        ExAPI.importGameSettings(() => {
            this.startButton.active = true;

            if (StaticData.testMode) {
                cc.log("テストモード");
            } else {
                // 本番環境
                let rf: string = window.location.search;
                if (rf) {
                    rf = rf.slice(1);
                    StaticData.reference = rf;
                }
            }
        });

        // シーンを事前に読み込む
        cc.director.preloadScene("introduction",
            //ロード中
            (completeCount:number, totalCount:number, item:any)=>
            {
                this.loadingBar.scaleX = completeCount / totalCount;
            },
            //ロード完了
            (error:Error)=>
            {
                if(this.loadingBar) this.loadingBar.scaleY = 0;
            }
        );

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

        cc.director.preloadScene("introduction",
            //ロード中
            (completeCount:number, totalCount:number, item:any)=>
            {
                this.loadingBar.scaleX = completeCount / totalCount;
            },
            //ロード完了
            (error:Error)=>
            {
                this.loadingBar.active = false;

                this._sceneChanger.sceneEnd(event, ()=>
                {
                    cc.director.loadScene("introduction");
                });

            }
        );
    }
}
