const {ccclass, property} = cc._decorator;

@ccclass
export default class SoundControl extends cc.Component {

    /** BGM */
    @property({type:cc.AudioClip}) bgmGame: cc.AudioClip = null;
    /** ボタン音 */
    @property({type:cc.AudioClip}) seButton: cc.AudioClip = null;
    /** 戻るボタン音 */
    @property({type:cc.AudioClip}) seUndoButton: cc.AudioClip = null;
    /** 正解音 */
    @property({type:cc.AudioClip}) sePinpon: cc.AudioClip = null;
    /** 大正解音 */
    @property({type:cc.AudioClip}) seAllPinpon: cc.AudioClip = null;
    /** 間違い音 */
    @property({type:cc.AudioClip}) seBatsu: cc.AudioClip = null;
    /** ゲームクリアージングル */
    @property({type:cc.AudioClip}) seGameClear: cc.AudioClip = null;
    /** ゲームオーバージングル */
    @property({type:cc.AudioClip}) seGameOver: cc.AudioClip = null;
    /** メニューを開く音 */
    @property({type:cc.AudioClip}) seOpenMenu: cc.AudioClip = null;
    /** タイトル画面のジングル音 */
    @property({type:cc.AudioClip}) seTitleJingle: cc.AudioClip = null;

    _bgmID:number = -1;
    _muteMode:boolean = false;

    protected SE_VOLUME:number = 1.0;
    protected BGM_VOLUME:number = 0.3;



    /**
     * ミュートにする
     * @param flg trueでミュート
     */
    public muteMode(flg:boolean):void
    {
        this._muteMode = flg;
    }


    /**
     * 効果音を鳴らす
     * @param audioClip 鳴らす音
     */
    public SE(audioClip:cc.AudioClip):void
    {
        if(this._muteMode) return;
        cc.audioEngine.play(audioClip, false, this.SE_VOLUME);
    }

    /**
     * 効果音を鳴らす
     * @param audioClip 鳴らす音
     * @param volume 音量
     */
    public SE_volume(audioClip:cc.AudioClip, volume:number):void
    {
        if(this._muteMode) return;
        cc.audioEngine.play(audioClip, false, this.SE_VOLUME * volume);
    }


    /**
     * BGMを鳴らす
     */
    public startGameBgm ():void
    {
        if(this._muteMode) return;
        this._bgmID = cc.audioEngine.play(this.bgmGame, true, this.BGM_VOLUME);
    }


    /**
     * BGMの音量を変更
     * @param value 音量
     */
    public setGameBgmVolume (value:number):void
    {
        cc.audioEngine.setVolume(this._bgmID, this.BGM_VOLUME * value);
    }
    

    /**
     * BGMを止める
     */
    public stopGameBgm ():void
    {
        cc.audioEngine.stop(this._bgmID);
    }

}
