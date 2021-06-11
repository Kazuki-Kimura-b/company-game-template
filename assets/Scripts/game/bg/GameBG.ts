const {ccclass, property} = cc._decorator;



// 親クラスなので基本的には使用しない。
// ただし背景に一切ギミックがない場合は使用してもよい




@ccclass
export default class GameBG extends cc.Component {

    @property(cc.Color) backGroundColor:(cc.Color) = cc.color(0,0,0);
    @property(cc.Node) resultBg:cc.Node = null;


    /**
     * 初期化（その背景専用の初期化などを行う）
     */
    public setup ():void
    {
        cc.log("GameBG::setup");
    }

    
    /**
     * 問題データ、画像の読み込みが完了した
     */
    public ready ():void
    {
        cc.log("GameBG::ready");
    }


    /**
     * 問題が表示される直前(解説終了時も含む)
     * @param questionCount 何問目か
     */
    public showQuestion (questionCount: number):void
    {
        cc.log("GameBG::showQuestion");
    }
    



    /**
     * 正解時
     * @param comboCount 連続正解数
     */
    public rightAnswer (comboCount:number):void
    {
        cc.log("GameBG::rightAnswer");
    }


    /**
     * 不正解を選択時
     * @param comboCount 直前の連続正解数
     */
    public wrongAnswer (comboCount:number):void
    {
        cc.log("GameBG::wrongAnswer");
    }



    /**
     * 残り時間が少なくなった時
     * @param time 残り時間
     */
    public harryUp (time: number):void
    {
        cc.log("GameBG::harryUp");
    }


    /**
     * タイムアップ時
     * @param comboCount 直前の連続正解数
     */
    public timeUp (comboCount:number):void
    {
        cc.log("GameBG::timeUp");
    }


    /**
     * 色反転する
     */
    public negaStart()
    {
        cc.log("GameBG::negaStart");
    }

    /**
     * 色反転から復帰
     */
    public negaEnd()
    {
        cc.log("GameBG::negaEnd");
    }


    /**
     * 解説の表示時
     */
    public kaisetsu ():void
    {
        cc.log("GameBG::kaisetsu");
    }


    /**
     * すべての問題が終了した時
     */
    public finish (callback:()=>void):void
    {
        cc.log("GameBG::finish");
        callback();
    }


    /**
     * リザルト画面の背景に変更
     */
    public changeResultBG():void
    {
        cc.log("GameBG::changeResultBG");
        if(this.resultBg) this.resultBg.active = true;
    }


}
