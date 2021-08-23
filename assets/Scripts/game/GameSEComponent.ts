const {ccclass, property} = cc._decorator;


export class GameSE
{
    public static clip:GameSE = null;

    constructor
    (
        /** 読み込み完了 */
        public loadComplete: cc.AudioClip,
        /** ゲーム開始時のカウントダウン */
        public startCountDown: cc.AudioClip,
        /** 問題表示音 */
        public showQuestion: cc.AudioClip,
        /** 出題音(デデン！) */
        public shutsudai: cc.AudioClip,
        /** 回答ボタン登場音 */
        public showAnswerBtn: cc.AudioClip,
        /** 決定ボタンを押した音 */
        public enterBtnPress: cc.AudioClip,
        /** リセットボタンを押した音 */
        public resetBtnPress: cc.AudioClip,
        /** 残り10秒 */
        public harryUp: cc.AudioClip,
        /** 時間切れ */
        public timeUp: cc.AudioClip,

        /** 解説表示音 */
        public showKaisetsu: cc.AudioClip,
        /** ヒント表示音 */
        public hintBtnPress: cc.AudioClip,
        /** 通常フキダシ表示音 */
        public normalHukidashi: cc.AudioClip,
        /** ヒントフキダシ表示音 */
        public hintHukidashi: cc.AudioClip,
        /** 色反転時の効果音 */
        public negaEffect: cc.AudioClip,
        /** 正解時にうんこが弾ける音 */
        public unkoEffect: cc.AudioClip,
        /** ピンポン */
        public pinpon: cc.AudioClip,
        /** ピンポンピンポン */
        public pinponX2: cc.AudioClip,
        /** ブブー */
        public batsu: cc.AudioClip,
        /** ゲーム終了のブザー（ホイッスル） */
        public endGame: cc.AudioClip,
        /** フィニッシュスクリーンが登場する音 */
        public finishScreenStart: cc.AudioClip,
        /** フィニッシュスクリーンがはける音 */
        public finishScreenEnd: cc.AudioClip,

        /** 解説：先生がうなずく */
        public kaisetsuSenseiUnazuki: cc.AudioClip,
        /** 解説：先生がびっくり */
        public kaisetsuSenseiBikkuri: cc.AudioClip,
        /** 解説：先生もなっとく */
        public kaisetsuBtnNattoku: cc.AudioClip,
        /** ストーリー部分のbgm */
        // public vsBGM: cc.AudioClip
    ){}
}



@ccclass
export default class GameSEComponent extends cc.Component
{
    @property({type:cc.AudioClip}) loadComplete: cc.AudioClip = null;
    @property({type:cc.AudioClip}) startCountDown: cc.AudioClip = null;
    @property({type:cc.AudioClip}) showQuestion: cc.AudioClip = null;
    @property({type:cc.AudioClip}) shutsudai: cc.AudioClip = null;
    @property({type:cc.AudioClip}) showAnswerBtn: cc.AudioClip = null;
    @property({type:cc.AudioClip}) enterBtnPress: cc.AudioClip = null;
    @property({type:cc.AudioClip}) resetBtnPress: cc.AudioClip = null;
    @property({type:cc.AudioClip}) harryUp: cc.AudioClip = null;
    @property({type:cc.AudioClip}) timeUp: cc.AudioClip = null;

    @property({type:cc.AudioClip}) showKaisetsu: cc.AudioClip = null;
    @property({type:cc.AudioClip}) hintBtnPress: cc.AudioClip = null;
    @property({type:cc.AudioClip}) normalHukidashi: cc.AudioClip = null;
    @property({type:cc.AudioClip}) hintHukidashi: cc.AudioClip = null;
    @property({type:cc.AudioClip}) negaEffect: cc.AudioClip = null;
    @property({type:cc.AudioClip}) unkoEffect: cc.AudioClip = null;

    @property({type:cc.AudioClip}) pinpon: cc.AudioClip = null;
    @property({type:cc.AudioClip}) pinponX2: cc.AudioClip = null;
    @property({type:cc.AudioClip}) batsu: cc.AudioClip = null;

    @property({type:cc.AudioClip}) endGame: cc.AudioClip = null;
    @property({type:cc.AudioClip}) finishScreenStart: cc.AudioClip = null;
    @property({type:cc.AudioClip}) finishScreenEnd: cc.AudioClip = null;

    @property({type:cc.AudioClip}) kaisetsuSenseiUnazuki: cc.AudioClip = null;
    @property({type:cc.AudioClip}) kaisetsuSenseiBikkuri: cc.AudioClip = null;
    @property({type:cc.AudioClip}) kaisetsuBtnNattoku: cc.AudioClip = null;

    // @property({type:cc.AudioClip}) vsBGM: cc.AudioClip = null;


    start ()
    {
        GameSE.clip = new GameSE
        (
            this.loadComplete,
            this.startCountDown,
            this.showQuestion,
            this.shutsudai,
            this.showAnswerBtn,
            this.enterBtnPress,
            this.resetBtnPress,
            this.harryUp,
            this.timeUp,
            this.showKaisetsu,
            this.hintBtnPress,
            this.normalHukidashi,
            this.hintHukidashi,
            this.negaEffect,
            this.unkoEffect,
            this.pinpon,
            this.pinponX2,
            this.batsu,
            this.endGame,
            this.finishScreenStart,
            this.finishScreenEnd,
            this.kaisetsuSenseiUnazuki,
            this.kaisetsuSenseiBikkuri,
            this.kaisetsuBtnNattoku,
            // this.vsBGM
        );
    }
}
