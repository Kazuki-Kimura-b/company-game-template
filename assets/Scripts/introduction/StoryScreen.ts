import AnsButton from "../answerComponents/AnsButton";
import BugTracking from "../common/BugTracking";
import SchoolText from "../common/SchoolText";
import SE from "../common/SE";
import STFont from "../common/STFont";
import STFormat from "../common/STFormat";
import TapEffect from "../common/TapEffect";
import IjinScreen from "../game/IjinScreen";
import StaticData from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StoryScreen extends cc.Component
{

    @property(cc.Node) backCoverNode:cc.Node = null;
    @property(cc.Node) messageWindow:cc.Node = null;
    @property(SchoolText) messageOutput:SchoolText = null;
    @property(cc.Sprite) messageBoardSprite:cc.Sprite = null;
    @property(SchoolText) nameOutput:SchoolText = null;
    @property(cc.Node) nextIconNode:cc.Node = null;
    @property(cc.Sprite) effectIconSprite:cc.Sprite = null;
    @property(cc.Button) btnSkip:cc.Button = null;
    @property(cc.SpriteFrame) bikkuriSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) guchaSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) ikariSpriteFrame:cc.SpriteFrame = null;
    @property({type:cc.AudioClip}) talkPlayerSE:cc.AudioClip = null;
    @property({type:cc.AudioClip}) talkIjinSE:cc.AudioClip = null;
    @property(cc.Prefab) questionFontPrefab:cc.Prefab = null;			//問題と回答ボタンで使用するSTFont情報

    private _ijinScreen:IjinScreen = null;
    private _completeCallback:()=>void = null;
    private _storyPage:number = 0;
    private _canvas:cc.Node = null;
    private _ijinName:string = "";      //相手の名前
    private _ijinNameLength:number = 0;      //相手の名前の文字数
    private _scripts:string[] = [];     //ストーリー
    private _talkChars:number[] = [];
    private _selBtnPrefab:cc.Prefab = null;
    private _storyCommonCallback:(code:string, subCode:string)=>void = null;        //汎用コールバック。オープニングBで使用

    private _talkCharacter:number = -1;
    private _answerScriptLists:string[] = [];       //返答の内容。まだページ分けしていないデータ
    private _ansBtn_A:AnsButton = null;
    private _ansBtn_B:AnsButton = null;


    private readonly SPEAKER_START:number = 0;      //最初の会話
    private readonly SPEAKER_CAHNGE:number = 1;      //会話をする人物を交代
    private readonly SPEAKER_SAME:number = 2;      //同じ人物が会話

    public static readonly EFFECT_GUCHA:number = 1;       //ぐちゃぐちゃマーク
    public static readonly EFFECT_BIKKURI:number = 2;     //びっくりマーク
    //あれ？怒りマークは？？
    
    public static readonly CHAR_NARRATION:number = 0;      //ナレーション
    public static readonly CHAR_IJIN:number = 1;      //偉人
    public static readonly CHAR_PLAYER:number = 2;      //自分
    //public static readonly CHAR_KEEP:number = 3;

    private static readonly BOARD_COLOR_PLAYER:cc.Color = cc.color(239, 139, 255);
    private static readonly BOARD_COLOR_NARATION:cc.Color = cc.color(105, 105, 144);


    
    public setup(ijinScreen:IjinScreen, canvas:cc.Node):void
    {
        this._ijinScreen = ijinScreen;
        this._canvas = canvas;

        this.messageWindow.active = false;
        this.nextIconNode.active = false;
        this.effectIconSprite.node.active = false;
        this.btnSkip.node.active = StaticData.DEVELOP_MODE;     //デベロップモードだけスキップボタンを表示

        this._talkCharacter = -1;       //未設定


        let textFormat:STFormat = STFormat.create(
        {
            size: 36,
            margin: 2,
            lineHeight: 80,
            rows: 4,
            columns: 16,
            horizontalAlign: SchoolText.HORIZONTAL_ALIGH_AREA_LEFT,
            verticalAlign: SchoolText.VERTICAL_ALIGN_TOP,
            color: cc.color(0, 0, 0),
            yomiganaSize: 20,
            yomiganaMarginY: 2
        });
        this.messageOutput.createText("", textFormat);
    }


    /**
     * 文字数ごとのフォーマットを返す
     */
    private _getNameTextFormatForLength(nameLength:number):STFormat
    {
        let sizes:number[] = [36,36,36,36,36,36, 32, 30, 26];
        if(nameLength >= sizes.length) nameLength = sizes.length - 1;
        
        let format:STFormat = STFormat.create(
        {
            size: sizes[nameLength],
            margin: 2,
            lineHeight: 40,
            rows: 1,
            columns: 10,
            horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CENTER,
            verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
            color: cc.color(255, 255, 255),
            yomiganaSize: 20,
            yomiganaMarginY: 2
        });
        
        return format;
    }





    /**
     * <callback>タグで汎用的なコールバックを返す
     * @param callback 
     */
    public onStoryCommonCallback(callback:(code:string, subCode:string)=>void):void
    {
        this._storyCommonCallback = callback;
    }
    

    //使ってるの？？？
    public hideIjinImage():void
    {
        this._ijinScreen.hide();
    }


    public setupStory(charaName:string, script:string):void
    {
        this._ijinName = charaName;

        let h = SchoolText.getTextString(charaName);
        this._ijinNameLength = h.textStr.length;

        //cutinタグとcutoutタグを探す。cutinタグが先にある場合は偉人は初期表示しない
        let cutinTagIndex:number = script.indexOf("<cutin>");
        let cutoutTagIndex:number = script.indexOf("<cutout>");

        
        let showIjinFirst:boolean;
        if(cutinTagIndex == -1) showIjinFirst = true;   //カットインが無いパターン。カットアウトは有無両方
        else if(cutoutTagIndex == -1) showIjinFirst = false;   //カットインがあり、カットアウトが無いパターン
        else    //カットインとカットアウトの両方あるパターン
        {
            //cutoutタグが先にあるなら偉人表示、cutinタグが先なら偉人を表示しない
            showIjinFirst = (cutoutTagIndex < cutinTagIndex);
        }

        if(showIjinFirst) this._ijinScreen.show();
        else this._ijinScreen.hide();

        //---------------------------------------

        this._createSpeitesFromText(script, -1);
        
        if(this._scripts.length == 0)
        {
            this._scripts = [script];
            this._talkChars = [StoryScreen.CHAR_NARRATION];
        }
    }


    private _createSpeitesFromText(script:string, insertIndex:number = -1):void
    {
        cc.log(script);

        //------

        let index:number = 0;
        let scripts:string[] = [];
        let chars:number[] = [];

        //有効なエフェクトタグ
        let effectTags:string[] = [
            "ijin_buruburu", "ijin_bikkuri", "cutin", "cutout", "coin", "select", "ijin_color", "ijin_big", "ijin_small", "ijin_ikari", "callback"];

        while(index < script.length)
        {
            if(script.charAt(index) != "<")
            {
                index ++;
                continue;
            }

            index ++
            let closeIndex:number = script.indexOf(">", index);
            let tagStr:string = script.substr(index, closeIndex - index);
            let tagParams:string[] = tagStr.split(",");
            let tag:string = tagParams[0];

            cc.log("<" + tagStr + ">");
            index = closeIndex + 1;


            //cutinやcoinなどのタグを一気にチェック
            let effectTagIndex:number = effectTags.indexOf(tag);
            if(effectTagIndex > -1)
            {
                scripts.push("<" + tagStr + ">");
                chars.push(-1);    //この処理は走らないのでなんでもいい
            }
            //話してる人のタグの場合、閉じるまでが１つの文章
            else if(tag == "y" || tag == "i" || tag == "n")
            {
                let closeTag:string = "</" + tag + ">";     //この文章の終了タグ
                let endMsgIndex:number = script.indexOf(closeTag, index);
                let sentence:string = script.substr(index, endMsgIndex - index);        //文章(他のタグは含む)
                cc.log(sentence);

                scripts.push(sentence);
                
                if(tag == "y") chars.push(StoryScreen.CHAR_PLAYER);
                else if(tag == "i") chars.push(StoryScreen.CHAR_IJIN);
                else chars.push(StoryScreen.CHAR_NARRATION);
                
                index = endMsgIndex + 1;
            }
            //選択肢
            else if(tag == "answer")
            {
                let closeTag:string = "</" + tag + ">";     //この文章の終了タグ
                let endMsgIndex:number = script.indexOf(closeTag, index);
                let sentence:string = script.substr(index, endMsgIndex - index);        //文章(他のタグは含む)

                //返答リストにそのまま入れておく
                this._answerScriptLists.push(sentence);

                index = endMsgIndex + 1;
            }
            /*
            else if(tag == "ijin_buruburu" || tag == "ijin_bikkuri" || tag == "cutin")
            {
                scripts.push("<" + tag + ">");
                chars.push(-1);    //この処理は走らないのでなんでもいい
            }
            */

            //if(tag == "f")
        }

        cc.log("------------------------");

        cc.log(scripts);
        cc.log(chars);

        if(scripts.length == 0) return;

        if(insertIndex == -1)
        {
            this._scripts = scripts;
            this._talkChars = chars;
        }
        else
        {
            //配列の間に配列を挿入する
            let sp:any[] = scripts;
            Array.prototype.splice.apply(this._scripts,[insertIndex,0].concat(sp));
            Array.prototype.splice.apply(this._talkChars,[insertIndex,0].concat(chars));
        }
    }



    public skipAll():void
    {
        this._stopAllActions();
        this.backCoverNode.off(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        this._storyPage = this._scripts.length - 1;

        //偉人が表示されてない場合があるので表示する
        this._ijinScreen.show();

        this._onTouchBegan(null);
    }




    public onComplete(callback:()=>void)
    {
        this._completeCallback = callback;
    }


    public startStory():void
    {
        this.nameOutput.resetText();
        this.nextIconNode.active = false;
        
        this.messageWindow.scaleY = 0;
        this.messageWindow.active = true;

        this._storyPage = 0;        //追加(2021/04/01)

        let page:number = this._storyPage;
        
        this._rollMessage(this._talkChars[page], this._scripts[page]);
    }



    /**
     * メッセージウィンドウを表示
     * @param appearType （0..初期の表示、1..話す人が入れ替わり、2..同じ人が話す）
     * @param isIjin 偉人かどうか。名前ウィンドウの位置に影響
     * @param message 話す内容
     * @param effect エフェクト番号
     */
    private _rollMessage(character:number, message:string):void
    {
        if(message == null || message == undefined || message == "")
        {
            cc.log("表示するメッセージがないよ");
            return;
        }
        
        
        //特殊な命令
        if(message.charAt(0) == "<")
        {
            let datas:string[] = message.substr(1, message.length - 2).split(",");
            let func:string = datas[0];

            //選択ボタンを出す
            if(func == "select")
            {
                if(datas.length > 3)
                {
                    //フリガナの{,}も含めるのでもう一度分割しなおす
                    let newDatas:string[] = [datas[0]];
                    for(let i:number = 1 ; i < datas.length ; i ++)
                    {
                        if(datas[i].indexOf("{") > -1)
                        {
                            newDatas.push(datas[i] + "," + datas[i+1]);
                            i ++;
                        }
                        else
                        {
                            newDatas.push(datas[i]);
                        }
                    }
                    datas = newDatas;
                }
                
                this._showSelectButtons(datas[1], datas[2]);
                return;
            }
            //偉人がカットイン
            else if(func == "cutin")
            {
                this._ijinScreen.show(true);
                this._nextPage();

                //↓　こっちじゃないとアニメーションが止まるやつがある。要対応

                //this._storyPage ++;
                //let page:number = this._storyPage;
                //this._rollMessage(this._talkChars[page], this._scripts[page]);
                return;
            }
            //偉人がカットアウト
            else if(func == "cutout")
            {
                this._ijinScreen.hide(true);
                this._nextPage();
                return;
            }
            //偉人がブルブルする
            else if(func == "ijin_buruburu")
            {
                //偉人が横にぶるぶる
                this._ijinScreen.ijinActionBuruburu();

                //アイコン
                this.effectIconSprite.node.active = true;
                this.effectIconSprite.spriteFrame = this.guchaSpriteFrame;
                this.effectIconSprite.node.scale = 0.3;
                this.effectIconSprite.node.runAction(
                    cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut())
                );

                this._nextPage();
                return;
            }
            else if(func == "ijin_bikkuri")
            {
                //偉人がビックリする
                this._ijinScreen.ijinActionBikkuri();

                //アイコン
                this.effectIconSprite.node.active = true;
                this.effectIconSprite.spriteFrame = this.bikkuriSpriteFrame;
                this.effectIconSprite.node.scale = 0.3;
                this.effectIconSprite.node.runAction(
                    cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut())
                );

                this._nextPage();
                return;
            }
            else if(func == "ijin_ikari")
            {
                //偉人がビックリする
                this._ijinScreen.ijinActionBikkuri();
                
                //アイコン
                this.effectIconSprite.node.active = true;
                this.effectIconSprite.spriteFrame = this.ikariSpriteFrame;
                this.effectIconSprite.node.scale = 0.3;
                this.effectIconSprite.node.runAction(
                    cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut())
                );

                this._nextPage();
                return;
            }
            else if(func == "ijin_color")
            {
                //偉人が赤くなる
                let color:cc.Color = cc.color(Number(datas[1]), Number(datas[2]), Number(datas[3]));
                this._ijinScreen.ijinActionColor(color, 0.2);
                this._nextPage();
                return;
            }
            else if(func == "ijin_big")
            {
                //偉人が一瞬大きくなる
                this._ijinScreen.ijinActionBig();
                this._nextPage();
                return;
            }
            else if(func == "ijin_small")
            {
                //偉人が一瞬小さくなる
                this._ijinScreen.ijinActionSmall();
                this._nextPage();
                return;
            }
            else if(func == "callback")
            {
                //汎用コールバック
                let subCode:string = datas.length >= 3 ? datas[2] : "";
                this._storyCommonCallback(datas[1], subCode);

                if(datas[datas.length - 1] != "stop")
                {
                    //ページ送りする
                    this._nextPage();
                }
                return;
            }
            else
            {
                // fタグなどの文字装飾に関するタグはここ
            }
        }
        
        

        let appearType:number = -1;
        if(this._talkCharacter == -1) appearType = this.SPEAKER_START;
        //else if(character == StoryScreen.CHAR_KEEP) {}
        else if(this._talkCharacter == character) appearType = this.SPEAKER_SAME;
        else appearType = this.SPEAKER_CAHNGE;

        this._talkCharacter = character;

        //話す人の効果音
        let talkSE:cc.AudioClip;
        if (! SE.SE_Enabled) talkSE = null;
        else if (this._talkCharacter == StoryScreen.CHAR_NARRATION) talkSE = null;
        else if (this._talkCharacter == StoryScreen.CHAR_PLAYER) talkSE = this.talkPlayerSE;
        else if (this._talkCharacter == StoryScreen.CHAR_IJIN) talkSE = this.talkIjinSE;



        // 初期の表示 or 話す人が入れ替わり
        if(appearType == this.SPEAKER_START || appearType == this.SPEAKER_CAHNGE)
        {
            this.messageOutput.setText("");
            
            if(appearType == this.SPEAKER_CAHNGE) this.messageWindow.scale = 0.9;
            else if(appearType == this.SPEAKER_START) this.messageWindow.active = true;       //一度closeWindow()で閉じてる場合非表示になっている

            this.messageWindow.runAction(
                cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut())
            );
        }
        // 同じ人が話す
        else if(appearType == this.SPEAKER_SAME)
        {
            //ウィンドウは動かず、テキストが上に流れる
            this.messageOutput.node.runAction(
                cc.moveTo(0.3, cc.v2(0, 370))
            );
        }

        //名前ウィンドウの表示
        if(appearType == this.SPEAKER_SAME)
        {
            //同じ人が話すのでウィンドウや名前はそのまま
        }
        else if(character == StoryScreen.CHAR_NARRATION)
        {
            this.nameOutput.node.parent.active = false;

            //色を変える
            this.messageBoardSprite.node.color = StoryScreen.BOARD_COLOR_NARATION;
            this.messageOutput.setColorFromFormat(cc.Color.WHITE);
        }
        else
        {
            let speakerName:string = (character == StoryScreen.CHAR_IJIN) ? this._ijinName : "あなた";
            let speakerLen:number = (character == StoryScreen.CHAR_IJIN) ? this._ijinNameLength : speakerName.length;
            
            this.nameOutput.resetText();
            this.nameOutput.createText(speakerName, this._getNameTextFormatForLength(speakerLen));
            this.nameOutput.hideText();
            this.nameOutput.flushText();
            this.nameOutput.node.parent.x = (character == StoryScreen.CHAR_IJIN) ? -230 : 230;
            this.nameOutput.node.parent.active = true;

            //色を変える
            this.messageBoardSprite.node.color = (character == StoryScreen.CHAR_IJIN) ? cc.Color.WHITE : StoryScreen.BOARD_COLOR_PLAYER;
            this.messageOutput.setColorFromFormat(cc.Color.BLACK);
        }

        // オムロンで使うかもしれないので一応残す
        //メッセージ内で特定のワードを置き換える(__NAME__ をプレーヤー名に)
        // message = message.replace(/__NAME__/g, StaticData.playerData.nickname);

        
        this.node.runAction(
            cc.sequence(
                cc.delayTime(0.3),
                cc.callFunc(()=>
                {
                    if(appearType == this.SPEAKER_SAME)
                    {
                        this.messageOutput.node.stopAllActions();
                        this.messageOutput.node.y = 0;
                    }

                    this.messageOutput.setText(message);
                    this.messageOutput.hideText();
                    this.messageOutput.setTextSE(talkSE);       //効果音を設定
                }),
                cc.delayTime(0.2),
                cc.callFunc(()=>
                {
                    this.messageOutput.showText(()=>
                    {
                        //背景タップに変更してみた(2021/3/3)
                        this.backCoverNode.once(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
                        this.nextIconNode.active = true;
                    });
                })
            )
        );
    }



    /**
     * 画面タップ時、ストーリー送り
     * @param event 
     */
    private _onTouchBegan(event:cc.Event.EventTouch):void
    {
        //TapEffect.instance().setParticeFromEvent(event);
        
        this.nextIconNode.active = false;

        //エフェクトの動きを消す
        this._ijinScreen.ijinStopAction();
        this.effectIconSprite.node.active = false;

        this._nextPage();
    }


    private _nextPage():void
    {
        this._storyPage ++;

        if(this._storyPage == this._scripts.length)
        {
            this.messageOutput.setText("");
            this.nameOutput.node.parent.active = false;
            this.btnSkip.node.active = false;

            //偉人が表示されてない場合があるので表示する
            this._ijinScreen.show();

            this.messageWindow.runAction(
                cc.sequence(
                    cc.scaleTo(0.3, 1, 0).easing(cc.easeBackOut()),
                    cc.callFunc(()=>
                    {
                        this.messageWindow.active = false;

                        //終了、コールバック
                        this._completeCallback();
                    })
                )
            );
        }
        else
        {
            let page:number = this._storyPage;
            this._rollMessage(this._talkChars[page], this._scripts[page]);
        }
    }


    public onPressBackCoverButton(event:any):void
    {
        TapEffect.instance().setParticeFromEvent(event);
    }



    public onPressSkipButton(event:any):void
    {
        this.skipAll();
    }


    private _stopAllActions():void
    {
        this.node.stopAllActions();
        this.messageWindow.stopAllActions();
        this.messageOutput.node.stopAllActions();
        this._ijinScreen.ijinStopAction();
        this.effectIconSprite.node.stopAllActions();
    }



    public resumeNextPage():void
    {
        this._nextPage();
    }

    public closeWindow(hideText:boolean, callback:()=>void):void
    {
        if(hideText)
        {
            this.messageOutput.resetText();
            this.nameOutput.node.parent.active = false;
        }

        cc.tween(this.messageBoardSprite.node)
        .to(0.3, { color:cc.Color.WHITE } )
        .start();

        this.messageWindow.runAction(
            cc.sequence(
                cc.scaleTo(0.3, 1, 0).easing(cc.easeBackOut()),
                cc.callFunc(()=>
                {
                    this.messageWindow.active = false;
                    //終了、コールバック
                    callback();
                })
            )
        );

        this._talkCharacter = -1;        //いったん話中の人をリセット
    }

    public openWindow(callback:()=>void):void
    {
        this.messageWindow.active = true;
        this.messageWindow.scaleY = 0;
        
        this.messageWindow.runAction(
            cc.sequence(
                cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()),
                cc.callFunc(()=>
                {
                    //終了、コールバック
                    callback();
                })
            )
        );
    }






    public setButtonPrefab(prefab:cc.Prefab):void
    {
        this._selBtnPrefab = prefab;
    }

    private _showSelectButtons(wordA:string, wordB:string):void
    {
        //ボタンに表示するフォントの取得
        let qfNode:cc.Node = cc.instantiate(this.questionFontPrefab);
        let stFont:STFont = qfNode.getComponent(STFont);
        
        //ボタン２つを作成
        let node:cc.Node = cc.instantiate(this._selBtnPrefab);
        node.y = -270;
        this.node.addChild(node);
        this._ansBtn_A = node.getComponent(AnsButton);
        this._ansBtn_A.setup(0, wordA, undefined, stFont);
        this._ansBtn_A.lock(true);
        this._ansBtn_A.showButton();
        
        node = cc.instantiate(this._selBtnPrefab);
        node.y = -410;
        this.node.addChild(node);
        this._ansBtn_B = node.getComponent(AnsButton);
        this._ansBtn_B.setup(0, wordB, undefined, stFont);
        this._ansBtn_B.lock(true);
        this._ansBtn_B.showButton();


        this._ansBtn_A.onSelectCallback((button:AnsButton)=>
        {
            this._onSelectedButton(0);
        });

        this._ansBtn_B.onSelectCallback((button:AnsButton)=>
        {
            this._onSelectedButton(1);
        });

        cc.tween({})
        .delay(0.75)
        .call(()=>
        {
            this._ansBtn_A.lock(false);
            this._ansBtn_B.lock(false);
        })
        .start();

        //ウィンドウを選択色にする
        cc.tween(this.messageBoardSprite.node)
        .to(0.0, { color:cc.Color.WHITE })
        .to(0.5, { color:cc.color(255, 255, 128) })
        .start();

        //会話しているキャラをリセット（選択後のウィンドウ色のため）
        this._talkCharacter = -1;
    }


    private _onSelectedButton(id:number):void
    {
        this._ansBtn_A.node.removeFromParent(true);
        this._ansBtn_A = null;

        this._ansBtn_B.node.removeFromParent(true);
        this._ansBtn_B = null;

        //_answerScriptListsから該当する文章を取得し（先頭か頭から2番目のどちらか）
        //１つずつ文章として展開、_scriptsと_charsに挿入する

        let sentence:string = this._answerScriptLists[id];
        this._answerScriptLists.shift();
        this._answerScriptLists.shift();

        this._createSpeitesFromText(sentence, this._storyPage + 1);

        this._onTouchBegan(null);
    }




    
}
