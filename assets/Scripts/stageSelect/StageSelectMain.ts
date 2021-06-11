import SoundControl from "../common/SoundControl";
import SceneChanger from "../common/SceneChanger";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StageSelectMain extends cc.Component {

    @property(cc.PageView) pageView: cc.PageView = null;
    @property(cc.Button) nextPageButton: cc.Button = null;
    @property(cc.Button) prevPageButton: cc.Button = null;

    private _sound :SoundControl = null;
    private _sceneChanger :SceneChanger = null;
    

    /**
     * シーン開始時
     */
    start()
    {
        // 初期化
        this._sound = this.getComponent(SoundControl);
        this._sceneChanger = this.getComponent(SceneChanger);

        //一瞬でスクロールさせる
        //let page = window.UnkoZukeiPuzzle_Static.lastPlayedPage;
        //this.pageView.scrollToPage(page, 0.01);
        this.prevPageButton.node.active = false;


        //---- 初期化終了 ----

        //フェードインが終わった
        this._sceneChanger.sceneStart(() =>
        {
            
        });
    }


    /**
     * 次のページボタンを押した時
     * @param event 
     */
    private onPressNextPageButton (event):void
    {
        //SE ボタン音
        this._sound.SE(this._sound.seButton);

        this.pageView.setCurrentPageIndex(this.pageView.getCurrentPageIndex() + 1);
    }


    /**
     * 前のページボタンを押した時
     * @param event 
     */
    private onPressPrevPageButton (event):void
    {
        //SE ボタン音
        this._sound.SE(this._sound.seButton);

        this.pageView.setCurrentPageIndex(this.pageView.getCurrentPageIndex() - 1);
    }


    /**
     * ページビューのページ変更時
     */
    private onPageViewPageChange ():void
    {
        let page:number = this.pageView.getCurrentPageIndex();

        this.nextPageButton.node.active = (page < 2);
        this.prevPageButton.node.active = (page > 0);
    }



    /**
     * 戻るボタンを押した時
     * @param event 
     */
    private onPressBackButton (event):void
    {
        //SE 戻る音
        this._sound.SE(this._sound.seUndoButton);

        //フェードアウト
        this._sceneChanger.sceneEnd(event, () =>
        {
            //タイトル画面へ
            cc.director.loadScene("title");
        });
    }

}
