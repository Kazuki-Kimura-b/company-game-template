import APIAccess from "./common/APIAccess";
import { CPUData, NavigatorConversations, OpponentCPU, PlayerData } from "./common/Models";

const {ccclass, property} = cc._decorator;


export enum GameMode
{
    GORIBEN,
    HAYABEN,
    GHOST,
    GACHIBEN,
    KAKUNIN_TEST
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



@ccclass
export default class StaticData {

    public static readonly DEVELOP_MODE:boolean = APIAccess.isDevelopToken();
    public static readonly LOCAL_HOST:boolean = (location.hostname == "localhost");
    
    /** タイトル画面で最初のAPIを叩いたかどうか */
    public static titleSceneStartAPI :boolean = false;

    /** APIで問題を取得せずテストの問題を表示 */
    public static debugBlockAPI :boolean = false;

    /** BGMミュート */
    public static debugBgmMute :boolean = false;

    /** 問題データを分割する単語 */
    public static readonly QUESTION_SPLIT_WORD :string = ";";

    /** ローカルのダミーデータは問題数多いのを使う */
    public static readonly LOCAL_Q_DATA_BIG :boolean = true;

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

    /** プレビューモードかどうか */
    public static previewMode :boolean = false;

    /** Opening_Bシーンで展開するイベント内容 */
    public static specialEvent: SpecialEvent = SpecialEvent.NONE;

    /** ゴースト発生確率が100%になる */
    public static ghostAlwayMode: boolean = false;

    /** 対戦相手がソクラテスになる */
    public static vsSokuratesu: boolean = false;

    /** ゴーストに勝利したかどうか（最後に対戦したもの） */
    public static ghostWin:boolean = false;
    /** 対戦したゴーストの日付 */
    public static ghostDate:string = "";
    /** 確認テストが中間かどうか */
    public static kakuninMid:boolean = false;

    /** ゴーストや中間テストなどの会話内容 */
    public static navigatorConversations:NavigatorConversations = null;



    /** ユーザーのゲーム的な情報 */
    public static playerData:PlayerData = null;

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

    
    /** ゲームモード。*/
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

}





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