import SettingWindow from "../menu/SettingWindow";
import { EasingName } from "../StaticData";
import BitmapNum from "./BitmapNum";
import BugTracking from "./BugTracking";
import { PlayerData } from "./Models";
import SE from "./SE";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerStatusBar extends cc.Component
{
    @property(cc.Node) contentsNode: cc.Node = null;
    @property(BitmapNum) powerOutput: BitmapNum = null;
    @property(BitmapNum) coinOutput: BitmapNum = null;
    @property(cc.Sprite) progressBar: cc.Sprite =  null;
    @property(cc.Button) btnBack: cc.Button = null;
    @property(cc.Button) btnSetting: cc.Button = null;
    @property(cc.Button) btnSkip: cc.Button = null;
    @property(cc.Prefab) settingWindowPrefab:cc.Prefab = null;
    @property({ type:cc.AudioClip }) seBtnPress:cc.AudioClip = null;
    @property({ type:cc.AudioClip }) seStoryExpUp:cc.AudioClip = null;

    private _backButtonCallback:()=>void = null;
    private _settingButtonCallback:()=>void = null;
    private _skipButtonCallback:()=>void = null;
    private _settingWindowCloseCallback:(change:boolean)=>void = null;       //設定ウィンドウで設定した
    private _canvasNode:cc.Node = null;

    private static readonly CONTENTS_Y:number = -36;

    
    /**
     * cc.Widgetを設定し画面上に固定する
     * @param canvasNode 
     */
    public setup(canvasNode:cc.Node):void
    {
        this._canvasNode = canvasNode;
        
        let widget:cc.Widget = this.node.getComponent(cc.Widget);
        widget.target = canvasNode;
        widget.top = 0;
        this.powerOutput.resetNum();
        this.coinOutput.resetNum();
    }


    public onSettingWindowClose(callback:(change:boolean)=>void):void
    {
        this._settingWindowCloseCallback = callback;
    }


    public showStatus():void
    {
        this.contentsNode.active = true;
    }

    public hideStatus():void
    {
        this.contentsNode.active = false;
    }

    public showSkipButton():void
    {
        this.btnSkip.node.active = true;
    }

    public hideSkipButton():void
    {
        this.btnSkip.node.active = false;
    }

    public lockSkipButton(lock:boolean):void
    {
        this.btnSkip.interactable = ! lock;
    }

    public isLockSkipButton():boolean
    {
        return ! this.btnSkip.interactable;
    }

    public backButtonEnabled(value:boolean):void
    {
        this.btnBack.interactable = value;
    }

    public settingButtonEnabled(value:boolean):void
    {
        this.btnSetting.interactable = value;
    }


    /**
     * 設定ウィンドウを表示する
     * @param parentNode 親Node
     * @returns 
     */
    public createSettingWindow(parentNode:cc.Node):SettingWindow
    {
        let swNode:cc.Node = cc.instantiate(this.settingWindowPrefab);
        let settingWindow:SettingWindow = swNode.getComponent(SettingWindow);
        parentNode.addChild(swNode);

        settingWindow.setup(this._canvasNode, (change:boolean)=>
        {
            if(this._settingWindowCloseCallback != null) this._settingWindowCloseCallback(change);
        });

        return settingWindow;
    }



    /**
     * プレーヤーのステータスを反映
     * @param playerData 
     */
    public statusUpdate(playerData:PlayerData):void
    {
        this.powerOutput.num = playerData.maxPower;
        this.coinOutput.num = playerData.coin;
        this.progressBar.fillRange = playerData.next_level_progress / 100;
    }


    /**
     * ステータスを指定した値で書き直す(イベント用)
     * @param power 
     * @param progress 
     * @param coin 
     */
    public statusWrite(power:number, progress:number, coin:number):void
    {
        this.powerOutput.num = power;
        this.progressBar.fillRange = progress / 100;
        this.coinOutput.num = coin;
    }


    /**
     * 経験値の設定
     * @param per 
     */
    public setProgress(per:number):void
    {
        this.progressBar.fillRange = per;
    }


    /**
     * コインの設定
     * @param per 
     */
    public setCoin(coin:number):void
    {
        this.coinOutput.num = coin;
    }


    /**
     * 天才パワーの変化
     * @param power 
     * @param duration 
     * @param callback 
     */
    public toPower(power:number, duration:number, callback:()=>void):void
    {
        let currentNum:number = Number(this.powerOutput.num);
        
        this.node.runAction(
            cc.sequence(
                cc.valueTo(duration, currentNum, power, (value:number)=>
                {
                    this.powerOutput.num = value;

                }).easing(cc.easeInOut(2.0)),
                cc.callFunc(()=>{ if(callback) callback(); })
            )
        );
    }


    /**
     * 経験値の変化
     * @param progress 
     * @param duration 
     * @param callback 
     */
    public toProgress(progress:number, duration:number, callback:()=>void):void
    {
        let currentNum:number = this.progressBar.fillRange;
        
        this.node.runAction(
            cc.sequence(
                cc.valueTo(duration, currentNum, progress / 100, (value:number)=>
                {
                    this.progressBar.fillRange = value;

                }).easing(cc.easeInOut(2.0)),
                cc.callFunc(()=>{ if(callback) callback(); })
            )
        );
    }


    /**
     * コインの変化
     * @param coin 
     * @param duration 
     * @param callback 
     */
    public toCoin(coin:number, duration:number, callback:()=>void):void
    {
        let currentNum:number = Number(this.coinOutput.num);
        
        this.node.runAction(
            cc.sequence(
                cc.valueTo(duration, currentNum, coin, (value:number)=>
                {
                    this.coinOutput.num = value;

                }).easing(cc.easeInOut(2.0)),
                cc.callFunc(()=>{ if(callback) callback(); })
            )
        );
    }


    public getPowerFromDisplay():number
    {
        return Number(this.powerOutput.num);
    }
    public getCoinFromDisplay():number
    {
        return Number(this.coinOutput.num);
    }


    /*
    //指定した座標へ移動する
    public toScrollContentsY(Y:number, duration:number, poping:boolean):void
    {
        if(poping)
        {
            this.contentsNode.scale = 0.3;
            this.contentsNode.runAction(
                cc.sequence(
                    cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
                    cc.delayTime(0.2),
                    cc.moveTo(duration, 0, Y).easing(cc.easeInOut(2.0))
                )
            );
        }
        else
        {
            this.contentsNode.runAction(
                cc.moveTo(duration, 0, Y).easing(cc.easeInOut(2.0))
            );
        }
    }


    //初期の位置へ戻す
    public toScrollContentsDefaultY(duration:number):void
    {
        this.toScrollContentsY(PlayerStatusBar.CONTENTS_Y, duration, false);
    }
    */



    public storyShowStatus():void
    {
        this.showStatus();
        this.contentsNode.scale = 0.3;
        cc.tween(this.contentsNode)
        .to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
        .start();

        //スキップボタンを下げる
        cc.tween(this.btnSkip.node)
        .to(0.3, { y:-120 }, { easing:EasingName.sineInOut })
        .start();
    }


    public storyHideStatus():void
    {
        //スキップボタンを上げる
        cc.tween(this.btnSkip.node)
        .to(0.3, { y:-48 }, { easing:EasingName.sineInOut })
        .start();
        
        cc.tween(this.contentsNode)
        .to(0.3, { scale:0.0 }, { easing:EasingName.backIn })
        .call(()=>
        {
            this.contentsNode.active = false;
            this.contentsNode.scale = 1.0;
        })
        .start();
    }



    public storyTensaiPowerUpDown(power:number, callback:()=>void):void
    {
        cc.tween(this.contentsNode)
        //センターのやや上へ移動
        .to(0.3, { position:cc.v3(0, -300, 0) }, { easing:EasingName.sineInOut })
        .delay(0.1)
        //天才パワーの上昇
        .call(()=>
        {
            //音を鳴らす
            SE.play(this.seStoryExpUp);
            
            this.toPower(power, 1.0, null);
            this.toProgress(100, 1.0, ()=>{ this.toProgress(0, 0, null); })
        })
        .delay(1.2)
        //元の位置へ戻す
        .to(0.3, { position:cc.v3(0, PlayerStatusBar.CONTENTS_Y, 0) }, { easing:EasingName.sineInOut })
        //コールバック
        .call(callback)
        .start();
    }


    public storyCoinUpDown(coin:number, callback:()=>void):void
    {
        cc.tween(this.contentsNode)
        //センターのやや上へ移動
        .to(0.3, { position:cc.v3(0, -300, 0) }, { easing:EasingName.sineInOut })
        .delay(0.1)
        //コインの上昇
        .call(()=>
        {
            this.toCoin(coin, 1.0, null);
        })
        .delay(1.2)
        //元の位置へ戻す
        .to(0.3, { position:cc.v3(0, PlayerStatusBar.CONTENTS_Y, 0) }, { easing:EasingName.sineInOut })
        //コールバック
        .call(callback)
        .start();
    }


    public storyResetParams():void
    {
        this.progressBar.fillRange = 0.0;
        this.powerOutput.num = 0;
        this.coinOutput.num = 0;
    }


    //---------------------------------------------------


    public onBackButtonCallback(callback:()=>void):void
    {
        this._backButtonCallback = callback;
    }

    public onSettingButtonCallback(callback:()=>void):void
    {
        this._settingButtonCallback = callback;
    }

    public onSkipButtonCallback(callback:()=>void):void
    {
        this._skipButtonCallback = callback;
    }


    private onPressBackButton(event:any):void
    {
        SE.play(this.seBtnPress);
        this._backButtonCallback();
    }

    private onPressSettingButton(event:any):void
    {
        SE.play(this.seBtnPress);

        if(this._settingButtonCallback == null)
        {
            BugTracking.notify("コールバック未定義エラー", "PlayStatusBar.onPressSettingButton()",
            {
                data:"コールバック未定義エラー/ _settingButtonCallback()"
            });
        }
        else
        {
            this._settingButtonCallback();
        }
    }

    private onPressSkipButton(event:any):void
    {
        SE.play(this.seBtnPress);
        this._skipButtonCallback();
    }



}
