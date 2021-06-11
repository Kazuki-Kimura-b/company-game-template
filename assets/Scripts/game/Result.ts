import SE from "../common/SE";
import GameBG from "./bg/GameBG";
import HintControl from "./HintControl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Result extends cc.Component {

    
    
    protected _compCallback:(code:number)=>void = null;
    protected _eventCallback:(code:number)=>void = null;
    protected _showCompleteCallback:(code:number)=>void = null;
    protected _hintControl:HintControl = null;

    
    
    /** 回答一覧を見る */
    public static readonly RTN_SC_KAITOU_ICHIRAN:number = 1;
    /** メニューに戻る */
    public static readonly RTN_SC_MENU:number = 2;
    /** 偉人再挑戦 */
    public static readonly RTN_SC_IJIN_RETRY:number = 3;
    /** 次の偉人へ */
    public static readonly RTN_SC_IJIN_NEXT:number = 4;
    /** 修行をもう1回 */
    public static readonly RTN_SC_RE_TRAINING:number = 5;
    /** 修行から偉人戦へ */
    public static readonly RTN_SC_GO_VS:number = 6;
    /** 修行からゲーム終了 */
    public static readonly RTN_SC_END_GAME:number = 7;

    /** (ゴリベン)次の処理へ */
    public static readonly RTN_GORIBEN_NEXT:number = 8;//
    /** (ゴースト)次の処理へ */
    public static readonly RTN_GHOST_NEXT:number = 9;//




    /**
     * 初期化
     * @param data 表示に必要なデータを渡す
     * @param compCallback 完了時のコールバック
     */
    public setup(data:any, compCallback:(code:number)=>void):void
    {
        this._compCallback = compCallback;
    }


    /**
     * リザルトの開始
     */
    public startAction():void
    {

    }


    /**
     * リザルト中に汎用コールバックを返す
     * @param eventCallback 
     */
    public onEventCallback(eventCallback:(code:number)=>void):void
    {
        this._eventCallback = eventCallback;
    }


    /**
     * リザルトの表示完了（ボタンが出るタイミング）でコールバックを返す
     * @param showCompleteCallback 
     */
    public onShowCompleteCallback(showCompleteCallback:(code:number)=>void):void
    {
        this._showCompleteCallback = showCompleteCallback;
    }


    public setHintControl(hintControl: HintControl):void
    {
        this._hintControl = hintControl;
    }


    public setGameBG(gameBG:GameBG):void
    {
        //抽象メソッド
    }


    protected _SE(audioClip:cc.AudioClip):void
    {
        SE.play(audioClip, false, 1.0);
    }


}
