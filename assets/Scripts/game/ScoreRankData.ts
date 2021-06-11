const {ccclass, property} = cc._decorator;

@ccclass
export default class ScoreRankData
{
    public rank:number;             //内部上の順位（重複なし）
    public displayRank:number;      //表示上の順位（重複あり）
    public score:number;
    public name:string;
    public isPlayer:boolean;



    public static create(rank:number, score:number, name:string):ScoreRankData
    {
        let data:ScoreRankData = new ScoreRankData();
        data.displayRank = rank;
        data.rank = rank;
        data.score = score;
        data.name = name;
        return data;
    }


    public static exchangeRank(dataA:ScoreRankData, dataB:ScoreRankData):void
    {
        let rankA:number = dataA.rank;
        let dispRankA:number = dataA.displayRank;
        let rankB:number = dataB.rank;
        let dispRankB:number = dataB.displayRank;

        dataA.rank = rankB;
        dataA.displayRank = dispRankB;
        
        dataB.rank = rankA;
        dataB.displayRank = dispRankA;
    }

}
