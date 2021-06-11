//---------------------------------------
// マルバツ
//---------------------------------------

import SE from "../common/SE";
import GameMain from "../game/GameMain";
import QuestionData from "../game/QuestionData";
import QuestionWindow from "../game/QuestionWindow";
import AC from "./AC";
import AnsButton from "./AnsButton";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsMaruBatsuComponent extends AC {

	@property(cc.SpriteFrame) maruSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) batsuSpriteFrame: cc.SpriteFrame = null;


	public getRespondFormats():string[]
	{
		return ["マルバツ"];
	}



    setup (questionWindow:QuestionWindow, questionData:QuestionData)
    {
        super.setup(questionWindow, questionData);		//スーパークラスのsetup

		let candidates = ["TRUE", "FALSE"];

		//分離型
        //let poss = [ cc.v2(-135, 320), cc.v2(135, 320) ];

		//一体型
		//let questionOutputHeight = this._questionOutput.getContentsHeight();		//テキストの高さ

		

		//適当。550は画面下から中央までの高さ、400はquestionBoardのy座標。160はボタンの下げる高さ(ないとテキストの下にボタン中央がフィットする)
		//let btnPosY = 550 + 400 + this._questionOutput.node.y - questionOutputHeight - 160;
		//let poss = [cc.v2(-135, btnPosY), cc.v2(135, btnPosY)];

		//テキストの底のy座標
		let questionTextBottom = this._getQuestionTextAreaBottom();

		//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
		if (this._haveQuestionImage())
		{
			questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);
		}

		//回答ガイド、ボタンの上面からやや下(40)に表示
		this._answerGuide.setY(this.node, questionTextBottom - this.MARGIN_TEXT_TO_BTNS_AREA - 40);


		let btnHeight = 270;

		//ボタンの表示位置(Y)。テキストの底から余白とボタンの高さ半分を下げた位置
		questionTextBottom -= this.MARGIN_TEXT_TO_BTNS_AREA + btnHeight / 2;

		let btnPosY = questionTextBottom;
		let poss = [cc.v2(-145, btnPosY), cc.v2(145, btnPosY)];

		//問題ウィンドウの高さ
		questionTextBottom -= btnHeight / 2 + this.MARGIN_BTNS_TO_BOTTOM;
		questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);



		//問題ボタンを作成
        this._createAnswerButtons(candidates, poss, undefined, undefined);

		//マルバツの画像を表示する
        this._answerBtns[0].setOutputImage(this.maruSpriteFrame, false);
		this._answerBtns[1].setOutputImage(this.batsuSpriteFrame, false);

    }


    _onSelect (answerButton)
	{
		this._commonSelectedAnswerButton = answerButton;
		
		this._enterCallback();
        
	    this._allButtonsLock(true);
	    answerButton.resultWait();		//結果待ちカラー
		answerButton.shakeFill();

	   //待ち時間
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
		let answerButton = this._commonSelectedAnswerButton;
		let answer = answerButton.getAnswer();
		let correctAnswer = (answer == this._qData.correct_answer);
		cc.log("結果:" + correctAnswer);
 
		if(correctAnswer)
		{
			answerButton.rightAnswer();
			answerButton.popBig(); 
			 
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
				this._answerBtns[i].popBig();
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
