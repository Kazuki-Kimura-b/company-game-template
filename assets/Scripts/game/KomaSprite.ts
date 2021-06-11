const {ccclass, property} = cc._decorator;

@ccclass
export default class KomaSprite extends cc.Component {

    @property(cc.SpriteFrame) spriteFrames: cc.SpriteFrame[] = [];

    private _sprite:cc.Sprite = null;


    public setFrame(index:number):void
    {
        if(this._sprite == null) this._sprite = this.getComponent(cc.Sprite);
        this._sprite.spriteFrame = this.spriteFrames[index];
    }
}
