const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayTrackLog extends cc.Component {

    private static _log:string[] = [];

    /**
     * ログを表示する
     * @returns 
     */
    public static getLog():string[]
    {
        return PlayTrackLog._log;
    }

    /**
     * ログを追加する
     * @param message メッセージ
     */
    public static add(message:string):void
    {
        this._log.push(message);
    }

}
