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
import GameIcon from "./GameIcon";
import Stamp from "./Stamp";

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
    @property(cc.Node) lastBoard: cc.Node = null;
    @property(cc.Node) gameArea: cc.Node = null;
    @property(cc.Node) stampArea: cc.Node = null;
    @property(cc.Prefab) gameIcon: cc.Node = null;
    @property(cc.Prefab) stamp: cc.Prefab = null;
    @property(cc.Node) lockModal: cc.Node = null;
    @property(cc.Node) breeGetModal: cc.Node = null;
    @property(cc.Node) breeGetMsg: cc.Node = null;

    @property({ type:cc.AudioClip }) bgmBefore:cc.AudioClip = null;
    @property({ type:cc.AudioClip }) bgmAfter:cc.AudioClip = null;


    private _sensei: IjinScreen = null;
    private _negaEffector: NegaEffector = null;
    private _finishScreen:FinishScreen = null;
    private _background: cc.Node = null;

    start ()
    {
        if (StaticData.gameSetting.specificResultNum > 0) {
            // ??????????????????????????????
            ExAPI.exGetTopContents((res) => {
                this.gameArea.setContentSize(750, 46 + (242 * Math.ceil(res.length / 3)));
                res.forEach((v, index) => {
                    ExAPI.loadImage(v.name, v.image_url, (result) => {
                        let node: cc.Node = cc.instantiate(this.gameIcon);
                        let controller: GameIcon = node.getComponent(GameIcon);
                        controller.image.spriteFrame = result.image;
                        controller.setBtnURL(`https://play.unkogakuen.com/manabi/game/${v.game_url}/?rf=game`);
                        node.setPosition(-218 + (218 * (index % 3)), -154 - (240 * Math.floor(index / 3)));
                        this.gameArea.addChild(node);
                    });
                });
                // ???????????????????????????
                if (StaticData.gameSetting.isStampMode) {
                    let gameKeys: string[] = [];
                    ExAPI.exGetStamp((res) => {
                        console.log(res);
                        Object.keys(res).forEach((v) => {
                            gameKeys.push(v);
                        });
                        this.stampArea.setContentSize(750, 46 + (242 * Math.ceil(gameKeys.length / 3)));
                        gameKeys.forEach((v, index) => {
                            ExAPI.loadImage("key", res[v].stamp_icon_url, (result) => {
                                let node: cc.Node = cc.instantiate(this.stamp);
                                let controller: Stamp = node.getComponent(Stamp);
                                controller.setName(res[v].name);
                                // ???????????????????????????????????????
                                if (index % 3 === 2) controller.text.active = true;
                                // ????????????????????????????????????????????????????????????
                                if (ExAPI.staticGetToken() !== "develop_token" && res[v].stamp) {
                                    controller.text.active = false;
                                    controller.unko.spriteFrame = result.image;
                                    controller.isGet = true;
                                }
                                node.setPosition(-218 + (218 * (index % 3)), -154 - (240 * Math.floor(index / 3)));
                                this.stampArea.addChild(node);
                            });
                        })
                    });
                } else {
                    // ??????????????????????????????
                    this.lastBoard.getChildByName("tab_stamp").active = false;
                }
            });
        }

        // ?????????????????????
        this._background = cc.instantiate(this.bgPrefab);
        this.bgParentNode.addChild(this._background);

        // ??????????????????????????????
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

        //????????????????????????????????????
        this.loadingBarNode.active = false;     //???????????????????????????????????????????????????

        cc.director.preloadScene("game",
            (completedCount:number, totalCount:number, item:any)=>
            {
                if(this.loadingBarNode != null) this.loadingBarNode.scaleX = completedCount / totalCount;
            },
            (error: Error)=>
            {
                //????????????????????????VS?????????????????????????????????????????????????????????????????????????????????scaleY???0???????????????????????????
                if(this.loadingBarNode) this.loadingBarNode.scaleY = 0;
            }
        );

        //?????????????????????
        this._negaEffector = this.getComponent(NegaEffector);
        this._negaEffector.canvasNode = this.canvas.node;

        let _introductionBG = this.bgParentNode.children[0].getComponent(IntroductionBG);

        // ????????????????????????
        this.storyScreen.onStoryCommonCallback((code:string, subCode:string)=>
        {
            if (code == "changeFace") {
                _introductionBG.changeSenseiFace(Number(subCode));
            }
        });

        this.storyScreen.setup(this._sensei, this.canvas.node);

        //?????????????????????????????????????????????
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
                // ????????????????????????????????????????????????????????????
                this._finishScreen.endFinishAction(()=>
                {
                    if (StaticData.gameSetting.specificResultNum > 0) SE.bgmStart(this.bgmBefore);
                    else SE.bgmStart(this.bgmAfter);
                    this._showStory();
                });
            });
        } else {
            this._finishScreen.endFinishAction(()=>
                {
                    if (StaticData.gameSetting.specificResultNum > 0) SE.bgmStart(this.bgmBefore);
                    else SE.bgmStart(this.bgmAfter);
                    this._showStory();
                });
        }
    }

    private _negaEffect(callback:()=>void):void
    {
        //?????????
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
     * ????????????????????????
     */
     private _showStory():void
    {
        this.btnSkip.active = true;
        // ????????????????????????
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
                "?????????????????????????????????????????????";
                return;
            }
            let script: string;
            res.json.script.forEach(line => {
                script += line;
            });
            // ???????????????????????????
            cc.tween({})
            .delay(0.5)
            .call(()=>
            {
                this.storyScreen.setupStory(StaticData.opponentData.name, script);
                this.storyScreen.onComplete(()=>
                {
                    this.btnSkip.active = false;

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
        if (!StaticData.gameSetting.isStampMode) {
            this.menuBoard.getChildByName("introduction_button_3").active = false;
            this.menuBoard.getChildByName("introduction_button_4").setPosition(0, -306);
            this.menuBoard.runAction(
                cc.sequence(
                    cc.moveTo(0.2, 0, 0),
                    cc.callFunc(() => {this._openBreeGetModal()})
                )
            );
        } else {
            this.menuBoard.runAction(
                cc.sequence(
                cc.moveTo(0.2, 0, 0),
                cc.callFunc(() => {this._openBreeGetModal()})
            ));
        }
    }

    private _openBreeGetModal(): void {
        if (StaticData.playerData.acquiredBree) {
            this.breeGetModal.active = true;
            this.breeGetMsg.runAction(cc.scaleTo(.4, 1).easing(cc.easeBackOut()));
        }
    }

    private onPressBreeGetModal(): void {
        this.breeGetMsg.runAction(
            cc.sequence(
                cc.scaleTo(.4, 0).easing(cc.easeBackIn()),
                cc.callFunc(() => this.breeGetModal.active = false)
            )
        );
    }

    /**
    * ???????????????????????????????????????
    */
    private _endIntroduction():void
    {
         SE.bgmStop();
         this._finishScreen.setupAtGameMode("start");
         this.btnSkip.active = false;
         this._finishScreen.finishShow(()=>
         {
             this.loadingBarNode.active = true;      //????????????????????????
             SystemIcon.create(this.sceneLoadIndicator);     //???????????????????????????
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
                    this._hideButtons(1);
                    this._hideButtons(2);
                    this._hideButtons(3);
                 }),
                 cc.delayTime(0.4),
                 cc.callFunc(() => {
                    cc.director.loadScene("title");
                    SE.bgmStop();
                })
             )
         )
    }

    private onPressTabButton(event, code: string): void {
        if (code === "game") {
            // ????????????????????????
            this.lastBoard.getChildByName("tabBar").color = new cc.Color(255, 100, 200);
            this.lastBoard.getChildByName("game").active = true;
            this.lastBoard.getChildByName("stamp").active = false;
            this.lastBoard.active = true;
        }
        else {
            // ???????????????????????????
            if (ExAPI.staticGetToken() === "develop_token") {
                // ???????????????????????????????????????????????????
                this.lockModal.opacity = 0;
                this.lockModal.active = true;
                this.lockModal.runAction(cc.fadeIn(0.2));
            }
            this.stampArea.children.forEach((v) => {
                v.getChildByName("fukidashi").active = false;
            });
            this.lastBoard.getChildByName("tabBar").color = new cc.Color(255, 240, 0);
            this.lastBoard.getChildByName("game").active = false;
            this.lastBoard.getChildByName("stamp").active = true;
            this.lastBoard.active = true;
        }
    }

    private onPressCancellastBoard(): void {
        this.lockModal.active = false;
        this.lastBoard.active = false;
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

    private onPressNyugakuButton(): void {
        window.location.href = "https://unkogakuen.com/users/sign_up";
    }

    private onPressNYugakuCancel(): void {
        this.lockModal.runAction(
            cc.sequence(
                cc.fadeOut(0.2),
                cc.callFunc(() => {this.lockModal.active = false;})
            )
        )
    }

}
