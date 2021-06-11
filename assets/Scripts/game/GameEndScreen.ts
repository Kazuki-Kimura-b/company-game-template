import EventUnkoSensei from "../opening/EventUnkoSensei";
import { SpecialEvent } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameEndScreen extends cc.Component {

    @property(cc.Mask) mask:cc.Mask = null;
    @property(cc.Node) eventUnkoSenseiParentNode:cc.Node = null;
    @property(cc.Node) coverNode:cc.Node = null;
    @property(cc.Prefab) eventUnkoSenseiPrefab:cc.Prefab = null;

    private _eventUnkoSensei:EventUnkoSensei = null;
    
    

    public setup(canvas:cc.Canvas):void
    {
        let node:cc.Node = cc.instantiate(this.eventUnkoSenseiPrefab);
        this.eventUnkoSenseiParentNode.addChild(node);
        this._eventUnkoSensei = node.getComponent(EventUnkoSensei);
        this._eventUnkoSensei.setup(canvas, SpecialEvent.HAYABEN_END);

        this.coverNode.active = false;

        cc.tween(this.mask.node)
        .to(1.4, { width:0, height:0 })
        .call(()=>
        {
            let script:string = "<i>よう{頑張,がんば}ったの。\n{今日,きょう}はゆっくり{休,やす}むのじゃ。</i>";

            this._eventUnkoSensei.startEventStory(script, ()=>
            {
                this.coverNode.opacity = 0;
                this.coverNode.active = true;
                cc.tween(this.coverNode)
                .to(0.5, { opacity:255 })
                .call(()=>
                {
                    //ひとまずタイトルに戻す
                    cc.director.loadScene("title");
                })
                .start();
            });
        })
        .start();

    }
}
