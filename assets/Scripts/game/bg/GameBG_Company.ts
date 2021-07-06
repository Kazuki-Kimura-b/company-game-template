import GameBG from "./GameBG";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBG_Company extends GameBG
{
    @property(cc.Node) game: cc.Node = null;

    /**
     * リザルト画面の背景に変更
     */
    public changeResultBG():void
    {
    }


    /**
     * 勝利時の背景に変更
     */
    public changeWinBG():void
    {
    }


    /**
     * 敗北時の背景に変更
     */
    public changeLoseBG():void
    {
    }
}



