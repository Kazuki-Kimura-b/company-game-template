import MenuPage from "../menu/MenuPage";
import SchoolAPI from "../common/SchoolAPI";
import BitmapNum from "../common/BitmapNum";
import SE from "../common/SE";
import { MenuSE } from "../menu/MenuSEComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuStatusPage extends MenuPage
{
    @property(cc.Node) contents: cc.Node = null;
    @property(cc.Node) gori:cc.Node = null;
    @property(cc.Node) gachi: cc.Node = null;

    @property(BitmapNum) tensaiPower: BitmapNum = null;
    @property(BitmapNum) coin: BitmapNum = null;
    @property(BitmapNum) unko: BitmapNum = null;
    @property(BitmapNum) combo: BitmapNum = null;
    @property(BitmapNum) maxCombo: BitmapNum = null;

    _apiEndFlg: boolean = false;
    _onShowCompleteFlg: boolean = false;
    _userData: any;

    // onLoad () {}

    start () {
        this.setSize();
        window.onresize = () => {
            this.setSize();
        }

        this.tensaiPower.resetNum();
        this.coin.resetNum();
        this.unko.resetNum();
        this.combo.resetNum();
        this.maxCombo.resetNum();

        // APIで情報を取得する
        console.log("API START (STATUS) ----------------");
        SchoolAPI.childStatus((response) => {
            this._userData = response;
            this._apiEndFlg = true;
            if (this._onShowCompleteFlg) {
                this.setInfo(this._userData);
            }
        });
    }


    //override
    public onShowComplete():void
    {
        this._onShowCompleteFlg = true;
        if (this._apiEndFlg) {
            this.setInfo(this._userData);
        }
        cc.log("onShowComplete");
    }


    //override
    public onClose():void
    {
        cc.log("onClose");
    }

    private setSize(): void {
        let w: number = window.innerWidth;
        let h: number = window.innerHeight;
        if (h / w > 1100 / 750) {
            let innerHeight: number = h * 750 / w / 2 - 550; // cocosの領域外の高さをcocosのnodeSizeで表したもの(縦長のとき)
            let areaHeight: number = this.contents.getPosition().y + innerHeight; // 表示されている領域の高さをcocosのnodeSizeで表したもの
            let margin: number = (areaHeight - 42*2 - 460 - 193) / 11; // areaHeightから、コンテンツの高さを引いて11で割る
            // ごり勉情報の配置
            this.gori.getChildByName("title").setPosition(-375, margin * -3);
            this.gori.getChildByName("content").setPosition(0, margin * -4 - 42);
            this.gachi.setPosition(0, margin * -4 - 42 - 460);
            this.gachi.getChildByName("title").setPosition(-375, margin * -3);
            this.gachi.getChildByName("content").setPosition(0, margin * -4 - 42);
        }
    }

    // apiの情報を表示する
    private setInfo(data): void {
        // if () {
            // ごり勉情報の登録
            this.tensaiPower.to(Math.floor(data.genius_power), 0.3);
            this.coin.to(data.coin, 0.3);
            this.unko.to(data.acquired_collection_num, 0.3);
            this.combo.to(data.max_combo, 0.3);
            this.maxCombo.to(data.max_combo_ranking, 0.3);
            let bar: cc.Node = this.gori.getChildByName("content").getChildByName("nextLevelProgressBar");
            this.node.runAction(
                cc.spawn(
                    cc.valueTo(0.3, 0, Math.floor((100 - data.next_power_progress) / 5), (value) =>
                    {
                        //ゲージの歯抜け防止
                        let index:number = Math.floor(value);
                        for(let i:number = 0 ; i <= index ; i ++)
                        {
                            bar.children[index].active = true;
                        }
                        //bar.children[Math.floor(value)].active = true;
                    }),
                    cc.valueTo(0.3, 0, Math.floor(data.next_power_progress), (value) => {
                        this.gori.getChildByName("content").getChildByName("nextLevelProgressOutput").getComponent(cc.Label).string = `パワーアップまであと${Math.floor(value)}%`;
                    })
                )
            );

            //ゲージ音
            let seID_GageUp:number = SE.play(MenuSE.clip.gageUp);
            /*
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(0.3),
                    cc.callFunc(()=>{ SE.stop(seID_GageUp); })
                )
            );*/


        // }
    }


    // update (dt) {}
}
