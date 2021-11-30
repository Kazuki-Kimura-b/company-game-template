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

    start() {
        if (StaticData.gameSetting.specificResultNum > 0) {
            this.changeSenseiFace(1);
        }
    }

    public changeSenseiFace(num: number): void {
        this.senseiSprite.spriteFrame = this.unkoSenseiSpriteFrames[num];
    }
}

