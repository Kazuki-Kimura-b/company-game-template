import SchoolText from "../common/SchoolText";
import HintControl from "./HintControl";
import ExAPI from "../common/ExAPI";
import StaticData from "../StaticData";
import AC from "../answerComponents/AC";
import QuestionData from "./QuestionData";
import GameBG from "./bg/GameBG";
import Hukidashi from "./Hukidashi";
import KaisetsuWindow from "./KaisetsuWindow";
import FrontEffect from "./FrontEffect";
import KomaSprite from "./KomaSprite";
import FinishScreen from "./FinishScreen";
import SleepListener from "../common/SleepListener";
import StoryScreen from "../introduction/StoryScreen";
import NegaEffector from "../common/NegaEffector";
import IjinScreen from "./IjinScreen";
import SE from "../common/SE";
import { GameSE } from "./GameSEComponent";
import ScoreBar from "./ScoreBar";
import STFormat from "../common/STFormat";
import QuestionWindow from "./QuestionWindow";
import Score from "../game/Score";

const {ccclass, property} = cc._decorator;

class ScoreDetail
{
	/** 正解点 */
	public base:number = 0;
	/** タイムボーナス */
	public time: number = 0;
	/** コンボボーナス */
	public combo:number = 0;
	/** ヒント無しボーナス */
	public noHint:number = 0;
}



@ccclass
export default class GameMain extends cc.Component {

	@property(cc.Canvas) canvas: cc.Canvas = null;
	@property(cc.Node) contentsNode:cc.Node = null;
	@property(cc.Node) markU:cc.Node = null;
	@property(cc.Node) markR:cc.Node = null;
	@property(HintControl) hintControl: HintControl = null;
	@property(cc.SpriteFrame) imgLoadErrorSpriteFrame: cc.SpriteFrame = null;
	@property(cc.Node) ijinNode: cc.Node = null;
	@property(IjinScreen) ijinScreen:IjinScreen = null;
	@property(cc.Node) bgParentNode: cc.Node = null;
	@property(cc.Prefab) bgPrefab: cc.Prefab =  null;
	@property(FrontEffect) frontEffect :FrontEffect = null;
	@property(cc.Node) resultParentNode: cc.Node = null;
	@property(cc.Prefab) scoreBarPrefab:cc.Prefab = null;
	@property(KomaSprite) comboDisp: KomaSprite = null;
	@property(cc.Node) timeBonusDisp: cc.Node = null;
	@property(cc.Node) noHintBonusDisp: cc.Node = null;
	@property(cc.Node) comboBonusDisp: cc.Node = null;
	@property(cc.SpriteFrame) unkomushiSpriteFrames: cc.SpriteFrame[] = [];
	@property(cc.Node) unkomushisNode: cc.Node = null;
	@property(cc.SpriteFrame) userIconSpriteFrames: cc.SpriteFrame[] = [];
	@property(cc.Node) finishScreenParentNode: cc.Node = null;
	@property(cc.Prefab) finishScreenPrefab: cc.Prefab = null;
	@property(cc.Node) finishTextNode: cc.Node = null;
	@property(cc.Node) ijinHukidashiNode: cc.Node = null;		//1問ごとに出る小さな吹き出し
	@property(SchoolText) ijinHukidashiOutput: SchoolText = null;
	@property(cc.Node) scoreBarParentNode:cc.Node = null;
	@property(cc.Node) questionWindowParentNode:cc.Node = null;
	@property(cc.Node) kaisetsuWindowParentNode:cc.Node = null;
	@property(cc.Prefab) storyScreenPrefab: cc.Prefab = null;
	@property(cc.Prefab) questionWindowPrefab: cc.Prefab = null;
	@property(cc.Prefab) kaisetsuWindowPrefab: cc.Prefab = null;
	@property(cc.Prefab) scorePrefab: cc.Prefab = null;


	private _requestToken:string = "";

	private _qDatas: QuestionData[] = [];
	private _QNum :number = 0;
	private _IMG_RES:any = null;
	private _loadImageList :string[] = [];		//読み込む画像リスト
	private _gameBG: GameBG = null;
	private _combo: number = 0;		//正解コンボ数		★ScoreDetail行き？
	private _rightAnswerCount: number = 0;		//正解数		★ScoreDetail行き？
	private _wrongAnswerCount: number = 0;		//不正解数
	private _openHint: boolean = false;
	private _alwayShowHint:boolean = false;		//常にヒントを出すモードかどうか
	private _scoreDetail:ScoreDetail;		//正解点、スピードボーナス、コンボボーナス、ノーヒントボーナスがまとまったもの
	private _negaEffector:NegaEffector = null;
	private _seID_harryUp:number = -1;		//残り10秒のカチカチ音
	private _finishScreen:FinishScreen = null;
	private _questionWindow:QuestionWindow = null;
	private _kaisetsuWindow: KaisetsuWindow = null;
	private _gameScore:number = 0;
	private _sendAnswers:{question_id:string, answer:string, correct_answer: string, required_time:number, hint:boolean}[] = [];
	private _correctHistories:boolean[] = [];
	private _ijinEvent:boolean = false;
	private _scoreBar:ScoreBar = null;

	private static readonly IJIN_CUTIN_EVENT_TURN:number = 10;		//カットインで入ってくる場所(第 n 問目)

	//コンボの得点リスト
	public static readonly COMBO_SCORE_LIST:number[] = [0,0,10,15,15,15,15,20,20,20,20];

	public getIMG_RES ():cc.SpriteFrame
	{
		return this._IMG_RES;
	}

	public getImgLoadErrorSpriteFrame ():cc.SpriteFrame
	{
		return this.imgLoadErrorSpriteFrame;
	}

	public getQuestionWindow():QuestionWindow
	{
		return this._questionWindow;
	}

	public isOpenHint ():boolean
	{
		return this._openHint;
	}

	
	/**
	 * シーン開始時（初期化）
	 */
    start ()
    {
		this._negaEffector = this.getComponent(NegaEffector);
		// this._QNum = 0;
		this._combo = 0;
		this._rightAnswerCount = 0;
		this._IMG_RES = {};

		this._scoreDetail = new ScoreDetail();

		if (StaticData.gameSetting.useGameCharacter) {
			this.ijinScreen.setup();
			this.ijinScreen.show();
			this._setIjinRightBottom(0.0);
		} else {
			this.ijinNode.active = false;
		}

		//問題ウィンドウの設定
		let qwNode:cc.Node = cc.instantiate(this.questionWindowPrefab);
		this.questionWindowParentNode.removeAllChildren(true);
		this.questionWindowParentNode.addChild(qwNode);

		this._questionWindow = qwNode.getComponent(QuestionWindow);
		this._questionWindow.setup();
		this._questionWindow.onEnterCallback(()=>
		{
			this._enterAnswer();
		});
		this._questionWindow.onAnswerCallback((answerCode:number, answer:string)=>
		{
			this._answerCheck(answerCode, answer);
		});

		// BGの設定
		let bgNode:cc.Node;
		bgNode = cc.instantiate(this.bgPrefab); // shutokuで入れてあるよ
		this._gameBG = bgNode.getComponent(GameBG);
		this.bgParentNode.addChild(bgNode);
		this._gameBG.setup(); //背景を初期化



		//スリープの設定
		let sleepListener:SleepListener = this.node.getComponent(SleepListener);
		sleepListener.onResume(()=>
		{
			this.node.active = false;

			//タイトル画面に戻す
			SE.bgmStop();

			cc.director.loadScene("title");
		});


		this.comboDisp.node.active = false;
		this.timeBonusDisp.active = false;
		this.noHintBonusDisp.active = false;
		this.comboBonusDisp.active = false;

		let ksNode:cc.Node = cc.instantiate(this.kaisetsuWindowPrefab);
		this.kaisetsuWindowParentNode.addChild(ksNode);

		this._kaisetsuWindow = ksNode.getComponent(KaisetsuWindow);
		this._kaisetsuWindow.setup(this, this.canvas);
		this._kaisetsuWindow.node.active = false;

		this._questionWindow.node.active = false;
		this.finishTextNode.active = false;
		this.ijinHukidashiNode.active = false;



		this.frontEffect.setup();

		this.hintControl.setup(this._alwayShowHint, ()=>
		{
			//ヒントを開いた (ノーヒントボーナス消すための処理)
			this._showHintFromHukidashiButton();
		});

		this.hintControl.setFaceIcons(this.userIconSpriteFrames);

		this.hintControl.hideHintButton();		//ヒントボタンを隠す



		let format:STFormat = STFormat.create
		({
			size: 36,
			margin: 2,
			lineHeight: 60,
			rows: 2,
			columns: 8,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
			color: cc.color(0,0,0),
			yomiganaSize: 20,
			yomiganaMarginY: 2
		});
		this.ijinHukidashiOutput.createText("", format);

		//---- 初期化終了 ----


		//終了のスクリーン
		let finishScreenNode:cc.Node = cc.instantiate(this.finishScreenPrefab);
		this.finishScreenParentNode.addChild(finishScreenNode);
		this._finishScreen = finishScreenNode.getComponent(FinishScreen);
		this._finishScreen.setupWithClose("start");

		this._finishScreen.endFinishAction(()=>
		{
			let scoreBarNode:cc.Node = cc.instantiate(this.scoreBarPrefab);
			this.scoreBarParentNode.addChild(scoreBarNode);
			this._scoreBar = scoreBarNode.getComponent(ScoreBar);
			this._scoreBar.setup();
			if (!StaticData.opponentData.name) {
				ExAPI.importGameSettings(() => {
					this._sceneStart();
				});
			} else {
				this._sceneStart();
			}
		});
	}

	//偉人を右下にする
	private _setIjinRightBottom(duration:number):void
	{
		this.ijinScreen.ijinScaleTo(0.9, duration);
		this.ijinScreen.ijinMoveTo(cc.v2(200, -200), duration);
	}
	private _setIjinCenter(duration:number):void
	{
		this.ijinScreen.ijinScaleTo(IjinScreen.SCALE_STORY, duration);
		this.ijinScreen.ijinMoveTo(cc.v2(0, IjinScreen.Y_STORY), duration);
	}


	private _sceneStart():void
	{
		this._QNum = StaticData.gameSetting.specificQuestionNum - 1;

		this.frontEffect.initialize();

		//問題とライバルの画像を取得
		this._loadQuestions(()=>
		{
			this.frontEffect.showLoadingBar(0.25);

			//問題の画像を取得
			this._loadQuestionImages(0, ()=>
			{
				//----- 完了 --------------

				this.frontEffect.showLoadingBar(0.5);

				//読み込み完了音
				SE.play(GameSE.clip.loadComplete);

				//BGM読み込み
				this._bgmLoad(()=>
				{
					//ローディングバー非表示
					this.frontEffect.showLoadingMaxAndHide();
						this._gameStart();

				});

			});

		});

	}



	/**
	 * 音楽ファイルの読み込み
	 */
	private _bgmLoad(callback:()=>void):void
	{

		//BGM読み込み中コメント表示
		this.hintControl.loadingBgm();


		//曲の読み込み開始
		cc.loader.loadRes("BGM/audiostock_113923", cc.AudioClip,
		(completedCount:number, totalCount:number, item:any)=>
		{
			//cc.log("---PROGRESS  BGM (" + completedCount + "/" + totalCount + ")-----------------------");
			//ローディングバーの表示
			this.frontEffect.showLoadingBar(completedCount / totalCount * 0.5);		//0 ~ 50% をBGM読み込みにあてる
		},
		(error:Error, resource:any)=>
		{
			let bgmClip:cc.AudioClip = resource;

			//BGM開始
			SE.bgmStart(bgmClip);

			callback();
		});
	}




	/**
	 * 問題データの取得
	 */
	private _loadQuestions (callback: ()=>void): void {
		//問題データ読み込み中コメント表示
		this.hintControl.loadingQuestionData();

		// APIに接続し、tokenを取得
		ExAPI.exStart(StaticData.companyGameMode, StaticData.reference, (response): void => {
			// リクエストトークンを取得
			this._requestToken = response.token;

			//基本のセリフをAPIから取得
			this.hintControl.setupBasicHints(response);

			// 問題データを取得
			cc.loader.loadRes("json/questions", (err, res) => {
				this._qDatas = res.json;
				if (StaticData.gameSetting.isRandomQuestion) {
					for (var i = this._qDatas.length - 1; i > 0; i--) {
						var r = Math.floor(Math.random() * (i + 1));
						var tmp = this._qDatas[i];
						this._qDatas[i] = this._qDatas[r];
						this._qDatas[r] = tmp;
					}
				}
				cc.log(this._qDatas);
				this._makeLoadImageList();

				callback();
			})
		});
	}

	/**
	 * 読み込む画像リストを作成する
	 */
	_makeLoadImageList ():void
	{
		this._loadImageList = [];
		
		for (let i:number = 0 ; i < this._qDatas.length ; i ++)
		{
			if (this._qDatas[i].question_image != null && this._qDatas[i].question_image != "")
			{
				this._loadImageList.push(this._qDatas[i].question_image);
			}

			if (this._qDatas[i].explain_image != null && this._qDatas[i].explain_image != "")
			{
				this._loadImageList.push(this._qDatas[i].explain_image);
			}

			for (let k:number = 0 ; k < 8 ; k ++)
			{
				let optionText:string = this._qDatas[i]["option" + (k + 1)];
				if (optionText == undefined || optionText == null) continue;
				
				if (optionText.indexOf(".png") > -1 || optionText.indexOf(".jpg") > -1)
				{
					this._loadImageList.push(optionText);
				}
			}
		}
	}





	/**
	 * 問題の画像データの取得
	 * @param loadIndex
	 */
	_loadQuestionImages (loadIndex:number, callback:()=>void):void
	{
		//ローディングバーの表示
		this.frontEffect.showLoadingBar(0.25 + loadIndex / this._loadImageList.length * 0.25);	// 25% ～ 50% を画像表示に充てる

		//全て読み込みできた
		if(loadIndex == this._loadImageList.length)
		{
			cc.log("全画像取得完了");
			cc.log(this._IMG_RES);

			callback();

			return;
		}

		//画像の読み込み
		ExAPI.loadZuhanImage(this._loadImageList[loadIndex], (result)=>
		{
			//読み込み完了時
			if(result.error != null)
			{
				console.log("Image Load Failed : " + result.error);

				this._IMG_RES[result.key] = this.imgLoadErrorSpriteFrame;		//ダミー画像(Error画像)
				loadIndex ++;
				this._loadQuestionImages(loadIndex, callback);

				this.hintControl.errorMsg("Img:" + result.key + " failed.");
				return;
			}

			//画像をjsonで保持
			this._IMG_RES[result.key] = result.image;

			loadIndex ++;
			this._loadQuestionImages(loadIndex, callback);
		});
	}

	/**
	 * ゲーム開始時   (ダミー問題をすべて取得、もしくはAPIから正式な問題データを取得)
	 */
    private _gameStart ():void
    {
		//画像データを渡す
		this._questionWindow.setImageResources(this._IMG_RES);

		//ゲーム開始処理 (BGMなど)
		cc.log("ゲーム開始");

		//背景、準備完了時
		this._gameBG.ready();

		//カウントダウンSE
		SE.play(GameSE.clip.startCountDown);

		//カウントダウン開始
		this.frontEffect.countdown
		(
			//カウント２コールバック
			()=>{
				//ヒント表示（ゲーム開始）
                this.hintControl.gameStart();
			},
			//カウントダウン終了コールバック
			()=>{
				// 1問目の問題を作成
                this._setupQuestion();
			}
		);
	}



	/**
	 * 問題を作成 (1問目から最終問題までこれを繰り返す)
	 */
	private _setupQuestion ():void
	{
		//偉人が割り込むイベント
		if(this._QNum == GameMain.IJIN_CUTIN_EVENT_TURN - 1 && ! this._ijinEvent && StaticData.gameSetting.useGameCharacter)
		{
			//偉人の吹き出しを消す
			this.ijinHukidashiNode.active = false;

			this._ijinInsertEvent(()=>
			{
				this._ijinEvent = true;		//見たフラグ
				this._setupQuestion();
			});
			return;
		}

		//ヒントを開いたかどうか（スコアに影響）alwayShowHintがtrueなら常にtrue
		this._openHint = this._alwayShowHint;

		let qData = this._qDatas[this._QNum];

		//問題文がない場合空白文字にする
		if(qData.question == null) qData.question = "";

		//問題データ内から改行コードを変換
		qData.question = qData.question.replace(/↵/g, "\n");

		cc.log(qData);

		//背景、問題開始
		this._gameBG.showQuestion(this._QNum);

		//ヒントの作成 (回答中の会話3つとヒント3つ)
		this.hintControl.entryHints
		(
			[qData.script_thinking1, qData.script_thinking2, qData.script_thinking3, qData.hint1, qData.hint2, qData.hint3],
			[Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_HINT, Hukidashi.TYPE_HINT, Hukidashi.TYPE_HINT],
			undefined
		);

		//問題プレと問題が下から登場
		this._showQuestionWindow(qData);
	}


	

	/**
	 * 問題フォーマットを表示、その後問題表示
	 * @param qData 
	 */
	private _showQuestionWindow (qData:QuestionData):void
	{
		//効果音：出題音
		SE.play(GameSE.clip.shutsudai);

		this._questionWindow.showQuestion(qData, this._QNum);

		//横からスライドで登場
		this._questionWindow.moveIn(()=>
		{
			//登場完了、問題の表示完了

			//タイマーが動き出す
			this._startTimer();

			//ヒント表示
			this.hintControl.startHint();

			//偉人の吹き出しを消す
			this.ijinHukidashiNode.active = false;
		});
	}

	/**
	 * 問題の開始、タイマーが動き出す
	 */
	private _startTimer ():void
	{
		//ヒントボタン表示
		this.hintControl.showHintButton();

		let format:string = this._qDatas[this._QNum].format;

		//タイマー開始(プレビューモードの場合はこの処理の途中で抜けコールバックは返さない)
		this._questionWindow.startTimer(format,
			//残り20秒,10秒,5秒
			(time:number)=>
			{
				//残り10秒音
				if(time == 10) this._seID_harryUp = SE.play(GameSE.clip.harryUp);

				//背景に時間を渡す
				this._gameBG.harryUp(time);

				//残りX秒コメントが出る
				this.hintControl.harryUp(time);
			},
			//タイムアップ
			()=>{

				//ヒントボタン消す
				this.hintControl.hideHintButton();

				//時間切れ音
				SE.play(GameSE.clip.timeUp);
				this._seID_harryUp = -1;
			});
	}



	/**
	 * 問題に答えた直後（まだ正解か不正解か分からない）
	 */
	private _enterAnswer():void
	{
		if(this._seID_harryUp > -1)
		{
			SE.stop(this._seID_harryUp);
			this._seID_harryUp = -1;
		}

		//ヒントボタン消す
		this.hintControl.hideHintButton();

		//回答時のセリフ表示
		let qData = this._qDatas[this._QNum];
		this.hintControl.resetHint();
		this.hintControl.entryHints([qData.script_enter1, qData.script_enter2], [Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU], 0.3);
		this.hintControl.startHint();
	}



	/**
	 * 答え合わせ
	 * @param answerCode AC.ANSWER_CODE_XX の値が返ってくる
	 */
	private _answerCheck (answerCode:number, answer:string):void
	{
		let rightAnswer:boolean = (answerCode == AC.ANSWER_CODE_RIGHT);

		//マル、バツなどのエフェクトを表示する
		this.frontEffect.showResult(answerCode);

		//タイムアップ時はanswerを空で送信する
		if(answerCode == AC.ANSWER_CODE_TIME_UP)
		{
			answer = "";
		}

		//サーバに送信するためのデータ作成
		let sendAnswer:{ question_id: string, answer: string, correct_answer: string, required_time: number, hint: boolean } =
		{
			question_id: this._qDatas[this._QNum].id,
			answer:answer,
			correct_answer: this._qDatas[this._QNum].correct_answer,
			required_time: this._questionWindow.timeBoard.getAnwerFloatTime(),
			hint: this._openHint
		};
		this._sendAnswers.push(sendAnswer);
		this._correctHistories.push(rightAnswer);	//正解、不正解の情報だけまとめる

		// cc.log("sendAnswer:");
		// cc.log(sendAnswer);
		//正解
		if(rightAnswer)
		{
			this._rightAnswerCount ++;
			this._combo ++;

			//効果音：正解
			let se:cc.AudioClip = (this._combo >= 6 || this._qDatas[this._QNum].format == "複数回答") ? GameSE.clip.pinponX2 : GameSE.clip.pinpon;
			SE.play(se);

			//--------- スコア算出ここから -------------

			// 正解ボーナス：1問正解すると10点。10問で100点
			// スピードボーナス：残り秒数(少数第一まで)*0.25点。10問で100点
			// ノーヒントボーナス：ヒントみずに正解 1問5点 10問で50点
			// コンボボーナス：リストに沿った点数。10問で150点
			// 小数点第二位まで表示

			//基本スコア
			let baseScore:number = 10;
			//残り秒数 × 0.25 を切り捨て
			let timeBonus:number = Math.floor(this._questionWindow.timeBoard.getRemainingFloatTime() * 0.25);
			//コンボで入るスコア
			let addComboScore:number = GameMain.COMBO_SCORE_LIST[this._combo];
			//ノーヒントスコア
			let noHintBonus:number = this._openHint ? 0 : 5;

			//4項目ごとの合計値を保持
			this._scoreDetail.base += baseScore;
			this._scoreDetail.time += timeBonus;	//小数点そのままの累計タイムボーナスを保持
			this._scoreDetail.combo += addComboScore;
			this._scoreDetail.noHint += noHintBonus;
			// this._scoreDetail.keikaTimes.push(this._questionWindow.timeBoard.getAnwerFloatTime());

			//この問題でのスコア
			let correctDefScore:number = baseScore + timeBonus + addComboScore + noHintBonus;
			cc.log("この問題でのスコア:" + baseScore + " + " + timeBonus + " + " + addComboScore + " + " + noHintBonus + " = " + correctDefScore);

			//＋表示が飛んでいく座標
			let bonusLandingPos:cc.Vec2 = this._scoreBar.getBonusLandingPos(this.comboBonusDisp.parent);

			//ゲームスコア
			this._gameScore = this._scoreDetail.base + this._scoreDetail.time +  this._scoreDetail.combo + this._scoreDetail.noHint;
			// this._speedBonus = currentTotalTimeBonus;
			cc.log("現在のスコア:" + this._gameScore);


			//--------- スコア算出ここまで -------------

			//コンボで最初に出てくるウンコムシの数
			const UNKO_EFFECT_COUNT:number[] = [0,2,3,4,5,8,10,12,16,16,16];

			//背景、正解演出
			this._gameBG.rightAnswer(this._combo);

			//正解コメントの作成
			this._makeSeikaiHukidashi();

			this.hintControl.startHint();		//正解コメント、短い解説などの表示


			//コンボ表示が出る
			if(this._combo >= 2)
			{
				this.comboDisp.setFrame(this._combo - 2);
				this.comboDisp.node.active = true;
				this.comboDisp.node.scale = 0.3;
				this.comboDisp.node.runAction(
					cc.sequence(
						cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
						cc.delayTime(1.0),
						cc.callFunc(()=>
						{
							this.comboDisp.node.active = false;
						})
					)
				);
			}


			//ウンコが飛び出す。10 + 正解数
			this._putUnkoEffect(10 + this._rightAnswerCount, this.comboDisp.node.position, 1.5, 0.04);

			//サブコンボ表示に関する中央の座標
			let subDispCenterPos:cc.Vec2 = this.comboDisp.node.getPosition();


			// コンボボーナス(増えるウンコムシの数が2以上)
			if(UNKO_EFFECT_COUNT[this._combo] > 1)
			{
				let rad:number = Math.random() * Math.PI * 2.0;
				this.comboBonusDisp.x = subDispCenterPos.x + Math.cos(rad) * 250;
				this.comboBonusDisp.y = subDispCenterPos.y + Math.sin(rad) * 250;

				this._putUnkoEffect(UNKO_EFFECT_COUNT[this._combo] * 2, this.comboBonusDisp.position, 0.5, 0.02);		//ウンコ追加

				const lastScale:number = (this._combo > 5) ? 2.0 : 1.0;

				this.comboBonusDisp.active = true;
				this.comboBonusDisp.scale = 0.3;
				this.comboBonusDisp.runAction(
					cc.sequence(
						cc.scaleTo(0.3, lastScale).easing(cc.easeBackOut()),
						cc.delayTime(0.3),
						cc.spawn(
							cc.moveTo(0.4, bonusLandingPos).easing(cc.easeIn(2.0)),
							cc.scaleTo(0.4, 0.3)
						),
						cc.callFunc(()=>
						{
							this.comboBonusDisp.active = false;
						})
					)
				);
			}



			// 正解時はタイムボーナス、ノーヒントボーナスがあれば出す。
			let waitTime = 0.3;// 1.5;

			//タイムボーナス(0 ~ 10、アイテムでx2)
			if(timeBonus >= 1)
			{
				this.node.runAction(
					cc.sequence(
						cc.delayTime(waitTime),
						cc.callFunc(()=>
						{
							let rad:number = Math.random() * Math.PI * 2.0;
							this.timeBonusDisp.x = subDispCenterPos.x + Math.cos(rad) * 250;
							this.timeBonusDisp.y = subDispCenterPos.y + Math.sin(rad) * 250;

							let timeBonusMushiCount:number = Math.floor(timeBonus);
							this._putUnkoEffect(timeBonusMushiCount * 2, this.timeBonusDisp.position, 0.5, 0.02);		//ウンコ追加

							const lastScale:number = (timeBonus > 5) ? 2.0 : 1.0;

							this.timeBonusDisp.active = true;
							this.timeBonusDisp.scale = 0.3;
							this.timeBonusDisp.runAction(
								cc.sequence(
									cc.scaleTo(0.3, lastScale).easing(cc.easeBackOut()),
									cc.delayTime(0.3),
									cc.spawn(
										cc.moveTo(0.4, bonusLandingPos).easing(cc.easeIn(2.0)),
										cc.scaleTo(0.4, 0.3)
									),
									cc.callFunc(()=>
									{
										this.timeBonusDisp.active = false;
									})
								)
							);
						})
					)
				);
				waitTime += 0.3;// 0.8;
			}

			//ノーヒントボーナス(0 か 5 かアイテムで 10)
			if(noHintBonus > 0)
			{
				this.node.runAction(
					cc.sequence(
						cc.delayTime(waitTime),
						cc.callFunc(()=>
						{
							let rad:number = Math.random() * Math.PI * 2.0;
							this.noHintBonusDisp.x = subDispCenterPos.x + Math.cos(rad) * 250;
							this.noHintBonusDisp.y = subDispCenterPos.y + Math.sin(rad) * 250;

							this._putUnkoEffect(noHintBonus * 2, this.noHintBonusDisp.position, 0.5, 0.02);		//ウンコ追加

							const lastScale:number = (noHintBonus > 5) ? 2.0 : 1.0;

							this.noHintBonusDisp.active = true;
							this.noHintBonusDisp.scale = 0.3;
							this.noHintBonusDisp.runAction(
								cc.sequence(
									cc.scaleTo(0.3, lastScale).easing(cc.easeBackOut()),
									cc.delayTime(0.3),
									cc.spawn(
										cc.moveTo(0.4, bonusLandingPos).easing(cc.easeIn(2.0)),
										cc.scaleTo(0.4, 0.3)
									),
									cc.callFunc(()=>
									{
										this.noHintBonusDisp.active = false;
									})
								)
							);
						})
					)
				);
			}


			waitTime += 0.6;
			this.node.runAction(
				cc.sequence(
					cc.delayTime(waitTime),
					cc.callFunc(()=>
					{
						this._scoreBar.addScore(rightAnswer, this._gameScore);
						//強制的に解説が出る
						this._showKaisetsu(rightAnswer);
						this._showIjinMiniHukidash(true);
						this.ijinScreen.ijinActionBuruburu();
						cc.tween({})
						.delay(0.8)
						.call(()=>{ this.ijinScreen.ijinStopAction(); })
						.start();
						// this._nextQuestion();
					})
				)
			);

		}
		// 不正解時
		else
		{
			this._wrongAnswerCount ++;
			
			//効果音：間違い
			SE.play(GameSE.clip.batsu);

			this.ijinScreen.ijinActionBikkuri();	//ぴょんと跳ねる
			//偉人の吹き出し登場
			this._showIjinMiniHukidash(false);

			
			//タイムアップ
			if(answerCode == AC.ANSWER_CODE_TIME_UP)
			{
				cc.log("TIME UP!!!!");
				//背景、タイムアップ演出
				this._gameBG.timeUp(this._combo);
			}
			//不正解を選択
			else
			{
				//背景、不正解演出
				this._gameBG.wrongAnswer(this._combo);
			}

			let qData = this._qDatas[this._QNum];
			this.hintControl.entryHints([qData.script_incorrect], [Hukidashi.TYPE_SERIHU], 0.3);
			this.hintControl.startHint();

			this._combo = 0;

			//0.7秒後に色反転演出、その後に解説
			cc.tween(this.canvas.node)
			.delay(0.75)
			.call(()=>
			{
				//効果音「ガーン」
				SE.play(GameSE.clip.negaEffect);
				//色反転
				this._negaEffector.setNega();
				this._gameBG.negaStart();
			})
			.delay(1.2)
			.call(()=>
			{
				//色反転戻す
				this._negaEffector.setDefault();
				this._gameBG.negaEnd();

				//偉人のスコア増加
				this._scoreBar.addScore(rightAnswer, this._gameScore);
			})
			.delay(0.5)
			.call(()=>
			{
				//解説表示
				this._showKaisetsu(false);
			})
			.start();

		}
	}


	private _showIjinMiniHukidash(isCorrect:boolean):void
	{
		let script:string = "";
		
		if(isCorrect)
		{
			if(this._rightAnswerCount == 3) script = StaticData.opponentData.correct_script1;
			else if(this._rightAnswerCount == 6) script = StaticData.opponentData.correct_script2;
			else if(this._rightAnswerCount == 9) script = StaticData.opponentData.correct_script3;
		}
		else
		{
			if(this._wrongAnswerCount == 3) script = StaticData.opponentData.incorrect_script1;
			else if(this._wrongAnswerCount == 6) script = StaticData.opponentData.incorrect_script2;
			else if(this._wrongAnswerCount == 9) script = StaticData.opponentData.incorrect_script3;
		}

		//何も表示しない
		if(script == null || script == "") return;

		this.ijinHukidashiOutput.setText(script);
		this.ijinHukidashiOutput.flushText();
		
		this.ijinHukidashiNode.active = true;
		this.ijinHukidashiNode.scale = 0.3;
		this.ijinHukidashiNode.runAction(
			cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
		);
	}


	/**
	 * うんこを画面中央に登場させる
	 * @param count うんこの数
	 */
	private _putUnkoEffect(count:number, position:cc.Vec3, unkoScale:number, intervalTime:number):void
	{
		//画面中央から飛び出す
		for (let i:number = 0 ; i < count ; i ++)
		{
			let node:cc.Node = new cc.Node();
			let sprite:cc.Sprite = node.addComponent(cc.Sprite);
			let rNum:number = Math.floor(Math.random() * this.unkomushiSpriteFrames.length);
			sprite.spriteFrame = this.unkomushiSpriteFrames[rNum];
			let rect:cc.Rect = sprite.spriteFrame.getRect();
			node.width = rect.width;
			node.height = rect.height;
			node.position = position;

			this.unkomushisNode.addChild(node);

			let rad:number = Math.random() * Math.PI * 2.0;
			let moveX:number = Math.cos(rad) * 400 * unkoScale;
			let moveY:number = Math.sin(rad) * 400 * unkoScale;

			node.scale = 0.0;
			node.runAction(
				cc.sequence(
					cc.delayTime(i * intervalTime),
					cc.callFunc(()=>
					{
						SE.play(GameSE.clip.unkoEffect);
						node.scale = unkoScale * 0.4;
					}),
					cc.spawn(
						cc.scaleTo(0.3, unkoScale).easing(cc.easeBackOut()),
						cc.jumpBy(0.3, moveX, moveY, 100, 1)
					),
					cc.removeSelf()
				)
			)
		}
	}


	private _showHintFromHukidashiButton()
	{
		this._openHint = true;
	}



	/**
	 * 解説アニメーションと解説を表示
	 * @param rightAnswer 正解、不正解
	 */
	private _showKaisetsu (rightAnswer:boolean):void
	{
		//SE 解説表示音
		SE.play(GameSE.clip.showKaisetsu);

		//背景
		this._gameBG.kaisetsu();

		//解説の表示
		this._kaisetsuWindow.node.active = true;
		this._kaisetsuWindow.showKaisetsu(this._qDatas[this._QNum], ()=>
		{
			//閉じるボタンを押した時

			this._kaisetsuWindow.node.active = false;

			//次の問題へ
			this._nextQuestion();
		});
	}


	private _makeSeikaiHukidashi():void
	{
		let qData:QuestionData = this._qDatas[this._QNum];
		let answerTime:number = this._questionWindow.timeBoard.getAnwerTime();

		let words:string[] = [qData.script_correct];
		let types:number[] = [];

		if(answerTime < 5.0) words.push(qData.script_fastest);
		else if(answerTime < 10.0) words.push(qData.script_fast);
		else if(answerTime < 20.0) words.push(qData.script_normal);

		if(this._combo > 1)
		{
			let comboWord:string = qData.script_combo;
			if(comboWord != null && comboWord != undefined)
			{
				comboWord = comboWord.replace("[X]", "" + this._combo);
				words.push(comboWord);
			}
		}

		for(let i:number = 0 ; i < words.length ; i ++)
		{
			types.push(Hukidashi.TYPE_SERIHU);
		}

		this.hintControl.entryHints(words, types, 0.2);
	}



	private _ijinInsertEvent(callback:()=>void):void
	{
		//中央に拡大
		this._setIjinCenter(0.5);

		cc.tween({})
		.delay(0.5)
		.call(()=>
		{
			let script:string = StaticData.opponentData.play_script;
			cc.log(script);
			let storyScreenNode:cc.Node = cc.instantiate(this.storyScreenPrefab);
			this.resultParentNode.addChild(storyScreenNode);

			let storyScreen:StoryScreen = storyScreenNode.getComponent(StoryScreen);
			storyScreen.setup(this.ijinScreen, this.canvas.node);
			storyScreen.setupStory(StaticData.opponentData.name, script);
			storyScreen.onComplete(()=>
			{
				//ゴリベンの偉人との会話終わり
				storyScreen.node.removeFromParent(true);

				//偉人右下に戻る
				this._setIjinRightBottom(0.3);

				callback();
			});
			storyScreen.startStory();
		})
		.start();
	}



	/**
	 * 表示中の問題を消す
	 */
	private _resetCurrentQuestion():void
	{
		this._questionWindow.resetQuestion();

		cc.log("RESET HINT");
		this.hintControl.resetHint();
	}


	/**
	 * 次の問題へ
	 */
	private _nextQuestion ():void
	{
		this._resetCurrentQuestion();

		//効果音：問題表示
		SE.play(GameSE.clip.showQuestion);

		//スライドで横にはける
		this._questionWindow.moveOut(()=>
		{

			this._QNum ++;

			if (this._QNum == 10)
			{
				//ここで背景の終了演出がいるなら　gameBg.preFinish()を用意すること
				this._preFinishSendAPI();
			}
			else
			{
				this._setupQuestion();
			}
		});

		

	}



	private _preFinishSendAPI()
	{
		//サーバに回答送信
		ExAPI.exResult(this._sendAnswers, this._requestToken, (response:any)=>
		{
			cc.log("POST QUESTION RESPONSE");
			cc.log(response);

			this._sendEndGameAPI();
		});
	}


	private _sendEndGameAPI():void
	{
		ExAPI.exEnd(this._requestToken, ()=>
		{
			cc.log("GAME END RESPONSE");
			if (this._gameScore >= 350) {
				StaticData.gameSetting.specificResultNum = 3;
			} else if (this._gameScore >= 250) {
				StaticData.gameSetting.specificResultNum = 2;
			} else {
				StaticData.gameSetting.specificResultNum = 1;
			}
			this._finish();
		});
	}


	/**
	 * 全問題終了時
	 */
	private _finish():void
	{
		//BGM止める
		SE.bgmStop();
		SE.play(GameSE.clip.endGame);

		//終了のコメント表示
		this.hintControl.finish();

		//フィニッシュのテキストを出す
		this.finishTextNode.active = true;
		this.finishTextNode.scale = 0.1;
		this.finishTextNode.runAction(
			cc.scaleTo(0.24, 1.0).easing(cc.easeBackOut())
		);

		this.ijinHukidashiNode.active = false;

		//全問終了 背景、終了演出
		this._gameBG.finish(()=>
		{
			//フィニッシュのスクリーン
			this._showFinishScreen();
		});
	}



	/**
	 * フィニッシュのスクリーン
	 */
	private _showFinishScreen():void
	{
		//フィニッシュのスクリーン登場音
		//SE.play(GameSE.clip.finishScreenStart);
		this._finishScreen.setup(StaticData.gameSetting.endColor1, StaticData.gameSetting.endColor2);
		this._finishScreen.showFinishTexts();
		this._finishScreen.finishShow(()=>
		{
			//背景をリザルト背景に変更
			this._gameBG.changeResultBG();

			this._showResult();
		});
	}
	



	/**
	 * フィニッシュのスクリーン後、結果画面表示
	 */
	private _showResult():void
	{
		
		this.finishTextNode.runAction(
			cc.sequence(
				cc.scaleTo(0.2, 0.1).easing(cc.easeIn(2.0)),
				cc.callFunc(()=>
				{
					this.finishTextNode.active = false;
				})
			)
		);
		
		//スコア非表示に
		this._scoreBar.node.active = false;

		// イントロダクションのプリロード
        cc.director.preloadScene("introduction");


		// スコア表示
		let scoreNode: cc.Node = cc.instantiate(this.scorePrefab);
		let score: Score = scoreNode.getComponent(Score);

		score.setup();
		this.resultParentNode.addChild(scoreNode);
		this.node.runAction(cc.sequence(
			cc.delayTime(1),
			cc.callFunc(() => {
				score.showScore(this._gameScore, this._scoreDetail.base, this._scoreDetail.time, this._scoreDetail.combo, this._scoreDetail.noHint);
			})
		))
	}

    // update (dt) {},

	onDestroy():void
	{
		//動いてるtweenをすべて止める
		cc.Tween.stopAll();
		this.node.stopAllActions();

		let __FUNC__ = (node:cc.Node)=>
		{
			node.stopAllActions();
			for(let i:number = 0 ; i < node.childrenCount ; i ++)
			{
				__FUNC__(node.children[i]);
			}
		};

		__FUNC__(this.contentsNode);

		let sleepListener:SleepListener = this.node.getComponent(SleepListener);
		sleepListener.deleteResume();
	}
}
