import BugTracking from "../common/BugTracking";
import SchoolAPI from "../common/SchoolAPI";
import SE from "../common/SE";
import SystemIcon from "../common/SystemIcon";
import FinishScreen, { FinishColor } from "../game/FinishScreen";
import IjinScreen from "../game/IjinScreen";
import VSScreen from "../game/VSScreen";
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
    @property(IjinScreen) ijinScreen:IjinScreen = null;
    @property(cc.Sprite) bgSprtite:cc.Sprite = null;
    @property(StoryScreen) storyScreen:StoryScreen = null;
    @property(cc.Node) loadingBarNode:cc.Node = null;
    @property(cc.Node) vsScreenParentNode:cc.Node = null;
    @property(cc.Node) finishScreenParentNode:cc.Node = null;
    @property({ type:cc.AudioClip }) seWarp:cc.AudioClip = null;
    @property({ type:cc.AudioClip }) bgmAudioClip:cc.AudioClip = null;
    @property(cc.Prefab) vsScreenPrefab:cc.Prefab = null;
    @property(cc.Prefab) btnPrefab:cc.Prefab = null;
    @property(cc.Prefab) playerStatusBarPrefab:cc.Prefab = null;
    @property(cc.Prefab) finishScreenPrefab:cc.Prefab = null;
    @property(cc.Prefab) sceneLoadIndicator: cc.Prefab = null;
    @property(cc.Material) circleMaterial:cc.Material = null;


    private _vsScreen:VSScreen = null;
    private _flgLoadedIjinImage:boolean = false;
    private _flgLoadedBgImage:boolean = false;
    private _finishScreen:FinishScreen = null;
    private _gameSceneLoaded:boolean = false;       //事前読み込みが終わってる
    private _standByGameScene:boolean = false;      //このシーンが終わったので読み込み完了待ち

    //--------------------------------------------------------------------------------------------------
    //
    // ストーリーの開始、画面タップでストーリー進む。全部終わるとVS画面になる
    //
    //　・画像読み込み、ストーリーの取得　←　ここでやる
    //
    //　・ストーリー表示　←　ストーリー再生プレハブに任せる（クイズ結果で再利用するためプレハブにして切り離す）
    //
    //　・ＶＳ画面表示　←　ここでやる
    //
    //--------------------------------------------------------------------------------------------------

    

    start ()
    {

        this.ijinScreen.setup();
        this.ijinScreen.hide();
        this.ijinScreen.ijinScaleTo(IjinScreen.SCALE_STORY, 0);
        this.ijinScreen.ijinMoveTo(cc.v2(0,IjinScreen.Y_STORY), 0);

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

        this.storyScreen.setup(this.ijinScreen, this.canvas.node);

        //フィニッシュスクリーンをセット
        let fsNode:cc.Node = cc.instantiate(this.finishScreenPrefab);
        this.finishScreenParentNode.addChild(fsNode);
        this._finishScreen = fsNode.getComponent(FinishScreen);
        this._finishScreen.setupWithClose(FinishColor.YELLOW, FinishColor.YELLOW);

        // 相手情報を取得し登録
        cc.loader.loadRes("json/opponent", (err, res) => {
            if (err) {
                console.log("データを読み込めませんでした。");
                return;
            }
            StaticData.opponentCPUs = res.json;
            cc.log(StaticData.opponentCPUs);
            cc.log(StaticData.ijinData);
            this._loadMainIjinImage();
            this._loadBgImage();
        })
    }

    /**
     * 偉人の画像を読み込む
     */
    private _loadMainIjinImage():void
    {
        this._loadImage("ijin_image", StaticData.ijinData.ijin_image_url, (image:cc.SpriteFrame)=>
        {
            cc.log(StaticData.ijinData.ijin_image_url);
            if(image == null)//読み込み失敗
            {
                BugTracking.notify("偉人画像の読み込みに失敗", "IntroductionMain._loadMainIjinImage()",
                {
                    msg:"偉人画像の読み込みに失敗\n" + StaticData.ijinData.ijin_image_url,
                    url:StaticData.ijinData.ijin_image_url,
                    ijinData:StaticData.ijinData
                });
                return;
            }

            StaticData.ijinData.ijinImageSpriteFrame = image;

            this._flgLoadedIjinImage = true;
            this._checkLoadedIjinAndBG();
        });
    }


    /**
     * 背景を読み込む
     */
    private _loadBgImage():void
    {
        this._loadImage("bg_image", StaticData.ijinData.vertical_background_image_url, (image:cc.SpriteFrame)=>
        {
            if(image == null)//読み込み失敗
            {
                BugTracking.notify("背景画像の読み込みに失敗", "IntroductionMain._loadBgImage()",
                {
                    msg:"背景画像の読み込みに失敗\n" + StaticData.ijinData.vertical_background_image_url,
                    url:StaticData.ijinData.vertical_background_image_url,
                    ijinData:StaticData.ijinData
                });
                return;
            }

            StaticData.ijinData.verticalBGSpriteFrame = image;

            this._flgLoadedBgImage = true;
            this._checkLoadedIjinAndBG();
        });
    }


    private _checkLoadedIjinAndBG()
    {
        //まだ片方が読み込めてない
        if(! this._flgLoadedIjinImage || ! this._flgLoadedBgImage) return;
        
        //偉人と背景のグラフィックを表示
        this.ijinScreen.setIjinImage(StaticData.ijinData.ijinImageSpriteFrame);
        this.bgSprtite.spriteFrame = StaticData.ijinData.verticalBGSpriteFrame;

        //フィニッシュスクリーン（開始用）がはける
        this._finishScreen.endFinishAction(()=>
        {
            
        });

        //タイムマシーンの表示
        cc.tween({}).delay(1.5).call(()=>{ SE.play(this.seWarp); }).start();
        
        this._showTimeMachine(()=>
        {
            //BGMの開始
            SE.bgmStart(this.bgmAudioClip);
            //ストーリーの開始
            this._showStory();
        });
        
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




    /**
     * 画像を読み込む
     */
    private _loadImage(key:string, url:string, callback:(image:cc.SpriteFrame)=>void):void
    {
        SchoolAPI.loadImage(key, url, (response:any)=>
        {
            if(response.error != null) callback(null); 
            else callback(response.image);
        });
    }


    /**
     * ストーリーの開始
     */
    private _showStory():void
    {
        let script:string = StaticData.ijinData.appearance_script;

        //----

        //少し待ってから開始
        cc.tween({})
        .delay(0.5)
        .call(()=>
        {
            //ストーリーを開始する
            this.storyScreen.setupStory(StaticData.ijinData.short_name, script);
            this.storyScreen.onComplete(()=>
            {
                26
                this._endIntroduction();
            });

            this.storyScreen.startStory();
        })
        .start();
    }



    

    /**
     * 会話を終了し、ゲーム画面へ
     */
    private _endIntroduction():void
    {
        SE.bgmStop();
        // let vsNode:cc.Node = cc.instantiate(this.vsScreenPrefab);
        // this.vsScreenParentNode.addChild(vsNode);

        // this._vsScreen = vsNode.getComponent(VSScreen);

        // this._vsScreen.setCanvasAndCamera(this.canvas, this.mainCamera);
        // this._vsScreen.showVS(this.canvas.node, this.ijinScreen, this._finishScreen.node, (itemIDs:number[], code:string)=>
        // {
        
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
    // update (dt) {}
}
