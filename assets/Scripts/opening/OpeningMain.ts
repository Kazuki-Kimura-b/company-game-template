import StaticData, { SpecialEvent } from "../StaticData";
import BitmapNum from "../common/BitmapNum";
import SE from "../common/SE";
import SceneChanger from "../common/SceneChanger";
import TapEffect from "../common/TapEffect";
import SystemIcon from "../common/SystemIcon";
import PlayTrackLog from "../common/PlayTrackLog";
import EventUnkoSensei from "./EventUnkoSensei";
import NextIjinWarp from "../game/NextIjinWarp";

const {ccclass, property} = cc._decorator;

@ccclass
export default class OpeningMain extends cc.Component {
    @property(cc.Node) bg: cc.Node = null;
    @property(cc.Node) blueprint: cc.Node = null;
    @property(cc.Node) pages: cc.Node = null;
    @property(BitmapNum) shinkuro: BitmapNum = null;
    @property(cc.Node) arrow: cc.Node = null;
    @property(cc.Canvas) canvas:cc.Canvas = null;
    @property(cc.Node) contentsNode:cc.Node = null;
    @property(cc.Prefab) sceneLoadIndicator: cc.Prefab = null;
    @property(cc.Prefab) eventUnkoSenseiPrefab:cc.Prefab = null;
    @property(cc.Prefab) nextIjinWarpPrefab:cc.Prefab = null;

    @property({type:cc.AudioClip}) bgmStart:cc.AudioClip = null;
    @property({type:cc.AudioClip}) bgmStudy:cc.AudioClip = null;
    @property({type:cc.AudioClip}) bgmComplete:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seFlash:cc.AudioClip = null;

    _pageNum: number = 1; // 現在のページ数
    _canSkip: boolean = false; // タップで全文表示できるか
    _canNextPage: boolean = false; // タップで次のページへ進めるか
    _stopShowLineFlag: boolean = false;


    start ()
    {
        PlayTrackLog.add("OpeningMain.start()");
        
        //次のシーンを事前読み込み
        cc.director.preloadScene("opening_B");



        let sceneChanger:SceneChanger = this.getComponent(SceneChanger);
        sceneChanger.sceneStart(()=>
        {
            this.showPage(this._pageNum);
        });
    }


    private _startOpeningB():void
    {
        let sceneChanger:SceneChanger = this.getComponent(SceneChanger);
        sceneChanger.sceneEnd(null, ()=>
        {
            SE.bgmStop();

            //contentsに高さ1100のマスクがかかっているので外す
            this.contentsNode.height = 1600;
            
            sceneChanger.coverNode.active = false;

            this.contentsNode.removeAllChildren(true);
        
            let node:cc.Node = cc.instantiate(this.eventUnkoSenseiPrefab);
            let sensei:EventUnkoSensei = node.getComponent(EventUnkoSensei);
            this.contentsNode.addChild(node);

            //事前読み込み
            cc.director.preloadScene("introduction");

            //オープニング後半開始
            sensei.setup(this.canvas, SpecialEvent.OPENING_B);
            sensei.startEventStory(this._getOpeningB_script(), ()=>
            {
                //オープニング後半終了
                
                //ワープ演出
                let node:cc.Node = cc.instantiate(this.nextIjinWarpPrefab);
                this.contentsNode.addChild(node);

                let nextIjinWarp:NextIjinWarp = node.getComponent(NextIjinWarp);
                nextIjinWarp.setup(()=>
                {
                    cc.director.loadScene("introduction");
                });
            });
        });
        

        
        /*
        //ロードアイコン表示
        let loadIcon:SystemIcon = SystemIcon.create(this.sceneLoadIndicator);
        loadIcon.setup(StaticData.TIME_LOAD_SCENE_ICON);
        
        cc.director.preloadScene("opening_B", ()=>{}, (error:Error)=>
        {
            //ロード完了
            loadIcon.remove();      //ロードアイコンを消す

            let sceneChanger:SceneChanger = this.getComponent(SceneChanger);
            sceneChanger.sceneEnd(null, ()=>
            {
                //オープニング後半へ
                StaticData.specialEvent = SpecialEvent.OPENING_B;
                cc.director.loadScene("opening_B");
                //StaticData.flgOpening = true;
                //cc.director.loadScene("introduction");
                SE.bgmStop();
            });
        });
        */
    }





    private async showPage(pageNum: number): Promise<any> {
        this.pages.children[pageNum - 1].active = true;
        let spot: cc.Node = this.bg.getChildByName("spot");
        switch (pageNum) {
            case 1:
                this.node.runAction(
                    cc.sequence(
                        cc.delayTime(1),
                        cc.callFunc(() => {
                            SE.bgmStart(this.bgmStart);
                            this.showText(pageNum);
                        })
                    )
                )
                break;

            case 2:
                this.node.runAction(
                    cc.sequence(
                        // cc.delayTime(0.5),
                        cc.callFunc(() => {
                            spot.runAction(cc.valueTo(1, 0, 2000, (value) => {spot.setContentSize(value, value)}));
                        }),
                        cc.delayTime(0.5),
                        cc.callFunc(() => {this.showText(pageNum);})
                    )
                )
                break;

            case 3:
                spot.runAction(
                    cc.sequence(
                        cc.delayTime(0.5),
                        cc.callFunc(() => {
                            SE.play(this.seFlash);
                            spot.children[5].active = true;
                            this.showText(pageNum);
                        }),
                    )
                )
                break;
            case 4:
                spot.runAction(
                    cc.sequence(
                        cc.valueTo(0.8, 2000, 0, (value) => {spot.setContentSize(value, value)}),
                        cc.delayTime(0.5),
                        cc.callFunc(() => {
                            spot.children[4].active = false;
                            spot.children[5].active = false;
                            spot.children[6].active = true;
                        }),
                        cc.valueTo(0.6, 0, 680, (value) => {spot.setContentSize(value, value)}),
                        cc.delayTime(0.5),
                        cc.callFunc(() => {
                            this.showText(pageNum);
                        })
                    )
                )
                break;

            case 5:
                this.node.runAction(
                    cc.sequence(
                        cc.callFunc(() => {
                            spot.runAction(cc.moveTo(1, 0, 2000));
                            this.blueprint.active = true;
                            this.blueprint.runAction(cc.moveTo(1, 0, 100));
                        }),
                        cc.delayTime(0.5),
                        cc.callFunc(() => {
                            this.showText(pageNum);
                        })
                    )
                )
                break;

            case 6:
                SE.bgmStop();
                SE.bgmStart(this.bgmStudy);
                this.node.runAction(
                    cc.sequence(
                        cc.callFunc(() => {
                            this.blueprint.runAction(cc.moveTo(1, 0, 2000));
                        }),
                        cc.callFunc(() => {
                            this.bg.getChildByName("spotlight").active = true;
                            this.bg.getChildByName("spotlight").runAction(cc.fadeIn(1.5));
                        }),
                        cc.delayTime(1),
                        cc.callFunc(() => {this.shapeAnime("unko");}),
                        cc.delayTime(1),
                        cc.callFunc(() => {
                            this.pages.children[pageNum - 1].getChildByName("unko").runAction(cc.valueTo(0.2, 0, 160, (value) => {this.pages.children[pageNum - 1].getChildByName("unko").setPosition(0, value)}));
                        }),
                        cc.callFunc(() => {this.shapeAnime("semi");}),
                        cc.delayTime(1.5),
                        cc.callFunc(() => {
                            this.pages.children[pageNum - 1].getChildByName("unko").runAction(cc.valueTo(0.2, 160, 380, (value) => {this.pages.children[pageNum - 1].getChildByName("unko").setPosition(0, value)}));
                            this.pages.children[pageNum - 1].getChildByName("semi").runAction(cc.valueTo(0.2, -160, 40, (value) => {this.pages.children[pageNum - 1].getChildByName("semi").setPosition(0, value)}));
                            this.shinkuroAnime();
                        }),
                        cc.delayTime(2.8),
                        cc.callFunc(() => {
                            this.pages.children[pageNum - 1].runAction(cc.moveBy(2, 0, 1120));
                            this.runProgress(this.pages.children[pageNum - 1].getChildByName("progress1"));
                            this.pages.children[pageNum - 1].getChildByName("unkosensei_back").runAction(
                                cc.sequence(
                                    cc.moveTo(0.4, 192, -768),
                                    cc.delayTime(1.4),
                                    cc.moveTo(0.4, 500, -768)
                                )
                            )
                        }),
                        cc.delayTime(0.8),
                        cc.callFunc(() => {this.coreAnime()}),
                        cc.delayTime(2.4),
                        cc.callFunc(() => {
                            this.pages.children[pageNum - 1].runAction(cc.moveBy(2, 0, 1050));
                            this.runProgress(this.pages.children[pageNum - 1].getChildByName("progress7"));
                            this.pages.children[pageNum - 1].getChildByName("unkosensei_carry").runAction(cc.moveTo(2, -532, -1340))
                        }),
                        cc.delayTime(1.4),
                        cc.callFunc(() => {this.unkosemiAnime()}),
                        cc.delayTime(3),
                        cc.callFunc(() => {this.pages.children[pageNum - 1].runAction(cc.moveBy(2, 0, 1000));}),
                        cc.delayTime(2),
                        cc.callFunc(() => {this.showText(pageNum)})
                    )
                )
                break;

            case 7:
                SE.bgmStop();
                SE.bgmStart(this.bgmComplete);
                SE.bgmStart(this.bgmComplete);
                spot.setPosition(0, 100);
                spot.children[7].getChildByName("radio").runAction(
                    cc.repeatForever(
                        cc.rotateBy(12, 360)
                    )
                )
                spot.children[7].active = true;
                spot.runAction(
                    cc.sequence(
                        cc.valueTo(1, 0, 2000, (value) => {spot.setContentSize(value, value)}),
                        cc.delayTime(0.5),
                        cc.callFunc(() => {this.showText(pageNum);})
                    )
                )
                break;
            case 8:
                this.showText(pageNum);
                break;
        }
    }

    private async showText(pageNum: number, delay?: number[][]): Promise<any> {
        this._canSkip = true;
        let lineNum: number = this.pages.children[pageNum - 1].getChildByName("text").children.length;
        for (let i = 0; i < lineNum; i++) {
            let delayTime: number = 0;
            if (delay) {
                for (let j = 0; j < delay.length; j++) {
                    if (i === delay[j][0] - 1) {
                        delayTime = delay[j][1];
                    }
                }
            }
            if (this._stopShowLineFlag || pageNum !== this._pageNum) {
                break;
            }
            await this.showLine(pageNum, i + 1, delayTime);
        }
        this._canNextPage = true;
        this.arrowAnime();
    }

    private async showLine(pageNum: number, lineNum: number, delay?: number): Promise<any> {
        return new Promise((resolve) => {
            let line: cc.Node = this.pages.children[pageNum - 1].getChildByName("text").children[lineNum - 1];
            for (let i = 0; i < line.children.length; i++) {
                line.children[i].opacity = 0;
            }
            line.active = true;
            for (let i = 0; i < line.children.length; i++) {
                line.children[i].runAction(
                    cc.sequence(
                        cc.delayTime(0.1 * i),
                        cc.fadeIn(0.1)
                    )
                )
            }
            if (!delay) delay = 0;
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(0.1 * line.children.length + 0.2 + delay),
                    cc.callFunc(() => {
                        resolve(null);
                    })
                )
            )
        });
    }

    private showAllText() {
        // 文字表示アニメーションを停止する
        let page: cc.Node = this.pages.children[this._pageNum - 1];
        let text: cc.Node = page.getChildByName("text");
        let lines: cc.Node[] = text.children;
        for (let i = 0; i < lines.length; i++) {
            lines[i].stopAllActions();
            for (let j = 0; j < lines[i].children.length; j++) {
                lines[i].children[j].stopAllActions();
            }
        }

        // 文字をすべて表示する
        for (let i = 0; i < lines.length; i++) {
            lines[i].active = true;
            for (let j = 0; j < lines[i].children.length; j++) {
                lines[i].children[j].opacity = 255;
            }
        }

        // 矢印の表示
        this.arrowAnime();
    }

    private onPressPage(event): void {
        
        TapEffect.instance().setParticeFromEvent(event);
        
        // スキップ時
        if (this._canSkip && !this._canNextPage) {
            this._canSkip = false;
            this._stopShowLineFlag = true;
            this.showAllText();
        } else if (this._canNextPage) {
            // 次のページへ
            if (this._pageNum === this.pages.children.length)
            {
                //ひとまず、オープニングのムービーが終わったら↓に飛ばしといてください

                PlayTrackLog.add("OpeningMain:ストーリー終了");

                //オープニング後半
                this._startOpeningB();

            } else {
                this.arrow.active = false;
                this._stopShowLineFlag = false;
                this._canNextPage = false;
                this.pages.children[this._pageNum - 1].runAction(
                    cc.sequence(
                        cc.fadeOut(0.2),
                        cc.delayTime(0.5),
                        cc.callFunc(() => {
                            this._pageNum++;
                            this.showPage(this._pageNum);
                        })
                    )
                )
            }
        }
    }


    private shapeAnime(type: string): void {
        let content: cc.Node = this.pages.children[5].getChildByName(type);
        // content.getChildByName("title").active = true;
        content.runAction(
            cc.sequence(
                cc.delayTime(0.1),
                cc.callFunc(() => {
                    content.getChildByName("title").active = true;
                    // markの移動
                    let pos: cc.Vec2 = content.getChildByName("mark").getChildByName("markT").getPosition();
                    let markT: cc.Node = content.getChildByName("mark").getChildByName("markT");
                    let markU: cc.Node = content.getChildByName("mark").getChildByName("markU");

                    markT.setPosition(0, 0);
                    markT.active = true;
                    markU.setPosition(0, 0);
                    markU.active = true;

                    markT.runAction(cc.moveTo(0.2, pos.x, pos.y));
                    markU.runAction(cc.moveTo(0.2, pos.x * -1, pos.y * -1));
                }),
                cc.delayTime(0.1),
                cc.callFunc(() => {
                    content.getChildByName("shape").runAction(cc.scaleTo(0.2, 0.85, 0.85))
                }),
                cc.delayTime(0.1),
                cc.callFunc(() => {
                    let parameter: cc.Node = content.getChildByName("parameter");
                    for (let i = 0; i < parameter.children.length; i++) {
                        parameter.children[i].runAction(
                            cc.sequence(
                                cc.delayTime(0.1 * i),
                                cc.valueTo(0.6, 0, 300, (value) => {parameter.children[i].width = value})
                            )

                        )
                    }
                }),
                cc.delayTime(0.1),
                cc.callFunc(() => {
                    content.getChildByName("tokucho").active = true;
                }),
                cc.delayTime(0.1),
                cc.callFunc(() => {
                    let graph: cc.Node = content.getChildByName("graph");
                    graph.children[0].runAction(
                        cc.sequence(
                            cc.delayTime(0.4),
                            cc.valueTo(0.6, 0, 420, (value) => {graph.children[0].width = value}),
                            cc.delayTime(0.6),
                        )
                    );
                    graph.children[1].runAction(
                        cc.sequence(
                            cc.valueTo(0.6, 0, 420, (value) => {graph.children[1].width = value}),
                            cc.delayTime(1),
                        )
                    );
                })
            )
        )
    }

    private shinkuroAnime(): void {
        let content: cc.Node = this.pages.children[5].getChildByName("shinkuro");
        let unkosensei: cc.Node = content.getChildByName("unkosensei_compass");
        unkosensei.runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.moveTo(0.4, -248, 8),
                cc.delayTime(1),
                cc.moveTo(0.4, -498, 8),
            )
        )
        content.runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.callFunc(() => {
                    content.getChildByName("title").active = true;
                    content.getChildByName("decoration").active = true;
                    content.runAction(cc.valueTo(0.3, 0, 332, (value) => {
                        content.getChildByName("decoration").children[0].x = value * -1;
                        content.getChildByName("decoration").children[1].x = value;
                    }));
                }),
                cc.delayTime(0.2),
                cc.callFunc(() => {
                    content.getChildByName("frame").runAction(cc.valueTo(0.5, 0, 600, (value) => {content.getChildByName("frame").children[0].width = value}));
                    let text: cc.Node[] = content.getChildByName("text").children;
                    for (let i = 0; i < text.length; i++) {
                        text[i].runAction(
                            cc.sequence(
                                cc.delayTime(0.1 * i),
                                cc.valueTo(0.2, 0, 100, (value) => text[i].width = value)
                            )
                        )
                    }
                }),
                cc.delayTime(0.2),
                cc.callFunc(() => {
                    this.shinkuro.to(100000, 2);
                    let graph: cc.Node[] = content.getChildByName("graph").children;
                    for (let i = 0; i < graph.length; i++) {
                        graph[i].runAction(
                            cc.sequence(
                                cc.delayTime(0.4 * i),
                                cc.valueTo(1.2, 0, 0.7, (value) => {graph[i].setScale(0.7, value)})
                            )
                        )
                    }
                })
            )
        )
    }

    private runProgress(node: cc.Node, callback?): void {
        for (let i = 0; i < node.children.length; i++) {
            node.children[i].runAction(
                cc.sequence(
                    cc.delayTime(0.12 * i),
                    cc.fadeIn(0.2),
                    cc.delayTime(0.6),
                )
            )
        }
        node.runAction(cc.delayTime(1 + 0.05 * node.children.length))
    }

    private coreAnime(): void {
        let container: cc.Node = this.pages.children[5].getChildByName("core");
        let core: cc.Node = container.getChildByName("core");
        let unko: cc.Node = container.getChildByName("unko");
        let arrow: cc.Node = container.getChildByName("arrow");
        let gear: cc.Node = container.getChildByName("gear");
        let hige: cc.Node = container.getChildByName("hige");
        let bolt: cc.Node = container.getChildByName("bolt");

        let circleAnime: (node: cc.Node) => void = (node: cc.Node): void => {
            node.runAction(
                cc.spawn(
                    cc.fadeIn(0.2),
                    cc.callFunc(() => {
                        node.children[0].runAction(cc.rotateTo(0.4, 0).easing(cc.easeIn(1.5)));
                        node.children[1].runAction(cc.rotateTo(0.2, 0).easing(cc.easeIn(1.5)));
                    })
                )
            )
        }

        this.node.runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.callFunc(() => {
                    circleAnime(hige);
                    this.runProgress(container.getChildByName("progress4"));
                }),
                cc.delayTime(0.48),
                cc.callFunc(() => {
                    circleAnime(arrow);
                    this.runProgress(container.getChildByName("progress2"));
                }),
                cc.delayTime(0.24),
                cc.callFunc(() => {
                    circleAnime(bolt);
                    this.runProgress(container.getChildByName("progress3"));
                }),
                cc.delayTime(0.12),
                cc.callFunc(() => {
                    circleAnime(gear);
                    this.runProgress(container.getChildByName("progress5"));
                }),
                cc.delayTime(0.36),
                cc.callFunc(() => {
                    circleAnime(unko);
                    this.runProgress(container.getChildByName("progress6"));
                }),
                cc.delayTime(0.36),
                cc.callFunc(() => {
                    circleAnime(core);
                }),
            )
        )
    }

    private unkosemiAnime(): void {
        let content: cc.Node = this.pages.children[5].getChildByName("robo");
        let unkosensei: cc.Node = content.getChildByName("unkosensei_ruler");
        content.runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.callFunc(() => {
                    content.getChildByName("title").active = true;
                }),
                cc.delayTime(0.6),
                cc.callFunc(() => {
                    let parameterW: number[] = [137, 10, 50, 0];
                    let parameter: cc.Node[] = content.getChildByName("parameter").children;
                    for (let i = 0; i < parameter.length; i++) {
                        content.runAction(
                            cc.sequence(
                                cc.delayTime(0.2 * i),
                                cc.callFunc(() => {
                                    parameter[i].active = true;
                                }),
                                cc.delayTime(0.5),
                                cc.valueTo(1, 0, parameterW[i], (value) => {parameter[i].getChildByName("gauge").width = value}),
                            )
                        )
                    }
                }),
                cc.delayTime(0.8),
                cc.callFunc(() => {
                    content.getChildByName("shape").runAction(cc.valueTo(1.6, 0, 700, (value) => {content.getChildByName("shape").getChildByName("maskContainer").height = value}));
                    unkosensei.runAction(
                        cc.sequence(
                            cc.moveTo(0.2, 244, -320),
                            cc.delayTime(1.2),
                            cc.moveTo(0.2, 532, -320),
                        )
                    )
                }),
                cc.delayTime(0.6),
                cc.callFunc(() => {
                    let text: cc.Node[] = content.getChildByName("text").children;
                    for (let i = 0; i < text.length; i++) {
                        content.runAction(
                            cc.sequence(
                                cc.delayTime(0.1 * i),
                                cc.callFunc(() => {text[i].active = true;})
                            )
                        )
                    }
                })
            )
        )
    }

    private arrowAnime(): void {
        if (this._canNextPage) {
            this.arrow.stopAllActions();
            this.arrow.active = true;
            this.arrow.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.fadeIn(0.5).easing(cc.easeIn(1)),
                        cc.delayTime(0.5),
                        cc.fadeOut(0.5).easing(cc.easeIn(1))
                    )
                )
            )
        }
    }


    /**
     * オープニング後半の台本を取得
     * @returns 
     */
    private _getOpeningB_script():string
    {
        let playerName:string = StaticData.playerData.nickname;
        
        let script:string =
        "<reset_status>" +
        "<y>こ、ここは…？</y>" +
        "<i>よく{来,き}たのぅ…</i>" +
        "<callback,faceChange,warui>" +
        "<callback,senseiFadeIn,stop>" +
        "<i>…</i>" +
        "<callback,faceChange,tere>" +
        "<i>…えーっと、\n{名前,なまえ}、なんじゃっけ？</i>" +
        "<n>{君,きみ}の{名前,なまえ}をおしえて！</n>" +
        "<callback,nameInput,stop>" +
        "<i>すまんすまん、\nもう{一回,いっかい}はじめから…</i>" +
        "<y>こ、ここは…？</y>" +
        "<callback,faceChange,normal>" +
        "<i>…（コホン）</i>" +
        "<callback,faceChange,warui>" +
        "<i>よく{来,き}たのぅ、__NAME__。</i>" +
        "<y>だ、だれ？</y>" +
        "<i>わしか？</i>" +
        "<callback,bgm,TRUE>" +
        "<callback,lightOn>" +
        "<callback,faceChange,smile>" +
        "<callback,effect,kouhun>" +
        "<i>わしはうんこ{先生,せんせい}じゃ。</i>" +
        "<callback,effect,end>" +
        "<i>{突然,とつぜん}じゃが、\n__NAME__よ…</i>" +
        "<callback,unazuki>" +
        "<i>おぬし、{天才,てんさい}になりたいか？</i>" +
        //-- select 1 ----
        "<select,はい、なりたい！,{別,べつ}に…>" +
        // answer A
        "<answer>" +
        "<callback,faceChange,kouhun>" +
        "<callback,effect,kirakira>" +
        "<i>うむ。{正直,しょうじき}でよろしい！</i>" +
        "</answer>" +
        // answer B
        "<answer>" +
        "<callback,faceChange,angry>" +
        "<callback,effect,ikari>" +
        "<i>{正直,しょうじき}になるのじゃ！</i>" +
        "<i>{天才,てんさい}になりたいじゃろ！</i>" +
        "<y>じ、{実,じつ}はそうなんだけど…</y>" +
        "</answer>" +
        //----------------
        "<callback,faceChange,normal>" +
        "<callback,effect,end>" +
        "<y>でも、なんで{知,し}ってるの？</y>" +
        "<callback,effect,kouhun>" +
        "<i>わしをだれだと{思,おも}っておる！</i>" +
        "<callback,faceChange,kouhun>" +
        "<callback,effect,kirakira>" +
        "<i>うんこはなんでも\n{知,し}っておるのじゃ！</i>" +
        "<y>そうなの？\nよくわかんないけど…</y>" +
        "<callback,faceChange,smile>" +
        "<callback,effect,end>" +
        "<i>そこでじゃ…</i>" +
        "<callback,effect,kirakira>" +
        "<i>__NAME__を\n{天才,てんさい}にしてやろう！</i>" +
        "<callback,effect,end>" +
        "<y>{本当,ほんとう}！？\nどうやったらなれるの？</y>" +
        "<callback,bodyChange,handUp>" +
        "<i>フォフォフォ、\nよくぞ{聞,き}いてくれたのぅ！\nこれを{見,み}るのじゃ！</i>" +
        "<callback,bgm,FALSE>" +
        "<callback,senseiVisible,FALSE>" +
        "<callback,semiFlyAndShow,stop>" +
        "<i>これはわしが20{年,ねん}かけて\n{開発,かいはつ}したタイムマシン、\n「うんこゼミ」じゃ！</i>" +
        "<i>このうんこゼミに{乗,の}れば、\n{歴史上,れきしじょう}の{偉人,いじん}、つまりたくさんの\n{天才,てんさい}たちに{出会,であ}えるぞい。</i>" +
        "<i>{世界中,せかいじゅう}をタイムトラベルして、\n{歴史上,れきしじょう}の{偉人,いじん}たちと{友,とも}だちに\nなりながら、</i>" +
        "<i>かしこくなるための{修行,しゅぎょう}を\nするのじゃ～～！</i>" +
        "<callback,semiEffect,FALSE>" +
        "<callback,semiHide,stop>" +
        "<callback,senseiVisible,TRUE>" +
        "<callback,bgm,TRUE>" +
        "<y>え～、{偉人,いじん}と{友,とも}だちになるなんて、\nできるのかなあ…</y>" +
        "<callback,faceChange,normal>" +
        "<callback,bodyChange,normal>" +
        "<callback,effect,kirakira>" +
        "<i>{大丈夫,だいじょうぶ}じゃ！\nまずは{今,いま}の__NAME__の\n{天才,てんさい}パワーをはかってみようかの。</i>" +
        "<callback,sePlay,statusShow>" +
        "<show_status>" +
        "<callback,effect,end>" +
        "<i>どれどれ…</i>" +
        //"<callback,sePlay,expUp>" +
        "<tensai_power,400>" +
        "<callback,sePlay,expEnd>" +
        "<callback,unazuki>" +
        "<i>ふむ、400くらいか。</i>" +
        "<i>まぁ、ふつうじゃの。</i>" +
        //-- select 2 ----
        "<select,え！ふつうなの？,うそだ！もう{一度,いちど}はかって！>" +
        // answer A
        "<answer>" +
        "<callback,unazuki>" +
        "<i>ふつうじゃな。</i>" +
        "</answer>" +
        // answer B
        "<answer>" +
        "<reset_status>" +
        "<i>では、もう一度…。</i>" +
        //"<callback,sePlay,expUp>" +
        "<tensai_power,400>" +
        "<callback,sePlay,expEnd>" +
        "<callback,unazuki>" +
        "<i>やっぱり、400じゃ。\nふつうじゃな。</i>" +
        "</answer>" +
        //----------------
        "<callback,negaEffect, stop>" +
        "<y><f>ガーン！</f></y>" +
        "<y>ふつう…</y>" +
        "<i>しかし、\n「{今,いま}は」の{話,はなし}じゃから{安心,あんしん}せい。</i>" +
        "<callback,effect,kouhun>" +
        "<i>これから{天才,てんさい}パワーは\nどんどん{上,あ}がるぞ。{楽,たの}しみじゃな。</i>" +
        "<callback,semiFly,0>" +
        "<callback,effect,end>" +
        "<callback,faceChange,warui>" +
        "<i>では、さっそく{出発,しゅっぱつ}じゃ！</i>" +
        "<y>え、ひとりで{行,い}くの？？？</y>" +
        "<y>このマシン、あばれてますけど？？</y>" +
        "<y>いやいや、まだ{心,こころ}の{準備,じゅんび}が〜！！！</y>" +
        //"<callback,senseiVisible,FALSE>" +
        "<callback,senseiScale0>" +
        "<callback,semiShow,stop>" +
        "<i>これでよし！\n{学,まな}びは、{遊,あそ}びじゃ。</i>" +
        "<i>{楽,たの}しんでくるのじゃぞ～～！！！</i>" +
        "<callback,bgm,FALSE>" +
        "<callback,sePlay,jet>" +
        "<callback,semiHide,stop>" +
        "<callback,lightOff>" +
        "<n>{強引,ごういん}にタイムマシンに{乗,の}せられた\n__NAME__。</n>" +
        "<n>はたして{偉人,いじん}と\n{友,とも}だちになれるのか。</n>" +
        "<n>{偉人,いじん}の{友,とも}だち100{人,にん}できるかな？\nへの{挑戦,ちょうせん}が、いま{始,はじ}まった…</n>";
        
        return script;
    }






}