import BitmapNum from "../common/BitmapNum";
import BugTracking from "../common/BugTracking";
import { CPUData, GetGameItem, GoribenItem, OpponentCPU, PlayerData } from "../common/Models";
import PlayTrackLog from "../common/PlayTrackLog";
import SchoolAPI from "../common/SchoolAPI";
import SE from "../common/SE";
// import GhostScreen from "../introduction/GhostScreen";
import StaticData, { EasingName } from "../StaticData";
import GameMain from "./GameMain";
import IjinScreen from "./IjinScreen";

const {ccclass, property} = cc._decorator;


@ccclass("ItemButtonImage")
class ItemButtonImage
{
    @property(cc.Integer) ID:number = 0;
    @property(cc.SpriteFrame) onSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) offSpriteFrame:cc.SpriteFrame = null;
}



@ccclass
export default class VSScreen extends cc.Component {

    @property(cc.Node) vsNode:cc.Node = null;
    @property(cc.Node) itemBoardNode: cc.Node = null;
    @property(cc.Node) itemBoardScrollNode: cc.Node = null;
    @property(cc.Node) statusBoardNode: cc.Node = null;
    @property(cc.Node) statusBoardScrollNode: cc.Node = null;
    @property(cc.Label) ijinNameOutput: cc.Label = null;
    @property(BitmapNum) ijinPowerCounter: BitmapNum = null;
    @property(cc.Sprite) ijinIcon: cc.Sprite = null;
    @property(cc.Sprite) ijinPowerIcon: cc.Sprite = null;
    @property(cc.Label) userNameOutput: cc.Label = null;
    @property(BitmapNum) userPowerCounter: BitmapNum = null;
    @property(cc.Sprite) userIcon: cc.Sprite = null;
    @property(cc.Node) userPowerIcon: cc.Node = null;
    @property(cc.Sprite) userPowerIconSprite: cc.Sprite = null;
    @property(cc.Sprite) powerBar:cc.Sprite = null;
    @property(cc.Node) powerGageBase:cc.Node = null;

    @property(BitmapNum) haveCoinCounter: BitmapNum = null;
    @property(cc.Button) itemBtns: cc.Button[] = [];
    @property(BitmapNum) priceCounters: BitmapNum[] = [];
    @property(cc.Label) nameOutputs: cc.Label[] = [];
    @property(cc.Button) btnZishu: cc.Button = null;
    @property(cc.Button) btnStart: cc.Button = null;
    @property(cc.Label) zishuAdviceOutput:cc.Label = null;
    @property(cc.Label) challengeAdviceOutput:cc.Label = null;
    @property(cc.Node) zishuUpIconNode:cc.Node = null;
    @property(cc.Node) zishuGradeNode:cc.Node = null;
    @property({ type:cc.AudioClip }) seVSMark: cc.AudioClip = null;
    @property({ type:cc.AudioClip }) sePowerGage: cc.AudioClip = null;
    @property({ type:cc.AudioClip }) seNotUseItem: cc.AudioClip = null;
    @property({ type:cc.AudioClip }) seStartBtn: cc.AudioClip = null;
    @property({ type:cc.AudioClip }) bgmAudioChip: cc.AudioClip = null;
    // @property(cc.Prefab) ghostScreenPrefab:cc.Prefab = null;
    @property(ItemButtonImage) itemBtnImages:ItemButtonImage[] = [];
    @property(cc.Node) guideScreens:cc.Node[] = [];


    private _canvas:cc.Canvas = null;
    private _camera:cc.Camera = null;
    private _ijinScreen: IjinScreen = null;
    private _itemSelectedCallback:(itemIDs:number[], code:string)=>void = null;
    private _selectedItem:boolean[] = [ false, false, false, false ];
    private _powerBarance:number[] = [ 100, 50, 100, 150 ];      //正解、ノーヒント、スピード、コンボ
    private _haveCoin:number = 0;       //初期のコイン数。可変させない
    private _rivalIjinScore:number = 0;
    private _ijinPowerHukidashi:cc.Node = null;
    private _itemDatas:GoribenItem[] = null;
    private _showCompleteCallback:()=>void = null;
    private _selectMenuCallback:()=>void = null;
    private _seID_powerGage:number = -1;
    private _finishScreenNode:cc.Node = null;

    private _OFFLINE_TEST:boolean = false;      //定数ではないので注意
    private _COLOR_UP:cc.Color = cc.color(0, 255, 255);
    private _COLOR_DOWN:cc.Color = cc.color(255, 0, 0);
    private _BAR_COLORS:cc.Color[] =
    [
        cc.color(135,40,225), cc.color(115,71,229), cc.color(100,95,232), cc.color(84,121,236), cc.color(67,148,240),
        cc.color(53,170,243), cc.color(38,194,246), cc.color(29,209,248), cc.color(20,224,250), cc.color(12,236,252),
        cc.color(0,255,255), cc.color(52,252,203), cc.color(98,249,157), cc.color(146,246,109), cc.color(197,243,58), cc.color(255,240,0)
    ];



    
    /**
     * 単体テストにする
     */
    public offlineTest():void
    {
        this._OFFLINE_TEST = true;
    }


    public setCanvasAndCamera(canvas:cc.Canvas, camera:cc.Camera):void
    {
        this._canvas = canvas;
        this._camera = camera;
    }


    /**
     * 表示演出完了時のコールバック
     * @param callback 
     */
    public onShowComplete(callback:()=>void):void
    {
        this._showCompleteCallback = callback;
    }

    /**
     * 修行か挑戦ボタンを押した直後のコールバック
     * @param callback 
     */
    public onSelectVSMenu(callback:()=>void):void
    {
        this._selectMenuCallback = callback;
    }


    
    /**
     * VS画面の表示
     * @param storyIjinSprite 
     * @param callback 
     */
    public showVS(canvasNode:cc.Node, ijinScreen:IjinScreen, finishScreenNode:cc.Node, callback:(itemIDs:number[], code:string)=>void):void
    {
        PlayTrackLog.add("VSScreen.showVS()");
        
        SE.bgmStop();
        
        this._ijinScreen = ijinScreen;
        this._itemSelectedCallback = callback;
        this._finishScreenNode = finishScreenNode;

        let widget:cc.Widget = this.itemBoardNode.getComponent(cc.Widget);
        widget.target = canvasNode;
        widget.bottom = 0;

        widget = this.statusBoardNode.getComponent(cc.Widget);
        widget.target = canvasNode;
        widget.bottom = 0;

        this._rivalIjinScore = StaticData.ijinData.target_score;
        this.zishuAdviceOutput.string = StaticData.opponentCPUs.try_num_to_level_up + "";
        this.challengeAdviceOutput.string = StaticData.opponentCPUs.progress_words;

        // ステータス部分
        this._ijinPowerHukidashi = this.ijinPowerIcon.node.parent;
        this.ijinNameOutput.string = StaticData.ijinData.displayName;
        this.ijinPowerCounter.resetNum();
        this.ijinIcon.spriteFrame = StaticData.ijinData.iconSpriteFrame;
        this.ijinPowerIcon.spriteFrame = StaticData.ijinData.iconSpriteFrame;
        this.userNameOutput.string = StaticData.playerData.nickname;
        this.userPowerCounter.resetNum();
        this.userIcon.spriteFrame = StaticData.playerData.iconSpriteFrame;
        this.userPowerIconSprite.spriteFrame = StaticData.playerData.iconSpriteFrame;

        this._ijinPowerHukidashi.active = false;
        this._ijinPowerHukidashi.x = -180;
        this.userPowerIcon.active = false;
        this.userPowerIcon.x = -180;
        this.powerBar.fillRange = 0;
        this.powerGageBase.color = cc.color(128, 128, 128);
        this.powerBar.node.color = cc.Color.WHITE;

        


        //基本の点数に経験値ブーストをかける
        for(let i:number = 0 ; i < 4 ; i ++)
        {
            //this._powerBarance[i] = Math.floor(this._powerBarance[i] * playerData.score_magnification);

            // XX.999999999 みたいになることがあるので四捨五入にした
            //this._powerBarance[i] = Math.round(this._powerBarance[i] * StaticData.playerData.score_magnification);

            //演算精度の問題で少数第2位以下が発生する可能性あり（ここでは気にしない）
            this._powerBarance[i] = this._powerBarance[i] * StaticData.playerData.score_magnification;
        }


        //this._myPower = Math.floor(400 * scoreMagnification);
        
        this.itemBoardNode.active = false;
        this.statusBoardNode.active = false;
        this.btnZishu.node.active = false;
        this.btnStart.node.active = false;
        //this.zishuAdviceNode.active = false;
        this.zishuUpIconNode.active = false;
        //this.challengeAdviceNode.active = false;

        

        //偉人が右に移動
        this._ijinScreen.ijinMoveTo(cc.v2(180, IjinScreen.Y_STORY), 0.3);

        // VSの文字が出てくる
        this.vsNode.scale = 0.0;
        this.vsNode.runAction(
            cc.sequence(
                cc.delayTime(0.7),
                cc.callFunc(()=>
                {
                    SE.play(this.seVSMark);
                }),
                cc.scaleTo(0.0, 5.0),
                cc.scaleTo(0.3, 1.0).easing(cc.easeInOut(2.0)),
                cc.delayTime(1.0),
                cc.callFunc(()=>
                {
                    // 演出終了
                    //callback();

                    this._feedOutSubRivals();
                })
            )
        );

        for(let i:number = 0 ; i < this.guideScreens.length ; i ++)
        {
            let widget:cc.Widget = this.guideScreens[i].getComponent(cc.Widget);
            widget.target = canvasNode;
            widget.bottom = 0;
        }

    }


    private _feedOutSubRivals():void
    {
        //BGMの再生スタート
        SE.bgmStart(this.bgmAudioChip);
        
        // VSの文字が消える
        this.vsNode.runAction(
            cc.sequence(
                cc.scaleTo(0.2, 0.0),
                cc.removeSelf()
            )
        );

        //ステータスが左から出てくる
        this.statusBoardScrollNode.x = -900;
        this.statusBoardNode.active = true;
        this.statusBoardScrollNode.runAction(
            cc.sequence(
                cc.moveTo(0.3, -375, this.statusBoardScrollNode.y).easing(cc.easeInOut(2.0)),
                cc.delayTime(0.2),
                cc.callFunc(()=>{ this._upIjinPower(); })
            )
        );
    }


    private _upIjinPower():void
    {
        let seID:number = -1;
        seID = SE.play(this.sePowerGage, true);
        
        //偉人のパワーがたまる
        this.node.runAction(
            cc.sequence(
                cc.valueTo(0.75, 0, 1, (value:number)=>
                {
                    let power:number = Math.floor(value * StaticData.ijinData.target_score);
                    this.ijinPowerCounter.num = power;
                    this._ijinPowerHukidashi.active = true;
                    this._ijinPowerHukidashi.x = -180 + 360 * value;
                    //白ゲージがマックスまでたまる
                    this.powerBar.fillRange = value;

                }).easing(cc.easeInOut(1.0)),
                cc.callFunc(()=>
                {
                    SE.stop(seID);
                })
            )
        );
        
        //あとから自分のパワーがたまる
        let playerMaxPower:number = StaticData.playerData.maxPower;
        let pPer:number = playerMaxPower / StaticData.ijinData.target_score;
        let seID_2:number = -1;

        this.node.runAction(
            cc.sequence(
                cc.delayTime(1.0),
                cc.callFunc(()=>
                {
                    this.powerBar.fillRange = 0;
                    this.powerBar.node.color = cc.color(97,89,189);     //今は仮の色
                    this.powerGageBase.color = cc.Color.WHITE;

                    seID_2 = SE.play(this.sePowerGage, true);
                }),
                cc.valueTo(0.75, 0, pPer, (value:number)=>
                {
                    //この方法だと端数が出るので超えた場合に修正(偉人のスコア基準で自分のパワーを求めているので端数は仕方がない)
                    let power:number = Math.floor(value * StaticData.ijinData.target_score);
                    if(power > playerMaxPower) power = playerMaxPower;
                    this.userPowerCounter.num = power;

                    let iconXVal:number = (value > 1) ? 1 : value;
                    this.userPowerIcon.active = true;
                    this.userPowerIcon.x = -180 + 360 * iconXVal;

                    this.powerBar.fillRange = iconXVal;
                    this._setBarColor(value);
                    
                }).easing(cc.easeInOut(1.0)),
                cc.callFunc(()=>
                {
                    //上昇中に端数が出る可能性があるので最後に入れなおす
                    this.userPowerCounter.num = playerMaxPower;
                    
                    //自分のてんさいパワーに端数
                    if(this.userPowerCounter.num % 10 != 0)
                    {
                        BugTracking.notify("VS画面のてんさいパワー端数エラー", "VSScreen._upIjinPower()",
                        {
                            msg:"VS画面のてんさいパワー端数エラー (score_magnification : " + StaticData.playerData.score_magnification + ")",
                            tensaiPower:this.userPowerCounter.num,
                            score_magnification:StaticData.playerData.score_magnification,
                            current_level:StaticData.playerData.level
                        });
                    }
                    
                    SE.stop(seID_2);
                }),
                cc.delayTime(0.2),
                cc.callFunc(()=>{ this._itemGetAPI(); })
            )  
        );
    }



    private _itemGetAPI():void
    {
        SchoolAPI.getGameItems((response:GetGameItem)=>
        {
            this._haveCoin = response.coin;
            this._itemDatas = response.items;

            this._itemSelect();
        });
    }



    private _itemSelect():void
    {
        // 偉人が中央、やや上に移動
        this._ijinScreen.ijinMoveTo(cc.v2(0, IjinScreen.Y_STORY + 140), 0.5);
        this._ijinScreen.ijinScaleTo(IjinScreen.SCALE_STORY * 1.1, 0.5);


        this.itemBoardScrollNode.y = -400;
        this.itemBoardNode.active = true;

        //アイテム内容を表示
        for(let i:number = 0 ; i < this._itemDatas.length ; i ++)
        {
            this.nameOutputs[i].string = "";//this._itemDatas[i].name;
            this.priceCounters[i].num = this._itemDatas[i].coin;
            this._changeBtnImage(i);        //ボタンの画像を変える
        }

        //アイテム選択ボードが下から登場
        this.itemBoardScrollNode.runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.moveTo(0.3, cc.v2(0,0)).easing(cc.easeIn(2.0)),
                cc.callFunc(()=>
                {
                    this.btnZishu.node.active = true;
                    this.btnStart.node.active = true;
                    //this.zishuAdviceNode.active = true;
                    this.zishuUpIconNode.active = true;
                    //this.challengeAdviceNode.active = true;

                    //表示演出完了コールバック
                    if(this._showCompleteCallback != null) this._showCompleteCallback();
                })    
            )
        );

        cc.tween(this.zishuGradeNode)
        .repeatForever(
            cc.tween()
            .to(1.0, {position:cc.v2(0,70)})
            .to(0.0, {position:cc.v2(0,-70)})
        )
        .start();
        


        let resultData:{ boostPower:number, useCoin:number } = this._getBoostPowerAndUseCoin();

        this.haveCoinCounter.resetNum();
        //パワー変更演出
        this._powerChangeAnimation(resultData.boostPower, this._haveCoin - resultData.useCoin);



        //---------------------------------　ガイド表示
        if(StaticData.ijinData.displayName == "ソクラテス")
        {
            this._showGuide(0, ()=>
            {
                this._showGuide(1, ()=>
                {
                    this._showGuide(2, ()=>{});
                });
            });
        }
        
        
    }

    private _showGuide(index, callback:()=>void):void
    {
        this.guideScreens[index].active = true;
        this.guideScreens[index].opacity = 1;
        cc.tween(this.guideScreens[index]).to(0.5, { opacity:255 }).call(()=>
        {
            this.guideScreens[index].once(cc.Node.EventType.TOUCH_END, (event)=>
            {
                callback();
                this.guideScreens[index].active = false;
            });
        })
        .start();
    }


    /**
     * アイテム選択画面で「挑戦」か「修行」を押した
     * @param event 
     * @param code 
     */
    private onPressStartButton(event:any, code:string):void
    {
        //選択時コールバック
        if(this._selectMenuCallback != null) this._selectMenuCallback();

        SE.play(this.seStartBtn);
        
        this.btnZishu.node.active = false;
        this.btnStart.node.active = false;
        //this.zishuAdviceNode.active = false;
        this.zishuUpIconNode.active = false;
        //this.challengeAdviceNode.active = false;
        this.statusBoardNode.active = false;

        let itemIDs:number[] = [];
        for(let i:number = 0 ; i < this._selectedItem.length ; i ++)
        {
            cc.log(this._selectedItem[i]);
            if(this._selectedItem[i]) itemIDs.push(this._itemDatas[i].id);
        }

        //アイテム選択ボードが下に下がる
        cc.tween(this.itemBoardScrollNode)
        .to(0.2, { position:cc.v3(0, -400, 0) }, { easing:'sineIn' })
        .call(()=>
        {
            this.itemBoardNode.active = false;

            SE.bgmStop();

            // 挑戦ボタンを押した
            if(code == "start")
            {
                PlayTrackLog.add("VSScreen:挑戦ボタン押下");
                
                //コールバック
                this._itemSelectedCallback(itemIDs, code);
            }
            // 修行ボタンを押した
            // else if(code == "zishu")
            // {
            //     PlayTrackLog.add("VSScreen:修行ボタン押下");
                
            //     //ゴーストならゴースト登場
            //     SchoolAPI.ghostModeFlag((response:any)=>
            //     {
            //         //ゴーストモード
            //         let ghostModeFlag:Boolean = false;      //APIエラーでresponseがnullの場合、false固定

            //         if(response != null) ghostModeFlag = response.ghost_mode_flag;

            //         if(! ghostModeFlag)
            //         {
            //             //コールバック
            //             this._itemSelectedCallback(itemIDs, code);
            //             return;
            //         }

            //         cc.log("ゴースト出現");
            //         PlayTrackLog.add("ゴースト出現");

            //         //ゴースト出現演出とうんこ先生との会話
            //         let ghostScreenNode:cc.Node = cc.instantiate(this.ghostScreenPrefab);
            //         this.node.addChild(ghostScreenNode);
            //         let ghostScreen:GhostScreen = ghostScreenNode.getComponent(GhostScreen);
            //         ghostScreen.setup(this._canvas, this._camera, this._finishScreenNode, ()=>
            //         {
            //             //コールバック
            //             code = "ghost";
            //             this._itemSelectedCallback(itemIDs, code);      //showVS()で受け取ったコールバックへ戻る
            //         });
            //     });
            // }
        })
        .start();

    }


    //なんの意味もない
    public endVSScreen(callback:()=>void):void
    {
        this.vsNode.active = false;     //もう消えてるから意味ない

        this.node.runAction(
            cc.sequence(
                cc.delayTime(0.8),
                cc.callFunc(()=>
                {
                    callback();
                })
            )
        );
    }


    /**
     * アイテム選択、選択解除時
     * @param event 
     * @param code 
     */
    private onPressItemButton(event:any, code:string):void
    {
        //とりあえず選択状態の変更
        let index:number = Number(code);
        this._selectedItem[index] = ! this._selectedItem[index];

        //結果のパワーと消費コインを出す
        let resultData:{ boostPower:number, useCoin:number } = this._getBoostPowerAndUseCoin();
        let lastCoin:number = this._haveCoin - resultData.useCoin;      //残りコイン

        //コインが不足してたら変更をもう一度戻して終わり
        if(this._haveCoin < resultData.useCoin)
        {
            this._selectedItem[index] = ! this._selectedItem[index];        //選択前に戻す

            SE.play(this.seNotUseItem);

            event.target.scale = 1.2;
            cc.tween(event.target).to(0.3, { scale:1.0 }, { easing:EasingName.backOut }).start();


            return;
        }

        //ボタンのグラフィックを変える
        this._changeBtnImage(index);

        //パワー変更演出
        this._powerChangeAnimation(resultData.boostPower, lastCoin); 
    }


    private _changeBtnImage(index:number)
    {
        let itemID:number = this._itemDatas[index].id;
        
        for(let i:number = 0 ; i < this.itemBtnImages.length ; i ++)
        {
            if(this.itemBtnImages[i].ID == itemID)
            {
                let sprite:cc.Sprite = this.itemBtns[index].node.getComponent(cc.Sprite);
                sprite.spriteFrame = (this._selectedItem[index]) ? this.itemBtnImages[i].onSpriteFrame : this.itemBtnImages[i].offSpriteFrame;
            }
        }
    }


    private _getBoostPowerAndUseCoin():{ boostPower:number, useCoin:number }
    {
        let useCoin:number = 0;

        let powCorrect:number = this._powerBarance[0];
        let powNoHint:number = this._powerBarance[1];
        let powSpeed:number = this._powerBarance[2];
        let powCombo:number = this._powerBarance[3];
        
        for(let i:number = 0 ; i < this._selectedItem.length ; i ++)
        {
            if(! this._selectedItem[i]) continue;

            let itemData:{id:number, name:string, coin:number} = this._itemDatas[i];

            if (itemData.id == GameMain.ITEM_ID_CORRECT_BONUS_X_2) powCorrect *= 2;
            else if (itemData.id == GameMain.ITEM_ID_NO_HINT_BONUS_X_2) powNoHint *= 2;
            else if (itemData.id == GameMain.ITEM_ID_SPEED_BONUS_X_2) powSpeed *= 2;
            else if (itemData.id == GameMain.ITEM_ID_COMBO_BONUS_X_2) powCombo *= 2;

            useCoin += itemData.coin;
        }

        return {
            boostPower: Math.round(powCorrect + powNoHint + powSpeed + powCombo),
            useCoin: useCoin
        };
    }



    private _powerChangeAnimation(newPower:number, newCoin:number):void
    {
        let prevPower:number = this.userPowerCounter.num;
        let prevCoin:number = this.haveCoinCounter.num;

        //コイン数が変化
        if(prevCoin != newCoin)
        {
            //コインが変化
            this.node.runAction(
                cc.sequence(
                    cc.valueTo(0.3, prevCoin, newCoin, (value:number)=>
                    {
                        this.haveCoinCounter.num = Math.floor(value);
                    }),
                    cc.callFunc(()=>
                    {
                        if(newCoin != this.haveCoinCounter.num)
                        {
                            BugTracking.notify("コイン数ずれ（変数と表示）", "VSScreen._powerChangeAnimation()",
                            {
                                msg:"コイン数の表示にずれがある",
                                coin_val:newCoin,
                                disp:this.haveCoinCounter.num
                            });
                        }
                    })
                )
            );
        }

        //てんさいパワー値に変化なし
        if(prevPower == newPower) return;
        

        //再生中ならそのまま継続
        SE.stop(this._seID_powerGage);
        this._seID_powerGage = SE.play(this.sePowerGage);
        
        //現状、連続で押すと音が消える。このアクションを消せば解決するけどstopAllActionsができないので保留

        
        this.userPowerCounter.node.stopAllActions();
        this.userPowerCounter.node.runAction(
            cc.sequence(
                cc.valueTo(0.3, prevPower, newPower, (value:number)=>
                {
                    //偉人のパワーから見た、ユーザーのパワーの割合
                    let per:number = value / StaticData.ijinData.target_score;
                    
                    //ユーザーのアイコンを移動させる（ゲージ外には出ない）
                    let perValX:number = (per > 1) ? 1 : per;
                    this.userPowerIcon.x = -180 + 360 * perValX;
                    
                    //数値が変化
                    this.userPowerCounter.num = Math.floor(value);

                    //ゲージの長さと色が変化
                    this.powerBar.fillRange = perValX;
                    this._setBarColor(per);
                }),
                cc.callFunc(()=>
                {
                    SE.stop(this._seID_powerGage);

                    this.userPowerCounter.num = newPower;       //端数バグ解消のため

                    if(newPower != this.userPowerCounter.num)
                    {
                        BugTracking.notify("てんさいパワーずれ（変数と表示）", "VSScreen._powerChangeAnimation()",
                        {
                            msg:"てんさいパワーの表示にずれがある",
                            coin_val:newPower,
                            disp:this.userPowerCounter.num
                        });
                    }
                })
            )
        );

        let color:cc.Color = (newPower >= this._rivalIjinScore) ? this._COLOR_UP : this._COLOR_DOWN;

        //プライスの色を変更
        for (let i:number = 0 ; i < this.priceCounters.length ; i ++)
        {
            let counter:BitmapNum = this.priceCounters[i];
            if (this._selectedItem[i]) counter.setColor(cc.Color.WHITE);
            else counter.setColor((newCoin >= this._itemDatas[i].coin) ? cc.Color.WHITE : cc.Color.RED);
        }
    }


    private _setBarColor(per:number):void
    {
        let colIndex:number = Math.floor(per * 10);
        if(colIndex >= this._BAR_COLORS.length) colIndex = this._BAR_COLORS.length - 1;
        this.powerBar.node.color = this._BAR_COLORS[colIndex];
    }

}
