import QuestionData from "./QuestionData";
import GameMain from "./GameMain";
import StaticData from "../StaticData";
import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";
import TapEffect from "../common/TapEffect";
import SE from "../common/SE";
import { GameSE } from "./GameSEComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class KaisetsuWindow extends cc.Component {

	@property(cc.Node) kaisetsuWindowNode: cc.Node = null;
	@property(cc.Node) outputAreaNode: cc.Node = null;
	@property(SchoolText) kaisetsuOutput: SchoolText = null;
	@property(cc.Sprite) kaisetsuImg: cc.Sprite = null;
	@property(cc.Button) btnOK: cc.Button = null;
	@property(cc.SpriteFrame) underlineSpriteFrame: cc.SpriteFrame = null;
	@property(cc.Node) kaisetsuHeader:cc.Node = null;
    
    //コケる先生演出
    @property(cc.Node) kaisetsuKokeSenseiNode: cc.Node = null;
	@property(cc.Node) kaisetsuKokeKemuriNode: cc.Node = null;
	
	//解説中、ふんふん頷く先生
	@property(cc.Node) hunhunSenseiA: cc.Node = null;
	@property(cc.Node) hunhunSenseiA_head: cc.Node = null;
	@property(cc.Node) hunhunSenseiB: cc.Node = null;
	@property(cc.Node) hunhunSenseiC: cc.Node = null;
    
    private _gameMain:GameMain = null;
	private _closeCallback:()=>void = null;
	private _debugImgAreaNode:cc.Node = null;
	
	/** 解説テキストと画像間のマージン */
	private static readonly MARGIN_TEXT_TO_IMAGE:number = 40;
	/** 画像描画エリアを色付け */
	private static readonly DEBUG_IMAGE_RECT:boolean = false;
	
	

    /**
     * 初期化
     * @param gameMain 
     * @param sound 
     */
    public setup(gameMain:GameMain, canvas:cc.Canvas):void
    {
        this._gameMain = gameMain;
		this.kaisetsuOutput.setUnderlineSpriteFrame(this.underlineSpriteFrame);
		
		if (KaisetsuWindow.DEBUG_IMAGE_RECT)
		{
			let node:cc.Node = new cc.Node();
			let sprite:cc.Sprite = node.addComponent(cc.Sprite);
			sprite.spriteFrame = this.underlineSpriteFrame;

			node.color = cc.Color.BLUE;
			node.opacity = 64;
			this.kaisetsuImg.node.addChild(node);

			this._debugImgAreaNode = node;
		}

		//動的につけてみた
		let widget:cc.Widget = this.kaisetsuHeader.addComponent(cc.Widget);
		widget.target = canvas.node;
		widget.alignMode = cc.Widget.AlignMode.ALWAYS;
		widget.isAlignTop = true;
		widget.top = 0;
    }


    /**
     * 解説を表示
     * @param questionData 
     * @param callback 解説を閉じた時に呼ばれるコールバック
     */
    public showKaisetsu(questionData:QuestionData, callback:()=>void):void
    {
        this._closeCallback = callback;
        
		this.kaisetsuWindowNode.active = true;
		this.btnOK.node.active = false;

		//解説文がない場合空白に
		if(questionData.explain_long == null) questionData.explain_long = "";
		
		
		//this.kaisetsuOutput.string = questionData.explain_long;


		//画像なしの場合、行間を開けて8行まで表示できるようにする
		let notHaveImage:boolean = (questionData.explain_image == "" || questionData.explain_image == null);

		let format:{} =
		{
			size: 40,
			margin: 1,		//(20201113) 0->1
			lineHeight: (notHaveImage) ? 86 : 66,
			rows: (notHaveImage) ? 8 : 4,
			columns: 16,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_TOP,
			color: cc.color(0, 0, 0),
			yomiganaSize : 20,
			yomiganaMarginY : 2
		};
		
		this.kaisetsuOutput.createText(questionData.explain_long, STFormat.create(format));
		this.kaisetsuOutput.hideText();


		this.kaisetsuKokeSenseiNode.active = true;
		this.kaisetsuKokeKemuriNode.active = true;

		//画像がないレイアウト
		//if(questionData.explain_image == "" || questionData.explain_image == null)
		if(notHaveImage)
		{
			this.kaisetsuImg.node.active = false;

			//表示エリアの中央に配置
			this.kaisetsuOutput.node.y = (this.outputAreaNode.height - this.kaisetsuOutput.getContentsHeight()) / -2;
		}
		//画像のあるレイアウト
		else
		{
			this.kaisetsuImg.node.active = true;

			//画像が無い場合エラー画像を出す
			let explain_image:cc.SpriteFrame = this._gameMain.getIMG_RES()[questionData.explain_image];
			if(explain_image == undefined) explain_image = this._gameMain.imgLoadErrorSpriteFrame;

			let size:cc.Size = explain_image.getOriginalSize();
			this.kaisetsuImg.spriteFrame = explain_image;

			//画像が横幅をオーバーしたら縮小(1106)
			let imgScale:number = 1.0;
			if(size.width > 640)
			{
				imgScale = 640 / size.width;
			}

			this.kaisetsuImg.node.width = size.width * imgScale;
			this.kaisetsuImg.node.height = size.height * imgScale;

			
			




			if (KaisetsuWindow.DEBUG_IMAGE_RECT)
			{
				this._debugImgAreaNode.width = size.width;
				this._debugImgAreaNode.height = size.height;
			}




			//解説内容のトータルの高さ
			let totalHeight:number = this.kaisetsuOutput.getContentsHeight() + KaisetsuWindow.MARGIN_TEXT_TO_IMAGE + this.kaisetsuImg.node.height;

			//表示サイズが表示エリアをオーバーしたので画像を縮小
			if(totalHeight > this.outputAreaNode.height)
			{
				this.kaisetsuImg.node.scale = (this.outputAreaNode.height - (this.kaisetsuOutput.getContentsHeight() + KaisetsuWindow.MARGIN_TEXT_TO_IMAGE)) / this.kaisetsuImg.node.height;
				totalHeight = this.outputAreaNode.height;		//表示エリアにフィットするようにリサイズしたので変更
			}
			else
			{
				this.kaisetsuImg.node.scale = 1.0;
			}

			this.kaisetsuOutput.node.y = (this.outputAreaNode.height - totalHeight) / -2;

			//解説画像を解説文のすぐ下に配置
			this.kaisetsuImg.node.y = this.kaisetsuOutput.node.y - this.kaisetsuOutput.getContentsHeight() - KaisetsuWindow.MARGIN_TEXT_TO_IMAGE - this.kaisetsuImg.node.height / 2 * this.kaisetsuImg.node.scale;

		}
		
		//コケる先生
		this.kaisetsuKokeSenseiNode.x = 606;
		this.kaisetsuKokeKemuriNode.scale = 1.0;
		this.kaisetsuWindowNode.opacity = 0;

		//ふんふん先生
		this.hunhunSenseiA.active = true;
		this.hunhunSenseiB.active = false;
		this.hunhunSenseiC.active = false;


		//----------------------

		let duration:number = 0.6;//1.6

		this.kaisetsuKokeSenseiNode.runAction(
			cc.moveTo(duration, -850, this.kaisetsuKokeSenseiNode.y)
		);
		
		this.kaisetsuKokeKemuriNode.runAction(
			cc.sequence(
				cc.delayTime(duration / 2),
				cc.scaleTo(duration / 2, 1.4)
			)
		);

		this.kaisetsuWindowNode.runAction(
			cc.sequence(
				cc.delayTime(duration * 0.7),
				cc.fadeTo(0.1, 255/5),		//下のカーニングのため。ほぼ透明状態ではフォントの幅が取れないようなので、少し表示させる
				cc.callFunc(()=>
				{
					// BGMの音量を調整(0.3)
					if (! StaticData.debugBgmMute)
					{
						SE.bgmSetVolume(0.3);
					}

					//解説文の表示開始　（この手前で透過を少し不透過にしてあればカーニングされる。）
					this.kaisetsuOutput.showText(()=>
					{
						this.btnOK.node.active = true;
					});
					
					//ふんふん先生
					this._startHunHunSensei();
				}),
				cc.fadeTo(0.4, 255)
			)
		);
	}

	

	private _startHunHunSensei():void
	{
		this.node.runAction(
			cc.sequence(
				cc.delayTime(0.5),
				cc.callFunc(()=>
				{
					this.hunhunSenseiA_head.runAction(
						cc.repeat(
							cc.sequence(
								cc.callFunc(()=>
								{
									SE.play(GameSE.clip.kaisetsuSenseiUnazuki);
								}),
								cc.rotateTo(0.05, 8),
								cc.rotateTo(0.05, 0),
								cc.delayTime(0.1),
								cc.rotateTo(0.05, 8),
								cc.rotateTo(0.05, 0),
								cc.delayTime(0.4)
							),2
						)
					);
				}),
				cc.delayTime(1.5),
				cc.callFunc(()=>
				{
					SE.play(GameSE.clip.kaisetsuSenseiBikkuri);
					
					this.hunhunSenseiA_head.stopAllActions();
					this.hunhunSenseiA_head.angle = 0;
					this.hunhunSenseiA.active = false;

					this.hunhunSenseiB.active = true;
					this.hunhunSenseiB.scaleY = 1.1;
					this.hunhunSenseiB.runAction(
						cc.scaleTo(0.3, 1.0, 1.0).easing(cc.easeBackInOut())
					);
				}),
				cc.delayTime(0.7),
				cc.callFunc(()=>
				{
					this.hunhunSenseiB.active = false;
					this.hunhunSenseiC.active = true;
				})
			)
		);
	}



    /**
	 * 解説OKボタンを押した
	 * @param event 
	 */
	private onPressKaisetsuOKButton (event):void
	{
		this.btnOK.node.active = false;
		
		//SE ボタン音
		SE.play(GameSE.clip.kaisetsuBtnNattoku);

		//タップエフェクト
        TapEffect.instance().setParticle(event.getTouches()[0].getLocation());

		//ふんふん先生を止める
		this.hunhunSenseiA_head.stopAllActions();
		this.hunhunSenseiB.stopAllActions();
		this.node.stopAllActions();
		

		this.kaisetsuKokeSenseiNode.active = false;
		this.kaisetsuKokeKemuriNode.active = false;

		this.kaisetsuWindowNode.runAction(
			cc.sequence(
				cc.fadeTo(0.2, 0),
				cc.callFunc(()=>
				{
					// BGMの音量を調整(1.0)
					if (! StaticData.debugBgmMute)
					{
						SE.bgmSetVolume(1.0);
					}
					
					this.kaisetsuOutput.resetText();
                    this.kaisetsuWindowNode.active = false;
                    
                    //コールバック
                    this._closeCallback();
				})
			)
		);
	}


}
