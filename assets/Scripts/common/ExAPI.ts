import AllKaitou from "../game/AllKaitou";
import StaticData from "../StaticData";
import APIAccess from "./APIAccess"
import APIErrorPopup, { APIErrorType } from "./APIErrorPopup";
import BugTracking from "./BugTracking";
import { CollectionItem, ComboRanking, ConfirmatoryExamFlag, CPUData, GetGameItem, GoribenItem, NavigatorConversations, OpponentCPU, PlayerData, SchoolEnd, UseGameItem } from "./Models";
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
     * コレクション用API
     * @param callback 
     */
    public static collection(callback: (response: any) => void): void
    {
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        let url: string = this.staticGetHost() + "​​/api/v1/user_child_collection_cards";

        cc.log("Collection API:" + url);

        xhr.open('GET', url + "?genre=偉人", true);
        xhr.setRequestHeader('TOKEN', this.staticGetToken());
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response = null;

            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let responseText: string = xhr.responseText;
                response = JSON.parse(responseText);

                cc.log("GET COLLECTION RESPONSE ------------");
                cc.log(response);

                if (response == null) {
                    cc.log("GET COLLECTION ERROR");
                    BugTracking.apiError("コレクション取得エラー(B)", url, xhr, {});

                    //ユーザーには失敗のポップアップだけを出す
                    this._errorPopup(APIErrorType.WARNING, ()=>{ responseText:responseText });
                }
                else
                {
                    callback(response);
                }
                
            }
            else
            {
                BugTracking.apiError("コレクション取得エラー", url, xhr, {});

                //ユーザーには失敗のポップアップだけを出す
                this._errorPopup(APIErrorType.WARNING, ()=>{});
            }
        };
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.collection(callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }


    
    /**
     * 子供マイページ用API
     * @param callback 
     */
    public static childMyPage(callback:(response:any)=>void):void
    {
        if(this._DUMMY_DATA_MODE)
        {
            this._dummyChildMyPage(callback);
            return;
        }
        
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/user_child_my_page";

        cc.log("My Page API:" + url);

        xhr.open("GET", url + "?token=" + this.staticGetToken(), true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				response = JSON.parse(responseText);

				cc.log("GET MY PAGE RESPONSE ------------");
				cc.log(response);

				if (response == null)
				{
					cc.log("GET MY PAGE ERROR");
                    BugTracking.apiError("子供マイページ用エラー(B)", url, xhr, { responseText:responseText });

                    //ユーザーには失敗のポップアップだけを出す
                    this._errorPopup(APIErrorType.WARNING, ()=>{});
                }
                else
                {
                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("子供マイページ用エラー", url, xhr, {});

                //ユーザーには失敗のポップアップだけを出す
                this._errorPopup(APIErrorType.WARNING, ()=>{});
            }
        };
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.childMyPage(callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }

    
    /**
     * ステータス用API
     * @param callback 
     */
    public static childStatus(callback:(response:any)=>void):void
    {
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/user_child_status_page";

        cc.log("Status API:" + url);

        xhr.open("GET", url + "?token=" + this.staticGetToken(), true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				response = JSON.parse(responseText);

				cc.log("GET STATUS RESPONSE ------------");
				cc.log(response);

				if (response == null)
				{
					cc.log("GET STATUS ERROR");
                    BugTracking.apiError("子供ステータス用エラー(B)", url, xhr, { responseText:responseText });

                    //ユーザーには失敗のポップアップだけを出す
                    this._errorPopup(APIErrorType.WARNING, ()=>{});
                }
                else
                {
                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("子供ステータス用エラー", url, xhr, {});

                //ユーザーには失敗のポップアップだけを出す
                this._errorPopup(APIErrorType.WARNING, ()=>{});
            }
        };
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.childStatus(callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }




    /**
     * ゲームタイトル用API
     * @param callback 
     */
    public static titlePage(callback:(response:PlayerData)=>void)
    {
        if(this._DUMMY_DATA_MODE)
        {
            this._dummyTitlePage(callback);
            return;
        }

        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/title_page";

        cc.log("Title Page API:" + url);

        xhr.open("GET", url + "?token=" + this.staticGetToken(), true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response:PlayerData = null;

            cc.log(xhr.readyState);
            cc.log(xhr.status);
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				let json:any = JSON.parse(responseText);

				cc.log("GET TITLE PAGE RESPONSE ------------");
				cc.log(json);

				if (json == null)
				{
					cc.log("GET TITLE PAGE ERROR");
                    BugTracking.apiError("ゲームタイトル用エラー(B)", url, xhr, { responseText:responseText });

                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
                else
                {
                    //Object.assign()でjsonからクラスに入れられるけど、入れ子のクラスまで対応してないのと、
                    //クラスにプロパティが存在しなくてもエラーにならずに新しくプロパティが作られるため
                    //あまりメリットが無いので今回はコンストラクタで直接代入することにした
                    response = new PlayerData(json.bgm, json.bgm_enabled, json.challenging_times, json.coin, json.daily_challenging_times, json.icon, json.level, json.next_level_progress, json.nickname, json.score_magnification, json.se_enabled);

                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("ゲームタイトル用エラー", url, xhr, {});

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
                this.titlePage(callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }



    
    /**
     * うんこゼミの設定をゲームから変更する
     * @param nickname 
     * @param bgm_enabled 
     * @param school_bgm 
     * @param se_enabled 
     * @param callback 
     */
    public static school_settings(nickname:string, bgm_enabled:boolean, school_bgm:string, se_enabled:boolean, callback:(status:boolean)=>void):void
    {
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetUnkoGakuenHost() + "/api/v2/school/school_settings";
        
        xhr.open( 'PUT', url, true );
        // POST 送信の場合は Content-Type は固定.
        xhr.setRequestHeader( 'Content-Type', 'application/json' );
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            cc.log(xhr.status);
            cc.log(xhr);
            
            let response:boolean = false;

			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
                let json:any = JSON.parse(responseText);
                
                cc.log("PUT SCHOOL SETTING RESPONSE --------------");
                cc.log(json);

                if(json == null)
                {
                    cc.log("PUT SCHOOL SETTING ERROR --------------");

                    BugTracking.apiError("うんこゼミ設定変更エラー(B)", url, xhr,
                    {
                        responseText:responseText,
                        nickname:nickname,
                        bgm_enabled:bgm_enabled,
                        school_bgm:school_bgm,
                        se_enabled:se_enabled
                    });

                    //ユーザーには失敗のポップアップだけを出す
                    this._errorPopup(APIErrorType.WARNING, ()=>{});
                }
                else
                {
                    response = (json.status == "ok");
                }   
            }
            else
            {
                BugTracking.apiError("うんこゼミ設定変更エラー", url, xhr,
                {
                    nickname:nickname,
                    bgm_enabled:bgm_enabled,
                    school_bgm:school_bgm,
                    se_enabled:se_enabled
                });

                //ユーザーには失敗のポップアップだけを出す
                this._errorPopup(APIErrorType.WARNING, ()=>{});
            }
            //ゲームの進行に影響がないので失敗してもコールバックはする
            callback(response);
        };
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す

            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.school_settings(nickname, bgm_enabled, school_bgm, se_enabled, callback);
            });
        };
        
        let json =
		{
            nickname: nickname,
            school_bgm_enabled: bgm_enabled,
            school_bgm: school_bgm,
            school_se_enabled: se_enabled
		}

		xhr.send(JSON.stringify(json));
    }



    /**
     * 所持コイン数を100にする
     * @param callback 
     */
    public static user_children_set_one_hundred_coins(callback:(response:boolean)=>void):void
    {
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetUnkoGakuenHost() + "/api/v2/school/user_children_set_one_hundred_coins";
        
        xhr.open( 'PUT', url, true );
        // POST 送信の場合は Content-Type は固定.
        xhr.setRequestHeader( 'Content-Type', 'application/json' );
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            cc.log(xhr.status);
            cc.log(xhr);
            
            let response:boolean = false;

			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
                let json:any = JSON.parse(responseText);
                
                cc.log("PUT SCHOOL 100 COINS --------------");
                cc.log(json);

                if(json == null)
                {
                    cc.log("PUT SCHOOL 100 COINS ERROR --------------");
                }
                else if(json.coin == null)
                {
                    cc.log("PUT SCHOOL 100 COINS ERROR --------------");
                }
                else
                {
                    response = (json.coin == 100);
                }

                if(response)
                {
                    callback(response);
                }
                else
                {
                    BugTracking.apiError("所持コイン100エラー(B)", url, xhr, { responseText:responseText });

                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
            }
            else
            {
                BugTracking.apiError("所持コイン100エラー", url, xhr, {});

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
                this.user_children_set_one_hundred_coins(callback);
            });
        };
        xhr.send();
    }


    /**
     * 確認テスト実施フラグ取得
     */
    public static confirmatoryExamFlag(callback:(response:ConfirmatoryExamFlag)=>void):void
    {
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "/api/v1/confirmatory_exam_flag";

        cc.log("Kakunin Test Flag API: " + url);
        cc.log("TOKEN:" + this.staticGetToken());

        xhr.open("GET", url, true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response:ConfirmatoryExamFlag = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				let json = JSON.parse(responseText);

				cc.log("GET KAKUNIN TEST FLAG RESPONSE ------------");
				cc.log(json);

				if (json == null)
				{
					cc.log("GET KAKUNIN TEST FLAG ERROR");
                    BugTracking.apiError("確認テスト実施フラグエラー", url, xhr, { responseText:responseText });
                }
                else
                {
                    response = new ConfirmatoryExamFlag(json.final_exam_mode_flag, json.midterm_exam_mode_flag);
                }
            }
            else
            {
                BugTracking.apiError("ゴースト出現フラグエラー", url, xhr, {});
            }

            //ゲームの進行に影響がないため、APIに失敗してもポップアップを出さずにコールバックする
			callback(response);
        };
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.confirmatoryExamFlag(callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }


    /**
     * 偉人一覧を返す(デバッグ機能のためポップアップなどの処理は省く)
     * @param callback 
     */
    public static ijins(callback:(rensponse:{id:number, short_name:string}[])=>void):void
    {
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/ijins";

        cc.log("Ijins API:" + url);

        xhr.open("GET", url + "?token=" + this.staticGetToken(), true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            let response:{id:number, short_name:string}[] = null;

            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				let json:any = JSON.parse(responseText);

				cc.log("GET IJINS RESPONSE ------------");
				cc.log(json);

				if (json == null)
				{
					cc.log("GET IJINS ERROR");
                    BugTracking.apiError("偉人一覧取得エラー(B)", url, xhr, { responseText:responseText });
                    alert("偉人一覧取得エラー(B)");
                }
                else
                {
                    response = [];
                    for(let i:number = 0 ; i < json.length ; i ++)
                    {
                        response.push({ id:json[i].id, short_name:json[i].short_name });
                    }
                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("偉人一覧取得エラー", url, xhr, {});
                alert("偉人一覧取得エラー");
            }
        };
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.ijins(callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }


    /**
     * 指定した偉人idから偉人の情報を取得(デバッグ機能のためポップアップなどの処理は省く)
     * @param id 
     * @param callback 
     */
    public static ijinFromID(id:number, callback:(rensponse:CPUData)=>void):void
    {
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        // ID付きURL
        let url:string = this.staticGetHost() + "​​/api/v1/ijins/" + id;

        cc.log("IJIN FROM ID API:" + url);

        xhr.open("GET", url + "?token=" + this.staticGetToken() + "&id=" + id, true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            let response:CPUData = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				let json:any = JSON.parse(responseText);

				cc.log("GET IJIN FROM ID RESPONSE ------------");
				cc.log(json);

				if (json == null)
				{
					cc.log("GET IJIN FROM ID ERROR");
                    BugTracking.apiError("偉人ID指定取得エラー(B)", url, xhr, { id:id, responseText:responseText });
                    alert("偉人ID指定取得エラー(B)(ID:" + id + ")");
                }
                else
                {
                    response = new CPUData(
                        json.short_name, json.target_score, json.appearance_script, json.win_script, json.lose_script, json.unko_get_script, json.play_script, json.correct_script1, json.correct_script2, json.correct_script3, json.incorrect_script1, json.incorrect_script2, json.incorrect_script3,
                        json.icon_image_url, json.ijin_image_url, json.ijin_unko_image_url, json.thumbnail_image_url, json.vertical_background_image_url, json.horizontal_background_image_url
                    );
                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("偉人ID指定取得エラー", url, xhr, { id:id });
                alert("偉人ID指定取得エラー(ID:" + id + ")");
            }
        };
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.ijinFromID(id, callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }



    /**
     * 対戦相手の偉人データを取得
     */
    public static opponentCPUs(callback:(response:OpponentCPU)=>void):void
    {
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/opponent_cpus";

        cc.log("Opponent CPUs API: " + url);
        cc.log("子供アカウントのToken:" + this.staticGetToken());

        xhr.open("GET", url, true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response:OpponentCPU = null;

            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				let json:any = JSON.parse(responseText);

				cc.log("GET OPPONENT CPUS RESPONSE ------------");
				cc.log(json);

				if (json == null)
				{
					cc.log("GET OPPONENT CPUS ERROR");

                    BugTracking.apiError("ゴリベン用偉人取得エラー(B)", url, xhr, { responseText:responseText });

                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
                else
                {
                    response = new OpponentCPU(json.continual_combo, json.cpu_data, json.progress_words,json.try_num_to_level_up);
                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("ゴリベン用偉人取得エラー", url, xhr, {});

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
                this.opponentCPUs(callback);
            });
        };
        xhr.send();
    }



    /**
     * 連続コンボランキング取得
     * @param callback 
     */
    public static continualComboRankings(callback:(response:ComboRanking[])=>void):void
    {
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/continual_combo_rankings";

        cc.log("Continual Combo Rankings: " + url);
        cc.log("TOKEN:" + this.staticGetToken());

        xhr.open("GET", url, true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response:ComboRanking[] = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
                let json:any = JSON.parse(responseText);

				cc.log("GET CONTINUAL COMBO RANKINGS RESPONSE ------------");
				cc.log(json);

				if (json == null)
				{
					cc.log("GET CONTINUAL COMBO RANKINGS");
                    BugTracking.apiError("連続コンボランキングエラー(B)", url, xhr, { responseText:responseText });

                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
                else
                {
                    response = [];
                    for(let i:number = 0 ; i < json.length ; i ++)
                    {
                        response.push(new ComboRanking(json[i].combo, json[i].max_combo, json[i].id, json[i].nickname, json[i].icon_path));
                    }
                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("連続コンボランキングエラー", url, xhr, {});

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
                this.continualComboRankings(callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }



    /**
     * ゴースト出現フラグ取得
     * @param callback 
     */
    public static ghostModeFlag(callback:(response:any)=>void):void
    {

        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/ghost_mode_flag";

        cc.log("Ghost Mode Flag API: " + url);
        cc.log("TOKEN:" + this.staticGetToken());

        xhr.open("GET", url, true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				response = JSON.parse(responseText);

				cc.log("GET GHOST MODE FLAG RESPONSE ------------");
				cc.log(response);

				if (response == null)
				{
					cc.log("GET GHOST MODE FLAG ERROR");
                    BugTracking.apiError("ゴースト出現フラグエラー(B)", url, xhr, { responseText:responseText });
                }
            }
            else
            {
                BugTracking.apiError("ゴースト出現フラグエラー", url, xhr, {});
            }

            //ゲームの進行に影響がないため、APIに失敗してもポップアップを出さずにコールバックする
			callback(response);
        };
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.ghostModeFlag(callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }



    /**
     * ゲームアイテム一覧取得
     */
    public static getGameItems(callback:(response:GetGameItem)=>void):void
    {
        if(this._DUMMY_DATA_MODE)
        {
            this._dummyGetGameItems(callback);
            return;
        }

        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/game_items";

        cc.log("Get Items API: " + url);
        cc.log("TOKEN:" + this.staticGetToken());

        xhr.open("GET", url + "?mode=gorigori", true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response:GetGameItem = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				let json:any = JSON.parse(responseText);

				cc.log("GET GAME ITEM RESPONSE ------------");
				cc.log(json);

				if (json == null)
				{
					cc.log("GET GAME ITEM ERROR");
                    BugTracking.apiError("ゲームアイテム一覧エラー(B)", url, xhr, { responseText:responseText });

                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
                else
                {
                    let items:GoribenItem[] = [];
                    for(let i:number = 0 ; i < json.items.length ; i ++)
                    {
                        items.push(new GoribenItem(json.items[i].id, json.items[i].name, json.items[i].coin));
                    }
                    response = new GetGameItem(json.coin, items);

                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("ゲームアイテム一覧エラー", url, xhr, {});

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
                this.getGameItems(callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }



    /**
     * ゲームアイテム購入用API
     * @param items 
     * @param requestToken
     * @param callback 
     */
    public static useGameItems(items:{id:number}[], requestToken:string, callback:(response:UseGameItem)=>void):void
    {
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示

        if(requestToken == "" || requestToken == null || requestToken == undefined)
        {
            BugTracking.notify("問題リクエストトークンが無いエラー", "SchoolAPI.useGameItems()",
            {
                msg: "問題リクエストトークンが無いエラー/SchoolAPI.useGameItems()",
                requestToken: requestToken
            });
        }
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/use_game_items";
        
        cc.log("Use Items API: " + url);
        cc.log("子供アカウントのToken:" + this.staticGetToken());
        cc.log("送信するデータ:");
        cc.log(items);

        xhr.open( 'POST', url, true );
        // POST 送信の場合は Content-Type は固定.
        xhr.setRequestHeader( 'Content-Type', 'application/json' );
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            cc.log(xhr.status);
            cc.log(xhr);
            
            let response:UseGameItem = null;

			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
                let json:any = JSON.parse(responseText);
                
                cc.log("POST USE GAME ITEM RESPONSE --------------");
                cc.log(json);

                if(json == null)
                {
                    cc.log("POST USE GAME ITEM ERROR --------------");
                    BugTracking.apiError("ゲームアイテム購入エラー(B)", url, xhr, { items:items, requestToken:requestToken, responseText:responseText });

                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
                else
                {
                    response = new UseGameItem(json.coin, json.items);
                    callback(response);
                }   
            }
            else
            {
                BugTracking.apiError("ゲームアイテム購入エラー", url, xhr, { items:items, requestToken:requestToken });

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
                this.useGameItems(items, requestToken, callback);
            });
            //console.error(xhr.statusText);
        };
        
        let json =
		{
            token: requestToken,
			items: items
		}

		xhr.send(JSON.stringify(json));
    }



    /**
     * ゲーム開始用エンドポイント
     * @param callback コールバック
     * @param gameMode モード「開発」「習得」「もく勉ゴースト」「もく勉さきどり」「ごり勉」のいずれか
     */
    public static schoolStart(gameMode:string, callback:(response:any)=>void):void
    {
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/study/start";
        
        cc.log("Game Start API: " + url);
        cc.log("子供アカウントのToken:" + this.staticGetToken());
        cc.log("ゲームモード:" + gameMode);

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

				cc.log("GAME START RESPONSE --------------");
                cc.log(response);

                cc.log("RequestToken:" + response.token);

                if(response == null)
                {
                    BugTracking.apiError("ゲーム開始エラー(B)", url, xhr, { gameMode:gameMode, responseText:responseText });

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
                BugTracking.apiError("ゲーム開始エラー", url, xhr, { gameMode:gameMode });

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
                this.schoolStart(gameMode, callback);
            });
            //console.error(xhr.statusText);
        };
		xhr.send('mode=' + gameMode);
    }



    /**
     * 問題取得用エンドポイント
     * @param callback コールバック
     */
    public static getSchoolQuestion(requestToken:string, callback:(response:any)=>void):void
    {
        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示

        if(requestToken == "" || requestToken == null || requestToken == undefined)
        {
            BugTracking.notify("問題リクエストトークンが無いエラー", "SchoolAPI.getSchoolQuestion()",
            {
                msg: "問題リクエストトークンが無いエラー/SchoolAPI.getSchoolQuestion()",
                requestToken: requestToken
            });
        }
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/study/question";

        cc.log("Get Question API: " + url);
        cc.log("REQUEST TOKEN:" + requestToken);

        //　！！何故かこう書くと404エラー出る！注意！！
        //url += "?​​token=" + this._requestToken;
        //cc.log("Open URL:" + url);
        //xhr.open( "GET", url, false );

        xhr.open("GET", url + "?token=" + requestToken, true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				response = JSON.parse(responseText);

				cc.log("GET QUESTION RESPONSE ------------");
				cc.log(response);

				if (response == null)
				{
					cc.log("GET QUESTION ERROR");
                    BugTracking.apiError("問題取得エラー(B)", url, xhr, { requestToken:requestToken, responseText:responseText });

                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
                else
                {
                    //問題データ取得完了
                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("問題取得エラー", url, xhr, { requestToken:requestToken });

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
                this.getSchoolQuestion(requestToken, callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }



    /**
     * 回答登録用エンドポイント
     */
    public static postSchoolQuestion(answers:{question_id:string, answer:string, required_time:number, hint:boolean}[], requestToken:string, callback:(response:any)=>void):void
    {
        if(this._DUMMY_DATA_MODE)
        {
            callback({});
            return;
        }

        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示

        if(requestToken == "" || requestToken == null || requestToken == undefined)
        {
            BugTracking.notify("問題リクエストトークンが無いエラー", "SchoolAPI.postSchoolQuestion()",
            {
                msg: "問題リクエストトークンが無いエラー/SchoolAPI.postSchoolQuestion()",
                requestToken: requestToken
            });
        }
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/study/question";
        
        cc.log("Guestion API: " + url);
        cc.log("子供アカウントのToken:" + this.staticGetToken());
        cc.log("送信するデータ:" + answers);

        xhr.open( 'POST', url, true );
        // POST 送信の場合は Content-Type は固定.
        xhr.setRequestHeader( 'Content-Type', 'application/json' );
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            cc.log(xhr.status);
            cc.log(xhr);
            
            let response:any = null;

			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
                response = JSON.parse(responseText);

				cc.log("POST ANSWER RESPONSE --------------");
                cc.log(response);

                if(response == null)
                {
                    BugTracking.apiError("回答登録エラー(B)", url, xhr, { answers:answers, requestToken:requestToken, responseText:responseText });
                
                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
                else
                {
                    //完了
                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("回答登録エラー", url, xhr, { answers:answers, requestToken:requestToken });

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
                this.postSchoolQuestion(answers, requestToken, callback);
            });
            //console.error(xhr.statusText);
        };

        let json =
		{
			token: requestToken,
			answers: answers
		}

		xhr.send(JSON.stringify(json));
    }



    /**
     * ゲーム終了用エンドポイント
     */
    public static schoolEnd(mainCpuScore:number, requestToken:string, callback:(response:SchoolEnd)=>void)
    {
        if(this._DUMMY_DATA_MODE)
        {
            this._dummySchoolEnd(callback);
            return;
        }

        this._aliveTokenCheck();        //トークンがあるか確認
        this._startAccessIcon();        //アイコンの表示

        if(requestToken == "" || requestToken == null || requestToken == undefined)
        {
            BugTracking.notify("問題リクエストトークンが無いエラー", "SchoolAPI.schoolEnd()",
            {
                msg: "問題リクエストトークンが無いエラー/SchoolAPI.schoolEnd()",
                requestToken: requestToken
            });
        }
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
		let url:string = this.staticGetHost() + "/api/v1/study/end";
        xhr.open( 'POST', url, true );
        // POST 送信の場合は Content-Type は固定.
        xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            cc.log(xhr.status);
            let response:SchoolEnd = null;

			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
                let json:any = JSON.parse(responseText);
                cc.log(json);

                if(json == null)
                {
                    cc.log("GAME END RESPONSE ---------------");
                    BugTracking.apiError("ゲーム終了エラー(B)", url, xhr, { mainCpuScore:mainCpuScore, requestToken:requestToken, responseText:responseText });

                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_RETRY, ()=>
                    {
                        this.schoolEnd(mainCpuScore, requestToken, callback);
                    });
                }
                else
                {
                    let cItem:any = json.collections;
                    let collections:CollectionItem = null;

                    if(cItem != null)
                    {
                        collections = new CollectionItem(cItem.subgenre, cItem.name, cItem.description, cItem.unko_url, cItem.position, cItem.trigger);
                    }
                    response = new SchoolEnd(json.accuracy_num, json.scoring_total, json.max_scoring_total, json.accuracy_score, json.answers, json.time_score, json.hint_score, json.combo_score, json.time_total, json.coin, json.total_coin, json.experience_point, json.level_up, json.old_level, json.current_level, json.next_level_progress, json.next_level_before_progress, json.high_score, json.score_magnification, json.experience_point_magnification, json.continual_combo, json.acquired_newest_ijin_unko_file_url, json.ghost_date, collections);
                    
                    if(response.answers.length != 10)
                    {
                        BugTracking.apiError("サーバからの回答結果が10問でない", url, xhr, { api_answers:response.answers });
                        
                        //エラーポップアップを表示し、終了
                        this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                        return;
                    }
                    
                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("ゲーム終了エラー", url, xhr, { mainCpuScore:mainCpuScore, requestToken:requestToken });

                //エラーポップアップを表示し、通信ボタンで再度アクセスしてもらう
                this._errorPopup(APIErrorType.FAILED_RETRY, ()=>
                {
                    this.schoolEnd(mainCpuScore, requestToken, callback);
                });
            }
        };
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.schoolEnd(mainCpuScore, requestToken, callback);
            });
            //console.error(xhr.statusText);
        };
		xhr.send('token=' + requestToken + '&main_cpu_score=' + mainCpuScore);
    }




    /**
     * 確認テストのセリフ取得用
     * @param category 中間テストか期末テストか
     * @param callback 
     */
    public static navigatorConversations(category:string, callback:(response:NavigatorConversations)=>void):void
    {
        if(this._DUMMY_DATA_MODE)
        {
            this._dummyConfirmatoryExamScripts(category, callback);
            return;
        }

        this._startAccessIcon();        //アイコンの表示
        
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "​​/api/v1/navigator_conversations";

        cc.log("Get Confirmatory Exam Scripts API: " + url);
        cc.log("TOKEN:" + this.staticGetToken());

        xhr.open("GET", url + "?category=" + category, true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            let response:NavigatorConversations = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
				let responseText:string = xhr.responseText;
				let json:any = JSON.parse(responseText);

				cc.log("GET CONFIRMATORY EXAM SCRIPTS RESPONSE ------------");
				cc.log(json);

				if (json == null)
				{
					cc.log("GET CONFIRMATORY EXAM SCRIPTS ERROR");
                    BugTracking.apiError("確認テストのセリフ取得エラー(B)", url, xhr, { responseText:responseText });

                    //エラーポップアップを表示し、リロードしてもらう
                    this._errorPopup(APIErrorType.FAILED_CLOSE, ()=>{});
                }
                else
                {
                    response = new NavigatorConversations(json.navigate, json.result, json.win_result, json.lose_result);

                    callback(response);
                }
            }
            else
            {
                BugTracking.apiError("確認テストのセリフ取得エラー", url, xhr, {});

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
                this.navigatorConversations(category, callback);
            });
            //console.error(xhr.statusText);
        };
        xhr.send();
    }




    /**
     * プレビュー用のナビゲーターとの会話取得用API
     * @param category 中間テストか期末テストかゴーストか
     * @param callback 
     */
    public static navigatorConversationsPreviews(category:string, callback:(response:any)=>void):void
    {
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        let url:string = this.staticGetHost() + "/api/v1/navigator_conversation_previews";

        cc.log("Get Navigator Conversations Previews API: " + url);
        cc.log("TOKEN:" + this.staticGetToken());

        xhr.open("GET", url + "?category=" + category, true);
        xhr.setRequestHeader( 'TOKEN', this.staticGetToken() );
        xhr.timeout = SchoolAPI.TIME_OUT;

        xhr.onload = (ev:ProgressEvent<EventTarget>)=>
        {
            let response:any = null;
            
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
                let responseText:string = xhr.responseText;
                let json:any = JSON.parse(responseText);

                cc.log("GET Navigator Conversations Previews RESPONSE ------------");
                cc.log(json);

                if (json == null)
                {
                    cc.log("GET Navigator Conversations Previews ERROR");
                }
                else
                {
                    response = json;

                    callback(response);
                }
            }
        };
        xhr.send();
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
     * 画像を読み込む(旧式)
     * @param key コールバックされるオブジェクト型に紐づけされる名前
     * @param imageURL 画像の絶対パス
     * @param callback コールバック
     */
    /*
    public static loadImage_B(key:string, imageURL:string, callback:(response:any)=>void):void
    {
		this._startAccessIcon();        //アイコンの表示
        
        cc.log("load image:" + imageURL);

        if(imageURL.substr(imageURL.length - 1) == "/")
        {
            BugTracking.notify("画像URL不完全エラー", "SchoolAPI.loadImage()", { msg:"画像" + key + "のURLが指定されていません", url:imageURL });
        }

		let xhr:XMLHttpRequest = new XMLHttpRequest();
		xhr.open('GET', imageURL, true);
		xhr.responseType = "arraybuffer";
        xhr.timeout = SchoolAPI.TIME_OUT;

		xhr.onload = (event:any) =>
		{
			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
            {
                let data:Uint8Array = new Uint8Array(event.target.response);
                let binaryData = "";
                for (let i:number = 0, len = data.byteLength; i < len; i++)
                {
                    binaryData += String.fromCharCode(data[i]);
                }

                let image:HTMLImageElement = new Image();

                image.onload = () =>
                {
                    this._closeAccessIcon();        //アイコンを消す
                    
                    let texture:cc.Texture2D = new cc.Texture2D();
                    texture.initWithElement(image);
                    texture.handleLoadedTexture();
                    let spriteFrame:cc.SpriteFrame = new cc.SpriteFrame(texture);

                    cc.log("Image loaded");

                    // 完了
                    callback({ error:null, key:key, image:spriteFrame });
                };
                
                image.onerror = ()=>
                {
                    this._closeAccessIcon();        //アイコンを消す
                    callback({ error:"error", key:key, image:null });
                };

                image.onabort = ()=>
                {
                    this._closeAccessIcon();        //アイコンを消す
                    callback({ error:"abort", key:key, image:null });
                };
                
                //image.ontimeout = ()=>
                //{
                //    callback({ error:"timeout", key:key, image:null });
                //};
                
			    image.src = "data:image/png;base64," + window.btoa(binaryData);
            }
            else
            {
                this._closeAccessIcon();        //アイコンを消す

                if(imageURL != "localDummy/icon")
                {
                    BugTracking.apiError("画像取得エラー", imageURL, xhr, { key:key, imageURL:imageURL });
                }

                // エラーはでているがゲームの進行はひとまず継続する
                callback({ error:"apiError", key:key, image:null });
            }
		};
        xhr.onerror = xhr.ontimeout = (ev:ProgressEvent<EventTarget>)=>
        {
            this._closeAccessIcon();        //アイコンを消す
            
            //再接続
            this._errorPopup(APIErrorType.OFFLINE, ()=>
            {
                this.loadImage(key, imageURL, callback);
            });
            //console.error(xhr.statusText);
        };
		xhr.send();
    }
    */


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


    private static _dummyChildMyPage(callback:(response:any)=>void):void
    {
        //エラーで落ちる
        callback({
            "entered_at": "2021年3月3日",
            "total_question_num": 470,
            "week_question_num": 240,
            "graph_data": {
              "datas": [
                30,
                230,
                470
              ],
              "labels": [
                "2021年04月05日~04月11日",
                "2021年04月12日~04月18日",
                "2021年04月19日~04月25日"
              ]
            }
          });
    }


    private static _dummyTitlePage(callback:(response:PlayerData)=>void):void
    {
        callback(new PlayerData("A", false, 0, 123, 0, "localDummy/icon", 1, 50, "単体テスト君", 1.0, false));
    }



    private static _dummyOpponentCPUs(callback:(response:OpponentCPU)=>void):void
    {
        let data:OpponentCPU = new OpponentCPU(
            123,
            [],
            "かてたらいいな",
            12
        );

        //今はurlは使ってないけど、画像取得でこのurlならダミー画像になるといいな
        data.cpu_data = [
            new CPUData("ダミー", 300, "こんにちは", "勝った～", "負けた～", "うんこゲット", "これはワシからの問題じゃ", "正解じゃ1", "正解じゃ2", "正解じゃ3", "間違いじゃ1", "間違いじゃ2", "間違いじゃ3",
                "localDummy/icon", "localDummy/ijin", "localDummy/unko", "localDummy/thumbnail", "localDummy/sp_bg", "localDummy/pc_bg"),
            new CPUData("モブA", 200, "", "", "", "", "", "", "", "", "", "", "", "localDummy/icon", "", "", "", "", ""),
            new CPUData("モブB", 100, "", "", "", "", "", "", "", "", "", "", "", "localDummy/icon", "", "", "", "", "")
        ],

        callback(data);
    }


    private static _dummyGetGameItems(callback:(response:GetGameItem)=>void):void
    {
        callback(new GetGameItem(123,
            [
                new GoribenItem(1, "ダミー1", 40),
                new GoribenItem(2, "ダミー2", 30),
                new GoribenItem(3, "ダミー3", 20),
                new GoribenItem(4, "ダミー4", 10)
            ]));
    }


    private static _dummySchoolEnd(callback:(response:SchoolEnd)=>void):void
    {
        callback(new SchoolEnd(
            1,  //正解数
            180, //トータルスコア
            400, //とれる最高得点
            80, //正解点
            {}, //サーバに送信した回答情報(回答までにかかった時間など)
            40,  //スピード点
            0,  //ヒントボーナス
            60,  //コンボボーナス
            1.0,    //回答にかかった時間のトータル
            20,      //取得したコイン
            100,      //取得後の所持コイン数
            40,      //獲得経験値
            !true,  //レベルアップ
            2,      //旧レベル
            3,      //経験値ゲット後のレベル
            80,      //レベルアップまでの残り経験値
            40,      //レベルアップまでの残り経験値（経験値取得前）
            50,     //ハイスコア
            1.0,    //天才パワーによるスコアブースト
            12,    //ごりべん進捗度による現在の経験値倍率(12)
            0,      //連続コンボ数,
            "https://unko-qadb.s3-ap-northeast-1.amazonaws.com/collection/001_unko.png",     //獲得している偉人の中で最新の偉人のうんこ画像URL
            "4月1日",       //対戦したゴーストの日付
            null    //ゲットしたうんこ情報
        ));
    }


    private static _dummyConfirmatoryExamScripts(category:string, callback:(response:NavigatorConversations)=>void):void
    {
        callback(new NavigatorConversations(
            [
                "<cutin>" +
                "<i>ひさしぶりじゃのぅ。</i>" +
                "<y>うんこ{先生,せんせい}っ！！</y>" +
                "<i>的なやつ</i>"
            ],
            [
                "<i>None dummy data</i>"
            ],
            [
                "<i>None dummy data</i>"
            ],
            [
                "<i>None dummy data</i>"
            ],
            ));
    }

    /**
     * 企業タイアップゲーム開始用エンドポイント
     * @param callback コールバック
     * @param gameMode 各企業の名前を指定する
     * @param reference どこからのアクセスかを入れる
     */
    public static exStart(gameMode:string, reference: string, callback:(response:any)=>void):void
    {
        if (!StaticData.testMode) {
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
        if (!StaticData.testMode) {
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
        if (!StaticData.testMode) {
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
        cc.loader.loadRes("json/setting", (err, res) => {
            if (err) {
                cc.log("settingを読み込めませんでした");
                return;
            }
            StaticData.playerData = res.json.playerData;
            StaticData.gameSetting = res.json.setting;
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
                            StaticData.gameSetting.specificQuestionNum = Number(tmp[1]);
                            break;
                    }
                }
            }
            cc.loader.loadRes("json/opponent", (err, res) => {
                if (err) {
                    cc.log("opponentを読み込めませんでした");
                    return;
                }
                StaticData.opponentCPUs = res.json;
                callback();
            })
        });
     }
}
