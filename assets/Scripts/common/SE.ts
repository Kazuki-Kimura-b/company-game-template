const {ccclass, property} = cc._decorator;

@ccclass
export default class SE
{
    private static _SE_Enabled:boolean = true;
    private static _BGM_Enabled:boolean = true;
    
    public static get SE_Enabled():boolean { return this._SE_Enabled; }
    public static set SE_Enabled(value:boolean) { this._SE_Enabled = value; }

    public static get BGM_Enabled():boolean { return this._BGM_Enabled; }
    public static set BGM_Enabled(value:boolean) { this._BGM_Enabled = value; }

    protected static readonly SE_VOLUME:number = 0.3;
    protected static readonly BGM_VOLUME:number = 0.3;
    //protected static _seVolume:number = 1.0;
    protected static _lastBgmAudioClip:cc.AudioClip = null;

    
    
    public static play(audioClip:cc.AudioClip, loop:boolean = false, volume:number = 1.0):number
    {
        if(! this._SE_Enabled) return -1;
        //this._seVolume = volume;
        return cc.audioEngine.play(audioClip, loop, volume * SE.SE_VOLUME);
    }

    public static stop(audioID:number):void
    {
        cc.audioEngine.stop(audioID);
    }

    public static isPlaying(audioID:number):boolean
    {
        return cc.audioEngine.getState(audioID) == cc.audioEngine.AudioState.PLAYING;
    }

    /*
    public static toVolume(duration:number, volume:number):void
    {
        let a:{ volume:number } = { volume:this._seVolume };
        cc.tween(a)
        .to(duration, { volume:volume }, { onUpdate:(val:{ volume:number, _id:number })=>
            {
                cc.log(val);
            } })
        .start();
    }
    */


    public static bgmStart(audioClip:cc.AudioClip):void
    {
        SE._lastBgmAudioClip = audioClip;
        if(! this._BGM_Enabled) return;
        cc.audioEngine.playMusic(audioClip, true);
    }

    public static bgmStop():void
    {
        cc.audioEngine.stopMusic();
    }

    public static bgmSetVolume(volume:number):void
    {
        cc.audioEngine.setMusicVolume(volume * SE.BGM_VOLUME);
    }

    /**
     * 最後にかけたBGMを再生(AudioClipをすでに保持していない可能性あり)
     */
    public static bgmRestart()
    {
        this.bgmStart(this._lastBgmAudioClip);
    }


}