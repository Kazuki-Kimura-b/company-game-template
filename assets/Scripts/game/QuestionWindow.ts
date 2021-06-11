import AC from "../answerComponents/AC";
import BugTracking from "../common/BugTracking";
import SchoolText from "../common/SchoolText";
import SE from "../common/SE";
import STFont from "../common/STFont";
import TapEffect from "../common/TapEffect";
import StaticData, { EasingName, GameMode } from "../StaticData";
import AnswerGuide from "./AnswerGuide";
import FormatDisplay from "./FormatDisplay";
import { GameSE } from "./GameSEComponent";
import QuestionData from "./QuestionData";
import TimeBoard from "./TimeBoard";

const {ccclass, property} = cc._decorator;

/**
 * QuestionWindowの役割
 * ・questionDataを受け取り問題の表示、コンポーネントも含める
 * ・正解、不正解を判定し、gameMainに戻す
 * 
 */


/**
 * GameMainの役割
 * ・モードごとの背景や偉人表示の管理
 * ・APIとの通信、問題データ（画像含む）の取得
 * 
 */


@ccclass
export default class QuestionWindow extends cc.Component
{
    @property(cc.Label) questionNumOutput: cc.Label = null;
    @property(SchoolText) questionOutput: SchoolText = null;		//問題のテキスト
    @property(FormatDisplay) formatDisplay: FormatDisplay = null;
    @property(cc.Node) questionBoard: cc.Node = null;
    @property(TimeBoard) timeBoard: TimeBoard = null;
    @property(AnswerGuide) answerGuide: AnswerGuide = null;
    @property(cc.Sprite) imageSprite: cc.Sprite = null;
    @property(cc.Node) debugImageSpriteRectNode: cc.Node = null;
    @property(cc.Label) idLevelOutput: cc.Label = null;
    @property(cc.Button) btnEnter: cc.Button = null;
	@property(cc.Button) btnReset: cc.Button = null;
    @property(cc.Node) answerComponentsParentNode: cc.Node = null;
    @property(cc.Prefab) questionFontPrefab:cc.Prefab = null;			//問題と回答ボタンで使用するSTFont情報
    @property(cc.SpriteFrame) imgLoadErrorSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) schoolTextUnderlineSpriteFrame: cc.SpriteFrame = null;
    

    private _questionWindowY :number = -1;
    private _answerComponents: {} = {};
	private _currentAnswerComponent: AC = null;
    private _IMG_RES:any = null;
    private _enterCallback:()=>void = null;
    private _answerCallback:(answerCode:number, answer:string)=>void = null;




    public setup():void
    {
        this.questionNumOutput.string = "";

        this._questionWindowY = this.node.y;

        this.idLevelOutput.node.parent.active = StaticData.DEVELOP_MODE;
        this.imageSprite.node.active = false;
		this.debugImageSpriteRectNode.active = StaticData.DEBUG_SHOW_QUESTION_IMAGE_RECT || StaticData.previewMode;		//デバッグ　画像の表示範囲を視覚化
        this.formatDisplay.node.active = false;
        this.btnEnter.interactable = false;
		this.btnEnter.node.active = false;
		this.btnReset.interactable = false;
		this.btnReset.node.active = false;

        this.timeBoard.setup();
		this.timeBoard.hideTime();

		this.formatDisplay.setup();

        this.questionOutput.setSTFontFromPrefab(this.questionFontPrefab);
        this.questionOutput.setUnderlineSpriteFrame(this.schoolTextUnderlineSpriteFrame);
		
		//回答ボタンにSTFontを一括で設定（個別設定が必要な箇所はコンポーネント内で行う）
		{
			let node:cc.Node = cc.instantiate(this.questionFontPrefab);
			AC.setDefaultSTFont(node.getComponent(STFont));
            AC.setImgLoadErrorSpriteFrame(this.imgLoadErrorSpriteFrame);
		}

        //-------------------------

        //各コンポーネントの参照を保持しておく
		this._answerComponents = {};

		for(let i:number = 0 ; i < this.answerComponentsParentNode.children.length ; i ++)
		{
			let childAC:AC = this.answerComponentsParentNode.children[i].getComponent(AC);
			if(childAC == null) continue;
			let respondFormats:string[] = childAC.getRespondFormats();

			for(let k:number = 0 ; k < respondFormats.length ; k ++)
			{
				this._answerComponents[respondFormats[k]] = childAC;
			}
			childAC.node.active = false;
		}
    }

    public onEnterCallback(callback:()=>void):void
    {
        this._enterCallback = callback;
    }

    public onAnswerCallback(callback:(answerCode:number, answer:string)=>void):void
    {
        this._answerCallback = callback;
    }


    public setImageResources(imgRes:any):void
    {
        AC.setImageResourses(imgRes);
    }


    public showQuestion(qData:QuestionData, qNum:number):void
    {
        //表示するコンポーネントの設定
		this._currentAnswerComponent = this._answerComponents[qData.format];

		if (this._currentAnswerComponent == undefined)
		{
			BugTracking.notify("未設定コンポーネントの呼び出し", "GameMain._setupQuestion()", { msg:"未設定の問題フォーマット["+ qData.format +"]が呼び出されました", qData:qData } );
			cc.error("未設定コンポーネントの呼び出し");
		}
		
		this._currentAnswerComponent.node.active = true;

		// 問題、ボタンなどを作成
		this._currentAnswerComponent.setup(this, qData);

		//回答時のコールバック設定
		this._currentAnswerComponent.setEnterCallback(()=>
		{
			//タイマーを止めガイドを消す
		    this.stopTimerAndHideGuide();
            
            this._enterCallback();
		});

		//結果発表時のコールバック設定
		this._currentAnswerComponent.setAnswerCallback((answerCode:number, answer:string) =>
		{
			this.stopAndHideUIs();
			this._answerCallback(answerCode, answer);
		});
        
        //問題の上に何問目か小さく表示
        this.questionNumOutput.string = "第" + (qNum + 1) + "問:" + qData.subject;

        //デバッグで問題id表示
        this.idLevelOutput.string = "id: " + qData.id + "\n" + "level: " + qData.level;

        //フォーマットを表示
		this.formatDisplay.node.active = true;
		if(StaticData.gameModeID == GameMode.HAYABEN || StaticData.gameModeID == GameMode.GHOST) this.formatDisplay.showShutokuQuestionNum(qNum + 1);
		else this.formatDisplay.showFormat(qData);

		//正解率と何回目の挑戦か表示
		this.formatDisplay.showChallengeCountAndRate(qData);

        //タイマーを準備
		this.timeBoard.readyTimer();

        //座標を初期化
		this.node.active = true;
		this.node.x = 750;
    }


    /**
     * 横からスライド。完了したら問題表示開始
     * @param callback 
     */
    public moveIn(callback:()=>void):void
    {
        this.node.runAction(
			cc.sequence(
				cc.moveTo(0.3, 0, this._questionWindowY).easing(cc.easeCubicActionOut()),
				cc.delayTime(0.5),
				cc.callFunc(() =>
				{
					//問題プレを非表示
					this.formatDisplay.node.active = false;

                    //問題の表示開始
                    this._currentAnswerComponent.startQuestion(() =>
                    {

                        //ちょっと持ってきたいコードがあったが複雑なので後で

                        //タイムゲージを小さくする
                        this.timeBoard.showMiniSize();

                        callback();
                    });
				})
			)
		);
    }


    public moveOut(callback:()=>void):void
    {
        //タイムゲージを大きく戻す
		this.timeBoard.showFullSize();
        
        this.node.runAction(
			cc.sequence(
				//cc.moveTo(0.2, 0, 550 + 700),
				cc.moveTo(0.3, -750, this._questionWindowY).easing(cc.easeCubicActionIn()),
				cc.callFunc(() =>
				{
					this.questionOutput.resetText();
                    this.imageSprite.node.active = false;
                    this.node.active = false;
                    this.node.x = 0;
                    
                    callback();
				})
			)
		);
    }



    public startTimer(format:string, harryUpCallback:(time:number)=>void, timeUpCallback:()=>void):void
    {
        //答え方のガイドを表示
		this.answerGuide.showAtFormat(format);

		//プレビューモードはタイマー動かさない
		if(StaticData.previewMode) return;
		
		//タイマーが動き出す
		this.timeBoard.startTimer(
		(time:number) =>
		{
			//残り5秒 / 10秒 / 20秒

            //タイムゲージを大きく戻す
            if(time == 10) this.timeBoard.showFullSize();

            harryUpCallback(time);
		},
		() =>
		{
			this._currentAnswerComponent.timeUp();
            
            timeUpCallback();
		});
    }



    public stopTimerAndHideGuide():void
    {
        //タイマー止める
		this.timeBoard.stopTimer();

		//ガイド消す
		this.answerGuide.remove();
    }


    public stopAndHideUIs():void
    {
        //タイマー止める
		this.timeBoard.stopTimer();

		//ガイド消す
		this.answerGuide.remove();
		
		//連想問題の問題表示を止める
		this.questionOutput.node.stopAllActions();

		//決定ボタンとキャンセルボタンを消す
        cc.tween({})
        .delay(0.5)
        .call(()=>
        {
            if (this.btnEnter.node.active)
            {
                this.btnEnter.interactable = false;
                cc.tween(this.btnEnter.node)
                .to(0.3, { scale:0.0 }, { easing:EasingName.backIn })
                .call(()=>{ this.btnEnter.node.active = false; })
                .start();
            }

            if (this.btnReset.node.active)
            {
                this.btnReset.interactable = false;
                cc.tween(this.btnReset.node)
                .to(0.3, { scale:0.0 }, { easing:EasingName.backIn })
                .call(()=>{ this.btnReset.node.active = false; })
                .start();
            }
        })
        .start();
    }


    public resetQuestion():void
    {
        if(this._currentAnswerComponent == null) return;
		
		this._currentAnswerComponent.removeComponent();
        this._currentAnswerComponent.node.active = false;
		this._currentAnswerComponent = null;
        
        this.questionNumOutput.string = "";
        this.answerGuide.remove();
		this.timeBoard.stopTimer();
		this.timeBoard.hideTime();
    }


    public hideImage():void
    {
        this.imageSprite.node.active = false;
    }


    /**
	 * 問題の高さにあわせて問題表示の枠の高さを返す
	 * @param questionBottom 問題の底Y座標
	 * @param fromNode 
	 */
	public setQuestionBoardHeight (questionBottom:number, fromNode:cc.Node):void
	{
		let wPos:cc.Vec2 = fromNode.convertToWorldSpaceAR(cc.v2(0, questionBottom));
		let lPos:cc.Vec2 = this.questionBoard.parent.convertToNodeSpaceAR(wPos);

		//627はボードの高さ
		let scaleY:number = (this.questionBoard.y - lPos.y) / 627;
		if (scaleY > 1.0) scaleY = 1.0;
		else if (scaleY < 0.7) scaleY = 0.7;

		// this.questionBoard.scale = cc.v2(1.0, scaleY);
		this.questionBoard.scaleY = scaleY;

		let lPos2:cc.Vec2 = this.btnEnter.node.parent.convertToNodeSpaceAR(wPos);

		//下限あり(効いてるか未確認) ノードツリーを変えたのと、問題側での調整が入るのでいらなくなった
		//if(lPos2.y < -504) lPos2.y = -504;

		this.btnEnter.node.y = lPos2.y;
		this.btnReset.node.y = lPos2.y;
	}


    private onPressEnterButton (event):void
	{
		//決定ボタンを押した音
		SE.play(GameSE.clip.enterBtnPress);
		
		//タップエフェクト
        TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
		
		this._currentAnswerComponent.onPressEnterButton();		
	}

	private onPressResetButton (event):void
	{
		//リセットボタンを押した音
		SE.play(GameSE.clip.resetBtnPress);
		
		//タップエフェクト
        TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
		
		this._currentAnswerComponent.onPressResetButton();
	}
    
}
