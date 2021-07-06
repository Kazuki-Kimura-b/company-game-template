import Hukidashi from "./Hukidashi";
import TapEffect from "../common/TapEffect";
import SE from "../common/SE";
import { GameSE } from "./GameSEComponent";

class HintData
{
	constructor(public time:number, public word:string, public type:number)
	{

	}

	
}


const {ccclass, property} = cc._decorator;

@ccclass
export default class HintControl extends cc.Component {

	@property(cc.Prefab) hintHukidashiPrefab :cc.Prefab = null;
	@property(cc.Font) font: cc.Font = null;
	@property(cc.Button) btnHint: cc.Button = null;
	@property(cc.Sprite) hintSprite: cc.Sprite = null;
	@property(cc.SpriteFrame) hintOnSpriteFrame: cc.SpriteFrame = null;

	private _hints: Hukidashi[] = [];
	private _hintDatas :HintData[] = [];
	private _openHintCallback: ()=>void = null;
	private _faceIcons: cc.SpriteFrame[] = [];
	private _lockedHintDatas: HintData[] = [];		//習得以外でユーザーの操作無しに表示されないヒント情報
	private _startHintSpriteY:number;				//ヒントボタンの初期位置
	private _hinBtnOFF_spriteFrame: cc.SpriteFrame = null;
	private _alwayShowHint:boolean = false;

	private _script_end1: string = null;
	private _script_end2: string = null;
	private _script_end3: string = null;
	private _script_five_sec: string = null;
	private _script_start1: string = null;
	private _script_start2: string = null;
	private _script_start3: string = null;
	private _script_ten_sec: string = null;
	private _script_twenty_sec: string = null;




	/**
	 * 初期化
	 * @param sound SchoolSoundクラス
	 */
	public setup (alwayShowHint:boolean, openHintCallback:()=>void):void
	{
		this._alwayShowHint = alwayShowHint;
		this._openHintCallback = openHintCallback;
		this._startHintSpriteY = this.hintSprite.node.y;
		this._hinBtnOFF_spriteFrame = this.hintSprite.spriteFrame;
	}


	public setFaceIcons(faceIcons:cc.SpriteFrame[]):void
	{
		this._faceIcons = faceIcons;
	}


	/**
	 * StartAPIから取得した基本コメントを登録する
	 * @param response 
	 */
	public setupBasicHints(response:any):void
	{
		this._script_end1 = response.script_end1;
        this._script_end2 = response.script_end2;
        this._script_end3 = response.script_end3;
        this._script_five_sec = response.script_five_sec;
        this._script_start1 = response.script_start1;
        this._script_start2 = response.script_start2;
        this._script_start3 = response.script_start3;
        this._script_ten_sec = response.script_ten_sec;
        this._script_twenty_sec = response.script_twenty_sec;
	}






	/**
	 * 出すヒントを事前に追加登録
	 * @param words 内容の配列
	 * @param types 吹き出しのタイプ
	 * @param interval 表示間隔。undefined の場合は1.5 <- 1.0から変更
	 */
	public entryHints (words:string[], types:number[], interval:number):void
	{
		//cc.log(words);
		
		let iv_L:number = (interval == undefined) ? 1.5 : interval;
		let iv_S:number = iv_L / 2;

		let times:number[] = [
			Math.random() * iv_L + iv_L,
			Math.random() * iv_S + iv_L,
			Math.random() * iv_S + iv_S
		];

		times[2] += times[1] + times[0];
		times[1] += times[0];

		for(let i:number = times.length ; i < words.length ; i ++)
		{
			let lastTime = times[times.length - 1];
			times.push(lastTime + Math.random() * iv_L + iv_S);
		}

		
		for (let i:number = 0; i < words.length; i++)
		{
			let word:string = words[i];
			if (word == "" || word == undefined) continue;

			let hintData:HintData = new HintData(times[i], word, types[i]);

			//ヒントボタンがある場合、ヒントは混ぜない
			if(! this._alwayShowHint && hintData.type == Hukidashi.TYPE_HINT)
			{
				//ヒントボタンで表示するヒントリストに追加
				this._lockedHintDatas.push(hintData);
				continue;
			}

			//会話リストに追加
			this._hintDatas.push(hintData);
		}

	}


	
	/**
	 * 1つヒントを出す
	 * @param word ヒント内容
	 * @param type 吹き出しのタイプ
	 */
	public putHint (word:string, type:number):void
	{
		//cc.log(word);
		
		//-------------------------
		//ヒントNodeを作る

		let node:cc.Node = cc.instantiate(this.hintHukidashiPrefab);
		node.x = -360;
		
		let hint:Hukidashi = node.getComponent(Hukidashi);
		let rNum:number = Math.floor(Math.random() * this._faceIcons.length);

		hint.setup(word, type, this._faceIcons[rNum], this.font);	//ヒントふきだし

		/*
		//問題のヒントの場合、表示するかどうか調べて対応する
		if(type == Hukidashi.TYPE_HINT)
		{
			if(! this._gameMain.isOpenHint()) hint.hideHintText(()=>
			{
				//押した時
				this._allHintOpen();
			});
		}
		*/


		node.y = -node.height / 2;

		this.node.addChild(node);

		this._hints.push(hint);

		//-------------------------
		//今までのヒントを押し上げる & 作ったヒントを下から出す

		let scrollUp:number = node.height + 10;		//10はマージン

		for (let i:number = 0; i < this._hints.length; i++)
		{
			this._hints[i].node.runAction(
				cc.moveBy(0.3, cc.v2(0, scrollUp)).easing(cc.easeCircleActionOut())
			);
		}

		//-------------------------
		//上限数を越えた場合、古いヒントを削除

		if (this._hints.length > 3)
		{
			let removeHint:Hukidashi = this._hints[0];
			this._hints.shift();

			removeHint.node.runAction(
				cc.sequence(
					cc.fadeTo(0.2, 0),
					cc.removeSelf(true)
				)
			);
		}

		if(type == Hukidashi.TYPE_HINT) SE.play(GameSE.clip.hintHukidashi, false, 0.2);
		else SE.play(GameSE.clip.normalHukidashi, false, 0.2);
		
	}



	/**
	 * ヒントの表示を開始する (習得の場合はヒントが混ざるがそれ以外のモードではヒントは混ざらない)
	 */
	public startHint ():void
	{
		for (let i:number = 0; i < this._hintDatas.length; i++)
		{
			let hintData:HintData = this._hintDatas[i];

			//一定時間ごとにヒントを表示
			this.node.runAction(
				cc.sequence(
					cc.delayTime(hintData.time),
					cc.callFunc(() =>
					{
						//cc.log("PUT HINT");
						this.putHint(hintData.word, hintData.type);
					})
				)
			);
		}

		this._hintDatas = [];
	}


	/**
	 * ユーザー操作でヒントの表示を開始する(習得モード以外)
	 */
	private _unlockAllHints ():void
	{
		this.node.stopAllActions();
		
		for (let i:number = 0; i < this._lockedHintDatas.length; i++)
		{
			let hintData:HintData = this._lockedHintDatas[i];

			//一定時間ごとにヒントを表示
			this.node.runAction(
				cc.sequence(
					cc.delayTime(i * 0.2),		//ヒント情報が持つタイムを使用しない
					cc.callFunc(() =>
					{
						this.putHint(hintData.word, hintData.type);
					})
				)
			);
		}

		this._lockedHintDatas = [];
	}


	/**
	 * ストックしている未表示のメッセージを破棄する
	 * 表示済みのものはそのまま
	 */
	public resetHint ():void
	{
		//ストックしてる未表示分を破棄する
		this._hintDatas = [];
		this._lockedHintDatas = [];

		//既に予約のタイマーに乗ってしまったセリフを止める
		this.node.stopAllActions();
		
		/*
		this.node.stopAllActions();
		this.node.removeAllChildren(true);
		
		this._hints = [];
		this._hintDatas = [];
		*/
	}


	/**
	 * 表示中もストック分もすべて消す
	 */
	public removeAllHint()
	{
		//現状ヒントボタンまで消えるのでダメなら対応する
		
		
		this.node.removeAllChildren(true);
		this.resetHint();
	}


	/**
	 * ヒントボタンを隠す
	 */
	public hideHintButton()
	{
		this.hintSprite.node.stopAllActions();
		this.hintSprite.node.y = this._startHintSpriteY;
		this.hintSprite.node.active = false;
	}

	/**
	 * ヒントボタンを表示
	 */
	public showHintButton()
	{
		//ヒントが常にあるモードの場合はヒントボタンは表示しない
		if(this._alwayShowHint) return;
		cc.log("ここですよ");

		//ヒントが無い問題は表示しない
		if(this._lockedHintDatas.length == 0) return;
		cc.log("ここですか？");
		this.hintSprite.node.active = true;
		this.hintSprite.node.opacity = 255;

		this.btnHint.interactable = true;
		
		this.hintSprite.node.runAction(
			cc.repeatForever(
				cc.sequence(
					cc.jumpBy(0.6, cc.v2(0,0), 16, 1),
					cc.delayTime(0.4)
				)
			)
		);

		this.hintSprite.node.runAction(
			cc.repeatForever(
				cc.sequence(
					cc.callFunc(()=>{ this._hintLightON(true); }),
					cc.delayTime(0.2),
					cc.callFunc(()=>{ this._hintLightON(false); }),
					cc.delayTime(0.2),
					cc.callFunc(()=>{ this._hintLightON(true); }),
					cc.delayTime(0.2),
					cc.callFunc(()=>{ this._hintLightON(false); }),
					cc.delayTime(1.5)
				)
			)
		);
	}



	/**
	 * 短い解説を表示
	 * @param text 
	 */
	public shortKaisetsu(text:string):void
	{
		if(text == undefined || text == null)
		{
			this.entryHints(["UNDEFINED TEXT"], [Hukidashi.TYPE_ERROR], 0.5);
			return;
		}
		
		//this.putHint(text, Hukidashi.TYPE_KAISETSU);
		this.entryHints([text], [Hukidashi.TYPE_KAISETSU], 0.5);
	}



	/**
	 * エラーメッセージを表示
	 * @param text 表示内容
	 */
	public errorMsg(text:string):void
	{
		this.putHint(text, Hukidashi.TYPE_ERROR);
	}


	/**
	 * 読み込み中のメッセージ表示１
	 */
	public loadingBgm ():void
	{
		//ストックして未表示のヒントを取り消し
		this.node.stopAllActions();

		let words:string[] = ["読み込み中・・", "ちょっと待っていよう", "今のうちに落ち着こう", "もうちょっとかかるよ", "まだかな～"];
		let putWords:string[] = this._getRandomWords(words, 3);
		let types:number[] = [Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU];

		this.entryHints(putWords, types, 0.2);
		this.startHint();
	}

	/**
	 * 読み込み中のメッセージ表示2
	 */
	public loadingQuestionData ():void
	{
		//ストックして未表示のヒントを取り消し
		this.node.stopAllActions();

		let words:string[] = ["あと少しだけ待ってね", "もうちょっとだよ", "あと少し！", "もうちょっとだけ", "きたきた", "始まるよ～", "そろそろだな"];
		let putWords:string[] = this._getRandomWords(words, 3);
		let types:number[] = [Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU];

		this.entryHints(putWords, types, 0.2);
		this.startHint();
	}




	/**
	 * ゲーム開始時のメッセージ表示
	 */
	public gameStart ():void
	{
		//ストックして未表示のヒントを取り消し
		this.node.stopAllActions();

		//let words:string[] = ["がんばるぞ！", "えいえいおー！", "全問せいかいするぞ！", "みんなガンバロウ！", "今日はいけそう！", "よし！"];
		//let putWords:string[] = this._getRandomWords(words, 3);
		let putWords:string[] = [this._script_start1, this._script_start2, this._script_start3];
		let types:number[] = [Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU];

		this.entryHints(putWords, types, 0.2);
		this.startHint();
	}



	/**
	 * 正解時のメッセージ表示
	 */
	public goodAnswer ():void
	{
		//ストックして未表示のヒントを取り消し
		this.node.stopAllActions();
		
		let words:string[] = ["せいかい！", "やるね！", "あってる！", "そっちか～！", "いいね！", "すごい！", "僕は間違っちゃった・・・", "僕もできたよ！", "次は何かな？？"];
		let putWords:string[] = this._getRandomWords(words, 5);
		let types:number[] = [Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU];

		this.entryHints(putWords, types, 0.25);
		//this.startHint();
	}



	/**
	 * 不正解時のメッセージ表示
	 */
	public badAnswer ():void
	{
		//ストックして未表示のヒントを取り消し
		this.node.stopAllActions();

		let words:string[] = ["ちがった・・", "あれ～～？", "そっちか～", "ドンマイ！", "次はがんばろう！", "しまった・・"];
		let putWords:string[] = this._getRandomWords(words, 5);
		let types:number[] = [Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU];

		this.entryHints(putWords, types, 0.25);
		this.startHint();
	}



	/**
	 * 残り時間が少ない時のメッセージ表示
	 */
	public timeLimit ():void
	{
		//ストックして未表示のヒントを取り消し
		this.node.stopAllActions();

		let words:string[] = ["時間が・・・", "はやくはやく！", "そろそろ時間が・・", "ちょっといそいで！"];
		let putWords:string[] = this._getRandomWords(words, 3);
		let types:number[] = [Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU];

		this.entryHints(putWords, types, 0.25);
		this.startHint();
	}



	/**
	 * 残り時間が少ない時のメッセージ表示
	 */
	public harryUp (time:number)
	{
		if(time == 5) this.entryHints([this._script_five_sec], [Hukidashi.TYPE_SERIHU], 0.25);
		else if(time == 10) this.entryHints([this._script_ten_sec], [Hukidashi.TYPE_SERIHU], 0.25);
		else if(time == 20) this.entryHints([this._script_twenty_sec], [Hukidashi.TYPE_SERIHU], 0.25);
		else return;

		this.startHint();
	}



	/**
	 * 全部終わった時のメッセージ表示
	 */
	public finish():void
	{
		//ストックして未表示のヒントを取り消し
		this.node.stopAllActions();

		//let words:string[] = ["終わったー！", "おつかれ！", "今日も頑張った！", "これでおしまい！", "{結構,けっこう}できた！", "君はどうだった？"];
		//let putWords:string[] = this._getRandomWords(words, 3);
		let putWords:string[] = [this._script_end1, this._script_end2, this._script_end3];
		let types:number[] = [Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU, Hukidashi.TYPE_SERIHU];

		this.entryHints(putWords, types, 0.25);
		this.startHint();
	}


	//全ヒントを表示
	private _allHintOpen():void
	{
		for (let i:number = 0; i < this._hints.length; i++)
		{
			this._hints[i].openHint();
		}

		//メインにヒントを表示したことを伝える
		this._openHintCallback();
	}



	/**
	 * 文字列の配列からランダムに指定数だけ選んで新しい配列を返す
	 * @param words 対象文字列
	 * @param maxCount 選択する数
	 */
	private _getRandomWords (words:string[], maxCount:number):string[]
	{
		let randomCount:number = (maxCount - 3 + 1);
		let count:number = Math.floor(Math.random() * randomCount) + 3;

		let putWords:string[] = [];

		for (let i:number = 0; i < count; i++)
		{
			let index:number = Math.floor(Math.random() * words.length);
			putWords.push(words[index]);
		}
		return putWords;
	}



	/**
	 * ヒントボタンを押した
	 * @param event 
	 */
	private onPressHintButton(event:any):void
	{
		//効果音：ヒントボタン押した音
		SE.play(GameSE.clip.hintBtnPress);

		//タップエフェクト
        TapEffect.instance().setParticle(event.getTouches()[0].getLocation());
		
		this.hintSprite.node.stopAllActions();
		this.hintSprite.node.y = this._startHintSpriteY;
		this.hintSprite.node.scale = 0.2;
		this.hintSprite.node.runAction(
			cc.sequence(
				cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
				cc.delayTime(0.4),
				cc.fadeTo(0.6, 0.0).easing(cc.easeInOut(2.0))
			)
		);

		this.btnHint.interactable = false;

		this._hintLightON(true);

		this._unlockAllHints();

		//メインにヒントを表示したことを伝える
		this._openHintCallback();
	}


	private _hintLightON(value:boolean):void
	{
		this.hintSprite.spriteFrame = (value) ? this.hintOnSpriteFrame : this._hinBtnOFF_spriteFrame;
	}

	
}
