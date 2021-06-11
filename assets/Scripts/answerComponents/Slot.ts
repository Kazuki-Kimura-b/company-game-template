import SE from "../common/SE";
import { GameSE } from "../game/GameSEComponent";
import StaticData, { EasingName } from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Slot extends cc.Component {

	@property(cc.Node) fillNode: cc.Node = null;
	@property(cc.Button) btnUp: cc.Button = null;
	@property(cc.Button) btnDown: cc.Button = null;

	private _scrollView :cc.ScrollView = null;
	private _scrollOffset :cc.Vec2 = null;
	private _selectedItemID :number = 0;
	private _itemOutputs :cc.Label[] = [];
	private _contentsHeight :number = 0;
	private _seIndex:number = -1;
	private _rollAudioClip:cc.AudioClip = null;

	private readonly COLOR_NORMAL :cc.Color = cc.color(255, 255, 255);
	private readonly COLOR_RIGHT:cc.Color = cc.color(135, 40, 225);	//cc.color(0, 128, 255);//正解時
	private readonly COLOR_WRONG:cc.Color = cc.color(255, 80, 80);
	private readonly COLOR_RESULT_WAIT:cc.Color = cc.color(237, 177, 247);//  cc.color(255, 255, 128);//選択、結果待ち
	private readonly COLOR_FONT_NORMAL :cc.Color = cc.color(0, 0, 0);
	private readonly COLOR_FONT_RIGHT :cc.Color = cc.color(255, 255, 0);
	private readonly COLOR_FONT_WRONG :cc.Color = cc.color(255, 255, 255);

	private readonly _ITEM_HEIGHT :number = 100;		//アイテムの間隔、サイズ
	private readonly _SCROLL_ASOBI :number = 50;		//上下の遊び幅。アイテムよりも遊びの分だけ上下にスクロールできる。アイテムサイズの半分
	private readonly _MASK_HEIGHT :number = 263;//320;		//スクロールビューの見えているサイズ（高さ）特殊な形状でないなら this.node.height でよい
	private readonly _ADJUST_Y :number = 0;				//アイテム位置の調整用。マスクの形状によっては中央に表示されないので




	/**
	 * 選択中の文字を取得
	 */
	public getText ():string
	{
		//天地逆転するので注意。
		return this._itemOutputs[this._itemOutputs.length - 1 - this._selectedItemID].string;
	}




	/**
	 * 初期化
	 * @param candidates 表示する文字一式
	 * @param itemPrefab 
	 * @param sound 
	 */
	public setup (candidates:string, itemPrefab:cc.Prefab, rollAudioClip:cc.AudioClip):void
	{
		this._rollAudioClip = rollAudioClip;
		this._scrollView = this.node.getComponent(cc.ScrollView);
		
		let words:string[] = candidates.split(StaticData.QUESTION_SPLIT_WORD);

		if(this._itemOutputs != null)
		{
			this._scrollView.content.removeAllChildren(true);
		}

		this._itemOutputs = [];

		// -210になる。　scrollViewのビューの高さは320pxなので最初のアイテムが中央に来るY座標は-160。しかし遊びで50pxずつ上下に取っているので-50を加えて-210に配置。
		let startY:number = (this._MASK_HEIGHT / 2 + this._SCROLL_ASOBI) * -1;

		for(let i:number = 0 ; i < words.length ; i ++)
		{
			//アイテムを必要な数だけ作って配置する
			let slotItem:cc.Node = cc.instantiate(itemPrefab);
			slotItem.y = startY - i * this._ITEM_HEIGHT - this._ADJUST_Y;
			let newLabel:cc.Label = slotItem.getComponent(cc.Label);
			newLabel.string = words[i];
			this._scrollView.content.addChild(slotItem);

			/*
			let newItemNode = new cc.Node();
			newItemNode.color = cc.color(0,0,0);
			newItemNode.y = startY - i * this._ITEM_HEIGHT - this._ADJUST_Y;

			let newLabel = newItemNode.addComponent(cc.Label);
			newLabel.string = words[i];
			this._scrollView.content.addChild(newItemNode);
			*/
			this._itemOutputs[i] = newLabel;
		}

		this._selectedItemID = this._itemOutputs.length - 1;			//上下逆転している

		//スクロールするコンテンツの高さの設定

		let contentsHeight:number = (this._itemOutputs.length - 1) * this._ITEM_HEIGHT;		//植木算
		contentsHeight += (this._MASK_HEIGHT / 2) * 2;		//上下の端のボタンが表示エリアの中央に来るため、表示エリアの半分の高さを追加。それが上下の２つ追加
		contentsHeight += this._SCROLL_ASOBI * 2;			//上下には遊びが必要なので、その遊びの移動幅だけ追加。それが上下２つ

		this._contentsHeight = contentsHeight;

		this._scrollView.content.height = this._contentsHeight;

		//scrollViewのビューの高さは320pxなので最初のテキストが中央に来るY座標は-160。しかし遊びで50pxずつ上下に取っているので-50を加えて-210に配置。
		//this._scrollView.content.height = 210 + 210 + (this._itemOutputs.length - 1) * 100;  //旧ソース。この式は上のをちょっとまとめたもの

		

		//ScrollViewはスクロール範囲外で指を離すとうまくいかないので、タップの処理は画面全体で取って、その結果をscrollViewに反映（スクロール）させる仕組みにする。
		//ScrollViewをスクリプトでスクロールさせる場合上下のバウンドが出来なくなるのでスクロール範囲を上下それぞれ文字半分の高さだけ遊びで付けておく。
		//そのため、最初に遊びの分だけズレちゃうのでその分スクロールしておく
		this._scrollView.scrollTo(cc.v2(0, 1 - 1 / (this._itemOutputs.length * 2)), 0.0);



		//ボタンを親（コンポーネント）内に移動する
		let wPos:cc.Vec2 = this.node.convertToWorldSpaceAR(this.btnUp.node.getPosition());
		let lPos:cc.Vec2 = this.node.parent.parent.convertToNodeSpaceAR(wPos);

		this.btnUp.node.setPosition(lPos);
		this.btnUp.node.removeFromParent(false);
		this.node.parent.parent.addChild(this.btnUp.node);

		//----

		wPos = this.node.convertToWorldSpaceAR(this.btnDown.node.getPosition());
		lPos = this.node.parent.parent.convertToNodeSpaceAR(wPos);

		this.btnDown.node.setPosition(lPos);
		this.btnDown.node.removeFromParent(false);
		this.node.parent.parent.addChild(this.btnDown.node);


		this.btnUp.node.active = false;
		this.btnDown.node.active = false;
	}



	/**
	 * カーソルボタンを表示
	 */
	public showBtns ():void
	{
		this.btnUp.node.active = true;
		this.btnDown.node.active = true;
	}


	/**
	 * カーソルボタンのNodeを削除
	 */
	public removeBtns ():void
	{
		this.btnUp.node.removeFromParent(true);
		this.btnDown.node.removeFromParent(true);
	}


	/**
	 * カーソルボタンをロック
	 */
	public lockBtns():void
	{
		this.btnUp.interactable = false;
		this.btnDown.interactable = false;
	}



	/**
	 * 選択中のリール位置を取得
	 */
	public getItemIndex ():number
	{
		let scrollY:number = this._scrollView.getScrollOffset().y;
		//最寄りのテキストに自動スクロール
		//let index = Math.floor((scrollY + 50) / 100);	//上下に遊び無しバージョン
		//let index = Math.floor((scrollY + 50 - 50) / 100);	//アイテムの半分だけ移動する遊びを考慮する。-50はその値

		let index:number = Math.floor((scrollY + (this._ITEM_HEIGHT / 2) - this._SCROLL_ASOBI) / this._ITEM_HEIGHT);	//アイテムの半分だけ移動する遊びを考慮する。-50はその値
		return index;
	}


	/**
	 * 指定したアイテムIDの位置にスクロールする
	 * @param index 位置
	 * @param timeInSecond スクロールする時間
	 */
	private _setSelectedItemID (index:number, timeInSecond:number):void
	{
		//スクロールする値を算出。値は0～1なのでindexを項目数で割るのが普通だが、上下に遊びがあるので考慮する(1/8は文字半分の遊びのサイズ)
		//cc.log("index:" + index);

		let itemY:number = index * this._ITEM_HEIGHT + this._SCROLL_ASOBI;
		let scrollPerY:number = (itemY / (this._contentsHeight - this._MASK_HEIGHT));

		//cc.log("scroll to " + scrollPerY);

		this._scrollView.stopAutoScroll();
		this._scrollView.scrollTo(cc.v2(0, scrollPerY), timeInSecond);
	}




	/**
	 * スクロール開始
	 */
	public scrollStart ():void
	{
		//タップ時点のスクロール位置を取得しておく（scrollView内のローカル値）
		this._scrollOffset = this._scrollView.getScrollOffset();
		this._seIndex = this.getItemIndex();
	}



	/**
	 * スクロール中
	 * @param saY Y移動量
	 */
	public scrollMove (saY:number):void
	{
		//this._scrollView.stopAutoScroll();

		//スクロールさせる
		this._scrollView.scrollToOffset(cc.v2(0, this._scrollOffset.y + saY), 0.3, true);

		let newSeIndex:number = this.getItemIndex();
		if(newSeIndex != this._seIndex)
		{
			this._seIndex = newSeIndex;
			SE.play(this._rollAudioClip);		//ロール音
		}

		//cc.log("MOVE " + (this._scrollOffset.y + saY));
	}



	/**
	 * スクロール終了
	 */
	public scrollEnd ():void
	{
		cc.log(this._scrollView.getScrollOffset());

		let itemLen:number = this._itemOutputs.length;
		//scrollViewのスクロール位置から最寄りのテキストへフィットするようにスクロールさせる。
		//テキスト間は100pxなのでindexを求めるときに100で割っている。

		//選択したアイテムのインデックス
		let index:number = this.getItemIndex();


		index = (itemLen - 1) - index;		//逆
		if (index < 0) index = 0;
		else if (index > (itemLen - 1)) index = itemLen - 1;

		this._selectedItemID = index;

		this._setSelectedItemID(index, 0.2);
	}



	/**
	 * 正解の言葉まで自動スクロール
	 * @param word 指定の文字
	 */
	public scrollToAnswer (word:string):void
	{
		let itemLen:number = this._itemOutputs.length;
		
		for (let i:number = 0; i < this._itemOutputs.length; i++)
		{
			if (word == this._itemOutputs[i].string)
			{
				//逆転するので注意
				let index:number = (this._itemOutputs.length - 1) - i;

				this._setSelectedItemID(index, 0.4);

				return;
			}
		}
	}


	/**
	 * 結果待ちカラーにする
	 */
	public resultWait():void
	{
		for(let i:number =0 ; i < this._itemOutputs.length ; i ++)
		{
			this._itemOutputs[i].node.color = this.COLOR_FONT_NORMAL;
		}
		this.fillNode.color = this.COLOR_RESULT_WAIT;
	}


	/**
	 * このリールが正解か不正解か演出で返す
	 */
	public answerCheck(correct:boolean, delayTime:number, maruNode:cc.Node):void
	{
		if(correct)
		{
			cc.tween({})
			.delay(delayTime)
			.call(()=>
			{
				this.rightAnswer();		//正解カラー

				let wPos:cc.Vec2 = this.node.convertToWorldSpaceAR(cc.v2(0,0));
				let lPos:cc.Vec2 = maruNode.parent.convertToNodeSpaceAR(wPos);

				cc.Tween.stopAllByTarget(maruNode);
				maruNode.scale = 0.5;
				maruNode.x = lPos.x;
				maruNode.y = lPos.y + 70;
				maruNode.active = true;
				
				cc.tween(maruNode)
				.to(0.3, { scale:1.5 }, { easing:EasingName.backOut })
				.call(()=>{ maruNode.scale = 0; })
				.start();
				
				//正解音
				SE.play(GameSE.clip.pinpon);

			})
			.delay(0.3)
			.call(()=>
			{
				this.resultWait();		//結果待ちカラー
			})
			.start();
		}
		//----------------------
		// 不正解
		else
		{
			cc.tween({})
			.delay(delayTime)
			.call(()=>
			{
				this.wrongAnswer();		//不正解カラー

				//少しリールがずれて動く
				let index:number = this.getItemIndex();
				index = (this._itemOutputs.length - 1) - index;		//逆
				this._setSelectedItemID(index + 0.4, 0.0);
				this._setSelectedItemID(index, 0.3);

				//不正解音
				SE.play(GameSE.clip.batsu);
			})
			.delay(0.3)
			.call(()=>
			{
				this.resultWait();		//結果待ちカラー
			})
			.start();
		}

	}


	/**
	 * 正解のカラーにする
	 */
	public rightAnswer():void
	{
		for(let i:number =0 ; i < this._itemOutputs.length ; i ++)
		{
			this._itemOutputs[i].node.color = this.COLOR_FONT_RIGHT;
		}
		this.fillNode.color = this.COLOR_RIGHT;
	}


	/**
	 * 不正解のカラーにする
	 */
	public wrongAnswer():void
	{
		for(let i:number =0 ; i < this._itemOutputs.length ; i ++)
		{
			this._itemOutputs[i].node.color = this.COLOR_FONT_WRONG;
		}
		this.fillNode.color = this.COLOR_WRONG;
	}


	/**
	 * 全アイテムNodeを削除
	 */
	public removeItems():void
	{
		if(this._itemOutputs != null)
		{
			this._scrollView.content.removeAllChildren(true);
		}
		this._itemOutputs = null;
	}


	//--------------------------------------------------------------

	
	/**
	 * 上カーソルボタンを押した時
	 * @param event 
	 */
	onPressUpButton (event)
	{
		//選択音が鳴る
		SE.play(GameSE.clip.showAnswerBtn);

		//選択したアイテムのインデックス
		let index:number = this.getItemIndex();
		index = this._itemOutputs.length - index - 1;		//上下逆なのでひっくり返す

		index --;
		//if (index < 0) index = 0;

		if (index < 0)
		{
			index = -0.5;
			let itemY2 = index * this._ITEM_HEIGHT + this._SCROLL_ASOBI;
			let scrollPerY2 = (itemY2 / (this._contentsHeight - this._MASK_HEIGHT));
			this._scrollView.scrollTo(cc.v2(0, scrollPerY2), 0.0);

			index = 0;
		}

		this._selectedItemID = index;

		this._setSelectedItemID(index, 0.2);
	}


	/**
	 * 上カーソルボタンを押した時
	 * @param event 
	 */
	onPressDownButton (event)
	{
		//選択音が鳴る
		SE.play(GameSE.clip.showAnswerBtn);

		//選択したアイテムのインデックス
		let index:number = this.getItemIndex();
		index = this._itemOutputs.length - index - 1;		//上下逆なのでひっくり返す

		index ++;
		//if (index >= this._itemOutputs.length) index = this._itemOutputs.length - 1;

		if (index >= this._itemOutputs.length)
		{
			index = (this._itemOutputs.length - 1) + 0.5;
			let itemY2 = index * this._ITEM_HEIGHT + this._SCROLL_ASOBI;
			let scrollPerY2 = (itemY2 / (this._contentsHeight - this._MASK_HEIGHT));
			this._scrollView.scrollTo(cc.v2(0, scrollPerY2), 0.0);

			index = this._itemOutputs.length - 1;
		}

		this._selectedItemID = index;

		this._setSelectedItemID(index, 0.2);
	}


	



}
