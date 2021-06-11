//------------------------------------------------------
// このコンポーネントは子コンポーネントよりも先に読み込まないとダメ。
// ファイル名も先に来るようにすること！
//

import AnswerGuide from "../game/AnswerGuide";
import AnsButton from "./AnsButton";
import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";
import QuestionData from "../game/QuestionData";
import STFont from "../common/STFont";
import SE from "../common/SE";
import BugTracking from "../common/BugTracking";
import QuestionWindow from "../game/QuestionWindow";
import { GameSE } from "../game/GameSEComponent";
import { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AC extends cc.Component {

	@property(cc.Prefab) ansButtonPrefab: cc.Prefab = null;
	@property({type:cc.AudioClip}) ketteiSE: cc.AudioClip = null;
	@property(cc.Node) miniMaruNode: cc.Node = null;

	protected _qData: QuestionData = null;
	private _setupCallback = null;
	protected _enterCallback: ()=>void = null;
	protected _answerCallback: (answerCode:number, answer:string)=>void = null;
	protected _questionOutput: SchoolText = null;
	protected _imageSprite :cc.Sprite = null;
	protected _debugImageSpriteRectNode: cc.Node = null;
	protected _btnEnter :cc.Button = null;
	protected _btnReset :cc.Button = null;
	protected _answerGuide :AnswerGuide = null;
	protected _answerBtns :AnsButton[] = [];
	protected _answerBtnDefaultScale :number = 1.0;
	protected _isTimeUp :boolean = false;
	protected _btnPopUpWaitTime: number = 0;
	protected _commonSelectedAnswerButton: AnsButton = null;
	
	protected _needEnterButton :boolean = false;
	protected _needResetButton :boolean = false;

	private readonly _IMAGE_DEFAULT_SIZE :number = 0.5;

	private static questionOutputInitY: number = 0;
	protected static _defaultSTFont:STFont = null;
	protected static _imgLoadErrorSpriteFrame:cc.SpriteFrame = null;
	protected static _IMG_RES:any = null;

	//staticやめた
	protected readonly MARGIN_TEXT_TO_BTNS_AREA :number = 20;
	protected readonly MARGIN_TEXT_TO_IMG :number = 30;
	protected readonly MARGIN_BTNS_TO_BOTTOM :number = 60;
	protected readonly _TIME_UP_ANSWER:string = "TIME_UP";
	protected readonly _ANSWER_LONG_BTN_TEXT_LENGTH :number = 15;		//自動で2行に改行されるボタンの最大文字数(11から変更: 20210217)
	protected readonly _IMAGE_MAX_WIDTH_DEFAULT :number = 400;			//問題に表示する画像の最大幅（通常）
	protected readonly _IMAGE_MAX_WIDTH_LARGE :number = 550;			//問題に表示する画像の最大幅（大きい図版）

	public static readonly ANSWER_CODE_WRONG :number = 0;
	public static readonly ANSWER_CODE_RIGHT :number = 1;
	public static readonly ANSWER_CODE_TIME_UP :number = 2;


	


	public static setDefaultSTFont(stFont:STFont)
	{
		this._defaultSTFont = stFont;
	}

	public static setImgLoadErrorSpriteFrame(spriteFrame:cc.SpriteFrame):void
	{
		this._imgLoadErrorSpriteFrame = spriteFrame;
	}
	
	public static setImageResourses(imgRes:any):void
	{
		this._IMG_RES = imgRes;
	}
	

	/**
	 * 担当する問題フォーマットを返す
	 */
	public getRespondFormats():string[]
	{
		cc.error("抽象メソッド。オーバーライドしてください");
		return null;
	}


	/**
	 * 初期化
	 * @param questionWindow 
	 * @param questionData 
	 */
    public setup (questionWindow:QuestionWindow, questionData:QuestionData):void
    {
		this._qData = questionData;
		//this._setupCallback = setupCallback;
		//this._answerCallback = answerCallback;

		this._questionOutput = questionWindow.questionOutput;		//問題テキスト(MySchoolText)
		this._imageSprite = questionWindow.imageSprite;			//画像表示用のスプライト
		this._debugImageSpriteRectNode = questionWindow.debugImageSpriteRectNode;
        this._btnEnter = questionWindow.btnEnter;
		this._btnReset = questionWindow.btnReset;
		this._answerGuide = questionWindow.answerGuide;
        this._answerBtns = [];
		this._answerBtnDefaultScale = 1.0;
		this._btnPopUpWaitTime = 0.2;			//ボタンが出る時に入る待ち時間
		this._isTimeUp = false;

		//問題テキストの初期座標を保持
		if (AC.questionOutputInitY == 0)		//JavaScriptではundefinedだけどTypeScriptではデフォルトが0になる
		{
			AC.questionOutputInitY = this._questionOutput.node.y;
			//cc.log("Set Init Y:" + cc.MyAC.questionOutputInitY);
		}


		//問題のテキストを作成
		this._createQuestionText();
	}


	public setEnterCallback (callback:()=>void):void
	{
		this._enterCallback = callback;
	}


	public setAnswerCallback (callback:(answerCode:number, answer:string)=>void):void
	{
		this._answerCallback = callback;
	}


	//問題文を作る
	protected _createQuestionText ():void
	{
		//問題文のフォーマット
		let format:any =
		{
			size: 36,
			margin: 2+1,
			lineHeight: 64,
			rows: 4+1,		//連想問題の対応
			columns: 12+1,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_TOP,
			color: cc.color(0, 0, 0),
			yomiganaSize: 20,
			yomiganaMarginY: 2
		};

		//画像がある場合、問題テキストは3行までにする
		if(this._haveQuestionImage())
		{
			format.rows = 3;
		}

		//先に問題のテキストだけ作っとく(レイアウトが正しくなるまでラグがあるのでここでは表示できない)
		this._questionOutput.createText(this._qData.question, STFormat.create(format));

		this._questionOutput.hideText();
		this._questionOutput.node.y = AC.questionOutputInitY;		//Y座標を初期値に戻す（動かしてる可能性あり）
	}



	/**
	 * ボタン作成
	 * @param candidates 
	 * @param poss 
	 * @param btnParentNode デフォルトにする場合はundefinedで
	 * @param textFormat デフォルトにする場合はundefinedで
	 */
    protected _createAnswerButtons (candidates:string[], poss:cc.Vec2[], btnParentNode:cc.Node, textFormat:STFormat)
    {
		let prefabs:cc.Prefab[] = [];
		for(let i = 0 ; i < candidates.length ; i ++)
		{
			prefabs.push(this.ansButtonPrefab);
		}
		this.__sub_createAnswerButtons(prefabs, candidates, poss, btnParentNode, textFormat);
	}



	/**
	 * プレハブを個別に指定してボタン作成
	 * @param prefabs 
	 * @param candidates 
	 * @param poss 
	 * @param btnParentNode  デフォルトにする場合はundefinedで
	 * @param textFormat  デフォルトにする場合はundefinedで
	 */
	protected _createAnswerButtonsWithPrefabs (prefabs:cc.Prefab[], candidates:string[], poss:cc.Vec2[], btnParentNode:cc.Node, textFormat:STFormat)
	{
		this.__sub_createAnswerButtons(prefabs, candidates, poss, btnParentNode, textFormat);
	}

	
	
    private __sub_createAnswerButtons (prefabs:cc.Prefab[], candidates:string[], poss:cc.Vec2[], btnParentNode:cc.Node, textFormat:STFormat)
    {
		if (btnParentNode == undefined) btnParentNode = this.node;

		//問題のテキストを作成
		//this._createQuestionText();


		//必要な数だけボタンを作成
        for(let i = 0 ; i < candidates.length ; i ++)
		{
			if (candidates[i] == "") break;

			let ansBtnNode:cc.Node = cc.instantiate(prefabs[i]);
			let ansBtn:AnsButton = ansBtnNode.getComponent(AnsButton);

			ansBtn.setup(i, candidates[i], textFormat, AC._defaultSTFont);

			//画像ボタンの場合
			if(candidates[i].indexOf(".png") > -1 || candidates[i].indexOf(".jpg") > -1)
			{
				ansBtn.setOutputImage(AC._IMG_RES[candidates[i]], true);
			}

            if(this._answerBtnDefaultScale != 1.0) ansBtn.setDefaultScale(this._answerBtnDefaultScale);

			ansBtn.onSelectCallback((answerButton)=>
			{
				//TS化して存在しないメソッドなのが判明。これないやん！
				this._onSelect(answerButton);
			});
			ansBtn.lock(true);			//ボタンをロック
			ansBtn.hideAnswer();		//テキストは隠す

			//ansBtn.showButton();		//ボタン表示（空ボタン）

			ansBtn.node.setPosition(poss[i]);
			btnParentNode.addChild(ansBtn.node);

			this._answerBtns.push(ansBtn);
		}

	}


	






	/**
	 * 空のボタンが登場
	 * @param popupCompleteCallback 完了時のコールバック。不要ならundefinedでいい
	 */
	protected _popupAnswerButtons (popupCompleteCallback:()=>void):void
	{
		if(this._answerBtns == null)
		{
			BugTracking.notify("AnswerBtnsがnull", "AC._popupAnswerButtons()",
			{
				format: this.getRespondFormats(),
				qData: this._qData,
				//@ts-ignore
				qDatas: this._gameMain._qDatas, qNum: this._gameMain._QNum
			});
			
			return;		// ひとまずここで一旦止めた(20210411)
		}
		
		
		
		//問題ボタンを表示
		for (let i = 0; i < this._answerBtns.length; i++)
		{
			let ansBtn = this._answerBtns[i];

			ansBtn.node.runAction(
				cc.sequence(
					cc.delayTime(this._btnPopUpWaitTime + 0.04 * i),
					cc.callFunc(() =>
					{
						//ボタン表示（空ボタン）
						ansBtn.showButton();
					})
				)
			);
		}


		//決定ボタンが必要な場合表示
		if (this._needEnterButton)
		{
			this._btnEnter.node.scale = 0;
			this._btnEnter.node.active = true;
			this._btnEnter.node.runAction(
				cc.sequence(
					cc.delayTime(this._answerBtns.length * 0.1),
					cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
				)
			);
		}


		//リセットボタンが必要な場合表示
		if (this._needResetButton)
		{
			this._btnReset.node.scale = 0;
			this._btnReset.node.active = true;
			this._btnReset.node.runAction(
				cc.sequence(
					cc.delayTime(this._answerBtns.length * 0.1),
					cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
				)
			);
		}

		//表示完了するまでの時間待機してコールバック
		if (popupCompleteCallback)
		{
			let duration = 0.2 + 0.04 * this._answerBtns.length + 0.3;		//0.3はボタンのscaleToの時間であとはdelayTimeの分

			this.node.runAction(
				cc.sequence(
					cc.delayTime(duration),
					cc.callFunc(() => { popupCompleteCallback(); })
				)
			);
		}

	}



	//------------------------------------------------------------------------------
	//
	// ボタン内のテキストが表示され、ロック解除
	//
	//------------------------------------------------------------------------------
	protected _showAnswerButtonsTexts ():void
	{
		//各問題ボタンの文字を表示してロック解除
		for (let i = 0; i < this._answerBtns.length; i++)
		{
			let ansBtn = this._answerBtns[i];
			ansBtn.showAnswer();
			ansBtn.lock(false);
		}
	}



	//------------------------------------------------------------------------------
	//
	// 問題のテキストが表示開始
	//
	//------------------------------------------------------------------------------
	protected _showQuestion (callback:()=>void):void
	{
		//問題を１文字ずつ表示
		this._questionOutput.showText(() =>
		{
			//表示完了
			if (callback) callback();
		});
	}


	//問題の表示完了
	protected _onCompleteQuestionShow ():void
	{
		// ボタン内のテキストが表示され、ロック解除
		this._showAnswerButtonsTexts();

	}



	//問題画像の表示
	protected _showQImage ():void
	{
		//画像を表示
		if (this._haveQuestionImage())
		{
			let spriteFrame = AC._IMG_RES[this._qData.question_image];

			if(spriteFrame == undefined)
			{
				cc.error("表示する画像がありません。_showQuestionImageAndGetBottomY()が呼ばれていない可能性があります");
				return;
			}



			let imgSize = spriteFrame._originalSize;

			//cc.log("画像のサイズ:");
			//cc.log(imgSize);

			this._imageSprite.spriteFrame = spriteFrame;
			//this._imageSprite.node.width = imgSize.width * this._IMAGE_DEFAULT_SIZE;
			//this._imageSprite.node.height = imgSize.height * this._IMAGE_DEFAULT_SIZE;

			this._imageSprite.node.active = true;
			this._imageSprite.node.scale = 0.5;
			this._imageSprite.node.runAction(
				cc.scaleTo(0.2, 1.0).easing(cc.easeBackOut())
			);
		}
	}


	//画像があるか返す
	protected _haveQuestionImage ():boolean
	{
		return (this._qData.question_image != "" && this._qData.question_image != null);
	}



	//------------------------------------------------------------------------------
	//
	// 出題パターンA　（まずボタンが空で登場　→　問題の表示開始と同時にボタンの内容も表示）
	//
	//------------------------------------------------------------------------------
	protected _startPatternA():void
	{
		//もう使ってない
	}


	//------------------------------------------------------------------------------
	//
	// 問題文のフォント全体の高さを返す
	//
	//------------------------------------------------------------------------------
	protected _getQuestionTextAreaHeight ():number
	{
		return this._questionOutput.getContentsHeight();		//テキストの高さ
	}


	/**
	 * 問題文の底のY座標を返す
	 */
	protected _getQuestionTextAreaBottom ():number
	{
		//適当。550は画面下から中央までの高さ、400はquestionBoardのy座標。テキストの底のy座標
		let pos = this._ccUtilConvertNodeSpaceToNodeSpace(this._questionOutput.node.parent, this.node, cc.v2(0, this._questionOutput.node.y - this._questionOutput.getContentsHeight()));
		return pos.y;

		//return 550 + 400 + this._questionOutput.node.y - this._questionOutput.getContentsHeight();
	}

/*
	_getQuestionTextAreaTop: function ()
	{
		let pos = this._ccUtilConvertNodeSpaceToNodeSpace(this._questionOutput.node.parent, this.node, cc.v2(0, this._questionOutput.node.y));
		return pos.y;
	},

	_getQuestionTextAreaInitTop: function ()
	{
		let pos = this._ccUtilConvertNodeSpaceToNodeSpace(this._questionOutput.node.parent, this.node, cc.v2(0, cc.MyAC.questionOutputInitY));
		return pos.y;
	},
*/


	// Utilsクラス作ってそっちに置いたほうがいいかも
	protected _ccUtilConvertNodeSpaceToNodeSpace (fromNode:cc.Node, toNode:cc.Node, fromLocalPos:cc.Vec2):cc.Vec2
	{
		let wPos = fromNode.convertToWorldSpaceAR(fromLocalPos);
		let lPos = toNode.convertToNodeSpaceAR(wPos);
		return lPos;
	}


	
	/**
	 * 画像を問題文の下に並ぶように表示し、画像の底のY座標を返す
	 * @param questionTextBottom 
	 */
	protected _showQuestionImageAndGetBottomY (questionTextBottom:number):number
	{
		let spriteFrame = AC._IMG_RES[this._qData.question_image];

		if(spriteFrame == undefined)
		{
			cc.error("読み込みに失敗した画像を呼び出し");
			AC._IMG_RES[this._qData.question_image] = AC._imgLoadErrorSpriteFrame;
			spriteFrame = AC._IMG_RES[this._qData.question_image];
		}

		let imgSize = spriteFrame._originalSize;

		//テキストと画像の余白(問題テキスト無しなら間隔なし)
		let imgMargin = (this._questionOutput.getContentsHeight() == 0) ? 0 : this.MARGIN_TEXT_TO_IMG;
		questionTextBottom -= imgMargin;

		//新しいの
		let wPos = this.node.convertToWorldSpaceAR(cc.v2(0, questionTextBottom));
		let lPos = this._questionOutput.node.parent.convertToNodeSpaceAR(wPos);

		//this._imageSprite.node.width = imgSize.width * this._IMAGE_DEFAULT_SIZE;		//半分サイズにする
		//this._imageSprite.node.height = imgSize.height * this._IMAGE_DEFAULT_SIZE;		//半分サイズにする

		//画像サイズを設定
		let largeZuhan:boolean = false;
		if(this._qData.zuhan_size == "large") largeZuhan = true;

		let imageMaxWidth:number = (largeZuhan) ? this._IMAGE_MAX_WIDTH_LARGE : this._IMAGE_MAX_WIDTH_DEFAULT;
		let scale = imageMaxWidth / imgSize.width;
		if(scale > 1 && ! largeZuhan) scale = 1;

		this._imageSprite.node.width = imgSize.width * scale;
		this._imageSprite.node.height = imgSize.height * scale;

		if(this._debugImageSpriteRectNode.active)
		{
			this._debugImageSpriteRectNode.width = this._imageSprite.node.width;
			this._debugImageSpriteRectNode.height = this._imageSprite.node.height;
			this._debugImageSpriteRectNode.color = (largeZuhan) ? cc.color(255, 0, 0) : cc.color(0, 0, 255);
		}


		//this._imageSprite.node.y = lPos.y - imgSize.height / 2;
		this._imageSprite.node.y = lPos.y - this._imageSprite.node.height / 2;

		//今まで
		//this._imageSprite.node.y = this._questionOutput.node.y - this._getQuestionTextAreaHeight() - imgSize.height / 2 - imgMargin;

		//questionTextBottom -= imgSize.height;
		questionTextBottom -= this._imageSprite.node.height;

		return questionTextBottom;
	}




	/**
	 * 問題の開始
	 * @param callback 
	 */
    public startQuestion (callback:()=>void):void
	{
		//一体型独自の表示方法
		this._btnPopUpWaitTime = 0;

		//問題の表示開始
		this._showQuestion(() =>
		{
			//表示完了時

			//画像の表示
			this._showQImage();

			//問題ボタンが飛び出す（空ボタン）
			this._popupAnswerButtons(undefined);

			//問題ボタンのテキストを表示してロック解除
			this._showAnswerButtonsTexts();

			//問題開始、タイマー動作開始
			callback();
		});
	}
	

	/**
	 * 回答ボタンを押した
	 * @param answerButton 
	 */
	protected _onSelect (answerButton:AnsButton):void
	{

	}


	protected _answerWait(callback:()=>void):void
	{
		SE.play(this.ketteiSE);
		
		let time = 1.0;
		this.node.runAction(
			cc.sequence(
				cc.delayTime(time),
				cc.callFunc(()=>
				{
					callback();
				})
			)
		);
	}


	protected _showAnswer():void
	{

	}



    public timeUp ():void
    {
        this._isTimeUp = true;
    }
    

    public removeComponent ():void
	{
		for(let i = 0 ; i < this._answerBtns.length ; i ++)
		{
			this._answerBtns[i].node.removeFromParent(true);
        }
        
		this._answerBtns = null;
    }


    protected _allButtonsLock (value:boolean):void
    {
        for (let i = 0; i < this._answerBtns.length; i++)
		{
			this._answerBtns[i].lock(value);
		}
	}


	public onPressEnterButton ():void
	{
		//抽象メソッド
	}

	public onPressResetButton ():void
	{
		//抽象メソッド
	}


	/**
	 * ボタン１つずつに正解・不正解の演出を入れる(AnsButton用)
	 */
	protected _answerMiniCheck(target:cc.Node, delayTime:number, correct:boolean, effectLocalPosition:cc.Vec2, wrongAngStart:number, wrongAngEnd:number):void
	{
		this._answerMiniCheckProp({ type:0, component:target.getComponent(AnsButton) }, target, delayTime, correct, effectLocalPosition, wrongAngStart, wrongAngEnd);
	}

	/**
	 * ボタン１つずつに正解・不正解の演出を入れる(cc.Label用)
	 */
	 protected _answerMiniCheckWithLabel(target:cc.Node, label:cc.Label, delayTime:number, correct:boolean, effectLocalPosition:cc.Vec2, wrongAngStart:number, wrongAngEnd:number):void
	 {
		 this._answerMiniCheckProp({ type:1, component:label }, target, delayTime, correct, effectLocalPosition, wrongAngStart, wrongAngEnd);
	 }


	/**
	 * ボタン１つずつに正解・不正解の演出を入れる
	 * @param prop 表示タイプ
	 * @param target 演出するNode
	 * @param delayTime 待ち時間
	 * @param correct 正解、不正解
	 * @param effectLocalPosition 〇エフェクトの表示位置
	 * @param wrongAngStart 不正解時のボタンの斜め角度（最初）
	 * @param wrongAngEnd 不正解時のボタンの斜め角度（最後）
	 */
	private _answerMiniCheckProp(prop:{ type:number, component:any }, target:cc.Node, delayTime:number, correct:boolean, effectLocalPosition:cc.Vec2, wrongAngStart:number, wrongAngEnd:number):void
	{
		const TYPE_ANS_BUTTON:number = 0;
		const TYPE_LABEL:number = 1;
		
		let answerBtn:AnsButton = (prop.type == TYPE_ANS_BUTTON) ? prop.component : null;
		let label:cc.Label = (prop.type == TYPE_LABEL) ? prop.component : null;


		let scale:number = target.scale;
		
		if(prop.type == TYPE_ANS_BUTTON) answerBtn.tempColor();

		if(correct)
		{
			cc.tween(target)
			.delay(delayTime)
			.to(0.0, { scale:0.3 * scale })
			.call(()=>
			{
				if(prop.type == TYPE_ANS_BUTTON) answerBtn.rightAnswer();
				else if(prop.type == TYPE_LABEL) label.node.color = cc.color(50,50,255);		//正解カラー
				target.zIndex = 1;
				
				//正解音
				SE.play(GameSE.clip.pinpon);

				//ミニ　〇エフェクト
				let effect:cc.Node = this.miniMaruNode;

				//★ effect nullエラーが出た。調査中
				if(effect == null)
				{
					BugTracking.notify("〇エフェクトnullエラー", "AC._answerMiniCheckProp",
					{
						msg:"〇エフェクトnullエラー:" + this._qData.format,
						qData: this._qData
					});
				}
				else
				{
					let wPos:cc.Vec2 = target.convertToWorldSpaceAR(cc.v2(0,0));
					let lPos:cc.Vec2 = effect.parent.convertToNodeSpaceAR(wPos);
					
					effect.stopAllActions();
					effect.scale = 0.5;
					effect.x = lPos.x + effectLocalPosition.x;
					effect.y = lPos.y + effectLocalPosition.y;
					effect.active = true;
					effect.runAction(
						cc.sequence(
							cc.scaleTo(0.3, 1.5).easing(cc.easeBackOut()),
							cc.scaleTo(0.0, 0.0)
						)
					);
				}
			})
			.to(0.2, { scale:scale * 1.4 }, { easing:EasingName.backOut })
			.delay(0.2)
			.to(0.1, { scale:scale }, { easing:EasingName.sineInOut })
			.call(()=>
			{
				if(prop.type == TYPE_ANS_BUTTON) answerBtn.backToTempColor();
				else if(prop.type == TYPE_LABEL) label.node.color = cc.color(0,0,0);		//カラー戻す
				target.zIndex = 0;
			})
			.start();
		}
		else
		{
			cc.tween(target)
			.delay(delayTime)
			.call(()=>
			{
				if(prop.type == TYPE_ANS_BUTTON) answerBtn.wrongAnswer();
				else if(prop.type == TYPE_LABEL) label.node.color = cc.color(255,0,0);		//不正解カラー
				target.zIndex = 1;

				//不正解音
				SE.play(GameSE.clip.batsu);
			})
			.to(0.0, { angle:wrongAngStart, scale:scale * 1.4 })
			.delay(0.4)
			.to(0.1, { angle:wrongAngEnd, scale:scale })
			.call(()=>
			{
				if(prop.type == TYPE_ANS_BUTTON) answerBtn.backToTempColor();
				else if(prop.type == TYPE_LABEL) label.node.color = cc.color(0,0,0);		//カラー戻す
				target.zIndex = 0;
			})
			.start();
		}
	}

	protected _answerMiniCheckEnd(target:cc.Node):void
	{
		target.angle = 0;
	}


	

    callMe ()
    {
        cc.log("CALL AC");
    }

}



