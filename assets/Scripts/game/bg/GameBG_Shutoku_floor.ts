const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBG_Shutoku_floor extends cc.Component
{

    @property(cc.Node) baseNode:cc.Node = null;
    @property(cc.Node) signParentNode:cc.Node = null;
    @property(cc.Sprite) signNumSprite:cc.Sprite = null;

    
    /**
     * フロアの設定をする
     * @param floorNum 
     * @param floorColor 
     * @param floorNumSpriteFrame 
     * @returns 
     */
    public setup(floorNum:number, floorColor:cc.Color, floorNumSpriteFrame:cc.SpriteFrame):void
    {
        this.baseNode.color = floorColor;
        
        if(floorNum == -1)
        {
            this.signParentNode.active = false;
            return;
        }
        else if(floorNum == 1)
        {
            //フロア番号を少し左にずらす
            this.signParentNode.x = -10;
        }
        else if(floorNum == 10)
        {
            //フロア番号を少し右にずらす
            this.signParentNode.x = 10;
        }

        this.signNumSprite.spriteFrame = floorNumSpriteFrame;
    }





}
