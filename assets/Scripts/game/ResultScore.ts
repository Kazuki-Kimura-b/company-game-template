import BitmapNum from "../common/BitmapNum";
import BugTracking from "../common/BugTracking";
import { SchoolEnd } from "../common/Models";
import PlayerStatusBar from "../common/PlayerStatusBar";
import PlayTrackLog from "../common/PlayTrackLog";
import SchoolAPI from "../common/SchoolAPI";
import SE from "../common/SE";
import StaticData, { EasingName, GameMode } from "../StaticData";
import Result from "./Result";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ResultHayaben extends Result {

    @property(cc.Node) scoreBoard:cc.Node = null;
    @property(BitmapNum) totalScoreCounter:BitmapNum = null;
    @property(cc.Label) prevHighScoreOutput:cc.Label = null;
    @property(BitmapNum) correctScoreCounter:BitmapNum = null;
    @property(BitmapNum) speedScoreCounter:BitmapNum = null;
    @property(BitmapNum) comboScoreCounter:BitmapNum = null;
    @property(BitmapNum) hintScoreCounter:BitmapNum = null;
    @property(BitmapNum) gotCoinCounter:BitmapNum = null;
    @property(BitmapNum) gotExpCounter:BitmapNum = null;
    @property(cc.Button) btnList:cc.Button = null;
    @property(cc.Button) btnRetry:cc.Button = null;
    @property(cc.Button) btnIjinNext:cc.Button = null;
    @property(cc.Button) btnMenu:cc.Button = null;      //ゴリベン用
    @property(cc.Button) btnReTraining:cc.Button = null;      //ハヤベン再トレーニング
    @property(cc.Button) btnGoVS:cc.Button = null;      //ハヤベンからVS
    @property(cc.Button) btnEnd:cc.Button = null;      //ハヤベン用ゲーム終了
    @property(cc.Button) btnGhostClose:cc.Button = null;      //ゴースト閉じるボタン
    @property(cc.Node) renzokuComboNode:cc.Node = null;
    @property(cc.Label) renzokuComboOutput:cc.Label = null;
    @property(cc.Node) gotCoinIcon:cc.Node = null;
    @property(cc.Node) gotCoinText:cc.Node = null;
    @property(cc.Node) gotExpIcon:cc.Node = null;
    @property(cc.Node) gotExpText:cc.Node = null;
    @property(cc.Node) newRecordNode:cc.Node = null;
    @property(cc.Node) goribenItemListNode:cc.Node = null;
    @property(cc.Node) hayabenItemListNode:cc.Node = null;
    @property(cc.Node) ghostItemListNode:cc.Node = null;
    @property(cc.Node) ghostWinNode:cc.Node = null;
    @property(cc.Node) ghostLoseNode:cc.Node = null;
    @property(cc.Node) expUnkoParentNode:cc.Node = null;
    @property(cc.Node) expUpNode:cc.Node = null;
    @property(cc.Node) expGageHige:cc.Node = null;
    @property(cc.Node) expGageMouth:cc.Node = null;
    @property(cc.Node) expBonusNode:cc.Node = null;
    @property(cc.Node) expBonusTextNode:cc.Node = null;
    @property(cc.Node) expBonusUpPerNode:cc.Node = null;
    @property(BitmapNum) expBonusCounter:BitmapNum = null;
    //@property(BitmapNum) expBonusOutlineCounter:BitmapNum = null;
    @property(cc.Sprite) expBonusUnkoSprite:cc.Sprite = null;
    @property(cc.Node) lvUpGokouNodeA:cc.Node = null;
    @property(cc.Node) lvUpGokouNodeB:cc.Node = null;
    @property(cc.Node) lvUpGokouNodeC:cc.Node = null;
    @property(cc.Node) lvUpGlowNode:cc.Node = null;
    @property(cc.Node) lvUpGageNode:cc.Node = null;
    @property(cc.Node) lvUpTextNode:cc.Node = null;
    @property(cc.Node) statusUpNode:cc.Node = null;
    @property(BitmapNum) statusUpPowerCount:BitmapNum = null;
    @property(cc.Label) statusUpPowerOutput:cc.Label = null;
    @property(cc.Node) statusUpCloseIcon:cc.Node = null;
    @property(cc.Node) lvUpBars:cc.Node[] = [];
    @property(cc.SpriteFrame) coinSpriteFrame:cc.SpriteFrame = null;
    @property(cc.SpriteFrame) expUnkoSpriteFrame:cc.SpriteFrame = null;
    @property({type:cc.AudioClip}) seGetCoin:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seGetExpUnko:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seExpBonus:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seExpUp:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seAddScore:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seBtnPress:cc.AudioClip = null;
    @property({type:cc.AudioClip}) seLevelUpGingle:cc.AudioClip = null;
    

    
    private _playerStatusBar:PlayerStatusBar = null;
    private _gotCoinCounterNum:number = 0;
    private _seExpUpID:number = -1;
    private _res:SchoolEnd;
    private _isWin:boolean = false;
    private _oldTensaiPower:number = 0;      //レベルアップ前のてんさいパワー
    private _unkoExpNodes:cc.Node[] = [];       //経験値ゲットで漂ううんこ
    private _lastUnkoImgLoaded:boolean = false;
    private _ijinUnkoSpriteFrame:cc.SpriteFrame = null;

    private static readonly UNKO_EXP_SCALE:number = 0.8;

    
    //override
    public setup(data:any, compCallback:(code:number)=>void):void
    {
        PlayTrackLog.add("ResultScore.setup()");
        
        this._compCallback = compCallback;


        this.expUpNode.active = false;
        this.btnList.node.active = false;
        this.btnRetry.node.active = false;
        this.btnIjinNext.node.active = false;
        this.btnMenu.node.active = false;
        this.btnReTraining.node.active = false;
        this.btnGoVS.node.active = false;
        this.btnEnd.node.active = false;
        this.btnGhostClose.node.active = false;
        this.renzokuComboNode.active = false;
        this.newRecordNode.active = false;
        this.expBonusNode.active = false;


        //APIから受け取ったデータを保持
        this._res = data.response as SchoolEnd;

        //画面上のステータスバー
        this._playerStatusBar = data.playerStatusBar;

        //-----------------------------------------
        // 表示
        //

        if(StaticData.gameModeID == GameMode.GORIBEN)
        {
            this.hayabenItemListNode.active = false;
            this.goribenItemListNode.active = true;
            this.ghostItemListNode.active = false;

            this.newRecordNode.y = 414;
            this.totalScoreCounter.node.y = 340;
            this.prevHighScoreOutput.node.parent.y = 260;
            this.correctScoreCounter.node.y = 168;
            this.speedScoreCounter.node.y = 98;
            this.comboScoreCounter.node.y = 28;
            this.hintScoreCounter.node.y = -42;
            this.btnList.node.y = -171;

            this._isWin = data.isWin;
        }
        else if(StaticData.gameModeID == GameMode.HAYABEN || StaticData.gameModeID == GameMode.GHOST)
        {
            this.hayabenItemListNode.active = true;
            this.goribenItemListNode.active = false;
            this.ghostItemListNode.active = false;

            this.correctScoreCounter.node.y = 206;
            this.speedScoreCounter.node.y = 142;
            this.comboScoreCounter.node.y = 80;


            //レベルアップ前の天才パワー
            this._oldTensaiPower = data.oldTensaiPower;
        }

        this.totalScoreCounter.resetNum();
        this.correctScoreCounter.resetNum();
        this.speedScoreCounter.resetNum();
        this.comboScoreCounter.resetNum();
        this.hintScoreCounter.resetNum();
        this.gotCoinCounter.resetNum();
        this.gotExpCounter.resetNum();

        this.totalScoreCounter.node.active = false;
        this.correctScoreCounter.node.active = false;
        this.speedScoreCounter.node.active = false;
        this.comboScoreCounter.node.active = false;
        this.hintScoreCounter.node.active = false;
        this.gotCoinCounter.node.active = false;
        this.gotExpCounter.node.active = false;
        this.statusUpNode.active = false;
        this.gotCoinIcon.active = false;
        this.gotCoinText.active = false;
        this.gotExpIcon.active = false;
        this.gotExpText.active = false;

        this.scoreBoard.scale = 0;
    }


    /**
     * リザルトの開始
     */
    public startAction():void
    {
        PlayTrackLog.add("ResultScore.startAction()");
        
        let IS_GORIBEN:boolean = (StaticData.gameModeID == GameMode.GORIBEN);
        let IS_HAYABEN:boolean = (StaticData.gameModeID == GameMode.HAYABEN);
        let IS_GHOST:boolean = (StaticData.gameModeID == GameMode.GHOST);
        let IS_HAYABEN_GHOST:boolean = (IS_HAYABEN || IS_GHOST);

        //ハヤベン（修行）の場合ここでうんこ画像を取得し、再起処理をする

        if(IS_HAYABEN_GHOST)
        {
            if(! this._lastUnkoImgLoaded && this._res.acquired_newest_ijin_unko_file_url != null)
            {
                SchoolAPI.loadImage("last_unko", this._res.acquired_newest_ijin_unko_file_url, (response:any)=>
                {
                    this._lastUnkoImgLoaded = true;
                    this._ijinUnkoSpriteFrame = (response.image) ? response.image : null;
                    this.expBonusUnkoSprite.spriteFrame = this._ijinUnkoSpriteFrame;
                    this.startAction();     //再起処理
                });
                return;
            }
        }


        let high_score:number = this._res.high_score;                //ハイスコア
        let scoring_total:number = this._res.scoring_total;          //合計得点
        let accuracy_score:number = this._res.accuracy_score;        //正解スコア
        let hint_score:number = this._res.hint_score;        //ヒントスコア
        let time_score:number = this._res.time_score;        //スピードスコア
        time_score = Math.floor(time_score);
        let combo_score:number = this._res.combo_score;      //コンボスコア
        let experience_point:number = this._res.experience_point;        //獲得経験値

        let next_level_progress:number = this._res.next_level_progress;      //次のレベルまで％
        let next_level_before_progress:number = this._res.next_level_before_progress;    //上昇前
        let current_level:number = this._res.current_level;       //経験値取得後のレベル
        let old_level:number = this._res.old_level;
        let level_up:boolean = this._res.level_up;
        /** 獲得コイン数 */
        let coin:number = this._res.coin;
        let total_coin:number = this._res.total_coin;     //取得後のコイン数
        let score_magnification:number = this._res.score_magnification;       //レベルアップ後の得点倍率（レベル上がらないときは今の倍率）
        let continual_combo:number = this._res.continual_combo;

        //経験値ゲージのアップ前、アップ後
        let prev_lvExp:number = next_level_before_progress;
        let new_lvExp:number = next_level_progress;

        /** 所持コイン数(増える前) */
        let prevCoin:number = total_coin - coin;

        //ステータスの更新（メニュー画面に戻った時用）
        StaticData.playerData.level = current_level;
        StaticData.playerData.coin = total_coin;
        StaticData.playerData.next_level_progress = next_level_progress;
        StaticData.playerData.score_magnification = score_magnification;



        this.prevHighScoreOutput.string = Math.floor(high_score) + "";
        this.renzokuComboOutput.string = continual_combo + "";

        //トータルスコアの桁数で場所を変える（センタリングする）
        let tKeta:number = (Math.floor(scoring_total) + "").length;
        this.totalScoreCounter.node.x -= 40 * (4 - tKeta);


        let perCorrect:number = 0;
        let perSpeed:number = 0;
        let perCombo:number = 0;
        let coinCorrect:number = -1;
        let coinSpeed:number = -1;
        let coinCombo:number = -1;
        let expCorrect:number = -1;
        let expSpeed:number = -1;
        let expCombo:number = -1;
        let goribenNoHintWait:number = 0;
        

        if(IS_GORIBEN)
        {
            goribenNoHintWait = 0.5;

        }
        else if(IS_HAYABEN_GHOST)
        {
            //取得コインと経験値を３つに分割 (ずれが出た場合はすべて正解点で補正する)
            if(scoring_total > 0)
            {
                perCorrect = accuracy_score / scoring_total;
                perSpeed = time_score / scoring_total;
                perCombo = combo_score / scoring_total;
            }

            coinCorrect = Math.floor(perCorrect * coin);
            coinSpeed = Math.floor(perSpeed * coin);
            coinCombo = Math.floor(perCombo * coin);
            let tCoin:number = coinCorrect + coinSpeed + coinCombo;     //この計算式でとれるトータルコイン数
            cc.log("コイン配分(調整前) : " + coinCorrect + "," + coinSpeed + "," + coinCombo + " (" + tCoin + ")");
            
            coinCorrect += (coin - tCoin);          //誤差の枚数を正解点で入るコインに加算

            tCoin = coinCorrect + coinSpeed + coinCombo;
            cc.log("コイン配分(調整後) : " + coinCorrect + "," + coinSpeed + "," + coinCombo + " (" + tCoin + ")");
            
            //-----------

            expCorrect = Math.floor(perCorrect * experience_point);
            expSpeed = Math.floor(perSpeed * experience_point);
            expCombo = Math.floor(perCombo * experience_point);
            let tExp:number = expCorrect + expSpeed + expCombo;
            cc.log("経験値配分(調整前) : " + expCorrect + "," + expSpeed + "," + expCombo + " (" + tExp + ")");

            expCorrect += (experience_point - tExp);

            tExp = expCorrect + expSpeed + expCombo;
            cc.log("経験値配分(調整後) : " + expCorrect + "," + expSpeed + "," + expCombo + " (" + tExp + ")");
            
        }
        
        //経験値ブースト
        const SCORE_BOOST:number = (IS_GORIBEN) ? score_magnification : 1.0;

        //ブーストを考慮したスコア
        let accuracyBoostScore:number = Math.floor(accuracy_score * SCORE_BOOST);
        let timeBoostScore:number = Math.floor(time_score * SCORE_BOOST);
        let comboBoostScore:number = Math.floor(combo_score * SCORE_BOOST);
        let hintBoostScore:number = Math.floor(hint_score * SCORE_BOOST);
        let totalBoostScore:number = accuracyBoostScore + timeBoostScore + comboBoostScore + hintBoostScore;

        //誤差を補正する
        let gosa:number = Math.floor(this._res.scoring_total) - totalBoostScore;
        let gIndex:number = 0;
        //let loopCount:number = 100;
        let hoseiAdd:number = 0;

        if(gosa > 0)
        {
            hoseiAdd = -1;
        }
        else if(gosa < 0)
        {
            gosa = -gosa;       //整数化
            hoseiAdd = 1;
        }

        for(let i:number = 0 ; i < gosa ; i ++)
        {
            if(gIndex == 0) accuracyBoostScore += hoseiAdd;
            else if(gIndex == 1) timeBoostScore += hoseiAdd;
            else if(gIndex == 2) comboBoostScore += hoseiAdd;
            else if(gIndex == 3) hintBoostScore += hoseiAdd;

            gIndex ++;
            if(gIndex > 3) gIndex = 0;
        }



        

        //ボードが登場
        this.scoreBoard.runAction(
            cc.sequence(
                cc.delayTime(0.1),
                cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
                cc.callFunc(()=>
                {
                    if(IS_HAYABEN_GHOST)
                    {
                        this.gotCoinIcon.active = true;
                        this.gotCoinText.active = true;
                        this.gotCoinCounter.node.active = true;

                        this.gotExpIcon.active = true;
                        this.gotExpText.active = true;
                        this.gotExpCounter.node.active = true;
                    }
                }),
                cc.delayTime(0.5),
                cc.callFunc(()=>
                {
                    //正解数をカウントアップ
                    this.correctScoreCounter.to(accuracyBoostScore, 0.3);
                    this.totalScoreCounter.to(accuracyBoostScore, 0.3);
                    this._gotCoin(coinCorrect, this.correctScoreCounter.node, prevCoin + coinCorrect);
                    this._gotExp(expCorrect, perCorrect);
                    if(accuracy_score > 0) SE.play(this.seAddScore);
                }),
                cc.delayTime(0.5),
                cc.callFunc(()=>
                {
                    let prevSc:number = accuracyBoostScore;
                    let toSc:number = prevSc + timeBoostScore;
                    //スピード点をカウントアップ
                    this.speedScoreCounter.to(timeBoostScore, 0.3);
                    this.totalScoreCounter.to(toSc, 0.3);
                    this._gotCoin(coinSpeed, this.speedScoreCounter.node, prevCoin + coinCorrect + coinSpeed);
                    this._gotExp(expCorrect + expSpeed, perSpeed);
                    if(time_score > 0) SE.play(this.seAddScore);
                }),
                cc.delayTime(0.5),
                cc.callFunc(()=>
                {
                    let prevSc:number = accuracyBoostScore + timeBoostScore;
                    let toSc:number = prevSc + comboBoostScore;
                    //コンボ点をカウントアップ
                    this.comboScoreCounter.to(comboBoostScore, 0.3);
                    this.totalScoreCounter.to(toSc, 0.3);
                    this._gotCoin(coinCombo, this.comboScoreCounter.node, prevCoin + coinCorrect + coinSpeed + coinCombo);
                    this._gotExp(expCorrect + expSpeed + expCombo, perCombo);
                    if(combo_score > 0) SE.play(this.seAddScore);
                }),
                //------- ゴリベンの場合はノーヒントボーナスが入る
                cc.delayTime(goribenNoHintWait),
                cc.callFunc(()=>
                {
                    if(IS_GORIBEN)
                    {
                        let prevSc:number = accuracyBoostScore + timeBoostScore + comboBoostScore;
                        let toSc:number = prevSc + hintBoostScore;
                        //ヒント点をカウントアップ
                        this.hintScoreCounter.to(hintBoostScore, 0.3);
                        this.totalScoreCounter.to(toSc, 0.3);
                        if(hint_score > 0) SE.play(this.seAddScore);
                    }
                }),
                cc.delayTime(1.0),
                cc.callFunc(()=>
                {
                    //ハイスコア更新の場合
                    if(this._res.scoring_total > this._res.high_score)
                    {
                        // New Record のテキストを表示
                        this.newRecordNode.active = true;
                        this.newRecordNode.scale = 2;
                        cc.tween(this.newRecordNode)
                        .to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
                        .start();
                    }
                    
                    if(IS_GORIBEN)
                    {
                        //ボタンを出す(回答一覧、メニューに戻る)
                        this.btnList.node.active = true;
                        this.btnMenu.node.active = true;

                        //勝利時は「次の偉人」、敗北時は「再挑戦」
                        if(this._isWin) this.btnIjinNext.node.active = true;
                        else this.btnRetry.node.active = true;

                        //表示完了コールバック
                        if(this._showCompleteCallback) this._showCompleteCallback(0);
                    }
                    else if(IS_HAYABEN_GHOST)
                    {
                        //経験値の増える演出
                        this._expUpAction(prev_lvExp, new_lvExp, level_up, ()=>
                        {
                            if(IS_HAYABEN)
                            {
                                //ボタンを出す（回答一覧、修行、偉人に挑戦、ゲームをやめる）
                                this.btnList.node.active = true;
                                this.btnReTraining.node.active = true;
                                this.btnGoVS.node.active = true;
                                this.btnEnd.node.active = true;
                            }
                            else if(IS_GHOST)
                            {
                                //表示内容を勝敗に変える
                                this.hayabenItemListNode.active = false;
                                this.correctScoreCounter.node.active = false;
                                this.speedScoreCounter.node.active = false;
                                this.comboScoreCounter.node.active = false;

                                //勝敗結果を表示
                                this.ghostItemListNode.active = true;
                                let isWin:boolean = (scoring_total >= high_score);
                                this.ghostWinNode.active = isWin;
                                this.ghostLoseNode.active = ! isWin;
                                
                                //ボタンを出す（回答一覧、OKボタン）
                                this.btnList.node.active = true;
                                //this.btnGhostClose.node.active = true;        //これ外す
                                //代わりにこっち
                                this.btnReTraining.node.active = true;
                                this.btnGoVS.node.active = true;
                                this.btnEnd.node.active = true;
                            }
                            
                            //連続コンボ数を出す
                            this.renzokuComboNode.active = true;

                            //表示完了コールバック
                            if(this._showCompleteCallback) this._showCompleteCallback(0);
                        });
                    }
                    
                    
                    /*
                    //経験値をカウントアップ
                    this.gotExpCounter.to(experience_point, 0.3);

                    //経験値ゲージが上昇
                    this._updateExpGage(prev_lvExp, new_lvExp);
                    */
                })
            )
        );
    }



    
    /**
     * うんこゲージが登場し経験値が入る。レベルアップ時とそうでない時で演出が変わる
     * @param prev_lvExp 
     * @param new_lvExp 
     * @param level_up 
     * @param callback 
     */
    private _expUpAction(prev_lvExp:number, new_lvExp:number, level_up:boolean, callback:()=>void):void
    {
        //正解数0の場合、経験値や取得コインはないので即終了する
        if(this._res.accuracy_num == 0)
        {
            callback();
            return;
        }
        
        
        this.expUpNode.active = true;
        this.expGageMouth.active = false;       //口を閉じる（非表示）
        this.lvUpGokouNodeA.active = false;
        this.lvUpGokouNodeB.active = false;
        this.lvUpGokouNodeC.active = false;
        this.lvUpGlowNode.active = false;
        this.lvUpTextNode.active = false;


        this.lvUpGageNode.scale = 0;
        this.lvUpGageNode.y = 0;
        this._setExpProgress(prev_lvExp / 100);

        let expMagnification:number = this._res.experience_point_magnification;       //経験値ゲット時の倍率（倒した偉人で上昇）
        const needBonusEvent:boolean = (expMagnification > 1.0);

        let addUnkoCount:number = 0;        //増殖する追加うんこの数
        if(needBonusEvent)
        {
            let rate:number = 1.3 + expMagnification / 10;
            if(rate > 6) rate = 6;
            addUnkoCount = Math.floor(this._unkoExpNodes.length *  (rate - 1.0));
        }
        
        //増殖演出でかかる時間
        const timeGainWait:number = 1.3;
        let gainTimeCount:number = (this._unkoExpNodes.length < addUnkoCount) ? this._unkoExpNodes.length : addUnkoCount;
        const timeGainEvent:number = (needBonusEvent) ? gainTimeCount * 0.04 + 0.3 + timeGainWait : 0.0;

        //吸い込み演出でかかる時間
        const vacuumInterval:number = 0.02;     //吸い込まれるうんこの間隔
        const vacuumDuration:number = 0.3;      //吸い込み移動時間
        const vacuumDelayTime:number = 0.4;     //口を開けてから吸い込むまでの待ち時間
        const timeVacuum:number = (this._unkoExpNodes.length + addUnkoCount) * vacuumInterval + vacuumDuration + vacuumDelayTime;

        //経験値バー上昇演出待ち時間
        const timeExpBarUp:number = (level_up) ? 0.5 : 1.0;




        //中央にうんこゲージ登場
        cc.tween(this.lvUpGageNode)
        .to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
        .delay(0.3)
        .call(()=>
        {
            //-------------------------------------------------------------------------
            // うんこ経験値が偉人のうんこによって増殖演出
            //
            this._gainBonusExpUnko(needBonusEvent, addUnkoCount, expMagnification, timeGainWait);       //増殖率は1.4 ～ 2.4
        })
        .delay(timeGainEvent)       //増殖演出待ち
        .call(()=>
        {
            //-------------------------------------------------------------------------
            // 周囲に浮かぶうんこ経験値を吸収する
            //
            this._expUnkoVacuum(vacuumInterval, vacuumDuration, vacuumDelayTime);
        })
        .delay(timeVacuum)          //吸い込み演出待ち
        .call(()=>
        {
            //-------------------------------------------------------------------------
            // 経験値バーアップ演出
            //
            this._expBarUp(prev_lvExp, new_lvExp, level_up, callback);
        })
        .delay(timeExpBarUp)        //経験値バーアップ演出待ち
        .call(()=>
        {
            //-------------------------------------------------------------------------
            // 経験値演出終わり、レベルアップの有無で演出変化
            //
            this._expUpActionEnd(new_lvExp, level_up, callback);
        })
        .start();
    }




    //-------------------------------------------------------------------------------------------
    /**
     * うんこ経験値が偉人のうんこによって増殖演出
     * @param rate 
     */
    private _gainBonusExpUnko(needBonusEvent:boolean, addUnkoCount:number, bonusRate:number, zoushokuWaitTime:number)
    {
        if(! needBonusEvent) return;

        //ボーナス〇%の演出
        let lastNum:number = Math.ceil((bonusRate - 1.0) * 100);
        
        //〇〇〇%Up 全体のセンタリング
        let numWidth:number = ("" + lastNum).length * 72;
        let upPerWidth:number = this.expBonusUpPerNode.width;
        let halfWidth:number = (numWidth + upPerWidth) / 2;
        let centeringX:number = halfWidth - upPerWidth;
        this.expBonusUpPerNode.x = centeringX;
        this.expBonusCounter.node.x = centeringX;

        this.expBonusUpPerNode.active = false;
        this.expBonusTextNode.active = false;
        this.expBonusCounter.resetNum();
        this.expBonusCounter.node.active = false;

        this.expBonusNode.active = true;
        this.expBonusUnkoSprite.node.scale = 0.3;
        cc.tween(this.expBonusUnkoSprite.node)
        .to(0.3, { scale:0.8 }, { easing:EasingName.backOut })
        .call(()=>
        {
            this.expBonusUpPerNode.active = true;
            this.expBonusTextNode.active = true;
            this.expBonusCounter.node.active = true;
            this.expBonusCounter.to(lastNum, 0.3);
        })
        .start();


        //this.expBonusNode.scale = 0.8;
        cc.tween(this.expBonusNode)
        //.to(0.3, { scale:1.0 }, { easing:EasingName.backOut })
        .delay(1.0)
        .to(0.15, { scale:0.0 }, { easing:EasingName.sineIn })
        //.by(0.3, { y:1500 }, { easing:EasingName.sineIn } )
        .removeSelf()
        .start();




        /*
        this.expBonusNode.active = true;
        this.expBonusCounter.num = (bonusRate - 1.0) * 100;
        //this.expBonusOutlineCounter.num = this.expBonusCounter.num;
        this.expBonusNode.scale = 0.3;
        cc.tween(this.expBonusNode)
        .to(0.3, { scale:0.8 }, { easing:EasingName.backOut })
        .delay(1.0)
        .to(0.3, { scale:0.0 }, { easing:EasingName.backIn })
        .removeSelf()
        .start();
        */

        //偉人のうんこ登場音
        SE.play(this.seExpBonus);

        
        //const zoushokuWaitTime:number = 1.5;
        let beforeUnkoCount:number = this._unkoExpNodes.length;     //増殖前のうんこの数
        let index:number = 0;
        
        for(let i :number = 0 ; i < addUnkoCount ; i ++)
        {
            let node:cc.Node = new cc.Node();
            node.scale = 0.0;
            node.position = this._unkoExpNodes[index].position;
            node.angle = Math.random() * 360;
            let sprite:cc.Sprite = node.addComponent(cc.Sprite);
            let unkoScale:number = ResultHayaben.UNKO_EXP_SCALE;
            
            if(this._ijinUnkoSpriteFrame)
            {
                sprite.spriteFrame = this._ijinUnkoSpriteFrame;
                unkoScale *= 0.5;
            }
            else
            {
                sprite.spriteFrame = this.expUnkoSpriteFrame;
            }
            
            this.expUnkoParentNode.addChild(node);
            this._unkoExpNodes.push(node);

            let rx:number = Math.random() * 200 + 100;
            if(Math.random() < 0.5) rx = -rx;
            let ry:number = Math.random() * 200 + 200;

            //クローンうんこ登場し浮遊する
            cc.tween(node)
            .delay(index * 0.04 + zoushokuWaitTime)
            .to(0.0, { scale:0.4 })
            .by(0.4, { x:rx, y:ry, scale:unkoScale - 0.4, angle:Math.random() * 360 }, { easing:EasingName.sineOut })
            .call(()=>
            {
                //漂う
                let mx:number = Math.random() * 60 - 30;
                let my:number = Math.random() * 30 - 15;

                cc.tween(node)
                .repeatForever(
                    cc.tween()
                    .by(0.8, { x:mx, y:my }, { easing:EasingName.sineInOut })
                    .by(0.8, { x:-mx, y:-my }, { easing:EasingName.sineInOut })
                )
                .start();
            })
            .start();


            //クローン元のうんこは少し拡大演出
            //cc.Tween.stopAllByTarget(this._unkoExpNodes[index]);
            cc.tween(this._unkoExpNodes[index])
            .delay(index * 0.04 + zoushokuWaitTime)
            .to(0.0, { scale:1.5 * ResultHayaben.UNKO_EXP_SCALE })
            .to(0.3, { scale:ResultHayaben.UNKO_EXP_SCALE }, { easing:EasingName.backOut })
            .start();

            index ++;
            if(index >= beforeUnkoCount) index = 0;
        }

        cc.tween({})
        .delay(zoushokuWaitTime)
        .call(()=>
        {
            //うんこ玉の効果音
            SE.play(this.seGetExpUnko);
        })
        .start();
    }




    //-------------------------------------------------------------------------------------------
    /**
     * うんこ経験値を吸い込む
     */
    private _expUnkoVacuum(interval:number, duration:number, delayTime:number):void
    {
        this.expGageMouth.active = true;        //口が開く（表示）
        
        let wPos:cc.Vec2 = this.lvUpGageNode.convertToWorldSpaceAR(cc.v2(0, 264-16));
        let lPos:cc.Vec2 = this.expUnkoParentNode.convertToNodeSpaceAR(wPos);
        
        let mouthPos:cc.Vec3 = cc.v3(lPos.x, lPos.y, 0);
        
        //漂ううんこが吸収される
        for(let i:number = 0 ; i < this._unkoExpNodes.length ; i ++)
        {
            let unko:cc.Node = this._unkoExpNodes[i];
            cc.tween({})
            .delay(i * interval + delayTime)
            .call(()=>
            {
                cc.tween(unko)
                .to(duration, { position:mouthPos, scale:0.2 }, { easing:EasingName.sineIn })
                .removeSelf()
                .start();
            })
            .start();
        }
    }



    //-------------------------------------------------------------------------------------------
    /**
     * うんこ経験値が吸収され、バーが伸びる演出部分
     * @param prev_lvExp 
     * @param new_lvExp 
     * @param level_up 
     * @param callback 
     */
    private _expBarUp(prev_lvExp:number, new_lvExp:number, level_up:boolean, callback:()=>void):void
    {
        this.expGageMouth.active = false;        //口が閉じる（非表示）

        //口もぐもぐ
        cc.tween(this.expGageHige)
        .repeat(3,
            cc.tween()
            .by(0.1, { y:-10 })
            .by(0.1, { y:10 })    
        )
        .start();

        
        //経験値の効果音
        this._seExpUpID = SE.play(this.seExpUp, true);

        //レベルアップするなら一旦マックスまでゲージを伸ばす
        let afterExp:number = (level_up) ? 100 : new_lvExp;
        
        let a:{ per:number } = { per:prev_lvExp };
        cc.tween(a)
        .to(0.5, { per:afterExp }, { onUpdate:(target:{ per:number }, ratio:number)=>
            {
                //経験値ゲージが伸びる
                this._setExpProgress(target.per / 100);
            } })
        .call(()=>
        {
            //効果音を止める
            SE.stop(this._seExpUpID);
            this._seExpUpID = -1;

            //経験値ゲージを光らせて更新した感を出す
            this._flashExpBar();

            //レベルアップの時だけゲージが拡大
            if(level_up)
            {
                cc.tween(this.lvUpGageNode)
                .delay(0.5)
                .to( 0.3, { scale:1.5, y:-266 }, { easing:EasingName.sineInOut } )
                .start();
            }
        })
        .start();
    }


    //-------------------------------------------------------------------------------------------
    /**
     * 経験値演出終わり、レベルアップの有無で演出変化
     * @param new_lvExp 
     * @param level_up 
     * @param callback 
     */
    private _expUpActionEnd(new_lvExp:number, level_up:boolean, callback:()=>void):void
    {
        //レベルアップなら演出、そうでないなら一定時間後に閉じる
        if(level_up)
        {
            //後光がさしたりいろいろレベルアップのエフェクトが出る
            this._lvUpEffect();
            
            //ステータスアップが出る
            this._showStatusUp(()=>
            {
                //ステータスバーの経験値バーを０から始めて正しい位置にする。
                this._playerStatusBar.setProgress(0);
                this._playerStatusBar.toProgress(new_lvExp, 0.5, ()=>{});
                
                this._closeLevelUpEffect();
                //this._LvUpAfterExpUp(new_lvExp / 100);
                this._expUpGageClose(callback);
            });
        }
        else
        {
            this._expUpGageClose(callback);
        }
    }


    //-------------------------------------------------------------------------------------------
    //経験値バーが閉じる
    private _expUpGageClose(callback:()=>void)
    {
        cc.tween(this.lvUpGageNode)
        .to( 0.3, { scale:0 }, { easing:EasingName.backIn } )
        .call( ()=>{ callback(); } )
        .start();
    }



    private _flashExpBar()
    {
        for(let i:number = 0 ; i < this.lvUpBars.length ; i ++)
        {
            let barNode:cc.Node = this.lvUpBars[i];
            if(! barNode.active) continue;
            let color:cc.Color = barNode.color;

            cc.tween(barNode)
            .delay(i * 0.01)
            .to( 0.0, { color:cc.Color.WHITE, scaleX:1.1 } )
            .delay(0.1)
            .to( 0.2, { color:color, scaleX:1.0 }, { easing:EasingName.sineIn } )
            .start();
        }
    }






    /**
     * 画面中央の経験値バーとステータス部分の経験値バーを指定のパーセンテージにする
     * @param per 
     */
    private _setExpProgress(per:number):void
    {
        let count:number = Math.floor(per * this.lvUpBars.length);
        //count += 1;   これいらなくね？
        if(count > this.lvUpBars.length) count = this.lvUpBars.length;

        for(let i:number = 0 ; i < this.lvUpBars.length ; i ++)
        {
            this.lvUpBars[i].active = (i <= count);
        }

        //経験値ゲージ上昇
        this._playerStatusBar.setProgress(per);
    }


    private _LvUpAfterExpUp(per:number):void
    {
        this.node.runAction(
            cc.valueTo(0.5, 0, per, (value:number)=>
            {
                //経験値ゲージ上昇
                this._playerStatusBar.setProgress(value);
            })
        );
    }


    

    //ゲージが増える
    private _gageUp():void
    {
        for(let i:number = 0 ; i < this.lvUpBars.length ; i ++)
        {
            this.lvUpBars[i].runAction(
                cc.sequence(
                    cc.delayTime(i * 0.02),
                    cc.scaleTo(0.0, 1)
                )
            );
        }
    }


    private _lvUpEffect():void
    {
        //後光を表示、回転
        this.lvUpGokouNodeA.active = true;
        this.lvUpGokouNodeB.active = true;
        this.lvUpGokouNodeC.active = true;

        this.lvUpGokouNodeA.runAction(
            cc.repeatForever(
                cc.rotateBy(2.0, 36)
            )
        );

        this.lvUpGokouNodeB.runAction(
            cc.repeatForever(
                cc.rotateBy(5.0, -36)
            )
        );

        this.lvUpGlowNode.active = true;
        this.lvUpGlowNode.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.fadeTo(1.0, 128),
                    cc.fadeTo(1.0, 255)
                )
            )
        );

        this.lvUpTextNode.active = true;
        this.lvUpTextNode.scale = 0;
        this.lvUpTextNode.runAction(
            cc.sequence(
                cc.delayTime(0.4),
                cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut())
            )
        );

        SE.play(this.seLevelUpGingle);
    }


    private _closeLevelUpEffect():void
    {
        this.lvUpGokouNodeA.active = false;
        this.lvUpGokouNodeB.active = false;
        this.lvUpGokouNodeC.active = false;

        cc.tween(this.lvUpTextNode)
        .to(0.3, { scale:0 }, { easing:EasingName.backIn })
        .removeSelf()
        .start();
    }



    private _showStatusUp(callback:()=>void):void
    {
        //let myPower:number = Math.floor(400 * StaticData.playerData.score_magnification);
        let myPower:number = StaticData.playerData.maxPower;
        
        //ステータスバーのパワーが上昇
        this._playerStatusBar.toPower(myPower, 0.5, ()=>{});

        //上昇するてんさいパワー値
        const TENSAI_UP_VAL:number = myPower - this._oldTensaiPower;
        if(TENSAI_UP_VAL % 10 != 0)
        {
            //端数発生エラー
            BugTracking.notify("レベルアップ時のてんさいパワー端数エラー", "ResultScore._showStatusUp()",
            {
                msg:"レベルアップ時のてんさいパワー端数エラー (score_magnification : " + this._res.score_magnification + ")",
                oldVal:this._oldTensaiPower,
                newVal:myPower,
                score_magnification:this._res.score_magnification,
                current_level:this._res.current_level
            });
        }

        this.statusUpPowerOutput.string = "0";
        this.statusUpPowerCount.num = myPower - TENSAI_UP_VAL;
        this.statusUpCloseIcon.active = false;

        //どれだけパワーが上がったか分かるウィンドウが表示
        this.statusUpNode.active = true;
        this.statusUpNode.scale = 0.3;
        this.statusUpNode.runAction(
            cc.sequence(
                cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
                cc.delayTime(0.2),
                cc.callFunc(()=>
                {
                    // パワー上昇
                    this.statusUpPowerCount.to(myPower, 0.8);

                    this.statusUpPowerOutput.node.runAction(
                        cc.valueTo(0.8, 0, TENSAI_UP_VAL, (value:number)=>
                        {
                            this.statusUpPowerOutput.string = "" + Math.floor(value);
                        })
                    );
                }),
                cc.delayTime(1.0),
                cc.callFunc(()=>
                {
                    this.statusUpCloseIcon.active = true;
                    
                    //このウィンドウをタップで閉じる
                    this.statusUpNode.once(cc.Node.EventType.TOUCH_START, (event)=>
                    {
                        this.statusUpNode.active = false;
                        callback();
                    });
                })
            )
        );
    }



    /**
     * 加点の部分からコインが飛び出す演出
     * @param count コインの数
     * @param targetNode コインが飛び出す場所のNode
     */
    private _gotCoin(count:number, targetNode:cc.Node, statusCoinNum:number):void
    {
        if(count <= 0) return;

        //コインの効果音
        //SE.play(this.seGetCoin);

        let appearCoinCount:number = Math.floor(count / 2);
        if(appearCoinCount < 1) appearCoinCount = 1;
        else if(appearCoinCount > 5) appearCoinCount = 5;
        
        for(let i:number = 0 ; i < appearCoinCount ; i ++)
        {
            let node:cc.Node = new cc.Node();
            node.setContentSize(this.coinSpriteFrame.getRect().width, this.coinSpriteFrame.getRect().height);
            let sprite:cc.Sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = this.coinSpriteFrame;

            targetNode.parent.addChild(node);
            node.setPosition(targetNode.getPosition());
            
            node.runAction(
                cc.sequence(
                    cc.delayTime(i * 0.1),
                    cc.jumpBy(0.3, cc.v2((Math.random() - 0.5) * 100, 30), 50, 1),
                    cc.removeSelf()
                )
            );
            
        }

        let prevCoin:number = this.gotCoinCounter.num;

        this.gotCoinCounter.to(prevCoin + count, 0.3);      //ここの時間は0.5未満にすること。じゃないと次の_gotCoinと重なって表示がズレる可能性がある

        this._playerStatusBar.toCoin(statusCoinNum, 0.3, ()=>{});

    }

    


    private _gotExp(count:number, per:number):void
    {
        if(count <= 0) return;

        let wPos:cc.Vec2 = this.gotExpIcon.convertToWorldSpaceAR(cc.v2(0,0));
        let lPos:cc.Vec2 = this.expUnkoParentNode.convertToNodeSpaceAR(wPos);



        //登場する、うんこ玉の数
        let unkoCount:number = Math.floor(per * 12);
        for(let i:number = 0 ; i < unkoCount ; i ++)
        {
            let node:cc.Node = new cc.Node();
            //node.position = this.gotExpIcon.position;
            node.x = lPos.x;
            node.y = lPos.y;
            node.scale = 0.0;
            let sprite:cc.Sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = this.expUnkoSpriteFrame;
            this.expUnkoParentNode.addChild(node);
            this._unkoExpNodes.push(node);

            //画面下半分らへんを漂う
            cc.tween(node)
            .delay(i * 0.03)
            .to(0.0, { scale:0.4 })
            .to(0.5, { x:Math.random() * 700 - 350, y:Math.random() * -400 - 150, angle:Math.random() * 360, scale:ResultHayaben.UNKO_EXP_SCALE }, { easing:EasingName.sineInOut })
            .call(()=>
            {
                //漂う
                let mx:number = Math.random() * 60 - 30;
                let my:number = Math.random() * 30 - 15;

                cc.tween(node)
                .repeatForever(
                    cc.tween()
                    .by(0.8, { x:mx, y:my }, { easing:EasingName.sineInOut })
                    .by(0.8, { x:-mx, y:-my }, { easing:EasingName.sineInOut })
                )
                .start();
            })
            .start();
        }

        //うんこ玉の効果音
        SE.play(this.seGetExpUnko);

        this.gotExpCounter.to(count, 0.3);      //ここの時間は0.5未満にすること。じゃないと次の_gotExpと重なって表示がズレる可能性がある
    }



    private _hideAllMenuButtons(event):void
    {
        let button:cc.Button = event.target.getComponent(cc.Button);
        button.interactable = false;

        let btns:cc.Button[] = [ this.btnList, this.btnMenu, this.btnRetry, this.btnReTraining, this.btnGoVS, this.btnEnd, this.btnGhostClose ];

        for(let i:number = 0 ; i < btns.length ; i ++)
        {
            if(button != btns[i]) btns[i].node.active = false;
        }
    }

    //---------- 偉人、修行　共通 -----------------------

    // 回答一覧ボタン
    private onPressListButton(event:cc.Event)
    {
        //ボタン音
        SE.play(this.seBtnPress);
        this._compCallback(Result.RTN_SC_KAITOU_ICHIRAN);
    }

    //---------- 偉人 -----------------------------------

    // 偉人再挑戦ボタン
    private onPressIjinRetryButton(event:cc.Event)
    {
        //ボタン音
        SE.play(this.seBtnPress);
        this._hideAllMenuButtons(event);
        this._compCallback(Result.RTN_SC_IJIN_RETRY);
    }

    // 次の偉人ボタン
    private onPressIjinNextButton(event:cc.Event)
    {
        //ボタン音
        SE.play(this.seBtnPress);
        this._hideAllMenuButtons(event);
        this._compCallback(Result.RTN_SC_IJIN_NEXT);
    }

    // メニューに戻る
    private onPressMenuButton(event:cc.Event)
    {
        //ボタン音
        SE.play(this.seBtnPress);
        this._hideAllMenuButtons(event);
        this._compCallback(Result.RTN_SC_MENU);
    }

    //---------- 修行 -----------------------------------

    // もう一度修行
    private onPressReTrainingButton(event:cc.Event):void
    {
        //ボタン音
        SE.play(this.seBtnPress);
        this._hideAllMenuButtons(event);
        this._compCallback(Result.RTN_SC_RE_TRAINING);
    }

    // ここで偉人に挑戦
    private onPressGoVsButton(event:cc.Event):void
    {
        //ボタン音
        SE.play(this.seBtnPress);
        this._hideAllMenuButtons(event);
        this._compCallback(Result.RTN_SC_GO_VS);
    }

    // ゲームをやめる
    private onPressEndGameButton(event:cc.Event):void
    {
        //ボタン音
        SE.play(this.seBtnPress);
        this._hideAllMenuButtons(event);
        this._compCallback(Result.RTN_SC_END_GAME);
    }

    //---------- 修行 -----------------------------------

    // ゴースト終わり
    private onPressGhostCloseButton(event:cc.Event):void
    {
        //ボタン音
        SE.play(this.seBtnPress);
        this._hideAllMenuButtons(event);
        this._compCallback(Result.RTN_GHOST_NEXT);
    }

}
