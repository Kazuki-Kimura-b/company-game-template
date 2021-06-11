const {ccclass, property} = cc._decorator;

@ccclass
export default class SceneChanger extends cc.Component {

    @property(cc.Node) coverNode :cc.Node = null;
    @property(cc.Button) buttons :cc.Button[] = [];
    
    
    /**
     * シーン開始時
     * @param callback 開始演出完了時
     */
    public sceneStart (callback:()=>void):void
    {
        this.coverNode.opacity = 255;
        this.coverNode.active = true;

        //カバーをフェードアウトで表示する
        this.coverNode.runAction
        (
            cc.sequence
            (
                cc.delayTime(0.4),
                cc.fadeTo(0.2, 0),
                cc.callFunc(callback)
            )
        );
    }
    

    /**
     * 次のシーンへ移動する
     * @param event 
     * @param callback 完了時
     */
    public sceneEnd (event:any, callback:()=>void):void
    {
		if (event)
		{
			let targetButton:cc.Node = event.target;
			this.buttonsLock(targetButton);
		}
		
        this.coverNode.opacity = 0;
        this.coverNode.active = true;
    	
    	//カバーをフェードインで表示する
    	this.coverNode.runAction
        (
            cc.sequence
            (
                cc.delayTime(0.4),
                cc.fadeTo(0.2, 255),
                cc.callFunc(callback)
            )
        );
    }


    /**
     * ボタンを押した時
     * @param event 
     * @param callback 
     */
    public pressAction (event:any, callback:()=>void):void
    {
        let targetButton:cc.Node = event.target;
        this.buttonsLock(targetButton);

        targetButton.runAction
        (
            cc.sequence
            (
                cc.delayTime(0.4),
                cc.callFunc(callback)
            )
        );
    }

    
    /**
     * 対象のボタンを押せなくし、他のボタンは非表示にする
     * @param targetButtonNode 
     */
    public buttonsLock (targetButtonNode:cc.Node):void
    {
        for (let i:number = 0 ; i < this.buttons.length ; i++)
    	{
    	    let btn:cc.Button = this.buttons[i];

    	    if (btn.node == targetButtonNode)
    		{
    		    btn.interactable = false;
    		}
    		else
    		{
    		    btn.node.active = false;
    		}
    	}
    }


    /**
     * すべてのボタンを押せるようにし、表示もする
     */
    public buttonsUnlock ():void
    {
        for (let i:number = 0 ; i < this.buttons.length ; i++)
        {
            let btn:cc.Button = this.buttons[i];
            btn.interactable = true;
            btn.node.active = true;
        }
    }
    
}
