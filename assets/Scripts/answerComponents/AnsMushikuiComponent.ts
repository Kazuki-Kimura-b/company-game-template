import SchoolText from "../common/SchoolText";
import SE from "../common/SE";
import STFormat from "../common/STFormat";
import { GameSE } from "../game/GameSEComponent";
import QuestionData from "../game/QuestionData";
import QuestionWindow from "../game/QuestionWindow";
import { EasingName } from "../StaticData";
import AC from "./AC";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnsMushikuiComponent extends AC {

    @property(cc.Button) btnCancel: cc.Button = null;
    @property(cc.Prefab) freeInputSingleBoxPrefab: cc.Prefab = null;		//指定問題の入力ボックス
	@property({type:cc.AudioClip}) seInputText: cc.AudioClip = null;		//入力音
	@property({type:cc.AudioClip}) ketteiSE_B: cc.AudioClip = null;			//フリー入力の決定音
    
    private _answer :string = "";
    private _dynamicNodeInputLabels :cc.Label[] = [];
    private _mushikuiIndex:number[] = [];
	private _correctAnswer:boolean = false;
	private _correctDetails:boolean[] = [];		//各マスの正解、不正解

    private readonly _COLOR_WRONG :cc.Color = cc.color(255, 0, 0);


    public getRespondFormats():string[]
	{
		return ["虫食い入力"];
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
		
		let dynamicNodes = [];
        let serchChars:string[] = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];

        this._mushikuiIndex = [];

        for (let i = 0; i < serchChars.length; i++)
        {
            let indexA:number = questionData.question.indexOf("□");
            let indexB:number = questionData.question.indexOf("◇");
            
            //□の数足りない
            
            if(indexA == -1 && indexB == -1)
            {
                //questionData.question += serchChars[i];
                continue;
            }
            

            let mFlg:boolean = (indexB < indexA);
            if(mFlg && indexB < 0) mFlg = false;
            else if(! mFlg && indexA < 0) mFlg = true;


            let _Q:string = questionData.question;

            //置き換える
            if(mFlg)
            {
                questionData.question = _Q.substr(0, indexB) + serchChars[i] + _Q.substr(indexB + 1, _Q.length);
                this._mushikuiIndex.push(i);
            }
            else
            {
                questionData.question = _Q.substr(0, indexA) + serchChars[i] + _Q.substr(indexA + 1, _Q.length);
            }

            /*
            //置き換える
            if(indexA > -1) questionData.question = _Q.substr(0, indexA) + serchChars[i] + _Q.substr(indexA + 1, _Q.length);
            else
            {
                questionData.question = _Q.substr(0, indexB) + serchChars[i] + _Q.substr(indexB + 1, _Q.length);
                this._mushikuiIndex.push(i);
            }
            */
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

            /*
			//特殊な例。画像とテキストの位置を入れ替える
			if (this._reverseImgAndText)
			{
				let QTopY = this._questionOutput.node.y + this._questionOutput.getTextFormat().size / 2;
				this._imageSprite.node.y = QTopY - this._imageSprite.node.height / 2;
				this._questionOutput.node.y = QTopY - this._imageSprite.node.height - this.MARGIN_TEXT_TO_IMG;
            }
            */
		}

		//これだけちょっと余白サイズを大きくする。
		//this._marginTextToBtnsArea = this.MARGIN_TEXT_TO_BTNS_AREA + 20;



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



    //オーバーライド
	startQuestion (callback)
	{
		//一体型独自の表示方法
		this._btnPopUpWaitTime = 0;

		//問題の表示開始 (ここでレイアウト contentsWidthが決まる)
		this._showQuestion(() =>
		{
			//表示完了時

			let btnTarget = this._dynamicNodeInputLabels[0].node.parent.parent;
			let pos = this._ccUtilConvertNodeSpaceToNodeSpace(btnTarget, this.node, cc.v2(0, 0));

			this.btnCancel.node.y = pos.y;

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
    


    //--------------------------------------------------------------------------------------------------
	// 文字ボタンを押した
	//
	_onSelect (answerButton)
	{
		if (this._answer.length >= this._dynamicNodeInputLabels.length) return;

        this._answer += answerButton.getAnswer();
        this._dynamicNodeInputLabels[this._answer.length - 1].string = answerButton.getAnswer();

        this._btnEnter.interactable = (this._answer.length == this._dynamicNodeInputLabels.length);
        this._btnReset.interactable = true;

		//入力音
		SE.play(this.seInputText);
    }
    

    //--------------------------------------------------------------------------------------------------
	// １文字削除エリアを押した
	//
	onPressCancelButton ()
	{
		if (this._answer.length == 0) return;

		this._answer = this._answer.substr(0, this._answer.length - 1);		//回答データから１文字消す

		this._dynamicNodeInputLabels[this._answer.length].string = "";

        this._btnEnter.interactable = false;
        this._btnReset.interactable = (this._answer.length > 0);
    }
    


    //--------------------------------------------------------------------------------------------------
	// 決定ボタンを押した
	//
	onPressEnterButton ()
	{
		this._btnEnter.interactable = false;
		this._btnReset.interactable = false;

		this._enterCallback();
        this._allButtonsLock(true);

		//先に正解、不正解の判定（どのマスを間違えたか保持したい）
		this._correctAnswer = this._isCorrectAnswer();


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
		// マスが複数ある場合
		if (this._dynamicNodeInputLabels.length >= 2)
		{
			//1つずつ入力欄を見ていく。正解すれば一瞬拡大、間違うと斜めになる
			
			let __FUNC:(index:number)=>void = (index:number)=>
			{
				let label:cc.Label = this._dynamicNodeInputLabels[index];
				//let isCorrect:boolean = this._qData.correct_answer.charAt(index) == label.string;
				let isCorrect:boolean = this._correctDetails[index];
				let scale:number = label.node.scale;
				const BASE_WAIT:number = 1.0;

				if(isCorrect)
				{
					cc.tween(label.node.parent)
					.delay(index * 0.5 + BASE_WAIT)
					.to(0.0, { scale:0.3 * scale })
					.call(()=>
					{
						label.node.color = cc.color(50,50,255);		//正解カラー
						label.node.parent.parent.zIndex = 1;
						
						//正解音
						SE.play(GameSE.clip.pinpon);

						//ミニ　〇エフェクト
						let effect:cc.Node;// = //this.miniMaruBatsuNode;
						let wPos:cc.Vec2 = label.node.convertToWorldSpaceAR(cc.v2(0,0));
						let lPos:cc.Vec2 = effect.parent.convertToNodeSpaceAR(wPos);
						
						effect.scale = 0.5;
						effect.x = lPos.x + 10;
						effect.y = lPos.y + 60;
						effect.active = true;
						effect.runAction(
							cc.scaleTo(0.3, 1.5).easing(cc.easeBackOut())
						);

					})
					.to(0.2, { scale:scale * 1.4 }, { easing:EasingName.backOut })
					.delay(0.2)
					.to(0.1, { scale:scale }, { easing:EasingName.sineInOut })
					.call(()=>
					{
						label.node.color = cc.color(0,0,0);		//カラー戻す
						label.node.parent.parent.zIndex = 0;
					})
					.start();
				}
				else
				{
					cc.tween(label.node.parent)
					.delay(index * 0.5 + BASE_WAIT)
					.call(()=>
					{
						label.node.color = this._COLOR_WRONG;
						label.node.parent.parent.zIndex = 1;

						//不正解音
						SE.play(GameSE.clip.batsu);
					})
					.to(0.0, { angle:-30, scale:scale * 1.4 })
					.delay(0.4)
					.to(0.1, { angle:-10, scale:scale })
					.call(()=>
					{
						label.node.color = cc.color(0,0,0);		//カラー戻す
						label.node.parent.parent.zIndex = 0;
					})
					.start();
				}
			};

			//---------

			const BaseTime:number = 1.0;

			for(let i:number = 0 ; i < this._dynamicNodeInputLabels.length ; i ++)
			{
				//__FUNC(i);		//1文字ずつ正解・不正解アクション

				let label:cc.Label = this._dynamicNodeInputLabels[i];
				let correct:boolean = this._correctDetails[i];
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
		// マスが1つの場合
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
			
		}

	}
    

    _showAnswer ()
	{
		//タイムアップ時
		if(this._isTimeUp)
		{
			this._btnEnter.interactable = false;
			this._btnReset.interactable = false;
			this._allButtonsLock(true);
			
			this._correctAnswer = false;
		}

		cc.log("結果:" + this._correctAnswer);

		let changeColor = (this._correctAnswer) ? cc.color(50,50,255) : this._COLOR_WRONG;

		for (let i = 0; i < this._dynamicNodeInputLabels.length; i ++)
        {
            this._dynamicNodeInputLabels[i].node.color = changeColor;
			this._dynamicNodeInputLabels[i].node.parent.angle = 0;		//斜めを元に戻す
        }


		if(this._correctAnswer)
		{
			this._answerCallback(AC.ANSWER_CODE_RIGHT, this._answer);		//1:正解
		}
		else
		{
			for (let i = 0; i < this._dynamicNodeInputLabels.length; i ++)
            {
                this._dynamicNodeInputLabels[i].string = this._qData.correct_answer.charAt(i);
                //this._dynamicNodeInputLabels[i].node.color = this._COLOR_WRONG;
            }
			this._answerCallback(this._isTimeUp ? AC.ANSWER_CODE_TIME_UP : AC.ANSWER_CODE_WRONG, this._answer);		//0:間違い / 2:時間切れ
		}
    }
    


    private _isCorrectAnswer():boolean
    {
        let ans:string = this._answer;      //ユーザーの入力
        let col:string = this._qData.correct_answer;        //回答
        
        let ansList:string[] = [];
        let colList:string[] = [];
		this._correctDetails = [];

        for(let i:number = 0 ; i < this._mushikuiIndex.length ; i ++)
        {
            let index:number = this._mushikuiIndex[i];
            ansList.push(ans.charAt(index));
            colList.push(col.charAt(index));

            ans = ans.substr(0, index) + "◇" + ans.substr(index + 1);
            col = col.substr(0, index) + "◇" + col.substr(index + 1);
        }

		let colListCopy:string[] = colList.slice();
		let mushikuiDetail:boolean[] = [];

		for(let i:number = 0 ; i < ansList.length ; i ++)
		{
			let colIndex:number = colListCopy.indexOf(ansList[i]);
			
			if(colIndex > -1)
			{
				colListCopy.splice(colIndex, 1);		//使った文字を外す
				mushikuiDetail.push(true);				//入れ替え可能部分だけ正解・不正解の詳細を持つ
			}
			//不正解が含まれる
			else
			{
				mushikuiDetail.push(false);				//入れ替え可能部分だけ正解・不正解の詳細を持つ
			}
		}

		//入れ替えできない部分も含めて正解・不正解の情報を持つ
		let mIndex:number = 0;
		for(let i:number = 0 ; i < ans.length ; i ++)
		{
			if(ans.charAt(i) == "◇")
			{
				this._correctDetails.push(mushikuiDetail[mIndex]);
				mIndex ++;
			}
			else
			{
				this._correctDetails.push(ans.charAt(i) == col.charAt(i));
			}
		}

		for(let i:number = 0 ; i < this._correctDetails.length ; i ++)
		{
			if(! this._correctDetails[i]) return false;
		}
		return true;





		/*
        ansList.sort();
        colList.sort();

        // 入れ替え可能文字部分のチェック
        for(let i:number = 0 ; i < this._mushikuiIndex.length ; i ++)
        {
			if(ansList[i] != colList[i]) return false;
        }
		
        // 指定文字部分のチェック
        return (ans == col);
		*/
    }


	//--------------------------------------------------------------------------------------------------
	// リセットボタンを押した
	//
	onPressResetButton ()
	{
		this._answer = "";
		this._btnEnter.interactable = false;
		this._btnReset.interactable = false;

		for (let i = 0; i < this._dynamicNodeInputLabels.length; i++)
        {
            this._dynamicNodeInputLabels[i].string = "";
        }
	}


	//--------------------------------------------------------------------------------------------------
	// タイムアップ
	//
	timeUp()
    {
		super.timeUp();
		this._showAnswer();
    }
    
}
