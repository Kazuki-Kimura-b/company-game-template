import StaticData from "../StaticData";
import PlayTrackLog from "./PlayTrackLog";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BugTracking
{

    public static notify(title:string, className:string, data:any):void
    {
        data.trackLog = PlayTrackLog.getLog();  //ログを渡す
        
        if(StaticData.previewMode) return;      //プレビューモードは送信しない
        else if(StaticData.LOCAL_HOST)
        {
            if(data == null)
            {
                alert(title + " / " + className);
            }
            else if(data.msg != undefined)
            {
                alert(data.msg);
            }
            else
            {
                alert(title + " / " + className);
            }
        }
        else
        {
            //@ts-ignore
            Bugsnag.notify(new Error(title + " / " + className), (event:any)=>
            {
                event.errors[0].errorClass = title;
                event.addMetadata('data', data);
            });
        }

        cc.log(data);
        cc.error(title + "/" + className);
    }


    public static apiError(errorClass:string, url:string, xhr:XMLHttpRequest, sendData:any):void
    {
        if(StaticData.LOCAL_HOST)
        {
            alert("APIError:" + url);
        }
        else
        {
            //@ts-ignore
            Bugsnag.notify(new Error("APIError / " + url), (event:any)=>
            {
                event.errors[0].errorClass = "API:" + errorClass;
                event.addMetadata('data',
                {
                    xhr_readyState:xhr.readyState,
                    xhr_status:xhr.status,
                    sendData:sendData,
                    playLog: PlayTrackLog.getLog()
                });
            });
        }
    }



}
