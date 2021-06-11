import GameBG from "./GameBG";
import GameBG_Shutoku_floor from "./GameBG_Shutoku_floor";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBG_Shutoku extends GameBG
{

    @property(cc.Node) floorParentScrollNode:cc.Node = null;
    @property(cc.Node) centerFramesScrollNode:cc.Node = null;
    @property(cc.SpriteFrame) floorNumSprites:cc.SpriteFrame[] = [];
    @property(cc.Node) ijinNodes:cc.Node[] = [];
    @property(cc.Prefab) floorPrefab:cc.Prefab = null;


    //private _floors:GameBG_Shutoku_floor[] = [];
    private _currentFloor:number = 0;
    


    private static readonly _FLOOR_HEIGHT:number = 1334;
    private static readonly _STAGE_COLORS:cc.Color[] = [
        cc.color(6,247,244),
        cc.color(64,242,177),
        cc.color(104,248,147),
        cc.color(135,235,102),
        cc.color(190,235,56),
        cc.color(241,225,1),
        cc.color(241,194,17),
        cc.color(241,142,49),
        cc.color(240,85,86),
        cc.color(240,27,120),
        cc.color(243,0,136)
    ];
    

    
    //初期化
    public setup():void
    {
        let __CREATE_FLOOR:(index:number, floorNum:number, color:cc.Color, spriteFrame:cc.SpriteFrame)=>void = (index:number, floorNum:number, color:cc.Color, spriteFrame:cc.SpriteFrame)=>
        {
            let node:cc.Node = cc.instantiate(this.floorPrefab);
            let floor:GameBG_Shutoku_floor = node.getComponent(GameBG_Shutoku_floor);
            floor.setup(floorNum, color, spriteFrame);

            node.y = GameBG_Shutoku._FLOOR_HEIGHT * index;
            this.floorParentScrollNode.addChild(node);
        };
        
        
        
        //フロアの作成
        for(let i:number = 0 ; i < 10 ; i ++)
        {
            __CREATE_FLOOR(i, i + 1, GameBG_Shutoku._STAGE_COLORS[i], this.floorNumSprites[i]);
        }

        //底（縦長の画面だと見える）
        __CREATE_FLOOR(-1, -1, GameBG_Shutoku._STAGE_COLORS[0], null);
        
        //10階の上２フロア
        __CREATE_FLOOR(10, -1, GameBG_Shutoku._STAGE_COLORS[9], null);
        __CREATE_FLOOR(11, -1, GameBG_Shutoku._STAGE_COLORS[9], null);

        //一番手前のフレームを12フロア分配置
        let count:number = this.centerFramesScrollNode.childrenCount;
        for(let i:number = 0 ; i < count ; i ++)
        {
            this.centerFramesScrollNode.children[i].y = GameBG_Shutoku._FLOOR_HEIGHT * (i - 0.5)
        }

        for(let i:number = 0 ; i < this.ijinNodes.length ; i ++)
        {
            this.ijinNodes[i].active = false;
        }
    }


    //問題表示直前
    public showQuestion (questionCount: number):void
    {
        //スクロールする
        this.floorParentScrollNode.runAction(
            cc.moveTo(1.0, cc.v2(0, -this._currentFloor * GameBG_Shutoku._FLOOR_HEIGHT)).easing(cc.easeInOut(2))
        );

        this.centerFramesScrollNode.runAction(
            cc.moveTo(1.0, cc.v2(0, -this._currentFloor * GameBG_Shutoku._FLOOR_HEIGHT)).easing(cc.easeInOut(2))
        );
    }


    //正解
    public rightAnswer (comboCount:number):void
    {
        this._currentFloor ++;
    }


    //不正解
    public wrongAnswer (comboCount:number):void
    {
        this._currentFloor --;
        if(this._currentFloor < 0) this._currentFloor = 0;

        //エレベーターを揺らす
        this.floorParentScrollNode.runAction(
            cc.sequence(
                cc.delayTime(0.3),
                cc.moveBy(0.15, 0, 20),
                cc.moveBy(0.15, 0, -20),
                cc.moveBy(0.15, 0, 20),
                cc.moveBy(0.15, 0, -20),
                cc.moveBy(0.15, 0, 20),
                cc.moveBy(0.15, 0, -20)
            )
        );
    }


    //タイムアップ
    public timeUp (comboCount:number):void
    {
        this.wrongAnswer(comboCount);
    }



    //すべての問題が終了した時
    public finish (callback:()=>void):void
    {
        //階に応じて偉人が登場する
        this._setResultIjin();
        
        
        //スクロールする
        this.floorParentScrollNode.runAction(
            cc.sequence(
                cc.moveTo(1.0, cc.v2(0, -this._currentFloor * GameBG_Shutoku._FLOOR_HEIGHT)).easing(cc.easeInOut(2)),
                cc.callFunc(()=>
                {
                    callback();
                })
            )
        );

        this.centerFramesScrollNode.runAction(
            cc.moveTo(1.0, cc.v2(0, -this._currentFloor * GameBG_Shutoku._FLOOR_HEIGHT)).easing(cc.easeInOut(2))
        );
    }


    //結果画面での背景に偉人を配置
    private _setResultIjin():void
    {
        //登場する偉人の数
        let ijinCount = 0;
        if (this._currentFloor == 10) ijinCount = 3;
        else if (this._currentFloor >= 6) ijinCount = 2;
        else if (this._currentFloor >= 3) ijinCount = 1;

        for(let i:number = 0 ; i < ijinCount ; i ++)
        {
            let vecX:number = (i == 0) ? 1 : -1;
            let ijinNode:cc.Node = this.ijinNodes[i];
            ijinNode.scaleX = vecX;
            ijinNode.opacity = 0;
            ijinNode.active = true;

            ijinNode.runAction(
                cc.fadeTo(1.0, 255)
            );

            let duration:number = 1.5 + Math.random();

            ijinNode.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.moveBy(duration, cc.v2(500 * vecX, 0)).easing(cc.easeInOut(2.0)),
                        cc.callFunc(()=>{ ijinNode.scaleX = -vecX; }),
                        cc.moveBy(duration, cc.v2(-500 * vecX, 0)).easing(cc.easeInOut(2.0)),
                        cc.callFunc(()=>{ ijinNode.scaleX = vecX; })
                    )
                )
            );

            duration = 0.3 + Math.random() * 0.5;

            ijinNode.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.moveBy(duration, cc.v2(0, -30)).easing(cc.easeInOut(2.0)),
                        cc.moveBy(duration, cc.v2(0, 30)).easing(cc.easeInOut(2.0))
                    )
                )
            );
        }
    }


    
}
