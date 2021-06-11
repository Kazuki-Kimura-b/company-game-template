import AC from "../answerComponents/AC";
import SchoolAPI from "../common/SchoolAPI";
import VSScreen from "./VSScreen";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FrontEffect extends cc.Component {

    @property(cc.Sprite) countdownSprite: cc.Sprite = null;
    @property(cc.SpriteFrame) countdownSpriteFrames: cc.SpriteFrame[] = [];
    @property(cc.Sprite) marubatsuSprite: cc.Sprite = null;
	@property(cc.SpriteFrame) maruSpriteFrame: cc.SpriteFrame = null;
	@property(cc.SpriteFrame) batsuSpriteFrame: cc.SpriteFrame = null;
	@property(cc.SpriteFrame) timeUpSpriteFrame: cc.SpriteFrame = null;
    @property(cc.Node) badBgNode: cc.Node = null;
    @property(cc.Node) loadingBar: cc.Node = null;
    @property(cc.Node) loadingNode: cc.Node = null;
    @property(cc.Node) loadingUnkoIcon: cc.Node = null;
    @property(cc.Node) backCoverNode: cc.Node = null;
    @property(cc.Prefab) VSScreenPrefab: cc.Prefab = null;

    private _vsScreen:VSScreen = null;
    private _vsScreenStatus:number = 0;
    private _vsSelectedItemIDs:number[] = [];

    private static readonly VSSCREEN_STATUS_IN:number = 0;
    private static readonly VSSCREEN_STATUS_WAIT:number = 1;
    private static readonly VSSCREEN_STATUS_OUT:number = 2;


    /**
     * 初期化
     */
    public setup():void
    {
        this.marubatsuSprite.node.active = false;
        this.badBgNode.active = false;
        this.countdownSprite.node.active = false;
        this.loadingBar.active = false;
        this.backCoverNode.active = false;
        //this.loadingNode.active = false;

        this.loadingNode.active = true;

        this.loadingUnkoIcon.runAction(
            cc.repeatForever(
                cc.rotateBy(1.5, -360)
            )
        );
    }


    /**
     * ロードゲージをリセット
     */
    public initialize():void
    {
        this.loadingBar.scaleX = 0;
    }



    /**
     * ロード中ゲージを表示
     * @param percentage パーセンテージ
     */
    public showLoadingBar(percentage: number)
    {
        this.loadingBar.active = true;
        
        
        this.loadingBar.stopAllActions();
        this.loadingBar.runAction(
            cc.scaleTo(0.2, percentage, this.loadingBar.scaleY).easing(cc.easeOut(2.0))
        );

        //this.loadingBar.scaleX = percentage;
    }


    /**
     * ロード中ゲージを最大まで貯めてから消える
     */
    public showLoadingMaxAndHide():void
    {
        this.loadingBar.stopAllActions();
        this.loadingBar.runAction(
            cc.sequence(
                cc.scaleTo(0.2, 1.0, this.loadingBar.scaleY).easing(cc.easeOut(2.0)),
                cc.delayTime(0.1),
                cc.callFunc(()=>{ this.hideLoadingBar(); })
            )
        );
    }


    /**
     * ロード中ゲージを非表示
     */
    public hideLoadingBar()
    {
        this.loadingBar.stopAllActions();
        this.loadingBar.active = false;

        this.loadingUnkoIcon.stopAllActions();
        this.loadingNode.active = false;
    }


    /**
     * カウントダウンを開始
     * @param count2Callback カウント２表示時 
     * @param completeCallback 終了時
     */
    public countdown(count2Callback:()=>void, completeCallback:()=>void):void
    {
        let __dispCountDown = function(sprite:cc.Sprite, spriteFrame:cc.SpriteFrame, duration:number)
		{
			sprite.spriteFrame = spriteFrame;
			sprite.node.opacity = 0;
			sprite.node.scale = 0.4;
			sprite.node.runAction(
				cc.sequence(
					cc.spawn(
						cc.fadeTo(duration * 0.2, 255),
						cc.scaleTo(duration * 0.2, 1.0).easing(cc.easeBackOut())
					),
                    cc.delayTime(duration * 0.6),
                    cc.scaleTo(0.0, 0.0),
					cc.delayTime(duration * 0.2)
				)
			);
		};
        
        
        //カウントダウンをする
        this.countdownSprite.node.active = true;
        __dispCountDown(this.countdownSprite, this.countdownSpriteFrames[0], 1.0);

        this.node.runAction(
            cc.sequence(
                cc.delayTime(1.0),
                cc.callFunc(()=>
                {
                    __dispCountDown(this.countdownSprite, this.countdownSpriteFrames[1], 1.0);
            
                    //カウント２コールバック
                    count2Callback();
                }),
                cc.delayTime(1.0),
                cc.callFunc(()=>{ __dispCountDown(this.countdownSprite, this.countdownSpriteFrames[2], 1.0); }),
                cc.delayTime(1.0),
                cc.callFunc(()=>{ __dispCountDown(this.countdownSprite, this.countdownSpriteFrames[3], 0.5); }),
                cc.delayTime(0.5),
                cc.callFunc(()=>
                {
                    // カウントダウン終了

                    this.countdownSprite.node.active = false;

                    //終了コールバック
                    completeCallback();
                }),
            )
        );
    }



    /**
     * 結果を表示（正解、不正解、タイムアップ）
     * @param answerCode 
     */
    public showResult(answerCode:number):void
    {
        let rightAnswer:boolean = (answerCode == AC.ANSWER_CODE_RIGHT);
        
        //正解、間違いの処理
		let spriteFrames:cc.SpriteFrame[] = [this.batsuSpriteFrame, this.maruSpriteFrame, this.timeUpSpriteFrame];

		this.marubatsuSprite.spriteFrame = spriteFrames[answerCode];
		this.marubatsuSprite.node.active = true;
		this.marubatsuSprite.node.scale = 0.5;
		this.marubatsuSprite.node.runAction(
            cc.sequence(
                cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
                cc.scaleTo(0.2, 0.7).easing(cc.easeInOut(2.0)),
                cc.delayTime(0.2),
                cc.callFunc(()=>
                {
                    this.marubatsuSprite.node.active = false;
                })
            )
		);

		//間違いエフェクト
		if(! rightAnswer)
		{
			this.badBgNode.active = true;
			this.badBgNode.runAction(
				cc.sequence(
					cc.moveTo(0.25, 0, 20).easing(cc.easeInOut(2.0)),
					cc.moveTo(0.25, 0, 0).easing(cc.easeInOut(2.0)),
					cc.moveTo(0.25, 0, 20).easing(cc.easeInOut(2.0)),
					cc.moveTo(0.25, 0, 0).easing(cc.easeInOut(2.0)),
					cc.callFunc(()=>
					{
						this.badBgNode.active = false;
					})
				)
			);
		}
    }



    /**
     * 回答結果を消す
     */
    public resetResult():void
    {
        this.marubatsuSprite.node.active = false;
    }



    /**
     * 単色カバーを表示
     * @param color 
     */
    public showBackCover(color:cc.Color):void
    {
        this.backCoverNode.color = color;
        this.backCoverNode.active = true;
    }


    /**
     * 単色カバーを非表示
     */
    public hideBackCover():void
    {
        this.backCoverNode.active = false;
    }



    public setLoadingBarPositionY(Y:number):void
    {
        //ローディングバーの位置を変更(-84)
        this.loadingNode.y = Y;
    }


}
