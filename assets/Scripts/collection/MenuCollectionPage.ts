import MenuPage from "../menu/MenuPage";
import SchoolAPI from "../common/SchoolAPI";
import FrontEffect from "../game/FrontEffect";
import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";
import TapEffect from "../common/TapEffect";
import SE from "../common/SE";
import { MenuSE } from "../menu/MenuSEComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuCollectionPage extends MenuPage
{
    @property(cc.Node) contents: cc.Node = null;
    @property(cc.Node) pageView: cc.Node = null;
    @property(cc.Node) pageContainer: cc.Node = null;
    @property(cc.Node) loadingNode: cc.Node = null;
    @property(FrontEffect) frontEffect: FrontEffect = null;
    @property(cc.Node) popupArea: cc.Node = null;
    @property(cc.Font) nameFont: cc.Font = null;
    @property(cc.Font) textFont: cc.Font = null;
    @property(cc.Node) cardItem: cc.Node = null;

    _areaHeight: number = 812;
    _pageNum: number = 8; // 総ページ数
    _itemNum: number = 120; // 総アイテム数
    _unkoSpriteFrames: cc.SpriteFrame[][] = [[], [], [], [], [], [], [], []];
    _ijinSpriteFrames: cc.SpriteFrame[][] = [[], [], [], [], [], [], [], []];
    _ijinNames: cc.Node[][] = [[], [], [], [], [], [], [], []];
    _ijinTexts: cc.Node[][] = [[], [], [], [], [], [], [], []];
    _currentPageIndex: number = 0; // 現在のページ
    _displayCardIndex: number = 0; // ポップアップの真ん中の表示されているアイテムのインデックス
    _apiEndFlg: boolean = false;
    _onShowCompleteFlg: boolean = false;
    _canTouchFlg: boolean = false;
    _modal: cc.Node = null;


    // onLoad () {}

    start () {
        
        //pageViewにタップエフェクトを追加
        this.pageView.on(cc.Node.EventType.TOUCH_START, (event:any)=>
        {
            TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
        });
        
        
        
        // ローディングの表示
        this.loadingNode.getChildByName("icon").runAction(
            cc.repeatForever(
                cc.rotateBy(1.5, -360)
            )
        )
        this.frontEffect.initialize();

        // ウインドウサイズの調整
        this.setSize();
        window.onresize = () => {
            this.setSize();
        }

        // ポップアップを中央に
        this.node.removeChild(this.popupArea);
        this.popupArea.getComponent(cc.Widget).target = this._canvas.node;

        // APIで情報を取得する
        console.log("API START (COLLECTION) ----------------");
        this.frontEffect.showLoadingBar(0.2);
        SchoolAPI.collection((response) => {
            // ページ数を計算し、いらないページを非表示
            this._itemNum = response.length;
            this._pageNum = Math.ceil(response.length / 16);
            if (this._itemNum === 0) {
                this._pageNum = 1;
            }
            for (let i = this._pageNum; i < 7; i++) {
                this.pageContainer.children[i].active = false;
            }
            if (this._itemNum !== 0) {
                // コレクションをゲットしているとき
                this.pageContainer.children[this._pageNum - 1].getChildByName("label").active = false;

                // 画像をロード
                for (let i = 0; i < this._itemNum; i++) {
                    this.setUnkoTex(response[i].unko_url, i);
                    // 偉人のデータをロードしておく
                    this.loadIjin(response[i], i, () => {
                        this.frontEffect.showLoadingBar(0.2 + 0.8 * i / response.length)
                        if (i === this._itemNum - 1 || this._itemNum === 0) {
                            this.frontEffect.showLoadingMaxAndHide();
                            this.node.runAction(
                                cc.sequence(
                                    cc.delayTime(0.5),
                                    cc.callFunc(() => {
                                        this._apiEndFlg = true;
                                        if (this._onShowCompleteFlg) {
                                            this.showItems(0);
                                        }
                                    })
                                )

                            )

                        }
                    });
                }
            } else {
                // コレクションをゲットしていないとき
                this.pageContainer.children[0].getChildByName("label").active = false;
                this.frontEffect.showLoadingMaxAndHide();
                this._apiEndFlg = true;
                    if (this._onShowCompleteFlg) {
                    this.showItems(0);
                }
            }
        });
    }


    //override
    public onShowComplete():void
    {
        cc.log("onShowComplete");
        this._onShowCompleteFlg = true;
        if (this._apiEndFlg) {
            this._canTouchFlg = true;
            this.showItems(0);
        }
    }


    //override
    public onClose():void
    {
        cc.log("onClose");
        if (this._modal !== null) {
            this._modal.removeChild(this.popupArea);
        }
    }

    private setUnkoTex(url: string, index: number): void {
        
        /*
        let spriteFrame: cc.SpriteFrame;
        cc.loader.load(url, (err, tex) => {
            if (err) {
                cc.error(err);
                throw new Error("image loading error");
            }
            let activeUnko: cc.Node = this.pageContainer.children[Math.floor(index / 16)].getChildByName("itemContainer").children[index % 16];
            spriteFrame = new cc.SpriteFrame(tex);
            this._unkoSpriteFrames[Math.floor(index / 16)][index % 16] = spriteFrame;
            activeUnko.getChildByName("unko").getComponent(cc.Sprite).spriteFrame = spriteFrame;
            activeUnko.getChildByName("unko").setContentSize(121, 121);
            activeUnko.getComponent(cc.Button).enabled = true;
        });
        */
        
        SchoolAPI.loadImage("unkoTex", url, (response:any)=>
        {
            let activeUnko: cc.Node = this.pageContainer.children[Math.floor(index / 16)].getChildByName("itemContainer").children[index % 16];
            
            if(! activeUnko) return;
            
            this._unkoSpriteFrames[Math.floor(index / 16)][index % 16] = response.image;
            activeUnko.getChildByName("unko").getComponent(cc.Sprite).spriteFrame = response.image;
            activeUnko.getChildByName("unko").setContentSize(121, 121);
            activeUnko.getComponent(cc.Button).enabled = true;
        });
    }

    private loadIjin(item: any, index: number, callback: () => void) {
        
        /*
        // 画像のロード
        let spriteFrame: cc.SpriteFrame;
        cc.loader.load(item.card_url, (err, tex) => {
            if (err) {
                cc.error(err);
                throw new Error("image loading error");
            }
            spriteFrame = new cc.SpriteFrame(tex);
            this._ijinSpriteFrames[Math.floor(index / 16)][index % 16] = spriteFrame;
        });
        */
       
        SchoolAPI.loadImage("ijin", item.card_url, (response:any)=>
        {
            this._ijinSpriteFrames[Math.floor(index / 16)][index % 16] = response.image;
        });

        // 名前とテキストのロード
        let name: cc.Node = new cc.Node();
        name.addComponent(SchoolText);
        let nameFormat: any =
		{
			size: 38,
			margin: 2+1,
			lineHeight: 64,
			rows: 4+1,		//連想問題の対応
			columns: 12+1,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_TOP,
			color: cc.color(0, 0, 0),
			yomiganaSize: 20,
			yomiganaMarginY: 2
		};
        name.getComponent(SchoolText).setFont(this.nameFont);
        name.getComponent(SchoolText).resetText();
        name.getComponent(SchoolText).createText(item.name, STFormat.create(nameFormat));
        name.getComponent(SchoolText).getComponent(SchoolText).reLayoutText();
        this._ijinNames[Math.floor(index / 16)].push(name);

        let textFormat: any =
		{
			size: 30,
			margin: 2+1,
			lineHeight: 58,
			rows: 6,		//連想問題の対応
			columns: 18,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_TOP,
			color: cc.color(0, 0, 0),
			yomiganaSize: 14,
			yomiganaMarginY: 2
		};
        let text: cc.Node = new cc.Node();
        text.addComponent(SchoolText);
        text.getComponent(SchoolText).setFont(this.textFont);
        text.getComponent(SchoolText).resetText();
        text.getComponent(SchoolText).createText(item.description, STFormat.create(textFormat));
        text.getComponent(SchoolText).getComponent(SchoolText).reLayoutText();
        this._ijinTexts[Math.floor(index / 16)].push(text);

        callback();
    }

    // うんこの一覧を表示する(1ページ)
    private showItems(pageIndex: number): void {
        if (!this.pageContainer.children[pageIndex].getChildByName("itemContainer").children[0].getChildByName("unko").active) {
            for (let i = 0; i < this.pageContainer.children[pageIndex].getChildByName("itemContainer").children.length; i++) {
                let target: cc.Node = this.pageContainer.children[pageIndex].getChildByName("itemContainer").children[i].getChildByName("unko");
                target.setScale(0);
                target.active = true;
                target.runAction(
                    cc.sequence(
                        cc.delayTime(0.02 * i),
                        //うんこが出てくる効果音
                        cc.callFunc(()=>{ if(i % 3 == 0) SE.play(MenuSE.clip.collectionUnkoPut, false, 0.5); }),
                        cc.scaleTo(0.2, 1)
                    )
                )
                this._canTouchFlg = true;
            }
        }
    }

    // ウインドウサイズを設定する
    private setSize(): void {
        let w: number = window.innerWidth;
        let h: number = window.innerHeight;
        if (h / w > 1100 / 750) {
            let innerHeight: number = h * 750 / w / 2 - 550; // cocosの領域外の高さをcocosのnodeSizeで表したもの(縦長のとき)
            this._areaHeight = this.contents.getPosition().y + innerHeight; // 表示されている領域の高さをcocosのnodeSizeで表したもの
            this.pageView.height = this._areaHeight;
            this.pageView.getChildByName("view").height = this._areaHeight;
            this.contents.height = this._areaHeight;
            this.loadingNode.y = this._areaHeight / 2 * -1 + 6;
            for(let i = 0; i < this.pageContainer.children.length; i++) {
                this.pageContainer.children[i].height = this._areaHeight;
                this.pageContainer.children[i].getChildByName("itemContainer").y = this._areaHeight / 2 * -1 + 6;
                this.pageContainer.children[i].getChildByName("label").y = this._areaHeight * -1 + 28;
            }
        }
    }

    // ページが変わったとき
    private onChangePage(event): void {
        let index: number = event.getCurrentPageIndex();
        this._currentPageIndex = index;
        this.showItems(index);

        if (index >= this._pageNum) {
            event.setCurrentPageIndex(this._pageNum - 1);
        }

        for (let i = 0; i < this.pageContainer.children.length - 1; i++) {
            let target: cc.Node = this.pageContainer.children[i].getChildByName("label");
            let toPos: number;
            if (i === index) {
                target.getChildByName("next").active = true;
                target.getChildByName("prev").active = false;
                toPos = this._areaHeight * -1 + 28;
            } else {
                target.getChildByName("next").active = false;
                target.getChildByName("prev").active = true;
                toPos = this._areaHeight * -1 -16;
            }
            target.runAction(
                cc.valueTo(.2, target.y, toPos, (value) => {
                    target.y = value;
                })
            )
        }
    }

    // コレクションのページを移動する
    private movePage(pageIndex: number): void {
        this.pageView.getComponent(cc.PageView).scrollToPage(pageIndex, 0.5);
    }

    // 「つぎへ」「まえへ」を押したとき
    private onPressMovePage(event, index: string): void {
        this._canTouchFlg = false;
        let pageIndex: number = Number(index);
        if (pageIndex === this._currentPageIndex) {
            this.movePage(pageIndex + 1);
        } else {
            this.movePage(pageIndex);
        }
        this.node.runAction(
            cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    this._canTouchFlg = true;
                })
            )
        )
        //タップ時のエフェクト
        TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
    }


    // ポップアップの内容リセット
    private resetItem(): void {
        this.cardItem.getChildByName("name").removeAllChildren();
        this.cardItem.getChildByName("text").getChildByName("content").removeAllChildren();
    };

    // ポップアップに情報をセットする
    private setItem(index: number): void {
        if (index !== -1 && index !== this._itemNum) {
            this.cardItem.getChildByName("unko").getComponent(cc.Sprite).spriteFrame  = this._unkoSpriteFrames[Math.floor(index / 16)][index % 16];
            this.cardItem.getChildByName("unko").setContentSize(121, 121);
            this.cardItem.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this._ijinSpriteFrames[Math.floor(index / 16)][index % 16];
            this.cardItem.getChildByName("name").addChild(this._ijinNames[Math.floor(index / 16)][index % 16]);
            let text: cc.Node = this._ijinTexts[Math.floor(index / 16)][index % 16];
            this.cardItem.getChildByName("text").getChildByName("content").addChild(text);
            text.y = -16;
        }
    }

    // テキストのスクロール設定
    private setScrollHide(): void {
        this.cardItem.getChildByName("hide").active = true;
        let text: cc.Node = this.cardItem.getChildByName("text").getChildByName("content").children[0];
        let textRows: number = Math.ceil(text.getComponent(SchoolText).getText().length / 18);
        if (textRows <= 4) {
            this.cardItem.getChildByName("text").getChildByName("content").setContentSize(620, 232);
            this.cardItem.getChildByName("hide").active = false;

        } else {
            this.cardItem.getChildByName("text").getChildByName("content").setContentSize(620, 58 * textRows);
        }
    }

    // うんこを押したとき
    private onPressItem(event, code: string): void {
        let num: number = Number(code);
        this._displayCardIndex = num;
        // this.displayArrow();
        this.cardItem.getChildByName("text").getComponent(cc.ScrollView).scrollToTop(0.01);
        if (this._canTouchFlg) {
            if (num === 0) {
                this.cardItem.getChildByName("prev").active = false;
            } else if (num === this._itemNum - 1) {
                this.cardItem.getChildByName("next").active = false;
            }
            this.setItem(num);
            this._modal = this._menuMain.showModalWindow();
            this._modal.removeChild(this._modal.getChildByName("popupArea"));
            if (this._modal.children.length === 1) {
                this._modal.addChild(this.popupArea);
            }
            this.setScrollHide();
            this.popupArea.active = true;
            this.popupArea.opacity = 0;
            this.popupArea.runAction(
                cc.fadeIn(0.2)
            )
        }
        //タップ時のエフェクト
        TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
    }

    // コレクション拡大表示時のバツボタン押したとき
    private onPressBackBtn(): void {
        this.resetItem();
        this.cardItem.active = true;
        this.popupArea.runAction(
            cc.sequence(
                cc.fadeOut(0.2),
                cc.callFunc(() => {
                    this.popupArea.active = false;
                    this._modal.removeChild(this._modal.getChildByName("popupArea"));
                })
            )
        )
        this._menuMain.hideModelWindow();
    }


    private onScrollText(event): void {
        if (this.cardItem.getChildByName("text").getChildByName("content").height > 232) {
            if (event.getScrollOffset().y > this.cardItem.getChildByName("text").getChildByName("content").getParent().height - 232) {
                this.cardItem.getChildByName("hide").active = false;
            } else {
                this.cardItem.getChildByName("hide").active = true;
            }
        }
      }

    // private onPressArrow(event, dir: string): void {
    //     if (dir === "prev") {
    //         this._displayCardIndex--;
    //     } else if (dir === "next") {
    //         this._displayCardIndex++;
    //     }
    //     this.cardItem.runAction(
    //         cc.sequence(
    //             cc.fadeOut(0.1),
    //             cc.callFunc(() => {
    //                 this.displayArrow();
    //                 this.resetItem();
    //                 this.setItem(this._displayCardIndex);
    //                 this.setScrollHide();
    //             }),
    //             cc.fadeIn(0.1)
    //         )
    //     )
    //   }

    //   private displayArrow(): void {
    //       if (this._displayCardIndex === 0) {
    //         this.cardItem.getChildByName("prev").active = false;
    //       } else if (this._displayCardIndex === this._itemNum - 1) {
    //         this.cardItem.getChildByName("next").active = false;
    //       } else {
    //         this.cardItem.getChildByName("prev").active = true;
    //         this.cardItem.getChildByName("next").active = true;
    //       }
    //   }


    // update (dt) {}



}
