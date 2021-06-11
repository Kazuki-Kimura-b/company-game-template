import TapEffect from "../common/TapEffect";
import MenuMain from "./MenuMain";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuPage extends cc.Component
{

    @property(cc.Node) boardNode:cc.Node = null;

    protected _menuMain:MenuMain;
    protected _canvas:cc.Canvas;



    /**
     * 登場演出前(startの前)に呼び出される
     */
    public setupProtectedParams(menuMain:MenuMain, canvas:cc.Canvas):void
    {
        this._menuMain = menuMain;
        this._canvas = canvas;

        //タップエフェクトを追加
        this.boardNode.on(cc.Node.EventType.TOUCH_START, (event:any)=>
        {
            TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
        });
    }


    /**
     * 登場演出が完了した際にMenuMainから呼び出される
     */
    public onShowComplete():void
    {

    }


    /**
     * MenuMainから閉じる動作を行った際に呼び出される
     */
    public onClose():void
    {

    }


}
