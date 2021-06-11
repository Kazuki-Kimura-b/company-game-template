import BugTracking from "../common/BugTracking";
import NegaEffector from "../common/NegaEffector";
import PlayerStatusBar from "../common/PlayerStatusBar";
import PlayTrackLog from "../common/PlayTrackLog";
import SchoolAPI from "../common/SchoolAPI";
import SE from "../common/SE";
import StoryScreen from "../introduction/StoryScreen";
import StaticData, { EasingName, SpecialEvent } from "../StaticData";
import CharaUnkoSensei from "./CharaUnkoSensei";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EventUnkoSensei extends cc.Component
{
    @property(cc.Sprite) background:cc.Sprite = null;
    @property(cc.Node) unkoSenseiParentNode:cc.Node = null;
    @property(cc.Node) storyScreenParentNode:cc.Node = null;
    @property(cc.Node) playerStatusParentNode:cc.Node = null;
    //サブキャラクター
    @property(cc.Node) semi:cc.Node = null;
    @property(cc.Node) centerGhost:cc.Node = null;
    @property(cc.Node) backGhost:cc.Node = null;
    //うんこロボ関連
    @property(cc.Node) gokouA:cc.Node = null;
    @property(cc.Node) gokouB:cc.Node = null;
    //名前入力関連
    @property(cc.Node) nameInputBoard:cc.Node = null;
    @property(cc.EditBox) nameEditBox:cc.EditBox = null;
    @property(cc.Button) btnReset:cc.Button = null;
    @property(cc.Button) btnEnter:cc.Button = null;
    //背景
    @property(cc.SpriteFrame) bgGhostSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) bgKakuninSpriteFrame:cc.SpriteFrame = null;
    //プレハブ
    @property(cc.Prefab) charaUnkoSenseiPrefab:cc.Prefab = null;
    @property(cc.Prefab) storyScreenPrefab:cc.Prefab = null;
    @property(cc.Prefab) playerStatusBarPrefab:cc.Prefab = null;
    @property(cc.Prefab) selectButtonPrefab:cc.Prefab = null;        //選択ボタン
    //音
    @property({type:cc.AudioClip}) bgm:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seShock:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seJet:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seRoboKansei:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seStatusShow:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seExpUp:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seExpEnd:cc.AudioClip = null;



    private _sensei:CharaUnkoSensei = null;
    private _playerStatusBar: PlayerStatusBar = null;
    private _storyScreen: StoryScreen = null;
    private _semiTween:cc.Tween = null;
    private _negaEffector:NegaEffector = null;
    


    public setup(canvas:cc.Canvas, specialEvent:SpecialEvent):void
    {
        PlayTrackLog.add("EventUnkoSensei.setup()");
        
        let usNode:cc.Node = cc.instantiate(this.charaUnkoSenseiPrefab);
        this.unkoSenseiParentNode.addChild(usNode);
        
        this._sensei = usNode.getComponent(CharaUnkoSensei);
        this._sensei.setup();
        this.semi.active = false;
        this.gokouA.active = false;
        this.gokouB.active = false;

        //イベントごとの分岐
        if(specialEvent == SpecialEvent.OPENING_B)
        {
            this.background.node.color = cc.color(0,0,0);
            this._sensei.toColor(0, cc.color(0,0,0), null);
            this.nameEditBox.string = StaticData.playerData.nickname;
        }
        else if(specialEvent == SpecialEvent.KAKUNIN_START || StaticData.specialEvent == SpecialEvent.KAKUNIN_END)
        {
            //背景を確認テスト用にする
            this.background.spriteFrame = this.bgKakuninSpriteFrame;
            this._sensei.hide();
        }
        else if(specialEvent == SpecialEvent.GHOST_START || StaticData.specialEvent == SpecialEvent.GHOST_END)
        {
            //背景をゴースト用にする
            this.background.spriteFrame = this.bgGhostSpriteFrame;
            this._sensei.hide();
        }


        //プレーヤーのステータスバー
        let psNode:cc.Node = cc.instantiate(this.playerStatusBarPrefab);
        this.playerStatusParentNode.addChild(psNode);
        this._playerStatusBar = psNode.getComponent(PlayerStatusBar);
        this._playerStatusBar.setup(canvas.node);
        this._playerStatusBar.hideStatus();

        //戻るボタンと設定ボタンをロック
        this._playerStatusBar.backButtonEnabled(false);
        this._playerStatusBar.settingButtonEnabled(false);

        //暗転シェーダー
        this._negaEffector = this.getComponent(NegaEffector);
        this._negaEffector.canvasNode = canvas.node;

        //ストーリースクリーン
        let ssNode:cc.Node = cc.instantiate(this.storyScreenPrefab);
        this.storyScreenParentNode.addChild(ssNode);
        this._storyScreen = ssNode.getComponent(StoryScreen);
        this._storyScreen.setup(this._sensei, this._playerStatusBar, canvas.node);
        this._storyScreen.setButtonPrefab(this.selectButtonPrefab);


        this._storyScreen.onStoryCommonCallback((code:string, subCode:string)=>
        {
            // 先生が真っ黒からフェードインで入ってくる
            if(code == "senseiFadeIn")
            {
                this._sensei.toColor(1.0, cc.color(255,255,255), ()=>
                {
                    this._storyScreen.resumeNextPage();
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
            // 名前入力ウィンドウを出す
            else if(code == "nameInput")
            {
                this.nameInputBoard.active = true;
                this.nameInputBoard.scale = 0.1;
                cc.tween(this.nameInputBoard)
                .to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
                .start();
            }
            // 先生に指定のエフェクトを表示
            else if(code == "effect")
            {
                this._sensei.effect(subCode);
            }
            // 部屋が明るくなる
            else if(code == "lightOn")
            {
                this._sensei.effectIkari();
                
                cc.tween(this.background.node)
                .to(0.5, { color:cc.color(255,255,255) })
                .start();
            }
            // 部屋が暗くなる
            else if(code == "lightOff")
            {
                cc.tween(this.background.node)
                .to(0.5, { color:cc.color(0,0,0) })
                .start();
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
            // うんこぜみが飛んで登場
            else if(code == "semiFlyAndShow")
            {
                this._storyScreen.closeWindow(true, ()=>{
                    this._flyingSemi(()=>{
                        this._showSemi(()=>{
                            this._semiEffect(true);
                            this._storyScreen.resumeNextPage();
                            //this._storyScreen.openWindow(()=>{
                            //    this._storyScreen.resumeNextPage();
                            //});
                        });
                    });
                });
            }
            // うんこぜみが中央に登場
            else if(code == "semiShow")
            {
                this._showSemi(()=>
                {
                    this._storyScreen.resumeNextPage();
                });
            }
            // うんこぜみが掃ける
            else if(code == "semiHide")
            {
                this._hideSemi(()=>
                {
                    this._storyScreen.resumeNextPage();
                });
            }
            // うんこぜみが飛び回る
            else if(code == "semiFly")
            {
                this._flyingSemi(()=>
                {
                    this._flyingSemi(()=>{});
                });
            }
            // うんこぜみに後光が出る
            else if(code == "semiEffect")
            {
                this._semiEffect(subCode == "TRUE");
            }
            // ゴーストを中央に表示
            else if(code == "ghostShowCenter")
            {
                this._storyScreen.closeWindow(true, ()=>{
                    this._showGhostCenter(()=>{
                        this._storyScreen.resumeNextPage();
                    });
                });
            }
            // ゴーストを背後に表示
            else if(code == "ghostShowBack")
            {
                this._storyScreen.closeWindow(true, ()=>{
                    this._showGhostBack(()=>{
                        this._storyScreen.resumeNextPage();
                    });
                });
            }
            else if(code == "ghostHide")
            {
                this._hideGhost(()=>{
                    this._storyScreen.resumeNextPage();
                });
            }
            // ガーンエフェクト
            else if(code == "negaEffect")
            {
                this._negaEffect(()=>
                {
                    this._storyScreen.resumeNextPage();
                });
            }
            // 効果音を再生
            else if(code == "sePlay")
            {
                let clip:cc.AudioClip;
                if(subCode == "jet") clip = this.seJet;
                else if(subCode == "statusShow") clip = this.seStatusShow;
                else if(subCode == "expUp") clip = this.seExpUp;
                else if(subCode == "expEnd") clip = this.seExpEnd;
                              
                SE.play(clip);
            }
            // BGMを再生、停止
            else if(code == "bgm")
            {
                if(subCode == "TRUE") SE.bgmStart(this.bgm);
                else SE.bgmStop();
            }
        });
    }




    public startEventStory(script:string, callback:()=>void):void
    {
        //ゴーストの日付を置き換え
        //<ghost_date> -> X月X日
        script = script.replace(/<ghost_date>/g, StaticData.ghostDate);

        //簡易タグを正式なタグに変更
        script = script.replace(/<ghostShowCenter>/g, "<callback,ghostShowCenter,stop>");
        script = script.replace(/<ghostShowBack>/g, "<callback,ghostShowBack,stop>");
        script = script.replace(/<ghostHide>/g, "<callback,ghostHide,stop>");

        
        this._storyScreen.setupStory("うんこ{先生,せんせい}", script);
        this._storyScreen.onComplete(()=>
        {
            callback();
        });
        this._storyScreen.startStory();
    }





    //セミが飛び回る
    private _flyingSemi(callback:()=>void):void
    {
        if(this._semiTween) this._semiTween.stop();
        
        this.semi.x = 960;
        this.semi.y = -500;
        this.semi.angle = 50;
        this.semi.active = true;

        
        this._semiTween = cc.tween(this.semi)
        .call(()=>{ SE.play(this.seJet); })
        .to(1.0, { position:cc.v3(-960, 300, 0) })
        .to(0.0, { angle:-50, position: cc.v3(-960, -500, 0) })
        .delay(0.3)
        .call(()=>{ SE.play(this.seJet); })
        .to(1.0, { position:cc.v3(960, 300, 0) })
        .to(0.0, { angle:0, position:cc.v3(960, -200, 0) })
        .delay(0.3)
        .call(()=>
        {
            this.semi.active = false;    
            callback();
        })
        .start();
    }


    //セミ登場
    private _showSemi(callback:()=>void):void
    {
        if(this._semiTween) this._semiTween.stop();
        
        this.semi.x = 0;
        this.semi.y = 0;
        this.semi.angle = 0;
        this.semi.scale = 0;
        this.semi.active = true;

        this._semiTween = cc.tween(this.semi)
        .to(0.5, { scale:1.0 }, { easing:EasingName.backOut })
        .call(()=>{ callback(); })
        .start();
    }


    //セミがはける
    private _hideSemi(callback:()=>void):void
    {
        if(this._semiTween) this._semiTween.stop();
        
        this._semiTween = cc.tween(this.semi)
        .to(1.0, { position:cc.v3(0, 2000,0) }, { easing:EasingName.sineIn })
        .call(()=>
        {
            this.semi.active = false;    
            callback();
        })
        .start();
    }


    private _semiEffect(value:boolean)
    {
        this.gokouA.active = value;
        this.gokouB.active = value;

        if(value)
        {
            SE.play(this.seRoboKansei);
            
            cc.tween(this.gokouA)
            .repeatForever(
                cc.tween().by(2.0, { angle:36 })
            )
            .start();

            cc.tween(this.gokouB)
            .repeatForever(
                cc.tween().by(5.0, { angle:-36 })
            )
            .start();
        }
        else
        {
            cc.Tween.stopAllByTarget(this.gokouA);
            cc.Tween.stopAllByTarget(this.gokouB);
        }
    }


    //ゴーストがセンターに出現
    private _showGhostCenter(callback:()=>void):void
    {
        if(this.backGhost.active)
        {
            this._hideGhost(()=>{ this._showGhostCenter(callback); });
            return;
        }

        this.centerGhost.active = true;
        this.centerGhost.scale = 0.7;
        this.centerGhost.opacity = 0;
        cc.tween(this.centerGhost)
        .to(0.6, { scale:1.0, opacity:255 }, { easing:EasingName.backOut })
        .call(()=>{ callback(); })
        .start();

        //上下左右に揺れる
        this._swingGhost(this.centerGhost);
    }


    //ゴーストが背後に出現
    private _showGhostBack(callback:()=>void):void
    {
        if(this.centerGhost.active)
        {
            this._hideGhost(()=>{ this._showGhostBack(callback); });
            return;
        }
        
        this.backGhost.active = true;
        this.backGhost.opacity = 0;
        cc.tween(this.backGhost)
        .to(0.6, { opacity:255 }, { easing:EasingName.sineInOut })
        .call(()=>{ callback(); })
        .start();

        //上下左右に揺れる
        this._swingGhost(this.backGhost);
    }


    private _swingGhost(target:cc.Node):void
    {
        let ghostBody:cc.Node = target.children[0];
        ghostBody.x = -15;
        ghostBody.y = 0;

        cc.Tween.stopAllByTarget(ghostBody);

        cc.tween(ghostBody)
        .repeatForever(
            cc.tween()
            .to(1.0, { x:15 }, { easing:EasingName.sineInOut })
            .to(1.0, { x:-15 }, { easing:EasingName.sineInOut })
        )
        .start();

        cc.tween(ghostBody)
        .repeatForever(
            cc.tween()
            .to(1.6, { y:10 }, { easing:EasingName.sineInOut })
            .to(1.6, { y:0 }, { easing:EasingName.sineInOut })
        )
        .start();
    }


    private _hideGhost(callback:()=>void):void
    {
        if(this.centerGhost.active)
        {
            cc.tween(this.centerGhost)
            .to(0.6, { opacity:0 })
            .call(()=>{
                this.centerGhost.active = false;    
                callback();
            })
            .start();
        }
        
        if(this.backGhost.active)
        {
            cc.tween(this.backGhost)
            .to(0.6, { opacity:0 })
            .call(()=>{
                this.backGhost.active = false;    
                callback();
            })
            .start();
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



    // 名前入力で決定ボタンを押した
    private onPressEnterButton(event):void
    {
        if(this.nameEditBox.string == "")
        {
            return;
        }

        this.btnEnter.interactable = false;
        this.btnReset.interactable = false;

        // API叩いて変更を保存
        if(this.nameEditBox.string != StaticData.playerData.nickname)
        {
            SchoolAPI.school_settings(this.nameEditBox.string, StaticData.playerData.bgm_enabled, StaticData.playerData.bgm, StaticData.playerData.se_enabled, (status:boolean)=>
            {
                if(status)
                {
                    StaticData.playerData.nickname = this.nameEditBox.string;
                    
                    this._closeNameInputBoard();
                }
                else
                {
                    this.btnEnter.interactable = true;
                    this.btnReset.interactable = true;

                    BugTracking.notify("名前変更に失敗", "OpeningB_Main.onPressEnterButton()",
                    {
                        msg:"名前変更に失敗",
                        old_name:StaticData.playerData.nickname,
                        new_name:this.nameEditBox.string
                    });
                }
            });
        }
        else
        {
            this._closeNameInputBoard();
        }
    }


    private _closeNameInputBoard():void
    {
        cc.tween(this.nameInputBoard)
        .to(0.3, { scale:0.1 }, { easing:EasingName.backIn })
        //.call(()=>{ this.nameInputBoard.active = false; })        //これが生きて悪さしてるかも
        .removeSelf()
        .start();

        cc.tween({})
        .delay(1.0)
        .call(()=>
        {
            this._storyScreen.resumeNextPage();
        })
        .start();
    }


    private onPressNameResetButton(event):void
    {
        this.nameEditBox.string = StaticData.playerData.nickname;
    }



}
