import BitmapNum from "../common/BitmapNum";
import BugTracking from "../common/BugTracking";
import { ComboRanking, CPUData, OpponentCPU, PlayerData } from "../common/Models";
import PlayerStatusBar from "../common/PlayerStatusBar";
import PlayTrackLog from "../common/PlayTrackLog";
import SceneChanger from "../common/SceneChanger";
import SchoolAPI from "../common/SchoolAPI";
import SchoolText from "../common/SchoolText";
import SE from "../common/SE";
import STFormat from "../common/STFormat";
import SystemIcon from "../common/SystemIcon";
import TapEffect from "../common/TapEffect";
import StaticData, { GameMode, SpecialEvent } from "../StaticData";
import MenuPage from "./MenuPage";
import { MenuSE } from "./MenuSEComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuMain extends cc.Component {

	@property(cc.Canvas) canvas: cc.Canvas = null;
	@property(cc.Node) contentsNode: cc.Node = null;
	@property(cc.Node) dodaisNode: cc.Node = null;
	@property(cc.Node) bgNode: cc.Node = null;
	@property(cc.Button) topBtns: cc.Button[] = [];
	@property(cc.Button) startBtn: cc.Button = null;
	@property(cc.Button) nextBtn: cc.Button = null;
	@property(cc.Button) prevBtn: cc.Button = null;
	@property(cc.Button) mainBtn: cc.Button = null;
	@property(cc.Button) collectionBtn: cc.Button = null;
	@property(cc.Button) statusBtn: cc.Button = null;
	@property(cc.Button) gakushuBtn: cc.Button = null;
	@property(cc.Node) tapGuide: cc.Node = null;
	@property(cc.Node) freeRoboEyeLightL: cc.Node = null;
	@property(cc.Node) freeRoboEyeLightR: cc.Node = null;
	@property(cc.Node) freeRoboEyeLightFinish: cc.Node = null;
	@property(cc.Node) modeTitleNode: cc.Node = null;
	@property(cc.Sprite) modeTitleBoardSprite: cc.Sprite = null;
	@property(cc.Node) loadinbBar: cc.Node = null;
	@property(cc.Node) shadowNode: cc.Node = null;
	@property(cc.Sprite) goribenEyeSprite: cc.Sprite = null;
	@property(cc.Node) goribenBodyNode: cc.Node = null;
	@property(cc.Node) gachibenBodyNode: cc.Node = null;
	@property(cc.Node) gachibenKemuriNodes: cc.Node[] = [];
	@property(cc.Node) lockMark: cc.Node = null;
	@property(SchoolText) ijinNameOutput: SchoolText = null;
	@property(cc.Sprite) ijinIconSprite: cc.Sprite = null;
	@property(BitmapNum) comboDisp: BitmapNum = null;
	@property(cc.Label) modeDescriptionOutput: cc.Label = null;
	@property(cc.Node) menuPageParentNode: cc.Node = null;
	@property(cc.Node) menuPageCoverNode: cc.Node = null;
	@property(cc.Node) modalWindowNode: cc.Node = null;
	@property(cc.Node) statusBarParentNode: cc.Node = null;
	@property(cc.Button) modalWindowCoverButton: cc.Button = null;
	@property(cc.Button) btnDebugSokura: cc.Button = null;
	@property(cc.Prefab) playerStatusBarPrefab: cc.Prefab = null;
	@property(cc.Prefab) menuPageCollectionPrefab: cc.Prefab = null;
	@property(cc.Prefab) menuPageStatusPrefab: cc.Prefab = null;
	@property(cc.Prefab) menuPageGakushuPrefab: cc.Prefab = null;
	@property(cc.SpriteFrame) hayabenEyeSpriteFrames: cc.SpriteFrame[] = [];
	@property(cc.Prefab) comboRankingPrefab: cc.Prefab = null;
	@property(cc.Prefab) settingWindowPrefab: cc.Prefab = null;
	@property(cc.Prefab) sceneLoadIndicator: cc.Prefab = null;
	@property({type:cc.AudioClip}) bgmAudioClip: cc.AudioClip = null;		//BGM

	

	private _playerStatusBar:PlayerStatusBar = null;
	private _selectedBtn :cc.Button = null;
	private _selectedMode :number = -1;
	private _enterRoboSeID: number = -1;
	private _hayaEyeRad:number = 0;		//現在の角度
	private _hayaEyeAdd:number = 0;		//回転速度(秒速)
	private _hayaPrevEyeAngFrame:number = -1;
	private _hayaLoop:boolean = false;	//回転時ループする
	private _firstSeCut:boolean = true;		//開始直後のSEがうるさいのでカットする

	/** 表示中のメニューページ */
	private _menuPage:MenuPage = null;
	//ごり、はや、ゴースト、がち
	private _unlockContents: boolean[] = [ true, false, false, false ];

	private readonly _2_PI:number = 3.141592653589793 * 2;

	//ボタンの並び
	private readonly _ID_INDEX: number[] = [ GameMode.GACHIBEN, GameMode.GORIBEN ];
	
	//ごり、はや、ゴースト、がち
	private readonly _MODE_COLORS: cc.Color[] = [ cc.color(0,250,255), cc.color(0,255,64), cc.color(), cc.color(255,0,140) ];
	
	// 未開発のため完全にロックする
	private readonly GACHIBEN_LOCK:boolean = true;

	private readonly BGM_VOLUME:number = 0.8;
	private readonly BGM_SUBMENU_VOLUME:number = 0.4;


	/** オフラインテスト。APIを叩かず実行する単体テスト */
	private OFFLINE_TEST:boolean = false;


	/**
	 * シーン開始時
	 */
    start ()
    {
		PlayTrackLog.add("MenuMain.start()");
		
		//ひとまずゲームモードを「ごり勉」にする
		StaticData.gameModeID = GameMode.GORIBEN;

		//単体テスト
        if(! StaticData.playerData)
        {
            cc.log("単体テスト");
            this.OFFLINE_TEST = true;
			SchoolAPI.dummyDataMode();		//API使わずダミーの値を返すようにする

			SchoolAPI.titlePage((response:PlayerData)=>{ StaticData.playerData = response; });
			//StaticData.playerData = new PlayerData("A", false, 0, 100, 0, null, 1, 50, "Test", 1.0, false, "");
		}


		this._selectedMode = -1;

		this.dodaisNode.x = 400;
		this.loadinbBar.active = false;
		this.freeRoboEyeLightL.active = false;
		this.freeRoboEyeLightR.active = false;
		this.freeRoboEyeLightFinish.active = false;
		this.modeTitleNode.active = false;
		this.lockMark.active = false;
		this.ijinIconSprite.node.active = false;
		this.comboDisp.resetNum();
		this.comboDisp.node.parent.active = false;
		this.btnDebugSokura.node.active = StaticData.DEVELOP_MODE;		//ソクラテス戦ボタン


		this.tapGuide.runAction(
			cc.repeatForever(
				cc.jumpBy(1.0, cc.v2(0,0), 30, 1)
			)
		);

		this.tapGuide.active = false;

		//for (let i:number = 0; i < this.topBtns.length; i ++)
		//{
		//	this.topBtns[i].node.scale = 0.72;
		//}

		//デフォルトでごり勉を選択
		this._selectedMode = GameMode.GORIBEN;
		this._scrollRoboAndShowMenu(null);	//ゴリベンのロボまでスクロール
		this.onPressButtonMain(null);		//メインボタンを選択状態にする

		
		//ゴリベンの眼鏡がくるくる回る
		this.goribenBodyNode.runAction(
			cc.repeatForever(
				cc.sequence(
					cc.callFunc(()=>
					{
						this._hayaLoop = false;
						this._hayaEyeAdd = 4.5;
						/*
						//選択中なら音が出る
						if(this._selectedMode == GameMode.GORIBEN)
						{
							if(this._firstSeCut)
							{
								this._firstSeCut = false;
								return;
							}
							//顔が1周まわる音「シュル」
							SE.play(MenuSE.clip.roboGoriSub, false, 0.1);
						}
						*/
					}),
					cc.delayTime(2.5)
				)
			)
		);
		
		//ガチ勉が左右に縮んだり戻ったり
		this.gachibenBodyNode.scaleX = 0.8;
		this.gachibenBodyNode.runAction(
			cc.repeatForever(
				cc.sequence(
					cc.scaleTo(0.2, 1, 1).easing(cc.easeBackOut()),
					cc.scaleTo(0.1, 0.8, 1).easing(cc.easeInOut(2.0)),
					cc.scaleTo(0.2, 1, 1).easing(cc.easeBackOut()),
					cc.delayTime(0.6),
					cc.scaleTo(0.1, 0.8, 1).easing(cc.easeInOut(2.0))
				)
			)
		);

		for(let i:number = 0 ; i < this.gachibenKemuriNodes.length ; i ++)
		{
			this.gachibenKemuriNodes[i].runAction(
				cc.repeatForever(
					cc.sequence(
						cc.callFunc(()=>
						{
							//選択中なら音が出る
							if(this._selectedMode == GameMode.GACHIBEN && i == 0)
							{
								SE.play(MenuSE.clip.roboGachiSub, false, 0.15);
							}
						}),
						cc.scaleTo(0.0, 0.2),
						cc.fadeTo(0.0, 255),
						cc.spawn(
							cc.fadeTo(0.3, 0).easing(cc.easeIn(2.0)),
							cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
						),
						cc.delayTime(0.3)
					)
				)
			);
		}


		//対戦する偉人の情報取得
		if(! this.OFFLINE_TEST)
		{
			SchoolAPI.opponentCPUs((response:OpponentCPU)=>
			{
				if(response != null)
				{
					//連続コンボ数表示
					if(response.continual_combo != null)
					{
						try
						{
							let continualCombo:number = response.continual_combo;
							if(continualCombo < 10) this.comboDisp.strNum = "0" + continualCombo;
							else this.comboDisp.num = continualCombo;
						}
						catch(e)
						{
							BugTracking.notify("メニューの連続コンボ表示エラー", "MenuMain.start()",
							{
								msg:"メニューの連続コンボ表示エラー",
								continual_combo:response.continual_combo,
								error: e,
								comboDisp: this.comboDisp
							});
						}
					}
					
					//次の偉人
					StaticData.opponentCPUs = response;
					let ijin:CPUData = StaticData.ijinData;

					//cc.log(response);
					this.ijinNameOutput.createText(ijin.short_name, this._getNameTextFormatForLength(ijin.displayName.length));
					this.ijinNameOutput.flushText();

					//偉人のアイコンを出す
					SchoolAPI.loadImage("ijinIcon", ijin.icon_image_url, (responseB)=>
					{
						this.ijinIconSprite.spriteFrame = responseB.image;
						this.ijinIconSprite.node.active = true;

						StaticData.ijinData.iconSpriteFrame = responseB.image;
					});
				}
			});


			/*
			//試しにコンボランキング
			schoolAPI.continualComboRankings((response:ComboRanking[])=>
			{
				cc.log(response);
			});
			*/
		}
		else
		{
			//単体テスト
			let testName:string = "単体テスト男";
			this.ijinNameOutput.createText(testName, this._getNameTextFormatForLength(testName.length));
			this.ijinNameOutput.flushText();

			/*
			//試しにランキング-----------------
			let rankingNode:cc.Node = cc.instantiate(this.comboRankingPrefab);
			let ranking:ScoreRanking = rankingNode.getComponent(ScoreRanking);
			this.modalWindowNode.parent.addChild(rankingNode);
			
			
			let rankingList:ComboRanking[] = TestLocalData.getDummyScoreRanking(10, 20);
			ranking.setup(this.canvas, rankingList, 10);
			*/
		}



		//プレーヤーの情報表示
		let psNode:cc.Node = cc.instantiate(this.playerStatusBarPrefab);
		this.statusBarParentNode.addChild(psNode);

		let playerStatusBar:PlayerStatusBar = psNode.getComponent(PlayerStatusBar);
		playerStatusBar.setup(this.canvas.node);
		playerStatusBar.statusUpdate(StaticData.playerData);

		playerStatusBar.onBackButtonCallback(()=>
		{
			//戻るボタンと設定ボタンをロック
			this._playerStatusBar.backButtonEnabled(false);
			this._playerStatusBar.settingButtonEnabled(false);

			//BGM停止
			SE.bgmStop();
			SE.bgmSetVolume(1.0);

			//ロードアイコン表示
			let loadIcon:SystemIcon = SystemIcon.create(this.sceneLoadIndicator);
			loadIcon.setup(StaticData.TIME_LOAD_SCENE_ICON);

			cc.director.preloadScene("title", ()=>{}, (error:Error)=>
			{
				//ロード完了
				loadIcon.remove();      //ロードアイコンを消す

				let sceneChanger:SceneChanger = this.getComponent(SceneChanger);
				sceneChanger.sceneEnd(null, ()=>
				{
					cc.director.loadScene("title");
				});
			});
		});

		playerStatusBar.onSettingButtonCallback(()=>
		{
			playerStatusBar.createSettingWindow(this.contentsNode);
		});

		//設定ウィンドウで何か変更した
		playerStatusBar.onSettingWindowClose((change:boolean)=>
		{
			if(change)
			{
				SE.bgmStop();						//とりあえず止める
				SE.bgmRestart();					//ミュートなら再生されない
			}
		});

		this._playerStatusBar = playerStatusBar;



		//BGM再生開始
		SE.bgmSetVolume(this.BGM_VOLUME);		//やや音量を下げる
		SE.bgmStart(this.bgmAudioClip);


		/*
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (e:cc.Event.EventKeyboard)=>
		{
			if(e.keyCode == cc.macro.KEY.o)
			{
				this.showModalWindow();
			}
			else if(e.keyCode == cc.macro.KEY.p)
			{
				this.hideModelWindow();
			}
		});
		*/


		//フェードインが終わった
        let sceneChanger:SceneChanger = this.getComponent(SceneChanger);
        sceneChanger.sceneStart(()=>
        {
            
        });


    }



	/**
     * 文字数ごとのフォーマットを返す
     */
	private _getNameTextFormatForLength(nameLength:number):STFormat
	{
		let sizes:number[] = [60,60,60,60,60,50, 46, 40, 36];
		if(nameLength >= sizes.length) nameLength = sizes.length - 1;
		
		let format:STFormat = STFormat.create(
		{
			size: sizes[nameLength],
			margin: 2,
			lineHeight: 60,
			rows: 1,
			columns: 10,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
			verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
			color: cc.color(0,0,0),
			yomiganaSize: 20,
			yomiganaMarginY: 2
		});
		
		return format;
	}



	/**
	 * ボタンに対応したロボまでスクロールしメニュー表示
	 * @param locX 
	 * @param targetNode 
	 */
    private _scrollRoboAndShowMenu (event):void
    {
		//タップエフェクト
		if(event != null)
		{
			TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
		}
        
		this.tapGuide.active = false;
		this.lockMark.active = false;

		let index:number = this._ID_INDEX.indexOf(this._selectedMode);

		this.nextBtn.node.active = (index < this._ID_INDEX.length - 1);
		this.prevBtn.node.active = (index > 0);

		if(this.GACHIBEN_LOCK) this.prevBtn.node.active = false;

		if(this.prevBtn.node.active)
		{
			let leftMode:number = this._ID_INDEX[index - 1];
			
			//this.prevBtn.node.children[0].color = this._MODE_COLORS[leftMode];
			this.prevBtn.node.children[0].runAction(
				cc.tintTo(0.3, this._MODE_COLORS[leftMode].getR(), this._MODE_COLORS[leftMode].getG(), this._MODE_COLORS[leftMode].getB())
			);
		}

		if(this.nextBtn.node.active)
		{
			let rightMode:number = this._ID_INDEX[index + 1];
			//this.nextBtn.node.children[0].color = this._MODE_COLORS[rightMode];
			this.nextBtn.node.children[0].runAction(
				cc.tintTo(0.3, this._MODE_COLORS[rightMode].getR(), this._MODE_COLORS[rightMode].getG(), this._MODE_COLORS[rightMode].getB())
			);
		}

		
		//-------------------------
		// 選択中のボタンを解除
		//
		if (this._selectedBtn != null)
		{
			
			//this._selectedBtn.node.runAction(
			//	cc.scaleTo(0.2, 0.72).easing(cc.easeIn(2.0))
			//);

			this._selectedBtn.interactable = true;
			this._selectedBtn = null;
		}

		//選択したボタン
		this._selectedBtn = this.topBtns[index];

		cc.log(index);

		//-------------------------
		// 選択したボタンの演出
		//
		this._selectedBtn.interactable = false;

		//this._selectedBtn.node.runAction(
		//	cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
		//);

		//-------------------------
		// ロボがスクロールする演出
		//
		this.dodaisNode.stopAllActions();
		this.bgNode.stopAllActions();
		
		this.dodaisNode.runAction(
            cc.moveTo(0.5, (index - 0.5) * -800, this.dodaisNode.y).easing(cc.easeInOut(2.0))
        );

        this.bgNode.runAction(
            cc.moveTo(0.5, (index - 0.5) * -20, 0).easing(cc.easeInOut(2.0))
		);
		
		this.node.runAction(
			cc.sequence(
				cc.delayTime(0.35),
				cc.callFunc(()=>
				{
					//効果音：ロボがスライドする音
					//SE.play(MenuSE.clip.modeSelect);		//今はスライドするのは起動時のみなので消しておく

					
					//アンロックされてるか
					if(this._unlockContents[this._selectedMode])
					{
						//押してねマーク出す
						this.tapGuide.active = true;
					}
					else
					{
						this.lockMark.active = true;
					}
				})
			)
		);

		

		//タイトル表示(相手の名前)
		if(this._selectedMode == GameMode.GORIBEN)
		{
			this.modeTitleNode.scale = 0;
			this.modeTitleNode.active = true;

			this.comboDisp.node.parent.active = true;
			
			this.modeTitleNode.runAction(
				cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
			);

			this.modeDescriptionOutput.string = "偉人と対決して友だちになろう";
		}
		else if(this._selectedMode == GameMode.GACHIBEN)
		{
			this.modeTitleNode.active = false;
			this.comboDisp.node.parent.active = false;
			this.modeDescriptionOutput.string = "全国のみんなと対決しよう";
		}
    }


	
	

	/**
	 * 画面下の「メイン」ボタンを押した
	 * @param event 
	 */
	private onPressButtonMain (event):void
	{
		if(this._menuPage) this._closeMenuPage();
		this._resetBottomButtons();
		this.mainBtn.interactable = false;
		if(TapEffect.instance()) TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
	}

	
	
	/**
	 * 画面下の「コレクション」ボタンを押した
	 * @param event 
	 */
	private onPressButtonCollection (event):void
    {
		this._openMenuPage(this.menuPageCollectionPrefab);
		this._resetBottomButtons();
		this.collectionBtn.interactable = false;
		TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
	}



	/**
	 * 画面下の「ステータス」ボタンを押した
	 * @param event 
	 */
	private onPressButtonStatus(event):void
	{
		this._openMenuPage(this.menuPageStatusPrefab);
		this._resetBottomButtons();
		this.statusBtn.interactable = false;
		TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
	}

	
	
	/**
	 * 画面下の「学習」ボタンを押した
	 * @param event 
	 */
	private onPressButtonGakushu(event):void
	{
		this._openMenuPage(this.menuPageGakushuPrefab);
		this._resetBottomButtons();
		this.gakushuBtn.interactable = false;
		TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
	}



	private _resetBottomButtons()
	{
		this.mainBtn.interactable = true;
		this.collectionBtn.interactable = true;
		this.statusBtn.interactable = true;
		this.gakushuBtn.interactable = true;
	}





	/**
	 * 画面下のコンテンツを表示
	 * @param prefab 
	 * @returns 
	 */
	private _openMenuPage(prefab:cc.Prefab)
	{
		//戻るボタンと設定ボタンをロック
		this._playerStatusBar.backButtonEnabled(false);
		this._playerStatusBar.settingButtonEnabled(false);
		
		let openMotion:boolean = (this._menuPage == null);

		if(! openMotion)
		{
			this._menuPage.node.stopAllActions();
			this._menuPage.node.removeFromParent(true);
		}
		
		let node:cc.Node = cc.instantiate(prefab);
		let menuPage:MenuPage = node.getComponent(MenuPage);
		this._menuPage = menuPage;

		this._menuPage.setupProtectedParams(this, this.canvas);
		this.menuPageParentNode.addChild(node);

		//ページ表示音
		SE.play(MenuSE.clip.menuPageOpen);

		//BGMの音量を下げる
		SE.bgmSetVolume(this.BGM_SUBMENU_VOLUME);

		//下からの登場演出無し
		if(! openMotion)
		{
			//跳ねる
			node.y -= 50;
			node.runAction(
				cc.sequence(
					cc.moveTo(0.3, 0, 0).easing(cc.easeBackOut()),
					cc.callFunc(()=>{ menuPage.onShowComplete(); })
				)
			);
			return;
		}
		
		// 登場演出
		node.y = -600;
		node.runAction(
			cc.sequence(
				cc.moveTo(0.4, 0, 0).easing(cc.easeBackOut()),
				cc.callFunc(()=>{ menuPage.onShowComplete(); })
			)
		);

		cc.Tween.stopAllByTarget(this.menuPageCoverNode);
		this.menuPageCoverNode.opacity = 1;		//0にするとタップ判定なども無効になるので1にする
		this.menuPageCoverNode.active = true;
		cc.tween(this.menuPageCoverNode)
		.to(0.2, { opacity:176 })
		.start();
		
	}


	private onPressMenuPageCloseCover(event):void
	{
		TapEffect.instance().setParticle(event.getTouches()[0].getLocation());

		if(this._menuPage) this._closeMenuPage();
		this._resetBottomButtons();
		this.mainBtn.interactable = false;
	}

	
	private onPressToParticle(event:any):void
	{
		TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
	}
	


	private _closeMenuPage()
	{
		this._menuPage.onClose();
		this._menuPage.node.stopAllActions();
		this._menuPage.node.runAction(
			cc.sequence(
				cc.moveTo(0.4, 0, -600).easing(cc.easeBackIn()),
				cc.callFunc(()=>{
					this._menuPage.node.removeFromParent(true);
					this._menuPage = null;

					//戻るボタンと設定ボタンをロック
					this._playerStatusBar.backButtonEnabled(true);
					this._playerStatusBar.settingButtonEnabled(true);
				})
			)
		);

		cc.Tween.stopAllByTarget(this.menuPageCoverNode);
		cc.tween(this.menuPageCoverNode)
		.to(0.4, { opacity:0 })
		.call(()=>{ this.menuPageCoverNode.active = false; })
		.start();

		//ページ閉じる音
		SE.play(MenuSE.clip.menuPageClose);

		//BGMの音量を戻す
		SE.bgmSetVolume(this.BGM_VOLUME);
	}


	/**
	 * モーダルウィンドウの表示、うんこ選択で偉人表示など
	 * @returns 
	 */
	public showModalWindow():cc.Node
	{
		cc.Tween.stopAllByTarget(this.modalWindowCoverButton.node);

		this.modalWindowNode.active = true;
		this.modalWindowCoverButton.node.opacity = 0;
		this.modalWindowCoverButton.enabled = true;
		
		cc.tween(this.modalWindowCoverButton.node)
		.to(0.2, { opacity:180 })
		.start();
		
		return this.modalWindowNode;
	}

	public hideModelWindow():void
	{
		cc.Tween.stopAllByTarget(this.modalWindowCoverButton.node);

		this.modalWindowCoverButton.enabled = false;
		
		cc.tween(this.modalWindowCoverButton.node)
		.to(0.2, { opacity:0 })
		.call(()=>
		{
			this.modalWindowNode.active = false;
		})
		.start();
	}
	

	


	/**
	 * ゲーム開始ボタンを押した(ロボを直接タップした)
	 * @param event 
	 */
	private onPressButtonGameStart (event):void
	{
		if(! this._unlockContents[this._selectedMode]) return;

		this.startBtn.node.active = false;

		//戻るボタンと設定ボタンをロック
		this._playerStatusBar.backButtonEnabled(false);
		this._playerStatusBar.settingButtonEnabled(false);
		
		
		//BGM止める
		SE.bgmStop();
		SE.bgmSetVolume(1.0);

		//タップエフェクト
        TapEffect.instance().setParticle(event.getTouches()[0].getLocation());

		if(this._selectedMode == GameMode.GORIBEN)
		{
			StaticData.gameModeID = GameMode.GORIBEN;

			//今テストで確認テストにしてみる
			//StaticData.gameModeID = GameMode.KAKUNIN_TEST;
			//StaticData.specialEvent = SpecialEvent.KAKUNIN_START;

			//ゴリベンの音・高速回転音(目からレーザー音は含まない)
			SE.play(MenuSE.clip.roboGori, false, 0.3);


			//高速回転を始める
			this.goribenBodyNode.stopAllActions();
			this._hayaEyeAdd = 4.5;
			this._hayaLoop = true;
			//徐々に高速化
			this.goribenBodyNode.runAction(
				cc.valueTo(1.0, 4.5, 32, (value:number)=>
				{
					this._hayaEyeAdd = value;
				})
			);
		}
		

		this.tapGuide.active = false;
		this.nextBtn.node.active = false;
		this.prevBtn.node.active = false;
		this.comboDisp.node.parent.active = false;

		//見た目はそのままで押せなくする
		this.mainBtn.enabled = false;
		this.collectionBtn.enabled = false;
		this.gakushuBtn.enabled = false;
		this.statusBtn.enabled = false;


		this.modeTitleNode.runAction(
			cc.sequence(
				cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
				cc.removeSelf()
			)
		);
		
		for (let i:number = 0; i < this.topBtns.length; i++)
		{
			if (this.topBtns[i].interactable) this.topBtns[i].node.active = false;
		}

		this.loadinbBar.active = true;
		this.loadinbBar.scaleX = 0;

		//ゲームシーンの読み込み開始、完了したらシーン移動

		//ロードアイコン表示
		let loadIcon:SystemIcon = SystemIcon.create(this.sceneLoadIndicator);
		loadIcon.setup(StaticData.TIME_LOAD_SCENE_ICON);


		cc.director.preloadScene(this._getNextSceneName(),
			//onProgress
			(completedCount:number, totalCount:number, item:any) => {
				let per = completedCount / totalCount;

				this.loadinbBar.stopAllActions();
				this.loadinbBar.runAction(
					cc.scaleTo(0.2, per, 1).easing(cc.easeOut(1.0))
				);
			},
			//onCompleted
			(error:Error) => {
				if(error) cc.log(error);

				loadIcon.remove();		//ロードアイコンを消す

				this.loadinbBar.stopAllActions();
				this.loadinbBar.active = false;

				this._unkoModeChangeAction();
			}
		);
	}


	private _getNextSceneName():string
	{
		if (StaticData.gameModeID == GameMode.KAKUNIN_TEST) return 'opening_B';
		else return 'introduction';
	}



	/**
	 * 画面下の「コレクション」「ステータス」「学習」ボタンを押した
	 * @param sceneName 移動するシーン名
	 * @param target 対象のボタン 
	 */
	private _onPressSubContentsButtons(sceneName:string, target:cc.Button, event:any):void
	{
		alert("多分使ってない!!");
		
		/*
		//効果音：サブボタン音
		SE.play(MenuSE.clip.menuBtnPress);

		
		//タップエフェクト
        TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
		
		this.tapGuide.active = false;
		this.modeTitleNode.active = false;

		target.node.active = true;
		target.interactable = false;

		for (let i:number = 0; i < this.topBtns.length; i++)
		{
			this.topBtns[i].node.active = false;
		}

		//ローディングバー
		this.loadinbBar.scaleX = 0;
		this.loadinbBar.active = true;

		//シーンの読み込み開始
		cc.director.preloadScene(sceneName,
			//onProgress
			(completedCount:number, totalCount:number, item:any) => {
				let per = completedCount / totalCount;

				this.loadinbBar.stopAllActions();
				this.loadinbBar.runAction(
					cc.scaleTo(0.2, per, 1).easing(cc.easeOut(1.0))
				);
			},
			//onCompleted
			(error:Error) => {
				cc.log(error);

				//BGM止める
				SE.bgmStop();
				SE.bgmSetVolume(1.0);

				cc.director.loadScene(sceneName);
			}
		);
		*/
	}


	/**
	 * 右に進ボタンを押した
	 * @param event 
	 */
	private onPressBtnNext(event):void
	{
		//効果音：サブボタン音
		SE.play(MenuSE.clip.menuBtnPress);

		this._changePage(1, event);
	}


	/**
	 * 左に進ボタンを押した
	 * @param event 
	 */
	private onPressBtnPrev(event):void
	{
		//効果音：サブボタン音
		SE.play(MenuSE.clip.menuBtnPress);

		this._changePage(-1, event);
	}


	private _changePage(addNum:number, event:any)
	{
		let index:number = this._ID_INDEX.indexOf(this._selectedMode);
		this._selectedMode = this._ID_INDEX[index + addNum];
		this._scrollRoboAndShowMenu(event);
	}




	private _unkoModeChangeAction():void
	{
		//効果音止める
		SE.stop(this._enterRoboSeID);
		this._enterRoboSeID = -1;

		//ワープ音
		SE.play(MenuSE.clip.warpToGame, false, 0.5);

		
		//目から光が出る
		if(this._selectedMode == GameMode.GORIBEN)
		{
			this._hayaLoop = false;

			cc.tween({})
			.delay(0.35)
			.call(()=>
			{
				if(this.freeRoboEyeLightL == null || this.freeRoboEyeLightR == null || this.freeRoboEyeLightFinish == null)
				{
					BugTracking.notify("光る目がnullエラー", "MenuMain._unkoModeChangeAction()",
					{
						msg:"光る目がnullエラー",
						freeRoboEyeLightL:this.freeRoboEyeLightL,
						freeRoboEyeLightR:this.freeRoboEyeLightR,
						freeRoboEyeLightFinish:this.freeRoboEyeLightFinish
					});

					cc.director.loadScene('introduction');
					return;
				}
				
				this.freeRoboEyeLightL.active = true;
				this.freeRoboEyeLightR.active = true;
				
				this.freeRoboEyeLightL.runAction(
					cc.scaleTo(0.5, 8.5).easing(cc.easeIn(4.0))
				);
				this.freeRoboEyeLightR.runAction(
					cc.sequence(
						cc.scaleTo(0.5, 8.5).easing(cc.easeIn(4.0)),
						cc.callFunc(() =>
						{
							this.freeRoboEyeLightFinish.active = true;
							cc.director.loadScene(this._getNextSceneName());
						})
					)
				);
			})
			.start();
			
		}
		else if(this._selectedMode == GameMode.GACHIBEN)
		{
			cc.director.loadScene('introduction');
		}
	}



	private onPressSokuraButton(event:any):void
	{
		event.target.active = false;
		StaticData.vsSokuratesu = true;
	}



	update (dt:number):void
	{
		if(this._hayaEyeAdd == 0) return;

		this._hayaEyeRad += this._hayaEyeAdd * dt;

		//1周した
		if(this._hayaEyeRad > this._2_PI)
		{
			this._hayaEyeRad -= this._2_PI;

			//ループせずに止まる
			if(! this._hayaLoop)
			{
				this._hayaEyeRad = 0;
				this._hayaEyeAdd = 0;
			}
		}

		this.goribenEyeSprite.node.x = Math.sin(this._hayaEyeRad) * 220;

		//絵が変わる角度の間隔
		let fRad:number = this._2_PI / 34;

		let frame:number = Math.floor((this._hayaEyeRad + fRad * 0.5) / fRad);
		//cc.log(frame);

		let imgNums:number[] = [0,1,2,3,4,5,6,7,8,8,7,6,5,4,3,2,1,0,1,2,3,4,5,6,7,8,8,7,6,5,4,3,2,1,0];
		this.goribenEyeSprite.spriteFrame = this.hayabenEyeSpriteFrames[imgNums[frame]];
		this.goribenEyeSprite.node.scaleX = (this.goribenEyeSprite.node.x >= 0) ? 1 : -1;

		if(this._hayaPrevEyeAngFrame <= 8 && frame >= 9)
		{
			//裏側へ
			let node:cc.Node = this.goribenBodyNode.parent;
			this.goribenBodyNode.removeFromParent(false);
			node.addChild(this.goribenBodyNode, 1);		//メガネ裏側へ
		}
		else if(this._hayaPrevEyeAngFrame <= 25 && frame >= 26)
		{
			//表側へ
			let node:cc.Node = this.goribenBodyNode.parent;
			this.goribenBodyNode.removeFromParent(false);
			node.addChild(this.goribenBodyNode, -1);		//メガネ表側へ
		}
		this._hayaPrevEyeAngFrame = frame;
	}
}
