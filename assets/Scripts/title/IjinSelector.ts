import { CPUData, OpponentCPU } from "../common/Models";
import PlayerStatusBar from "../common/PlayerStatusBar";
import SchoolAPI from "../common/SchoolAPI";
import SchoolText from "../common/SchoolText";
import IjinScreen from "../game/IjinScreen";
import UnkoGet from "../game/UnkoGet";
import StoryScreen from "../introduction/StoryScreen";
import StaticData from "../StaticData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class IjinSelector extends cc.Component
{

    @property(cc.Button) ijinBtns:cc.Button[] = [];
    @property(cc.Button) btnStory:cc.Button = null;
    @property(cc.Button) btnWin:cc.Button = null;
    @property(cc.Button) btnLose:cc.Button = null;
    @property(cc.Button) btnUnkoGet:cc.Button = null;
    @property(cc.Sprite) ijinIconSprite:cc.Sprite = null;
    @property(IjinScreen) ijinScreen:IjinScreen = null;
    @property(cc.Sprite) bgImageSprite:cc.Sprite = null;
    @property(cc.Node) storyScreenParentNode:cc.Node = null;
    @property(cc.Prefab) storyScreenPrefab:cc.Prefab = null;
    @property(cc.Prefab) playerStatusBarPrefab:cc.Prefab = null;
    @property(cc.Prefab) unkoGetPrefab: cc.Prefab = null;


    private _ijins:{ id:number, name:string }[] = null;
    private _canvas:cc.Canvas = null;
    private _contentsNode:cc.Node = null;
    private _markU:cc.Node = null;
    private _markR:cc.Node = null;
    private _loadedImgIcon:boolean = false;
    private _loadedImgIjin:boolean = false;
    private _loadedImgVerticalBg:boolean = false;
    private _page:number = 0;
    private _playerStatusBar:PlayerStatusBar = null;

    

    public setup(canvas:cc.Canvas, contentsNode:cc.Node, markU:cc.Node, markR:cc.Node):void
    {
        this._canvas = canvas;
        this._contentsNode = contentsNode;
        this._markU = markU;
        this._markR = markR;
        
        this.btnStory.interactable = false;
        this.btnWin.interactable = false;
        this.btnLose.interactable = false;
        this.btnUnkoGet.interactable = false;
        this.ijinIconSprite.node.active = false;

        this.ijinScreen.setup();
        this.ijinScreen.hide();
        this.ijinScreen.ijinScaleTo(IjinScreen.SCALE_STORY, 0);
        this.ijinScreen.ijinMoveTo(cc.v2(0,IjinScreen.Y_STORY), 0);


        let psbNode:cc.Node = cc.instantiate(this.playerStatusBarPrefab);
        this._playerStatusBar = psbNode.getComponent(PlayerStatusBar);
        this._playerStatusBar.setup(this._canvas.node);
        this._playerStatusBar.statusUpdate(StaticData.playerData);
        this.node.addChild(psbNode);
        this._playerStatusBar.node.active = false;


        //後々エラーが出る箇所があるのでいれる
        SchoolAPI.opponentCPUs((response:OpponentCPU)=>{ StaticData.opponentCPUs = response; });

        SchoolAPI.ijins((response:{id:number, short_name:string}[])=>
        {
            this._ijins = [];
            for(let i:number = 0 ; i < response.length ; i ++)
            {
                this._ijins.push({ id:response[i].id, name:SchoolText.getTextString(response[i].short_name).textStr });
            }

            this._updateButtons();
        });
    }


    private _updateButtons():void
    {
        let btnCount:number = this.ijinBtns.length;
        
        for(let i:number = 0 ; i < btnCount ; i ++)
        {
            let index:number = btnCount * this._page + i;
            let label:cc.Label = this.ijinBtns[i].getComponentInChildren(cc.Label);
            label.string = (index + 1) + ": " + this._ijins[index].name;
        }
    }



    public onPressPageButton(event:any, code:string):void
    {
        this._page = Number(code);
        this._updateButtons();
    }

    public onPressIjinButton(event:any, code:string):void
    {
        this.btnStory.interactable = false;
        this.btnWin.interactable = false;
        this.btnLose.interactable = false;
        this.btnUnkoGet.interactable = false;
        this.ijinIconSprite.node.active = false;
        this._loadedImgIcon = false;
        this._loadedImgIjin = false;
        this._loadedImgVerticalBg = false;

        let index:number = this._page * this.ijinBtns.length + Number(code);

        //登録された偉人よりも大きいボタンを押した場合キャンセル
        if(index >= this._ijins.length) return;

        let ID:number = this._ijins[index].id;

        SchoolAPI.ijinFromID(ID, (response:CPUData)=>
        {
            StaticData.setIjinDataForPrevieMode(response);

            //画像を取得する
            this._loadIjinImages();
        });
    }


    private _loadIjinImages():void
    {
        SchoolAPI.loadImage("icon", StaticData.ijinData.icon_image_url, (response:any)=>
        {
            this._loadedImgIcon = true;
            StaticData.ijinData.iconSpriteFrame = response.image;
            this._loadedImageCheck();
        });
        SchoolAPI.loadImage("ijin", StaticData.ijinData.ijin_image_url, (response:any)=>
        {
            this._loadedImgIjin = true;
            StaticData.ijinData.ijinImageSpriteFrame = response.image;
            this._loadedImageCheck();
        });
        SchoolAPI.loadImage("bg", StaticData.ijinData.vertical_background_image_url, (response:any)=>
        {
            this._loadedImgVerticalBg = true;
            StaticData.ijinData.verticalBGSpriteFrame = response.image;
            this._loadedImageCheck();
        });
    }


    private _loadedImageCheck():void
    {
        //まだ読み込み完了してない
        if(! this._loadedImgIcon || ! this._loadedImgIjin || ! this._loadedImgVerticalBg) return;

        this.btnStory.interactable = true;
        this.btnWin.interactable = true;
        this.btnLose.interactable = true;
        this.btnUnkoGet.interactable = true;

        this.ijinIconSprite.node.active = true;
        this.ijinIconSprite.spriteFrame = StaticData.ijinData.iconSpriteFrame;
    }


    public onStoryButton(event:any):void
    {
        let script:string = StaticData.ijinData.appearance_script;
        if(script == null) script = "null";
        this._showStoryScreen(script);
    }

    public onWinButton(event:any):void
    {
        let script:string = StaticData.ijinData.win_script;
        if(script == null) script = "null";
        this._showStoryScreen(script);
    }

    public onLoseButton(event:any):void
    {
        let script:string = StaticData.ijinData.lose_script;
        if(script == null) script = "null";

        //let scriptB:string = StaticData.ijinData.unko_get_script;
        //if(script == null) scriptB = "null";

        //this._showStoryScreen(script + "\n" + scriptB);
        this._showStoryScreen(script);
    }

    public onUnkoGetButton(event:any):void
    {
        let unkoGetNode:cc.Node = cc.instantiate(this.unkoGetPrefab);
		let unkoGet:UnkoGet = unkoGetNode.getComponent(UnkoGet);
		
		unkoGet.setup(null, ()=>
		{
			unkoGetNode.removeFromParent();
		});

		this.node.addChild(unkoGetNode);
    }



    private _showStoryScreen(scripts:string):void
    {
        this.bgImageSprite.node.active = true;
        this.bgImageSprite.spriteFrame = StaticData.ijinData.verticalBGSpriteFrame;

        this.ijinScreen.node.active = true;
        this.ijinScreen.setIjinImage(StaticData.ijinData.ijinImageSpriteFrame);

        let storyScreenNode:cc.Node = cc.instantiate(this.storyScreenPrefab);
		this.storyScreenParentNode.addChild(storyScreenNode);

        let storyScreen:StoryScreen = storyScreenNode.getComponent(StoryScreen);
        storyScreen.setup(this.ijinScreen, this._playerStatusBar, this._canvas.node);
        storyScreen.setupStory(StaticData.ijinData.short_name, scripts);
        storyScreen.onComplete(()=>
        {
            //ゴリベンの偉人との会話終わり
            this.bgImageSprite.node.active = false;
            this.ijinScreen.node.active = false;
            storyScreenNode.removeFromParent(true);

            this._playerStatusBar.node.active = false;
        });
        storyScreen.startStory();
    }


    public onCloseButton(event:any):void
    {
        this.node.removeFromParent(true);
    }

}
