import APIAccess from "./common/APIAccess";
import { CPUData, NavigatorConversations, OpponentCPU } from "./common/Models";
// import {PlayerData} from "./common/Models"

const {ccclass, property} = cc._decorator;

export class EasingName
{
    public static quadIn        :string = 'quadIn';
    public static quadOut       :string = 'quadOut';
    public static quadInOut     :string = 'quadInOut';
    public static cubicIn       :string = 'cubicIn';
    public static cubicOut      :string = 'cubicOut';
    public static cubicInOut    :string = 'cubicInOut';
    public static quartIn       :string = 'quartIn';
    public static quartOut      :string = 'quartOut';
    public static quartInOut    :string = 'quartInOut';
    public static quintIn       :string = 'quintIn';
    public static quintOut      :string = 'quintOut';
    public static quintInOut    :string = 'quintInOut';
    public static sineIn        :string = 'sineIn';
    public static sineOut       :string = 'sineOut';
    public static sineInOut     :string = 'sineInOut';
    public static expoIn        :string = 'expoIn';
    public static expoOut       :string = 'expoOut';
    public static expoInOut     :string = 'expoInOut';
    public static circIn        :string = 'circIn';
    public static circOut       :string = 'circOut';
    public static circInOut     :string = 'circInOut';
    public static elasticIn     :string = 'elasticIn';
    public static elasticOut    :string = 'elasticOut';
    public static elasticInOut  :string = 'elasticInOut';
    public static backIn        :string = 'backIn';
    public static backOut       :string = 'backOut';
    public static backInOut     :string = 'backInOut';
    public static bounceIn      :string = 'bounceIn';
    public static bounceOut     :string = 'bounceOut';
    public static bounceInOut   :string = 'bounceInOut';
    public static smooth        :string = 'smooth';
    public static fade          :string = 'fade';
}


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

interface PlayerData {
    name: string,
}

interface OpponentData {
    name: string,
    play_script: string,
    correct_script1: string,
    correct_script2: string,
    correct_script3: string,
    incorrect_script1: string,
    incorrect_script2: string,
    incorrect_script3: string,
    win_script: string,
    lose_script: string,
    unko_get_script: string
}


interface GameSetting {
    companyName: string, // 企業名
    startColor1: cc.Color, // finishScreenで使用するカラー
    startColor2: cc.Color,
    endColor1: cc.Color,
    endColor2: cc.Color,
    isTestMode: boolean, // 確認モードかどうか。確認モードの場合、クエリで設定をつけていく
    isRandomQuestion: boolean, // ランダムで出題するかどうか
    specificQuestionNum: number, // 特定の問題のID
    specificResultNum: number, // 特定の結果画面のID
    reference: string,
    useGameCharacter: boolean, // ゲーム画面で右下にキャラを表示するかどうか
    useCharaUnkosensei: boolean // 汎用うんこ先生を使うかどうか
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
    public static gameModeID: GameMode = GameMode.GORIBEN;

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
    // public static testMode: boolean = true;

    public static playerData: PlayerData = {
        name: "あなた"
    };

    public static opponentData: OpponentData = {
        name: null,
        play_script: null,
        correct_script1: null,
        correct_script2: null,
        correct_script3: null,
        incorrect_script1: null,
        incorrect_script2: null,
        incorrect_script3: null,
        win_script: null,
        lose_script: null,
        unko_get_script: null,
    }

    public static gameSetting: GameSetting = {
        companyName: "yanmar", //企業名
        startColor1: new cc.Color(255, 255, 255), // 企業ごとのfinishScreenの色1
        startColor2: new cc.Color(255, 0, 0), // 企業ごとのfinishScreenの色2
        endColor1: new cc.Color(0, 40, 190),
        endColor2: new cc.Color(0, 168 , 108),
        isRandomQuestion: false, // テスト時は、リファラで設定する
        isTestMode: true, // テストモードかどうか
        useGameCharacter: false,
        useCharaUnkosensei: false,

        /* 以下は自分で設定しない。リファラから取得する */
        reference: null, // 本番用 どこからのアクセスかを測定する。
        specificQuestionNum: 1, // テスト用 特定の問題を出題する場合。
        specificResultNum: 0 // テスト用 特定のリザルトを表示する場合。
    }
}