import { PlayerData } from "../common/Models";

const {ccclass, property} = cc._decorator;


export class MenuSE
{
    public static clip:MenuSE = null;
    
    constructor
    (
        public menuBtnPress: cc.AudioClip,
        public modeSelect:cc.AudioClip,
        public roboGori:cc.AudioClip,
        public roboGoriSub:cc.AudioClip,
        public roboGachi:cc.AudioClip,
        public roboGachiSub:cc.AudioClip,
        public warpToGame:cc.AudioClip,
        public menuPageOpen:cc.AudioClip,
        public menuPageClose:cc.AudioClip,
        public collectionUnkoPut:cc.AudioClip,
        public gageUp:cc.AudioClip
    )
    {}
}



@ccclass
export default class MenuSEComponent extends cc.Component
{

    @property({type:cc.AudioClip}) menuBtnPress:cc.AudioClip = null;
    @property({type:cc.AudioClip}) modeSelect:cc.AudioClip = null;
    @property({type:cc.AudioClip}) roboGori:cc.AudioClip = null;
    @property({type:cc.AudioClip}) roboGoriSub:cc.AudioClip = null;
    @property({type:cc.AudioClip}) roboGachi:cc.AudioClip = null;
    @property({type:cc.AudioClip}) roboGachiSub:cc.AudioClip = null;
    @property({type:cc.AudioClip}) warpToGame:cc.AudioClip = null;
    @property({type:cc.AudioClip}) menuPageOpen:cc.AudioClip = null;
    @property({type:cc.AudioClip}) menuPageClose:cc.AudioClip = null;
    @property({type:cc.AudioClip}) collectionUnkoPut:cc.AudioClip = null;
    @property({type:cc.AudioClip}) gageUp:cc.AudioClip = null;


    start():void
    {
       MenuSE.clip = new MenuSE
       (
           this.menuBtnPress,
           this.modeSelect,
            this.roboGori,
            this.roboGoriSub,
            this.roboGachi,
            this.roboGachiSub,
            this.warpToGame,
            this.menuPageOpen,
            this.menuPageClose,
            this.collectionUnkoPut,
            this.gageUp
       );
    }

}

