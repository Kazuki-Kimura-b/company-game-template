import GameMain from "../game/GameMain";
import BugTracking from "./BugTracking";
import STFont from "./STFont";
import STFormat from "./STFormat";

/**
 * 文字のプロパティクラス。すべての文字が持っている
 */
class CharProp
{
    /** 表示する文字 */
	public char:string = "";
    /** 表示する場所、何文字目か */
    public dispIndex:number = -1;
	/** アンダーライン装飾 */
    public U:boolean = false;
	/** 赤文字装飾 */
    public R:boolean = false;
	/** フォントサイズ1.6倍 */
	public F:boolean = false;
	/** 太字 */
	public B:boolean = false;
	/** 指示フォントにする */
	public T:boolean = false;
}


/**
 * 絵文字
 */
class IconProp
{
	/** 置き換える対象の文字 */
	public char:string = "";
	/** 置き換える画像 */
	public spriteFrame:cc.SpriteFrame = null;
	/** 置き換える画像をテキストの色に合わせる */
	public enabledTextColor:boolean = false;
	/** テキスト何文字分として扱うか */
	public locLength:number = 1;
}


/**
 * フリガナの詳細情報
 */
class STHuriganaProp
{
	constructor
	(
		/** 表示位置 */
		public dispIndex:number,
		/** 漢字の文字数 */
		public strLength:number,
		/** よみがな */
		public yomigana:string
	){}
}


/**
 * フリガナを管理するクラス
 */
class STHurigana
{
	constructor
	(
		/** フリガナの情報を除いたテキスト。｛明日,あした｝→　明日 */
		public textStr: string,
		/** 漢字の情報 */
		public charProps: CharProp[],
		/** フリガナ詳細 */
		public yomiganaList: STHuriganaProp[]
	){}
}


/**
 * テキスト間に挟んだ、外部から操作できるNodeのプロパティ
 * 問題文への直接の文字入力などに使用する
 */
class STDynamicNodeProp
{
	/** なぞ */
	public index:number = -1;
	/** その行の何文字目にあるか */
	public locX:number = -1;
	/** 何行目にあるか */
	public locY:number = -1;
	
	constructor(
		/** 置き換えるテキスト */
		public char:string,
		/** 挟んだNodeが何文字分のサイズになるか */
		public locLength:number,
		/** 挟むNode */
		public node:cc.Node,
		/** 表示した瞬間にコールバックする */
		public showCallback:()=>void
	){}
}


/**
 * 文字の行の間隔を調整するためのクラス
 */
class STRow
{
	/** 行全体の高さ。読み仮名やウンコマスの高さも含める。 */
	public height:number;
	/** 行全体の幅。カーニング済み */
	public width:number;
	/** テキストを表示するy座標。天井基準 */
	public centerY:number;

	public positionY:number;


	//-----------------------------------------------------------
	// STRowのプロパティを完成させるための関数一式
	//
	private _makingTop:number = 0;
	private _makingBottom:number = 0;

	public putText(node:cc.Node, addY:number):void
	{
		let height:number = node.height / 2;		//一旦今はスケールは配慮しない
		if(this._makingTop < height + addY) this._makingTop = height + addY;
		if(this._makingBottom > -height + addY) this._makingBottom = -height + addY;
	}

	public putTextVal(height:number, addY:number):void
	{
		if(this._makingTop < height / 2 + addY) this._makingTop = height / 2 + addY;
		if(this._makingBottom > -height / 2 + addY) this._makingBottom = -height / 2 + addY;
	}
	
	public fix():void
	{
		this.height = this._makingTop - this._makingBottom;
		this.centerY = -this._makingTop;// + this._makingBottom;		//ん？これでいい？？
	}
}







const {ccclass, property} = cc._decorator;

@ccclass
export default class SchoolText extends cc.Component
{
	/** フォント */
	@property(cc.Font) font:cc.Font = null;
	/** Bタグで使用するフォント */
	@property(cc.Font) boldFont:cc.Font = null;
	/** Tタグで使用するフォント */
	@property(cc.Font) TTagFont:cc.Font = null;
	/** アルファベットで使用するフォント */
	@property(cc.Font) englishFont:cc.Font = null;
	@property(cc.Prefab) stFontPrefab: cc.Prefab = null;
	
	/** テキストのノード。文字数だけ格納される。アイコン画像なども含まれる */
	private _mainNodes :cc.Node[] = [];
	/** そのテキストが何行目にあるかをすべて保持している。アイコン画像なども含まれる */
	private _textRows :number[] = [];
	/** タグや読み仮名を抜いた、最終的に表示されるテキスト */
	private _textStr :string = "";
	/** フォーマット、文字サイズや行間など */
	private _format :STFormat = null;
	/** コンテンツに応じた幅（カーニングした文字の左端から右端まで）表示内容に応じて可変。実際に画面に描画される幅 */
	private _contentsWidth :number = 0;
	private _contentsHeight :number = 0;		//★読み仮名などの高さが考慮されてないので間違い
	/** 表示サイズの幅。表示できる文字の数（format指定、カーニング無し）に応じて固定。テキストのみならこの幅を超えることは無い */
	private _areaWidth :number = 0;
	/** フリーもじ入力の入力欄など、テキスト間に挿入した特殊なノード */
	private _dynamicNodes :{} = null;
	/** レイアウト完了時 */
	private _reLayoutCallback :()=>void = null;

	/** 各行ごとの情報がまとまったもの */
	private _rows: STRow[] = [];

	/** 実際の表示範囲を可視化するためのデバッグ用ノード */
	private _debugDrawContentsRectNode: cc.Node = null;

	private _iconProps:IconProp[] = [];		//画像アイコンに関する情報
	

	/** デバッグモード　テキストの描画エリアを表示 */
	private static _DEV_RECT:boolean = false;


	private _setupSTFontFromPrefab:boolean = false;
	private _underlineSpriteFrame: cc.SpriteFrame = null;
	private _debugDrawRectSpriteFrame: cc.SpriteFrame = null;
	private _seAudioClip: cc.AudioClip = null;
	private _seVolume: number = 1.0;


	/** 左右の中央揃え */
	public static readonly HORIZONTAL_ALIGH_CENTER :string = "center";
	/** 表示エリアに対して左詰め */
	public static readonly HORIZONTAL_ALIGH_AREA_LEFT :string = "area_left";
	/** コンテンツの描画エリアに対して左詰め */
	public static readonly HORIZONTAL_ALIGH_CONTENTS_LEFT :string = "contents_left";
	/** このノード内のX:0を基準に左詰め */
	public static readonly HORIZONTAL_ALIGH_LEFT_ZERO :string = "left_zero";


	/** 表示エリア内で上詰め */
	public static readonly VERTICAL_ALIGN_TOP :string = "top";
	/** 表示エリア内で中央揃え（Y座標） */
	public static readonly VERTICAL_ALIGN_CENTER :string = "center";
	/** 表示エリア内で下詰め */
	public static readonly VERTICAL_ALIGN_BOTTOM :string = "bottom";

	public static readonly DEFAULT_YOMIGANA_SIZE :number = 20;
	public static readonly DEFAULT_YOMIGANA_MARGIN_Y :number = 2;
	/** Fタグの拡大率 */
	private static readonly F_TAG_SCALE:number = 1.6;

	

	/**
	 * デフォルトのフォーマット
	 */
	public static get defaultFormat():STFormat
	{
		let format:{} =
		{
			size: 46,
			margin: 2,
			lineHeight: 86,
			rows: 4,
			columns: 12,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_AREA_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_TOP,
			color: cc.color(255, 255, 255),
			yomiganaSize: 20,
			yomiganaMarginY: 2
		};
		
		return STFormat.create(format);
	}



	/**
	 * テキストを生成
	 * @param parentNode 
	 * @param text 
	 * @param format 
	 */
	public static create (parentNode:cc.Node, text:string, format:STFormat):SchoolText
	{
		let node:cc.Node = new cc.Node();
		node.name = "SchoolText";
		parentNode.addChild(node);

		let schoolText:SchoolText = node.addComponent(SchoolText);
		schoolText.createText(text, format);
		return schoolText;
	}



	/**
	 * テキストを生成
	 * @param parentNode 
	 * @param text 
	 * @param format
	 * @param font
	 */
	public static createWithFont (parentNode:cc.Node, text:string, format:STFormat, font:cc.Font):SchoolText
	{
		let node:cc.Node = new cc.Node();
		node.name = "SchoolText";
		parentNode.addChild(node);

		let schoolText:SchoolText = node.addComponent(SchoolText);
		schoolText.font = font;
		schoolText.createText(text, format);
		return schoolText;
	}


	/**
	 * テキストを生成
	 * @param parentNode 
	 * @param text 
	 * @param format
	 * @param font
	 */
	public static createWithSTFont (parentNode:cc.Node, text:string, format:STFormat, stFont:STFont):SchoolText
	{
		let node:cc.Node = new cc.Node();
		node.name = "SchoolText";
		parentNode.addChild(node);

		let schoolText:SchoolText = node.addComponent(SchoolText);
		schoolText.setSTFont(stFont)
		schoolText.createText(text, format);
		return schoolText;
	}



	/**
	 * フォントファイル(.ttf)を設定
	 * @param font フォントファイル(.ttf)
	 */
	public setFont(font: cc.Font):void
	{
		this.font = font;
	}

	/**
	 * 英語用のフォントファイル(.ttf)を設定
	 * @param font フォントファイル(.ttf)
	 */
	public setEnglishFont(font: cc.Font):void
	{
		this.englishFont = font;
	}


	/**
	 * プレハブからスクールフォントを設定
	 * @param prefab 
	 */
	public setSTFontFromPrefab(prefab:cc.Prefab):void
	{
		let stFontNode:cc.Node = cc.instantiate(prefab);
		let stFont:STFont = stFontNode.getComponent(STFont);
		this.setSTFont(stFont);
	}



	/**
	 * スクールフォントを設定
	 * @param stFont
	 */
	public setSTFont(stFont: STFont):void
	{
		for(let i:number = 0 ; i < stFont.iconChars.length ; i ++)
		{
			let ip:IconProp = new IconProp();
			ip.char = stFont.iconChars[i];
			ip.spriteFrame = stFont.iconSpriteFrames[i];
			ip.enabledTextColor = stFont.iconEnabledTextColors[i];
			ip.locLength = stFont.iconLocLengths[i];

			this._iconProps.push(ip);
		}

		if(stFont.font != null) this.font = stFont.font;
		if(stFont.englishFont != null) this.englishFont = stFont.englishFont;
		if(stFont.tTagFont != null) this.TTagFont = stFont.tTagFont;
	}






	public setUnderlineSpriteFrame (spriteFrame: cc.SpriteFrame):void
	{
		this._underlineSpriteFrame = spriteFrame;
		
		//今は代用
		this._debugDrawRectSpriteFrame = spriteFrame;
	}


	/**
	 * テキスト表示音を設定(nullで無音にする)
	 * @param audioClip 
	 * @param volume 
	 */
	public setTextSE(audioClip:cc.AudioClip, volume:number = 1.0):void
	{
		this._seAudioClip = audioClip;
		this._seVolume = volume;
	}




	/**
	 * フリガナデータを返す
	 * @param text 対象の文字列
	 */
	public static getTextString (text:string):STHurigana
	{
		let charProps:CharProp[] = [];
		let dispIndex:number = 0;

		let U:boolean = false;
		let R:boolean = false;
		let F:boolean = false;
		let B:boolean = false;
		let T:boolean = false;

			
		//フォーマットを正規化して配列に分解
		// . => なんでもいい1文字
		// {a,b}? => 直前の文字を何文字の範囲にするか。{最小,最大}?。　後ろに?を付けると該当する最小の範囲を抽出
		let list:string[] = text.split(/(\{.{1,5}?,.{1,10}?\})/g);		//text.split(/(\{.{1,4}?,.{1,8}?\})/g);から変更

		//配列から空白を除去
		for (let i:number = list.length - 1; i >= 0; i--)
		{
			if (list[i] == "") list.splice(i, 1);
		}
		
		//文章に漢字を含める
		let yomiganaList:STHuriganaProp[] = [];

		for(let i:number = 0 ; i < list.length ; i ++)
        {
            //読み仮名の処理
            if(list[i].charAt(0) == "{")
            {
                let yomiTag:string = list[i].substr(1, list[i].length - 2);
                let yomiTagList:string[] = yomiTag.split(",");		//[ 漢字, よみがな ]

                //読み仮名情報を追加
                yomiganaList.push(new STHuriganaProp(dispIndex, yomiTagList[0].length, yomiTagList[1]));		//[表示位置 , 漢字の文字数 , よみがな]


				//漢字を1文字ずつCharPropに入れていく（読み仮名のないテキストと同じ手続き）
                for(let k:number = 0; k < yomiTagList[0].length ; k ++)
                {
					let charProp:CharProp = this._createDispChar(yomiTagList[0][k], dispIndex, U, R, F, B, T);
					charProps.push(charProp);
					dispIndex ++;
                }
            }
            //通常のテキスト（タグがある場合あり）
            else
            {
                for(let k:number = 0 ; k < list[i].length ; k ++)
                {
                    let char:string = list[i][k];       //実際に表示するテキスト1文字
                    
                    //タグの開始、終了
                    if(char == "<")
                    {
                        //終了タグかどうか
                        let startTag:boolean = (list[i][k + 1] != "/");
                        //タグ名
                        let tagName:string = (startTag) ? list[i][k + 1] : list[i][k + 2];
                        
                        if(tagName == "u")
                        {
                            //ここから下線の開始、もしくは終了
                            U = startTag;
                        }
                        else if(tagName == "r")
                        {
                            //ここから赤文字、もしくは赤文字の終了
                            R = startTag;
                        }
						else if(tagName == "f")
						{
							//ここから1.6倍サイズ、もしくは終了
							F = startTag;
						}
						else if(tagName == "b")
						{
							//ここから太字、もしくは終了
							B = startTag;
						}
						else if(tagName == "t")
						{
							//ここから太字、もしくは終了
							T = startTag;
						}
                        k += (startTag) ? 2 : 3;

                        
                    }
                    //タグではないので普通に処理して次の文字へ
                    else
                    {
						let charProp:CharProp = this._createDispChar(char, dispIndex, U, R, F, B, T);
						charProps.push(charProp);
						dispIndex ++;
                    }
                }
            }
		}
		
		let textStr:string = "";
		for(let i:number = 0 ; i < charProps.length ; i ++)
		{
			textStr += charProps[i].char;
		}

		return new STHurigana(textStr, charProps, yomiganaList);
	}



	private static _createDispChar(char:string, dispIndex:number, U:boolean, R:boolean, F:boolean, B:boolean, T:boolean):CharProp
    {
        //dispChar にインデックスをつける
        let charProp:CharProp = new CharProp();
        charProp.char = char;
        charProp.dispIndex = dispIndex;         //表示する際のインデックス番号
        charProp.U = U;
		charProp.R = R;
		charProp.F = F;
		charProp.B = B;
		charProp.T = T;
		
		return charProp;
	}
	



	/**
	 * テキストを表示（表示直後はカーニングが使えないのでレイアウトは正確ではない）
	 * @param text 文字列
	 * @param format フォーマット
	 */
    public createText (text:string, format:STFormat):void
    {
		if(text == undefined || text == null)
		{
			//SchoolTextは汎用クラスなのでどこで使われるかわからない。もしもゲーム中なら今の問題データを渡す
			let qData = null;
			let gameMain:GameMain = cc.director.getScene().getComponent(cc.Canvas).getComponentInChildren(GameMain);
			if(gameMain)
			{
				//@ts-ignore
				qData = gameMain._qDatas[gameMain._QNum];
			}
			
			BugTracking.notify("表示するテキストがありません", "SchoolText.createText()",
			{
				msg: "TextError:表示するテキストがありません",
				isTextNull: text == null,
				isTextUndefined: text == undefined,
				qData: qData
			});

			cc.error("SchoolText.createText()");
		}
		
		//STFontがプロパティに登録されていて初期化してない場合初期化する
		if (! this._setupSTFontFromPrefab && this.stFontPrefab != null)
		{
			this._setupSTFontFromPrefab = true;
			this.setSTFontFromPrefab(this.stFontPrefab);
		}
		
		if (format == null) format = SchoolText.defaultFormat;
		this._format = format;

		this._contentsWidth = 0;
		this._contentsHeight = 0;

		if(this._debugDrawContentsRectNode != null)
		{
			this._debugDrawContentsRectNode.removeFromParent(true);
			this._debugDrawContentsRectNode = null;
		}

		
		//読み仮名、タグを抜き出す
		let textStrData :STHurigana = SchoolText.getTextString(text);
		this._textStr = textStrData.textStr;

		let charProps:CharProp[] = textStrData.charProps;
		let yomiganaList :STHuriganaProp[] = textStrData.yomiganaList;


		//-----------------------------------------

		//ダイナミックなノードを探す

		if (this._dynamicNodes != null)
		{
			let indexs :any[] = [];

			for (let key in this._dynamicNodes)
			{
				let dyProp:STDynamicNodeProp = this._dynamicNodes[key];

				let index: number = this._textStr.indexOf(dyProp.char);
				dyProp.index = index;

				if (index > -1) {
					indexs.push(index);
					indexs.push(dyProp);
				}
			}
			this._dynamicNodes = {};		//一旦、空にする

			for (let i:number = 0; i < indexs.length; i += 2)
			{
				this._dynamicNodes["index" + indexs[i]] = indexs[i + 1];
			}

			//cc.log(this._dynamicNodes);
		}

		

        //-----------------------------------------

		this._mainNodes = [];
		this._rows = [];
		this._textRows = [];

        let locX :number = 0;
		let locY :number = 0;
		let addLocX:number = 0;


		//表示サイズの幅。表示できる文字の数（format指定）に応じて固定
		this._areaWidth = format.size * format.columns + format.margin * (format.columns - 1);

        let startX :number = -this._areaWidth / 2 + format.size / 2;
		let yomiganaSize:number = (format.yomiganaSize != undefined) ? format.yomiganaSize : SchoolText.DEFAULT_YOMIGANA_SIZE;
		let yomiganaMarginY:number = (format.yomiganaMarginY != undefined) ? format.yomiganaMarginY : SchoolText.DEFAULT_YOMIGANA_MARGIN_Y;
		

        //-----------------------------------------

        for(let i:number = 0 ; i < charProps.length ; i ++)
        {
			let char:string = charProps[i].char;

            //改行
            if(char == "\n")
            {
                if(locX == 0) continue;     //行の頭に改行が来た時は無視する

                locX = 0;
				locY ++;
				if(locY == format.rows) break;
                continue;
			}
			
			if(locX == 0 && this._rows.length == locY)
			{
				this._rows.push(new STRow());
			}

            let tNode:cc.Node = new cc.Node();
			this.node.addChild(tNode);

			//this._mainNodes.push(tNode);
			//this._textRows.push(locY);

			let dyProp:STDynamicNodeProp = (this._dynamicNodes != null) ? this._dynamicNodes["index" + i] : null;
			let iconProp:IconProp = this._getIconPropAtChar(char);

			//let iconSpriteFrame = this._getIconSpriteFrame(char);

			//-----------------------------
			// DynamicNodeを表示
			if (dyProp != null)
			{
				tNode.addChild(dyProp.node);

				//tNode.width = dyProp.node._contentSize.width;// * dyProp.length;
				//tNode.height = dyProp.node._contentSize.height;

				tNode.width = dyProp.node.width * dyProp.node.scale;
				tNode.height = dyProp.node.height * dyProp.node.scale;

				cc.log("Dy Node height:" + dyProp.node.height);

				//2文字以上の幅に設定されている場合、その分文字数を増やす
				//locX += (dyProp.length - 1);

				//このDynamicNodeの途中で改行が発生する場合は直前で改行させる
				if(locX + dyProp.locLength > format.columns)
				{
					//cc.log("KOKOKO");
					locX = 0;
					locY ++;

					this._rows.push(new STRow());
				}

				dyProp.locX = locX;
				dyProp.locY = locY;		//何行目にあるか保持
				cc.log(dyProp);

				addLocX = dyProp.locLength;
			}
			//-----------------------------
			// アイコンを表示
            else if(iconProp != null)
            {
				let spNode:cc.Node = new cc.Node();
				tNode.addChild(spNode);
				
				let sprite:cc.Sprite = spNode.addComponent(cc.Sprite);
				sprite.spriteFrame = iconProp.spriteFrame;
				
				let contentSize:cc.Size = spNode.getContentSize();
				
				//cc.log(iconProp.char + " iconSize: " + contentSize.width + "x" + contentSize.height);
				tNode.width = contentSize.width;
				tNode.height = contentSize.height;

				//addLocX用意したので外す
				//locX += iconProp.locLength - 1;		//2文字以上の幅をとる 
				
				
				//フォーマットのサイズにアイコンのサイズを合わせる
				if(iconProp.enabledTextColor)
				{    
					sprite.type = cc.Sprite.Type.SIMPLE;
					sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
					sprite.trim = false;

					let originalSize:cc.Size = sprite.spriteFrame.getOriginalSize();
					let scale :number = (format.size - 2) / originalSize.height;//-2は左右のスペース。少しだけ余白
					
					//cc.log("content size:" + contentSize.width + "x" + contentSize.height);
					//cc.log("original size:" + originalSize.width + "x" + originalSize.height);
					//cc.log("sprite node w x h:" + spNode.width + "x" + spNode.height);

					spNode.width = originalSize.width * scale;
					spNode.height = originalSize.height * scale;

					//spNode.y = (contentSize.height - originalSize.height) * scale;
	
					tNode.width = originalSize.width * scale;
					tNode.height = originalSize.height * scale;
				}
				
				//文字の色
				if (iconProp.enabledTextColor) spNode.color = format.color;		//文字の色

				addLocX = iconProp.locLength;
			}
			//-----------------------------
			// 文字を表示
            else
            {
                let label :cc.Label = tNode.addComponent(cc.Label);

				if(this.englishFont != null && char >= "A" && char <= "z") label.font = this.englishFont;
				else if(charProps[i].T && this.TTagFont != null) label.font = this.TTagFont;
				else if(charProps[i].B && this.boldFont != null) label.font = this.boldFont;
                else if(this.font != null) label.font = this.font;

				//文字サイズ。<f>タグの場合2倍にする
                label.fontSize = (charProps[i].F) ? format.size * SchoolText.F_TAG_SCALE : format.size;
                label.lineHeight = (charProps[i].F) ? format.lineHeight * SchoolText.F_TAG_SCALE : format.lineHeight;
                label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                label.verticalAlign = cc.Label.VerticalAlign.CENTER;
                //label.overflow = cc.Label.Overflow.CLAMP;
				label.string = char;

				//読み仮名の位置調整対応のため追加。何か不具合が出たらチェックする(0917)
				//tNode.width = format.size;		//この値はrelayout前のため正確ではない
				//tNode.height = format.size;		//こっちは正確なはず

				tNode.width = label.fontSize;		//この値はrelayout前のため正確ではない fタグで大きくしたフォントに対応(20210219)
				tNode.height = label.fontSize;		//こっちは正確なはず

				// 文字の色。<r>タグ内の場合赤色にする
				tNode.color = (charProps[i].R) ? cc.Color.RED : format.color;

				//文字の描画エリアを着色
				if(SchoolText._DEV_RECT)
				{
					let devNode:cc.Node = new cc.Node();
					let devSprite:cc.Sprite = devNode.addComponent(cc.Sprite);
					devSprite.spriteFrame = this._debugDrawRectSpriteFrame;
					devNode.width = tNode.width / 2;
					devNode.height = tNode.height;
					devNode.color = cc.color(255, 0, 0);
					devNode.opacity = 128;
					tNode.addChild(devNode);
				}

				
				//if(char >= "A" && char <= "z")		// A-Z, a-z
				if(char >= "a" && char <= "z")		// a-z
				{
					addLocX = 0.65;
				}
				else
				{
					addLocX = 1;
				}

				//大きなフォントは2文字分
				if(charProps[i].F) addLocX *= SchoolText.F_TAG_SCALE;
			}

			this._rows[locY].putText(tNode, 0);
			
			// 下線が必要な場合下線を加える
			if(charProps[i].U)
			{
				let uLineNode: cc.Node = new cc.Node();
				let uLineSprite: cc.Sprite = uLineNode.addComponent(cc.Sprite);
				uLineSprite.spriteFrame = this._underlineSpriteFrame;
				uLineSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
				let lineWidth = (tNode.width == 0) ? format.size + format.margin : tNode.width + format.margin;

				uLineSprite.node.width = lineWidth;
				uLineSprite.node.height = 4;
				uLineSprite.node.y = -format.size / 2 - 2;
				uLineSprite.node.color = cc.color(255,0,0);
				tNode.addChild(uLineSprite.node);

				this._rows[locY].putText(uLineSprite.node, uLineSprite.node.y);
			}



			//Y座標はもう少し下で設定してる
			tNode.x = startX + locX * (format.size + format.margin);

			locX += addLocX;

			//if(dyProp != null) locX += dyProp.locLength;		//DynamicNodeの場合はそのノードが指定した文字数分だけ消費
			//else locX ++;
			
			this._mainNodes.push(tNode);
			this._textRows.push(locY);



            //読み仮名　がある場合、付け足す
			if(yomiganaList.length == 0 )
			{
				//無し
			}
            else if(yomiganaList[0].dispIndex == i)
            {
				let yNode :cc.Node = new cc.Node();
				yNode.name = "yomigana";
                yNode.color = format.color;
				yNode.x = (yomiganaList[0].strLength - 1) * (format.size + format.margin) * 0.5;
				yNode.width = yomiganaSize;
				yNode.height = yomiganaSize;		//よみがなフォントサイズと同じ

				yNode.y = tNode.height / 2 + yNode.height / 2 + yomiganaMarginY;

				//cc.log(tNode.height + "," + yNode.width + "," + yNode.height + "," + yomiganaMarginY);
				//cc.log(tNode.y + "/" + yNode.y);

                tNode.addChild(yNode);

				let yLabel :cc.Label = yNode.addComponent(cc.Label);
				yLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;		//これエディタの初期値だけどスクリプトで生成した場合は初期値じゃないので注意！
                yLabel.fontSize = yomiganaSize;
				yLabel.string = yomiganaList[0].yomigana;

				
				yomiganaList.shift();
				
				//yNode.height としたい所だが、まだ作ったとこで取得できないタイミングの可能性があるので
				//ynode.heightに入れる予定だった値を直接いれる。
				//
				//this._rows[locY].putText(yNode, yNode.y);				//初期。この書き方だと問題文は正常に取得できるが解説文は取得できない。
				//this._rows[locY].putTextVal(yomiganaSize, yNode.y);	//しばらく使ってたのはこれ。行間にフリガナを含めない仕様変更のため削除(2021/01/05)



				//読み仮名の描画エリアを着色
				if(SchoolText._DEV_RECT)
				{
					let devNode:cc.Node = new cc.Node();
					let devSprite:cc.Sprite = devNode.addComponent(cc.Sprite);
					devSprite.spriteFrame = this._debugDrawRectSpriteFrame;
					devNode.width = yomiganaSize;//yNode.width;
					devNode.height = yomiganaSize;//yNode.height;
					devNode.color = cc.color(0, 0, 0);
					devNode.opacity = 164;
					yNode.addChild(devNode);
				}

			}
			

			//文字数が指定を超えたので改行する
            if(locX >= format.columns)
            {
				locX = 0;
				locY ++;
				
				//cc.log("改行！");

				//これ一見いりそうでいらない。次回の頭で処理されるので。
				//this._rows.push(new STRow());

				if(locY == format.rows) break;
			}

		}

		//順番並べとか文字が空白のケースがあるので
		if(this._rows.length == 0)
		{
			return;
		}

		//rowsを完成させる
		for (let i:number = 0 ; i < this._rows.length ; i ++)
		{
			this._rows[i].fix();
		}

		this._rows[0].positionY = 0;

		for (let i:number = 1 ; i < this._rows.length ; i ++)
		{
			this._rows[i].positionY = this._rows[i - 1].positionY - (this._rows[i - 1].height + (format.lineHeight - format.size));
		}

		//完成したrowsを使ってcontentsHeightを作る
		let cH:number = this._rows[0].height;
		for (let i:number = 1 ; i < this._rows.length ; i ++)
		{
			cH += (format.lineHeight - format.size) + this._rows[i].height;
		}
		this._contentsHeight = cH;

		// VERTICAL_ANCHOR と VERTICAL_ALIGH から、contentsHeightの天井のYを算出する

		let cH_top:number = 0;		//contentsHeightの天井Y
		if (format.verticalAlign == SchoolText.VERTICAL_ALIGN_TOP) cH_top = 0;
		else if (format.verticalAlign == SchoolText.VERTICAL_ALIGN_CENTER) cH_top = this._contentsHeight / 2;
		else if (format.verticalAlign == SchoolText.VERTICAL_ALIGN_BOTTOM) cH_top = this._contentsHeight;



		if(SchoolText._DEV_RECT)
		{
			if(this._debugDrawContentsRectNode == null)
			{
				let devNode:cc.Node = new cc.Node();
				let devSprite:cc.Sprite = devNode.addComponent(cc.Sprite);
				devSprite.spriteFrame = this._debugDrawRectSpriteFrame;
				devNode.anchorY = 1;
				devNode.color = cc.color(255, 0, 0);
				devNode.opacity = 64;
				this.node.addChild(devNode);
	
				this._debugDrawContentsRectNode = devNode;
			}
			
			this._debugDrawContentsRectNode.width = format.size * format.columns + (format.margin * (format.columns - 1));		//カーニングしてないので仮
			this._debugDrawContentsRectNode.height = this._contentsHeight;
			this._debugDrawContentsRectNode.y = cH_top;
		}


		//実際に各文字のy座標を調整
		for(let i:number = 0 ; i < this._mainNodes.length ; i ++)
		{
			let textRow:number = this._textRows[i];
			this._mainNodes[i].y = this._rows[textRow].positionY + this._rows[textRow].centerY + cH_top;
		}

		//cc.log(this._rows);

		//最後の行がformat.columnsと同じだと無駄な改行が入るから、それを除去してる
		if (locX == 0 && locY > 0) locY--;

	}



	/**
	 * テキストの表示位置を調整（カーニング）
	 */
    public reLayoutText ():void
    {
		//まず各行の文字全体の幅を取得する
		let lineNodes :cc.Node[][] = [[]];		//予め2字配列で空を作ってる。間違いではないので注意
		let lineWidths :number[] = [];
		//let lineYs = [];
		let lineIndex :number = 0;

		let tempContentsWidth :number = 0;

		let contentsWidth :number = 0;
		let contentsHeight :number = (this._mainNodes.length == 0) ? 0 : this._format.size;

		//let textNodeY = this._mainNodes[0].y;
		let row :number = this._textRows[0];

		//--------------------------------------------
		// 各行のコンテンツ幅を取得
		//
		for (let i:number = 0; i < this._mainNodes.length; i++)
		{
			//新しい行に入った
			//if (this._mainNodes[i].y < textNodeY)
			if (this._textRows[i] != row)
			{
				//前の行のコンテンツ幅を取得
				tempContentsWidth -= this._format.margin;		//余計につけたマージンを取る
				lineWidths[lineIndex] = tempContentsWidth;
				
				tempContentsWidth = 0;
				//textNodeY = this._mainNodes[i].y;
				row = this._textRows[i];
				lineIndex ++;
				lineNodes.push([]);

				contentsHeight += this._format.lineHeight;		//不完全。フリガナは除外されているし、１行目か最後の行で大きな記号が混じった場合は飛び出した高さが除外
			}

			tempContentsWidth += this._mainNodes[i].width + this._format.margin;
			lineNodes[lineIndex].push(this._mainNodes[i]);
		}

		//最後の行のコンテンツ幅を取得
		tempContentsWidth -= this._format.margin;		//余計につけたマージンを取る
		lineWidths[lineIndex] = tempContentsWidth;

		tempContentsWidth = -1;		//バグ出さないように目立つ値を仮で入れる（もう使わない）

		//cc.log(lineWidths);


		//format.horizontalAlign の設定ごとに全体をずらす

		//--------------------------------------------
		// contentsWidth を取得
		//
		//if (this._format.horizontalAlign == SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT)		//これ限定しなくてよくね？(0917)
		{
			for (let i:number = 0; i < lineWidths.length; i++)
			{
				if (contentsWidth < lineWidths[i]) contentsWidth = lineWidths[i];
			}
		}


		//最後の行がformat.columnsと同じだと無駄な改行が入るから、それを除去してる
		//if (locX == 0 && locY > 0) locY--;


		//cc.log("contentsWidth:" + contentsWidth + " / " + "contentsHeight:" + contentsHeight);

		this._contentsWidth = contentsWidth;
		//this._contentsHeight = contentsHeight;		//正しい情報で更新 (ひとまず無し。今まで変わってなかったと思う)

		
		if(this._debugDrawContentsRectNode != null)
		{
			this._debugDrawContentsRectNode.width = this._contentsWidth;

			if(this._format.horizontalAlign == SchoolText.HORIZONTAL_ALIGH_CENTER)
			{
				this._debugDrawContentsRectNode.x = 0;
			}
			else if(this._format.horizontalAlign == SchoolText.HORIZONTAL_ALIGH_LEFT_ZERO)
			{
				this._debugDrawContentsRectNode.x = this._debugDrawContentsRectNode.width / 2;
			}



		}
		
		//ちょっと変えてみた
		contentsHeight = this._contentsHeight;

		
		//--------------------------------------------
		// 文字の座標をすべて動かす
		//
		for (let i:number = 0; i < lineNodes.length; i++)
		{
			let posX:number = 0;
			
			//各行の先頭のx座標を求める
			if (this._format.horizontalAlign == SchoolText.HORIZONTAL_ALIGH_AREA_LEFT)
			{
				posX = -this._areaWidth / 2;
			}
			else if (this._format.horizontalAlign == SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT)
			{
				posX = -contentsWidth / 2;
			}
			else if (this._format.horizontalAlign == SchoolText.HORIZONTAL_ALIGH_CENTER)
			{
				posX = -lineWidths[i] / 2;
			}
			else if (this._format.horizontalAlign == SchoolText.HORIZONTAL_ALIGH_LEFT_ZERO)//x0の位置からの左詰め
			{
				posX = 0;
			}

			//テキストNodeを実際に移動
			for (let k:number = 0; k < lineNodes[i].length; k++)
			{
				posX += lineNodes[i][k].width / 2;
				lineNodes[i][k].x = posX;
				posX += lineNodes[i][k].width / 2 + this._format.margin;
			}
		}

		
		if (this._reLayoutCallback != null)
		{
			this._reLayoutCallback();
		}

	}


	/**
	 * レイアウト調整完了後のコールバックを登録
	 * @param callback 
	 */
	public setReLayoutCallback (callback:()=>void):void
	{
		this._reLayoutCallback = callback;
	}


	/**
	 * その行だけレイアウトを途中で変更。指定文字の後ろをすべて反映する
	 * @param target 対象の文字(Node)
	 * @param duration レイアウト変更のアニメーション時間
	 */
	public changeLauoutAfterTargets (target:cc.Node, duration:number):void
	{
		let index:number = -1;

		for (let i:number = 0; i < this._mainNodes.length; i++)
		{
			if (this._mainNodes[i] == target)
			{
				index = i;
				break;
			}
		}

		let startText:boolean = false;		//行の先頭
		if (index == 0) startText = true;
		else if (this._mainNodes[index - 1].y != this._mainNodes[index].y) startText = true;

		let posX:number = (startText) ? this._contentsWidth / -2 : this._mainNodes[index - 1].x + this._mainNodes[index - 1].width / 2 + this._format.margin;

		for (let i:number = index; i < this._mainNodes.length; i++)
		{
			posX += this._mainNodes[i].width / 2;

			if (duration == 0.0)
			{
				this._mainNodes[i].x = posX;
			}
			else
			{
				this._mainNodes[i].runAction(
					cc.moveTo(duration, posX, this._mainNodes[i].y).easing(cc.easeBackOut())
				);
			}

			posX += this._mainNodes[i].width / 2 + this._format.margin;

			if (i + 1 >= this._mainNodes.length) break;
			else if (this._mainNodes[i].y != this._mainNodes[i + 1].y) break;
		}
	}



	/**
	 * １行最大何文字か返す
	 * @param format フォーマット
	 */
	/*
    private _getMaxColumns (format:STFormat):number
    {
        let locX:number = 0;
        let maxColumns:number = 0;
        
        for(let i:number = 0 ; i < this._textStr.length ; i ++)
        {
            let char:string = this._textStr.charAt(i);
            if(char == "\n")
            {
                locX = 0;
                continue;
            }

            locX ++;
            if(maxColumns < locX) maxColumns = locX;

            if(locX == format.columns) locX = 0;
        }
        return maxColumns;
	}
	*/

	public getMaxColumns():number
	{
		let currentRow:number = -1;
		let count:number = 0;
		let maxCount:number = 0;
		
		for(let i:number = 0 ; i < this._textRows.length ; i ++)
		{
			let row:number = this._textRows[i];

			if(currentRow < row)
			{
				currentRow = row;
				count = 0;
			}
			count ++;
			if(maxCount < count) maxCount = count;
		}
		return maxCount;
	}


	public getContentsWidth():number
	{
		return this._contentsWidth;		//reLayout()のあとでなければ正確な値ではないので注意
	}

	/**
	 * 実際の文字全体の高さを返す
	 */
	public getContentsHeight ():number
	{
		return this._contentsHeight;
	}



	/**
	 * 行数を返す（未確認）
	 */
	public getRowsCount():number
	{
		return this._rows.length;
	}


	/**
	 * 	文字のフォーマットを返す
	 */
	public getTextFormat ():STFormat
	{
		return this._format;
	}


	/**
	 * 各行のY座標を返す
	 */
	public getTextPosYs ():number[]
	{
		let size:number = this._format.size;
		let ys:number[] = [];
		for(let i:number = 0 ; i < this._rows.length ; i ++)
		{
			//ここで文字サイズの半分を足さないといけない理由は分からない。暇なとき調べる
			ys.push(this._rows[i].positionY + this._rows[i].centerY + size / 2);
		}
		return ys;
	}

	
	/**
	 * ダイナミックNodeプロパティをNodeから取得
	 * @param target 
	 */
	public getDynamicNodePropAtNode (target:cc.Node):STDynamicNodeProp
	{
		for (let key in this._dynamicNodes)
		{
			if(this._dynamicNodes[key].node == target)
			{
				return this._dynamicNodes[key];
			}
		}
		return null;
	}
	


	/**
	 * テキストを消す
	 */
    public resetText ():void
    {
        this.node.removeAllChildren(true);
        this._mainNodes = [];
		this._textStr = "";
		this._dynamicNodes = null;
		this._textRows = [];
	}


	/**
	 * テキストを書き直し
	 * @param text 
	 */
	public setText (text:string):void
	{
		this.resetText();
		this.createText(text, this._format);
	}


	/**
	 * テキストを非表示
	 */
    public hideText ():void
    {
        this.node.active = false;
    }


	/**
	 * テキストを１文字ずつ表示
	 * @param showCompleteCallback 
	 */
    public showText (showCompleteCallback:()=>void):void
    {
		//表示するテキストがない場合
		if(this._mainNodes.length == 0)
		{
			if (showCompleteCallback) showCompleteCallback();
			return;
		}
		
		
		this.preShowLine();

        let duration = this._mainNodes.length * 0.015;

        //１文字ずつ表示
		this.node.runAction(
			cc.sequence(
				// 1だったのを0にした。最初のもっさり感を減らすためと思うがバグが出るので直した(20210422)
				cc.valueTo(duration, 0, this._mainNodes.length, (value) =>
				{
					let len:number = Math.floor(value);

					for (let i:number = 0; i < len; i++)
					{
						if(this._mainNodes[i] == null)
						{
							BugTracking.notify("１文字ずつ表示でnullの文字にアクセス", "SchoolText.showText()",
							{
								msg: "１文字ずつ表示でnullの文字にアクセスしている",
								mainNodes_length: this._mainNodes.length,
								text: this._textStr,
								valueTo_value: value,
								for_loop_i: i
							});

							continue;
						}
						
						
						if (! this._mainNodes[i].active)
						{
							// 1文字表示
							this._mainNodes[i].active = true;

							// 効果音が設定されてる場合(あえてaudioEngineにしている)
							if(this._seAudioClip) cc.audioEngine.play(this._seAudioClip, false, this._seVolume);
						}
					}
				}),
				cc.callFunc(() =>
				{
					if (showCompleteCallback) showCompleteCallback();
				})
			)
			
		);
	}


	/**
	 * 全てすぐに表示する（ただし0.02秒だけ待つ）
	 */
	public flushText ():void
	{
		cc.tween({})
		.delay(0.02)
		.call(()=>
		{
			this.node.active = true;		//追加。ほかに影響でないと思う(20210330)
			this.reLayoutText();
		})
		.start();
		
		/*
		this.node.runAction(
			cc.sequence(
				cc.delayTime(0.02),
				cc.callFunc(() =>
				{
					this.node.active = true;		//追加。ほかに影響でないと思う(20210330)
					this.reLayoutText();
				})
			)
		);
		*/
	}


	/**
	 * 文字の表示前にレイアウトを調整する
	 */
	public preShowLine ():void
	{
		this.node.active = true;

		//レイアウトを調整
		this.reLayoutText();       //ダメ。表示してからじゃないとwidth取れないのでは？

		for (let i:number = 0; i < this.node.children.length; i++)
		{
			if(this.node.children[i] == this._debugDrawContentsRectNode) continue;
			
			this.node.children[i].active = false;
		}
	}


	/**
	 * 指定した行だけを表示（表示済みはそのまま）
	 * @param row 指定行
	 */
    public showLine (row:number):void
    {
        let rows:string[] = this._textStr.split("\n");
        let startIndex:number = 0;
        let endIndex:number = 0;

        if(row >= rows.length) row = rows.length - 1;

        if(row == 0)
        {
            endIndex = rows[0].length;
        }
        else if(row == 1)
        {
            startIndex = rows[0].length;
            endIndex = startIndex + rows[1].length;
        }
        else if(row == 2)
        {
            startIndex = rows[0].length  + rows[1].length;
            endIndex = startIndex + rows[2].length;
        }
        else if(row == 3)
        {
            startIndex = rows[0].length + rows[1].length + rows[2].length;
            endIndex = startIndex + rows[3].length;
		}
		else if(row == 4)
        {
            startIndex = rows[0].length + rows[1].length + rows[2].length + rows[3].length;
            endIndex = startIndex + rows[4].length;
		}

		let duration:number = (endIndex - startIndex) * 0.015;

        //１文字ずつ表示
		this.node.runAction(
			cc.valueTo(duration, 0, endIndex - startIndex, (value)=>
			{
                let len:number = Math.floor(value);
                
                for(let i:number = 0 ; i < len ; i ++)
                {
                    if(! this._mainNodes[i + startIndex].active) this._mainNodes[i + startIndex].active = true;
                }
			})
		);
    }



	/**
	 * 表示中のテキストのカラーを変更
	 * @param color 
	 */
    public setColor (color:cc.Color):void
    {
        for(let i:number = 0 ; i < this.node.children.length ; i ++)
        {
			if(this.node.children[i] == this._debugDrawContentsRectNode) continue;		//デバッグ表示は対象外

			this.node.children[i].color = color;

            if(this.node.children[i].children.length > 0)
            {
				for(let k:number = 0 ; k < this.node.children[i].children.length ; k ++)
				{
					this.node.children[i].children[k].color = color;
				}
            }
        }
    }


	/**
	 * テキストのカラーを変更（以後ずっと変わる）
	 * @param color 
	 */
	public setColorFromFormat(color:cc.Color):void
	{
		this._format.color = color;
	}


	/**
	 * テキストのカラーを返す
	 */
    public getColor ():cc.Color
    {
        if(this.node.children.length == 0) return null;
        return this.node.children[0].color;
    }



	/**
	 * テキストを返す
	 */
    public getText ():string
    {
        return this._textStr;
    }



	


	private _getIconPropAtChar(char:string):IconProp
	{
		for(let i:number = 0 ; i < this._iconProps.length ; i ++)
        {
            if(this._iconProps[i].char == char)
            {
                return this._iconProps[i];
            }
        }
        return null;
	}


	
	/**
	 * テキスト間に外部から操作できるNodeを挟む
	 * @param char 置き換えるテキスト
	 * @param length 挟んだNodeが何文字分のサイズになるか
	 * @param node 挟むNode
	 * @param showCallback 表示した瞬間にコールバックする
	 */
	public addDynamicNodeToText (char:string, length:number, node:cc.Node, showCallback):void
	{
		if (this._dynamicNodes == undefined) this._dynamicNodes = {};
		this._dynamicNodes[char] = new STDynamicNodeProp(char, length, node, showCallback);
	}


}

