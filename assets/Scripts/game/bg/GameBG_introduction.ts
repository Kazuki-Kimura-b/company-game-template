import GameBG from "./GameBG";
import IjinScreen from "../IjinScreen";
import StaticData from "../../StaticData";

const {ccclass, property} = cc._decorator;



// 親クラスなので基本的には使用しない。
// ただし背景に一切ギミックがない場合は使用してもよい




@ccclass
export default class IntroductionBG extends GameBG {

    @property(IjinScreen) sensei: IjinScreen = null;
    @property(cc.Sprite) senseiSprite: cc.Sprite = null;
    @property(cc.SpriteFrame) unkoSenseiSpriteFrames: cc.SpriteFrame[] = [];
    @property(cc.Sprite) foodSprite: cc.Sprite = null;
    @property(cc.SpriteFrame) foodSpriteFrames: cc.SpriteFrame[] = [];

    start() {
        if (StaticData.gameSetting.specificResultNum > 0) {
            this.changeSenseiFace(1);
            this.changeFood(1);
        }
    }

    public changeSenseiFace(num: number): void {
        this.senseiSprite.spriteFrame = this.unkoSenseiSpriteFrames[num];
    }

    public changeFood(num: number): void {
        this.foodSprite.spriteFrame = this.foodSpriteFrames[num];
    }

    public hakushu(): void {
        cc.tween(this.node)
        .repeat(6, cc.tween(this.node)
        .call(() => {this.changeSenseiFace(3)})
        .delay(.1)
        .call(() => {this.changeSenseiFace(6)})
        .delay(.1)
        ).start();
        // .call(() => {this.changeSenseiFace(3)})
        // .delay(.1)
        // .call(() => {this.changeSenseiFace(4)})
        // .delay(.1)
        // .call(() => {this.changeSenseiFace(3)})
        // .delay(.1)
        // .call(() => {this.changeSenseiFace(4)})
        // .delay(.1)
        // .call(() => {this.changeSenseiFace(3)})
        
    }
}

