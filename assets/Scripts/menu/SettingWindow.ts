import BugTracking from "../common/BugTracking";
import { PlayerData } from "../common/Models";
import SchoolAPI from "../common/SchoolAPI";
import SE from "../common/SE";
import StaticData, { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SettingWindow extends cc.Component {

    @property(cc.Node) boardNode:cc.Node = null;
    @property(cc.Widget) backgroundCoverWidget:cc.Widget = null;
    @property(cc.Node) lockCoverNode:cc.Node = null;
    @property(cc.Button) btnBgmON:cc.Button = null;
    @property(cc.Button) btnBgmOFF:cc.Button = null;
    @property(cc.Button) btnSeON:cc.Button = null;
    @property(cc.Button) btnSeOFF:cc.Button = null;
    @property(cc.Button) btnBgmA:cc.Button = null;
    @property(cc.Button) btnBgmB:cc.Button = null;
    @property(cc.Button) btnBgmC:cc.Button = null;
    @property(cc.Button) btnTutorial:cc.Button = null;
    @property(cc.Button) btnClose:cc.Button = null;
    @property(cc.EditBox) userNameEditBox:cc.EditBox = null;
    @property({type:cc.AudioClip}) seBtnPress: cc.AudioClip = null;
    @property({type:cc.AudioClip}) seAppearWindow: cc.AudioClip = null;

    
    private _seEnabled:boolean = false;
    private _bgmEnabled:boolean = false;
    private _bgmCode:string = "";
    private _closeCallback:(change:boolean)=>void = null;



    public setup(canvasNode:cc.Node, closeCallback:(change:boolean)=>void):void
    {
        this._closeCallback = closeCallback;
        
        this.backgroundCoverWidget.target = canvasNode;
        this.backgroundCoverWidget.top = 0;
        this.backgroundCoverWidget.bottom = 0;
        
        let playerData:PlayerData = StaticData.playerData;

        this._seEnabled = playerData.se_enabled;
        this._bgmEnabled = playerData.bgm_enabled;
        this._bgmCode = playerData.bgm;

        
        //ボタンの状態を設定
        this._updateButtons();
        this.userNameEditBox.string = playerData.nickname;
        
        SE.play(this.seAppearWindow);
        
        this.boardNode.scale = 0.6;
        cc.tween(this.boardNode)
        .to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
        .start();
    }


    private _updateButtons():void
    {
        this.btnSeON.interactable = ! this._seEnabled;
        this.btnSeOFF.interactable = this._seEnabled;
        this.btnBgmON.interactable = ! this._bgmEnabled;
        this.btnBgmOFF.interactable = this._bgmEnabled;
        this.btnBgmA.interactable = (this._bgmCode != "A");
        this.btnBgmB.interactable = (this._bgmCode != "B");
        this.btnBgmC.interactable = (this._bgmCode != "C");
    }



    private onPressCloseButton(event:any):void
    {
        SE.play(this.seBtnPress);
        
        let pData:PlayerData = StaticData.playerData;
        
        this.btnClose.node.active = false;
        this.lockCoverNode.active = true;       //ボタン押せないように

        //名前が無名になってた場合戻す
        if(this.userNameEditBox.string == "") this.userNameEditBox.string = pData.nickname;

        //全ボタンロック
        this.btnBgmON.node.opacity = 80;
        this.btnBgmOFF.node.opacity = 80;
        this.btnSeON.node.opacity = 80;
        this.btnSeOFF.node.opacity = 80;
        this.btnBgmA.node.opacity = 80;
        this.btnBgmB.node.opacity = 80;
        this.btnBgmC.node.opacity = 80;
        this.btnTutorial.node.opacity = 80;
        this.userNameEditBox.node.opacity = 80;


        

        //何も変更なし
        if(this.userNameEditBox.string == pData.nickname && this._bgmEnabled == pData.bgm_enabled && this._seEnabled == pData.se_enabled && this._bgmCode == pData.bgm)
        {
            cc.log("変更なし");
            this._closeWindow(false);
            return;
        }



        //API叩いて設定の更新
        SchoolAPI.school_settings(this.userNameEditBox.string, this._bgmEnabled, this._bgmCode, this._seEnabled, (status:boolean)=>
        {
            //完了したら戻る
            cc.log("変更結果:" + status);

            let change:boolean = false;

            if(! status)
            {
                BugTracking.notify("設定の変更に失敗しました", "SettingWindow.onPressCloseButton()",
                {
                    msg:"設定の変更に失敗しました",
                    old_name:StaticData.playerData.nickname,
                    old_bgm_enabled:StaticData.playerData.bgm_enabled,
                    old_bgm:StaticData.playerData.bgm,
                    old_se_enabled:StaticData.playerData.se_enabled,
                    new_name:this.userNameEditBox.string,
                    new_bgm_enabled:this._bgmEnabled,
                    new_bgm:this._bgmCode,
                    new_se_enabled:this._seEnabled
                });
            }
            else
            {
                StaticData.playerData.updateProperty(this.userNameEditBox.string, this._bgmEnabled, this._bgmCode, this._seEnabled);
                SE.BGM_Enabled = StaticData.playerData.bgm_enabled;
                SE.SE_Enabled = StaticData.playerData.se_enabled;
                change = true;
            }

            //ウィンドウを閉じる
            this._closeWindow(change);
        });
    }


    /**
     * ウィンドウを閉じる
     */
    private _closeWindow(change:boolean):void
    {
        cc.tween(this.boardNode)
        .to(0.3, { scale:0 }, { easing:EasingName.backIn })
        .call(()=>
        {
            this._closeCallback(change);
            this.node.removeFromParent(true);
        })
        .start();
    }


    private onPressBgmOnButton(event:any):void
    {
        SE.play(this.seBtnPress);
        this._bgmEnabled = true;
        this._updateButtons();
    }


    private onPressBgmOffButton(event:any):void
    {
        SE.play(this.seBtnPress);
        this._bgmEnabled = false;
        this._updateButtons();
    }


    private onPressSeOnButton(event:any):void
    {
        SE.play(this.seBtnPress);
        this._seEnabled = true;
        this._updateButtons();
    }


    private onPressSeOffButton(event:any):void
    {
        SE.play(this.seBtnPress);
        this._seEnabled = false;
        this._updateButtons();
    }


    private onPressBgmA_Button(event:any):void
    {
        SE.play(this.seBtnPress);
        this._bgmCode = "A";
        this._updateButtons();
    }


    private onPressBgmB_Button(event:any):void
    {
        SE.play(this.seBtnPress);
        this._bgmCode = "B";
        this._updateButtons();
    }


    private onPressBgmC_Button(event:any):void
    {
        SE.play(this.seBtnPress);
        this._bgmCode = "C";
        this._updateButtons();
    }


}
