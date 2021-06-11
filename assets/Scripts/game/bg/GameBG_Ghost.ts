import GameBG from "./GameBG";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBG_Ghost extends GameBG
{
    @property(cc.Node) winBg:cc.Node = null;


    /**
     * リザルト画面の背景に変更
     */
    public changeResultBG():void
    {
        this.resultBg.active = true;
        this.winBg.active = false;
    }


    /**
     * 勝利時の背景に変更
     */
    public changeWinBG():void
    {
        this.winBg.active = true;
    }


    /**
     * 敗北時の背景に変更
     */
    public changeLoseBG():void
    {
        this.winBg.active = false;
    }



}



