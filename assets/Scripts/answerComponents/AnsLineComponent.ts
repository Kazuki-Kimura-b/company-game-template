//---------------------------------------
// 線つなぎ
//---------------------------------------

import AC from "./AC";
import AnsButton from "./AnsButton";
import StaticData from "../StaticData";
import GameMain from "../game/GameMain";
import QuestionData from "../game/QuestionData";
import SE from "../common/SE";
import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";
import QuestionWindow from "../game/QuestionWindow";


class LineItem
{
	ID :number = -1;
	ansButton :AnsButton = null;
	output:SchoolText = null;
	isLeft:boolean = false;
	tipPos:cc.Vec2 = null;

	pairItem :LineItem = null;
	pairLine :cc.Node = null;
	
	constructor(ID:number, ansButton:AnsButton, output:SchoolText, isLeft:boolean, tipPos:cc.Vec2)
	{
		this.ID = ID;
		this.ansButton = ansButton;
		this.output = output;
		this.isLeft = isLeft;
		this.tipPos = tipPos;
	}
}


const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsLineComponent extends AC {

	@property(cc.Node) btnsParentNode: cc.Node = null;
	@property(cc.Node) pairLineNodes: cc.Node[] = [];
	@property(cc.Node) lineNode: cc.Node = null;
	@property(cc.Node) touchEventerNode: cc.Node = null;
	@property(cc.Node) lineBaseNode: cc.Node = null;
	@property({type:cc.AudioClip}) seSelButtonTapped:cc.AudioClip = null;	//ボタン選択時
	@property({type:cc.AudioClip}) seSelButtonCanceled:cc.AudioClip = null;	//ボタンキャンセル時
	@property({type:cc.AudioClip}) seConnected:cc.AudioClip = null;			//繋いだ時の音

	private _allItems :LineItem[] = [];
	private _selectItem :LineItem = null;			//スワイプの線つなぎで最初に選択したボタン
	private _interactable :boolean = true;
	private _clickSelectedItem:LineItem = null;		//クリックで選択したボタン
	private _isCancelAction :boolean = false;			//ボタンを押したのはキャンセルするための動作かどうか

	
	public getRespondFormats():string[]
	{
		return ["ペアリング"];
	}



	setup (questionWindow:QuestionWindow, questionData:QuestionData)
	{
		/*
		try
		{
			questionData.shuffleSemicolonOptions();
		}
		catch(e)
		{
			console.log("QuestionData.shuffleSemicolonOptions()が見つかりませんでした。");
			console.log("questionData:");
			console.log(questionData);
		}
		*/
		
		super.setup(questionWindow, questionData);		//スーパークラスのsetup

		this._needEnterButton = true;
        this._needResetButton = true;
		
		let candidates = [];
		let poss = [];
		
		let candiL = questionData.option1.split(StaticData.QUESTION_SPLIT_WORD);
		let candiR = questionData.option2.split(StaticData.QUESTION_SPLIT_WORD);

		//仮一体型

		//テキストの底のy座標
		let questionTextBottom = this._getQuestionTextAreaBottom();

		//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
		if (this._haveQuestionImage())
		{
			questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);
		}

		//ボタンの表示位置(Y)。テキストの底から余白とボタンの高さ半分を下げた位置
		questionTextBottom -= this.lineBaseNode.height / 2 + this.MARGIN_TEXT_TO_BTNS_AREA;

		this.lineBaseNode.y = questionTextBottom;
		this.lineBaseNode.scale = 0;


		let intervalY = 116;
		let startY = questionTextBottom + intervalY;
		let posX = -190;
		
		for(let i = 0 ; i < candiL.length ; i ++)
		{
			candidates.push(candiL[i]);
			candidates.push(candiR[i]);

			poss.push(cc.v2(posX, startY - intervalY * i));
			poss.push(cc.v2(-posX, startY - intervalY * i));
		}

		//文字数を確認して長い場合は小さくする
		let maxLen:number = 0;

		for(let i:number = 0 ; i < candidates.length ; i ++)
		{
			let len:number = SchoolText.getTextString(candidates[i]).textStr.length;
			if(maxLen < len) maxLen = len;
		}

		let format:STFormat = undefined;
		
		if(maxLen <= 5)
		{
			format = undefined;		//デフォルトのサイズ
		}
		else
		{
			//小さめのサイズ（8文字まで想定）
			format = STFormat.create({
				size: 24,
				margin: 2,
				lineHeight: 24,
				rows: 1,
				columns: 12,
				horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
				verticalAlign:SchoolText.VERTICAL_ALIGN_CENTER,
				color: cc.color(0, 0, 0),
			});
		}


		this._btnEnter.interactable = false;
		this._btnReset.interactable = false;


		//回答ガイド、ボタン1つ目と2つ目の間に表示
		this._answerGuide.setY(this.node, startY - intervalY * 0.5);



		questionTextBottom -= this.lineBaseNode.height / 2 + this.MARGIN_BTNS_TO_BOTTOM;
		questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);


		//問題ボタンを作成
		this._createAnswerButtons(candidates, poss, this.btnsParentNode, format);


		
		//-------------
		
		this._selectItem = null;
		
		this.touchEventerNode.on(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
		this.touchEventerNode.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
		this.touchEventerNode.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
		this.touchEventerNode.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

		let btns:AnsButton[] = this._answerBtns;
		let outputs:SchoolText[] = [];
		for(let i = 0; i < btns.length ; i ++)
		{
			btns[i].setPopUpTiming(false, false);		//ボタン押した時と離した時に一瞬拡大しない（コンポーネント側からコントロールしたい）
			btns[i].muteSE(true);						//ボタン選択、決定音はミュートにする

			//outputs[i] = btns[i].output;
			outputs[i] = btns[i].getOutputText();
		}

		

		this._allItems = [];
		for(let i = 0 ; i < btns.length ; i ++)
		{
			let isLeft = (btns[i].node.x < 0);
			let dotPosX = (isLeft) ? btns[i].fillNode.width * 0.5 - 2 : btns[i].fillNode.width * -0.5 + 2;

			btns[i].subItemNodes[0].x = dotPosX;

			let tipPos = btns[i].node.getPosition();
			tipPos.x += dotPosX;
			
			this._allItems[i] = new LineItem(i, btns[i], outputs[i], isLeft, tipPos);
		}

		for(let i = 0 ; i < this.pairLineNodes.length ; i ++)
		{
			this.pairLineNodes[i].active = false;
		}
		this.lineNode.active = false;

		this._interactable = true;

	}


	//オーバーライド
	startQuestion (callback)
	{
		//一体型独自の表示方法
		this._btnPopUpWaitTime = 0.3;

		//問題の表示開始
		this._showQuestion(() =>
		{
			//表示完了時

			//画像の表示
			this._showQImage();

			//線つなぎ背景が飛び出す
			this.lineBaseNode.runAction(
				cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
			);

			//問題ボタンが飛び出す（空ボタン）
			this._popupAnswerButtons(undefined);

			//問題ボタンのテキストを表示してロック解除
			this._showAnswerButtonsTexts();

			//問題開始、タイマー動作開始
			callback();
		});
	}



	/*
	//通常のボタンのように押した場合、選択状態にする
	// これ _onTouchEndのあとに来るなあ・・・
	_onSelect (answerButton)
	{
		
	}
	*/

	_onTouchBegin (event:cc.Event.EventTouch)
	{
		if(! this._interactable) return;
		
		let item = this._getItemAtTouchEvent(event);
		cc.log("選択！" + item);

		if(item == null) return;

		//既にペア成立中の場合は解除
		if(item.pairItem != null)
		{
			if(this._clickSelectedItem)
			{
				this._clickSelectedItem = null;		//これで何とかなったけど最適解なのか疑問
			}
			
			let pair = item.pairItem;
			item.pairItem = null;
			pair.pairItem = null;
			item.pairLine.active = false;
			item.pairLine = null;
			pair.pairLine = null;
			this._resetAllButtonsColor();

			if(this._isNotSelectAll())
			{
				this._btnReset.interactable = false;
			}
			
			this._btnEnter.interactable = false;
			item.ansButton.selectCanceled();

			this._isCancelAction = true;		//このtouchBeginはキャンセルするために実行した
		}
		else
		{
			this._isCancelAction = false;

			//クリック選択した1つ目のボタンをもう一度押した（このあとキャンセル）
			if(item == this._clickSelectedItem)
			{

			}
			else
			{
				item.ansButton.selected();		//選択中カラー
				SE.play(this.seSelButtonTapped);			//ボタンを選択した音
			}
		}

		//cc.log("press:" + item.ID + " / isLeft:" + item.isLeft);
		this._selectItem = item;
		//item.ansButton.selected();		//選択中カラー

		//一瞬大きくなって選択音が鳴る
		item.ansButton.popAction();
	}


	_onTouchMove(event:cc.Event.EventTouch)
	{
		if(! this._interactable) return;
		
		this._resetAllButtonsColor();

		if(this._selectItem == null) return;
		
		//選択中ボタンからタップ位置までラインを引く
		this._drawLineToTouch(event);
		
		let item = this._getItemAtTouchEvent(event);

		//１つ目のボタンをクリックで選択していた場合キャンセルになる
		if(item == null)
		{
			if(this._clickSelectedItem != null)
			{
				this._clickSelectedItem.ansButton.selectCanceled();
				this._clickSelectedItem = null;
			}
		}

		if(item == null) return;
		else if(item == this._selectItem) return;		//今選択したアイテムなので無視
		else if(item.isLeft == this._selectItem.isLeft) return;		//同じグループなので無視
		else if(item.pairItem != null) return;				//すでにペアが成立してるので無視

		//cc.log("rollover:" + item.ID + " / isLeft:" + item.isLeft);
		//item.ansButton.selected();		//決定カラー

		//2つのボタンを繋ぐラインを引き直す
		this._drawLine(this._selectItem.tipPos, item.tipPos, undefined);
	}


	_onTouchEnd (event:cc.Event.EventTouch)
	{
		if(! this._interactable) return;
		
		//最初に選択したアイテム(nullの可能性あり)
		let itemA = this._selectItem;
		
		//指を離した所にあるアイテム
		let itemB = this._getItemAtTouchEvent(event);

		//結局何も選択してないので終わり
		if (itemA == null && itemB == null)
		{
			//1つ目クリック選択中ならキャンセル
			if(this._clickSelectedItem != null)
			{
				this._clickSelectedItem.ansButton.selectCanceled();
				this._clickSelectedItem.ansButton.cancelShake();
				this._clickSelectedItem = null;
			}
			return;
		}

		//ボタンをクリック（普通の動作）
		if (itemA == itemB)
		{
			cc.log("CLICK!");

			this._selectItem = null;
			//itemA.ansButton.selected();

			//touchBeginはキャンセル動作だったのでキャンセルする
			if(this._isCancelAction)
			{
				itemA.ansButton.cancelShake();		//ブルブルっとなる
				SE.play(this.seSelButtonCanceled);		//キャンセル音
				//this._clickSelectedItem.ansButton.selectCanceled();
				return;
			}

			//選択中にする
			if(this._clickSelectedItem == null)
			{
				this._clickSelectedItem = itemA;

				//選択中表示
				itemA.ansButton.selected();

				return;
			}
			
			//ペアなら線を引く
			itemA = this._clickSelectedItem;
			this._clickSelectedItem = null;
			
			//同じボタンを２回クリックしたのでキャンセル
			if(itemA == itemB)
			{
				itemA.ansButton.cancelShake();		//ブルブルっとなる
				itemA.ansButton.selectCanceled();
				SE.play(this.seSelButtonCanceled);			//キャンセル音
				return;
			}

			this._drawLine(itemA.tipPos, itemB.tipPos, undefined);		//ラインを引く

			//return;
		}

		
		//一旦選択を解除する
		this._selectItem = null;
		this._resetAllButtonsColor();
		this.lineNode.active = false;
		this._btnEnter.interactable = false;

		//何も選択せずにクリックして離した場合
		if (itemA == null || itemB == null) return;
		//どちらかが既にペアを持ってる（itemAはありえないと思うのでitemBが対象）
		else if (itemA.pairItem != null || itemB.pairItem != null)
		{
			//既にペア中のボタンなので今回の繋ぐ処理はキャンセル

			SE.play(this.seSelButtonCanceled);			//キャンセル音
			
			/*
			this.node.runAction(
				cc.sequence(
					cc.delayTime(0.1),
					cc.callFunc(() => {
						itemB.ansButton.selected();		//ここでポップアップしちゃうのがダメ
					})
				)
			);
			*/
			return;
		}
		else if(itemA.isLeft == itemB.isLeft) return;

		//ペアが成立した
		let line = this._getFreeLine();

		itemA.pairItem = itemB;
		itemB.pairItem = itemA;

		itemA.ansButton.selected();
		itemB.ansButton.selected();
		//itemA.ansButton.disEnabledMouseEnter(true);
		//itemB.ansButton.disEnabledMouseEnter(true);

		itemA.pairLine = line;
		itemB.pairLine = line;

		line.active = true;
		line.setPosition(this.lineNode.getPosition());
		line.width = this.lineNode.width;
		line.angle = this.lineNode.angle;

		this.node.runAction(
			cc.sequence(
				cc.delayTime(0.1),
				cc.callFunc(()=>
				{
					//itemA.ansButton.selected();
					itemB.ansButton.selected();
					itemB.ansButton.popAction();
				})
			)
		);

		//ペア音
		SE.play(this.seConnected);

		//リセットボタン有効
		this._btnReset.interactable = true;

		//全てペアを作ったら決定ボタンを有効に
		for(let i = 0 ; i < this._allItems.length ; i ++)
		{
			if(this._allItems[i].pairItem == null) return;
		}
		this._btnEnter.interactable = true;

	}


	_isNotSelectAll()
	{
		for(let i = 0 ; i < this._allItems.length ; i ++)
		{
			if(this._allItems[i].pairItem != null) return false;
		}
		return true;
	}


	_getFreeLine()
	{
		for(let i = 0 ; i < this.pairLineNodes.length ; i ++)
		{
			if(this.pairLineNodes[i].active) continue;
			return this.pairLineNodes[i];
		}
		return null;
	}


	// 決定済みでないボタン全ての色を戻す
	_resetAllButtonsColor()
	{
		for(let i = 0 ; i < this._allItems.length ; i ++)
		{
			let item:LineItem = this._allItems[i];
			if(this._selectItem == item) continue;		//選択中
			else if(item.pairItem != null) continue;			//決定済み
			else if(this._clickSelectedItem == item) continue;		//クリック選択中
			
			item.ansButton.selectCanceled();
		}
	}


	/**
	 * 指のある位置のアイテムを返す
	 * @param event 
	 */
	_getItemAtTouchEvent (event:cc.Event.EventTouch):LineItem
	{
		let touches = event.getTouches();
		let touchLoc = touches[0].getLocation();
		return this._getItemAtPos(touchLoc);
	}

	_getItemAtPos (touchLoc:cc.Vec2):LineItem
	{
		for(let i = 0 ; i < this._allItems.length ; i ++)
		{
			let item:LineItem = this._allItems[i];
			let ansBtn:AnsButton = item.ansButton;
			let node:cc.Node = ansBtn.node;
			
			let lPos:cc.Vec2 = node.convertToNodeSpaceAR(touchLoc);
			if(lPos.x > -ansBtn.fillNode.width / 2 && lPos.x < ansBtn.fillNode.width / 2 && lPos.y > -ansBtn.fillNode.height / 2 && lPos.y < ansBtn.fillNode.height / 2)
			{
				return item;
			}
		}
		return null;
	}


	_getItemAtAnswerButton (answerButton)
	{
		for(let i = 0 ; i < this._allItems.length ; i ++)
		{
			let item = this._allItems[i];
			if(answerButton == item.ansButton) return item;
		}
		return null;
	}


	_drawLineToTouch (event)
	{
		let touches = event.getTouches();
		let touchLoc = touches[0].getLocation();
		let endPos = this.node.convertToNodeSpaceAR(touchLoc);
		
		let startPos = this._selectItem.tipPos;

		let saPos = endPos.sub(startPos);

		if((saPos.x > 0 && ! this._selectItem.isLeft) || (saPos.x < 0 && this._selectItem.isLeft))
		{
			this.lineNode.active = false;
			return;
		}

		this._drawLine(startPos, endPos, undefined);
	}


	/**
	 * 指定した２点間に線を引く
	 * @param startPos 
	 * @param endPos 
	 * @param lNode デフォルトの場合はundefinedで
	 */
	private _drawLine (startPos:cc.Vec2, endPos:cc.Vec2, lNode:cc.Node):void
	{
		if(lNode == undefined) lNode = this.lineNode;
		
		let saPos = endPos.sub(startPos);
		let distance = Math.sqrt(saPos.x * saPos.x + saPos.y * saPos.y);

		lNode.active = true;
		lNode.setPosition(startPos);
		lNode.width = distance;
		let rad = Math.atan2(saPos.y, saPos.x);
		lNode.angle = rad * 180 / Math.PI;
	}


	onPressEnterButton ()
	{
		this._preEnter();

		//待ち時間
		this._answerWait(()=>
		{
			//結果表示
			this._showAnswer();
		});
	}


	private _preEnter():void
	{
		for(let i = 0 ; i < this._answerBtns.length ; i ++)
		{
			this._answerBtns[i].lock(true);
		}
		
		this._btnEnter.interactable = false;
		this._btnReset.interactable = false;
		this._interactable = false;

		this.touchEventerNode.off(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
		this.touchEventerNode.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
		this.touchEventerNode.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
		this.touchEventerNode.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);


		this._enterCallback();
	}



	protected _answerWait(callback:()=>void):void
	{
		let answers:string[] = this._qData.correct_answer.split(StaticData.QUESTION_SPLIT_WORD);
		
		//1つずつ入力欄を見ていく。正解すれば一瞬拡大、間違うと斜めになる
		const BaseTime:number = 1.0;

		for(let i:number = 0 ; i < this._allItems.length ; i += 2)
		{
			let item:LineItem = this._allItems[i];
			let pairWord:string = item.output.getText() + "=" + item.pairItem.output.getText();
			let correct:boolean = (answers.indexOf(pairWord) > -1);
			let index:number = i / 2;

			//1文字ずつ正解・不正解アクション
			this._answerMiniCheck(item.pairItem.output.node.parent, 1.0 * index + BaseTime, correct, cc.v2(0,0), -15, -5);		//右側（丸エフェクト無し）
			this._answerMiniCheck(item.output.node.parent, 1.0 * index + BaseTime, correct, cc.v2(10,60), -15, -5);				//左側（丸エフェクトあり）
		}

		cc.tween({})
		.delay(0.5)
		.call(()=>
		{
			SE.play(this.ketteiSE);
		})
		.delay((this._allItems.length / 2) * 1.0 + BaseTime - 0.5)
		.call(()=>
		{
			callback();
		})
		.start();
	}



	_showAnswer()
	{
		let correctAnswer:boolean = true;

		let answers:string[] = this._qData.correct_answer.split(StaticData.QUESTION_SPLIT_WORD);
		let wrongList:LineItem[] = [];
		let sendAnswer:string = "";

		for(let i:number = 0 ; i < this._allItems.length ; i ++)
		{
			let item:LineItem = this._allItems[i];

			if(! item.isLeft) continue;

			//let pairWord = item.output.string + "=" + item.pairItem.output.string;
			let pairWord:string = item.output.getText() + "=" + item.pairItem.output.getText();
			cc.log(pairWord);

			sendAnswer += pairWord + StaticData.QUESTION_SPLIT_WORD;

			if(answers.indexOf(pairWord) == -1)
			{
				correctAnswer = false;
				wrongList.push(item);
			}
		}

		if(sendAnswer.length > 0) sendAnswer = sendAnswer.substr(0, sendAnswer.length - 1);
		

		//タイムアップ時
		if(this._isTimeUp)
		{
			correctAnswer = false;
			
			this._preEnter();
		}

		cc.log("結果:" + correctAnswer);

		if (correctAnswer)
		{
			for(let i = 0 ; i < this._answerBtns.length ; i ++)
			{
				this._answerBtns[i].rightAnswer();
				this._answerBtns[i].popBig();
			}
			
			this._answerCallback(AC.ANSWER_CODE_RIGHT, sendAnswer);		//1:正解
		}
		else
		{
			//正解だったラインは消して間違っていたラインを正しく引き直す
			//for(let i = 0 ; i < this.pairLineNodes.length ; i ++)
			//{
			//	this.pairLineNodes[i].active = false;
			//}
			cc.log("正しいペアに修正");

			//一旦色を全て戻す
			for(let i:number = 0 ; i < this._allItems.length ; i ++)
			{
				this._allItems[i].ansButton.selectCanceled();
				this._allItems[i].ansButton.node.angle = 0;
			}

			for(let i:number = 0 ; i < wrongList.length ; i ++)
			{
				//正しいペアに修正
				let foundPair = false;
				

				for(let k:number = 0 ; k < answers.length ; k ++)
				{
					let ans = answers[k].split("=");
					//if(wrongList[i].output.string == ans[0])
					if(wrongList[i].output.getText() == ans[0])
					{
						for(let m = 0 ; m < this._allItems.length ; m ++)
						{
							//正解のペア
							//if(! this._allItems[m].isLeft && this._allItems[m].output.string == ans[1])
							if(! this._allItems[m].isLeft && this._allItems[m].output.getText() == ans[1])
							{
								wrongList[i].pairItem = this._allItems[m];
								foundPair = true;
								break;
							}
						}
						if(foundPair) break;
					}
				}

				this._drawLine(wrongList[i].tipPos, wrongList[i].pairItem.tipPos, wrongList[i].pairLine);
				wrongList[i].ansButton.wrongAnswer();
				wrongList[i].ansButton.popBig();
				wrongList[i].pairItem.ansButton.wrongAnswer();
				wrongList[i].pairItem.ansButton.popBig();
			}

			this._answerCallback(this._isTimeUp ? AC.ANSWER_CODE_TIME_UP : AC.ANSWER_CODE_WRONG, sendAnswer);		//0:間違い / 2:時間切れ
		}
	}


	onPressResetButton ()
	{
		this._btnEnter.interactable = false;
		this._btnReset.interactable = false;

		for(let i = 0 ; i < this._allItems.length ; i ++)
		{
			let item = this._allItems[i];
			item.pairItem = null;
			item.pairLine = null;
			item.ansButton.selectCanceled();
		}

		for(let i = 0 ; i < this.pairLineNodes.length ; i ++)
		{
			this.pairLineNodes[i].active = false;
		}
		this.lineNode.active = false;

	}


	timeUp ()
    {
		super.timeUp();

		//適当につなぐ
		let rightItem = null;
		for(let i = 0 ; i < this._allItems.length ; i ++)
		{
			let item = this._allItems[i];
			if(! item.isLeft) 
			{
				rightItem = item;
				break;
			}
		}

		let index = 0;
		for(let i = 0 ; i < this._allItems.length ; i ++)
		{
			let item = this._allItems[i];
			if(item.isLeft)
			{
				item.pairItem = item;
				item.pairLine = this.pairLineNodes[index];
				index ++;
			}
		}

		
		this._showAnswer();
    }

	

}
