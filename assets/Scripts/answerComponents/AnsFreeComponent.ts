//---------------------------------------
// 自由入力
//---------------------------------------

import AC from "./AC";
import STFormat from "../common/STFormat";
import SchoolText from "../common/SchoolText";
import QuestionData from "../game/QuestionData";
import SE from "../common/SE";
import AnsButton from "./AnsButton";
import QuestionWindow from "../game/QuestionWindow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsFreeComponent extends AC {

	@property(cc.Button) btnCancel: cc.Button = null;
	@property(cc.Prefab) freeInputSingleBoxPrefab: cc.Prefab = null;		//指定問題の入力ボックス
	@property(cc.Prefab) freeInputFreeBoxPrefab: cc.Prefab = null;			//フリー入力のボックス
	@property({type:cc.AudioClip}) seInputText: cc.AudioClip = null;		//入力音
	@property({type:cc.AudioClip}) ketteiSE_B: cc.AudioClip = null;			//フリー入力の決定音


	_answer :string = "";
	_dynamicNodeInputLabels :cc.Label[] = [];
	_dynamicNodeFreeBox :cc.Node = null;
	_dynamicNodeFreeLine :cc.Node = null;
	_inputType :number = -1;
	_marginTextToBtnsArea :number = 0;

	_reverseImgAndText :boolean = false;		//テキストと画像を入れ替える場合

	private readonly _INPUT_TYPE_FIX :number = 0;		//文字数固定型
	private readonly _INPUT_TYPE_FREE :number = 1;		//文字数自由型
	private readonly _INPUT_FREE_BOX_SIZE :number = 43;		//フリー入力欄の箱の１文字のサイズ
	private readonly _COLOR_NORMAL :cc.Color = cc.color(255, 255, 255);
	private readonly _COLOR_RIGHT :cc.Color = cc.color(255, 255, 0);
	private readonly _COLOR_WRONG :cc.Color = cc.color(255, 0, 0);

	

	public getRespondFormats():string[]
	{
		return ["フリーもじ入力","指定もじ入力"];
	}



	public setup (questionWindow:QuestionWindow, questionData:QuestionData):void
	{
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
		
		// ※ 親の初期化 super.setup() はかなり下の方

		this._reverseImgAndText = false;

		//---------問題テキスト内に外部操作コンポーネントを割り込みできるように設定-----------

		if (questionData.format == "指定もじ入力")//指定入力
		{
			this._inputType = this._INPUT_TYPE_FIX;
		}
		else if (questionData.format == "フリーもじ入力")//自由入力
		{
			this._inputType = this._INPUT_TYPE_FREE;
		}
		else
		{
			cc.error("Format ERROR");
			return;
		}

		//-------------------------------------------------------
		// 文字数　指定型 (答えの数だけ１文字入力分のマスが出る)
		if (this._inputType == this._INPUT_TYPE_FIX)
		{
			//正式な仕様。□を①②③と置き換える。本文中に①②③は存在しない。
			//□が１つも無い場合は①②③を自動生成


			let dynamicNodes = [];
			let serchChars = ["①", "②", "③", "④", "⑤", "⑥"];

			//問題内に外部操作コンポーネントが無い場合、自動で設定
			if (questionData.question.indexOf("□") < 0)
			{
				this._reverseImgAndText = true;			//これどうしようかなあ
				if (questionData.question.length > 0) questionData.question += "\n";

				for (let i = 0; i < questionData.correct_answer.length; i++)
				{
					questionData.question += serchChars[i];
				}
			}
			//問題内に□あり。①②③に置き換える
			else
			{
				for (let i = 0; i < questionData.correct_answer.length; i++)
				{
					let index = questionData.question.indexOf("□");
					
					//□の数足りない
					if(index == -1)
					{
						questionData.question += serchChars[i];
						continue;
					}

					let _Q = questionData.question;

					//置き換える
					questionData.question = _Q.substr(0, index) + serchChars[i] + _Q.substr(index + 1, _Q.length);
				}
			}


			
			//外部操作コンポーネントを作成して配置(①②③④⑤⑥を探して随時挿入)
			for (let i = 0; i < serchChars.length; i++)
			{
				if (questionData.question.indexOf(serchChars[i]) > -1)
				{
					let node = cc.instantiate(this.freeInputSingleBoxPrefab);
					questionWindow.questionOutput.addDynamicNodeToText(serchChars[i], 1.5, node, () => { cc.log("show dynamic:" + i); });
					dynamicNodes.push(node);
				}
			}



			

			this._dynamicNodeInputLabels = [];
			for (let i = 0; i < dynamicNodes.length; i++)
			{
				for (let k = 0; k < dynamicNodes[i].children.length; k++)
				{
					if (dynamicNodes[i].children[k].name == "output")
					{
						let inputLabel = dynamicNodes[i].children[k].getComponent(cc.Label);
						this._dynamicNodeInputLabels.push(inputLabel);
					}
				}
			}

			for (let i = 0; i < this._dynamicNodeInputLabels.length; i++)
			{
				this._dynamicNodeInputLabels[i].string = "";
			}
		}
		//-------------------------------------------------------
		// 文字数　フリー型 (入力マスの長さは可変する。6文字入れられる)
		else
		{
			let node = cc.instantiate(this.freeInputFreeBoxPrefab);
			questionWindow.questionOutput.addDynamicNodeToText("□", 7, node, () => { cc.log("show dynamic box"); });

			for (let i = 0; i < node.children.length; i++)
			{
				if (node.children[i].name == "output")
				{
					let inputLabel = node.children[i].getComponent(cc.Label);
					this._dynamicNodeInputLabels = [inputLabel];
				}
				else if (node.children[i].name == "box")
				{
					this._dynamicNodeFreeBox = node.children[i];
				}
				else if (node.children[i].name == "line")
				{
					this._dynamicNodeFreeLine = node.children[i];
				}
			}
			this._dynamicNodeInputLabels[0].string = "";
			node.width = this._INPUT_FREE_BOX_SIZE * 6;		//MAXの6文字分の幅を先にとる(レイアウト時に最大サイズを使ってcontentsWidthを決めるため)


			//問題内に外部操作コンポーネントが無い場合、自動で問題作成
			if (questionData.question.indexOf("□") < 0)
			{
				this._reverseImgAndText = true;

				questionData.question += (questionData.question.length == 0) ? "□" : "\n□";
			}



			//レイアウト後にコールバックで実行する
			questionWindow.questionOutput.setReLayoutCallback(() =>
			{
				//フリー入力は回答欄のサイズを最小の２文字に変える(最大幅でのcontentsWidthは設定済み)
				this._updateInputFreeBox(this._answer.length, questionWindow.questionOutput, 0.0);

				//次の問題でバグらないためコールバックを消しておく
				questionWindow.questionOutput.setReLayoutCallback(null);
			});

		}

		//---end---------


		//この中で問題のテキストが作成される
		super.setup(questionWindow, questionData);		//スーパークラスのsetup

		this._needEnterButton = true;
		this._needResetButton = true;


		this._answer = "";

		let candidates: string[];
		let poss :cc.Vec2[];


		//一体型

		//テキストの下に画像を出す、従来の
		let questionTextBottom = this._getQuestionTextAreaBottom();

		//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
		if (this._haveQuestionImage())
		{
			questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);


			//特殊な例。画像とテキストの位置を入れ替える
			if (this._reverseImgAndText)
			{
				let QTopY = this._questionOutput.node.y + this._questionOutput.getTextFormat().size / 2;
				this._imageSprite.node.y = QTopY - this._imageSprite.node.height / 2;
				this._questionOutput.node.y = QTopY - this._imageSprite.node.height - this.MARGIN_TEXT_TO_IMG;
			}
		}

		//これだけちょっと余白サイズを大きくする。
		this._marginTextToBtnsArea = this.MARGIN_TEXT_TO_BTNS_AREA + 20;



		//回答ガイド、問題文（画像）とボタンの間に表示
		this._answerGuide.setY(this.node, questionTextBottom - this.MARGIN_TEXT_TO_BTNS_AREA / 2);
		
		

		//数字入力
		if(questionData.option1 == "" || questionData.option1 == null)
		{
			candidates = ["1","2","3","4","5","6","7","8","9","0","."];
			
			//少しボタンサイズ小さく
			this._answerBtnDefaultScale = 0.75;

			let btnHeight = 124;

			questionTextBottom -= btnHeight * this._answerBtnDefaultScale / 2 + this.MARGIN_TEXT_TO_BTNS_AREA;

			let startY:number = questionTextBottom;
			let intervalY:number = 105;
			let intervalX:number = 105;
			let startX_Up:number = intervalX * -2.5;
			let startX_Down:number = intervalX * -2.0;

			//ボタンの底
			questionTextBottom -= btnHeight * this._answerBtnDefaultScale / 2 + intervalY;
			
			poss = [
				cc.v2(startX_Up + intervalX * 0, startY - intervalY * 0),
				cc.v2(startX_Up + intervalX * 1, startY - intervalY * 0),
				cc.v2(startX_Up + intervalX * 2, startY - intervalY * 0),
				cc.v2(startX_Up + intervalX * 3, startY - intervalY * 0),
				cc.v2(startX_Up + intervalX * 4, startY - intervalY * 0),
				cc.v2(startX_Up + intervalX * 5, startY - intervalY * 0),
				cc.v2(startX_Down + intervalX * 0, startY - intervalY * 1),
				cc.v2(startX_Down + intervalX * 1, startY - intervalY * 1),
				cc.v2(startX_Down + intervalX * 2, startY - intervalY * 1),
				cc.v2(startX_Down + intervalX * 3, startY - intervalY * 1),
				cc.v2(startX_Down + intervalX * 4, startY - intervalY * 1)
			];
		}
		//文字入力
		else
		{
			candidates = [
				questionData.option1, questionData.option2, questionData.option3, questionData.option4,
				questionData.option5, questionData.option6, questionData.option7, questionData.option8
			];

			//回答が8つ未満の場合、ボタン数を削る
			for(let i = 0 ; i < candidates.length ; i ++)
			{
				if(candidates[i] == undefined)
				{
					candidates.splice(i, 1);
					i --;
				}
			}


			let btnHeight = 124;

			questionTextBottom -= btnHeight / 2 + this.MARGIN_TEXT_TO_BTNS_AREA;

			let startY = questionTextBottom;
			let intervalY = 120+15;
			let intervalX = 120+15;
			let startX = intervalX * -1.5;

			//ボタンの底
			questionTextBottom -= btnHeight / 2 + intervalY;
			
			poss = [
				cc.v2(startX + intervalX * 0, startY - intervalY * 0),
				cc.v2(startX + intervalX * 1, startY - intervalY * 0),
				cc.v2(startX + intervalX * 2, startY - intervalY * 0),
				cc.v2(startX + intervalX * 3, startY - intervalY * 0),
				cc.v2(startX + intervalX * 0, startY - intervalY * 1),
				cc.v2(startX + intervalX * 1, startY - intervalY * 1),
				cc.v2(startX + intervalX * 2, startY - intervalY * 1),
				cc.v2(startX + intervalX * 3, startY - intervalY * 1)
			];
		}

		questionTextBottom -= this.MARGIN_BTNS_TO_BOTTOM;
		questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);

		let textFormat:{} = 
		{
			size: 70,
			margin: 2,
			//interval: 46,
			lineHeight: 70,
			rows: 1,
			columns: 3,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
			verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
			color: cc.color(255, 255, 255),
		};


		//問題ボタンを作成
		this._createAnswerButtons(candidates, poss, undefined, STFormat.create(textFormat));

	}

	
	/**
	 * フリー入力の入力欄のサイズを変更する
	 * @param length 入力欄の文字数
	 * @param questionOutput 
	 * @param duration 
	 */
	private _updateInputFreeBox (length:number, questionOutput:SchoolText, duration:number):void
	{
		if(duration == undefined) duration = 0.3;

		let len = length + 1;
		if (len < 2) len = 2;
		else if (len > 6) len = 6;

		let boxWidth = this._INPUT_FREE_BOX_SIZE * len;

		//文字入力欄 の幅が変化
		this._dynamicNodeFreeBox.runAction(
			cc.valueTo(0.3, this._dynamicNodeFreeBox.width, boxWidth, (value)=>
			{
				this._dynamicNodeFreeBox.width = value;
				this._dynamicNodeFreeLine.width = value + 6;
			}).easing(cc.easeBackOut())
		);


		//Labelの位置を調整
		this._dynamicNodeInputLabels[0].node.runAction(
			cc.moveTo(0.3, boxWidth / -2, this._dynamicNodeInputLabels[0].node.y).easing(cc.easeBackOut())
		);


		//this._dynamicNodeFreeBox.width = this._INPUT_FREE_BOX_SIZE * len;		//文字入力欄
		this._dynamicNodeFreeBox.parent.parent.width = this._INPUT_FREE_BOX_SIZE * len;		//大本のNodeの幅
		//this._dynamicNodeInputLabels[0].node.x = this._dynamicNodeFreeBox.width / -2;		//Labelの位置を調整

		//置きなおし
		questionOutput.changeLauoutAfterTargets(this._dynamicNodeFreeBox.parent.parent, duration);
	}


	//オーバーライド
	public startQuestion (callback:()=>void):void
	{
		//一体型独自の表示方法
		this._btnPopUpWaitTime = 0;

		//問題の表示開始 (ここでレイアウト contentsWidthが決まる)
		this._showQuestion(() =>
		{
			//表示完了時

			//(このコンポーネント独自)
			//キャンセルボタンの位置を調整する
			if (this._inputType == this._INPUT_TYPE_FIX)
			{
				let btnTarget = this._dynamicNodeInputLabels[0].node.parent.parent;
				let pos = this._ccUtilConvertNodeSpaceToNodeSpace(btnTarget, this.node, cc.v2(0, 0));

				this.btnCancel.node.y = pos.y;
			}
			else if (this._inputType == this._INPUT_TYPE_FREE)
			{
				let btnTarget = this._dynamicNodeInputLabels[0].node.parent.parent;
				let pos = this._ccUtilConvertNodeSpaceToNodeSpace(btnTarget, this.node, cc.v2(0, 0));

				this.btnCancel.node.y = pos.y;
			}

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



	
	//オーバーライド
	protected _onSelect (answerButton:AnsButton):void
	{
		// 文字数指定型
		if (this._inputType == this._INPUT_TYPE_FIX)
		{
			if (this._answer.length >= this._dynamicNodeInputLabels.length) return;

			this._answer += answerButton.getAnswer();
			this._dynamicNodeInputLabels[this._answer.length - 1].string = answerButton.getAnswer();

			this._btnEnter.interactable = (this._answer.length == this._dynamicNodeInputLabels.length);
			this._btnReset.interactable = true;

			//入力音
			SE.play(this.seInputText);
		}
		// 文字数フリー型
		else
		{
			if (this._answer.length >= 6) return;

			this._answer += answerButton.getAnswer();
			this._dynamicNodeInputLabels[0].string = this._answer;

			//回答欄のサイズを変え、後ろの文字をずらす
			this._updateInputFreeBox(this._answer.length, this._questionOutput, undefined);

			//this.output.string = this._answer;
			this._btnEnter.interactable = true;
			this._btnReset.interactable = true;

			//入力音
			SE.play(this.seInputText);
		}

	}


	//--------------------------------------------------------------------------------------------------
	// １文字削除エリアを押した
	//
	private onPressCancelButton ():void
	{
		if (this._answer.length == 0) return;

		this._answer = this._answer.substr(0, this._answer.length - 1);		//回答データから１文字消す

		// 文字数指定型
		if (this._inputType == this._INPUT_TYPE_FIX)
		{
			this._dynamicNodeInputLabels[this._answer.length].string = "";

			this._btnEnter.interactable = false;
			this._btnReset.interactable = (this._answer.length > 0);
		}
		// 文字数フリー型
		else
		{
			this._dynamicNodeInputLabels[0].string = this._answer;

			//回答欄のサイズを変え、後ろの文字をずらす
			this._updateInputFreeBox(this._answer.length, this._questionOutput, undefined);
		}

	}


	//--------------------------------------------------------------------------------------------------
	// 決定ボタンを押した
	//
	//オーバーライド
	public onPressEnterButton ():void
	{
		this._btnEnter.interactable = false;
		this._btnReset.interactable = false;

		this._enterCallback();

		
		/*
		for (let i = 0; i < this._answerBtns.length; i++)
		{
			this._answerBtns[i].lock(true);
		}
		*/
		this._allButtonsLock(true);


		//結果待ち演出
		this._answerWait(()=>
		{
			this._showAnswer();
		});	

	}


	/**
	 * 結果待ち演出
	 */
	protected _answerWait(callback:()=>void):void
	{
		// 文字数指定型
		if (this._inputType == this._INPUT_TYPE_FIX)
		{
			const BaseTime:number = 1.0;

			//1つずつ入力欄を見ていく。正解すれば一瞬拡大、間違うと斜めになる
			for(let i:number = 0 ; i < this._dynamicNodeInputLabels.length ; i ++)
			{
				let label:cc.Label = this._dynamicNodeInputLabels[i];
				let correct:boolean = this._qData.correct_answer.charAt(i) == label.string;
				this._answerMiniCheckWithLabel(label.node.parent, label, 0.5 * i + BaseTime, correct, cc.v2(10,60), -30, -10);
			}

			cc.tween({})
			.delay(0.5)
			.call(()=>
			{
				SE.play(this.ketteiSE);
			})
			.delay(this._dynamicNodeInputLabels.length * 0.5 + 1.0)
			.call(()=>
			{
				callback();
			})
			.start();
		}
		else
		{
			this._dynamicNodeInputLabels[0].node.parent.parent.zIndex = 1;
			cc.tween(this._dynamicNodeInputLabels[0].node.parent)
			.delay(0.5)
			.call(()=>
			{
				SE.play(this.ketteiSE_B);
			})
			.to(0.05, { scale:1.4 })
			.delay(0.5)
			.to(0.05, { scale:1.6 })
			.delay(0.5)
			.to(0.05, { scale:1.9 })
			.delay(0.5)
			.to(0, { scale:1.0 } )
			.call(()=>{ callback(); })
			.start();
			
			
			
			/*
			cc.tween({})
			.delay(1.0)
			.call(()=>{ callback(); })
			.start();
			*/
		}

	}


	//override
	protected _showAnswer():void
	{
		cc.log("フリー文字入力の入力内容:" + this._answer);
		
		let correctAnswer = (this._answer == this._qData.correct_answer);

		//タイムアップ時
		if(this._isTimeUp)
		{
			this._btnEnter.interactable = false;
			this._btnReset.interactable = false;
			this._allButtonsLock(true);
			
			correctAnswer = false;
		}

		cc.log("結果:" + correctAnswer);

		let changeColor = (correctAnswer) ? cc.color(50,50,255) : this._COLOR_WRONG;

		if (this._inputType == this._INPUT_TYPE_FIX)
		{
			for (let i = 0; i < this._dynamicNodeInputLabels.length; i ++)
			{
				this._dynamicNodeInputLabels[i].node.color = changeColor;
				this._dynamicNodeInputLabels[i].node.parent.angle = 0;
			}
		}
		else if (this._inputType == this._INPUT_TYPE_FREE)
		{
			this._dynamicNodeInputLabels[0].node.color = changeColor;
		}



		// 正解
		if(correctAnswer)
		{
			this._answerCallback(AC.ANSWER_CODE_RIGHT, this._answer);
		}
		// 不正解
		else
		{
			
			if (this._inputType == this._INPUT_TYPE_FIX)
			{
				for (let i = 0; i < this._dynamicNodeInputLabels.length; i ++)
				{
					this._dynamicNodeInputLabels[i].string = this._qData.correct_answer.charAt(i);
				}
			}
			else if (this._inputType == this._INPUT_TYPE_FREE)
			{
				this._dynamicNodeInputLabels[0].string = this._qData.correct_answer;
				this._updateInputFreeBox(this._qData.correct_answer.length, this._questionOutput, undefined);
			}

			this._answerCallback(this._isTimeUp ? AC.ANSWER_CODE_TIME_UP : AC.ANSWER_CODE_WRONG, this._answer);		//0:間違い / 2:時間切れ
		}
	}


	//--------------------------------------------------------------------------------------------------
	// リセットボタンを押した
	//
	//override
	public onPressResetButton ():void
	{
		this._answer = "";
		this._btnEnter.interactable = false;
		this._btnReset.interactable = false;

		// 文字数指定型
		if (this._inputType == this._INPUT_TYPE_FIX)
		{
			for (let i = 0; i < this._dynamicNodeInputLabels.length; i++)
			{
				this._dynamicNodeInputLabels[i].string = "";
			}
		}
		else
		{
			//this.output.string = "_ _ _ _ _ _";

			this._dynamicNodeInputLabels[0].string = this._answer;

			//回答欄のサイズを変え、後ろの文字をずらす
			this._updateInputFreeBox(this._answer.length, this._questionOutput, undefined);
		}

	}


	//override
	public timeUp ():void
    {
		super.timeUp();
		this._showAnswer();
	}
	
}
