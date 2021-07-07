import NegaEffector from "../common/NegaEffector";
import ExAPI from "../common/ExAPI";
import SE from "../common/SE";
import SystemIcon from "../common/SystemIcon";
import FinishScreen from "../game/FinishScreen";
import CharaUnkoSensei from "../opening/CharaUnkoSensei";
import StoryScreen from "./StoryScreen";
import StaticData from "../StaticData";
import UnkoGet from "../game/UnkoGet";

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
    @property(cc.Prefab) unkoGetPrefab: cc.Prefab = null;
    @property(cc.SpriteFrame) unko: cc.SpriteFrame = null;
    @property(cc.Node) unkoParentNode: cc.Node = null;
    @property(cc.Node) menuBoard: cc.Node = null;
    @property(cc.Node) endButtons: cc.Node[] = [];


    private _sensei: CharaUnkoSensei = null;
    private _negaEffector: NegaEffector = null;
    private _finishScreen:FinishScreen = null;
    private _background: cc.Node = null;


    start ()
    {
        // 背景を読み込み
        this._background = cc.instantiate(this.bgPrefab);
        this.bgParentNode.addChild(this._background);

        // うんこ先生を読み込み
        if (!StaticData.gameSetting.useCharaUnkosensei) {
            this.unkoSenseiParentNode.active = false;
        }
        let usNode: cc.Node = cc.instantiate(this.charaUnkoSenseiPrefab);
        this.unkoSenseiParentNode.addChild(usNode);
        this._sensei = usNode.getComponent(CharaUnkoSensei);
        this._sensei.setup();

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

        if (StaticData.gameSetting.specificResultNum > 0) {
            this._finishScreen.setupWithClose("end");
            this._finishScreen.showFinishTexts();
        } else {
            this._finishScreen.setupWithClose("default");
            this._finishScreen.hideFinishTexts();
        }

        if (!StaticData.opponentData.name) {
            ExAPI.importGameSettings(() => {
                // フィニッシュスクリーン（開始用）がはける
                this._finishScreen.endFinishAction(()=>
                {
                    this._showStory();
                });
            });
        } else {
            this._finishScreen.endFinishAction(()=>
                {
                    this._showStory();
                });
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
        // セリフの読み込み
        let fileName: string = null;
        switch (StaticData.gameSetting.specificResultNum) {
            case 0:
                fileName = "introductionScript";
                break;
            case 1:
                fileName = "endingScript1";
                break;
            case 2:
                fileName = "endingScript2";
                break;
            case 3:
                fileName = "endingScript3";
                break;
        }
        cc.loader.loadRes(`json/${fileName}`, (err, res) => {
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
                this.storyScreen.setupStory(StaticData.opponentData.name, script);
                this.storyScreen.onComplete(()=>
                {
                    if (StaticData.gameSetting.specificResultNum > 0) {
                        this._endUnkoGet(() => {
                            this._openMenu();
                        });
                    } else {
                        this._endIntroduction();
                    }
                });
                this.storyScreen.startStory();
            })
            .start();
        });
    }

    private _endUnkoGet(completeCallback: () => void): void {
        let unkoGetNode:cc.Node = cc.instantiate(this.unkoGetPrefab);
		let unkoGet:UnkoGet = unkoGetNode.getComponent(UnkoGet);
		unkoGet.setup(this.unko, ()=>
		{
			unkoGetNode.removeFromParent();
			completeCallback();
		});

		// this.frontEffect.node.addChild(unkoGetNode);
        this.unkoParentNode.addChild(unkoGetNode);
    }

    private _openMenu(): void {
        this.menuBoard.runAction(cc.moveTo(0.2, 0, -36));
    }

    /**
     * 会話を終了し、ゲーム画面へ
     */
     private _endIntroduction():void
     {
         SE.bgmStop();
         this._finishScreen.setupAtGameMode("start");
         this._finishScreen.finishShow(()=>
         {
             this.loadingBarNode.active = true;      //ロードバーを出す
             SystemIcon.create(this.sceneLoadIndicator);     //読み込み中アイコン
             cc.director.loadScene("game");
         });
     }

     private _hideButtons(num): void {
         this.endButtons[num].runAction(cc.scaleTo(0.2, 0).easing(cc.easeCubicActionIn()));
     }

     private onPressTitleButton(): void {
         this.node.runAction(
             cc.sequence(
                 cc.callFunc(() => {
                    this._hideButtons(0);
                    this._hideButtons(1);
                    this._hideButtons(2);
                 }),
                 cc.delayTime(0.4),
                 cc.callFunc(() => {cc.director.loadScene("title");})
             )
         )
     }

     private onPressOtherButton(): void {
        this.node.runAction(
            cc.sequence(
                cc.callFunc(() => {
                    this._hideButtons(0);
                    this._hideButtons(1);
                    this._hideButtons(2);
                }),
                cc.delayTime(1),
                cc.callFunc(() => {
                    this.menuBoard.runAction(cc.moveTo(0.4, 0, 832).easing(cc.easeCubicActionIn()));

                })
            )
        )
     }

     private onPressEndButton(): void {
        this.node.runAction(
            cc.sequence(
                cc.callFunc(() => {
                   this._hideButtons(0);
                   this._hideButtons(1);
                   this._hideButtons(2);
                }),
                cc.delayTime(1),
                cc.callFunc(() => {window.location.href = "https://unkogakuen.com"})
            )
        )
     }


    //タイムマシーンの演出開始
    // private _showTimeMachine(callback:()=>void):void
    // {
    //     //positionYのゴールは 8 → -1.2
    //     let posY_st:number = 8 - 4;
    //     let posY_ed:number = -1.2 + 0.2;

    //     cc.tween({})
    //     .to(2.0, {}, { onUpdate:(target:object, ratio: number)=>
    //     {
    //         let positionX:number = ratio * 0.2;
    //         let positionY:number = ratio * (posY_ed - posY_st) + posY_st;
            
    //         this.circleMaterial.setProperty("positionX", positionX);
    //         this.circleMaterial.setProperty("positionY", positionY);
    //     }})
    //     .call(()=>
    //     {
    //         callback();
    //     })
    //     .start();
    // }

    // update (dt) {}
}
