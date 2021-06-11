import SE from "../common/SE";
import AllKaitouPage from "./AllKaitouPage";
import QuestionData from "./QuestionData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AllKaitou extends cc.Component {

    @property(cc.Node) touchNode: cc.Node = null;
    @property(cc.PageView) pageView :cc.PageView = null;
    @property(cc.Widget) headerWidget :cc.Widget = null;
    @property(cc.Widget) footerWidget :cc.Widget = null;
    @property(cc.Button) btnPrev :cc.Button = null;
    @property(cc.Button) btnNext :cc.Button = null;
    @property(cc.Prefab) pagePrefab: cc.Prefab = null;
    @property({type:cc.AudioClip}) seBtnPress:cc.AudioClip = null;

    private _qDatas:QuestionData[] = [];
    private _activeScrollView: cc.ScrollView = null;
    private _touchLoc: cc.Vec2 = cc.v2();
    private _scrollPos: cc.Vec2 = cc.v2();
    private _startScrollOffset:number = 0;
    private _startTouchLoc: cc.Vec2 = cc.v2();
    private _lockX:boolean = false;
    private _lockY:boolean = false;



    private static readonly _PAGECAHNGE_SCROLL_X:number = 70;       //ページが変わるスクロール量
    private static readonly _SLIDE_LOCK:number = 40 * 40;                //x,y方向にこれ以上進むと片方の軸に固定される




    //スワイプ操作をここで最初に受け取り、x方向の変化はページビュー、y方向の変化はスクロールビューへ渡せれば両立できるのでは？


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }


    public setup(canvasNode:cc.Node, questionDatas:QuestionData[], imageSRC:{}):void
    {
        this._qDatas = questionDatas;

        this.headerWidget.target = canvasNode;
        this.headerWidget.top = 0;

        this.footerWidget.target = canvasNode;
        this.footerWidget.bottom = 0;
        
        //ページ追加
        for(let i:number = 0 ; i < this._qDatas.length ; i ++)
        {
            // 問題
            let pageNode:cc.Node = cc.instantiate(this.pagePrefab);
            let page:AllKaitouPage = pageNode.getComponent(AllKaitouPage);
            page.setupQuestion(i, this._qDatas[i], imageSRC);
            this.pageView.addPage(page.node);

            // 回答
            pageNode = cc.instantiate(this.pagePrefab);
            page = pageNode.getComponent(AllKaitouPage);
            page.setupAnswer(i, this._qDatas[i], imageSRC);
            this.pageView.addPage(page.node);
        }

        /*
        //ページ追加
        for(let i:number = 0 ; i < this._qDatas.length ; i ++)
        {
            let pageNode:cc.Node = cc.instantiate(this.pagePrefab);
            let page:AllKaitouPage = pageNode.getComponent(AllKaitouPage);

            //今は問題と回答を１ページにしてるが２ページに分ける
            page.setup(i, this._qDatas[i], imageSRC);
            this.pageView.addPage(page.node);
        }
        */

        //表示ページのスクロールビューを有効化
        this._setActiveScrollView();

        //なぜか初期がすごい大きい値になるバグがあるので初期化。何かの初期化の順番のもんだいっぽい
        this._scrollPos.y = 0;

        this.touchNode.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);

        this.btnPrev.interactable = false;
        this.btnNext.interactable = true;
    }


    //表示ページのスクロールビューを有効化
    private _setActiveScrollView():void
    {
        let currentPageNode:cc.Node = this.pageView.getPages()[this.pageView.getCurrentPageIndex()];
        let currentPage:AllKaitouPage = currentPageNode.getComponent(AllKaitouPage);
        this._activeScrollView = currentPage.scrollView;
        this._scrollPos.y = this._activeScrollView.getScrollOffset().y;
    }


    private _onTouchStart(event:any):void
    {
        let touches = event.getTouches();
        let touchLoc = touches[0].getLocation();
        touchLoc = this.touchNode.convertToNodeSpaceAR(touchLoc);
        this._touchLoc = touchLoc;
        this._startScrollOffset = this.pageView.getScrollOffset().x;
        
        //cc.log("START TOUCH LOC:" + this._touchLoc.x + "," + this._touchLoc.y);
        //cc.log("SCROLL OFFSET:" + this._startScrollOffset);

        this._scrollPos.x = -this._startScrollOffset;       //ページに合わせて再設定

        this._startTouchLoc = touchLoc;
        this._lockX = false;
        this._lockY = false;

        //縦スクロールできないコンテンツ高さなので始めからロックする
        let maxScrollOffsetY:number = this._activeScrollView.content.height - this._activeScrollView.node.height;
        if(maxScrollOffsetY == 0)
        {
            this._lockY = true;
        }
    }

    private _onTouchMove(event:any):void
    {
        let touches = event.getTouches();
        let touchLoc = touches[0].getLocation();
        touchLoc = this.touchNode.convertToNodeSpaceAR(touchLoc);

        let vX:number = touchLoc.x - this._touchLoc.x;
        let vY:number = touchLoc.y - this._touchLoc.y;
        this._touchLoc = touchLoc;

        //if(this._lockX) vX = 0;
        //else if(this._lockY) vY = 0;


        //一定以上スクロールで2軸から1軸に固定
        if(! this._lockX && ! this._lockY)
        {
            let dX:number = touchLoc.x - this._startTouchLoc.x;
            let dY:number = touchLoc.y - this._startTouchLoc.y;

            if(dX * dX + dY * dY >= AllKaitou._SLIDE_LOCK)
            {
                if(dX < 0) dX = -dX;
                if(dY < 0) dY = -dY;

                // X軸で固定
                if(dX >= dY)
                {
                    this._lockY = true;
                }
                // Y軸で固定
                else
                {
                    this._lockX = true;
                    //ページを戻す
                    this.pageView.scrollToPage(this.pageView.getCurrentPageIndex(), 0.3);
                }
                return;
            }
        }

        if(! this._lockX)
        {
            this._scrollPos.x += -vX;
            if(this._scrollPos.x < 0) this._scrollPos.x = 0;

            this.pageView.scrollTo(cc.v2(this._scrollPos.x / 750 * (1 / (this.pageView.getPages().length - 1)), 0), 0.0);
        }
        

        if(this._activeScrollView && ! this._lockY)
        {
            //スクロールできるY方向の量 (値がマイナスの場合はまだ考慮してない)
            let scrollOffsetY:number = this._activeScrollView.content.height - this._activeScrollView.node.height;       //コンテンツの高さ - スクロールビュー表示エリアの高さ
            
            this._scrollPos.y += vY;
            if(this._scrollPos.y < 0) this._scrollPos.y = 0;
            else if(this._scrollPos.y > scrollOffsetY) this._scrollPos.y = scrollOffsetY;

            
            
            this._activeScrollView.scrollTo(cc.v2(0, 1.0 - this._scrollPos.y / scrollOffsetY), 0.0);
        }
    }

    private _onTouchEnd(event:any):void
    {
        //cc.log(this.pageView.getScrollOffset());

        let addPage:number = 0;
        let offset:number = this.pageView.getScrollOffset().x - this._startScrollOffset;
        if(offset < -AllKaitou._PAGECAHNGE_SCROLL_X) addPage = 1;
        else if(offset > AllKaitou._PAGECAHNGE_SCROLL_X) addPage = -1;

        this.pageView.scrollToPage(this.pageView.getCurrentPageIndex() + addPage, 0.3);
        //cc.log(this.pageView.getScrollOffset());

        //表示ページのスクロールビューを有効化
        this._setActiveScrollView();
    }


    private onPressNextButton(event:any):void
    {
        this._changePageButton(1);
    }


    private onPressPrevButton(event:any):void
    {
        this._changePageButton(-1);
    }


    private _changePageButton(addPage:number):void
    {
        SE.play(this.seBtnPress, false, 1.0);
        
        this.pageView.scrollToPage(this.pageView.getCurrentPageIndex() + addPage, 0.3);

        //表示ページのスクロールビューを有効化
        this._setActiveScrollView();
    }


    private onPressCloseButton(event:any):void
    {
        SE.play(this.seBtnPress, false, 1.0);
        
        this.node.removeFromParent(true);
    }


    private onChangePage(event:cc.PageView):void
    {
        let page:number = event.getCurrentPageIndex();
        let totalPage:number = event.getPages().length;

        this.btnPrev.interactable = (page > 0);
        this.btnNext.interactable = (page < totalPage - 1);
    }

    // update (dt) {}
}
