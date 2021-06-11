const {ccclass, property} = cc._decorator;

@ccclass
export default class NegaEffector extends cc.Component
{
    @property(cc.Node) canvasNode:cc.Node = null;
    @property(cc.Camera) camera:cc.Camera = null;
    /** Built-in-spriteMaterial */
    @property(cc.Material) defaultSpriteMaterial:cc.Material = null;
    /** Neag Material */
    @property(cc.Material) negaMaterial:cc.Material = null;

    private _isNega:boolean = false;
    private _ignores:cc.Node[] = [];


    public setCanvasAndCamera(pCanvasNode:cc.Node, pCamera:cc.Camera):void
    {
        this.canvasNode = pCanvasNode;
        this.camera = pCamera;
    }


    /**
     * このnodeとその子はネガエフェクトの対象外にする
     * @param node 
     */
    public setIgnoreNode(node:cc.Node):void
    {
        this._ignores.push(node);
    }



    /**
     * ネガ反転
     */
    public setNega():void
    {
        if(this._isNega) return;
        this._changeAllMaterials(this.negaMaterial, this.defaultSpriteMaterial, true);
    }
    public setNegaWithBackGround():void
    {
        if(this._isNega) return;
        this._changeAllMaterials(this.negaMaterial, this.defaultSpriteMaterial, true);
        this._changeBackground();
    }


    /**
     * 元に戻す
     */
    public setDefault():void
    {
        if(! this._isNega) return;
        this._changeAllMaterials(this.defaultSpriteMaterial, this.negaMaterial, false);
    }
    public setDefaultWithBackGround():void
    {
        if(! this._isNega) return;
        this._changeAllMaterials(this.defaultSpriteMaterial, this.negaMaterial, false);
        this._changeBackground();
    }





    private _changeAllMaterials(toMaterial: cc.Material, fromMaterial:cc.Material, isNega:boolean)
	{
        this._isNega = isNega;
        
        let __func__:(node:cc.Node, isNega:boolean)=>void = (node:cc.Node, isNega:boolean)=>
		{
			// アニメーションの再生をとにかく停止、再開
            if(isNega) node.pauseAllActions();
            else node.resumeAllActions();
            
			for(let i:number = 0 ; i < node.childrenCount ; i ++)
			{
				//除外nodeなら、そのnodeとその子nodeは無視する
                let isIgnode:boolean = false;
                for(let k:number = 0 ; k < this._ignores.length ; k ++)
                {
                    if(node == this._ignores[k])
                    {
                        isIgnode = true;
                        break;
                    }
                }

                //ネガエフェクトの除外対象
                if(isIgnode) continue;
                
                let sprite:cc.Sprite = node.children[i].getComponent(cc.Sprite);
				
				if(sprite)
				{
					let spriteMat:cc.Material = sprite.getMaterial(0);

					if(spriteMat != null)
					{
						//cc.log(spriteMat.name);
						//cc.log(targetMaterial.name);
						//cc.log("----------------");

						let minLen:number = (spriteMat.name.length < fromMaterial.name.length) ? spriteMat.name.length : fromMaterial.name.length;

						if(spriteMat.name.substr(0, minLen) == fromMaterial.name.substr(0, minLen)) 
						{
							sprite.setMaterial(0, toMaterial);
						}
					}
				}
				else
				{
					let label:cc.Label = node.children[i].getComponent(cc.Label);

					if(label)
					{
						//label.setMaterial(0, material);
						label.node.color = cc.color(255 - label.node.color.getR(), 255 - label.node.color.getG(), 255 - label.node.color.getB());
					}
				}
				
				__func__(node.children[i], isNega);
			}
		};

		__func__(this.canvasNode, isNega);

        //大本だけはアニメーションを止めたりしない
        this.canvasNode.resumeAllActions();
    }
    

    private _changeBackground():void
    {
        if(this.camera == null) return;

        let col:cc.Color = this.camera.backgroundColor;
        this.camera.backgroundColor = cc.color(255 - col.getR(), 255 - col.getG(), 255 - col.getB());
    }


}
