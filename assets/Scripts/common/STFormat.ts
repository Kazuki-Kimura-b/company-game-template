const {ccclass, property} = cc._decorator;

@ccclass
export default class STFormat
{
	constructor
	(
		/** フォントサイズ */
		public size: number,
		/** 文字同士の間隔 */ 
		public margin: number,
		/** 行間の間隔 */
		public lineHeight: number,
		/** 最大表示行数 */
		public rows: number,
		/** 1行あたりの最大表示文字数 */
		public columns: number,
		/** 左右詰め、中央揃え */
		public horizontalAlign: string,
		/** 上下詰め、中央揃え */
		public verticalAlign: string,
		/** 横のアンカー位置 */
		//public horizontalAnchor: string,
		/** 縦のアンカー位置 */
		//public verticalAnchor: string,
		/** 文字色 */
		public color: cc.Color,
		/** 読みがなのサイズ */
		public yomiganaSize: number,
		/** 読みがなの位置(Y) */
		public yomiganaMarginY: number
    ){}
    

	/**
	 * オブジェクト型からSTFormatクラスを生成する
	 * @param obj 
	 */
    public static create(obj:any):STFormat
    {
		return new STFormat(
            obj.size,
            obj.margin,
            obj.lineHeight,
            obj.rows,
            obj.columns,
            obj.horizontalAlign,
			obj.verticalAlign,
			//obj.horizontalAnchor,
            //obj.verticalAnchor,
			obj.color,
			obj.yomiganaSize,
			obj.yomiganaMarginY
        );
    }


}