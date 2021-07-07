import { CollectionItem } from "../common/Models";
import SchoolAPI from "../common/SchoolAPI";
import SchoolText from "../common/SchoolText";
import SE from "../common/SE";
import STFormat from "../common/STFormat";
import StaticData, { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UnkoGet extends cc.Component
{
    @property(cc.Sprite) unkoSprite: cc.Sprite = null;
    @property(cc.Node) getTextNode: cc.Node = null;
    @property(cc.Node) hukidashiNode: cc.Node = null;
    @property(SchoolText) messageOutput: SchoolText = null;
    @property(cc.Node) gokouNodeA: cc.Node = null;
    @property(cc.Node) gokouNodeB: cc.Node = null;
    @property(cc.Node) gokouNodeC: cc.Node = null;
    @property(cc.Node) tapNextIcon: cc.Node = null;
    @property(cc.Node) coverNode: cc.Node = null;
    @property({type:cc.AudioClip}) seUnkoGet:cc.AudioClip = null;


    private _onCompleteCallback:()=>void = null;


    public setup(unko: cc.SpriteFrame, onCompleteCallback:()=>void):void
    {
        this._onCompleteCallback = onCompleteCallback;
        
        this.gokouNodeA.opacity = 0;
        this.gokouNodeB.opacity = 0;
        this.gokouNodeC.opacity = 0;
        this.getTextNode.active = false;
        this.unkoSprite.node.active = false;
        this.tapNextIcon.active = false;
        this.hukidashiNode.active = false;

        let message:string = StaticData.opponentData.unko_get_script;

        let textFormat:STFormat = STFormat.create(
        {
            size: 36,
            margin: 2,
            lineHeight: 80,
            rows: 4,
            columns: 16,
            horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
            verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
            color: cc.color(255, 255, 255),
            yomiganaSize: 20,
            yomiganaMarginY: 2
        });
        this.messageOutput.createText(message, textFormat);
        this.messageOutput.hideText();

        this.unkoSprite.spriteFrame = unko;
        this._showStart();
    }


    private _showStart():void
    {
        //後光登場
        this.gokouNodeA.runAction(
            cc.repeatForever(
                cc.rotateBy(2.0, 36)
            )
        );

        this.gokouNodeB.runAction(
            cc.repeatForever(
                cc.rotateBy(5.0, -36)
            )
        );

        this.gokouNodeA.runAction(cc.fadeTo(0.2, 255));
        this.gokouNodeB.runAction(cc.fadeTo(0.2, 255));
        this.gokouNodeC.runAction(cc.fadeTo(0.2, 255));

        //うんこ登場

        this.unkoSprite.node.scale = 0.3;
        this.unkoSprite.node.active = true;

        SE.play(this.seUnkoGet);
        
        this.unkoSprite.node.runAction(
            cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.3, 2.0).easing(cc.easeSineIn()),
                    cc.rotateBy(0.3, 360 * 3)
                ),
                cc.delayTime(0.3),
                cc.callFunc(()=>
                {
                    //「GET!」のアニメーション
                    this.getTextNode.active = true;
                    this.getTextNode.scale = 0;
                    this.getTextNode.runAction(
                        cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
                    );
                }),
                cc.scaleTo(0.25, 1.0).easing(cc.easeBackOut()),
                cc.callFunc(()=>
                {
                    //吹き出し
                    this.hukidashiNode.active = true;
                    this.hukidashiNode.scale = 0;
                    this.hukidashiNode.runAction(
                        cc.sequence(
                            cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
                            cc.callFunc(()=>
                            {
                                this.messageOutput.showText(()=>
                                {
                                    this.tapNextIcon.active = true;

                                    this.coverNode.once(cc.Node.EventType.TOUCH_END, (event)=>
                                    {
                                        this._closeAction();
                                    });
                                });
                            })
                        )
                    );
                })
                /*
                cc.delayTime(0.5),
                cc.callFunc(()=>
                {
                    this.tapNextIcon.active = true;

                    this.coverNode.once(cc.Node.EventType.TOUCH_END, (event)=>
                    {
                        this._closeAction();
                    });
                })
                */
            )
        );
    }


    private _closeAction():void
    {
        this.tapNextIcon.active = false;
        
        this.getTextNode.runAction(
            cc.scaleTo(0.2, 0.0).easing(cc.easeInOut(2))
        );

        this.hukidashiNode.runAction(
            cc.scaleTo(0.2, 0.0).easing(cc.easeInOut(2))
        );

        this.gokouNodeA.runAction(cc.fadeTo(0.3, 0));
        this.gokouNodeB.runAction(cc.fadeTo(0.3, 0));
        this.gokouNodeC.runAction(cc.fadeTo(0.3, 0));

        cc.tween(this.unkoSprite.node)
        .to(0.3, { scale:0.0 }, { easing:EasingName.sineOut })
        .call(()=>{ this._onCompleteCallback(); })
        .start();
    }

}
