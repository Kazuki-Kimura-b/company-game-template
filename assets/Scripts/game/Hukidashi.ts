import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Hukidashi extends cc.Component {

    @property(cc.Sprite) leftSprite: cc.Sprite = null;
    @property(cc.Node) centerWindow: cc.Node = null;
	@property(cc.Sprite) rightSprite: cc.Sprite = null;
	@property(cc.Sprite) iconSprite: cc.Sprite = null;
	@property(cc.Button) btnShowHint: cc.Button = null;
	@property(cc.SpriteFrame) left2LineSpriteFrame: cc.SpriteFrame = null;
	@property(cc.SpriteFrame) right2LineSpriteFrame: cc.SpriteFrame = null;

	

	private _output:SchoolText = null;
	private _hintOpenBtnPressedCallback:()=>void = null;


	
	private readonly _COLOR_ERROR:cc.Color = cc.color(255, 0, 0);
	private readonly _COLOR_DEFAULT:cc.Color = cc.color(0, 0, 0);
	private readonly _COLOR_HINT:cc.Color = cc.color(0, 255, 255);
	private readonly _COLOR_KAISETSU:cc.Color = cc.color(240, 140, 255);	//cc.color(255, 180, 180);

	/** エラー */
	public static TYPE_ERROR: number = 0;
	/** セリフタイプ */
	public static TYPE_SERIHU: number = 1;
	/** ヒントタイプ */
	public static TYPE_HINT: number = 2;
	/** 解説タイプ */
	public static TYPE_KAISETSU: number = 3;
	

    

	/**
	 * 初期化
	 * @param text 
	 * @param type 
	 * @param faceIcon 
	 */
    setup(text:string, type:number, faceIcon:cc.SpriteFrame, font:cc.Font):void
    {
		this.btnShowHint.node.active = false;
		
		if(text == undefined)
		{
			text = "UNDEFINED TEXT";
			type = Hukidashi.TYPE_ERROR;
		}

		let textColor: cc.Color = (type == Hukidashi.TYPE_SERIHU) ? cc.color(255,255,255) : cc.color(0,0,0);

		let format:{} =
		{
			size: 26,
            margin: 0,
            lineHeight: 50,//28
            rows: 2,
            columns: 24,
            horizontalAlign: SchoolText.HORIZONTAL_ALIGH_LEFT_ZERO,
            verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
            color: textColor,
			yomiganaSize: 15,
			yomiganaMarginY: 2
		};

		//this._output = SchoolText.create(this.node, text, STFormat.create(format));
		this._output = SchoolText.createWithFont(this.node, text, STFormat.create(format), font);
		this._output.node.x = 76;
		this._output.flushText();

		//フリガナ情報を除いたテキストの長さ
		//let stHurigana:any = SchoolText.getTextString(text);
		//let textLen:number = stHurigana.textStr.length;
		let textLen:number = this._output.getMaxColumns();

		//2行の場合吹き出しが縦長になる
		if(this._output.getRowsCount() > 1)
		{
			this.rightSprite.spriteFrame = this.right2LineSpriteFrame;
			this.leftSprite.spriteFrame = this.left2LineSpriteFrame;
			
			let newHeigth:number = this.right2LineSpriteFrame.getOriginalSize().height;
			this.centerWindow.height = newHeigth;
			this.node.height = newHeigth;
		}

		
		this.centerWindow.width = textLen * format["size"] + 40;
		this.rightSprite.node.x = this.centerWindow.x + this.centerWindow.width;

		let windowColor:cc.Color = this._COLOR_DEFAULT;
		if(type == Hukidashi.TYPE_HINT) windowColor = this._COLOR_HINT;
		else if(type == Hukidashi.TYPE_KAISETSU) windowColor = this._COLOR_KAISETSU;
		else if(type == Hukidashi.TYPE_ERROR) windowColor = this._COLOR_ERROR;

		this.leftSprite.node.color = windowColor;
		this.centerWindow.color = windowColor;
		this.rightSprite.node.color = windowColor;

		if(type == Hukidashi.TYPE_SERIHU)
		{
			this.iconSprite.spriteFrame = faceIcon;
			this.iconSprite.node.width = 56;
			this.iconSprite.node.height = 56;
		}
	}



	// 表示ボタンで隠す仕様ではなくなったのでこれも不要になる。
	// 落ち着いたタイミングでNodeとともに外す
	/*
	hideHintText(callback:()=>void):void
	{
		this._hintOpenBtnPressedCallback = callback;
		this.btnShowHint.node.active = true;
		//this._output.node.active = false;
		this._output.node.scale = 0;
	}
	*/

	openHint():void
	{
		if(this.btnShowHint.node.active)
		{
			this.btnShowHint.node.active = false;
			//this._output.node.active = true;
			this._output.node.scale = 1;
		}
	}
	


	onPressShowHintButton():void
	{
		this._hintOpenBtnPressedCallback();
	}


}
