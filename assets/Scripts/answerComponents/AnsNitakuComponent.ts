//---------------------------------------
// 二択問題
//---------------------------------------

import AC from "./AC";
import AnsButton from "./AnsButton";
import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";
import GameMain from "../game/GameMain";
import QuestionData from "../game/QuestionData";
import SE from "../common/SE";
import QuestionWindow from "../game/QuestionWindow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsNitakuComponent extends AC {

	@property(cc.Prefab) ansButtonLongPrefab: cc.Prefab = null;			//タテ2択　フォーマット用
	@property(cc.Prefab) ansButtonLongRows2Prefab: cc.Prefab = null;			//タテ2択　2行表示フォーマット用


	_defaultAnsButtonPrefab :cc.Prefab = null;



	public getRespondFormats():string[]
	{
		return ["ヨコ2択", "タテ2択"];
	}


    
    setup (questionWindow:QuestionWindow, questionData:QuestionData)
    {
		if (this._defaultAnsButtonPrefab == null)
		{
			this._defaultAnsButtonPrefab = this.ansButtonPrefab;
		}

		/*
		//回答一覧をシャッフル
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
		
		super.setup (questionWindow, questionData);		//スーパークラスのsetup

        let candidates:string[] = [
            questionData.option1, questionData.option2
        ];

		//テキストの底のy座標
		let questionTextBottom:number = this._getQuestionTextAreaBottom();

		//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
		if (this._haveQuestionImage())
		{
			questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);
		}

		//回答ガイド、ボタンの上面からやや下(40)に表示
		//this._answerGuide.setY(this.node, questionTextBottom - cc.MyAC.MARGIN_TEXT_TO_BTNS_AREA - 40);

		//読み仮名などをとった最大文字数を取得
		let needRow2Formats:boolean[] = [false, false];
		let maxCandiateLen:number = 0;
		{
			let textStrL:string = SchoolText.getTextString(candidates[0]).textStr;
			let textStrR:string = SchoolText.getTextString(candidates[1]).textStr;
			
			//画像の場合は1文字として考える
			let qTextL = (textStrL.indexOf(".png") > -1 || textStrL.indexOf(".jpg") > -1) ? 1 : textStrL.length;
			let qTextR = (textStrR.indexOf(".png") > -1 || textStrR.indexOf(".jpg") > -1) ? 1 : textStrR.length;
			maxCandiateLen = (qTextL > qTextR) ? qTextL : qTextR;

			if(qTextL > this._ANSWER_LONG_BTN_TEXT_LENGTH) needRow2Formats[0] = true;
			else if(textStrL.indexOf("\n") >= 0) needRow2Formats[0] = true;

			if(qTextR > this._ANSWER_LONG_BTN_TEXT_LENGTH) needRow2Formats[1] = true;
			else if(textStrR.indexOf("\n") >= 0) needRow2Formats[1] = true;
		}

		//テキストの底の座標から余白分、下げる
		questionTextBottom -= this.MARGIN_TEXT_TO_BTNS_AREA;


		//-------------------

		let textFormat:STFormat = undefined;		//標準の文字フォーマット
		let poss = [];
		let btnHeight:number;
		let btnPosY:number;

		if (questionData.format == "ヨコ2択")
		{
			btnHeight = 270;
			questionTextBottom -= btnHeight / 2;		//ボタンの高さ半分を更に下げる
			btnPosY = questionTextBottom
			
			this.ansButtonPrefab = this._defaultAnsButtonPrefab;	//正方形ボタンにする

			poss = [cc.v2(-145, btnPosY), cc.v2(145, btnPosY)];

			//回答ガイド、ボタンの中央からやや上(90)に表示
			this._answerGuide.setY(this.node, btnPosY + 90);

			//文字フォーマット（文字数で変化）
			textFormat = AnsButton.getTextFormat_BtnBoxL(maxCandiateLen);


			//問題ウィンドウの高さ
			questionTextBottom -= btnHeight / 2 + this.MARGIN_BTNS_TO_BOTTOM;
			questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);

			//問題ボタンを作成
			this._createAnswerButtons(candidates, poss, undefined, textFormat);


		}
		else if (questionData.format == "タテ2択")
		{
			//フォーマット（2行対応仕様）
			textFormat = STFormat.create(
			{
				size: 36,
				margin: 2,
				lineHeight: 44,
				rows: 2,
				columns: this._ANSWER_LONG_BTN_TEXT_LENGTH,
				horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
				verticalAlign:SchoolText.VERTICAL_ALIGN_CENTER,
				color: cc.color(0, 0, 0),
			});

			//--------------------------
			
			let BTNS_MARGIN:number = 15;		//ボタン間の間隔
			let prefabs:cc.Prefab[] = [];
			let guideY:number = 0;
			
			//ボタンの数だけループ
			for(let i:number = 0 ; i < 2 ; i ++)
			{
				// 2行用のボタン
				if(needRow2Formats[i])
				{
					prefabs.push(this.ansButtonLongRows2Prefab);
					btnHeight = 137;
				}
				// 1行用のボタン
				else
				{
					prefabs.push(this.ansButtonLongPrefab);
					btnHeight = 77;
				}

				//ボタンの高さの半分を下げる
				questionTextBottom -= btnHeight / 2;

				poss.push(cc.v2(0, questionTextBottom));

				//もう一度、ボタンの高さの半分を下げる
				questionTextBottom -= btnHeight / 2;

				if(i == 0)
				{
					guideY = questionTextBottom -= BTNS_MARGIN / 2;
				}

				//ボタン間の幅だけ下げる
				questionTextBottom -= BTNS_MARGIN;
			}
			
			//下げすぎた最後の分を戻す
			questionTextBottom += BTNS_MARGIN;

			//回答ガイド、2つのボタンの間に表示
			this._answerGuide.setY(this.node, guideY);
			
			//問題ウィンドウの高さ
			questionTextBottom -= this.MARGIN_BTNS_TO_BOTTOM;
			questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);

			//問題ボタンを作成
			this._createAnswerButtonsWithPrefabs(prefabs, candidates, poss, undefined, textFormat);

			
			
			/*
			btnHeight = (needRow2Format) ? 137 : 77;
			questionTextBottom -= btnHeight / 2;		//ボタンの高さ半分を更に下げる
			btnPosY = questionTextBottom
			
			let intervalY = (needRow2Format) ? 152 : 92;
			
			poss = [cc.v2(0, btnPosY), cc.v2(0,btnPosY - intervalY)];//仮
			questionTextBottom -= intervalY;

			//回答ガイド、2つのボタンの間に表示
			this._answerGuide.setY(this.node, questionTextBottom + intervalY / 2);

			if(needRow2Format)
			{
				this.ansButtonPrefab = this.ansButtonLongRows2Prefab;		//2行の横長ボタンにする

				textFormat = STFormat.create(
					{
						size: 36,
						margin: 2,
						lineHeight: 44,
						rows: 2,
						columns: 8,
						horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
						verticalAlign:SchoolText.VERTICAL_ALIGN_CENTER,
						color: cc.color(0, 0, 0),
					});
			}
			else
			{
				this.ansButtonPrefab = this.ansButtonLongPrefab;		//1行の横長ボタンにする
			}


			//問題ウィンドウの高さ
			questionTextBottom -= btnHeight / 2 + this.MARGIN_BTNS_TO_BOTTOM;
			this._gameMain.setQuestionBoardHeight(questionTextBottom, this.node);

			//問題ボタンを作成
			this._createAnswerButtons(candidates, poss, undefined, textFormat);
			*/
		}

	}


	

	/**
	 * 選択時（オーバーライド）
	 * @param answerButton 
	 */
    _onSelect (answerButton:AnsButton)
	{
		this._commonSelectedAnswerButton = answerButton;
		
		this._enterCallback();

		this._allButtonsLock(true);		//ここのボタンロックで押したボタンも半透明になってる
		answerButton.resultWait();		//結果待ちカラー
		answerButton.shakeFill();

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
		let answerButton:AnsButton = this._commonSelectedAnswerButton;
		
		let selectIndex :number = this._answerBtns.indexOf(answerButton);
		//let defPosY :number = answerButton.node.y;
		let defScale :number = answerButton.getDefaultScale();
		
		for(let i:number = 0 ; i < this._answerBtns.length ; i ++)
		{
			let startScale:number = (i == selectIndex) ? defScale * 1.2 : defScale * 0.8;
			let endScale:number = (i == selectIndex) ? defScale * 0.8 : defScale * 1.2;

			this._answerBtns[i].node.runAction(
				cc.sequence(
					cc.delayTime(0.5),

					cc.callFunc(()=>
					{
						SE.play(this.ketteiSE);
					}),
					cc.scaleTo(0.02, startScale),
					cc.delayTime(0.1),
					cc.scaleTo(0.05, endScale),
					cc.delayTime(0.1),
					cc.scaleTo(0.05, startScale),
					cc.delayTime(0.1),
					cc.scaleTo(0.05, endScale),

					cc.delayTime(0.1),
					cc.scaleTo(0.05, defScale)
				)
			);

			/*
			let startY:number = (i == selectIndex) ? defPosY + 20 : defPosY;
			let endY:number = (i == selectIndex) ? defPosY : defPosY + 20;

			this._answerBtns[i].node.runAction(
				cc.sequence(
					cc.delayTime(1.0),

					cc.moveTo(0.02, cc.v2(this._answerBtns[i].node.x, startY)),
					cc.delayTime(0.2),
					cc.moveTo(0.05, cc.v2(this._answerBtns[i].node.x, endY)),
					cc.delayTime(0.2),
					cc.moveTo(0.05, cc.v2(this._answerBtns[i].node.x, startY)),
					cc.delayTime(0.2),
					cc.moveTo(0.05, cc.v2(this._answerBtns[i].node.x, endY)),

					cc.delayTime(0.2),
					cc.moveTo(0.05, cc.v2(this._answerBtns[i].node.x, defPosY))
				)
			);
			*/

		}


		// 2秒溜めてみる
		this.node.runAction(
			cc.sequence(
				cc.delayTime(1.5),
				cc.callFunc(()=>
				{
					callback();
				})
			)
		);
	}



	_showAnswer ()
	{
		let answerButton:AnsButton = this._commonSelectedAnswerButton;
		let answer:string = answerButton.getAnswer();

		//this._answerBtns[0].node.scale = this._answerBtns[0].getDefaultScale();
		//this._answerBtns[1].node.scale = this._answerBtns[1].getDefaultScale();
		
		
		let correctAnswer:boolean = (answer == this._qData.correct_answer);
		cc.log("結果:" + correctAnswer);

		if(correctAnswer)
		{
			answerButton.rightAnswer();

			//正解ボタンをでかくする
			answerButton.node.scale = answerButton.getDefaultScale() * 0.6;
			answerButton.node.runAction(cc.scaleTo(0.3, answerButton.getDefaultScale() * 1.2).easing(cc.easeBackOut()))
			
			this._answerCallback(AC.ANSWER_CODE_RIGHT, answer);		//1:正解
		}
		else
		{
			//間違い

			answerButton.normalColor();

			this._wrongAnswer(answer);
		}
	}



	//間違い時
	_wrongAnswer (answer:string)
	{
		this._allButtonsLock(true);
		
		//正解の文字を色付けする
		for (let i = 0; i < this._answerBtns.length; i++)
		{
			if(this._answerBtns[i].getAnswer() == this._qData.correct_answer)
			{
				this._answerBtns[i].wrongAnswer();
				this._answerBtns[i].shakeFill();

				//正解ボタンをでかくする
				this._answerBtns[i].node.scale = this._answerBtns[i].getDefaultScale() * 0.6;
				this._answerBtns[i].node.runAction(cc.scaleTo(0.3, this._answerBtns[i].getDefaultScale() * 1.2).easing(cc.easeBackOut()))
			}
		}
		
		this._answerCallback(this._isTimeUp ? AC.ANSWER_CODE_TIME_UP : AC.ANSWER_CODE_WRONG, answer);		//0:間違い / 2:時間切れ
	}


	timeUp ()
    {
		super.timeUp();
		this._wrongAnswer(this._TIME_UP_ANSWER);
    }


}
