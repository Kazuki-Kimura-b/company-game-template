import StaticData from "../StaticData";
import APIAccess from "./APIAccess"
import APIErrorPopup, { APIErrorType } from "./APIErrorPopup";
import BugTracking from "./BugTracking";
import { CollectionItem, ComboRanking, ConfirmatoryExamFlag, CPUData, GetGameItem, GoribenItem, NavigatorConversations, OpponentCPU, PlayerData, UseGameItem } from "./Models";
import SystemIcon from "./SystemIcon";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SchoolAPI extends APIAccess
{
    private static _DUMMY_DATA_MODE:boolean = false;
    private static _apiErrorPopupPrefab:cc.Prefab = null;
    private static _accessPrefab:cc.Prefab = null;
    private static _systemIcon:SystemIcon = null;
    private static _systemIconCounter:number = 0;

    private static readonly TIME_OUT:number = 30 * 1000;


    /**
     * 単体テスト等APIを使用しない。以後ダミーの値を返すようになる
     */
    public static dummyDataMode():void
    {
        this._DUMMY_DATA_MODE = true;
    }

    
    /**
     * エラー時のポップアップを設定
     * @param popup 
     */
    public static setAPIErrorPopup(popup:cc.Prefab):void
    {
        SchoolAPI._apiErrorPopupPrefab = popup;
    }


    /**
     * アクセス中のアイコンを設定
     * @param prefab 
     */
    public static setAccessStartPrefab(prefab:cc.Prefab):void
    {
        SchoolAPI._accessPrefab = prefab;
    }


    /**
     * 有効なトークンがあるか返す
     * @returns 
     */
    public static haveEnabledToken():boolean
    {
        let token:string = this.staticGetToken();
        if(token == null) return false;
        else if(token == "") return false;
        else if(token == undefined) return false;

        return true;
    }

    /**
     * 図版の画像を読み込む（問題、解説）
     * @param fileName 画像のファイル名（拡張子付き）
     * @param callback コールバック
     */
    public static loadZuhanImage(fileName:string, callback:(response:any)=>void):void
    {
        //let imageURL = "https://unko-seminar.s3-ap-northeast-1.amazonaws.com/school/" + fileName + ".png";
        //let imageURL:string = "https://unko-school.s3-ap-northeast-1.amazonaws.com/zuhan/" + fileName;(20200903まで)
        let url:string = "https://unko-qadb.s3-ap-northeast-1.amazonaws.com/zuhan/" + fileName;

        this.loadImage(fileName, url, callback);
    }


    /**
     * 画像を読み込む
     * @param key コールバックされるオブジェクト型に紐づけされる名前
     * @param imageURL 画像の絶対パス
     * @param callback 
     * @returns 
     */
    public static loadImage(key:string, imageURL:string, callback:(response:any)=>void):void
    {
        if(imageURL == null || imageURL == undefined || imageURL == "")
        {
            BugTracking.notify("画像URLが存在しないエラー", "SchoolAPI.loadImage()",
            {
                data:"画像URLが存在しないエラー : " + key,
                key: key,
                isNull: imageURL == null,
                isUndefined: imageURL == undefined,
                isEmpty: imageURL == ""
            });
            callback({ error:null, key:key, image:null });
            return;
        }
        
        if(imageURL == "localDummy/icon")
        {
            callback({ error:null, key:key, image:null });
            return;
        }
        
        this._startAccessIcon();        //アイコンの表示

        if(imageURL.substr(imageURL.length - 1) == "/")
        {
            BugTracking.notify("画像URL不完全エラー", "SchoolAPI.loadImage()", { msg:"画像" + key + "のURLが指定されていません", url:imageURL });
        }

        cc.assetManager.loadRemote(imageURL, (err:Error, texture:cc.Texture2D) =>
        {
            this._closeAccessIcon();        //アイコンを消す

            if(err)
            {
                //err.messageとerror.stackの内容を見てからbugsnagの対応は考える
                BugTracking.notify("画像取得エラー", imageURL, { key:key, imageURL:imageURL, error:err });
                callback({ error:err.message, key:key, image:null });
            }
            else
            {
                // 完了
                callback({ error:null, key:key, image:new cc.SpriteFrame(texture) });
            }
        });
    }

    /**
     * 接続エラー時のポップアップを表示
     * @param callback 
     */
    private static _errorPopup(apiErrorType:APIErrorType, callback:()=>void):void
    {
        let canvas:cc.Canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        let contentsNode:cc.Node = canvas.node.getChildByName("contents");

        let popupNode:cc.Node = cc.instantiate(this._apiErrorPopupPrefab);
        contentsNode.addChild(popupNode);

        let errorPopup:APIErrorPopup = popupNode.getComponent(APIErrorPopup);
        errorPopup.setup(apiErrorType, ()=>
        {
            callback();
        });
    }


    /**
     * アクセス中アイコンを表示
     */
    private static _startAccessIcon():void
    {
        if(! this._accessPrefab) return;
        
        if(SchoolAPI._systemIconCounter == 0)
        {
            let canvas:cc.Canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
            let contentsNode:cc.Node = canvas.node.getChildByName("contents");

            let iconNode:cc.Node = cc.instantiate(this._accessPrefab);
            contentsNode.addChild(iconNode);

            this._systemIcon = iconNode.getComponent(SystemIcon);
            this._systemIcon.setup(StaticData.TIME_API_ACCESS_ICON);
        }

        SchoolAPI._systemIconCounter ++;
    }

    /**
     * アクセス中アイコンを消す
     */
    private static _closeAccessIcon():void
    {
        if(! this._accessPrefab) return;
        
        SchoolAPI._systemIconCounter --;

        if(SchoolAPI._systemIconCounter == 0)
        {
            this._systemIcon.remove();
            this._systemIcon = null;
        }
    }


    /**
     *  トークンがおかしくないか確認
     */
    private static _aliveTokenCheck():void
    {
        let token:string = this.staticGetToken();
        
        if(token == "" || token == null || token == undefined)
        {
            BugTracking.notify("トークンが空エラー", "APIAccess.staticGetToken()",
            {
                isEmpty: token == "",
                isNull: token == null,
                isUndefined: token == undefined,
                token: token
            });
        }
    }



    //---------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------
    //
    //  DUMMY DATA
    //
    //---------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------

    /**
     * 企業タイアップゲーム開始用エンドポイント
     * @param callback コールバック
     * @param gameMode 各企業の名前を指定する
     * @param reference どこからのアクセスかを入れる
     */
    public static exStart(gameMode:string, reference: string, callback:(response:any)=>void):void
    {
        if (!StaticData.gameSetting.isTestMode) {
            this._aliveTokenCheck();        //トークンがあるか確認
            this._startAccessIcon();        //アイコンの表示
            
            let xhr:XMLHttpRequest = new XMLHttpRequest();
            let url:string = this.staticGetHost() + "​​/api/v1/external_study/start";

            xhr.open( 'POST', url, true );
            // POST 送信の場合は Content-Type は固定.
            xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
            xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
            xhr.timeout = SchoolAPI.TIME_OUT;

            xhr.onload = (ev:ProgressEvent<EventTarget>)=>
            {
                this._closeAccessIcon();        //アイコンを消す
                
                cc.log(xhr.status);
                
                let response = null;

                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
                {
                    let responseText:string = xhr.responseText;
                    response = JSON.parse(responseText);

                    cc.log("EX GAME START RESPONSE --------------");
                    cc.log(response);

                    cc.log("RequestToken:" + response.token);

                    if(response == null)
                    {
                        //エラーポップアップを表示し、リロードしてもらう
                        this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                    }
                    else
                    {
                        //問題なし
                        callback(response);
                    }
                }
                else
                {
                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
            };
            xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
            {
                this._closeAccessIcon();        //アイコンを消す
                
                //再接続
                this._errorPopup(APIErrorType.OFFLINE, ()=>
                {
                    this.exStart(gameMode, reference, callback);
                });
                //console.error(xhr.statusText);
            };
            // xhr.send('mode=' + gameMode);
            xhr.send(`mode=${gameMode}&rf=${reference}`);
        } else {
            // テストモード
            let response: any = {
                script_start1: "まけないよ〜！",
                script_start2: "いくで〜！！！！",
                script_start3: "よっしゃ、やるで〜！",
                script_twenty_sec: "まだ20{秒,びょう}もあるよ！",
                script_ten_sec: "あと10{秒,びょう}！",
                script_five_sec: "あと5{秒,びょう}！",
                script_end1: "FINISH!!",
                script_end2: "ぜんぜんダメだった。",
                script_end3: "しゅ〜りょ〜！",
                token: null
            }
            callback(response);
        }
    }

    /**
     * 企業タイアップ回答登録用エンドポイント
     * @param callback コールバック
     * @param gameMode 各企業の名前を指定する
     * @param reference どこからのアクセスかを入れる
     */
     public static exResult(answers:{question_id:string, answer:string, correct_answer: string, required_time:number, hint:boolean}[], requestToken: string, callback:(response:any)=>void):void
     {
        if (!StaticData.gameSetting.isTestMode) {
            this._aliveTokenCheck();        //トークンがあるか確認
            this._startAccessIcon();        //アイコンの表示
            
            let xhr:XMLHttpRequest = new XMLHttpRequest();
            let url:string = this.staticGetHost() + "​​/api/v1/external_study/question";
    
            xhr.open( 'POST', url, true );
            // POST 送信の場合は Content-Type は固定.
            xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
            xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
            xhr.timeout = SchoolAPI.TIME_OUT;
    
            xhr.onload = (ev:ProgressEvent<EventTarget>)=>
            {
                this._closeAccessIcon();        //アイコンを消す
                
                cc.log(xhr.status);
                
                let response = null;
    
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
                {
                    let responseText:string = xhr.responseText;
                    response = JSON.parse(responseText);
    
                    cc.log("EX RESULT REGISTER --------------");
                    cc.log(response);
    
                    cc.log("RequestToken:" + response.token);
    
                    if(response == null)
                    {
                        //エラーポップアップを表示し、リロードしてもらう
                        this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                    }
                    else
                    {
                        //問題なし
                        callback(response);
                    }
                }
                else
                {
                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
            };
            xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
            {
                this._closeAccessIcon();        //アイコンを消す
                
                //再接続
                this._errorPopup(APIErrorType.OFFLINE, ()=>
                {
                    this.exResult(answers, requestToken, callback);
                });
                //console.error(xhr.statusText);
            };
            let json =
            {
                token: requestToken,
                answers: answers
            }
            xhr.send(JSON.stringify(json));
        } else {
            callback("exResult: test mode");
        }
     }
    
    /**
     * 企業タイアップゲーム終了用エンドポイント
     * @param callback コールバック
     * @param gameMode 各企業の名前を指定する
     * @param reference どこからのアクセスかを入れる
     */
     public static exEnd(requestToken: string, callback:(response:any)=>void):void
     {
        if (!StaticData.gameSetting.isTestMode) {
            this._aliveTokenCheck();        //トークンがあるか確認
            this._startAccessIcon();        //アイコンの表示
            
            let xhr:XMLHttpRequest = new XMLHttpRequest();
            let url:string = this.staticGetHost() + "​​/api/v1/external_study/end";
    
            xhr.open( 'POST', url, true );
            // POST 送信の場合は Content-Type は固定.
            xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
            xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
            xhr.timeout = SchoolAPI.TIME_OUT;
    
            xhr.onload = (ev:ProgressEvent<EventTarget>)=>
            {
                this._closeAccessIcon();        //アイコンを消す
                
                cc.log(xhr.status);
                
                let response = null;
    
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
                {
                    let responseText:string = xhr.responseText;
                    response = JSON.parse(responseText);

                    cc.log("EX RESULT REGISTER --------------");
                    cc.log(response);

                    cc.log("RequestToken:" + response.token);

                    if(response == null)
                    {
                        //エラーポップアップを表示し、リロードしてもらう
                        this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                    }
                    else
                    {
                        //問題なし
                        callback(response);
                    }
                }
                else
                {
                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
            };
            xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
            {
                this._closeAccessIcon();        //アイコンを消す
                
                //再接続
                this._errorPopup(APIErrorType.OFFLINE, ()=>
                {
                    this.exEnd(requestToken, callback);
                });
                //console.error(xhr.statusText);
            };
            xhr.send(`token=${requestToken}`);
        } else {
            callback("exEnd: test mode")
        }
     }

    public static importGameSettings(callback:()=>void): void {
        //  jsonの読み込み
        if (StaticData.gameSetting.isTestMode) {
            let query: string = window.location.search.replace("?", "");
            let settings: string[] = query.split("&");
            for (let item of settings) {
                let tmp: string[] = item.split("=");
                switch (tmp[0]) {
                    case "question":
                        StaticData.gameSetting.specificQuestionNum = Number(tmp[1]);
                        break;
                    case "random":
                        StaticData.gameSetting.isRandomQuestion = true;
                        break;
                    case "result":
                        StaticData.gameSetting.specificResultNum = Number(tmp[1]);
                        break;
                }
                cc.log(tmp);
            }
            cc.log(StaticData.gameSetting);
        } else {
            let query: string = window.location.search.replace("?", "");
            let tmp: string[] = query.split("=");
            if (tmp[0] === "rf") {
                StaticData.gameSetting.reference = tmp[1];
            }
        }
        cc.loader.loadRes("json/opponent", (err, res) => {
            if (err) {
                cc.log("opponentを読み込めませんでした");
                return;
            }
            StaticData.opponentData = res.json;
            callback();
        })
    }
}
