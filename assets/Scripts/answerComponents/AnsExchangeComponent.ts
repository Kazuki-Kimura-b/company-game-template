//---------------------------------------
// 並べ替え
//---------------------------------------

import AC from "./AC";
import AnsButton from "./AnsButton";
import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";
import GameMain from "../game/GameMain";
import QuestionData from "../game/QuestionData";
import SE from "../common/SE";
import QuestionWindow from "../game/QuestionWindow";
import { GameSE } from "../game/GameSEComponent";
import { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsExchangeComponent extends AC {

	@property(cc.Node) btnsParentNode: cc.Node = null;
	@property({type:cc.AudioClip}) seBtnTapped:cc.AudioClip = null;		//ボタンをタップした音
	@property({type:cc.AudioClip}) seExchanged:cc.AudioClip = null;		//交換した音
	@property(cc.Node) touchEventNode:cc.Node = null;

	_selectedButton :AnsButton = null;
	_interactable :boolean = true;
	_holdButton :AnsButton = null;
	_holdBtnIndex :number = -1;
	_holdLocalPos:cc.Vec2 = null;
	_clickBtnAsobi :number = 0;
	_prevTouchLoc :cc.Vec2 = null;
	//_swipeMoveLoc :cc.Vec2 = null;
	_useDynamicNode :boolean = false;
	_btnsTotalWidth: number = 0;

	private readonly _AREA_WIDTH :number = 540;
	private readonly _BTN_WIDTH :number = 123;
	private readonly _BTN_INTERVAL :number = 140;
	private readonly _CLICK_BTN_ASOBI :number = 40;		//タップした後、この範囲より動かなかった場合は「ボタンクリック」と認識する


	public getRespondFormats():string[]
	{
		return ["ならべかえ"];
	}


    
    setup (questionWindow:QuestionWindow, questionData:QuestionData)
	{
		//回答一覧をシャッフル
		/*
		try
		{
			questionData.shuffleAllOptions();
		}
		catch(e)
		{
			console.log("QuestionData.shuffleAllOptions()が見つかりませんでした。");
			console.log("questionData:");
			console.log(questionData);
		}
		*/
		
		let candidates:string[] = [
            questionData.option1, questionData.option2, questionData.option3, questionData.option4, questionData.option5, questionData.option6
		];

		for(let i:number = candidates.length - 1 ; i >= 0 ; i --)
		{
			if(candidates[i] == "" || candidates[i] == null) candidates.splice(i, 1);
		}


		//------------------------------------------------------------------------------------------------------
		//ボタンサイズが可変なので文字数に合わせて調整

		//ボタン全体の幅
		this._btnsTotalWidth = this._BTN_WIDTH * candidates.length + (this._BTN_INTERVAL - this._BTN_WIDTH) * (candidates.length - 1);

		//ボタン表示エリアの幅
		this.btnsParentNode.x = -this._AREA_WIDTH / 2;
		this.btnsParentNode.scale = this._AREA_WIDTH / this._btnsTotalWidth;

		this.btnsParentNode.width = this._btnsTotalWidth;
		this.btnsParentNode.height = this._BTN_WIDTH;

		//------------------------------------------------------------------------------------------------------


		
		//[option]を□に置き換える
		questionData.question = questionData.question.replace("[option]", "□");

		//問題の間に回答欄を挟むなら、ここで問題分の挟む箇所の前後に改行がいる
		let answerIndex = questionData.question.indexOf("□");
		if(answerIndex >= 0)
		{
			let list = questionData.question.split("□");
			if(list.length == 2)
			{
				//-------- 「問題前半 \n □ \n 問題後半」  にする---------
				//
				if (list[0].charAt(list[0].length - 1) != "\n") list[0] = list[0] + "\n";
				if (list[1].charAt(0) != "\n") list[1] = "\n" + list[1];
				
				questionData.question = list[0] + "□" + list[1];

				//----------- 外部操作コンポーネントを設定する -----------
				//this.btnsParentNode.x = 0;
				this.btnsParentNode.y = 0;

				this.btnsParentNode.removeFromParent(false);

				//テキスト間に外部から操作できるNodeを挟む
				questionWindow.questionOutput.addDynamicNodeToText("□", 1, this.btnsParentNode, () => { cc.log("show dynamic box"); });
				
				//ここで行間を再設定できればええのかなあ...?
				
				this._useDynamicNode = true;

			}
			else
			{
				questionData.question = "ERROR";
			}
		}


		super.setup (questionWindow, questionData);		//スーパークラスのsetup この中で_createQuestionText()が呼ばれる


		this._selectedButton = null;

		this._needEnterButton = true;
		this._needResetButton = false;
		this._btnEnter.interactable = true;
		this._interactable = true;

		
		
		let poss:cc.Vec2[] = [];
		for(let i:number = 0 ; i < candidates.length ; i ++)
		{
			//if(candidates[i] == "" || candidates[i] == null) break;
			poss.push(cc.v2(this._getButtonXAtIndex(i), 0));
		}
		//candidates = candidates.slice(0, poss.length);



		

		//問題の下に来るように調整


		//回答ボタングループの半分の高さ
		let btnsGroupNodeHalfHeight = this._BTN_WIDTH * this.btnsParentNode.scale / 2;

		// 問題文の中に回答欄を表示
		if(this._useDynamicNode)
		{
			//回答欄のdynamicProp情報を取得
			//どうやらこの2行は必要ないらしい(20210409 #154対応)
			//let dynamicNodeProp = this._questionOutput.getDynamicNodePropAtNode(this.btnsParentNode);
			//let needWideRow = dynamicNodeProp.locY;		//広い幅が必要な行
			
			//テキストの底のy座標
			let questionTextBottom = this._getQuestionTextAreaBottom();

			//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
			if (this._haveQuestionImage())
			{
				questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);
			}
			
			//ウィンドウの底をテキストの下に設定
			questionTextBottom -= this.MARGIN_BTNS_TO_BOTTOM;
			questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);

			//回答ガイド、交換するボタンの少し下(ボタン底から-30)に表示
			// 指定した行の座標を取ってくるのと、ダイナミックノードの座標を取ってくるメソッドほしい
			let btnsGroupNodeY = this.btnsParentNode.parent.y;
			this._answerGuide.setY(this._questionOutput.node, btnsGroupNodeY - btnsGroupNodeHalfHeight - 30);

		}
		// 問題文の中に回答（□）が無いパターン
		else
		{
			//テキストの底のy座標
			let questionTextBottom = this._getQuestionTextAreaBottom();
			
			//回答ボタングループを指定の高さに配置
			questionTextBottom -= btnsGroupNodeHalfHeight + this.MARGIN_TEXT_TO_BTNS_AREA;
			this.btnsParentNode.y = questionTextBottom;

			//回答ガイド、交換するボタンの少し下(ボタン底から-30)に表示
			this._answerGuide.setY(this.node, questionTextBottom - btnsGroupNodeHalfHeight - 30);

			//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
			if (this._haveQuestionImage())
			{
				questionTextBottom -= btnsGroupNodeHalfHeight;
				questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);
			}

			//ウィンドウの底を回答ボタングループの下に設定
			questionTextBottom -= btnsGroupNodeHalfHeight + this.MARGIN_BTNS_TO_BOTTOM;
			questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);
		}
		
		
		let textFormat:{} = 
		{
			size: 90,
			margin: 0,
			lineHeight: 90,
			rows: 1,
			columns: 1,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
			verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
			color: cc.color(255, 255, 255),
		};

		
		//問題ボタンを作成
		this._createAnswerButtons(candidates, poss, this.btnsParentNode, STFormat.create(textFormat));

		for(let i:number = 0 ; i < this._answerBtns.length ; i ++)
		{
			this._answerBtns[i].muteSE(true);		//ボタンの効果音を消す
		}

		//ボタンの領域をタップ・スワイプした際のイベント取得
		this._touchEventON();
	}


	_touchEventON ()
	{
		this.touchEventNode.on(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
		this.touchEventNode.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
		this.touchEventNode.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
		this.touchEventNode.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
	}

	_touchEventOFF()
	{
		this.touchEventNode.off(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
		this.touchEventNode.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
		this.touchEventNode.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
		this.touchEventNode.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
	}


	//オーバーライド
	startQuestion (callback)
	{
		//スーパークラスの関数
		super.startQuestion(callback);

		// 問題文の中に回答欄を表示
		if(this._useDynamicNode)
		{
			//上の親のstartQuestion()でこのノードのX座標が正式に決まるので、この後で0に変える
			this.btnsParentNode.parent.x = 0;
		}
	}


	_onTouchBegin (event)
	{
		if (! this._interactable) return;
		
		let touches:cc.Touch[] = event.getTouches();
		let touchLoc:cc.Vec2 = touches[0].getLocation();

		let res:{ btn:AnsButton, loc:cc.Vec2 } = this._getButtonAndLocalPosAtTouchLoc(touchLoc);
		this._holdButton = res.btn;
		this._holdLocalPos = res.loc;

		this._clickBtnAsobi = 0;
		this._prevTouchLoc = touchLoc;
		//this._swipeMoveLoc = cc.v2(0, 0);

		if (this._holdButton != null)
		{
			this._holdButton.node.stopAllActions();
			SE.play(this.seBtnTapped);		 //タップ音
		}

		this._holdBtnIndex = this._answerBtns.indexOf(this._holdButton);

		//タップ可能エリア内でタップした座標
		//let lPos = this._touchEventerNode.convertToNodeSpaceAR(touchLoc);
		//cc.log(lPos);
	}

	_onTouchMove (event)
	{
		if (! this._interactable) return;

		if (this._holdButton == null) return;

		let touches:cc.Touch[] = event.getTouches();
		let touchLoc:cc.Vec2 = touches[0].getLocation();

		let sa:cc.Vec2 = touchLoc.sub(this._prevTouchLoc);
		//this._swipeMoveLoc = sa;

		let distance:number = sa.x * sa.x + sa.y * sa.y;
		this._clickBtnAsobi += distance;				//ボタンを動かした距離を貯めていってるところ（のちのクリックかスワイプの判定用）
		this._prevTouchLoc = touchLoc;


		//一定距離だけ動かした場合、タップ選択中のボタンは解除される
		if(this._clickBtnAsobi >= this._CLICK_BTN_ASOBI && this._selectedButton != null)
		{
			this._selectedButton.selectCanceled();
			this._selectedButton = null;
		}

		//let nodeLoc:cc.Vec2 = this._touchEventerNode.convertToNodeSpaceAR(touchLoc);
		//let btnPosX:number = nodeLoc.x - this._holdLocalPos.x;
		let btnPosX:number = this.btnsParentNode.convertToNodeSpaceAR(touchLoc).x - this._holdLocalPos.x;

		let left:number = this._BTN_WIDTH / 2;
		let right:number = this._btnsTotalWidth - this._BTN_WIDTH / 2;

		//範囲外に出た場合少しだけスライド
		
		if (btnPosX < left)
		{
			let saX = btnPosX - left;
			btnPosX = left + saX * 0.3;
		}
		else if (btnPosX > right)
		{
			let saX = btnPosX - right;
			btnPosX = right + saX * 0.3;
		}

		this._holdButton.node.x = btnPosX;

		//ボタンが移動した位置の番号
		
		let movedBtnIndex = Math.floor((btnPosX + (this._BTN_INTERVAL - this._BTN_WIDTH) / 2) / this._BTN_INTERVAL);
		if(movedBtnIndex < 0) movedBtnIndex = 0;
		else if(movedBtnIndex > this._answerBtns.length - 1) movedBtnIndex = this._answerBtns.length - 1;

		//入れ替わる
		if(this._holdBtnIndex != movedBtnIndex)
		{
			let changeBtn = this._answerBtns[movedBtnIndex];
			changeBtn.node.stopAllActions();

			changeBtn.node.runAction(
				cc.moveTo(0.2, cc.v2(this._getButtonXAtIndex(this._holdBtnIndex), 0)).easing(cc.easeOut(2.0))
			);

			this._answerBtns[movedBtnIndex] = this._holdButton;
			this._answerBtns[this._holdBtnIndex] = changeBtn;

			this._holdBtnIndex = movedBtnIndex;

			SE.play(this.seExchanged);		//ボタン交換の音
		}

		//cc.log(movedBtnIndex);
	}

	_onTouchEnd (event)
	{
		if (! this._interactable) return;

		if (this._holdButton == null) return;

		//クリックした（スワイプ距離がとても短い）
		if (this._clickBtnAsobi < this._CLICK_BTN_ASOBI)
		{
			cc.log("CLICK");

			let resetBtnPosX:boolean = false;

			if (this._selectedButton == null)
			{
				this._holdButton.selected();
				//this._holdButton.fillColorLock(true);
				this._selectedButton = this._holdButton;
				resetBtnPosX = true;
			}
			else if (this._selectedButton == this._holdButton)
			{
				//this._holdButton.fillColorLock(false);
				this._holdButton.selectCanceled();
				this._selectedButton = null;
				resetBtnPosX = true;
			}

			if(resetBtnPosX)
			{
				//let backPos:cc.Vec2 = cc.v2(this._getButtonXAtIndex(this._answerBtns.indexOf(this._holdButton)), 0);
				this._holdButton.node.runAction(
					cc.moveTo(0.2, cc.v2(this._getButtonXAtIndex(this._holdBtnIndex), 0)).easing(cc.easeOut(2.0))
				);

				return;			//入れ替えないパターンはここで抜ける
			}


			//入れ替える
			let btnA = this._selectedButton;
			let btnB = this._holdButton;

			let indexA = this._answerBtns.indexOf(btnA);
			let indexB = this._answerBtns.indexOf(btnB);

			let posA = cc.v2(this._getButtonXAtIndex(indexA), 0);
			let posB = cc.v2(this._getButtonXAtIndex(indexB), 0);

			this._answerBtns[indexA] = btnB;
			this._answerBtns[indexB] = btnA;

			//this._selectedButton.fillColorLock(false);
			this._selectedButton.selectCanceled();

			btnA.node.stopAllActions();
			btnA.node.runAction(cc.jumpTo(0.3, posB, 120, 1));

			btnB.node.stopAllActions();
			btnB.node.scale = btnB.getDefaultScale();		//サイズが大きいままのバグがあるので強制で戻す
			btnB.node.runAction(cc.jumpTo(0.3, posA, -120, 1));

			this._selectedButton = null;
			this._holdButton = null;

			SE.play(this.seExchanged);		//ボタン交換の音
		}
		//スワイプしていた
		else
		{
			//正しい位置に戻す
			this._holdButton.node.runAction(
				cc.moveTo(0.2, cc.v2(this._getButtonXAtIndex(this._holdBtnIndex), 0)).easing(cc.easeOut(2.0))
			);
			
			this._holdButton = null;
		}
	}


	_getButtonXAtIndex (index)
	{
		return this._BTN_WIDTH / 2 + this._BTN_INTERVAL * index;
	}
	

	_onSelect (answerButton)
	{
		//onTouchEndに処理を作ったのでここは利用しない
	}



    onPressEnterButton ()
    {
		this._enterCallback();
		
		this._btnEnter.interactable = false;
		this._interactable = false;

		//全ボタンをロック
		this._touchEventOFF();
		this._allButtonsLock(true);

		for(let i = 0 ; i < this._answerBtns.length ; i ++)
		{
			this._answerBtns[i].resultWait();		//結果待ちカラー
		}
		
		//作ったワードを大きく見せる

		//待ち時間
		this._answerWait(()=>
		{
			//結果表示
			this._showAnswer();
		});

	}


	/**
	 * 結果待ち演出
	 */
	protected _answerWait(callback:()=>void):void
	{
		//1つずつ入力欄を見ていく。正解すれば一瞬拡大、間違うと斜めになる
		const BaseTime:number = 1.0;

		for(let i:number = 0 ; i < this._answerBtns.length ; i ++)
		{
			//1文字ずつ正解・不正解アクション
			let correct:boolean = this._qData.correct_answer.charAt(i) == this._answerBtns[i].getAnswer();
			this._answerMiniCheck(this._answerBtns[i].node, 0.5 * i + BaseTime, correct, cc.v2(10,60), -15, -5);
		}

		cc.tween({})
		.delay(0.5)
		.call(()=>
		{
			SE.play(this.ketteiSE);
		})
		.delay(this._answerBtns.length * 0.5 + 1.0)
		.call(()=>
		{
			callback();
		})
		.start();
	}


	_showAnswer():void
	{
		let word = "";

		for (let i = 0; i < this._answerBtns.length; i++)
		{
			word += this._answerBtns[i].getAnswer();
			this._answerBtns[i].lock(true);
		}

		let correctAnswer = (word == this._qData.correct_answer);

		//タイムアップ時
		if(this._isTimeUp)
		{
			correctAnswer = false;
			this._btnEnter.interactable = false;
			this._interactable = false;
			word = this._TIME_UP_ANSWER;
		}

		cc.log("結果:" + correctAnswer);

		if (correctAnswer)
		{
			for (let i = 0; i < this._answerBtns.length; i++)
			{
				this._answerBtns[i].rightAnswer();
			}
			
			this._answerCallback(AC.ANSWER_CODE_RIGHT, word);		//1:正解
		}
		else
		{
			//正しい並びに直す
			let posXs = [];

			for (let i = 0; i < this._answerBtns.length; i++)
			{
				posXs[i] = this._answerBtns[i].node.x;
				this._answerBtns[i].wrongAnswer();
			}



			let wrongIndexs:number[] = [];		//間違った場所
			let moveIndexs:number[] = [];		//正解の場所への移動先

			//間違った位置を調べる
			for (let i = 0; i < this._answerBtns.length; i++)
			{
				//不正解
				if(this._answerBtns[i].getAnswer() != this._qData.correct_answer.charAt(i))
				{
					wrongIndexs.push(i);
					moveIndexs.push(-1);		//移動先はこれから決める
				}
				else
				{
					//正解なので移動しない
					moveIndexs.push(i);
				}
			}

			
			for(let i:number = 0 ; i < wrongIndexs.length; i ++)
			{
				let indexA:number = wrongIndexs[i];
				let rightChar:string = this._qData.correct_answer.charAt(indexA);		//正解の文字
				
				for(let k:number = 0 ; k < wrongIndexs.length ; k ++)
				{
					let indexB:number = wrongIndexs[k];
					
					if(this._answerBtns[indexB].getAnswer() != rightChar) continue;		//正解の文字じゃないのでパス
					else if(moveIndexs.indexOf(indexB) > -1) continue;		//正解の文字だけど既に使用済みなのでパス

					moveIndexs[indexA] = indexB;		//移動先を設定
					break;
				}
			}
			

			/*
			for (let i = 0; i < this._answerBtns.length; i++)
			{
				if(wrongIndexs.indexOf(i) == -1) continue;		//正解なので無視

				let correctIndex:number = moveIndexs[i];


				//左に移動するのは上に、右に移動するのは下に跳ねる
				let jumpY = (i > correctIndex) ? 1 : -1;

				this._answerBtns[i].node.runAction(cc.jumpTo(0.3, cc.v2(posXs[correctIndex], 0), 80 * jumpY, 1));
			}
			*/

			for (let i:number = 0 ; i < moveIndexs.length ; i ++)
			{
				let index:number = moveIndexs[i];

				if(wrongIndexs.indexOf(index) == -1) continue;		//正解なので無視

				//左に移動するのは上に、右に移動するのは下に跳ねる
				let jumpY = (i > index) ? -1 : 1;

				this._answerBtns[index].node.runAction(
					cc.spawn(
						cc.jumpTo(0.3, cc.v2(this._getButtonXAtIndex(i), 0), 80 * jumpY, 1),
						cc.rotateTo(0.3, 0)
					)
				);
			}






			/*
			for (let i = 0; i < this._answerBtns.length; i++)
			{
				let correctIndex = this._qData.correct_answer.indexOf(this._answerBtns[i].getAnswer());

				if (i == correctIndex) continue;

				//左に移動するのは上に、右に移動するのは下に跳ねる
				let jumpY = (i > correctIndex) ? 1 : -1;

				this._answerBtns[i].node.runAction(cc.jumpTo(0.3, cc.v2(posXs[correctIndex], 0), 80 * jumpY, 1));
			}
			*/

			this._answerCallback(this._isTimeUp ? AC.ANSWER_CODE_TIME_UP : AC.ANSWER_CODE_WRONG, word);		//0:間違い / 2:時間切れ
		}
	}
	

	timeUp()
    {
		super.timeUp();
		this._showAnswer();
	}


	removeComponent ()
	{
		//スーパークラス
		super.removeComponent();

		this._touchEventOFF();
	}
	

	//タップした位置にあるボタンを返す
	private _getButtonAndLocalPosAtTouchLoc (touchLoc):{btn:AnsButton, loc:cc.Vec2}
	{
		for (let i = 0; i < this._answerBtns.length; i++)
		{
			let ansBtn:AnsButton = this._answerBtns[i];
			let node:cc.Node = ansBtn.node;

			let lPos:cc.Vec2 = node.convertToNodeSpaceAR(touchLoc);
			if (lPos.x > -ansBtn.fillNode.width / 2 && lPos.x < ansBtn.fillNode.width / 2 && lPos.y > -ansBtn.fillNode.height / 2 && lPos.y < ansBtn.fillNode.height / 2)
			{
				return { btn:ansBtn, loc:lPos };
			}
		}
		return { btn:null, loc:null };
	}

}
