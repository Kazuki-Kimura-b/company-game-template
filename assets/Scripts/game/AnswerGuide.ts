
const {ccclass, property} = cc._decorator;

@ccclass
export default class AnswerGuide extends cc.Component {

    @property(cc.SpriteFrame) atteruSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) dorenokotoSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) docchiSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) oneSelectSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) kotaeteSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) mawashiteSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) narabikaeteSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) narabeteSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) sayuuWaketeSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) tsunageteSF: cc.SpriteFrame[] = [];
	@property(cc.SpriteFrame) zenbuErandeSF: cc.SpriteFrame[] = [];



	/**
	 * 初期化
	 */
    public setup():void
    {

	}
	


	/**
	 * ガイドを表示
	 * @param format 問題フォーマット
	 */
	public showAtFormat(format:string):void
	{
		let spriteFrames:cc.SpriteFrame[];
		
		if(format == "フリーもじ入力" || format == "指定もじ入力") spriteFrames = this.kotaeteSF;
		else if(format == "ヨコ4択" || format == "タテ4択" || format == "スクエア4択") spriteFrames = this.oneSelectSF;
		else if(format == "マルバツ") spriteFrames = this.atteruSF;
		else if(format == "複数回答") spriteFrames = this.zenbuErandeSF;
		else if(format == "順番") spriteFrames = this.narabeteSF;
		else if(format == "スロット") spriteFrames = this.mawashiteSF;
		else if(format == "ペアリング") spriteFrames = this.tsunageteSF;
		else if(format == "グルーピング") spriteFrames = this.sayuuWaketeSF;
		else if(format == "ならべかえ") spriteFrames = this.narabikaeteSF;
		else if(format == "ヨコ2択" || format == "タテ2択") spriteFrames = this.docchiSF;
		else if(format == "連想") spriteFrames = this.dorenokotoSF;
		else if(format == "虫食い入力") spriteFrames = this.kotaeteSF;
		
		this.show(spriteFrames);
	}



	/**
	 * ガイドを表示
	 * @param spriteFrames 表示する画像の一覧（0から順に表示される）
	 */
    public show (spriteFrames:cc.SpriteFrame[]):void
    {
        let margin:number = 4;
		
		//-------------------------------------
		// 全体の幅を取得
		//
        let totalWidth:number = 0;
        let contentsHeight:number = 0;

        for(let i:number = 0 ; i < spriteFrames.length ; i ++)
        {
			let size:cc.Size = spriteFrames[i].getOriginalSize();
			
			//totalWidth += spriteFrames[i]._originalSize.width;
			totalWidth += size.width;
            if(contentsHeight < size.height)
            {
                contentsHeight = size.height;
            }
        }
		totalWidth += (spriteFrames.length - 1) * margin;		//全体の幅
		

		//-------------------------------------
		// 配置
		//
		let posX:number = -totalWidth / 2;
		let waitTimeB:number = 0.06 * spriteFrames.length + 0.24;		//登場した後の待ち時間
		let waitTimeC:number = 0.6;

        for(let i:number = 0 ; i < spriteFrames.length ; i ++)
        {
			let size:cc.Size = spriteFrames[i].getOriginalSize();

			let newNode:cc.Node = new cc.Node();
            newNode.width = size.width;
            newNode.height = size.height;

            posX += newNode.width / 2;
            newNode.x = posX;
            newNode.y = -(contentsHeight - newNode.height) / 2;
            posX += newNode.width / 2 + margin;
            
            let sprite:cc.Sprite = newNode.addComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrames[i];

            this.node.addChild(newNode);

            //---------

			newNode.scale = 0;
			

			//登場
			newNode.runAction(
				cc.sequence(
					cc.delayTime(0.06 * i),
					cc.scaleTo(0.24, 1.0).easing(cc.easeBackOut())
				)
			);
		}



		//-------------------------------------
		// 登場後のリピート演出
		//
		this.node.runAction(
			cc.sequence(
				cc.delayTime(waitTimeB),
				cc.scaleTo(0.2, 0.5).easing(cc.easeCircleActionInOut()),
				cc.callFunc(() =>
				{
					this.node.runAction(
						cc.repeatForever(
							cc.sequence(
								cc.delayTime(0.2),
								cc.fadeTo(2.0, 100).easing(cc.easeCircleActionIn()),

								cc.delayTime(2.0),
								cc.fadeTo(1.0, 0).easing(cc.easeCircleActionIn()),
								cc.delayTime(10.0),
								cc.fadeTo(1.0, 255).easing(cc.easeCircleActionOut()),
							)
						)
					);
				})
			)
		);
    }



	/**
	 * ガイドを消す
	 */
    public remove ():void
    {
		this.node.stopAllActions();
		for(let i = 0 ; i < this.node.children.length ; i ++)
		{
			this.node.children[i].stopAllActions();
		}
		
		this.node.removeAllChildren(true);

		this.node.scale = 1.0;
		this.node.opacity = 255;
	}



	/**
	 * 対象ノード内の座標からこのノードのY座標に変換
	 * @param fromNode 対象ノード
	 * @param Y Y座標
	 */
	public setY  (fromNode:cc.Node, Y:number):void
	{
		let wPos:cc.Vec2 = fromNode.convertToWorldSpaceAR(cc.v2(0, Y));
		let lPos:cc.Vec2 = this.node.parent.convertToNodeSpaceAR(wPos);

		this.node.y = lPos.y;

		//cc.log(Y);
		//cc.log(wPos);
		//cc.log(lPos);
	}



}
