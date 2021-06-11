const {ccclass, property} = cc._decorator;

@ccclass
export default class TimeBoard extends cc.Component {

	@property(cc.Label) output: cc.Label = null;
	@property(cc.Node) halfNode: cc.Node = null;
	@property(cc.Node) halfCoverNode: cc.Node = null;
	@property(cc.Node) barParentNode: cc.Node = null;
	@property(cc.Node) aroundItemsNode: cc.Node = null;


	private _msec:number = 0;
	private _barNodes: cc.Node[] = [];
	private _barColors: cc.Color[] = [];

	private readonly _TIME_LIMIT: number = 40;
	private readonly _COLOR_ON: cc.Color = cc.color(0,255,255);
	private readonly _COLOR_OFF: cc.Color = cc.color(80, 80, 80);


    
	/**
	 * 初期化
	 */
    public setup():void
    {
		for(let i:number = 0 ; i < this.barParentNode.children.length ; i ++)
		{
			let node:cc.Node = this.barParentNode.children[i];
			let index = Number(node.name.substr(3,2));
			this._barNodes[index] = node;
			this._barColors[index] = node.color;
		}
		
		this.readyTimer();
    }


	/**
	 * インジケーターを空にする
	 */
    public hideTime():void
    {
        for(let i = 0 ; i < this._barNodes.length ; i ++)
        {
            this._barNodes[i].color = cc.color(0, 0, 0);
        }
		this.output.string = "";

		this.halfCoverNode.active = false;
		this.halfNode.active = false;
    }


	/**
	 * タイマー開始直前の状態にする
	 */
    public readyTimer():void
    {
        for(let i:number = 0 ; i < this._barNodes.length ; i ++)
        {
            this._barNodes[i].color = this._barColors[i];
        }
		this.output.string = "" + this._TIME_LIMIT;

		this.halfCoverNode.color = this._COLOR_ON;
		this.halfCoverNode.angle = 0;

		this.halfNode.color = this._COLOR_ON;
		this.halfNode.angle = 180;

		this.halfCoverNode.active = true;
		this.halfNode.active = true;
    }


	/**
	 * タイマーを開始する
	 * @param timeLimitCallback 残り5秒で呼ばれる
	 * @param timeUpCallback タイムアップ時に呼ばれる
	 */
    public startTimer (timeLimitCallback:(time:number)=>void, timeUpCallback:()=>void):void
    {
		//タイマーが動き出す
		let timeCount:number = this._TIME_LIMIT;
		this._msec = 0;

		this.node.stopAllActions();
		this.node.runAction(
			cc.repeat(
				cc.sequence(
					cc.valueTo(1.0, 0, 1, (value:number)=>
					{
						this._msec = value;
					}),
					cc.callFunc(()=>
					{
						timeCount --;
                        this.output.string = "" + timeCount;

						if (timeCount % 2 == 0)
						{
							let barIndex:number = timeCount / 2;
							this._barNodes[barIndex].color = cc.color(80, 80, 80);
						}

						//残り20秒
						if (timeCount == 20)
						{
							timeLimitCallback(timeCount);
						}
						//残り10秒
						else if (timeCount == 10)
						{
							timeLimitCallback(timeCount);
						}	
						//残り5秒
						else if (timeCount == 5)
						{
							timeLimitCallback(timeCount);
						}
						//タイムアップ
						else if(timeCount == 0)
						{
							timeUpCallback();
						}
					})
				),
				this._TIME_LIMIT
			)
		);

		this.halfNode.runAction(
			cc.repeat(
			cc.sequence(
				cc.callFunc(() =>
				{
					this.halfCoverNode.angle = 0;
					this.halfCoverNode.color = this._COLOR_ON;
					this.halfNode.angle = 180;
				}),
				cc.rotateBy(1.0, -180),
				cc.callFunc(() =>
				{
					this.halfCoverNode.angle = 180;
					this.halfCoverNode.color = this._COLOR_OFF;
				}),
				cc.rotateBy(1.0, -180)
			),
			this._TIME_LIMIT)
		);


    }



	/**
	 * タイマーを止める
	 */
    public stopTimer ():void
    {
		this.node.stopAllActions();
		this.halfNode.stopAllActions();
	}
	


	public showMiniSize() :void
	{
		this.aroundItemsNode.runAction(
			cc.scaleTo(0.3, 0.8).easing(cc.easeBackOut())
		);
	}


	public showFullSize() :void
	{
		this.aroundItemsNode.runAction(
			cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
		);
	}



	/**
	 * 答えにかかった時間(整数)を返す
	 */
	public getAnwerTime():number
	{
		let time:number = this._TIME_LIMIT - Number(this.output.string);
		if(time > this._TIME_LIMIT) time = this._TIME_LIMIT;
		return time;
	}

	/**
	 * 答えにかかった時間(少数)を返す
	 */
	public getAnwerFloatTime():number
	{
		let time:number = this._TIME_LIMIT - Number(this.output.string) + this._msec;
		if(time > this._TIME_LIMIT) time = this._TIME_LIMIT;
		//cc.log("かかった時間：" + time);
		return time;
	}

	
	/**
	 * 残り時間(整数)を返す
	 */
	public getRemainingTime():number
	{
		return Number(this.output.string);
	}


	/**
	 * 残り時間(少数)を返す
	 */
	public getRemainingFloatTime():number
	{
		//cc.log("残った時間:" + (Number(this.output.string) - this._msec));
		return Number(this.output.string) - this._msec;
	}


    /*
    resetTimer: function()
    {

    },
    */


}
