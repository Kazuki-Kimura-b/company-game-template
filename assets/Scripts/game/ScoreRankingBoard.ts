import ScoreRankData from "./ScoreRankData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ScoreRankingBoard extends cc.Component
{
    @property(cc.Node) boardNode: cc.Node = null;
    @property(cc.Label) nameOutput: cc.Label = null;
    @property(cc.Label) scoreOutput: cc.Label = null;
    @property(cc.Label) rankOutput: cc.Label = null;
    @property(cc.Label) idOutput: cc.Label = null;

    private _rankData:ScoreRankData = null;


    public get rank():number
    {
        return this._rankData.rank;
    }

    public get rankData():ScoreRankData
    {
        return this._rankData;
    }

    public setBoardID(id:number):void
    {
        this.idOutput.string = id + "";
    }



    public setup(rankData:ScoreRankData):void
    {
        this._rankData = rankData;
        this.updateRankData();
    }

    public updateRankData():void
    {
        this.rankOutput.string = this._rankData.displayRank + "";
        this.nameOutput.string = this._rankData.name;
        this.scoreOutput.string = this._rankData.score + "";

        this.boardNode.color = (this._rankData.isPlayer) ? cc.color(64,0,0) : cc.color(0,0,0);
    }



    public setPlayer():void
    {
        this.boardNode.color = cc.color(64,0,0);
    }

    public setRival():void
    {
        this.boardNode.color = cc.color(0,0,0);
    }

    /*
    public updateRank(rank:number):void
    {
        this._rankData.rank = rank;
        this._rankData.displayRank = rank;
        this.rankOutput.string = this._rankData.displayRank + "";
    }
*/

    


}
