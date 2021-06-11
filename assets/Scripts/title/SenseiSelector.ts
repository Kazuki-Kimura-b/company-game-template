import SchoolAPI from "../common/SchoolAPI";
import EventUnkoSensei from "../opening/EventUnkoSensei";
import StaticData, { SpecialEvent } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SenseiSelector extends cc.Component
{

    @property(cc.Prefab) eventUnkoSenseiPrefab: cc.Prefab = null;

    private _canvas:cc.Canvas = null;



    public setup(canvas:cc.Canvas):void
    {
        this._canvas = canvas;
    }


    public onPressGhostButtons(event:any, code:string):void
    {
        //code.... firstStart / firstWin / firstLose / start / win / lose
        let specialEvent:SpecialEvent = (code == "firstStart" || code == "start") ? SpecialEvent.GHOST_START : SpecialEvent.GHOST_END;
        
        StaticData.ghostDate = "１２月３４日";
        if (code == "firstWin" || code == "win") StaticData.ghostWin = true;
        else if (code == "firstLose" || code == "lose") StaticData.ghostWin = false;

        let condition_value:string = (code == "firstStart" || code == "firstWin" || code == "firstLose") ? "0" : "1";

        SchoolAPI.navigatorConversationsPreviews("もく勉ゴースト", (response:any)=>
        {
            let script:string = "<i>" + code + "のストーリーです</i>";
            
            for(let i:number = 0 ; i < response.length ; i ++)
            {
                let data:{ condition_value:string, timing:string, content:string } = response[i];
                
                if(data.condition_value != condition_value) continue;
                
                if(data.timing == "ゲームスタート" && specialEvent == SpecialEvent.GHOST_START)
                {
                    script = data.content;
                    break;
                }
                else if(data.timing == "ゲーム結果(勝ち)" && specialEvent == SpecialEvent.GHOST_END && StaticData.ghostWin)
                {
                    script = data.content;
                    break;
                }
                else if(data.timing == "ゲーム結果(負け)" && specialEvent == SpecialEvent.GHOST_END && ! StaticData.ghostWin)
                {
                    script = data.content;
                    break;
                }
            }
            this._showStory(script, specialEvent);
        });
    }


    private _showStory(script:string, specialEvent:SpecialEvent):void
    {
        let node:cc.Node = cc.instantiate(this.eventUnkoSenseiPrefab);
        this.node.addChild(node);

        let sensei:EventUnkoSensei = node.getComponent(EventUnkoSensei);
        sensei.setup(this._canvas, specialEvent);
        sensei.startEventStory(script, ()=>
        {
            cc.tween(node)
            .delay(0.3)
            .removeSelf()
            .start();
        });
    }


    public onCloseButton(event:any):void
    {
        this.node.removeFromParent(true);
    }


}
