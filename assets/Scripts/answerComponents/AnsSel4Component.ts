//---------------------------------------
// 四択
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
export default class AnsSel4Component extends AC {

    @property(cc.Prefab) ansButtonSquarePrefab: cc.Prefab = null;		//2x2並び用のボタン
	@property(cc.Prefab) ansButtonYokoPrefab: cc.Prefab = null;		//横並び用のボタン
	@property(cc.Prefab) ansButtonLongRows2Prefab: cc.Prefab = null;		//縦4択（2行）用のボタン
	@property(cc.Prefab) rensouTimerPrefab: cc.Prefab = null;		//連想問題用タイマー
	//debugLineNode: cc.Node,

	_defaultAnsButtonPrefab :cc.Prefab = null;
	_rensouTimerIcons :cc.Node[] = null;



	public getRespondFormats():string[]
	{
		return ["ヨコ4択", "タテ4択", "スクエア4択", "連想"];
	}



    setup (questionWindow:QuestionWindow, questionData:QuestionData)
    {
		if (this._defaultAnsButtonPrefab == null)
		{
			this._defaultAnsButtonPrefab = this.ansButtonPrefab;
		}

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

        let candidates:string[] = [
            questionData.option1, questionData.option2, questionData.option3, questionData.option4
		];
		
		let intervalY = 92;
		let startY = 414;
		let posX = 0;

		//テキストの底のy座標
		let questionTextBottom = this._getQuestionTextAreaBottom();

		//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
		if (this._haveQuestionImage())
		{
			questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);
		}

		//-----------------------------------------
		
		let textFormat:STFormat = undefined;
		let poss = [];
		let maxCandiateLen = 0;
		let needRow2Formats:boolean[] = [];

		for (let i = 0; i < candidates.length; i++)
		{
			let dispStr:string = SchoolText.getTextString(candidates[i]).textStr;
			//画像の場合は1文字として考える
			let tLen = (dispStr.indexOf(".png") > -1 || dispStr.indexOf(".jpg") > -1) ? 1 : dispStr.length;

			if(tLen > this._ANSWER_LONG_BTN_TEXT_LENGTH) needRow2Formats.push(true);
			else if(dispStr.indexOf("\n") >= 0) needRow2Formats.push(true);
			else needRow2Formats.push(false);		//1行でよい

			
			if (maxCandiateLen < tLen) maxCandiateLen = tLen;
		}
		
		//-------------------------------
		// 正方形ボタンが横並び４つ
		//
		if (questionData.format == "ヨコ4択")
		{
			this.ansButtonPrefab = this.ansButtonYokoPrefab;		//ボタンを専用のに変える
			this._answerBtnDefaultScale = 1.0;

			let btnHeight = 162 * this._answerBtnDefaultScale;

			//ボタンの表示位置(Y)。テキストの底から余白とボタンの高さ半分を下げた位置
			questionTextBottom -= btnHeight / 2 + this.MARGIN_TEXT_TO_BTNS_AREA;
			startY = questionTextBottom;
			questionTextBottom -= btnHeight / 2;	//底ギリギリ


			let intervalX = 176; //ボタンの横幅は162

			poss = [cc.v2(-1.5 * intervalX, startY), cc.v2(-0.5 * intervalX, startY), cc.v2(0.5 * intervalX, startY), cc.v2(1.5 * intervalX, startY)];

			//textFormat = AnsButton.getTextFormat_BtnBoxL(maxCandiateLen);
			textFormat = this._getTextFormat_Yoko4taku(maxCandiateLen);

			//回答ガイド、ボタンのやや下(-100)に表示
			this._answerGuide.setY(this.node, startY - 80);

		}
		//-------------------------------
		// ボタンが2x2並び
		//
		else if (questionData.format == "スクエア4択")
		{
			this.ansButtonPrefab = this.ansButtonSquarePrefab;		//ボタンを専用のに変える
			this._answerBtnDefaultScale = 0.9;

			let btnHeight:number = 184 * this._answerBtnDefaultScale;
			let intervalX:number = 260;
			let intervalY:number = 196;

			//ボタンの表示位置(Y)。テキストの底から余白とボタンの高さ半分を下げた位置
			questionTextBottom -= btnHeight / 2 + this.MARGIN_TEXT_TO_BTNS_AREA;
			startY = questionTextBottom;
			questionTextBottom -= btnHeight / 2 + intervalY;		//底ギリギリ

			poss = [cc.v2(-0.5 * intervalX, startY), cc.v2(0.5 * intervalX, startY), cc.v2(-0.5 * intervalX, startY - intervalY), cc.v2(0.5 * intervalX, startY - intervalY)];

			textFormat = AnsButton.getTextFormat_BtnBoxL(maxCandiateLen);

			//回答ガイド、ボタン群の中央に表示
			this._answerGuide.setY(this.node, startY - intervalY / 2);

		}
		//-------------------------------
		// 横長ボタンが縦に４つ (改行のある場合は縦幅が長めに)
		//
		else if (questionData.format == "タテ4択" || questionData.format == "連想")
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
			let btnHeight:number;
			let prefabs:cc.Prefab[] = [];
			poss = [];

			//ボタンの表示位置(Y)。テキストの底から余白を下げた位置
			questionTextBottom -= this.MARGIN_TEXT_TO_BTNS_AREA;

			//ボタンの数だけループ
			for(let i:number = 0 ; i < candidates.length ; i ++)
			{
				// 2行用のボタン
				if(needRow2Formats[i])
				{
					prefabs.push(this.ansButtonLongRows2Prefab);
					btnHeight = 137;
					//intervalY = 152;
				}
				// 1行用のボタン
				else
				{
					prefabs.push(this._defaultAnsButtonPrefab);
					btnHeight = 77;
					//intervalY = 92;
				}

				//ボタンの高さの半分を下げる
				questionTextBottom -= btnHeight / 2;

				poss.push(cc.v2(posX, questionTextBottom));

				//もう一度、ボタンの高さの半分を下げる
				questionTextBottom -= btnHeight / 2;

				//ボタン間の幅だけ下げる
				questionTextBottom -= BTNS_MARGIN;
			}

			//下げすぎた最後の分を戻す
			questionTextBottom += BTNS_MARGIN;

			//回答ガイド、ボタン2つ目と3つ目の間に表示
			this._answerGuide.setY(this.node, (poss[1].y + poss[2].y) / 2);



			/*
			//ボタンの表示位置(Y)。テキストの底から余白とボタンの高さ半分を下げた位置
			questionTextBottom -= btnHeight / 2 + this.MARGIN_TEXT_TO_BTNS_AREA;
			startY = questionTextBottom;
			questionTextBottom -= btnHeight / 2 + (candidates.length - 1) * intervalY;

			poss = [cc.v2(posX, startY - intervalY * 0), cc.v2(posX, startY - intervalY * 1), cc.v2(posX, startY - intervalY * 2), cc.v2(posX, startY - intervalY * 3)];


			//回答ガイド、ボタン2つ目と3つ目の間に表示
			this._answerGuide.setY(this.node, startY - intervalY * 1.5);
			*/



			//問題ウィンドウの高さ(余白分を含める)
			questionTextBottom -= this.MARGIN_BTNS_TO_BOTTOM;
			questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);


			//問題ボタンを作成
			this._createAnswerButtonsWithPrefabs(prefabs,  candidates, poss, undefined, textFormat);

			return;
		}


		//----- ↓　タテ4択　以外の設定 --------------

		//問題ウィンドウの高さ(余白分を含める)
		questionTextBottom -= this.MARGIN_BTNS_TO_BOTTOM;
		questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);


		//問題ボタンを作成
		this._createAnswerButtons(candidates, poss, undefined, textFormat);
	}


	//オーバーライド
	startQuestion (callback)
	{
		//------------------------------------------------
		// 四択
		//
		if (this._qData.format != "連想")
		{
			super.startQuestion (callback);		//スーパークラスのstartQuestion
			return;
		}

		//------------------------------------------------
		// 連想問題
		//

		//タイマーアイコンが登場
		this._rensouTimerIcons = [];
		
		let qList = this._qData.question.split("\n");
		let totalDuration = 1.0 + (qList.length - 1) * 2.0;

		//問題文の各行のY座標を取得
		let textPosYs:number[] = this._questionOutput.getTextPosYs();

		let wPos = this._questionOutput.node.convertToWorldSpaceAR(cc.v2(0,0));
		let lPos = this.node.convertToNodeSpaceAR(wPos);
		let baseY = lPos.y - this._questionOutput.getTextFormat().size / 2;

		//1行目は問題文なので2行目から設置
		for (let i = 1; i < qList.length; i++)
		{
			//タイマーアイコンを出す
			let timerNode = cc.instantiate(this.rensouTimerPrefab);
			this.node.addChild(timerNode);

			timerNode.x = -200;
			timerNode.y = baseY + textPosYs[i];

			let duration = 1.0 + i * 2.0;

			let barNode = timerNode.children[1];
			barNode.scaleX = duration / totalDuration;

			this._rensouTimerIcons.push(barNode);
		}
			
			
		//問題ボタンが飛び出す（空ボタン）
		this._popupAnswerButtons(() =>
		{
			//画像の表示
			this._showQImage();
			
			//問題ボタンのテキストを表示してロック解除
			this._showAnswerButtonsTexts();

			//問題の表示開始(連想問題用の表示)
			this._showRensouQuestion();

			//問題開始、タイマー動作開始
			callback();

		});
		
	}



	//連想問題用。１行ずつ時間差で表示する
	_showRensouQuestion ()
	{
		//1行ずつ徐々に表示
		let qList = this._qData.question.split("\n");
		//let qList = qData.question.split(",");

		//先に表示準備をする（レイアウトなど）
		this._questionOutput.preShowLine();

		//問題１行目の表示
		this._questionOutput.showLine(0);

		//2行目以降はタイマーのあと徐々に表示
		for (let i = 1; i < qList.length; i++)
		{
			//タイマーバーを進める
			let barNode = this._rensouTimerIcons[i - 1];
			let duration = 1.0 + (i - 1) * 2.0;

			barNode.runAction(
				cc.sequence(
					cc.scaleTo(duration, 0, 1),
					cc.callFunc(() =>
					{
						//barNode.parent.removeFromParent(true);
						barNode.parent.active = false;
						this._questionOutput.showLine(i);
					})
				)
			);
		}
	}
	


	_onSelect (answerButton:AnsButton)
	{
		this._commonSelectedAnswerButton = answerButton;
		
		this._enterCallback();

		
		if (this._qData.format == "連想")
		{
			for(let i = 0 ; i < this._rensouTimerIcons.length ; i ++)
			{
				this._rensouTimerIcons[i].stopAllActions();
			}
		}
		

		this._allButtonsLock(true);


		//結果待ち演出
		answerButton.resultWait();		//結果待ちカラー
		answerButton.shakeFill();

		this._answerWait(()=>
		{
			this._showAnswer();
		});
	}



	_showAnswer():void
	{
		let answerButton = this._commonSelectedAnswerButton;
		let answer:string = answerButton.getAnswer();

		let correctAnswer = (answer == this._qData.correct_answer);
		cc.log("結果:" + correctAnswer);

		if(correctAnswer)
		{
			answerButton.rightAnswer();
			answerButton.popBig();		//追加
			
			this._answerCallback(AC.ANSWER_CODE_RIGHT, answer);		//1:正解
		}
		else
		{
			//間違い時
			this._wrongAnswer(answer);
		}
	}



	/**
	 * 結果待ち演出
	 */
	protected _answerWait(callback:()=>void):void
	{
		let centerY:number = 0;
		for (let i:number = 0 ; i < this._answerBtns.length ; i ++)
		{
			centerY += this._answerBtns[i].node.y;
		}
		centerY /= this._answerBtns.length;

		let resNode: cc.Node = new cc.Node();
		resNode.x = 0;
		resNode.y = centerY;
		this.node.addChild(resNode);


		for (let i:number = 0 ; i < this._answerBtns.length ; i ++)
		{
			let wPos:cc.Vec2 = this._answerBtns[i].node.convertToWorldSpaceAR(cc.v2(0,0));
			let lPos:cc.Vec2 = resNode.convertToNodeSpaceAR(wPos);
			this._answerBtns[i].node.setPosition(lPos);

			this._answerBtns[i].node.removeFromParent(false);
			resNode.addChild(this._answerBtns[i].node);
		}

		let scales:number[] = [1.1, 1.25, 1.4];
		if(this._qData.format == "ヨコ4択") scales = [1.1, 1.15, 1.2];

		resNode.runAction(
			cc.sequence(
				cc.delayTime(0.5),
				cc.callFunc(()=>
				{
					SE.play(this.ketteiSE);
				}),
				cc.scaleTo(0.05, scales[0]),
				cc.delayTime(0.45),
				cc.scaleTo(0.05, scales[1]),
				cc.delayTime(0.45),
				cc.scaleTo(0.05, scales[2]),

				cc.delayTime(0.5),
				cc.callFunc(()=>
				{
					callback();
				})
			)
		);
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
				this._answerBtns[i].popBig();	//追加
			}
		}

		this._answerCallback(this._isTimeUp ? AC.ANSWER_CODE_TIME_UP : AC.ANSWER_CODE_WRONG, answer);		//0:間違い / 2:時間切れ
	}


	timeUp ()
    {
		super.timeUp();
		this._wrongAnswer(this._TIME_UP_ANSWER);
	}
	

	removeComponent ()
	{
		super.removeComponent();

		if (this._qData.format == "連想")
		{
			for(let i = 0 ; i < this._rensouTimerIcons.length ; i ++)
			{
				this._rensouTimerIcons[i].parent.removeFromParent(true);
				this._rensouTimerIcons[i] = null;
			}
			this._rensouTimerIcons = null;
		}

	}


	callMe ()
    {
		cc.log("CALL SEL4");

		//継承した親クラスのcallMe()を実行
		super.callMe();

		//この方法だと好きなメソッドが呼べる
		//cc.MyAC.prototype.callMe.call();
	}


	/**
	 * ヨコ４択のフォーマットを取得
	 * @param length 最大文字数
	 */
	_getTextFormat_Yoko4taku (length:number):STFormat
	{
		if(length == 1)
		{
			let format:{} =
			{
				size: 96,
				margin: 2,
				lineHeight: 86,
				rows: 1,
				columns: 2,
				horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
				verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
				color: cc.color(0, 0, 0),
				yomiganaSize: 20,
				yomiganaMarginY: 2
			};
			
			return STFormat.create(format);
		}
		else if(length == 2)
		{
			let format:{} =
			{
				size: 64,
				margin: 2,
				lineHeight: 86,
				rows: 1,
				columns: 3,
				horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
				verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
				color: cc.color(0, 0, 0),
				yomiganaSize: 20,
				yomiganaMarginY: 2
			};
			
			return STFormat.create(format);
		}
		else if(length == 3)
		{
			let format:{} =
			{
				size: 48,
				margin: 0,
				lineHeight: 86,
				rows: 1,
				columns: 4,
				horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
				verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
				color: cc.color(0, 0, 0),
				yomiganaSize: 20,
				yomiganaMarginY: 2
			};
			
			return STFormat.create(format);
		}
		else if(length == 4)
		{
			let format:{} =
			{
				size: 38,
				margin: 0,
				lineHeight: 86,
				rows: 1,
				columns: 5,
				horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
				verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
				color: cc.color(0, 0, 0),
				yomiganaSize: 20,
				yomiganaMarginY: 2
			};
			
			return STFormat.create(format);
		}
		else if(length == 5)
		{
			let format:{} =
			{
				size: 30,
				margin: 0,
				lineHeight: 86,
				rows: 1,
				columns: 6,
				horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
				verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
				color: cc.color(0, 0, 0),
				yomiganaSize: 20,
				yomiganaMarginY: 2
			};
			
			return STFormat.create(format);
		}
		return null;
	}
	
}
