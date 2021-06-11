//---------------------------------------
// グループ
//---------------------------------------

import AC from "./AC";
import AnsButton from "./AnsButton";
import StaticData from "../StaticData";
import QuestionData from "../game/QuestionData";
import GameMain from "../game/GameMain";
import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";
import QuestionWindow from "../game/QuestionWindow";
import SE from "../common/SE";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsGroupComponent extends AC {

    @property(cc.Label) leftGroupOutput: cc.Label = null;
	@property(cc.Label) rightGroupOutput: cc.Label = null;
	@property(cc.Node) groupBaseNode: cc.Node = null;
	@property(cc.Node) btnsParentNode:cc.Node = null;
	@property(cc.Node) touchEventNode:cc.Node = null;
	@property(cc.Node) cursorNodes: cc.Node[] = [];
	
	_isLefts :boolean[] = [];
	_leftGroup :string = "";
	_rightGroup :string = "";
	_interactable :boolean = true;
	_holdButton :AnsButton = null;
	_holdLocalPos :cc.Vec2 = null;
	_clickBtnAsobi :number = 0;
	_prevTouchLoc :cc.Vec2 = null;
	_swipeMoveLoc :cc.Vec2 = null;

	private readonly _GROUP_BOX_X :number = 180;
	private readonly _CLICK_BTN_ASOBI :number = 40;		//タップした後、この範囲より動かなかった場合は「ボタンクリック」と認識する

	

	public getRespondFormats():string[]
	{
		return ["グルーピング"];
	}
	


    setup (questionWindow:QuestionWindow, questionData:QuestionData)
    {
		/*
		//問題をシャッフル
		try
		{
			questionData.option1 = questionData.shuffleSemicolonWord(questionData.option1);
			this._shuffleOptions(questionData);
		}
		catch(e)
		{
			console.log("QuestionData.shuffleSemicolonWord()が見つかりませんでした。");
			console.log("questionData:");
			console.log(questionData);
		}
		*/
		
		
		super.setup (questionWindow, questionData);		//スーパークラスのsetup
		
		this._needEnterButton = true;
		this._needResetButton = false;
        
        // 配列0はグループ名なので注意
        let groupNames:string = questionData.option1;
        let candidates:string[] = [
            //questionData.option1,
            questionData.option2, questionData.option3, questionData.option4
        ];

		

        //let intervalY = 100;
		//let startY = 350;
		//let posX = -this._GROUP_BOX_X;

		//分離型
        //let poss = [cc.v2(posX, startY - intervalY * 0), cc.v2(posX, startY - intervalY * 1), cc.v2(posX, startY - intervalY * 2)];

		//一体型

		//テキストの底のy座標
		let questionTextBottom:number = this._getQuestionTextAreaBottom();

		//画像がある場合テキストの下に配置して、その下にボタンを並べるようにする
		if (this._haveQuestionImage())
		{
			questionTextBottom = this._showQuestionImageAndGetBottomY(questionTextBottom);
		}

		//グループ欄の表示位置(Y)
		questionTextBottom -= this.groupBaseNode.height / 2 + this.MARGIN_TEXT_TO_BTNS_AREA;

		this.groupBaseNode.y = questionTextBottom;
		this.groupBaseNode.scale = 0;

		let intervalY = 97;
		let startY = questionTextBottom + 75;
		let posX = -this._GROUP_BOX_X;

		//let poss = [cc.v2(posX, startY - intervalY * 0), cc.v2(posX, startY - intervalY * 1), cc.v2(posX, startY - intervalY * 2)];
		let poss = [cc.v2(0, startY - intervalY * 0), cc.v2(0, startY - intervalY * 1), cc.v2(0, startY - intervalY * 2)];


		//回答ガイド、ボタン1つ目と2つ目の間に表示
		this._answerGuide.setY(this.node, startY - intervalY * 0.5);


		questionTextBottom -= this.groupBaseNode.height / 2 + this.MARGIN_BTNS_TO_BOTTOM;
		questionWindow.setQuestionBoardHeight(questionTextBottom, this.node);


		//----------------------------------------------------
		let maxCandiateLen:number = 0;
        for(let i = 0 ; i < candidates.length ; i ++)
        {
            this._isLefts[i] = true;
			if(maxCandiateLen < candidates[i].length) maxCandiateLen = candidates[i].length;
        }

		
        this._leftGroup = groupNames.split(StaticData.QUESTION_SPLIT_WORD)[0];
        this._rightGroup = groupNames.split(StaticData.QUESTION_SPLIT_WORD)[1];

        this.leftGroupOutput.string = this._leftGroup;
		this.rightGroupOutput.string = this._rightGroup;
		this._interactable = true;

        this._btnEnter.interactable = true;


		//問題ボタンを作成
		this._createAnswerButtons(candidates, poss, this.btnsParentNode, this._getTextFormatForLength(maxCandiateLen));

		this.touchEventNode.on(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
		this.touchEventNode.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
		this.touchEventNode.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
		this.touchEventNode.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

	}


	private _getTextFormatForLength(length:number)
	{
		let sizes:number[] = [ 36,36,36,36,36, 32, 32, 28, 26 ];
		let margins:number[] = [ 2,2,2,2,2,2,1,1,0 ];
		if(length >= sizes.length) length = sizes.length - 1;
		
		let textFormatObj:{} = 
		{
			size: sizes[length],
			margin: margins[length],
			lineHeight: 36,
			rows: 1,
			columns: 12,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
			verticalAlign:SchoolText.VERTICAL_ALIGN_CENTER,
			color: cc.color(0, 0, 0),
		};

		return STFormat.create(textFormatObj);
	}





	//オーバーライド
	startQuestion (callback)
	{
		//一体型独自の表示方法
		this._btnPopUpWaitTime = 0.2;

		//問題の表示開始
		this._showQuestion(() =>
		{
			//表示完了時

			//画像の表示
			this._showQImage();

			//グループのベースが飛び出す
			this.groupBaseNode.runAction(
				cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
			);

			//問題ボタンが飛び出す（空ボタン）
			this._popupAnswerButtons(undefined);

			//問題ボタンをスライドさせる
			for (let i = 0; i < this._answerBtns.length; i++)
			{
				this._answerBtns[i].node.runAction(
					cc.sequence(
						cc.delayTime(0.04 * i + this._btnPopUpWaitTime + 0.2),
						cc.moveTo(0.1, -this._GROUP_BOX_X, this._answerBtns[i].node.y).easing(cc.easeInOut(2.0))
					)
				);
			}



			//問題ボタンのテキストを表示してロック解除
			this._showAnswerButtonsTexts();

			//問題開始、タイマー動作開始
			callback();
		});

	}


	/*
    _onSelect (answerButton)
	{
		//onTouchEndに処理を作ったのでここは利用しない
	}
	*/

	private _buttonSlideAction (answerButton:AnsButton, index:number):void
	{
		let pos = answerButton.node.getPosition();
		pos.x = (this._isLefts[index]) ? -this._GROUP_BOX_X : this._GROUP_BOX_X;

		cc.log(this._isLefts[index] ? "左に移動": "右に移動");

		answerButton.node.runAction(
			cc.sequence(
				cc.moveTo(0.2, pos).easing(cc.easeInOut(2.0)),
				cc.callFunc(() =>
				{
					answerButton.fillColorLock(false);
					answerButton.selectCanceled();
				})
			)
		);

		//カーソルが回転
		let cursor = this.cursorNodes[index];
		let angle = (this._isLefts[index]) ? 0 : 180;

		cursor.runAction(
			cc.rotateTo(0.3, angle)
		);
	}


	//---------------------------------------------------
	// 決定ボタンを押した時
	//
    onPressEnterButton ()
    {
		this._preEnterButton();

		//待ち時間
		this._answerWait(()=>
		{
			//結果表示
			this._showAnswer();
		});
	}


	private _preEnterButton():void
	{
		this._btnEnter.interactable = false;
		this._interactable = false;

		this._enterCallback();

		this._allButtonsLock(true);

		for(let i:number = 0 ; i < this._answerBtns.length ; i ++)
		{
			this._answerBtns[i].resultWait();		//結果待ちカラー
		}
	}


	/**
	 * 結果待ち演出
	 */
	protected _answerWait(callback:()=>void):void
	{
		const BaseTime:number = 1.0;
		let correctWords:string[] = this._qData.correct_answer.split(StaticData.QUESTION_SPLIT_WORD);
		
		//1つずつ入力欄を見ていく。正解すれば一瞬拡大、間違うと斜めになる
		for(let i:number = 0 ; i < this._answerBtns.length ; i ++)
		{
			let word:string = this._answerBtns[i].getAnswer();
			word += "=" + ((this._isLefts[i]) ? this._leftGroup : this._rightGroup);
			let correct:boolean = (correctWords.indexOf(word) > -1);

			this._answerMiniCheck(this._answerBtns[i].node, 0.5 * i + BaseTime, correct, cc.v2(10,60), -20, -5);
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


	

	protected _showAnswer():void
	{
		let answers = this._qData.correct_answer.split(StaticData.QUESTION_SPLIT_WORD);
		let sendAnswer:string = "";
        
        let correctAnswer = true;
        
        for(let i = 0 ; i < this._answerBtns.length ; i ++)
        {
            //this._answerBtns[i].lock(true);
			this._answerMiniCheckEnd(this._answerBtns[i].node);
            
            let word = this._answerBtns[i].getAnswer();
			word += "=" + ((this._isLefts[i]) ? this._leftGroup : this._rightGroup);
			
			sendAnswer += word + StaticData.QUESTION_SPLIT_WORD;

            if(answers.indexOf(word) == -1)
            {
                correctAnswer = false;
                this._isLefts[i] = ! this._isLefts[i];
                this._answerBtns[i].wrongAnswer();      //間違った文字を赤にする
            }
		}
		if(sendAnswer.length > 0) sendAnswer = sendAnswer.substr(0, sendAnswer.length - 1);

        //タイムアップ時
		if(this._isTimeUp)
		{
			correctAnswer = false;
		}

        cc.log("結果:" + correctAnswer);

		if (correctAnswer)
		{
            for (let i = 0; i < this._answerBtns.length; i++)
            {
				this._answerBtns[i].rightAnswer();
				this._answerBtns[i].popBig();
            }
            
            this._answerCallback(AC.ANSWER_CODE_RIGHT, sendAnswer);		//1:正解
		}
		else
		{
            //ボタンが正しい方に動く
            for (let i = 0; i < this._answerBtns.length; i++)
			{
				let pos = this._answerBtns[i].node.getPosition();
                pos.x = (this._isLefts[i]) ? -this._GROUP_BOX_X : this._GROUP_BOX_X;
				this._answerBtns[i].node.runAction(cc.moveTo(0.3, pos).easing(cc.easeInOut(2.0)));


				//カーソルが回転
				let cursor = this.cursorNodes[i];
				let angle = (this._isLefts[i]) ? 0 : 180;

				cursor.runAction(
					cc.rotateTo(0.3, angle)
				);
			}

			this._answerCallback(this._isTimeUp ? AC.ANSWER_CODE_TIME_UP : AC.ANSWER_CODE_WRONG, sendAnswer);		//0:間違い / 2:時間切れ
		}
	}

    
    timeUp()
    {
		super.timeUp();
		//this.onPressEnterButton();
		this._preEnterButton();
		this._showAnswer();
	}


	_onTouchBegin (event)
	{
		if (! this._interactable) return;

		let touches = event.getTouches();
		let touchLoc = touches[0].getLocation();

		let res:{ btn:AnsButton, lPos:cc.Vec2 } = this._getButtonAndLocalPosAtTouchLoc(touchLoc);
		this._holdButton = res.btn;
		this._holdLocalPos = res.lPos;

		this._clickBtnAsobi = 0;
		this._prevTouchLoc = touchLoc;
		this._swipeMoveLoc = cc.v2(0, 0);

		if (this._holdButton != null)
		{
			this._holdButton.node.stopAllActions();
		}
	}


	_onTouchMove (event)
	{
		if (! this._interactable) return;

		if (this._holdButton == null) return;

		let touches = event.getTouches();
		let touchLoc = touches[0].getLocation();

		let sa = touchLoc.sub(this._prevTouchLoc);
		this._swipeMoveLoc = sa;

		let distance = sa.x * sa.x + sa.y * sa.y;
		this._clickBtnAsobi += distance;				//ボタンを動かした距離を貯めていってるところ（のちのクリックかスワイプの判定用）
		this._prevTouchLoc = touchLoc;

		let nodeLoc = this.node.convertToNodeSpaceAR(touchLoc);

		let btnPosX = nodeLoc.x - this._holdLocalPos.x;

		//範囲外に出た場合少しだけスライド
		if (btnPosX < -this._GROUP_BOX_X)
		{
			let saX = btnPosX - (-this._GROUP_BOX_X);
			btnPosX = -this._GROUP_BOX_X + saX * 0.3;
		}
		else if (btnPosX > this._GROUP_BOX_X)
		{
			let saX = btnPosX - this._GROUP_BOX_X;
			btnPosX = this._GROUP_BOX_X + saX * 0.3;
		}


		this._holdButton.node.x = btnPosX;
	}


	_onTouchEnd (event)
	{
		if (! this._interactable) return;

		if (this._holdButton == null) return;

		//クリックした（スワイプ距離がとても短い）
		if (this._clickBtnAsobi < this._CLICK_BTN_ASOBI)
		{
			cc.log("CLICK !");
	
			this._holdButton.selected();
			this._holdButton.fillColorLock(true);
	
			let index = this._answerBtns.indexOf(this._holdButton);
			this._isLefts[index] = ! this._isLefts[index];
	
			this._buttonSlideAction(this._holdButton, index);

			this._holdButton = null;
		}
		//スワイプしていた
		else
		{
			//今いるグループ側とかスワイプの勢いがあるか、とかからどっちのグループにするか決める

			let index = this._answerBtns.indexOf(this._holdButton);

			//横にスワイプして勢いよく離した
			if (this._swipeMoveLoc.x > 10 || this._swipeMoveLoc.x < -10)
			{
				this._isLefts[index] = (this._swipeMoveLoc.x < 0);
			}
			//離したボタンの場所によってグループを決める
			else
			{
				this._isLefts[index] = (this._holdButton.node.x < 0);
			}

			this._buttonSlideAction(this._holdButton, index);

			this._holdButton = null;
		}
	}




	//タップした位置にあるボタンを返す
	private _getButtonAndLocalPosAtTouchLoc (touchLoc):{btn:AnsButton, lPos:cc.Vec2}
	{
		for (let i = 0; i < this._answerBtns.length; i++)
		{
			let ansBtn = this._answerBtns[i];
			let node = ansBtn.node;

			let lPos = node.convertToNodeSpaceAR(touchLoc);
			if (lPos.x > -ansBtn.fillNode.width / 2 && lPos.x < ansBtn.fillNode.width / 2 && lPos.y > -ansBtn.fillNode.height / 2 && lPos.y < ansBtn.fillNode.height / 2)
			{
				return { btn:ansBtn, lPos:lPos };
			}
		}
		return { btn:null, lPos:null };
	}



	removeComponent ()
	{
		super.removeComponent();

		this.touchEventNode.off(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
		this.touchEventNode.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
		this.touchEventNode.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
		this.touchEventNode.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
	}
    


	//option1はグループ名なのでシャッフルしない
	private _shuffleOptions(qd:QuestionData):void
	{
		let options:string[] = [ qd.option2, qd.option3, qd.option4, qd.option5, qd.option6, qd.option7, qd.option8 ];
        let list:string[] = [];
        
        for(let i:number = 0 ; i < options.length ; i ++)
        {
            if(options[i] != null && options[i] != "")
            {
                list.splice(Math.floor(Math.random() * (list.length + 1)), 0, options[i]);
            }
        }

		//option1はグループ名なのでシャッフルしない

        if(list.length > 0) qd.option2 = list[0];
        if(list.length > 1) qd.option3 = list[1];
        if(list.length > 2) qd.option4 = list[2];
        if(list.length > 3) qd.option5 = list[3];
        if(list.length > 4) qd.option6 = list[4];
        if(list.length > 5) qd.option7 = list[5];
        if(list.length > 6) qd.option8 = list[6];
	}


}
