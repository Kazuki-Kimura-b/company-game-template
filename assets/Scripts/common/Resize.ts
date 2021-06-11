const {ccclass, property} = cc._decorator;

/**
 * 画面をフィットするように調整するクラス
 */
@ccclass
export default class Resize extends cc.Component {

    @property(cc.Node) gameArea: cc.Node = null;
    @property(cc.Node) headerArea: cc.Node = null;
    @property(cc.Node) footerArea: cc.Node = null;
    @property(cc.Node) popupArea: cc.Node = null;
    @property(cc.Node) markR: cc.Node = null;

    private _prevMarkRX: number = -1;
    readonly CANVAS_WIDTH_HALF: number = 375;
    

    /**
     * 毎フレーム実行する
     * @param dt 
     */
    update (dt:number):void
    {
        this._onResize();
    }
    


    /**
     * 画面の横幅を見て全体をスケーリングする
     */
    private _onResize ():void
    {
        if(this._prevMarkRX == this.markR.x) return;
        this._prevMarkRX = this.markR.x;
        
        let scale:number = (this.markR.x / this.CANVAS_WIDTH_HALF);
        if(scale > 1) scale = 1;

        this.gameArea.scale = scale;
        if(this.headerArea != null) this.headerArea.scale = scale;
        if(this.footerArea != null) this.footerArea.scale = scale;
        if(this.popupArea != null) this.popupArea.scale = scale;
    }
}
