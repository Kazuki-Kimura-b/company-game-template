const {ccclass, property} = cc._decorator;

@ccclass
export default class STFont extends cc.Component {

    /** フォントファイル(.ttf) */
    @property(cc.Font) font:cc.Font = null;

    /** 半角英字に使用するフォントファイル。未設定の場合は通常のフォントを使用する */
    @property(cc.Font) englishFont:cc.Font = null;

    /** tタグで使用するフォント。未設定の場合は他のフォントを使用する。アルファベットもこちらを優先する */
    @property(cc.Font) tTagFont:cc.Font = null;
    
    /** 画像に置き換える文字 */
    @property([cc.String]) iconChars: string[] = [];
    
    /** 置き換える画像 */
    @property(cc.SpriteFrame) iconSpriteFrames: cc.SpriteFrame[] = [];
    
    /** 画像の色をフォーマットの文字カラーに合わせるかどうか */
    @property([cc.Boolean]) iconEnabledTextColors: boolean[] = [];
    
    /** 文字数。画像を何文字分として扱うか */
    @property([cc.Float]) iconLocLengths: number[] = [];
}
