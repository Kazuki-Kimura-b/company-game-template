//---------------------------------------
// スロット
//---------------------------------------

import SE from "../common/SE";
import GameMain from "../game/GameMain";
import { GameSE } from "../game/GameSEComponent";
import QuestionData from "../game/QuestionData";
import QuestionWindow from "../game/QuestionWindow";
import AC from "./AC";
import Slot from "./Slot";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsSlotComponent extends AC {

	@property(cc.Node) touchEventNode: cc.Node = null;
	@property(cc.Node) slotsParentNode: cc.Node = null;
	@property(cc.Prefab) slotPrefab: cc.Prefab = null;
	@property(cc.Prefab) itemPrefab: cc.Prefab = null;
	@property({type:cc.AudioClip}) seRollSlot:cc.AudioClip = null;

	private _touchLoc :cc.Vec2 = null;
	private _selectedSlotID :number = -1;
	private _slots :Slot[] = [];
	private _interactable :boolean = true;
	private _scrollViews :cc.ScrollView[] = [];

	

	public getRespondFormats():string[]
	{
		return ["スロット"];
	}


	//override
	public setup (questionWindow:QuestionWindow, questionData:QuestionData):void
	{
		/*
		try
		{
			//questionData.optionをシャッフルする
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
		this._needResetButton = false;

		//問題ボタンを作成 (使わないので空を用意)。
		//this._createAnswerButtons([], []);

		//リセットボタンと決定ボタンを出す
		//this._popupAnswerButtons();

		//問題の表示
		//this._showQuestion();

		//問題開始、タイマー動作開始
		//this._setupCallback();

		//これはここでいい
		this._btnEnter.interactable = true;
		
		
		this._interactable = true;
		
		let candidates = [
			questionData.option1, questionData.option2, questionData.option3, questionData.option4
		];



		//テキストの底のy座標
		let questionTextBottom = this._getQuestionTextAreaBottom();

		//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
		if (this._haveQuestionImage())
		{
			questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);
		}

		//スロットの高さを調整

		let slotHeight = 351;

		questionTextBottom -= slotHeight / 2 + this.MARGIN_TEXT_TO_BTNS_AREA;
		this.slotsParentNode.y = questionTextBottom;


		//スロットの作成

		this._selectedSlotID = -1;
		this._slots = [];

		this._scrollViews = [];

		for (let i = 0; i < candidates.length; i++)
		{
			if (candidates[i] == "" || candidates[i] == undefined || candidates[i] == null)
			{
				candidates = candidates.slice(0, i);
				break;
			}
		}

		let startXrate = (candidates.length - 1) / -2;

		for (let i = 0; i < candidates.length; i++)
		{
			let newNode = cc.instantiate(this.slotPrefab);
			newNode.x = (startXrate + i) * 140;

			this.slotsParentNode.addChild(newNode);

			let slot:Slot = newNode.getComponent(Slot);
			slot.setup(candidates[i], this.itemPrefab, this.seRollSlot);
			slot.node.scale = 0.0;

			this._scrollViews[i] = slot.getComponent(cc.ScrollView);
			this._slots[i] = slot;
		}

		// スロットの下の要素
		
		questionTextBottom -= slotHeight / 2 + this.MARGIN_BTNS_TO_BOTTOM;
		questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);


		//回答ガイド、スロットの中央のやや上(100)に表示
		this._answerGuide.setY(this.node, this.slotsParentNode.y + 100);


		
		//----



		//--------------------------------------------------------------------
		// 画面タップ時
		//
		this.touchEventNode.on(cc.Node.EventType.TOUCH_START, (event) =>
		{
			if(! this._interactable) return;

			cc.log("TOUCH START");
			cc.log(this._scrollViews[0].getScrollOffset());

			let touches = event.getTouches();
			this._touchLoc = touches[0].getLocation();
			this._selectedSlotID = -1;

			//---

			let pos = this.node.convertToNodeSpaceAR(this._touchLoc);

			//どのスロットをタップしたか取得
			for (let i = 0 ; i < this._scrollViews.length ; i++)
			{
				let scNode = this._scrollViews[i].node;
				let saX = scNode.x - pos.x;
				if (saX > -scNode.width / 2 && saX < scNode.width / 2)
				{
					this._selectedSlotID = i;
					break;
				}
			}

			//スロットを選択していない
			if (this._selectedSlotID == -1) return;

			//スクロールの開始
			this._slots[this._selectedSlotID].scrollStart();

			//選択音が鳴る
			SE.play(GameSE.clip.showAnswerBtn);

		},this);



		//--------------------------------------------------------------------
		// 画面スワイプ時
		//
		this.touchEventNode.on(cc.Node.EventType.TOUCH_MOVE, (event) =>
		{
			if(! this._interactable) return;
			
			//スロットを選択していない
			if (this._selectedSlotID == -1) return;

			let touches = event.getTouches();
			let touchLoc = touches[0].getLocation();

			let saY = touchLoc.y - this._touchLoc.y;

			//スクロールさせる
			this._slots[this._selectedSlotID].scrollMove(saY);

		}, this);



		//--------------------------------------------------------------------
		// タップやめた時
		//
		this.touchEventNode.on(cc.Node.EventType.TOUCH_END, (event) =>
		{
			if(! this._interactable) return;
			
			//スロットを選択していない
			if (this._selectedSlotID == -1) return;

			cc.log("TOUCH END");
			//最寄りのアイテムまでフィットするようにスクロール
			this._slots[this._selectedSlotID].scrollEnd();

			//選択音が鳴る
			SE.play(GameSE.clip.showAnswerBtn);
		
			this._selectedSlotID = -1;

		},this);

	}



	//override
	public startQuestion (callback:()=>void):void
	{
		//一体型独自の表示方法
		//this._btnPopUpWaitTime = 0;

		//問題の表示開始
		this._showQuestion(() =>
		{
			//表示完了時

			//画像の表示
			this._showQImage();

			//スロットが飛び出す
			for (let i = 0; i < this._slots.length; i++)
			{
				this._slots[i].node.runAction(
					cc.sequence(
						cc.delayTime(i * 0.03),
						cc.callFunc(() =>
						{
							SE.play(GameSE.clip.showAnswerBtn);
						}),
						cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
						cc.callFunc(() =>
						{
							this._slots[i].showBtns();
						})
					)
				);
			}

			//問題ボタンが飛び出す。ボタンは無いので決定ボタンが出る
			this._popupAnswerButtons(undefined);

			//問題開始、タイマー動作開始
			callback();
		});
	}




	//override
	public onPressEnterButton ():void
	{
		this._interactable = false;
		this._btnEnter.interactable = false;
		this._slotBtnsLock();


		//画面外でスワイプ解除でリールがズレる問題があるため、念のため最寄りのアイテムまでフィットするようにスクロール
		for(let i:number = 0; i < this._slots.length ; i ++)
		{
			this._slots[i].scrollEnd();
		}
		

		this._enterCallback();

		for (let i = 0; i < this._slots.length; i++)
		{
			this._slots[i].resultWait();		//結果待ちカラーにする
		}
		
		
		//待ち時間
		this._answerWait(()=>
		{
			//結果表示
			this._showAnswer();
		});
	}


	
	//override
	protected _answerWait(callback:()=>void):void
	{
		const BaseTime:number = 1.0;

		//正解の文字の配列
		let correctWords:string[] = this._makeAnswers(this._qData.correct_answer);

		for (let i:number = 0; i < this._slots.length; i++)
		{
			let word:string = this._slots[i].getText();
			let correct:boolean = (correctWords[i] == word);

			this._slots[i].answerCheck(correct, 0.5 * i + BaseTime, this.miniMaruNode);
		}

		cc.tween({})
		.delay(0.5)
		.call(()=>
		{
			SE.play(this.ketteiSE);
		})
		.delay(this._slots.length * 0.5 + BaseTime)
		.call(()=>
		{
			callback();
		})
		.start();
	}



	//override
	protected _showAnswer():void
	{
		//正解の文字の配列
		let correctWords:string[] = this._makeAnswers(this._qData.correct_answer);

		let correctAnswer:boolean = true;
		let sendAnswer:string = "";

		for (let i:number = 0; i < this._slots.length; i++)
		{
			let word:string = this._slots[i].getText();
			cc.log(correctWords[i] + "," + word);

			sendAnswer += word;

			//不正解
			if (correctWords[i] != word) correctAnswer = false;
		}

		cc.log("結果:" + correctAnswer);

		if (correctAnswer)
		{
			for (let i = 0; i < this._slots.length; i++)
			{
				this._slots[i].rightAnswer();
			}
			
			this._answerCallback(AC.ANSWER_CODE_RIGHT, sendAnswer);		//1:正解
		}
		else
		{
			//間違い
			this._wrongAnswer(correctWords, sendAnswer);
		}
	}


	
	private _makeAnswers (text:string):string[]
	{
		let list:string[] = [];
		for(let i:number = 0 ; i < text.length ; i ++)
		{
			list.push(text.charAt(i));
		}
		return list;
	}


	//間違い時
	private _wrongAnswer (answers:string[], sendAnswer:string):void
	{
		for (let i = 0; i < this._slots.length; i++)
		{
			this._slots[i].scrollToAnswer(answers[i]);
			this._slots[i].wrongAnswer();
		}

		this._answerCallback(this._isTimeUp ? AC.ANSWER_CODE_TIME_UP : AC.ANSWER_CODE_WRONG, sendAnswer);		//0:間違い / 2:時間切れ
	}


	//override
	public timeUp ():void
	{
		this._interactable = false;
		this._btnEnter.interactable = false;
		this._slotBtnsLock();
		this._isTimeUp = true;
		
		let answers = this._makeAnswers(this._qData.correct_answer);
		//let answers = this._qData.correct_answer.split(",");
		
		this._wrongAnswer(answers, this._TIME_UP_ANSWER);
	}


	private _slotBtnsLock():void
	{
		for(let i:number = 0 ; i < this._slots.length ; i ++)
		{
			this._slots[i].lockBtns();
		}
	}


	//override
	public removeComponent ():void
	{
		super.removeComponent();

		//スロット内のアイテムを消す
		for (let i = 0; i < this._slots.length; i++)
		{
			this._slots[i].removeBtns();
			this._slots[i].removeItems();
		}

		this.slotsParentNode.removeAllChildren();
		this._slots = null;
	}

}
