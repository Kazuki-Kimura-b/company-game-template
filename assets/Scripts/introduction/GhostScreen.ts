import { NavigatorConversations } from "../common/Models";
import NegaEffector from "../common/NegaEffector";
import PlayTrackLog from "../common/PlayTrackLog";
import SchoolAPI from "../common/SchoolAPI";
import SE from "../common/SE";
import EventUnkoSensei from "../opening/EventUnkoSensei";
import StaticData, { SpecialEvent } from "../StaticData";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GhostScreen extends cc.Component
{

    @property(cc.Node) ghostNode: cc.Node = null;
    @property(cc.Node) ghostBody: cc.Node = null;
    @property(cc.Prefab) eventUnkoSenseiPrefab: cc.Prefab = null;
    @property({type:cc.AudioClip}) seGhost:cc.AudioClip = null;

    
    public setup(canvas:cc.Canvas, camera:cc.Camera, finishScreenNode:cc.Node, callback:()=>void):void
    {
        PlayTrackLog.add("GhostScreen.setup()");
        
        this.ghostBody.opacity = 0;
        this.ghostNode.scale = 1.4;

        
        cc.tween(canvas.node)
        .delay(0.5)
        .call(()=>
        {
            //色のネガ反転
            let negaEffector:NegaEffector = this.getComponent(NegaEffector);
            negaEffector.setCanvasAndCamera(canvas.node, camera);
            negaEffector.setIgnoreNode(this.ghostNode);     //対象外
            negaEffector.setIgnoreNode(finishScreenNode);     //対象外
            negaEffector.setNegaWithBackGround();
        })
        .delay(1.0)
        .call(()=>
        {
            //ゴースト登場演出
            this._showGhost();
        })
        .delay(4.0)
        .call(()=>
        {
            //ネガを戻す
            //let negaEffector:NegaEffector = this.getComponent(NegaEffector);
            //negaEffector.setDefaultWithBackGround();

            //会話シーンをはさむ
            this._showStory(canvas, callback);

        })
        .start();
    }



    private _showGhost():void
    {
        //音
        SE.play(this.seGhost);
        
        //左右に動く
        this.ghostNode.runAction(
            cc.sequence(
                cc.moveBy(1.0, cc.v2(200, 0)).easing(cc.easeInOut(2.0)),
                cc.moveBy(2.0, cc.v2(-400, 0)).easing(cc.easeInOut(2.0)),
                cc.moveBy(1.0, cc.v2(200, 0)).easing(cc.easeInOut(2.0)),
                cc.callFunc(()=>
                {
                    //callback();
                })
            )
        );

        //上下に動く
        this.ghostNode.runAction(
            cc.sequence(
                cc.moveBy(1.4, cc.v2(0, 50)).easing(cc.easeInOut(2.0)),
                cc.moveBy(1.4, cc.v2(0, -50)).easing(cc.easeInOut(2.0)),
                cc.moveBy(1.4, cc.v2(0, 50)).easing(cc.easeInOut(2.0))
            )
        );

        //出てくる
        this.ghostBody.runAction(
            cc.sequence(
                cc.fadeTo(0.7, 255),
                cc.delayTime(1.0),
                cc.fadeTo(0.5, 128),
                cc.fadeTo(0.5, 255)
            )
        );
    }


    private _showStory(canvas:cc.Canvas, callback:()=>void)
    {
        // APIからテキスト入手
        SchoolAPI.navigatorConversations(NavigatorConversations.CATEGORY_GHOST, (response:NavigatorConversations)=>
        {
            StaticData.navigatorConversations = response;

            let node:cc.Node = cc.instantiate(this.eventUnkoSenseiPrefab);
            this.node.addChild(node);
            
            let sensei:EventUnkoSensei = node.getComponent(EventUnkoSensei);
            sensei.setup(canvas, SpecialEvent.GHOST_START);
            sensei.startEventStory(StaticData.navigatorConversations.navigate[0], ()=>
            {
                PlayTrackLog.add("Opening_B_Main:ゴースト演出終了");

                callback();
            });
        });
    }

    

}
