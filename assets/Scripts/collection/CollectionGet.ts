import { CollectionItem } from "../common/Models";
import SchoolAPI from "../common/SchoolAPI";
import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CollectionGet extends cc.Component {

    @property(SchoolText) nameOutput: SchoolText = null;
    @property(SchoolText) triggerOutput: SchoolText = null;
    @property(cc.Sprite) imageSprite: cc.Sprite = null;
    @property(cc.Button) btnBack: cc.Button = null;

    @property(cc.Node) radiation: cc.Node = null;
    @property(cc.Node) unko: cc.Node = null;
    @property(cc.Node) star: cc.Node = null;
    @property(cc.Node) collectionGetLine: cc.Node = null;
    @property(cc.Node) shadow: cc.Node = null;


    //多分使ってない。うんこゲットに変わって廃止になっていると思うので
    //しばらくコメントアウトして問題ない場合削除する

    /*
    private _closeCallback:()=>void = null;


    public onCloseCallback(callback:()=>void):void
    {
        this._closeCallback = callback;
    }



    public setup(collectionItem:CollectionItem) {
        this.radiation.runAction(
            cc.repeatForever(
                cc.rotateBy(4, 180)
            )
        );

        
        // for (let i = 0; i < 4; i++) {
        //     this.starAction(i);
        // }

        this.collectionGetLine.active = false;
        this.unko.active = false;
        this.nameOutput.node.parent.active = false;
        this.triggerOutput.node.active = false;
        this.btnBack.node.active = false;
        this.shadow.active = false;

        this.imageSprite.node.scale = 0.5;

        this.setName(collectionItem.name);
        this.setTrigger(collectionItem.description);

        SchoolAPI.loadImage("unko", collectionItem.card_url, (response:any)=>
        {
            this.imageSprite.spriteFrame = response.image;

            //読み込み完了、演出開始
            this._loadImageCompleted();
        });
    }


    private _loadImageCompleted():void
    {       
        this.unko.active = true;
        
        // うんこのアニメーションに必要な数値[角度, x、y]
        let unkoData: number[][] = [
            [-40, -241, -543],
            [32, 193, -612],
            [-46, -312, -214],
            [-24, 306, 34],
            [-16, 250, 390],
            [-136, -150, 430],
            [213, 296, -416],
            [118, -287, -363],
            [23, -310, -40],
            [36, 310, 226],
            [-31, -298, 324]
        ];
        for (let i = 0; i < 11; i++) {
            this.unkoAction(i, unkoData[i][0], unkoData[i][1], unkoData[i][2]);
        }
        
        //画像登場演出
        this.imageSprite.node.runAction(
            cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.3, 2.0).easing(cc.easeSineIn()),
                    cc.rotateBy(0.3, 360 * 3)
                ),
                cc.delayTime(0.5),
                cc.callFunc(()=>
                {
                    this.nameOutput.node.parent.active = true;
                    this.shadow.active = true;

                    //「GET!」のアニメーション
                    this.collectionGetLine.active = true;
                    this.lineAction(0, 0, -117 ,30);
                    this.lineAction(1, 0.1, -13 ,37);
                    this.lineAction(2, 0.2, 80 ,28);
                    this.lineAction(3, 0.3, 143 ,25);
                }),
                cc.scaleTo(0.25, 1.0).easing(cc.easeBackOut()),
                cc.callFunc(()=>
                {
                    this.triggerOutput.node.active = true;
                    this.btnBack.node.active = true;
                })
            )
        );
    }



    // 「GET!」のアニメーション
    private lineAction(index: number, delay: number, posX: number, posY: number) {
        this.collectionGetLine.children[index].runAction(
                cc.repeatForever(
                    cc.sequence(
                    cc.delayTime(0.3 + delay),
                    cc.moveBy(0.1, 0, 10).easing(cc.easeIn(3)),
                    // cc.delayTime(0.3),
                    cc.moveBy(0.1, 0, -10).easing(cc.easeIn(3)),
                    cc.delayTime(0.3 - delay)
                )
            )
        )
    }

    // うんこのアニメーション
    private unkoAction(index: number, angle: number, x: number, y: number) {
        this.unko.children[index].runAction(
            cc.repeatForever(
                cc.sequence(
                    // cc.scaleTo(0, 1),
                    cc.fadeTo(0, 204),
                    cc.delayTime(1),
                    cc.spawn(
                        cc.moveTo(1.2, x, y).easing(cc.easeQuinticActionOut()),
                        cc.rotateTo(0, angle)
                    ),
                    cc.delayTime(0.3),
                    // cc.scaleTo(0.1, 1.1),
                    // cc.spawn(
                    //     cc.moveBy(0.4, x, y),
                    //     cc.fadeOut(0.4),
                    // ),
                    // cc.moveTo(0, 0, 0)
                )
            )
        )
    }

    // キラキラのアニメーション
    private starAction(index: number) {
        if (index % 2 === 0) {
            this.star.children[index].runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.fadeTo(0, 255),
                        cc.fadeOut(1).easing(cc.easeIn(1)),
                        cc.fadeIn(1).easing(cc.easeOut(1))
                    )
                )
            )
        } else {
            this.star.children[index].runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.fadeTo(0, 0),
                        cc.fadeIn(1).easing(cc.easeOut(1)),
                        cc.fadeOut(1).easing(cc.easeIn(1))
                    )
                )
            )
        }
    }

    // 画像のロード
    private loadImage(url: string, callback:()=>void): void {
        cc.loader.load(url, (err, tex) => {
            if (err) {
                cc.error(err);
                throw new Error("image loading error");
            }
            this.imageSprite.spriteFrame = new cc.SpriteFrame(tex);
            //let image: cc.Node = this.node.getChildByName("image");
            //image.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);

            callback();
        });
    }

    // 名前のセット
    private setName(name: string): void {
        if (name.length >= 10) {
            cc.log(name);
            name = name.replace(/(・)/, "$1\n");
        }

        this.nameOutput.resetText();
        let format: {} = {
            size: 32,
            margin: 2,
            lineHeight: 40,
            rows: 2,
            columns: 15,
            horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
            verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
            color: cc.color(255, 255, 255),
            yomiganaSize: 16
        }
        this.nameOutput.createText(name, STFormat.create(format));
        this.nameOutput.reLayoutText();
    }

    // トリガーのセット
    private setTrigger(trigger: string): void {
        trigger = trigger.replace(/(で|を)/, "$1\n")
        this.triggerOutput.resetText();
        let format: {} = {
            size: 46,
            margin: 2,
            lineHeight: 72,
            rows: 2,
            columns: 15,
            horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
            verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
            color: cc.color(0, 0, 0),
            yomiganaSize: 16
        }
        this.triggerOutput.createText(trigger, STFormat.create(format));
        this.triggerOutput.reLayoutText();
    }

    // ×ボタンを押す
    onPressBackBtn(): void
    {
        //閉じる演出
        this.btnBack.node.active = false;
        this.unko.active = false;
        this.collectionGetLine.active = false;
        this.nameOutput.node.parent.active = false;
        this.triggerOutput.node.active = false;
        this.shadow.active = false;
        
        this.imageSprite.node.runAction(
            cc.sequence(
                cc.spawn(
                    cc.fadeTo(0.3, 0).easing(cc.easeIn(2.0)),
                    cc.scaleTo(0.3, 0.5).easing(cc.easeIn(2.0)),
                ),
                cc.delayTime(0.2),
                cc.callFunc(()=>
                {
                    //コールバックが登録済みなら呼び出す
                    if(this._closeCallback != null) this._closeCallback();
                    
                    this.node.removeFromParent();
                })
            )
        );
        
    }
    */
}