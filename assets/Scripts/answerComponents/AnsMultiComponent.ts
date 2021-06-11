//---------------------------------------
// 一問多答
//---------------------------------------

import AC from "./AC";
import StaticData from "../StaticData";
import AnsButton from "./AnsButton";
import GameMain from "../game/GameMain";
import QuestionData from "../game/QuestionData";
import SE from "../common/SE";
import { GameSE } from "../game/GameSEComponent";
import QuestionWindow from "../game/QuestionWindow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsMultiComponent extends AC{

	@property(cc.Sprite) miniMarubatsuSprites:cc.Sprite[] = [];


	public getRespondFormats():string[]
	{
		return ["複数回答"];
	}


    setup (questionWindow:QuestionWindow, questionData:QuestionData)
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
		
		super.setup(questionWindow, questionData);		//スーパークラスのsetup

		this._needEnterButton = true;
		this._needResetButton = true;

		let candidates = [
			questionData.option1, questionData.option2, questionData.option3, questionData.option4
		];

		if(questionData.option4 == null || questionData.option4 == undefined || questionData.option4 == "") candidates.pop();		//ボタンは3つ

		let intervalY = 92;
		//let startY = 414;
		let posX = 0;

		//分離型
		//let poss = [cc.v2(posX, startY - intervalY * 0), cc.v2(posX, startY - intervalY * 1), cc.v2(posX, startY - intervalY * 2), cc.v2(posX, startY - intervalY * 3)];

		//一体型

		//テキストの底のy座標
		let questionTextBottom = this._getQuestionTextAreaBottom();

		//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
		if (this._haveQuestionImage())
		{
			questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);
		}

		let btnHeight = 77;

		//ボタンの表示位置(Y)。テキストの底から余白とボタンの高さ半分を下げた位置
		questionTextBottom -= btnHeight / 2 + this.MARGIN_TEXT_TO_BTNS_AREA;

		let startY = questionTextBottom;
		let btnCount = candidates.length;
		/*
		for (let i = 0; i < candidates.length; i++)
		{
			if (candidates[i] == "" || candidates[i] == undefined)
			{
				btnCount = i;
				break;
			}
		}
		*/

		questionTextBottom -= (btnCount - 1) * intervalY + btnHeight / 2 + this.MARGIN_BTNS_TO_BOTTOM;
		questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);

		let poss = [cc.v2(posX, startY - intervalY * 0), cc.v2(posX, startY - intervalY * 1), cc.v2(posX, startY - intervalY * 2), cc.v2(posX, startY - intervalY * 3)];


		//回答ガイド、ボタン2つ目と3つ目の間に表示
		this._answerGuide.setY(this.node, startY - intervalY * 1.5);


		//問題ボタンを作成
		this._createAnswerButtons(candidates, poss, undefined, undefined);
	}


	_onSelect (answerButton:AnsButton)
	{
		answerButton.changeSelect();

		//選択中は左にずれる
		let posX:number = answerButton.isSelected() ? -40 : 0;
		answerButton.node.runAction(
			cc.moveTo(0.3 , posX, answerButton.node.y).easing(cc.easeBackOut())
		);

		let enterFlg = false;
		for (let i = 0; i < this._answerBtns.length; i++)
		{
			if (this._answerBtns[i].isSelected())
			{
				enterFlg = true;
				break;
			}
		}

		this._btnEnter.interactable = enterFlg;
		this._btnReset.interactable = enterFlg;
	}


    onPressEnterButton ()
	{
		this._btnEnter.interactable = false;
		this._btnReset.interactable = false;

		this._enterCallback();

		this._allButtonsLock(true);

		for(let i:number = 0 ; i < this._answerBtns.length ; i ++)
		{
			if(this._answerBtns[i].isSelected())
			{
				this._answerBtns[i].resultWait();		//結果待ちカラー
				this._answerBtns[i].shakeFill();
			}
		}
		

	   //待ち時間
	   this._answerWait(()=>
	   {
		   this._showAnswer();
	   });
	}


	//待ち演出。１つずつ正解を確かめる
	_answerWait(callback:()=>void):void
	{
		let answers:string[] = this._qData.correct_answer.split(StaticData.QUESTION_SPLIT_WORD);

		let __IS_CORRECT__:(index:number)=>number = (index:number)=>
		{
			if(index >= this._answerBtns.length) return 0;

			let btn:AnsButton = this._answerBtns[index];
			let correct_target:boolean = answers.indexOf(btn.getAnswer()) > -1;		//選択対象かどうか
			let isCorrect:boolean = (correct_target == btn.isSelected());			//そのボタンの選択が正解かどうか
			return (isCorrect) ? 1 : 2;
		};
		
		let __FUNC__:(index:number, isCorrect:boolean)=>void = (index:number, isCorrect:boolean)=>
		{
			if(index >= this._answerBtns.length) return;

			let btn:AnsButton = this._answerBtns[index];

			if(isCorrect)
			{
				//正解音
				SE.play(GameSE.clip.pinpon);

				//エフェクト
				let effect:cc.Sprite = this.miniMarubatsuSprites[index];
				effect.node.scale = 0.5;
				effect.node.x = btn.node.x - 200;
				effect.node.y = btn.node.y;
				effect.node.active = true;
				effect.node.runAction(
					cc.scaleTo(0.3, 1.5).easing(cc.easeBackOut())
				);

				btn.node.scale = 0.4;
				btn.node.runAction(
					cc.scaleTo(0.3, 1.1).easing(cc.easeBackOut())
				)
			}
			else
			{
				//不正解音
				SE.play(GameSE.clip.batsu);

				btn.node.runAction(
					cc.rotateTo(0.2, 7.5).easing(cc.easeBackOut())
				);
			}
		};
		
		

		let corrects:number[] = [];		//0...なし / 1...正解 / 2...不正解

		//全ボタンの正解・不正解を調べ、xを初期位置に戻す
		for (let i = 0; i < this._answerBtns.length; i++)
		{
			this._answerBtns[i].node.runAction(
				cc.moveTo(0.3 , 0, this._answerBtns[i].node.y).easing(cc.easeBackOut())
			);

			corrects.push(__IS_CORRECT__(i));
		}


		//試しに変えてみる

		/*
		//1つずつ入力欄を見ていく。正解すれば一瞬拡大、間違うと斜めになる
		const BaseTime:number = 1.0;

		for(let i:number = 0 ; i < this._answerBtns.length ; i ++)
		{
			//1文字ずつ正解・不正解アクション
			let correct:boolean = corrects[i] == 1;
			this._answerMiniCheck(this._answerBtns[i].node, 0.5 * i + BaseTime, correct, cc.v2(-200,0), -15, -5);
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
		*/


		
		let waitTimes:number[] = [0, 0.3, 0.6];		//ボタン無し、正解、不正解　時の待ち時間

		this.node.runAction(
			cc.sequence(
				cc.delayTime(0.5),
				cc.callFunc(()=>{ __FUNC__(0, corrects[0] == 1); }),
				cc.delayTime(waitTimes[corrects[0]]),
				cc.callFunc(()=>{ __FUNC__(1, corrects[1] == 1); }),
				cc.delayTime(waitTimes[corrects[1]]),
				cc.callFunc(()=>{ __FUNC__(2, corrects[2] == 1); }),
				cc.delayTime(waitTimes[corrects[2]]),
				cc.callFunc(()=>{ __FUNC__(3, corrects[3] == 1); }),
				cc.delayTime(waitTimes[corrects[3]]),
				cc.delayTime(0.3),
				cc.callFunc(()=>
				{
					for(let i:number = 0 ; i < this.miniMarubatsuSprites.length ; i ++)
					{
						this.miniMarubatsuSprites[i].node.active = false;
					}
					
					callback();
				}),
			)
		);
		
	}


	_showAnswer()
	{
		let rightBtns = [];
		let wrongBtns = [];
		
		let answers = this._qData.correct_answer.split(StaticData.QUESTION_SPLIT_WORD);

		for (let i = 0; i < this._answerBtns.length; i++)
		{
			this._answerBtns[i].lock(true);

			let word = this._answerBtns[i].getAnswer();

			//あとで使うので選択が必要なボタン、不要なボタンをまとめる
			if (answers.indexOf(word) > -1) rightBtns.push(this._answerBtns[i]);
			else wrongBtns.push(this._answerBtns[i]);
		}

		//--- 下準備終わり ---

		let correctAnswer:boolean = true;
		let sendAnswer:string = "";

		for (let i = 0; i < this._answerBtns.length; i++)
		{
			let word:string = this._answerBtns[i].getAnswer();

			//選択中
			if (this._answerBtns[i].isSelected())
			{
				sendAnswer += word + StaticData.QUESTION_SPLIT_WORD;
				
				if (answers.indexOf(word) == -1)
				{
					correctAnswer = false;		//間違ってるのを選択してる（正解リストに含まれてない）
					break;
				}
			}
			//非選択
			else
			{
				if (answers.indexOf(word) > -1)
				{
					correctAnswer = false;		//選択してない（正解リストに含まれている）
					break;
				}
			}
		}

		if(sendAnswer.length > 0) sendAnswer = sendAnswer.substr(0, sendAnswer.length - 1);

		//タイムアップ時
		if(this._isTimeUp)
		{
			correctAnswer = false;

			this._btnEnter.interactable = false;
			this._btnReset.interactable = false;
			this._allButtonsLock(true);
		}

		cc.log("結果:" + correctAnswer);

		//正しい選択に色を付ける。選択中のカラーは解除。付ける色は正解、不正解で変える
		if (correctAnswer)
		{
			for (let i = 0; i < rightBtns.length; i++)
			{
				rightBtns[i].rightAnswer();
			}
		}
		else
		{
			for (let i = 0; i < rightBtns.length; i++)
			{
				rightBtns[i].wrongAnswer();
				rightBtns[i].popAction();
			}
		}

		for (let i = 0; i < wrongBtns.length; i++)
		{
			wrongBtns[i].selectCanceled();		//選択中かもしれないので戻す
		}

		if (correctAnswer)
		{
			this._answerCallback(AC.ANSWER_CODE_RIGHT, sendAnswer);		//1:正解
		}
		else
		{
			this._answerCallback(this._isTimeUp ? AC.ANSWER_CODE_TIME_UP : AC.ANSWER_CODE_WRONG, sendAnswer);		//0:間違い / 2:時間切れ
		}
	}


	onPressResetButton ()
	{
		for (let i = 0; i < this._answerBtns.length; i++)
		{
			if (this._answerBtns[i].isSelected())
			{
				this._answerBtns[i].selectCanceled();
				this._answerBtns[i].popAction();
			}
		}

		this._btnEnter.interactable = false;
		this._btnReset.interactable = false;
	}


	timeUp()
    {
		super.timeUp();
		this._showAnswer();
    }

    
	
}
