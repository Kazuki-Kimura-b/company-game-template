import SchoolText from "../common/SchoolText";
import STFormat from "../common/STFormat";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Stamp extends cc.Component
{
    @property(SchoolText) nameOutput: SchoolText = null;
    @property(cc.Sprite) unko: cc.Sprite = null;
	@property(cc.Node) fukidashi: cc.Node = null;

    public setName(name: string): void {
        let format:STFormat = STFormat.create({
			size: 36,
			margin: 2,
			lineHeight: 60,
			rows: 2,
			columns: 8,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_CENTER,
			color: cc.color(0,0,0),
			yomiganaSize: 20,
			yomiganaMarginY: 2
		});
        this.nameOutput.createText(name, format);
		this.nameOutput.reLayoutText();
    }

	private onPressStamp(): void {
		let parent: cc.Node = this.node.parent;
		for (let i =0; i < parent.children.length; i++) {
			parent.children[i].getChildByName("fukidashi").active = false;
		}
		this.fukidashi.active = true;
	}
}