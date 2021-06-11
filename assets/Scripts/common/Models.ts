import SchoolText from "./SchoolText";

const {ccclass, property} = cc._decorator;


export class PlayerData
{
    /** アイコン画像 */
    public iconSpriteFrame:cc.SpriteFrame = null;
    
    constructor(
        /** 選択したBGM */
        public bgm: string,
        /** BGMのON/OFF */
        public bgm_enabled: boolean,
        /** プレイ回数 */
        public challenging_times: number,
        /** 所持コイン */
        public coin: number,
        /** 今日のプレイ回数 */
        public daily_challenging_times: number,
        /** アイコン画像のURL */
        public icon: string,
        /** レベル */
        public level: number,
        /** 次のレベルまでの経験値パーセンテージ */
        public next_level_progress: number,
        /** プレーヤー名 */
        public nickname: string,
        /** ゴリ勉中のスコアブースト */
        public score_magnification: number,
        /** 効果音のON/OFF */
        public se_enabled: boolean,
    ){}

    /** てんさいパワー */
    public get maxPower():number
    {
        //四捨五入しないと399.99999999のように計算精度が低くて誤差が出る
        return Math.round(this.score_magnification * 400);
    }

    /**
     * ステータスの更新
     * @param userName 
     * @param bgmEnabled 
     * @param bgmCode 
     * @param seEnabled 
     */
    public updateProperty(userName:string, bgmEnabled:boolean, bgmCode:string, seEnabled:boolean):void
    {
        this.nickname = userName;
        this.bgm_enabled = bgmEnabled;
        this.bgm = bgmCode;
        this.se_enabled = seEnabled;
    }
}



export class ComboRanking
{
    constructor(
        /** 現在の連続コンボ数 */
        public combo:number,
        /** 連続コンボの過去最大値 */
        public max_combo:number,
        /** 子供のid */
        public id:number,
        /** 子供のニックネーム */
        public nickname:string,
        /** アイコン画像 */
        public icon_path:string
    ){}
}




export class OpponentCPU
{
    /** 3人の偉人データ */
    public cpu_data: CPUData[] = null;
    
    constructor(
        /** 連続コンボ数 */
        public continual_combo:number,
        cpu_data: any,
        /** VS画面で挑戦ボタンの上に表示されるメッセージ */
        public progress_words: string,
        /** レベルアップまでの修行回数 */
        public try_num_to_level_up: number
    ){
        this.cpu_data = [];
        for(let i:number = 0 ; i < cpu_data.length ; i ++)
        {
            let d:any = cpu_data[i];
            this.cpu_data.push(new CPUData(d.short_name, d.target_score,
                d.appearance_script, d.win_script, d.lose_script, d.unko_get_script, d.play_script, d.correct_script1, d.correct_script2, d.correct_script3, d.incorrect_script1, d.incorrect_script2, d.incorrect_script3,
                d.icon_image_url, d.ijin_image_url, d.ijin_unko_image_url, d.thumbnail_image_url, d.vertical_background_image_url, d.horizontal_background_image_url
                )
            );
        }
    }

    /** メインの偉人データ */
    public get ijin(){ return this.cpu_data[0]; }
}


export class CPUData
{
    /** フリガナを取り除いた偉人の名前 */
    public displayName:string = null;
    /** 偉人のアイコン画像 */
    public iconSpriteFrame:cc.SpriteFrame = null;
    /** 偉人の画像 */
    public ijinImageSpriteFrame:cc.SpriteFrame = null;
    /** 縦背景の画像 */
    public verticalBGSpriteFrame:cc.SpriteFrame = null;
    /** 横背景の画像 */
    public horizontalBGSpriteFrame:cc.SpriteFrame = null;

    
    constructor(
        /** 偉人の名前 */
        public short_name:string,
        /** 天才パワー */
        public target_score: number,
        /** 偉人登場時のセリフ */
        public appearance_script: string,
        /** プレーヤーが勝った時のセリフ */
        public win_script: string,
        /** プレーヤーが負けた時のセリフ */
        public lose_script: string,
        /** うんこゲットのセリフ */
        public unko_get_script: string,

        /** プレイ中の偉人のセリフ */
        public play_script,
        /** 正解時の偉人のセリフ1 */
        public correct_script1,
        /** 正解時の偉人のセリフ2 */
        public correct_script2,
        /** 正解時の偉人のセリフ3 */
        public correct_script3,
        /** 不正解時の偉人のセリフ1 */
        public incorrect_script1,
        /** 不正解時の偉人のセリフ2 */
        public incorrect_script2,
        /** 不正解時の偉人のセリフ3 */
        public incorrect_script3,

        /** 偉人のアイコンURL */
        public icon_image_url: string,
        /** 偉人のイメージ(透過png)URL */
        public ijin_image_url: string,
        /** 偉人のうんこURL */
        public ijin_unko_image_url: string,
        /** コレクションURL */
        public thumbnail_image_url: string,
        /** スマートフォン用、縦長背景URL */
        public vertical_background_image_url: string,
        /** PC用、横長背景URL */
        public horizontal_background_image_url: string
    ){
        this.displayName = SchoolText.getTextString(short_name).textStr;
    }


    public static createDummyJson(name:string, targetScore:number):{}
    {
        return {
            short_name: name,
            target_score: targetScore,
            icon_image_url: "",
            ijin_image_url: "",
            ijin_unko_image_url: "",
            thumbnail_image_url: "",
            vertical_background_image_url: "",
            horizontal_background_image_url: "",
            win_script: null,
            lose_script: null
        };
    }


}



export class GetGameItem
{
    constructor(
        public coin:number,
        public items:GoribenItem[]
    ){}
}

export class GoribenItem
{
    constructor(
        public id:number,
        public name:string,
        public coin:number
    ){}
}



export class UseGameItem
{
    constructor(
        /** 購入後の残りコイン */
        public coin:number,
        /** 購入したアイテム情報 */
        public items:{ id:number, name:string, coin:number }[]
    ){}
}



export class SchoolEnd
{
    constructor(
        /** 正答数 */
        public accuracy_num:number,
        /** 各種スコアの合計(モード毎に算出条件が異なる) */
        public scoring_total:number,
        /** 各種スコア合計の最大値 */
        public max_scoring_total:number,
        /** 正解得点 */
        public accuracy_score:number,
        /**  */
        public answers:any,
        /** スピード得点 */
        public time_score:number,
        /** ノーヒント得点 */
        public hint_score:number,
        /** コンボ得点 */
        public combo_score:number,
        /** 各問題にかかった合計時間(各問題のログから算出) */
        public time_total:number,
        /** 今回のゲームプレイで獲得したコイン */
        public coin:number,
        /** 子供の保有コイン数(今回のゲームプレイで獲得したコインも含む) */
        public total_coin:number,
        /** 今回のゲームで獲得した経験値 */
        public experience_point:number,
        /** 今回のプレイでレベルか上がったかどうか */
        public level_up:boolean,
        /** 今回のプレイ前のレベル */
        public old_level:number,
        /** 今回のプレイ後の現在のレベル */
        public current_level:number,
        /** 次のレベルまでの進捗度(%) */
        public next_level_progress:number,
        /** ゲームプレイ前の次のレベルまでの進捗度(%) */
        public next_level_before_progress:number,
        /** ハイスコア(ゴーストではゴーストのスコアを返す) */
        public high_score:number,
        /** レベルに応じた得点倍率 */
        public score_magnification:number,
        /** ごりべん進捗度による現在の経験値倍率 */
        public experience_point_magnification:number,
        /** 連続コンボ数 */
        public continual_combo:number,
        /** 獲得している偉人の中で最新の偉人のうんこ画像URL */
        public acquired_newest_ijin_unko_file_url:string,
        /** 対戦相手のゴーストの日付 */
        public ghost_date:string,
        /** 今回取得したコレクション */
        public collections:CollectionItem
    ){}
}


export class CollectionItem
{
    constructor(
        /** サブジャンル */
        public subgenre: string,
        /** カードの名称 */
        public name: string,
        /** カードの説明 */
        public description: string,
        /** カードの画像url */
        public unko_url: string,
        /** カードの表示位置 */
        public position: number,
        /** カード取得条件 */
        public trigger: string
    ){}
}


export class NavigatorConversations
{
    /** カテゴリ：中間テスト */
    public static CATEGORY_MIDTERM :string = "中間テスト";
    /** カテゴリ：期末テスト */
    public static CATEGORY_FINAL :string = "期末テスト";
    /** カテゴリ：ゴースト */
    public static CATEGORY_GHOST :string = "もく勉ゴースト";
    
    constructor(
        /** ゲーム開始前のナビゲーターのセリフ */
        public navigate: string[],
        /** ゲーム終了時のセリフ */
        public result: string[],
        /** ゲーム終了時のセリフ(勝利時) */
        public win_result: string[],
        /** ゲーム終了時のセリフ(敗北時) */
        public lose_result: string[],
    ){}
}


export class ConfirmatoryExamFlag
{
    constructor(
        /** 月のはじめの確認 */
        public final_exam_mode_flag: boolean,
        /** 月の中間の確認 */
        public midterm_exam_mode_flag:boolean
    ){}
}




