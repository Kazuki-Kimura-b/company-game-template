import SoundControl from "./SoundControl"


const {ccclass, property} = cc._decorator;

@ccclass
export default class SchoolSound extends SoundControl {

    
    /** 読み込み完了 */
    @property({type:cc.AudioClip}) seLoadComplete: cc.AudioClip = null;
    /** ゲーム開始時のカウントダウン */
    @property({type:cc.AudioClip}) seStartCountDown: cc.AudioClip = null;
    /** 問題表示音 */
    @property({type:cc.AudioClip}) seShowQuestion: cc.AudioClip = null;
    /** 出題音(デデン！) */
    @property({type:cc.AudioClip}) seShutudai: cc.AudioClip = null;
    /** 回答ボタン登場音 */
    @property({type:cc.AudioClip}) seShowAnswerBtn: cc.AudioClip = null;
    /** 決定ボタンを押した音 */
    @property({type:cc.AudioClip}) seEnterBtnPress: cc.AudioClip = null;
    /** リセットボタンを押した音 */
    @property({type:cc.AudioClip}) seResetBtnPress: cc.AudioClip = null;
    /** 残り10秒 */
    @property({type:cc.AudioClip}) seHarryUp: cc.AudioClip = null;
    /** 時間切れ */
    @property({type:cc.AudioClip}) seTimeUp: cc.AudioClip = null;

    /** 解説表示音 */
    @property({type:cc.AudioClip}) seShowKaisetsu: cc.AudioClip = null;
    /** ヒント表示音 */
    @property({type:cc.AudioClip}) seHintBtnPress: cc.AudioClip = null;
    /** 通常フキダシ表示音 */
    @property({type:cc.AudioClip}) seHukidashi: cc.AudioClip = null;
    /** ヒントフキダシ表示音 */
    @property({type:cc.AudioClip}) seHint: cc.AudioClip = null;
    /** 色反転時の効果音 */
    @property({type:cc.AudioClip}) seNegaEffect: cc.AudioClip = null;

    /** 手前のうんこむしが弾ける音 */
    @property({type:cc.AudioClip}) sePopUnkomushi: cc.AudioClip = null;
    /** 奥のうんこむしが落ちてくる音 */
    @property({type:cc.AudioClip}) sePutUnkomushi: cc.AudioClip = null;
    /** 手前の弾けたうんこむしが消える音（使ってない） */
    @property({type:cc.AudioClip}) seRemoveUnkomushi: cc.AudioClip = null;
    /** 奥のうんこ虫が不正解で落ちる音 */
    @property({type:cc.AudioClip}) seFallingUnkomushi: cc.AudioClip = null;
    /** フィニッシュスクリーンが登場する音 */
    @property({type:cc.AudioClip}) seFinishScreenStart: cc.AudioClip = null;
    /** フィニッシュスクリーンがはける音 */
    @property({type:cc.AudioClip}) seFinishScreenEnd: cc.AudioClip = null;

    /** 解説：先生がうなずく */
    @property({type:cc.AudioClip}) seKaisetsuSenseiUnazuki: cc.AudioClip = null;
    /** 解説：先生がびっくり */
    @property({type:cc.AudioClip}) seKaisetsuSenseiBikkuri: cc.AudioClip = null;
    /** 解説：先生もなっとく */
    @property({type:cc.AudioClip}) seKaisetsuBtnNattoku: cc.AudioClip = null;

}
