import SchoolText from "../common/SchoolText";
import HintControl from "./HintControl";
import SceneChanger from "../common/SceneChanger";
import ExAPI from "../common/ExAPI";
import StaticData, { GameMode, EasingName } from "../StaticData";
import AC from "../answerComponents/AC";
import QuestionData from "./QuestionData";
import GameBG from "./bg/GameBG";
import Hukidashi from "./Hukidashi";
import KaisetsuWindow from "./KaisetsuWindow";
import FrontEffect from "./FrontEffect";
import Result from "./Result";
import KomaSprite from "./KomaSprite";
import FinishScreen from "./FinishScreen";
import SleepListener from "../common/SleepListener";
import AllKaitou from "./AllKaitou";
import StoryScreen from "../introduction/StoryScreen";
import { CollectionItem, CPUData, PlayerData, SchoolEnd } from "../common/Models";
import NegaEffector from "../common/NegaEffector";
import VSScreen from "./VSScreen";
import IjinScreen from "./IjinScreen";
import SE from "../common/SE";
import { GameSE } from "./GameSEComponent";
import PlayerStatusBar from "../common/PlayerStatusBar";
import ScoreBar from "./ScoreBar";
import UnkoGet from "./UnkoGet";
// import GhostPlayer from "./GhostPlayer";
import STFormat from "../common/STFormat";
import NextIjinWarp from "./NextIjinWarp";
// import BugTracking from "../common/BugTracking";
import SystemIcon from "../common/SystemIcon";
import QuestionWindow from "./QuestionWindow";
// import GameEndScreen from "./GameEndScreen";
// import GhostScreen from "../introduction/GhostScreen";
// import CharaUnkoSensei from "../opening/CharaUnkoSensei";
import Score from "../game/Score";

const {ccclass, property} = cc._decorator;


/**
 * ゲーム中の加算スコアをまとめたクラス
 * ガチ勉の相手のスコアをこれで管理するならもっと機能を充実させる（コンボ数の保持など）。現状はプレーヤーのみなのでそこまで必要ない
 */
class ScoreDetail
{
	/** 正解点 */
	public base:number = 0;
	// private _timeRaw:number = 0;
	// private _time:number = 0;
	/** タイムボーナス */
	public time: number = 0;
	/** コンボボーナス */
	public combo:number = 0;
	/** ヒント無しボーナス */
	public noHint:number = 0;
	/** ここまでで回答までにかかった時間 */
	// public keikaTimes:number[] = [];

	// public set timeRaw(value:number)
	// {
	// 	this._timeRaw = value;
	// 	this._time = Math.floor(this._timeRaw * 10) / 10;
	// }
	/** スピードボーナス（少数切り捨てなしのオリジナル） */
	// public get timeRaw()
	// {
	// 	return this._timeRaw;
	// }
	/** スピードボーナス（少数第２位以下切り捨て） */
	// public get time()
	// {
	// 	return this._time;
	// }
	

}



@ccclass
export default class GameMain extends cc.Component {

	@property(cc.Canvas) canvas: cc.Canvas = null;
	@property(cc.Node) contentsNode:cc.Node = null;
	@property(cc.Node) markU:cc.Node = null;
	@property(cc.Node) markR:cc.Node = null;
	@property(HintControl) hintControl: HintControl = null;
	@property(cc.SpriteFrame) imgLoadErrorSpriteFrame: cc.SpriteFrame = null;
	@property(cc.Node) ijinScreenNode: cc.Node = null;
	@property(IjinScreen) ijinScreen:IjinScreen = null;
	@property(cc.Node) bgParentNode: cc.Node = null;
	@property(cc.Prefab) bgPrefab: cc.Prefab =  null;
	@property(FrontEffect) frontEffect :FrontEffect = null;
	@property(cc.Node) resultParentNode: cc.Node = null;
	@property(cc.Prefab) scoreBarPrefab:cc.Prefab = null;
	// @property(cc.Prefab) scoreBarHayabenPrefab:cc.Prefab = null;
	// @property(cc.Prefab) scoreBarGoribenPrefab:cc.Prefab = null;
	// @property(cc.Prefab) scoreBarGhostPrefab:cc.Prefab = null;
	// @property(cc.Node) unkoSenseiParentNode: cc.Node = null;
	// @property(cc.Prefab) charaUnkoSenseiPrefab: cc.Prefab = null;
	// @property(cc.Prefab) scoreBarPreviewPrefab:cc.Prefab = null;
	@property(cc.Prefab) resultScorePrefab: cc.Prefab = null;
	@property(cc.Prefab) resultGoribenPrefab: cc.Prefab = null;
	@property(cc.Prefab) resultGhostPrefab: cc.Prefab = null;
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
	// @property(cc.Node) ghostScreenParentNode:cc.Node = null;

	@property(cc.Prefab) unkoGetPrefab: cc.Prefab = null;
	@property(cc.Prefab) allKaitouPrefab: cc.Prefab = null;
	@property(cc.Prefab) storyScreenPrefab: cc.Prefab = null;
	@property(cc.Prefab) vsScreenPrefab: cc.Prefab = null;
	// @property(cc.Prefab) ghostPlayerPrefab: cc.Prefab = null;
	@property(cc.Prefab) comboRankingPrefab: cc.Prefab = null;
	@property(cc.Prefab) playerStatusBarPrefab: cc.Prefab = null;
	@property(cc.Prefab) nextIjinWarpPrefab: cc.Prefab = null;
	@property(cc.Prefab) sceneLoadIndicator: cc.Prefab = null;
	@property(cc.Prefab) questionWindowPrefab: cc.Prefab = null;
	@property(cc.Prefab) kaisetsuWindowPrefab: cc.Prefab = null;
	// @property(cc.Prefab) gameEndScreenPrefab: cc.Prefab = null;
	// @property(cc.Prefab) ghostScreenPrefab: cc.Prefab = null;
	@property(cc.Prefab) scorePrefab: cc.Prefab = null;


	private _sceneChanger: SceneChanger = null;
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
	// private _challengers: Challenger[] = [];
	// private _cpu_datas:{short_name:string, target_score:number, icon_image_url:string, thumbnail_image_url:string, win_script:string, lose_script:string}[] = [];
	private _endAPIResponse:SchoolEnd = null;
	// private _scoreMagnification:number = 1;		//経験値ブースト
	private _scoreDetail:ScoreDetail;		//正解点、スピードボーナス、コンボボーナス、ノーヒントボーナスがまとまったもの
	// private _ghostScore:ScoreDetail;		//ゴーストのスコア
	// private _ghostGameScores:number[];
	private _negaEffector:NegaEffector = null;
	// private _ghostPlayer:GhostPlayer = null;
	private _playerStatusBar:PlayerStatusBar = null;
	private _seID_harryUp:number = -1;		//残り10秒のカチカチ音
	private _finishScreen:FinishScreen = null;
	private _questionWindow:QuestionWindow = null;
	private _kaisetsuWindow: KaisetsuWindow = null;

	// private _ghostAction:cc.Action = null;

	private _gameScore:number = 0;
	// private _speedBonus: number = 0;
	private _sendAnswers:{question_id:string, answer:string, correct_answer: string, required_time:number, hint:boolean}[] = [];
	private _correctHistories:boolean[] = [];
	private _ijinEvent:boolean = false;

	private _scoreBar:ScoreBar = null;

	// public static readonly ITEM_ID_SPEED_BONUS_X_2 :number = 1;
	// public static readonly ITEM_ID_NO_HINT_BONUS_X_2 :number = 2;
	// public static readonly ITEM_ID_CORRECT_BONUS_X_2 :number = 3;
	// public static readonly ITEM_ID_COMBO_BONUS_X_2: number = 4;

	private static readonly IJIN_CUTIN_EVENT_TURN:number = 10;		//カットインで入ってくる場所(第 n 問目)

	//コンボの得点リスト
	public static readonly COMBO_SCORE_LIST:number[] = [0,0,10,15,15,15,15,20,20,20,20];

	/** オフラインテスト。APIを叩かず実行する単体テスト */
	// private OFFLINE_TEST:boolean = false;

	// private _sensei: CharaUnkoSensei = null;
	// private _senseiTween: cc.Tween = null




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

		this._sceneChanger = this.getComponent(SceneChanger);
		this._negaEffector = this.getComponent(NegaEffector);
		// this._QNum = 0;
		this._combo = 0;
		this._rightAnswerCount = 0;
		this._IMG_RES = {};

		this._scoreDetail = new ScoreDetail();
	
		this.ijinScreen.setup();
		this.ijinScreen.show();
		this._setIjinRightBottom(0.0);

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
		// BGM無しの場合
		// if(! StaticData.playerData.bgm_enabled || StaticData.debugBgmMute)
		// {
		// 	callback();
		// 	return;
		// }


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

				//偉人を表示
				// this.ijinScreen.setIjinImage(StaticData.ijinData.ijinImageSpriteFrame);
				// this.ijinScreen.show();

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


	// private _loadChallengerImages(imgs:cc.SpriteFrame[], urlList:string[], callback:(loadedImgs:cc.SpriteFrame[])=>void):void
	// {
	// 	if(imgs.length == urlList.length)
	// 	{
	// 		callback(imgs);
	// 		return;
	// 	}
		
	// 	//画像の読み込み
	// 	ExAPI.loadImage("key", urlList[imgs.length], (result)=>
	// 	{
	// 		//読み込み完了時
	// 		if(result.error != null)
	// 		{
	// 			console.log("Image Load Failed : " + result.error);
				
	// 			imgs.push(this.imgLoadErrorSpriteFrame);		//ダミー画像(Error画像)
	// 			this._loadChallengerImages(imgs, urlList, callback);

	// 			this.hintControl.errorMsg("ijin img failed.");
	// 			return;
	// 		}
			
	// 		//画像をjsonで保持
	// 		imgs.push(result.image);
	// 		this._loadChallengerImages(imgs, urlList, callback);
	// 	});
	// }





	
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
		if(this._QNum == GameMain.IJIN_CUTIN_EVENT_TURN - 1 && ! this._ijinEvent)
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
		// StaticData.lastQuestionID = qData.id;		//デバッグ用に最後に表示した問題idを保持

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

			//ゴーストの動作開始
			// if(StaticData.gameModeID == GameMode.GHOST)
			// {
			// 	let requiredTime:number = this._qDatas[this._QNum].ghost_required_time;
			// 	let ghostResult:boolean = this._qDatas[this._QNum].ghost_result;

			// 	this._ghostAction = this.node.runAction(
			// 		cc.sequence(
			// 			cc.delayTime(requiredTime),
			// 			cc.callFunc(()=>{
			// 				//ゴースト正解
			// 				if(ghostResult)
			// 				{
			// 					this._ghostPlayer.goodAction();
			// 				}
			// 				//ゴースト不正解
			// 				else
			// 				{
			// 					this._ghostPlayer.badAction();
			// 				}
			// 			})
			// 		)
			// 	);
			// }
		});

		
	}



	// /**
	//  * プレビュー問題を表示
	//  * @param questionData 問題データ
	//  */
	// public showPreviewQuestion(questionData:QuestionData):void
	// {
	// 	if(questionData == null)
	// 	{
	// 		console.log(questionData);
	// 		BugTracking.notify("プレビューモード問題取得エラー", "GameMain.showPreviewQuestion()", { msg:"問題データが取得できませんでした", questionData:questionData } );
	// 		return;
	// 	}

	// 	this.hintControl.hideHintButton();
		
	// 	this._questionWindow.hideImage();
	// 	this._resetCurrentQuestion();		//表示中の問題を削除
		
	// 	console.log("プレビュー問題表示");
	// 	console.log(questionData);

	// 	this._qDatas = [questionData];
	// 	this._QNum = 0;
	// 	this._makeLoadImageList();
	// 	this._loadQuestionImages(0, ()=>
	// 	{
	// 		//表示開始
	// 		this._gameStart();
	// 	});
	// }


	
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
			
			//石島さんの方式に変更(2021/02/15)
			// let keikaTime:number = 0;
			// for(let i:number = 0 ; i < this._scoreDetail.keikaTimes.length ; i ++)
			// {
			// 	keikaTime += this._scoreDetail.keikaTimes[i];
			// }
			// let keikaTimeKirisute:number = Math.floor(keikaTime * 10) / 10;
			// let shoyouTime:number = this._rightAnswerCount * 40 - keikaTimeKirisute;
			// let currentTotalTimeBonus:number = Math.floor(shoyouTime * 0.25 * 10) / 10;

			this._gameScore = this._scoreDetail.base + this._scoreDetail.time +  this._scoreDetail.combo + this._scoreDetail.noHint;
			// this._speedBonus = currentTotalTimeBonus;
			cc.log("現在のスコア:" + this._gameScore);


			//--------- スコア算出ここまで -------------

			//コンボで最初に出てくるウンコムシの数
			const UNKO_EFFECT_COUNT:number[] = [0,2,3,4,5,8,10,12,16,16,16];

			//背景、正解演出
			this._gameBG.rightAnswer(this._combo);

			//正解コメントが出る ※解説表示のため自動で表示するstartHint()は切ってある
			//this.hintControl.goodAnswer();

			//正解コメントの作成
			this._makeSeikaiHukidashi();


			// //短い解説がコメントに出る
			// if(StaticData.previewMode)
			// {
			// 	//通常の方式で出そうとすると_nextQuestion()内でキャンセルがかかるので、ここで即表示させてる
			// 	this.hintControl.putHint(this._qDatas[this._QNum].explain_short, Hukidashi.TYPE_KAISETSU);
			// }
			// else if(StaticData.gameModeID != GameMode.HAYABEN)
			// {
			// 	this.hintControl.shortKaisetsu(this._qDatas[this._QNum].explain_short);
			// 	//this.hintControl.startHint();	//ブロックの外に出した
			// }
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

			//間違いコメントが出る
			//this.hintControl.badAnswer();

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

		// cc.log("--- 結果算出 ------");
		// let totalBaseItemScore:number = this._scoreDetail.base;

		// cc.log("==== 回答までにかかった時間 =============");

		// //石島さんの方式に変更(2021/02/15)
		// let keikaTime:number = 0;
		// for(let i:number = 0 ; i < this._scoreDetail.keikaTimes.length ; i ++)
		// {
		// 	keikaTime += this._scoreDetail.keikaTimes[i];
		// 	cc.log(this._scoreDetail.keikaTimes[i]);
		// }
		// cc.log("-------------------------------");
		// cc.log("合計:" + keikaTime);

		// let keikaTimeKirisute:number = Math.floor(keikaTime * 10) / 10;
		// let shoyouTime:number = (this._rightAnswerCount * 40) - keikaTimeKirisute;
		// let currentTotalTimeBonus:number = Math.floor(shoyouTime * 0.25 * 10) / 10;
		// // let totalTimeItemScore:number = currentTotalTimeBonus * this._itemSpeedBonus;		//石島さん式(2021/02/15)

		// let totalComboItemScore:number = this._scoreDetail.combo * this._itemComboBonus;
		// let totalNoHintItemScore:number = this._scoreDetail.noHint * this._itemNoHintBonus;

		// let totalDefScore:number = totalBaseItemScore + totalTimeItemScore + totalComboItemScore + totalNoHintItemScore;
		
		// cc.log("各スコア: " + totalBaseItemScore + " + " + totalTimeItemScore + " + " + totalComboItemScore + " + " + totalNoHintItemScore);
		// cc.log("各スコア合計: " + totalDefScore);
		// cc.log("経験値ブースト: " + totalDefScore + " x " + this._scoreMagnification + " = " + (totalDefScore * this._scoreMagnification));
		//↑これの小数点第１位まで切り捨てたのがサーバーのスコア


		//----------------------------------

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
		ExAPI.exEnd(this._requestToken, (response:SchoolEnd)=>
		{
			cc.log("GAME END RESPONSE");
			cc.log(response);

			// //サーバと正解数がズレていないか確認
			// let wrongResults:boolean[] = [];		//ズレた問題idを入れる

			// cc.log(response.answers);
			// for(let i:number = 0 ; i < response.answers.length ; i ++)
			// {
			// 	if(response.answers[i].result != this._correctHistories[i])
			// 	{
			// 		//サーバとゲームの正解・不正解が異なる
			// 		wrongResults.push(response.answers[i].question_id);
			// 	}
			// }

			// if(wrongResults.length > 0)
			// {
			// 	let str:string = "";
			// 	for(let i:number = 0 ; i < wrongResults.length ; i ++)
			// 	{
			// 		str += " " + wrongResults[i];
			// 	}

			// 	BugTracking.notify("サーバとゲームで正解のズレ発生", "GameMain._sendEndGameAPI()",
			// 	{
			// 		msg:"サーバとゲームで正解のズレ発生。\nID:" + str,
			// 		api_answers:response.answers,
			// 		game_answers:this._correctHistories,
			// 		wrongIDs:wrongResults
			// 	});
			// }
			// else
			// {
			// 	//サーバとの誤差を確認するためのスコア
			// 	let checkScore:number = Math.floor(this._gameScore * 10) / 10;

			// 	if(checkScore != response.scoring_total)
			// 	{
			// 		let keikaTime:number = 0;
			// 		for(let i:number = 0 ; i < this._scoreDetail.keikaTimes.length ; i ++)
			// 		{
			// 			keikaTime += this._scoreDetail.keikaTimes[i];
			// 		}
			// 		let keikaTimeKirisute:number = Math.floor(keikaTime * 10) / 10;
			// 		let shoyouTime:number = (this._rightAnswerCount * 40) - keikaTimeKirisute;
			// 		let currentTotalTimeBonus:number = Math.floor(shoyouTime * 0.25 * 10) / 10;
					
			// 		BugTracking.notify("スコア誤差発生", "GameMain._sendEndGameAPI()",
			// 		{
			// 			msg:"ゲーム: " + this._gameScore + " / サーバ: " + response.scoring_total + " 回答時間合計：" + keikaTime + " -> " + keikaTimeKirisute + " スピード点：" + currentTotalTimeBonus,
			// 			game_score:this._gameScore,
			// 			api_score:response.scoring_total,
			// 			game_send:this._scoreDetail,
			// 			game_correct:this._rightAnswerCount,
			// 			api_response:response
			// 		});
			// 	}
			// }

			//スコアをサーバから受け取ったものに変更、結果画面へ
			// this._gameScore = response.scoring_total;
			// this._rightAnswerCount = response.accuracy_num;		//こっちは正解数
			this._endAPIResponse = response;
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
		this.ijinScreenNode.active = false;

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
				// score.showScore(this._gameScore, this._scoreDetail.base, this._scoreDetail.time, this._scoreDetail.combo, this._scoreDetail.noHint);
				score.showScore(340, 300, 20, 10, 10);
			})
		))

		//フィニッシュスクリーンがはけてリザルト演出開始
		// this._finishScreen.endFinishAction(()=>
		// {
		// 	this._finishScreen.hideFinishTexts();
			
			// result.startAction();
		// });

		// // リザルトプレハブを読み込み、表示
		// let resultPrefab:cc.Prefab = null;
		// let data:any = {};

		// //---------------------------------------------------------
		// // 結果画面：はや勉
		// //
		// if (StaticData.gameModeID == GameMode.HAYABEN)
		// {
		// 	//resultPrefab = this.resultScorePrefab;

		// 	data.response = this._endAPIResponse;
		// 	data.canvasNode = this.canvas.node;
		// 	// data.oldTensaiPower = StaticData.playerData.maxPower;

		// 	//コンボランキングはここに挟んでもいいかも！


		// 	//はや勉は１つ目のリザルトを飛ばす
		// 	this._showStoryEndMenu(data, this._finishScreen);
		// 	return;
		// }
		// //---------------------------------------------------------
		// // 結果画面：ゴースト問題
		// //
		// // else if (StaticData.gameModeID == GameMode.GHOST)
		// // {
		// // 	resultPrefab = this.resultGhostPrefab;
			
		// // 	data.response = this._endAPIResponse;
		// // 	data.canvasNode = this.canvas.node;
		// // 	data.oldTensaiPower = StaticData.playerData.maxPower;
		// // 	data.ghostBG = this._gameBG;

		// // 	let ghostLastScore:number = (this.OFFLINE_TEST) ? this._endAPIResponse.high_score : this._scoreBar.getResultData().lastScore;
		// // 	if(this._endAPIResponse.high_score != ghostLastScore)
		// // 	{
		// // 		BugTracking.notify("ゴースト・スコアずれ", "GameMain._showResult()",
		// // 		{
		// // 			msg:"スコアずれ発生：\nゲーム内：" + ghostLastScore + "\nサーバ：" + this._endAPIResponse.high_score,
		// // 			game_score:ghostLastScore,
		// // 			api_score:this._endAPIResponse.high_score,
		// // 			response:this._endAPIResponse
		// // 		});
		// // 	}

		// // }
		// //---------------------------------------------------------
		// // 結果画面：ゴリ勉　とか？
		// //
		// else		//ゴリ勉
		// {
		// 	resultPrefab = this.resultGoribenPrefab;

		// 	data.response = this._endAPIResponse;
		// 	data.canvasNode = this.canvas.node;
		// 	data.markU = this.markU;


		// 	// let cpuDatas:CPUData[] = StaticData.opponentCPUs.cpu_data;
		// 	let ijinScores:number[] = this._scoreBar.getResultData().ijinScores;

		// 	// data.faces = [ StaticData.playerData.iconSpriteFrame, cpuDatas[0].iconSpriteFrame, cpuDatas[1].iconSpriteFrame, cpuDatas[2].iconSpriteFrame ];
		// 	// data.names = [ StaticData.playerData.nickname, cpuDatas[0].short_name, cpuDatas[1].short_name, cpuDatas[2].short_name ];
		// 	data.scores = [this._gameScore, ijinScores[0], ijinScores[1], ijinScores[2] ];
		// }

		// // プレハブからリザルトを作成
		// let resultNode:cc.Node = cc.instantiate(resultPrefab);
		// this.resultParentNode.addChild(resultNode);

		// let result:Result = resultNode.getComponent(Result);
		// result.setHintControl(this.hintControl);

		// //ゴリベン、ゴースト専用のResultを出す
		// result.setup(data, (code:number)=>
		// {
		// 	//---リザルト演出終了後----


		// 	// ゴリ勉は偉人が出てくる (code == Result.RTN_GORIBEN_NEXT と一緒)
		// 	if(StaticData.gameModeID == GameMode.GORIBEN)
		// 	{
		// 		//リザルト画面消す
		// 		result.node.removeFromParent(true);
		// 		result = null;

		// 		//会話が始まるのでヒントを全て消す
		// 		this.hintControl.removeAllHint();
		// 		//スキップボタンを表示
		// 		//this._playerStatusBar.showSkipButton();		//ここだとエラー出る！

		// 		//偉人画面作る
		// 		let isWin:boolean = (this._endAPIResponse.collections != null);
		// 		data.isWin = isWin;

		// 		let script:string = (isWin) ? StaticData.opponentData.win_script : StaticData.opponentData.lose_script;

		// 		if(script == null)
		// 		{
		// 			if(StaticData.DEBUG_DUMMY_STORIES)
		// 			{
		// 				script = (isWin) ?
		// 					"<i>まけた！君すごいな！</i>" +
		// 					"<y>いやいや、どうも・・</y>" +
		// 					"<ijin_bikkuri>" +
		// 					"<i>よし！君に力を授けよう！\nその調子で頑張るんじゃぞ！</i>" +
		// 					"<y>ありがとうございます。</y>"
		// 				:
		// 					"<i>がっはっは！まだまだじゃのう</i>" +
		// 					"<y>手加減してくれませんか？</y>" +
		// 					"<ijin_bikkuri>" +
		// 					"<i>ダメ！\n修行して出直してきなさい。\nまだまだ君は偉くなれるぞ！</i>" +
		// 					"<y>はい・・・</y>"
		// 				;
		// 			}
		// 			else
		// 			{
		// 				script = "null";
		// 			}
		// 		}

		// 		let storyScreenNode:cc.Node = cc.instantiate(this.storyScreenPrefab);
		// 		this.resultParentNode.addChild(storyScreenNode);

		// 		let storyScreen:StoryScreen = storyScreenNode.getComponent(StoryScreen);
		// 		storyScreen.setup(this.ijinScreen, this.canvas.node);
		// 		storyScreen.setupStory(StaticData.opponentData.name, script);
		// 		storyScreen.onComplete(()=>
		// 		{
		// 			//ゴリベンの偉人との会話終わり
					
		// 			if(isWin)
		// 			{
		// 				//ゲットしたコレクションが出る
		// 				this._showUnkoGetPopup(()=>
		// 				{
		// 					//メニュー表示
		// 					this._showStoryEndMenu(data, null);
		// 				});
		// 			}
		// 			else
		// 			{
		// 				//メニュー表示
		// 				this._showStoryEndMenu(data, null);
		// 			}

		// 		});
		// 		storyScreen.startStory();

		// 	}
		// 	//ゴースト (code == Result.RTN_GHOST_NEXT と一緒)
		// 	else if(StaticData.gameModeID == GameMode.GHOST)
		// 	{
		// 		//リザルト画面消す
		// 		result.node.removeFromParent(true);
		// 		result = null;

		// 		//多分これでいけるはず
		// 		this._showStoryEndMenu(data, null);
		// 	}
		// 	else
		// 	{
		// 		// BugTracking.notify("条件分岐エラー", "GameMain", { msg:"リザルトスコア　呼び出し時" });
		// 	}
		// });
	}

	/**
	 * 偉人とのストーリーパート終了、メニューボタンを表示
	 */
	// private _showStoryEndMenu(data:any, finishScreen:FinishScreen)
	// {
		
	// 	//画面上のステータスを表示
	// 	let statusNode:cc.Node = cc.instantiate(this.playerStatusBarPrefab);
    //     this._playerStatusBar = statusNode.getComponent(PlayerStatusBar);
    //     //this.resultParentNode.addChild(statusNode);

    //     this._playerStatusBar.setup(this.canvas.node);
    //     //プレーヤーの情報表示
	// 	// this._playerStatusBar.statusUpdate(StaticData.playerData.name);
	// 	//ボタンをロック
	// 	this._playerStatusBar.backButtonEnabled(false);
	// 	this._playerStatusBar.settingButtonEnabled(false);

	// 	//戻るボタンを押した時（このあとのVS画面で使う）
    //     this._playerStatusBar.onBackButtonCallback(()=>
	// 	{
	// 		//効果音：サブボタン音
	// 		//SE.play(MenuSE.clip.menuBtnPress);
			
	// 		//戻るボタンと設定ボタンをロック
	// 		this._playerStatusBar.backButtonEnabled(false);
	// 		this._playerStatusBar.settingButtonEnabled(false);

	// 		//ロードアイコン表示
	// 		let loadIcon:SystemIcon = SystemIcon.create(this.sceneLoadIndicator);
	// 		loadIcon.setup(StaticData.TIME_LOAD_SCENE_ICON);

	// 		cc.director.preloadScene("menu", ()=>{},
	// 			//ロード完了
	// 			(error:Error)=>
	// 			{
	// 				loadIcon.remove();      //ロードアイコンを消す
	
	// 				//フェードアウト
	// 				this._sceneChanger.sceneEnd(null, () =>
	// 				{
	// 					cc.director.loadScene("menu");
	// 				});
	// 			}
	// 		);

	// 	});

	// 	//設定ボタンを押した時
	// 	this._playerStatusBar.onSettingButtonCallback(()=>
	// 	{
	// 		//効果音：サブボタン音
	// 		//SE.play(MenuSE.clip.menuBtnPress);
			
	// 		this._playerStatusBar.createSettingWindow(this.contentsNode);
	// 	});

    //     this._playerStatusBar.onSettingWindowClose((change:boolean)=>
    //     {
    //         if(change)
	// 		{
	// 			SE.bgmStop();						//とりあえず止める
	// 			SE.bgmRestart();		//ミュートなら再生されない
	// 		}
    //     });




	// 	data.playerStatusBar = this._playerStatusBar;
		
		
		
	// 	//スコアResultを表示
	// 	let resultScoreNode:cc.Node = cc.instantiate(this.resultScorePrefab);
	// 	this.resultParentNode.addChild(resultScoreNode);
	// 	//this.resultParentNode.insertChild(resultScoreNode, 0);

	// 	//ステータスを上から重ねる
	// 	this.resultParentNode.addChild(statusNode);

	// 	let result:Result = resultScoreNode.getComponent(Result);
	// 	result.setHintControl(this.hintControl);
		

	// 	//結果（スコア表示）
	// 	result.setup(data, (code:number)=>
	// 	{
	// 		// 回答一覧、再挑戦、修行、メニューに戻る

			
			
	// 		//------------------------------
	// 		// 回答一覧
	// 		if(code == Result.RTN_SC_KAITOU_ICHIRAN)
	// 		{
	// 			cc.log("回答一覧表示");
	// 			//回答一覧
	// 			let node:cc.Node = cc.instantiate(this.allKaitouPrefab);
	// 			let allKaitou:AllKaitou = node.getComponent(AllKaitou);
	// 			allKaitou.setup(this.canvas.node, this._qDatas, this._IMG_RES);
	// 			this.frontEffect.node.addChild(node);
	// 		}
	// 		//------------------------------
	// 		// ゴリベン：「再挑戦」、　ハヤベン：「ここから偉人に挑戦」ボタン
	// 		else if(code == Result.RTN_SC_IJIN_RETRY || code == Result.RTN_SC_GO_VS)
	// 		{
	// 			//ゴーストモードの場合は偉人がいないので表示する
	// 			if(StaticData.gameModeID == GameMode.GHOST)
	// 			{
	// 				alert("ここには来ないはず。おかしい");
	// 				/*
	// 				this._setIjinCenter(0);
	// 				this.ijinScreen.setIjinImage(StaticData.ijinData.ijinImageSpriteFrame);
	// 				this.ijinScreen.ijinSprite.enabled = true;

	// 				//画面上のステータスも表示する
	// 				*/
	// 			}
	// 			else if(StaticData.gameModeID == GameMode.HAYABEN)
	// 			{
	// 				//偉人登場
	// 				this.ijinScreen.setIjinImage(StaticData.ijinData.ijinImageSpriteFrame);
	// 				this._setIjinCenter(0);
	// 				this.ijinScreen.show();
	// 			}

	// 			//画面上のステータスの中央を非表示にする
	// 			//this._playerStatusBar.hideStatus();

	// 			//VS画面になる
	// 			this._showVsScreen();
	// 			//結果画面を消す
	// 			result.node.removeFromParent();

	// 		}
	// 		//----------------------------
	// 		// ゴリベン：「次の偉人」ボタン
	// 		else if(code == Result.RTN_SC_IJIN_NEXT)
	// 		{
	// 			this._warpToNextScene("introduction");
	// 		}
	// 		//-----------------------------
	// 		// もう一度修行をする
	// 		// else if(code == Result.RTN_SC_RE_TRAINING)
	// 		// {

	// 		// 	//ゴーストならゴースト登場
    //         //     ExAPI.ghostModeFlag((response:any)=>
    //         //     {
    //         //         //ゴーストモード
    //         //         let ghostModeFlag:Boolean = false;      //APIエラーでresponseがnullの場合、false固定
    //         //         if(response != null) ghostModeFlag = response.ghost_mode_flag;

	// 		// 		//通常の修行
    //         //         if(! ghostModeFlag)
    //         //         {
    //         //             StaticData.gameModeID = GameMode.HAYABEN;

	// 		// 			this._finishScreen.hideFinishTexts();
	// 		// 			this._finishScreen.finishShow(()=>
	// 		// 			{
	// 		// 				cc.director.loadScene("game");
	// 		// 			});
    //         //             return;
    //         //         }

    //         //         cc.log("ゴースト出現");

    //         //         //ゴースト出現演出とうんこ先生との会話
    //         //         let ghostScreenNode:cc.Node = cc.instantiate(this.ghostScreenPrefab);
    //         //         this.ghostScreenParentNode.addChild(ghostScreenNode);
    //         //         let ghostScreen:GhostScreen = ghostScreenNode.getComponent(GhostScreen);
    //         //         ghostScreen.setup(this.canvas, null, this._finishScreen.node, ()=>
    //         //         {
    //         //             StaticData.gameModeID = GameMode.GHOST;

	// 		// 			this._finishScreen.hideFinishTexts();
	// 		// 			this._finishScreen.finishShow(()=>
	// 		// 			{
	// 		// 				cc.director.loadScene("game");
	// 		// 			});
    //         //         });
    //         //     });
	// 		// }
	// 		//-----------------------------
	// 		// メニューに戻る
	// 		else if(code == Result.RTN_SC_MENU)
	// 		{
	// 			this._warpToNextScene("menu");
	// 		}
	// 		//-----------------------------
	// 		// ゲームの終了
	// 		// else if(code == Result.RTN_SC_END_GAME)
	// 		// {
	// 		// 	let node:cc.Node = cc.instantiate(this.gameEndScreenPrefab);
	// 		// 	let gameEndScreen:GameEndScreen = node.getComponent(GameEndScreen);
	// 		// 	gameEndScreen.setup(this.canvas);
	// 		// 	this.frontEffect.node.addChild(node);
	// 		// }
	// 		//-----------------------------
	// 		// ゴーストの結果を見終わった
	// 		else if(code == Result.RTN_GHOST_NEXT)
	// 		{
	// 			//これもう使ってない
	// 			this._finishScreen.finishShow(()=>
	// 			{
	// 				cc.director.loadScene("opening_B");
	// 			});
	// 		}
	// 	});

	// 	//表示演出完了時
	// 	result.onShowCompleteCallback(()=>
	// 	{
	// 		//設定ボタンだけ押せるように
	// 		this._playerStatusBar.settingButtonEnabled(true);
	// 	});




	// 	if(StaticData.gameModeID == GameMode.HAYABEN)
	// 	{
	// 		//フィニッシュスクリーンがはけてリザルト演出開始
	// 		finishScreen.endFinishAction(()=>
	// 		{
	// 			result.startAction();
	// 		});
	// 	}
	// 	else
	// 	{
	// 		//演出開始
	// 		result.startAction();
	// 	}

	// }


	// private _warpToNextScene(sceneName:string):void
	// {
	// 	this._showNextIjinWarp(()=>
	// 	{
	// 		//ロードアイコン表示
	// 		let loadIcon:SystemIcon = SystemIcon.create(this.sceneLoadIndicator);
	// 		loadIcon.setup(StaticData.TIME_LOAD_SCENE_ICON);
			
	// 		cc.director.preloadScene(sceneName, ()=>{}, (error:Error)=>
	// 		{
	// 			//ロード完了
	// 			loadIcon.remove();      //ロードアイコンを消す

	// 			cc.director.loadScene(sceneName);
	// 		});
	// 	});
	// }


	// private _showNextIjinWarp(callback:()=>void):void
	// {
	// 	let node:cc.Node = cc.instantiate(this.nextIjinWarpPrefab);
	// 	this.frontEffect.node.addChild(node);

	// 	let nextIjinWarp:NextIjinWarp = node.getComponent(NextIjinWarp);
	// 	nextIjinWarp.setup(()=>{ callback(); });
	// }


	// //再戦のためのVS画面表示
	// private _showVsScreen():void
	// {
	// 	//VS用BGMに変更
	// 	SE.bgmStart(GameSE.clip.vsBGM);

	// 	this._playerStatusBar.backButtonEnabled(false);
	// 	this._playerStatusBar.settingButtonEnabled(false);
	// 	this._playerStatusBar.hideSkipButton();
    //     this._playerStatusBar.showStatus();     //ステータスを表示


	// 	let vsScreenNode:cc.Node = cc.instantiate(this.vsScreenPrefab);
	// 	this.resultParentNode.addChild(vsScreenNode);

	// 	let vsScreen:VSScreen = vsScreenNode.getComponent(VSScreen);

	// 	//if(this.OFFLINE_TEST) this._vsScreen.offlineTest();

	// 	vsScreen.setCanvasAndCamera(this.canvas, null);
	// 	vsScreen.showVS(this.canvas.node, this.ijinScreen, this._finishScreen.node, (itemIDs:number[], code:string)=>
    //     {
    //         //挑戦か修行を選択
    //         if (code == "zishu") StaticData.gameModeID = GameMode.HAYABEN;
    //         else if (code == "start") StaticData.gameModeID = GameMode.GORIBEN;
	// 		else if (code == "ghost") StaticData.gameModeID = GameMode.GHOST;

    //         StaticData.useItemIDs = itemIDs;

    //         this._finishScreen.setupAtGameMode("start");
    //         this._finishScreen.finishShow(()=>
    //         {
    //             //ロードアイコン表示
	// 			let loadIcon:SystemIcon = SystemIcon.create(this.sceneLoadIndicator);
	// 			loadIcon.setup(StaticData.TIME_LOAD_SCENE_ICON);

	// 			cc.director.preloadScene("game", ()=>{}, (error:Error)=>
	// 			{
	// 				//ロード完了
	// 				loadIcon.remove();      //ロードアイコンを消す
	// 				cc.director.loadScene("game");
	// 			});
    //         });
    //     });

	// 	vsScreen.onShowComplete(()=>
    //     {
    //         this._playerStatusBar.backButtonEnabled(true);
	// 	    this._playerStatusBar.settingButtonEnabled(true);
    //     });

    //     vsScreen.onSelectVSMenu(()=>
    //     {
    //         this._playerStatusBar.backButtonEnabled(false);
	// 	    this._playerStatusBar.settingButtonEnabled(false);
    //     });
	// }



	//------------------------------------------------------------
	//
	// イントロシーンで取得することになったので不要になった。様子見て削除する
	//    ↓
	// 結局ここで取ることになったので必要。
	//
	//------------------------------------------------------------

	// /**
	//  * コレクションゲットのポップアップを順番に表示
	//  * @param completeCollback すべて表示した際にコールバックを返す
	//  */
	// private _showUnkoGetPopup(completeCollback:()=>void):void
	// {
	// 	let unkoGetNode:cc.Node = cc.instantiate(this.unkoGetPrefab);
	// 	let unkoGet:UnkoGet = unkoGetNode.getComponent(UnkoGet);
	// 	let collectionData:CollectionItem = this._endAPIResponse.collections;
	// 	//cc.log(collectionData);
	// 	unkoGet.setup(collectionData, ()=>
	// 	{
	// 		unkoGetNode.removeFromParent();
	// 		completeCollback();
	// 	});

	// 	this.frontEffect.node.addChild(unkoGetNode);
	// }




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
