import { ComboRanking } from "../common/Models";
import ScoreRankData from "./ScoreRankData";
import ScoreRankingBoard from "./ScoreRankingBoard";

const {ccclass, property} = cc._decorator;



@ccclass
export default class ScoreRanking extends cc.Component
{

    @property(cc.Prefab) scoreRankingBoardPrefab: cc.Prefab = null;
    @property(cc.Node) boardsParentNode: cc.Node = null;
    @property(cc.Widget) topWidget: cc.Widget = null;
    @property(cc.Widget) bottomWidget: cc.Widget = null;



    /** 全ユーザー情報 */
    private _rankDatas:ScoreRankData[] = [];
    /** 画面上に描画するボード（使いまわすのでユーザー数ではない） */
    private _boards:ScoreRankingBoard[] = [];

    private _rankersCount:number = 300;      //参加者20名にする

    private _playerData:ScoreRankData;
    private _playerRank:number;



    /** スクリーンの最高の高さ */
    private static readonly MAX_SCREEN_HEIGHT:number = 1600;
    /** ボードの間隔 */
    private static readonly BOARD_INTERVAL:number = 150;
    /** 上部の画面外（ボードの高さ/2も考慮する）*/
    private static readonly TOP_Y:number = ScoreRanking.MAX_SCREEN_HEIGHT / 2 + ScoreRanking.BOARD_INTERVAL / 2;
    /** 下部の画面外（ボードの高さ/2も考慮する）*/
    private static readonly BOTTOM_Y:number = -(ScoreRanking.MAX_SCREEN_HEIGHT / 2) - (ScoreRanking.BOARD_INTERVAL / 2);

    private static readonly BOARD_LENGTH:number = 13;


    public setup(canvas:cc.Canvas, ranking:ComboRanking[], myRank:number):void
    {
        this.topWidget.target = canvas.node;
        this.topWidget.top = 0;
        this.bottomWidget.target = canvas.node;
        this.bottomWidget.bottom = 0;
        
        //ランキングスコア作成
        for(let i:number = 0 ; i < ranking.length ; i ++)
        {
            let rankData:ScoreRankData = ScoreRankData.create(i, ranking[i].max_combo, ranking[i].nickname);
            this._rankDatas.push(rankData);

            if(i == myRank) rankData.isPlayer = true;
        }
        
        //ランキングボード作成
        this._createBoards();
        
        this._playerRank = myRank;
        
        //ランクを表示(_scrollAtRankはスクロール用で画面内にボードがないと動作しない)
        this._setAtRank(0);
        
        this.node.runAction(
            cc.sequence(
                cc.delayTime(1.0),
                //開始位置からプレーヤーの位置までスクロール
                cc.valueTo(2.0, 0, this._playerRank, (value:number)=>
                {
                    this._scrollAtRank(value);
                }).easing(cc.easeInOut(2.0)),
                cc.delayTime(1.0),
                cc.callFunc(()=>
                {
                    //
                    
                }),
            )
        );

        
        
        
        /*
        //ランキングスコア作成
        for(let i:number = 0 ; i < this._rankersCount ; i ++)
        {
            let rankData:ScoreRankData = ScoreRankData.create(i, 2000 - i * 50, "name_" + i);
            this._rankDatas.push(rankData);
        }
        
        //ランキングボード作成
        this._createBoards();

        //プレーヤーを差し込む
        this._playerRank = 120;
        this._playerData = this._rankDatas[this._playerRank];
        this._playerData.name = "プレイヤー";
        this._playerData.isPlayer = true;
        
        let startRank:number = this._rankersCount - 1;
        //let startRank:number = 0;
        let newRank:number = 100;        //移動する新しいランク

        //ランクを表示(_scrollAtRankはスクロール用で画面内にボードがないと動作しない)
        this._setAtRank(startRank);

        let durationA:number = (startRank - this._playerRank) / 20;
        if(durationA < 0) durationA = -durationA;
        if(durationA < 1.0) durationA = 1.0;

        let durationB:number = (this._playerRank - newRank) / 5;

        this.node.runAction(
            cc.sequence(
                cc.delayTime(1.0),
                //開始位置からプレーヤーの位置までスクロール
                cc.valueTo(durationA, startRank, this._playerRank, (value:number)=>
                {
                    this._scrollAtRank(value);
                }).easing(cc.easeInOut(2.0)),
                cc.delayTime(1.0),
                cc.callFunc(()=>
                {
                    //プレーヤーのボードを上にあげる
                    this._playerUpdateRank(newRank, durationB);
                }),
                cc.delayTime(durationB + 0.7),
                //1位までスクロール
                cc.valueTo((newRank / 20), newRank, 0, (value:number)=>
                {
                    this._scrollAtRank(value);
                }).easing(cc.easeInOut(2.0)),
                cc.delayTime(0.5),
                //プレーヤーのランクまでスクロール
                cc.valueTo((newRank / 15), 0, newRank, (value:number)=>
                {
                    this._scrollAtRank(value);
                }).easing(cc.easeInOut(2.0))
            )
        );
        */
    }


    private _playerUpdateRank(newRank:number, duration:number):void
    {
        let playerBoard:ScoreRankingBoard = this._getRankingBoardAtRank(this._playerRank);
        playerBoard.node.zIndex = 1;

        playerBoard.node.runAction(
            cc.sequence(
                
                cc.delayTime(0.0),
                cc.valueTo(duration, this._playerRank, newRank, (value:number)=>
                {
                    //更新中のランク
                    let nextRank:number = Math.round(value);
                    
                    //順位が入れ替わった
                    if(this._playerRank != nextRank)
                    {
                        
                        let prevRank: number = this._playerRank;       //更新前のランク
                        let changeBoard:ScoreRankingBoard = this._getRankingBoardAtRank(nextRank);      //入れ替えるボード

                        //データの入れ替え
                        let dataA: ScoreRankData = this._rankDatas[prevRank];
                        let dataB: ScoreRankData = this._rankDatas[nextRank];
                        this._rankDatas[prevRank] = dataB;
                        this._rankDatas[nextRank] = dataA;

                        ScoreRankData.exchangeRank(dataA, dataB);

                        //入れ替えるボードを動かす
                        changeBoard.node.runAction(
                            cc.moveTo(0.3, 0, prevRank * -ScoreRanking.BOARD_INTERVAL)
                        );
                        changeBoard.node.runAction(
                            cc.sequence(
                                cc.moveBy(0.15, 40, 0).easing(cc.easeOut(2.0)),
                                cc.moveBy(0.15, -40, 0).easing(cc.easeIn(2.0))
                            )
                        );

                        //ボードの表示変更
                        playerBoard.updateRankData();
                        changeBoard.updateRankData();

                        this._playerRank = nextRank;
                    }
                    
                    playerBoard.node.y = value * -ScoreRanking.BOARD_INTERVAL;
                    this._scrollAtRank(value);
                })
            )
        );
    }


    /**
     * そのランクの情報を持ったボードを返す
     * @param rank 
     */
    private _getRankingBoardAtRank(rank:number):ScoreRankingBoard
    {
        for(let i:number = 0 ; i < this._boards.length ; i ++)
        {
            if(this._boards[i].rank == rank) return this._boards[i];
        }
        return null;
    }


    /**
     * 画面内に必要なだけのボードを表示
     * ボード高さは最大1600px想定。150px間隔なので13個用意
     */
    private _createBoards():void
    {
        for(let i:number = 0 ; i < ScoreRanking.BOARD_LENGTH ; i ++)
        {
            let board:ScoreRankingBoard;
            let node:cc.Node = cc.instantiate(this.scoreRankingBoardPrefab);
            board = node.getComponent(ScoreRankingBoard);
            board.setBoardID(i);
            board.setup(this._rankDatas[i]);
            
            node.y = i * -ScoreRanking.BOARD_INTERVAL;
            this.boardsParentNode.addChild(node);

            this._boards.push(board);
        }
    }



    private _setAtRank(rank:number):void
    {
        let showStartRank:number = rank - Math.floor(this._boards.length / 2);
        
        for(let i:number = 0 ; i < this._boards.length ; i ++)
        {
            let rank:number = showStartRank + i;
            if(rank < 0)
            {
                rank += ScoreRanking.BOARD_LENGTH;
            }
            else if(rank >= this._rankDatas.length)
            {
                rank -= ScoreRanking.BOARD_LENGTH;
            }

            this._boards[i].node.y = -ScoreRanking.BOARD_INTERVAL * rank;
            this._boards[i].setup(this._rankDatas[rank]);
        }
        this._scrollAtRank(rank);
    }



    private _scrollAtRank(rank:number):void
    {
        this.boardsParentNode.y = rank * ScoreRanking.BOARD_INTERVAL;
        this._updateDisplay();
    }



    private _updateDisplay():boolean
    {
        let change:boolean = false;
        
        for(let i:number = 0 ; i < this._boards.length ; i ++)
        {
            //ボードが画面外か調べる
            let board:ScoreRankingBoard = this._boards[i];
            let boardParentY:number = board.node.y + this.boardsParentNode.y;

            let moveY:number = 0;
            let moveRank:number = 0;
            
            //画面上の外
            if(boardParentY > ScoreRanking.TOP_Y)
            {
                moveY = ScoreRanking.BOARD_LENGTH * -ScoreRanking.BOARD_INTERVAL;
                moveRank = ScoreRanking.BOARD_LENGTH;
            }
            //画面下の外
            else if(boardParentY < ScoreRanking.BOTTOM_Y)
            {
                moveY = ScoreRanking.BOARD_LENGTH * ScoreRanking.BOARD_INTERVAL;
                moveRank = -ScoreRanking.BOARD_LENGTH;
            }
            else
            {
                continue;
            }

            let newRank:number = board.rank + moveRank;
            //ランクが範囲外なので動かす必要ない
            if(newRank < 0 || newRank > this._rankersCount - 1)
            {
                continue;
            }

            //動かしても画面外なので動かす必要ない
            if(moveY + boardParentY > ScoreRanking.TOP_Y || moveY + boardParentY < ScoreRanking.BOTTOM_Y)
            {
                continue;
            }

            board.node.y += moveY;

            //新しいランクの情報に変更
            board.setup(this._rankDatas[newRank]);

            //ボードの情報に変更があった
            change = true;
        }

        return change;
    }

    // update (dt) {}


    public onPressCloseButton(e:any):void
    {
        this.node.removeFromParent();
    }




}
