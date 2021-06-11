import MenuPage from "../menu/MenuPage";
import SchoolAPI from "../common/SchoolAPI";
import BitmapNum from "../common/BitmapNum";
import FrontEffect from "../game/FrontEffect";
import SE from "../common/SE";
import { MenuSE } from "../menu/MenuSEComponent";
import BugTracking from "../common/BugTracking";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuGakushuPage extends MenuPage
{
    @property(cc.Node) parent: cc.Node = null;
    @property(cc.Node) contents: cc.Node = null;
    @property(cc.Node) totalQ: cc.Node = null;
    @property(cc.Node) graph: cc.Node = null;
    @property(cc.Node) barContainer: cc.Node = null;
    @property(cc.Node) tab: cc.Node = null;
    @property(BitmapNum) totalQOutput: BitmapNum = null;
    @property(BitmapNum) weekQOutput: BitmapNum = null;
    @property(cc.Prefab) barPrefab: cc.Prefab = null;
    @property(FrontEffect) frontEffect :FrontEffect = null;
    @property(cc.Node) popupArea: cc.Node = null;
    @property(cc.Node) loadingNode: cc.Node = null;

    _userData: any = null;
    _apiEndFlg: boolean = false;
    _onShowCompleteFlg: boolean = false;
    _graphHeight: number = 380;
    _axisMax: number = 0;
    _axisMin: number = 0;
    _displayMode: number = 7;
    _axisList: number[] = [10, 50, 100, 500, 1000, 2000, 3000, 5000, 10000, 20000, 30000, 40000, 50000];
    _canTouchFlg: boolean = false;
    _touchStartPos: cc.Vec2 = new cc.Vec2();
    _touchEndPos: cc.Vec2 = new cc.Vec2();
    _scrollPos: cc.Vec2 = new cc.Vec2();
    _modal: cc.Node = null;

    // onLoad () {}

    start () {
        this.setSize();
        let count: number = 0;
        window.onresize = (): void => {
            if (count > 0) {
              clearTimeout(timer);
            }
            var timer = setTimeout((): void => {
                this.setSize();
                for (let i =0; i < this.barContainer.children.length; i++) {
                    this.barContainer.children[i].color = new cc.Color(255, 255, 255);
                    this.barContainer.children[i].getChildByName("weekBar").height = 0;
                    this.barContainer.children[i].getChildByName("bar").height = 0;
                }
                let data: any;
                if (this._displayMode === 7) {
                    data = this._userData.graph_data.datas.slice(-7)
                } else if (this._displayMode === 14) {
                    data = this._userData.graph_data.datas;
                }
                this.setAxis(data);
                this.resetGraph();
                this.changeBarWidth(() => {
                    this.showGraph();
                });
                this.weekQOutput.resetNum();
            }, 200);
          };

        this.node.removeChild(this.popupArea);
        this.popupArea.getComponent(cc.Widget).target = this._canvas.node;

        this.loadingNode.getChildByName("icon").runAction(
            cc.repeatForever(
                cc.rotateBy(1.5, -360)
            )
        )
        this.frontEffect.initialize();

        // タッチイベントを登録する
        let scrollView: cc.Node = this.node.getChildByName("contents").getChildByName("graph").getChildByName("ScrollView");
        scrollView.on(cc.Node.EventType.TOUCH_START, (event) => {
            this._touchStartPos = scrollView.convertToNodeSpaceAR(event.touch.getLocation());
        });
        
        scrollView.on(cc.Node.EventType.TOUCH_END, (event) => {
            if (this._canTouchFlg) {
                this._touchEndPos = scrollView.convertToNodeSpaceAR(event.touch.getLocation());
                this.showThisWeekBar();
                // if (Math.abs(this._touchEndPos.x - this._touchStartPos.x) <= 10) {
                //     // タッチしたバーのインデックス
                //     let touchBarIndex = Math.floor((Math.abs(this._touchEndPos.x) + (this._scrollPos.x + this.barContainer.width - 588)) / this.barContainer.children[0].width);

                //     // タッチした週の情報を表示する
                //     let selectedWeekTotalNum: number;
                //     if (touchBarIndex < this._userData.graph_data.datas.length - 1) {
                //         selectedWeekTotalNum = this._userData.graph_data.datas[this._userData.graph_data.datas.length - 1 - touchBarIndex] - this._userData.graph_data.datas[this._userData.graph_data.datas.length - 2 - touchBarIndex];
                //     } else {
                //         selectedWeekTotalNum = this._userData.graph_data.datas[0];
                //     }
                //     this.weekQOutput.resetNum();
                //     this.weekQOutput.to(selectedWeekTotalNum, 0.3);

                //     // タッチしたバーをハイライトし、その週の合計を表示する
                //     for (let i = 0; i < this.barContainer.children.length; i++) {
                //         this.barContainer.children[i].color = new cc.Color(255, 255, 255);
                //         this.barContainer.children[i].getChildByName("weekBar").height = 0;
                //     }
                //     this.barContainer.children[touchBarIndex].color = new cc.Color(255, 240, 0);
                //     this.barContainer.children[touchBarIndex].getChildByName("weekBar").y = this._graphHeight * (this._userData.graph_data.datas[this._userData.graph_data.datas.length - touchBarIndex - 1] - this._axisMin) / (this._axisMax - this._axisMin);
                //     this.barContainer.children[touchBarIndex].getChildByName("weekBar").runAction(
                //         cc.valueTo(.2, 0, (this._graphHeight * selectedWeekTotalNum / (this._axisMax - this._axisMin)), (value) => {
                //             this.barContainer.children[touchBarIndex].getChildByName("weekBar").height = value;
                //         })
                //     )
                // }
            }
        })

        // APIで情報を取得する
        console.log("API START (MY PAGE) ----------------");
        SchoolAPI.childMyPage((response) => {
            this.frontEffect.showLoadingBar(0.5);
            this._userData = response;
            this._apiEndFlg = true;
            // テストデータ
            if (this._onShowCompleteFlg) {
                if (this._apiEndFlg) {
                    this.setGraphSize();
                }
            }
            this.setInfo(this._userData);
        });
    }


    //override
    public onShowComplete():void
    {
        cc.log("onShowComplete");
        this._onShowCompleteFlg = true;
        if (this._apiEndFlg) {
            this.setGraphSize();
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

    private setSize(): void {
        let w: number = window.innerWidth;
        let h: number = window.innerHeight;
        if (h / w > 1100 / 750) {
            let innerHeight: number = h * 750 / w / 2 - 550; // cocosの領域外の高さをcocosのnodeSizeで表したもの(縦長のとき)
            let areaHeight: number = this.contents.getPosition().y + innerHeight; // 表示されている領域の高さをcocosのnodeSizeで表したもの
            this.totalQ.setPosition(0, (areaHeight - 44) * -1);
            this.graph.setPosition(294, (areaHeight - 288) * -1);
            this._graphHeight = areaHeight - 428;
            this.loadingNode.y = (areaHeight - 428) / 2;
            this.graph.setContentSize(588, this._graphHeight);
            this.graph.getChildByName("ScrollView").setContentSize(588, this._graphHeight);
            this.graph.getChildByName("view").setContentSize(588, this._graphHeight);
            this.graph.getChildByName("leftOutside").setContentSize(2, this._graphHeight);
            this.graph.getChildByName("rightOutside").setContentSize(2, this._graphHeight);
            this.graph.getChildByName("topOutside").setPosition(-294, this._graphHeight);
            this.graph.getChildByName("verticalAxis1").setPosition(0, this._graphHeight / 4 * 1);
            this.graph.getChildByName("verticalAxis2").setPosition(0, this._graphHeight / 4 * 2);
            this.graph.getChildByName("verticalAxis3").setPosition(0, this._graphHeight / 4 * 3);
            this.graph.getChildByName("axisMax").setPosition(5, this._graphHeight);
        }
    }

    // 数値情報を登録する
    private setInfo(data): void {
        this.totalQOutput.to(data.total_question_num, 0.3);
        let date = new Date();
        this.totalQ.getChildByName("periodOutput").getComponent(cc.Label).string = `${data.entered_at} ~ ${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;

        //ゲージ音
        let seID_GageUp:number = SE.play(MenuSE.clip.gageUp);
    }

    // グラフの初期配置をする
    private setGraphSize(): void {
        if (this._userData.graph_data.datas.length > 7) {
            this.tab.active = true;
            // バーの数が7より大きいとき生成する
            for (let i = 8; i < this._userData.graph_data.datas.length + 1; i++) {
                let item: cc.Node = cc.instantiate(this.barPrefab);
                this.barContainer.addChild(item);
                item.setPosition(-84 * i, 0);
            }

        } else {
            // バーの数が7以下のとき
            for (let i = 0; i < this._userData.graph_data.datas.length; i++) {
                this.barContainer.children[i].x = 588/this._userData.graph_data.datas.length * (i+1) * -1;
                this.barContainer.children[i].width = 588/this._userData.graph_data.datas.length;
                this.barContainer.children[i].getChildByName("bar").width = 588/this._userData.graph_data.datas.length*38/84;
                this.barContainer.children[i].getChildByName("bar").x = 588/this._userData.graph_data.datas.length / 2;
                this.barContainer.children[i].getChildByName("weekBar").x = 588/this._userData.graph_data.datas.length / 2;
                this.barContainer.children[i].getChildByName("weekBar").width = 588/this._userData.graph_data.datas.length*38/84;
            }
            // 余ったグラフを削除
            if (this._userData.graph_data.datas.length < 7) {
                for (let i = 6; i > this._userData.graph_data.datas.length - 1; i--) {
                    this.barContainer.removeChild(this.barContainer.children[i]);
                }
            }
        }

        // 内容の高さを決定
        for (let i = 0; i < this.barContainer.children.length; i++) {
            this.barContainer.children[i].height =  this._graphHeight;
            this.barContainer.children[i].getChildByName("dotLine").height = this._graphHeight;
        }
        // 今週の背景の高さを決定
        // this.graph.getChildByName("thisWeekLabel").x = this.barContainer.children[0].width / 2 * -1;

        // グラフの縦軸の数字を決定する
        let sevenWeekData: number[] = this._userData.graph_data.datas.slice(-7);
        this.setAxis(sevenWeekData);

        // 表示する
        this.frontEffect.showLoadingMaxAndHide();
        this.node.runAction(
            cc.sequence(
                // cc.delayTime(.2),
                cc.callFunc(() => {
                    this.barContainer.active = true;
                    this.barContainer.runAction(cc.fadeIn(0.4));
                }),
                cc.callFunc(() => {this.showGraph();})
            )
        );
    }

    // グラフの縦軸を決める(引数は、表示するデータの配列)
    private setAxis(data: number[]): void {
        let max: number = Math.max.apply(null, data);
        let min: number = Math.min.apply(null, data);
        let axisBase: number = 0;
        if (min === 0) min = 1;
        loop: for (let i = 0; i < this._axisList.length; i++) {
            if (Math.floor((min - 1) / this._axisList[i]) * this._axisList[i] + this._axisList[i] * 4 >= max) {
                axisBase = this._axisList[i];
                this._axisMin = Math.floor((min - 1) / this._axisList[i]) * this._axisList[i];
                break loop;
            }
        }

        // 縦軸の最大値を決定する
        let axisIndex: number = 0;
        loop2: for (let i = 1; i <= 4; i++) {
            if (max < this._axisMin + axisBase * i) {
                axisIndex = i;
                this._axisMax = this._axisMin + axisBase * i;
                break loop2;
            }
        }

        this.graph.getChildByName("axis0").getComponent(cc.Label).string = this._axisMin.toString();
        switch (axisIndex) {
            case 1:
                this.graph.getChildByName("verticalAxis1").getChildByName("label").getComponent(cc.Label).string = (this._axisMin + axisBase * 1).toString();
                this.graph.getChildByName("verticalAxis1").runAction(
                cc.valueTo(0.2, this.graph.getChildByName("verticalAxis1").y, this._graphHeight, (value) => {
                        this.graph.getChildByName("verticalAxis1").y = value;
                    })
                );
                this.graph.getChildByName("verticalAxis2").active = false;
                this.graph.getChildByName("verticalAxis3").active = false;
                this.graph.getChildByName("axisMax").active = false;
                break;

            case 2:
                this.graph.getChildByName("verticalAxis1").getChildByName("label").getComponent(cc.Label).string = (this._axisMin + axisBase * 1).toString();
                this.graph.getChildByName("verticalAxis1").active = true;
                this.graph.getChildByName("verticalAxis1").runAction(
                    cc.valueTo(0.2, this.graph.getChildByName("verticalAxis1").y, this._graphHeight / 2, (value) => {
                        this.graph.getChildByName("verticalAxis1").y = value;
                    })
                );
                this.graph.getChildByName("verticalAxis2").active = true;
                this.graph.getChildByName("verticalAxis2").getChildByName("label").getComponent(cc.Label).string = (this._axisMin + axisBase * 2).toString();
                this.graph.getChildByName("verticalAxis2").runAction(
                    cc.valueTo(0.2, this.graph.getChildByName("verticalAxis2").y, this._graphHeight, (value) => {
                        this.graph.getChildByName("verticalAxis2").y = value;
                    })
                );
                this.graph.getChildByName("verticalAxis3").active = false;
                this.graph.getChildByName("axisMax").active = false;
                break;
            case 3:
                this.graph.getChildByName("verticalAxis1").active = true;
                this.graph.getChildByName("verticalAxis1").getChildByName("label").getComponent(cc.Label).string = (this._axisMin + axisBase * 1).toString();
                this.graph.getChildByName("verticalAxis1").runAction(
                    cc.valueTo(0.2, this.graph.getChildByName("verticalAxis1").y, this._graphHeight / 3, (value) => {
                        this.graph.getChildByName("verticalAxis1").y = value;
                    })
                );
                this.graph.getChildByName("verticalAxis2").active = true;
                this.graph.getChildByName("verticalAxis2").getChildByName("label").getComponent(cc.Label).string = (this._axisMin + axisBase * 2).toString();
                this.graph.getChildByName("verticalAxis2").runAction(
                    cc.valueTo(0.2, this.graph.getChildByName("verticalAxis2").y, this._graphHeight / 3 * 2, (value) => {
                        this.graph.getChildByName("verticalAxis2").y = value;
                    })
                );
                this.graph.getChildByName("verticalAxis3").active = true;
                this.graph.getChildByName("verticalAxis3").getChildByName("label").getComponent(cc.Label).string = (this._axisMin + axisBase * 3).toString();
                this.graph.getChildByName("verticalAxis3").runAction(
                    cc.valueTo(0.2, this.graph.getChildByName("verticalAxis3").y, this._graphHeight, (value) => {
                        this.graph.getChildByName("verticalAxis3").y = value;
                    })
                );
                this.graph.getChildByName("axisMax").active = false;
                break;
            case 4:
                this.graph.getChildByName("verticalAxis1").active = true;
                this.graph.getChildByName("verticalAxis1").getChildByName("label").getComponent(cc.Label).string = (this._axisMin + axisBase * 1).toString();
                this.graph.getChildByName("verticalAxis1").runAction(
                    cc.valueTo(0.2, this.graph.getChildByName("verticalAxis1").y, this._graphHeight / 4, (value) => {
                        this.graph.getChildByName("verticalAxis1").y = value;
                    })
                );
                this.graph.getChildByName("verticalAxis2").active = true;
                this.graph.getChildByName("verticalAxis2").getChildByName("label").getComponent(cc.Label).string = (this._axisMin + axisBase * 2).toString();
                this.graph.getChildByName("verticalAxis2").runAction(
                    cc.valueTo(0.2, this.graph.getChildByName("verticalAxis2").y, this._graphHeight / 4 * 2, (value) => {
                        this.graph.getChildByName("verticalAxis2").y = value;
                    })
                );
                this.graph.getChildByName("verticalAxis3").active = true;
                this.graph.getChildByName("verticalAxis3").getChildByName("label").getComponent(cc.Label).string = (this._axisMin + axisBase * 3).toString();
                this.graph.getChildByName("verticalAxis3").runAction(
                    cc.valueTo(0.2, this.graph.getChildByName("verticalAxis3").y, this._graphHeight / 4 * 3, (value) => {
                        this.graph.getChildByName("verticalAxis3").y = value;
                    })
                );
                this.graph.getChildByName("axisMax").active = true;
                this.graph.getChildByName("axisMax").getComponent(cc.Label).string = (this._axisMax).toString();
                break;
        }
    }

    // グラフを0にする
    private resetGraph(): void {
        this.barContainer.children[0].getChildByName("weekBar").height = 0;
        for (let i = 0; i < this.barContainer.children.length; i++) {
            this.node.runAction(
                cc.valueTo(0.05, this.barContainer.children[i].getChildByName("bar").height, 0, (value) => {
                    this.barContainer.children[i].getChildByName("bar").height = value;
                })
            )
        }
    }

    // グラフのバーの高さのセットとアニメーション
    private showGraph(): void {
        let delayTime: number = 0.1;
        if (this._displayMode === 7) delayTime = 0.1;
        else if (this._displayMode === 14) delayTime = 0.05;
        let count: number = 0;
        for (let i = this.barContainer.children.length - 1; i >= 0; i--) {
            let barHeight: number = this._graphHeight * (this._userData.graph_data.datas[this._userData.graph_data.datas.length - i - 1] - this._axisMin) / (this._axisMax - this._axisMin);
            if (this._displayMode === 7 && i > 6) {
                // 7週間モードで、データは8週以上ある場合
                this.barContainer.children[i].getChildByName("bar").height = 0;
            } else if (this._displayMode === 14 && i > 13) {
                // 14週間モードで、データは15週以以上ある場合
                this.barContainer.children[i].getChildByName("bar").height = barHeight;
            } else if (this._displayMode === 7 && i <= 6 || this._displayMode === 14 && i <= 13) {
                // 7週間モードで、データは7週以下の場合 または 14週モードで、データは14週以下の場合
                count++;
                this.node.runAction(
                    cc.sequence(
                        cc.delayTime(delayTime * count),
                        cc.valueTo(0.2, 0, barHeight, (value) => {
                            this.barContainer.children[i].getChildByName("bar").height = value;
                        })
                    )
                )
            }
            let delay: number = 0;
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(0.1 * Math.min(this._displayMode, this.barContainer.children.length) + 0.2),
                    cc.callFunc(() => {
                        this._canTouchFlg = true;
                        this.showThisWeekBar();
                    })
                )
            )
        }
    }

    // 切り替え時のグラフ幅の変更アニメーション
    private changeBarWidth(callback: () => void): void {
        for (let i =0; i < this.barContainer.children.length; i++) {
            this.barContainer.children[i].color = new cc.Color(255, 255, 255);
            this.barContainer.children[i].getChildByName("weekBar").height = 0;
            this.barContainer.children[i].getChildByName("bar").height = 0;
        }
        let barWidth: number;
        if (this._displayMode === 7 && this._userData.graph_data.datas.length <= 7 || this._displayMode === 14 && this._userData.graph_data.datas.length <= 14) {
            barWidth = 588/this._userData.graph_data.datas.length;
        } else if (this._displayMode === 7 && this._userData.graph_data.datas.length > 7) {
            barWidth = 588 / 7;
        } else if (this._displayMode === 14 && this._userData.graph_data.datas.length > 14) {
            barWidth = 588 / 14;
        }
        for (let i = 0; i < this._userData.graph_data.datas.length; i++) {
            this.node.runAction(
                cc.valueTo(0.2, this.barContainer.children[0].width, barWidth, (value) => {
                    this.barContainer.children[i].x = value * (i+1) * -1;
                    this.barContainer.children[i].width = value;
                    this.barContainer.children[i].getChildByName("bar").width = value*38/84;
                    this.barContainer.children[i].getChildByName("bar").x = value / 2;
                    this.barContainer.children[i].getChildByName("weekBar").width = barWidth*38/84;
                    this.barContainer.children[i].getChildByName("weekBar").x = barWidth / 2;
                })
            )
        }
        // this.graph.getChildByName("thisWeekLabel").runAction(
        //     cc.valueTo(0.2, this.graph.getChildByName("thisWeekLabel").x, barWidth / 2 * -1, (value) => {
        //         this.graph.getChildByName("thisWeekLabel").x = value;
        //     })
        // )

        // スクロール領域の幅を決定
        if (this._displayMode === 7 || this._displayMode === 14 && this._userData.graph_data.datas.length <= 14) {
            this.barContainer.width = 588;
        } else {
            this.barContainer.width = barWidth * (this._userData.graph_data.datas.length);
        }
        this.node.runAction(
            cc.sequence(
                cc.delayTime(0.4),
                cc.callFunc(() => {callback()})
            )
        )
    }

    // 7週と14週の変更
    private changeGraph(): void {
        if (this._canTouchFlg) {
            this._canTouchFlg = false;
            if (this._displayMode === 7) {
                // 14週に変更する
                this.tab.getChildByName("btn7").runAction(cc.tintTo(.2, 0, 165, 180));
                this.tab.getChildByName("btn14").runAction(cc.tintTo(.2, 0, 0, 0));
                this.tab.getChildByName("btnBg").runAction(cc.moveTo(.2, 54, 0));
                this._displayMode = 14;
                this.setAxis(this._userData.graph_data.datas);
                this.resetGraph();
                this.changeBarWidth(() => {
                    this.showGraph();
                })
    
            } else {
                // 7週に変更する処理
                this.tab.getChildByName("btn7").runAction(cc.tintTo(.2, 0, 0, 0));
                this.tab.getChildByName("btn14").runAction(cc.tintTo(.2, 0, 165, 180));
                this.tab.getChildByName("btnBg").runAction(cc.moveTo(.2, -54, 0));
                this._displayMode = 7;
                let sevenWeekData: number[] = this._userData.graph_data.datas.slice(-7);
                this.setAxis(sevenWeekData);
                this.resetGraph();
                this.changeBarWidth(() => {
                    this.showGraph();
                })
            }
        }
    }

    // スクロール位置を取得したい
    private getScrollPos(event): void {
        this._scrollPos = event.getScrollOffset();
    }

    // タブを押したとき
    private onPressTab(): void {
        this.changeGraph();
    }

    // ！押したとき
    private onPressInfo(): void {
        this._modal = this._menuMain.showModalWindow();
        this._modal.removeChild(this._modal.getChildByName("popupArea"));
            if (this._modal.children.length === 1) {
                this._modal.addChild(this.popupArea);
            }
            this.popupArea.active = true;
            this.popupArea.opacity = 0;
            this.popupArea.runAction(
                cc.fadeIn(0.2)
            )
        if (this._modal.children.length === 1) this._modal.addChild(this.popupArea);
    }

    // ポップアップ閉じる
    private onPressClose(): void {
        this.popupArea.active = false;
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

    private showThisWeekBar(): void {
        if (Math.abs(this._touchEndPos.x - this._touchStartPos.x) <= 10) {
            // タッチしたバーのインデックス
            let touchBarIndex = Math.floor((Math.abs(this._touchEndPos.x) + (this._scrollPos.x + this.barContainer.width - 588)) / this.barContainer.children[0].width);

            // タッチした週の情報を表示する
            let selectedWeekTotalNum: number;
            if (touchBarIndex < this._userData.graph_data.datas.length - 1) {
                selectedWeekTotalNum = this._userData.graph_data.datas[this._userData.graph_data.datas.length - 1 - touchBarIndex] - this._userData.graph_data.datas[this._userData.graph_data.datas.length - 2 - touchBarIndex];
            } else {
                selectedWeekTotalNum = this._userData.graph_data.datas[0];
            }
            this.weekQOutput.resetNum();
            this.weekQOutput.to(selectedWeekTotalNum, 0.3);

            // タッチしたバーをハイライトし、その週の合計を表示する
            for (let i = 0; i < this.barContainer.children.length; i++) {
                this.barContainer.children[i].color = new cc.Color(255, 255, 255);
                this.barContainer.children[i].getChildByName("weekBar").height = 0;
            }

            try
            {
                this.barContainer.children[touchBarIndex].color = new cc.Color(255, 240, 0);
            }
            catch(e)
            {
                BugTracking.notify("学習ページのバー表示エラー？", "MenuGakushuPage.showThisWeekBar()",
                {
                    msg:"学習ページのバー表示エラー?",
                    touchBarIndex: touchBarIndex,
                    selectedWeekTotalNum: selectedWeekTotalNum,
                    barContainer_children: this.barContainer.children
                });
            }
            
            this.barContainer.children[touchBarIndex].getChildByName("weekBar").y = this._graphHeight * (this._userData.graph_data.datas[this._userData.graph_data.datas.length - touchBarIndex - 1] - this._axisMin) / (this._axisMax - this._axisMin);
            this.barContainer.children[touchBarIndex].getChildByName("weekBar").runAction(
                cc.valueTo(.2, 0, (this._graphHeight * selectedWeekTotalNum / (this._axisMax - this._axisMin)), (value) => {
                    this.barContainer.children[touchBarIndex].getChildByName("weekBar").height = value;
                })
            )
        }
    }

    // update (dt) {}
}
