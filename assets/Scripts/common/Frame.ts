const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node) top: cc.Node = null;
    @property(cc.Node) bottom: cc.Node = null;
    @property(cc.Node) left: cc.Node = null;
    @property(cc.Node) right: cc.Node = null;

    _w: number = null;
    _h: number = null;
    start () {
        this._w = window.innerWidth;
        this._h = window.innerHeight;
        this.fitFrames();
    }

    fitFrames(): void {
        let gameW: number;
        let gameH: number;

        this.left.position.x = -375;
        this.right.position.x = 375;

        if (this._h >= this._w * 1100 / 750) {

            gameW = 750 * 750 / this._w;
            gameH = this._h * gameW / 750;

            // 縦長デバイスのとき
            if (gameH >= 1600) {
                this.top.position.y = 800;
                this.bottom.position.y = -800;
            } else {
                this.top.position.y = gameH /2;
                this.bottom.position.y = gameH /2 * -1;
            }
        } else {
            // 横長デバイスのとき
            this.top.position.y = -550;
            this.bottom.position.y = 550;

            gameH = 1100 * 1100 / this._h;
            gameW = this._w * gameH / 1100;
        }
    }
}
