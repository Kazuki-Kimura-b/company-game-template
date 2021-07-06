import NegaEffector from "../common/NegaEffector";
import ExAPI from "../common/ExAPI";
import SE from "../common/SE";
import SystemIcon from "../common/SystemIcon";
import FinishScreen, { FinishColor } from "../game/FinishScreen";
import CharaUnkoSensei from "../opening/CharaUnkoSensei";
import StaticData, { GameMode } from "../StaticData";
import StoryScreen from "./StoryScreen";

const {ccclass, property} = cc._decorator;

@ccclass
export default class IntroductionMain extends cc.Component
{

    @property(cc.Canvas) canvas:cc.Canvas = null;
    @property(cc.Camera) mainCamera:cc.Camera = null;
    @property(cc.Node) contentsNode:cc.Node = null;
    @property(cc.Node) markU:cc.Node = null;
    @property(cc.Node) markR:cc.Node = null;
    @property(cc.Node) unkoSenseiParentNode = null;
    @property(cc.Prefab) charaUnkoSenseiPrefab:cc.Prefab = null;
    @property(cc.Node) bgParentNode: cc.Node = null;
    @property(cc.Prefab) bgPrefab: cc.Prefab = null;
    @property(StoryScreen) storyScreen:StoryScreen = null;
    @property(cc.Node) loadingBarNode:cc.Node = null;
    @property(cc.Node) finishScreenParentNode:cc.Node = null;
    // @property({ type:cc.AudioClip }) seWarp:cc.AudioClip = null;
    @property({ type:cc.AudioClip }) bgmAudioClip:cc.AudioClip = null;
    @property({ type:cc.AudioClip }) seShock:cc.AudioClip = null;
    @property(cc.Prefab) finishScreenPrefab:cc.Prefab = null;
    @property(cc.Prefab) sceneLoadIndicator: cc.Prefab = null;
    @property(cc.Material) circleMaterial:cc.Material = null;


    private _sensei: CharaUnkoSensei = null;
    private _negaEffector: NegaEffector = null;
    private _finishScreen:FinishScreen = null;
    private _background: cc.Node = null;


    start ()
    {
        // 背景を読み込み
        this._background = cc.instantiate(this.bgPrefab);
        this.bgParentNode.addChild(this._background);

        if (StaticData.gameSetting.useNormalCharaIntro) {
            // うんこ先生を読み込み
            let usNode: cc.Node = cc.instantiate(this.charaUnkoSenseiPrefab);
            this.unkoSenseiParentNode.addChild(usNode);
            this._sensei = usNode.getComponent(CharaUnkoSensei);
            this._sensei.setup();
        }

        //ゲーム画面を事前読み込み
        this.loadingBarNode.active = false;     //ローディングバーは非表示にしておく

        cc.director.preloadScene("game",
            (completedCount:number, totalCount:number, item:any)=>
            {
                if(this.loadingBarNode != null) this.loadingBarNode.scaleX = completedCount / totalCount;
            },
            (error: Error)=>
            {
                //読み込み完了後にVS画面が終わって、不要なローディングバーを出そうとしてもscaleYが0なので表示されない
                if(this.loadingBarNode) this.loadingBarNode.scaleY = 0;
            }
        );

        this.storyScreen.setup(this._sensei, this.canvas.node);

        //暗転シェーダー
        this._negaEffector = this.getComponent(NegaEffector);
        this._negaEffector.canvasNode = this.canvas.node;

        // エフェクトを追加
        this.storyScreen.onStoryCommonCallback((code:string, subCode:string)=>
        {
            // 先生が真っ黒からフェードインで入ってくる
            if(code == "senseiFadeIn")
            {
                this._sensei.toColor(1.0, cc.color(255,255,255), ()=>
                {
                    this.storyScreen.resumeNextPage();
                });
            }
            // 先生の顔の画像を変更
            else if(code == "faceChange")
            {
                this._sensei.faceChange(subCode);
                this._sensei.unazuki();
            }
            // 先生の体の画像を変更
            else if(code == "bodyChange")
            {
                this._sensei.bodyChange(subCode);
            }
            // 先生、うなづく
            else if(code == "unazuki")
            {
                this._sensei.unazuki();
            }
            // 先生に指定のエフェクトを表示
            else if(code == "effect")
            {
                this._sensei.effect(subCode);
            }
            // 先生の表示・非表示
            else if(code == "senseiVisible")
            {
                this._sensei.node.active = (subCode == "TRUE");
            }
            // 先生をスケール0で非表示にする
            else if(code == "senseiScale0")
            {
                this._sensei.node.scale = 0;
            }
            // ガーンエフェクト
            else if(code == "negaEffect")
            {
                this._negaEffect(()=>
                {
                    this.storyScreen.resumeNextPage();
                });
            }
        });

        //フィニッシュスクリーンをセット
        let fsNode:cc.Node = cc.instantiate(this.finishScreenPrefab);
        this.finishScreenParentNode.addChild(fsNode);
        this._finishScreen = fsNode.getComponent(FinishScreen);
        this._finishScreen.setupWithClose(FinishColor.YELLOW, FinishColor.YELLOW);


        if (!StaticData.playerData) {
            ExAPI.importGameSettings(() => {
                this._showStory();
            });
        } else {
            this._showStory();
        }
    }

    private _negaEffect(callback:()=>void):void
    {
        //色反転
		this._negaEffector.setNega();

        SE.play(this.seShock);

        cc.tween({})
        .delay(1.2)
        .call(()=>
        {
            this._negaEffector.setDefault();
            callback();
        })
        .start();
    }

    /**
     * ストーリーの開始
     */
     private _showStory():void
    {
        // フィニッシュスクリーン（開始用）がはける
        this._finishScreen.endFinishAction(()=>
        {
        });

        // セリフの読み込み
        cc.loader.loadRes("json/introductionScript", (err, res) => {
            if (err) {
                "セリフの読み込みに失敗しました";
                return;
            }
            let script: string;
            res.json.script.forEach(line => {
                script += line;
            });
            // 少し待ってから開始
            cc.tween({})
            .delay(0.5)
            .call(()=>
            {
                this.storyScreen.setupStory("うんこ{先生,せんせい}", script);
                this.storyScreen.onComplete(()=>
                {
                    this._endIntroduction();
                });
                this.storyScreen.startStory();
            })
            .start();
        });
    }

    /**
     * 会話を終了し、ゲーム画面へ
     */
     private _endIntroduction():void
     {
         SE.bgmStop();

         //挑戦か修行を選択
         StaticData.gameModeID = GameMode.HAYABEN;
         this._finishScreen.setupAtGameMode(StaticData.gameModeID);
         this._finishScreen.finishShow(()=>
         {
             this.loadingBarNode.active = true;      //ロードバーを出す
             SystemIcon.create(this.sceneLoadIndicator);     //読み込み中アイコン
             cc.director.loadScene("game");
         });
         // });
     }


    //タイムマシーンの演出開始
    private _showTimeMachine(callback:()=>void):void
    {
        //positionYのゴールは 8 → -1.2
        let posY_st:number = 8 - 4;
        let posY_ed:number = -1.2 + 0.2;

        cc.tween({})
        .to(2.0, {}, { onUpdate:(target:object, ratio: number)=>
        {
            let positionX:number = ratio * 0.2;
            let positionY:number = ratio * (posY_ed - posY_st) + posY_st;
            
            this.circleMaterial.setProperty("positionX", positionX);
            this.circleMaterial.setProperty("positionY", positionY);
        }})
        .call(()=>
        {
            callback();
        })
        .start();
    }

    // update (dt) {}
}
