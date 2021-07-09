import StaticData from "../StaticData";
import SE from "../common/SE";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ScoreBar extends cc.Component
{
    @property(cc.Node) scoreBoard: cc.Node = null;
    @property(cc.Node) gauge: cc.Node = null;
    @property(cc.Node) totalScoreOutput: cc.Node = null;
    @property(cc.Node) baseScoreOutput: cc.Node = null;
    @property(cc.Node) speedScoreOutput: cc.Node = null;
    @property(cc.Node) comboScoreOutput: cc.Node = null;
    @property(cc.Node) noHintScoreOutput: cc.Node = null;
    @property(cc.Node) buttonNext: cc.Node = null;
    @property(cc.Node) stamp: cc.Node = null;
    @property({ type:cc.AudioClip }) seStamp:cc.AudioClip = null;

    @property(cc.SpriteFrame) numbers: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame) totalNumbers: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame) stampSprites: cc.SpriteFrame[] = [];

    _totalScore: number = null;

    public setup(): void {
        this.gauge.setPosition(-190, -1350);
        this.scoreBoard.setPosition(110, 1258);
    }
    public showScore(total: number, base: number, speed: number, combo: number, noHint): void {
        this.gauge.runAction(cc.moveTo(0.4, -190, -220).easing(cc.easeCubicActionIn()));
        this.scoreBoard.runAction(cc.moveTo(0.4, 110, 40).easing(cc.easeCubicActionIn()));
        this.node.runAction(cc.sequence(
            cc.delayTime(1.5),
            cc.callFunc(() => {this.countup(this.baseScoreOutput, base);}),
            cc.delayTime(0.8),
            cc.callFunc(() => {this.countup(this.speedScoreOutput, speed);}),
            cc.delayTime(0.8),
            cc.callFunc(() => {this.countup(this.comboScoreOutput, combo);}),
            cc.delayTime(0.8),
            cc.callFunc(() => {this.countup(this.noHintScoreOutput, noHint);}),
            cc.delayTime(1),
            cc.callFunc(() => {this.showGauge(total)})
        ));
    }
    public showGauge(score: number): void {
        let dispNum: number = Math.ceil(score / 350 * 15); // 何個ゲージを表示するか
        let count: number = 0;
        let activateMark = () => {
            if (dispNum !== 0) {
                this.gauge.children[count].active = true;
                // this._sound.SE(this._sound.seMark[count]);
                count ++;
            }
            let timer = setTimeout(activateMark, 200 - (count*10));
            if (count >= dispNum) {
                clearTimeout(timer);
                this.gauge.runAction(
                    cc.sequence(
                        cc.delayTime(1),
                        cc.callFunc(() => {
                            this.buttonNext.active = true;
                            this.stamp.getComponent(cc.Sprite).spriteFrame = this.stampSprites[StaticData.gameSetting.specificResultNum - 1];
                            let colors: cc.Color[] = [new cc.Color(255, 255, 255), new cc.Color(255, 240, 0), new cc.Color(255, 0, 140)];
                            this.stamp.color = colors[StaticData.gameSetting.specificResultNum - 1];
                            this.stamp.active = true;
                            SE.play(this.seStamp);
                        })
                    )
                )
            }
        }
        activateMark();
    }
    public countup(node: cc.Node, score: number): void {
        this.totalScoreOutput.runAction(cc.valueTo(0.5, this._totalScore, this._totalScore + score, (value) => {
            let num: number = Math.floor(value);
            this.totalScoreOutput.children[0].getComponent(cc.Sprite).spriteFrame = this.totalNumbers[num % 10];
            this.totalScoreOutput.children[1].getComponent(cc.Sprite).spriteFrame = this.totalNumbers[Math.floor(num / 10) % 10];
            this.totalScoreOutput.children[2].getComponent(cc.Sprite).spriteFrame = this.totalNumbers[Math.floor(num / 100) % 10];
        }))
        node.runAction(cc.valueTo(0.5, 0, score, (value) => {
            let num: number = Math.floor(value);
            node.children[0].getComponent(cc.Sprite).spriteFrame = this.numbers[num % 10];
            node.children[1].getComponent(cc.Sprite).spriteFrame = this.numbers[Math.floor(num / 10) % 10];
            node.children[2].getComponent(cc.Sprite).spriteFrame = this.numbers[Math.floor(num / 100) % 10];
        }));
        this._totalScore += score;
    }

    private onPressEndResult(): void {
        this.buttonNext.runAction(cc.scaleTo(0.4, 0).easing(cc.easeCubicActionIn()));
        this.stamp.runAction(cc.scaleTo(0.4, 0).easing(cc.easeCubicActionIn()));
		this.node.runAction(
            cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    this.gauge.runAction(cc.moveTo(0.4, -190, -1350).easing(cc.easeCubicActionIn()));
                    this.scoreBoard.runAction(cc.moveTo(0.4, 110, 1140).easing(cc.easeCubicActionIn()));
                }),
                cc.delayTime(0.4),
                cc.callFunc(() => {
                    cc.director.loadScene("introduction");
                })
            )
        )
	}
}