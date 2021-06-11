import BugTracking from "../common/BugTracking";
import SchoolText from "../common/SchoolText";
import SE from "../common/SE";
import STFont from "../common/STFont";
import STFormat from "../common/STFormat";
import StaticData from "../StaticData";


const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsButton extends cc.Component {

	@property(cc.Node) fillNode: cc.Node = null;
	@property(cc.Node) shadowNode: cc.Node = null;
	@property(cc.Node) subItemNodes: cc.Node[] = [];
	//debugOutputM: cc.Label,
	//debugOutputT: cc.Label,

	private _ID :number = -1;
	private _lastAction :string = "";
	private _isSelected :boolean = false;
	private _mouseUpEndColor :cc.Color = null;
	private _lock :boolean = false;
	private _selectCallback :(button:AnsButton)=>void = null;
	private _defaultScale :number = 1.0;
	private _disEnabledMouseEnter :boolean = false;
	private _outputText :SchoolText = null;
	private _outputImage :cc.Sprite = null;
	private _enableOutputImageColor :boolean = false;
	private _popUpTiming :number = 0;
	private _fillColorLock :boolean = false;
	private _muteSE:boolean = false;
	private _tempTextColor:cc.Color;
	private _tempFillColor:cc.Color;

	private readonly COLOR_NORMAL:cc.Color = cc.color(255, 255, 255);
	private readonly COLOR_OVER:cc.Color = cc.color(237, 177, 247);
	private readonly COLOR_PRESS:cc.Color = cc.color(220, 100, 240);
	private readonly COLOR_SELECTED:cc.Color = cc.color(255, 255, 0);
	private readonly COLOR_RESULT_WAIT:cc.Color = cc.color(237, 177, 247);//  cc.color(255, 255, 128);//選択、結果待ち
	private readonly COLOR_RIGHT:cc.Color = cc.color(135, 40, 225);	//cc.color(0, 128, 255);//正解時
	private readonly COLOR_WRONG:cc.Color = cc.color(255, 80, 80);
	private readonly COLOR_FONT_NORMAL:cc.Color = cc.color(0, 0, 0);
	private readonly COLOR_FONT_LOCK:cc.Color = cc.color(128, 128, 128);
	private readonly COLOR_FONT_RIGHT:cc.Color = cc.color(255, 255, 0);
	private readonly COLOR_FONT_WRONG:cc.Color = cc.color(255, 255, 255);
	private readonly COLOR_LINE_NORMAL:cc.Color = cc.color(160, 90, 255);
	private readonly COLOR_LINE_NORMAL_OPACITY:number = 150;
	private readonly COLOR_LINE_LOCK:cc.Color = cc.color(128, 128, 128);
	private readonly COLOR_LINE_LOCK_OPACITY:number = 200;
	private readonly POPUP_TIMING_BEGIN:number = 1;
	private readonly POPUP_TIMING_END:number = 2;
	private readonly POPUP_TIMING_BOTH:number = (this.POPUP_TIMING_BEGIN | this.POPUP_TIMING_END);

	private static _showAnswerButtonSE:cc.AudioClip = null;


	public static setShowAnswreButtonSE(audioClip:cc.AudioClip):void
	{
		this._showAnswerButtonSE = audioClip;
	}



	//マウスとタップの仕様
	//マウスクリック時にクリック中カラーになるが、ロールアウトすると色は解除、そのあとクリックしたままでロールオーバーしても色はクリック中カラーではなくロールオーバーカラーになる
	//ロールオーバー系、ロールアウト系、ダウン系、アップ系の４つは連続して発生しないはずなので連続できたときは２つ目以降を無視する（TOUCH_ENDとMOUSE_UPの可能性があるから）


	/**
	 * 初期化
	 * @param ID 
	 * @param answer 
	 * @param sound 
	 * @param textFormat 
	 */
	public setup (ID:number, answer:string, textFormat:STFormat, stFont:STFont):void
	{
		if(answer == undefined || answer == null)
		{
			BugTracking.notify("回答ボタン作成エラー", "AnsButton", { msg: "回答テキストがありません\n問題id:" + StaticData.lastQuestionID });
			//cc.error("AnsButton.setup()");
		}
		
		
		
		this._ID = ID;
		this._lastAction = "";
		this._isSelected = false;
		this._mouseUpEndColor = this.COLOR_NORMAL;		//ボタンの上でMOUSE_UPした際にロールオーバーの色に正しくするため必要
		this._lock = false;
		this._defaultScale = 1.0;
		this._disEnabledMouseEnter = false;
		this._outputImage = null;
		this._enableOutputImageColor = false;			//正解、間違いなどで色が変化。
		this._popUpTiming = this.POPUP_TIMING_END;		//ボタン選択でポップアップするタイミング

		

		if(textFormat == undefined)
		{
			let textFormatObj:{} = 
			{
				size: 36,
				margin: 2,
				//interval: 38,
				lineHeight: 36,
				rows: 1,
				columns: 12,
				horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
				verticalAlign:SchoolText.VERTICAL_ALIGN_CENTER,		//追加した0918
				color: cc.color(0, 0, 0),
			};

			textFormat = STFormat.create(textFormatObj);
		}
		
		
		//this._outputText = SchoolText.create(this.node, answer, textFormat);
		this._outputText = SchoolText.createWithSTFont(this.node, answer, textFormat, stFont);
		

		this.fillNode.on(cc.Node.EventType.TOUCH_START, this.touchStartEvent, this);		//ボタンをタップで押した時
		//this.fillNode.on(cc.Node.EventType.TOUCH_MOVE, this.touchMoveEvent, this);
		this.fillNode.on(cc.Node.EventType.TOUCH_END, this.touchEndEvent, this);			//ボタン上でタップした指をボタン上で離した時。一度ボタン外に出てもOK
		this.fillNode.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancelEvent, this);		//ボタンの上でタップし、ボタンの外でタップを離した時

		this.fillNode.on(cc.Node.EventType.MOUSE_ENTER, this.mouseEnterEvent, this);		//ボタンにカーソルが重なった時（左クリック中でもそうでなくても発生）
		this.fillNode.on(cc.Node.EventType.MOUSE_LEAVE, this.mouseLeaveEvent, this);		//ボタンからカーソルが外れた時（左クリック中でもそうでなくても発生）
		this.fillNode.on(cc.Node.EventType.MOUSE_DOWN, this.mouseDownEvent, this);			//ボタンをクリックで押した時
		//this.fillNode.on(cc.Node.EventType.MOUSE_MOVE, this.mouseMoveEvent, this);
		this.fillNode.on(cc.Node.EventType.MOUSE_UP, this.mouseUpEvent, this);				//ボタンの上でクリックを離した時（クリック時がボタン外でもOK、一度ボタンから離れて戻ってきてもOK）

		//登場させる演出のためスケール0にする
		this.node.scale = 0;
	}


	/**
	 * 通常時のスケールを設定（初期値1.0）
	 * @param scale 
	 */
	public setDefaultScale (scale:number):void
	{
		this._defaultScale = scale;
	}


	/**
	 * 通常時のスケールを返す
	 */
	public getDefaultScale ():number
	{
		return this._defaultScale;
	}


	/**
	 * テキストの代わりに画像を出す
	 * @param spriteFrame 表示する画像
	 * @param enableImageColor オリジナルの色を使用するかどうか。正解、不正解時に色が変化しない
	 */ 
	public setOutputImage (spriteFrame:cc.SpriteFrame, enableImageColor:boolean):void
	{
		//画像の色をそのまま使用する（正解・間違いなどで色が変化しない）
		if(enableImageColor == undefined) enableImageColor = true;
		this._enableOutputImageColor = enableImageColor;

		this._outputText.node.active = false;

		let newNode = new cc.Node();
		if(! this._enableOutputImageColor) newNode.color = this.COLOR_FONT_NORMAL;
		this.node.addChild(newNode);

		let sprite = newNode.addComponent(cc.Sprite);
		sprite.spriteFrame = spriteFrame;
		sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

		//画像サイズをちょうどいい感じに変更
		let imgSize = spriteFrame.getOriginalSize();
		let scaleX = this.fillNode.width * 0.8 / imgSize.width;
		let scaleY = this.fillNode.height * 0.8 / imgSize.height;
		let scale = (scaleX < scaleY) ? scaleX : scaleY;
		if(scale > 1.0) scale = 1.0;
		newNode.width = imgSize.width * scale;
		newNode.height = imgSize.height * scale;

		this._outputImage = sprite;
	}

	//これ何だっけ・・
	public setEnableOutputImageColor (value:boolean):void
	{
		this._enableOutputImageColor = value;
	}


	/**
	 * 選択時のコールバックを設定
	 * @param callback 
	 */
	public onSelectCallback (callback:(button:AnsButton)=>void):void
	{
		this._selectCallback = callback;
	}


	/**
	 * このボタンの表示内容を返す
	 */
	public getAnswer ():string
	{
		return this._outputText.getText();
	}


	/**
	 * テキストの参照を返す
	 */
	public getOutputText ():SchoolText
	{
		return this._outputText;
	}


	/**
	 * テキストを書き直し
	 * @param text 
	 */
	public setText (text:string):void
	{
		this._outputText.setText(text);
	}



	public setPopUpTiming(start:boolean, end:boolean):void
	{
		let val:number = 0;
		if (start) val |= this.POPUP_TIMING_BEGIN;
		if (end) val |= this.POPUP_TIMING_END;
		this._popUpTiming = val;
	}




	public touchStartEvent (event:cc.Event.EventTouch):void
	{
		//cc.log("TOUCH_START");
		//if (this.debugOutputT) this.debugOutputT.string = "TOUCH_START";
		this.onPressEvent(event);
	}

	public touchMoveEvent (event:cc.Event.EventTouch):void
	{
		//cc.log("TOUCH_MOVE");
		//if (this.debugOutputT) this.debugOutputT.string = "TOUCH_MOVE";
	}

	public touchEndEvent (event:cc.Event.EventTouch):void
	{
		//cc.log("TOUCH_END");
		//if (this.debugOutputT) this.debugOutputT.string = "TOUCH_END";
		this.onUpEvent(event);
	}

	public touchCancelEvent (event:cc.Event.EventTouch):void
	{
		//cc.log("TOUCH_CANCEL");
		//if (this.debugOutputT) this.debugOutputT.string = "TOUCH_CANCEL";
		this.onLeaveEvent(event);			//ロールアウトイベントとして処理する
	}

	public mouseEnterEvent (event:cc.Event.EventMouse):void
	{
		//cc.log("MOUSE_ENTER");
		//if (this.debugOutputM) this.debugOutputM.string = "MOUSE_ENTER";
		this._mouseUpEndColor = this.COLOR_OVER;		//MOUSE_UPのカラー用
		this.onEnterEvent(event);
	}

	public mouseLeaveEvent (event:any):void
	{
		//cc.log("MOUSE_LEAVE");
		//if (this.debugOutputM) this.debugOutputM.string = "MOUSE_LEAVE";
		this._mouseUpEndColor = this.COLOR_NORMAL;		//MOUSE_UPのカラー用
		this.onLeaveEvent(event);
	}

	public mouseDownEvent (event:any):void
	{
		//cc.log("MOUSE_DOWN");

		//if (this._disEnabledMouseEnter) return;
		//if (this.debugOutputM) this.debugOutputM.string = "MOUSE_DOWN";
		this._mouseUpEndColor = this.COLOR_OVER;		//MOUSE_UPのカラー用
		this.onPressEvent(event);
	}

	public mouseMoveEvent (event:any):void
	{
		//cc.log("MOUSE_MOVE");
		//if (this.debugOutputM) this.debugOutputM.string = "MOUSE_MOVE";
	}

	public mouseUpEvent (event:any):void
	{
		//cc.log("MOUSE_UP");
		//if (this.debugOutputM) this.debugOutputM.string = "MOUSE_UP";
		this.onUpEvent(event);
	}




	public onPressEvent (event:any):void
	{
		if (this._lock) return;

		let action = "onPress";
		if (this._lastAction == action) return;
		this._lastAction = action;
		
		/*
		//選択中の場合は色替え無し
		if (this._isSelected)
		{
			this.fillNode.color = this.COLOR_SELECTED;	//修正(1106)
			return;
		}
		*/
		if ((this._popUpTiming & this.POPUP_TIMING_BEGIN) > 0) this.popAction();		//ここでいいのか分からんけど

		if(! this._fillColorLock) this.fillNode.color = this.COLOR_PRESS;
	}

	public onUpEvent (event:any):void
	{
		if (this._lock) return;

		let action = "onUp";
		if (this._lastAction == action) return;
		this._lastAction = action;

		//this.fillNode.color = this.COLOR_NORMAL;
		if(! this._fillColorLock && ! this._isSelected) this.fillNode.color = this._mouseUpEndColor;

		if ((this._popUpTiming & this.POPUP_TIMING_END) > 0) this.popAction();
		
		// onSelectコールバック
		if(this._selectCallback)
		{
			if(! this._muteSE) SE.play(AnsButton._showAnswerButtonSE);  //GameSE.clip.showAnswerBtn
			this._selectCallback(this);
		}
	}

	public onEnterEvent (event:any):void
	{
		if (this._lock) return;

		let action = "onEnter";
		if (this._lastAction == action) return;
		this._lastAction = action;

		//選択中の場合は色替え無し
		if (this._isSelected)		
		{
			this.fillNode.color = this.COLOR_SELECTED;	//修正(1106)
			return;
		}

		if(! this._fillColorLock) this.fillNode.color = this.COLOR_OVER;
	}

	public onLeaveEvent (event:any):void
	{
		if (this._lock) return;

		let action = "onLeave";
		if (this._lastAction == action) return;
		this._lastAction = action;

		//選択中の場合は色替え無し
		if (this._isSelected)		
		{
			this.fillNode.color = this.COLOR_SELECTED;	//修正(1106)
			return;
		}

		if(! this._fillColorLock) this.fillNode.color = this.COLOR_NORMAL;
	}

	//ボタンが一瞬大きくなるアクション
	public popAction ():void
	{
		this.node.scale = this._defaultScale * 1.1;
		this.node.runAction(
			cc.sequence(
				cc.delayTime(0.1),
				cc.scaleTo(0.1, this._defaultScale)
			)
		);
	}


	//ボタンを大きくして強調
	public popBig():void
	{
		this.node.scale = this._defaultScale * 0.6;
		this.node.runAction(
			cc.scaleTo(0.3, this._defaultScale * 1.2).easing(cc.easeBackOut())
		);
	}


	//ボタンがブルブルっと震えるアクション
	public cancelShake():void
	{
		this.node.scale = this._defaultScale;
		this.node.runAction(
			cc.repeat(
				cc.sequence(
					cc.scaleTo(0.03, this._defaultScale * 1.1),
					cc.scaleTo(0.03, this._defaultScale)
				),
				6
			)
		);
	}


	public selected ():void
	{
		if(! this._fillColorLock) this.fillNode.color = this.COLOR_SELECTED;
		this._isSelected = true;
	}

	public selectCanceled ():void
	{
		if(! this._fillColorLock) this.fillNode.color = this._mouseUpEndColor;
		this._isSelected = false;
	}

	public fillColorLock (value:boolean):void
	{
		this._fillColorLock = value;
	}

	public changeSelect ():void
	{
		if (this._isSelected) this.selectCanceled();
		else this.selected();
	}

	public isSelected ():boolean
	{
		return this._isSelected;
	}

	/*
	//通常は使用しない、一部のフォーマット用
	setMouseEnterColor: function()
	{
		this._mouseUpEndColor = this.COLOR_OVER;
	},
	*/

	public disEnabledMouseEnter (value:boolean):void
	{
		this._disEnabledMouseEnter = value;
	}



	/**
	 * 枠をブルブルさせる
	 */
	public shakeFill():void
	{
		this.fillNode.runAction(
			cc.repeat(
				cc.sequence(
					cc.delayTime(0.02),
					cc.scaleTo(0.0, 1.1),
					cc.delayTime(0.02),
					cc.scaleTo(0.0, 1.0)
				),
				4
			)
		);
	}



	/**
	 * 正解、不正解、結果待ちカラーから通常時のカラーに戻す
	 */
	public normalColor():void
	{
		this.fillNode.color = this.COLOR_NORMAL;
		this._setTextColor((this._lock) ? this.COLOR_FONT_LOCK : this.COLOR_FONT_NORMAL);
	}


	/**
	 * 選択後の結果待ちカラーにする
	 */
	public resultWait ():void
	{
		this.fillNode.color = this.COLOR_RESULT_WAIT;
		this._setTextColor(this.COLOR_FONT_NORMAL);
	}


	/**
	 * 正解カラーにする
	 */
	public rightAnswer ():void
	{
		this.fillNode.color = this.COLOR_RIGHT;
		//this._outputText.setColor(this.COLOR_FONT_RIGHT);
		this._setTextColor(this.COLOR_FONT_RIGHT);
	}


	/**
	 * 不正解カラーにする
	 */
	public wrongAnswer ():void
	{
		this.fillNode.color = this.COLOR_WRONG;
		//this._outputText.setColor(this.COLOR_FONT_WRONG);
		this._setTextColor(this.COLOR_FONT_WRONG);
	}


	/**
	 * 今のカラー状態を一時保存
	 */
	public tempColor():void
	{
		this._tempTextColor = this._outputText.getColor();
		this._tempFillColor = this.fillNode.color;
	}

	
	/**
	 * 一時保存したカラーに戻す
	 */
	public backToTempColor():void
	{
		this._setTextColor(this._tempTextColor);
		this.fillNode.color = this._tempFillColor;
	}





	public rightAnswerWithSubItems ():void
	{
		this.rightAnswer();
		for(let i = 0 ; i < this.subItemNodes.length ; i ++)
		{
			this.subItemNodes[i].color = this._outputText.getColor();
		}
	}

	public wrongAnswerWithSubItems ():void
	{
		this.wrongAnswer();
		for(let i = 0 ; i < this.subItemNodes.length ; i ++)
		{
			this.subItemNodes[i].color = this._outputText.getColor();
		}
	}

	public hideAnswer ():void
	{
		if(this._outputImage != null) this._outputImage.node.active = false;
		else this._outputText.node.active = false;
	}


	//ボタン内のテキストを表示する
	public showAnswer ():void
	{
		/*
		if(this._outputImage != null) this._outputImage.node.active = true;
		else this._outputText.node.active = true;
		*/

		if (this._outputImage != null)
		{
			this._outputImage.node.active = true;
		}
		else
		{
			this._outputText.node.active = true;
			//レイアウトを調整する
			this._outputText.reLayoutText();
		}

	}

	public showButton ():void
	{
		SE.play(AnsButton._showAnswerButtonSE);  //GameSE.clip.showAnswerBtn
		this.node.runAction(
			cc.scaleTo(0.3, this._defaultScale).easing(cc.easeBackOut())
		);
	}

	public showFlush ():void
	{
		this.node.scale = this._defaultScale;
	}




	public lock (value:boolean):void
	{
		this._lock = value;

		this.shadowNode.color = (this._lock) ? this.COLOR_LINE_LOCK : this.COLOR_LINE_NORMAL;
		this._setTextColor((this._lock) ? this.COLOR_FONT_LOCK : this.COLOR_FONT_NORMAL);
	}

	protected _setTextColor(color:cc.Color):void
	{
		this._outputText.setColor(color);
		if(this._outputImage != null)
		{
			if(! this._enableOutputImageColor) this._outputImage.node.color = color;
		}
	}


	public muteSE(value:boolean):void
	{
		this._muteSE = value;
	}



	/*
	eventLock: function (value)
	{

	},
	*/

/*
	onReleaseEvent: function (event)
	{
		//this.fillNode.color = this.COLOR_PRESS;
	},

	onMoveEvent: function (event)
	{
		//this.fillNode.color = this.COLOR_PRESS;
	},

	//ボタン内でタップしたけどボタンの外で離した場合
	onCancelEvent: function (event)
	{
		this.fillNode.color = this.COLOR_NORMAL;
	},
*/


	/**
	 * BtnBoxL 用のテキストのフォーマット
	 */
	public static getTextFormat_BtnBoxL(textLen:number):STFormat
	{
		let textFormat:{};

		//1,2文字
		if (textLen <= 1) {
			textFormat =
				{
					size: 120,
					margin: 0,
					lineHeight: 160,
					rows: 1,
					columns: 2,
					horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
					verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
					color: cc.color(255, 255, 255),
				};
		}
		else if (textLen <= 2) {
			textFormat =
				{
					size: 80,
					margin: 0,
					lineHeight: 100,
					rows: 1,
					columns: 2,
					horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
					verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
					color: cc.color(255, 255, 255),
				};
		}
		else if (textLen <= 4) {
			textFormat =
				{
					size: 50,
					margin: 0,
					lineHeight: 72,
					rows: 1,
					columns: 4,
					horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
					verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
					color: cc.color(255, 255, 255),
				};
		}
		else {
			textFormat =
				{
					size: 34,
					margin: 0,
					lineHeight: 48,
					rows: 4,
					columns: 6,
					horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
					verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
					color: cc.color(255, 255, 255),
				};
		}
	
		return STFormat.create(textFormat);
	}
	

	
}



