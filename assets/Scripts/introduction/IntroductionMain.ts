import NegaEffector from "../common/NegaEffector";
import ExAPI from "../common/ExAPI";
import SE from "../common/SE";
import SystemIcon from "../common/SystemIcon";
import FinishScreen from "../game/FinishScreen";
import CharaUnkoSensei from "./CharaUnkoSensei";
import StoryScreen from "./StoryScreen";
import StaticData from "../StaticData";
import UnkoGet from "../game/UnkoGet";
import IjinScreen from "../game/IjinScreen";
import IntroductionBG from "../game/bg/GameBG_introduction";

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
    @property(cc.Node) btnSkip: cc.Node = null;


    private _sensei: IjinScreen = null;
    private _negaEffector: NegaEffector = null;
    private _finishScreen:FinishScreen = null;
    private _background: cc.Node = null;

    start ()
    {
        // 背景を読み込み
        this._background = cc.instantiate(this.bgPrefab);
        this.bgParentNode.addChild(this._background);

        // うんこ先生を読み込み
        if (StaticData.gameSetting.useCharaUnkosensei) {
            this.unkoSenseiParentNode.active = false;
            let usNode: cc.Node = cc.instantiate(this.charaUnkoSenseiPrefab);
            this.unkoSenseiParentNode.addChild(usNode);
            this._sensei = usNode.getComponent(CharaUnkoSensei);
        } else {
            this._sensei = this._background.getChildByName("IjinScreen").getComponent(IjinScreen);
        }
        
        this._sensei.setup();
        this._sensei.hide();

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

        //暗転シェーダー
        this._negaEffector = this.getComponent(NegaEffector);
        this._negaEffector.canvasNode = this.canvas.node;

        let _introductionBG = this.bgParentNode.children[0].getComponent(IntroductionBG);
        // エフェクトを追加
        this.storyScreen.onStoryCommonCallback((code:string, subCode:string)=>
        {
            if(code == "changeFace")
            {
                _introductionBG.changeSenseiFace(Number(subCode));
            }
        });

        this.storyScreen.setup(this._sensei, this.canvas.node);

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
        this.btnSkip.active = true;
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
                        if (StaticData.gameSetting.specificResultNum === 3) {
                            this._endUnkoGet(() => {
                                this._openMenu();
                            });
                        } else {
                            this._openMenu();
                        }
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
         this.btnSkip.active = false;
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

    // update (dt) {}
}
