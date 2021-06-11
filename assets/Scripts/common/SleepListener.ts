const {ccclass, property} = cc._decorator;

@ccclass
export default class SleepListener extends cc.Component {


    private static _isSetup:boolean = false;
    private static _hidden:string = "";
    private static _visibilityChange:string = "";
    private static _resumeCallback:()=>void = null;
    private static _sleepedTime:number = -1;

    // -1に設定すると常にタイムアウト扱いになる
    private static readonly _TIME_OUT:number = 90;      //90秒でタイムアウト

    

    /**
     * 初期化　起動時に一度実行すればアプリを閉じるまで有効
     */
    public setup():void
    {
        if(SleepListener._isSetup)
        {
            return;
        }
        SleepListener._isSetup = true;

        // hidden プロパティおよび可視性の変更イベントの名前を設定
        if (typeof document.hidden !== "undefined") { // Opera 12.10 や Firefox 18 以降でサポート 
            SleepListener._hidden = "hidden";
            SleepListener._visibilityChange = "visibilitychange";
        } else if (typeof document["msHidden"] !== "undefined") {
            SleepListener._hidden = "msHidden";
            SleepListener._visibilityChange = "msvisibilitychange";
        } else if (typeof document["webkitHidden"] !== "undefined") {
            SleepListener._hidden = "webkitHidden";
            SleepListener._visibilityChange = "webkitvisibilitychange";
        }
        
        //var backGroundListenerElement = document.getElementById("backGroundListenerElement");
        let backGroundListenerElement:HTMLElement = document.createElement("backGroundListenerElementTS");


        // ブラウザーが addEventListener または Page Visibility API をサポートしない場合に警告
        if (typeof document.addEventListener === "undefined" || SleepListener._hidden === undefined) {
            console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
        } else {
            // Page Visibility の変更を扱う  
            document.addEventListener(SleepListener._visibilityChange, ()=>
            {
                if (document[SleepListener._hidden])
                {        
                    cc.log("Sleeped date: " + SleepListener._getDataString());
                    
                    SleepListener._sleepedTime = SleepListener._getDataNum();
                    cc.log("Sleep:" + SleepListener._sleepedTime);
                }
                else
                {
                    cc.log("onResume from" + SleepListener._sleepedTime);

                    if(SleepListener._resumeCallback != null)
                    {
                        let nowTime:number = SleepListener._getDataNum();
                        let sleepTime:number = nowTime - SleepListener._sleepedTime;        //離席時間（秒）

                        cc.log("離席時間:" + sleepTime);
                        if(sleepTime >= SleepListener._TIME_OUT)
                        {
                            //一定時間スリープしていた場合コールバックする
                            SleepListener._resumeCallback();
                        }
                        else
                        {
                            cc.log("Safe time");
                        }
                    }
                }
            }
            , false);
        }
    }


    /**
     * 復帰時のコールバックを登録
     * @param callback コールバック
     */
    public onResume(callback:()=>void):void
    {
        SleepListener._resumeCallback = callback;
    }



    /**
     * 復帰時のコールバックを解除
     */
    public deleteResume():void
    {
        SleepListener._resumeCallback = null;
    }



    /**
     * 日付を数値で取得
     */
    private static _getDataNum():number
    {
        let date:Date = new Date();
        return (date.getFullYear() % 100) * 10000000000 + (date.getMonth() + 1) * 100000000 + date.getDate() * 1000000 + date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds();
    }


    /**
     * 日付を取得（デバッグ用）
     */
    private static _getDataString():string
    {
        let date:Date = new Date();
        let str:string = date.getFullYear()
        + '/' + ('0' + (date.getMonth() + 1)).slice(-2)
        + '/' + ('0' + date.getDate()).slice(-2)
        + ' ' + ('0' + date.getHours()).slice(-2)
        + ':' + ('0' + date.getMinutes()).slice(-2)
        + ':' + ('0' + date.getSeconds()).slice(-2);

        return str;
    }


}
