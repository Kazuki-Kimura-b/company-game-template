const {ccclass, property} = cc._decorator;

@ccclass
export default class GameIcon extends cc.Component
{
    @property(cc.Sprite) image: cc.Sprite = null;
    @property(cc.Button) btn: cc.Button = null;

    url: string = null;

    start () {}

    public setBtnURL(url: string): void {
        this.url = url;
    }

    private onPressBtn(): void {
        window.open(this.url, "_brank");
    }
}