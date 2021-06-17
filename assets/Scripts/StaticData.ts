import APIAccess from "./common/APIAccess";
import { CPUData, NavigatorConversations, OpponentCPU } from "./common/Models";
import {PlayerData} from "./common/Models"
import { GameSE } from "./game/GameSEComponent";

const {ccclass, property} = cc._decorator;


export enum GameMode
{
    GORIBEN,
    HAYABEN,
    GHOST,
    GACHIBEN,
    KAKUNIN_TEST,
}

export enum SpecialEvent
{
    NONE,
    OPENING_B,
    KAKUNIN_START,
    KAKUNIN_END,
    GHOST_START,
    GHOST_END,
    HAYABEN_END
}

interface GameSetting {
    companyName: string, // 企業名
    isRandomQuestion: boolean, // ランダムで出題するかどうか
    allQuestionNum: number, // 全問題数(出題数は10問で固定する)
    isTestMode: boolean, // 確認モードかどうか。確認モードの場合、クエリで設定をつけていく
    showSpecificQuestion: boolean, // 特定の問題を出題するかどうか
    specificQuestionNum: number, // 特定の問題のID
    showSpecificResult: boolean, // 特定の結果画面を出題する場合
    specificResultNum: number, // 特定の結果画面のID,
}



@ccclass
export default class StaticData {

    public static readonly DEVELOP_MODE:boolean = APIAccess.isDevelopToken(); // 使わない
    public static readonly LOCAL_HOST:boolean = (location.hostname == "localhost"); // 使わない
    
    /** タイトル画面で最初のAPIを叩いたかどうか */
    public static titleSceneStartAPI :boolean = false;

    /** APIで問題を取得せずテストの問題を表示 */
    public static debugBlockAPI :boolean = false;

    /** BGMミュート */
    public static debugBgmMute :boolean = false;

    /** 問題データを分割する単語 */
    public static readonly QUESTION_SPLIT_WORD :string = ";";

    /** 問題idを表示 */
    //public static readonly DEBUG_SHOW_QUESTION_ID: boolean = false;

    public static readonly TIME_API_ACCESS_ICON :number = 3.0;
    public static readonly TIME_LOAD_SCENE_ICON :number = 6.0;

    /** 画像サイズがわかるように色付けする */
	public static readonly DEBUG_SHOW_QUESTION_IMAGE_RECT :boolean = false;

    /** ゴリベン戦で常に勝利する（ただしサーバは更新されないのでステージは進まない） */
    public static readonly DEBUG_ALWAYS_GORIBEN_WIN :boolean = false;

    /** ストーリー、勝敗メッセージなどnullの場合にダミーのストーリーをあてる */
    public static readonly DEBUG_DUMMY_STORIES: boolean = false;

    public static readonly PREVIEW_MODE_VERSION: string = "20210609";

    //-------------------------------------------------------------

    /** ゴーストに勝利したかどうか（最後に対戦したもの） */
    public static ghostWin:boolean = false;
    /** 対戦したゴーストの日付 */
    public static ghostDate:string = "";
    /** 確認テストが中間かどうか */
    public static kakuninMid:boolean = false;

    /** ゴーストや中間テストなどの会話内容 */
    public static navigatorConversations:NavigatorConversations = null;



    /** ユーザーのゲーム的な情報 */
    // public static playerData:PlayerData = null;

    /** 戦う偉人の情報 */
    private static _opponentCPUs:OpponentCPU = null;

    //private static _ijinData:CPUData = null;
    public static get opponentCPUs():OpponentCPU { return this._opponentCPUs; }
    public static set opponentCPUs(opponentCPUs:OpponentCPU)
    {
        if(this._opponentCPUs == null) {}
        else if(this._opponentCPUs.cpu_data[0].displayName == opponentCPUs.cpu_data[0].displayName) return;
        //同じ情報なら上書きしない
        this._opponentCPUs = opponentCPUs;
    }
    public static get ijinData():CPUData { return this._opponentCPUs.cpu_data[0]; }

    public static setIjinDataForPrevieMode(cpu_data:CPUData):void
    {
        this._opponentCPUs.cpu_data[0] = cpu_data;
    }

    
    /** ゲームモード。こちらはゼミで使用しているのであとで削除する*/
    public static gameModeID: GameMode = GameMode.KAKUNIN_TEST;

    /** ゴリ勉(イントロダクション)で使用したアイテム */
    public static useItemIDs:number[] = [];


    //APIからの呼び出しに使用している
    public static get gameModeName()
    {
        let names:string[] = [ "ごりごり", "さくさく", "もく勉ゴースト", "ガチべん", "さくさく" ];  //最後のは確認テストのこと
        return names[this.gameModeID];
    }


    public static flgOpening:boolean = false;

    /** 最後に表示した（しようとした）問題ID */
    public static lastQuestionID:string = "";


    // ---------- 企業タイアップゲーム用設定 ---------
    /** 各企業のゲームモード */
    public static companyGameMode: string = null;

    /** どこからのアクセスかを記録 */
    public static reference: string = null;

    /** テスト環境かどうかのフラグ */
    public static testMode: boolean = true;

    public static playerData: PlayerData = null;

    public static gameSetting: GameSetting = null;
}