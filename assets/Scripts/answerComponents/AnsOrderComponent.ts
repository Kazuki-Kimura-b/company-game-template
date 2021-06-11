//---------------------------------------
// 順番当て
//---------------------------------------

import AC from "./AC";
import AnsButton from "./AnsButton";
import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";
import StaticData from "../StaticData";
import QuestionData from "../game/QuestionData";
import SE from "../common/SE";
import QuestionWindow from "../game/QuestionWindow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsOrderComponent extends AC {

    @property(cc.Node) cursorNodes: cc.Node[] = [];
	@property(cc.Node) ansBoxParentNode: cc.Node = null;
	@property(cc.Prefab) ansBoxPrefab: cc.Prefab = null;

	private _inputBoxs :AnsButton[] = [];		//回答欄
	private _answers:AnsButton[] = [];		//選択するボタン。(this._answerBtns)キャンセル処理などあるので保持してる

	private readonly _COLOR_NORMAL :cc.Color = cc.color(255, 255, 255);
	private readonly _COLOR_RIGHT :cc.Color = cc.color(255, 255, 0);
	private readonly _COLOR_WRONG :cc.Color = cc.color(255, 0, 0);



	public getRespondFormats():string[]
	{
		return ["順番"];
	}


    //override
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

		super.setup(questionWindow, questionData);		//スーパークラスのsetup

		this._needEnterButton = false;
        this._needResetButton = true;

		this._answers = [];
		this._inputBoxs = [];
        
        let candidates = [
            questionData.option1, questionData.option2, questionData.option3, questionData.option4
		];
		
		if(questionData.option4 == null) candidates.pop();		//ボタンは3つ

        let intervalY = 90;
		//let startY = 310;
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


		let btnCount = 0;

		//-----------------------------------------------
		// プレハブから回答欄を作る
		{
			btnCount = candidates.length;

			//ボタンの数を取得（this._answerBtns.length　はまだ使えない）
			for (let i = 0; i < candidates.length; i++)
			{
				if (candidates[i] == "") {
					btnCount = i;
					break;
				}
			}


			let textFormat:{} =
			{
				size: 70,
				margin: 0,
				lineHeight: 70,
				rows: 1,
				columns: 1,
				horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
				verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
				color: cc.color(0, 0, 0),
			};

			let aPoss = [];
			if (btnCount == 3) aPoss = [-1, 0, 1];
			else if (btnCount == 4) aPoss = [-1.5, -0.5, 0.5, 1.5];

			//ボタンの数だけ回答欄を作る
			for (let i = 0; i < btnCount; i++)
			{
				let newNode = cc.instantiate(this.ansBoxPrefab);
				newNode.x = aPoss[i] * 190;

				this.ansBoxParentNode.addChild(newNode);

				let ansBtn:AnsButton = newNode.getComponent(AnsButton);
				ansBtn.setup(100, "", STFormat.create(textFormat), AC._defaultSTFont);
				ansBtn.lock(true);
				ansBtn.showFlush();

				ansBtn.onSelectCallback((answerButton) => {
					this.onPressCancelButton();		//キャンセルボタン
				});

				this._inputBoxs.push(ansBtn);
			}

			//ボタンの間にカーソルを作る
			for (let i = 0; i < btnCount - 1; i++)
			{
				let cursorNode = this.cursorNodes[i];
				cursorNode.x = (this._inputBoxs[i].node.x + this._inputBoxs[i + 1].node.x) / 2;
				cursorNode.active = true;
			}

			for (let i = btnCount - 1; i < this.cursorNodes.length; i++)
			{
				this.cursorNodes[i].active = false;
			}

			//回答欄の数で大きさを変える
			this.ansBoxParentNode.scale = (btnCount == 4) ? 0.8 : 1.0;
		}
		//-----------------------------------------------


		let inputBoxHeight = 119;

		// 回答欄
		questionTextBottom -= inputBoxHeight / 2 * this.ansBoxParentNode.scale + this.MARGIN_TEXT_TO_BTNS_AREA;
		this.ansBoxParentNode.y = questionTextBottom;
		this.ansBoxParentNode.active = false;

		questionTextBottom -= inputBoxHeight / 2 * this.ansBoxParentNode.scale + this.MARGIN_TEXT_TO_BTNS_AREA;

		let btnHeight = 77;

		questionTextBottom -= btnHeight / 2;
		let startY = questionTextBottom;
		let poss = [cc.v2(posX, startY - intervalY * 0), cc.v2(posX, startY - intervalY * 1), cc.v2(posX, startY - intervalY * 2), cc.v2(posX, startY - intervalY * 3)];


		questionTextBottom -= (btnCount - 1) * intervalY + btnHeight / 2 + this.MARGIN_BTNS_TO_BOTTOM;
		questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);


		//回答ガイド、ボタン2つ目と3つ目の間に表示
		this._answerGuide.setY(this.node, startY - intervalY * 0.5);

		//やや小さめのテキスト
		let answerBtnFormat:{} =
		{
			size: 32,
			margin: 1,
			lineHeight: 32,
			rows: 1,
			columns: 12,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
			verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
			color: cc.color(0, 0, 0),
		};

		//問題ボタンを作成
		this._createAnswerButtons(candidates, poss, undefined, STFormat.create(answerBtnFormat));

		//------------------------------------------------
        
        //ボタンに番号をつける
        let strs = ["①","②","③","④"];
        for(let i = 0 ; i < this._answerBtns.length ; i ++)
        {
            let label = this._answerBtns[i].subItemNodes[0].getComponent(cc.Label);
			label.string = strs[i];
			
			//ややテキストを右にずらす
			let outputText:SchoolText = this._answerBtns[i].getOutputText();
			outputText.node.x = 15;
        }



		

	}



	//override
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

			//回答欄が表示する
			this.ansBoxParentNode.active = true;

			//問題ボタンが飛び出す（空ボタン）
			this._popupAnswerButtons(undefined);

			//問題ボタンのテキストを表示してロック解除
			this._showAnswerButtonsTexts();

			//問題開始、タイマー動作開始
			callback();
		});
	}



	//-----------------------------------------------------
	// 回答ボタン（回答欄じゃない）を押したとき
	//
	//override
    protected _onSelect (answerButton:AnsButton):void
	{
		answerButton.changeSelect();

        let answerCheck:boolean = false;
        
        //選択解除した
        if(! answerButton.isSelected())
        {
            //選択解除したボタンより後に選択したボタンもすべて解除
            let index = this._answers.indexOf(answerButton);
            
            for(let i = this._answers.length - 1 ; i >= index  ; i --)
            {
                this._answers[i].selectCanceled();
                this._answers[i].popAction();

				this._inputBoxs[i].setText("");
				this._inputBoxs[i].lock(true);

                this._answers.pop();
            }
            
            return;
        }
        //選択した
        else
        {
            //回答欄に番号を表示
            let label = answerButton.subItemNodes[0].getComponent(cc.Label);

			this._inputBoxs[this._answers.length].setText(label.string);
			this._inputBoxs[this._answers.length].lock(false);				//キャンセルできるように


            this._answers.push(answerButton);

            if(this._answers.length == this._answerBtns.length)
            {
                answerCheck = true;
            }
        }

        //まだ未選択ボタンが残ってる
        if(! answerCheck)
        {
            let enterFlg = false;
            for (let i = 0; i < this._answerBtns.length; i++)
            {
                if (this._answerBtns[i].isSelected())
                {
                    enterFlg = true;
                    break;
                }
            }
            this._btnReset.interactable = enterFlg;

            return;
		}
		
		//-------------------------------------------------
		// すべてのボタンを選択したので答え合わせ

		this._enterCallback();

		this._allButtonsLock(true);
		for (let i = 0; i < this._inputBoxs.length; i ++)
		{
			this._inputBoxs[i].lock(true);
		}
		this._btnReset.interactable = false;


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
		let correctAnswers:string[] = this._qData.correct_answer.split(StaticData.QUESTION_SPLIT_WORD);
		
		//1つずつ入力欄を見ていく。正解すれば一瞬拡大、間違うと斜めになる
		for(let i = 0 ; i < this._answers.length ; i ++)
        {
			let correct:boolean = (this._answers[i].getAnswer() == correctAnswers[i]);
			this._answerMiniCheck(this._inputBoxs[i].node, 0.5 * i + BaseTime, correct, cc.v2(10,60), -20, -5);
		}
		
		cc.tween({})
		.delay(0.5)
		.call(()=>
		{
			SE.play(this.ketteiSE);
		})
		.delay(this._answerBtns.length * 0.5 + BaseTime)
		.call(()=>
		{
			callback();
		})
		.start();
	}



	//override
	protected _showAnswer():void
	{
        //答え合わせ
        let correctAnswer:boolean = true;
        let correctAnswers:string[] = this._qData.correct_answer.split(StaticData.QUESTION_SPLIT_WORD);
		let sendAnswer:string = "";

		for(let i = 0 ; i < this._answers.length ; i ++)
        {
			sendAnswer += this._answers[i].getAnswer() + StaticData.QUESTION_SPLIT_WORD;
			
			if(this._answers[i].getAnswer() != correctAnswers[i])
            {
                correctAnswer = false;
                break;
            }
		}
		
		if(sendAnswer.length > 0) sendAnswer = sendAnswer.substr(0,sendAnswer.length - 1);

        cc.log("結果:" + correctAnswer);

        if(correctAnswer)
        {
            for(let i = 0 ; i < this._answerBtns.length ; i ++)
            {
				this._answerBtns[i].rightAnswerWithSubItems();

				this._inputBoxs[i].rightAnswer();
            }
            
            this._answerCallback(AC.ANSWER_CODE_RIGHT, sendAnswer);		//1:正解
        }
        else
        {
            //間違い
            this._wrongAnswer(AC.ANSWER_CODE_WRONG, sendAnswer);
        }
	}


    //間違い時
	_wrongAnswer (answerCode:number, sendAnswer:string):void
	{
		let correctAnswers:string[] = this._qData.correct_answer.split(StaticData.QUESTION_SPLIT_WORD);
		
		this._allButtonsLock(true);
        
        for(let i = 0 ; i < correctAnswers.length ; i ++)
            {
                let ans = correctAnswers[i];

                for(let k = 0 ; k < this._answerBtns.length ; k ++)
                {
                    if(this._answerBtns[k].getAnswer() == ans)
                    {
                        let label = this._answerBtns[k].subItemNodes[0].getComponent(cc.Label);
                        
						this._inputBoxs[i].setText(label.string);
						this._inputBoxs[i].wrongAnswer();
						this._inputBoxs[i].node.angle = 0;

                        break;
                    }
                }
            }

            for(let i = 0 ; i < this._answerBtns.length ; i ++)
            {
                this._answerBtns[i].wrongAnswerWithSubItems();
            }
                
            this._answerCallback(answerCode, sendAnswer);		//0:間違い / 2:時間切れ
    }

    
    onPressCancelButton ()
	{
        if(this._answers.length == 0) return;

        let answerWord = this._answers[this._answers.length - 1].getAnswer();
        this._answers.pop();

		this._inputBoxs[this._answers.length].setText("");
		this._inputBoxs[this._answers.length].lock(true);


        for(let i = 0 ; i < this._answerBtns.length ; i ++)
        {
            if(this._answerBtns[i].getAnswer() == answerWord)
            {
                this._answerBtns[i].selectCanceled();
                this._answerBtns[i].popAction();
                break;
            }
        }

        this._btnReset.interactable = (this._answers.length > 0);
    }


    onPressResetButton ()
    {
        for(let i = 0 ; i < this._answerBtns.length ; i ++)
        {
            if(this._answerBtns[i].isSelected())
            {
                this._answerBtns[i].selectCanceled();
                this._answerBtns[i].popAction();
			}

			this._inputBoxs[i].setText("");
			this._inputBoxs[i].lock(true);

        }

        this._answers = [];
        this._btnReset.interactable = false;
    }


    timeUp ()
    {
		super.timeUp();
		
		this._allButtonsLock(true);
		for (let i = 0; i < this._inputBoxs.length; i ++)
		{
			this._inputBoxs[i].lock(true);
		}
		this._btnReset.interactable = false;

		this._wrongAnswer(AC.ANSWER_CODE_TIME_UP, this._TIME_UP_ANSWER);
	}


	removeComponent ()
	{
		super.removeComponent();

		//回答欄を消す
		for (let i = 0; i < this._inputBoxs.length; i++)
		{
			this._inputBoxs[i].node.removeFromParent(true);
		}
		this._inputBoxs = null;
	}


}
