import { NavigatorConversations, PlayerData } from "../common/Models";
import NegaEffector from "../common/NegaEffector";
import PlayTrackLog from "../common/PlayTrackLog";
import SchoolAPI from "../common/SchoolAPI";
import SE from "../common/SE";
import SystemIcon from "../common/SystemIcon";
import FinishScreen from "../game/FinishScreen";
import NextIjinWarp from "../game/NextIjinWarp";
import StaticData, { EasingName, GameMode, SpecialEvent } from "../StaticData";
import EventUnkoSensei from "./EventUnkoSensei";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Opening_B_Main extends cc.Component
{
    @property(cc.Canvas) canvas:cc.Canvas = null;
    @property(cc.Node) contentsNode:cc.Node = null;
    @property(cc.Node) finishScreenParentNode:cc.Node = null;
    @property(cc.Node) markU:cc.Node = null;
    @property(cc.Node) markR:cc.Node = null;
    @property(cc.Prefab) nextIjinWarpPrefab:cc.Prefab = null;
    @property(cc.Prefab) sceneLoadIndicator: cc.Prefab = null;
    @property(cc.Prefab) eventUnkoSenseiPrefab: cc.Prefab = null;
    @property(cc.Prefab) finishScreenPrefab: cc.Prefab = null;

    private _eventUnkoSensei:EventUnkoSensei = null;

    

    start ()
    {
        PlayTrackLog.add("Opening_B_Main.start()");
        
        //単体テスト
        if(! StaticData.playerData)
        {
            cc.log("単体テスト");
            //StaticData.playerData = new PlayerData("A", false, 0, 100, 0, null, 1, 50, "Test", 1.0, true, "");
            
            SchoolAPI.dummyDataMode();		//API使わずダミーの値を返すようにする
            SchoolAPI.titlePage((response:PlayerData)=>
            {
                StaticData.playerData = response;
                SE.SE_Enabled = true;
                SE.BGM_Enabled = true;
            });

            //StaticData.specialEvent = SpecialEvent.GHOST_START;
            StaticData.specialEvent = SpecialEvent.OPENING_B;
            //StaticData.specialEvent = SpecialEvent.KAKUNIN_START;
        }
        

        PlayTrackLog.add("Opening_B_Main._setup()");

        let node:cc.Node = cc.instantiate(this.eventUnkoSenseiPrefab);
        //this.contentsNode.addChild(node);
        this.contentsNode.insertChild(node, 0);
        this._eventUnkoSensei = node.getComponent(EventUnkoSensei);
        this._eventUnkoSensei.setup(this.canvas, StaticData.specialEvent);





        if(StaticData.specialEvent == SpecialEvent.OPENING_B)
        {
            this._delayedCall(0.8, ()=>
            {
                //オープニングBを開始
                this._startOpeningB();
            });
        }
        else if(StaticData.specialEvent == SpecialEvent.KAKUNIN_START || StaticData.specialEvent == SpecialEvent.KAKUNIN_END)
        {
            this._delayedCall(0.8, ()=>
            {
                //中間テスト、期末テストを開始
                this._startKakuninTest();
            });
        }
        else if(StaticData.specialEvent == SpecialEvent.GHOST_START || StaticData.specialEvent == SpecialEvent.GHOST_END)
        {
            this._startFromFinishScreen(GameMode.GHOST, ()=>
            {
                //ゴースト開始
                this._startGhost();
            });
        }

        
    }


    private _delayedCall(delayTime:number, callback:()=>void):void
    {
        cc.tween({})
        .delay(delayTime)
        .call(()=>
        {
            callback();
        })
        .start();
    }



    private _startFromFinishScreen(gameMode:GameMode, callback:()=>void):void
    {
        let node:cc.Node = cc.instantiate(this.finishScreenPrefab);
        this.finishScreenParentNode.addChild(node);
        let finishScreen:FinishScreen = node.getComponent(FinishScreen);
        finishScreen.setupWithCloseAtGameMode(gameMode);
        finishScreen.endFinishAction(()=>
        {
            callback();
        });
    }


    /**
     * オープニング後半を開始
     */
    private _startOpeningB():void
    {
        PlayTrackLog.add("Opening_B_Main._startOpeningB()");
        
        // 次のシーンを事前に読み込む
        cc.director.preloadScene("introduction");
        
        // ストーリーを取得
        let script:string = this._getScript();

        this._eventUnkoSensei.startEventStory(script, ()=>
        {
            PlayTrackLog.add("Opening_B_Main:ストーリー終了");
            this._timeHole("introduction");
        });
    }


    /**
     * 確認テストのイベントを開始
     */
    private _startKakuninTest():void
    {
        PlayTrackLog.add("Opening_B_Main._startKakuninTest()");

        // APIからテキスト入手
        SchoolAPI.navigatorConversations(NavigatorConversations.CATEGORY_MIDTERM, (response:NavigatorConversations)=>
        {
            let script:string = (StaticData.specialEvent == SpecialEvent.KAKUNIN_START) ? response.navigate[0] : response.result[0];
            
            this._eventUnkoSensei.startEventStory(script, ()=>
            {
                PlayTrackLog.add("Opening_B_Main:確認テスト演出終了");

                if(StaticData.specialEvent == SpecialEvent.KAKUNIN_START) this._timeHole("game");
                else if(StaticData.specialEvent == SpecialEvent.KAKUNIN_END) this._timeHole("menu");
            });
        });
    }



    /**
     * ゴーストのイベントを開始
     */
    private _startGhost():void
    {
        PlayTrackLog.add("Opening_B_Main._startGhost()");

        // APIからテキスト入手
        SchoolAPI.navigatorConversations(NavigatorConversations.CATEGORY_GHOST, (response:NavigatorConversations)=>
        {
            let script:string;
            if(StaticData.specialEvent == SpecialEvent.GHOST_START) script = response.navigate[0];
            else if(StaticData.specialEvent == SpecialEvent.GHOST_END) script = (StaticData.ghostWin) ? response.win_result[0] : response.lose_result[0];
            
            this._eventUnkoSensei.startEventStory(script, ()=>
            {
                PlayTrackLog.add("Opening_B_Main:ゴースト演出終了");
            
                if (StaticData.specialEvent == SpecialEvent.GHOST_START) this._timeHole("game");
                else if (StaticData.specialEvent == SpecialEvent.GHOST_END) this._timeHole("menu");
            });
        });
    }





    private _timeHole(sceneName:string):void
    {
        let node:cc.Node = cc.instantiate(this.nextIjinWarpPrefab);
        this.contentsNode.addChild(node);

        let nextIjinWarp:NextIjinWarp = node.getComponent(NextIjinWarp);
        nextIjinWarp.setup(()=>
        {
            
            //ロードアイコン表示
            let loadIcon:SystemIcon = SystemIcon.create(this.sceneLoadIndicator);
            loadIcon.setup(StaticData.TIME_LOAD_SCENE_ICON);
            
            cc.director.preloadScene(sceneName, ()=>{}, (error:Error)=>
            {
                //ロード完了
                loadIcon.remove();      //ロードアイコンを消す

                cc.director.loadScene(sceneName);
            });
        });
    }


    


    
    private _getScript():string
    {
        let playerName:string = StaticData.playerData.nickname;
        
        let script:string =
        "<reset_status>" +
        "<y>こ、ここは…？</y>" +
        "<i>よく{来,き}たのぅ…</i>" +
        "<callback,faceChange,warui>" +
        "<callback,senseiFadeIn,stop>" +
        "<i>…</i>" +
        "<callback,faceChange,tere>" +
        "<i>…えーっと、\n{名前,なまえ}、なんじゃっけ？</i>" +
        "<n>{君,きみ}の{名前,なまえ}をおしえて！</n>" +
        "<callback,nameInput,stop>" +
        "<i>すまんすまん、\nもう{一回,いっかい}はじめから…</i>" +
        "<y>こ、ここは…？</y>" +
        "<callback,faceChange,normal>" +
        "<i>…（コホン）</i>" +
        "<callback,faceChange,warui>" +
        "<i>よく{来,き}たのぅ、__NAME__。</i>" +
        "<y>だ、だれ？</y>" +
        "<i>わしか？</i>" +
        "<callback,bgm,TRUE>" +
        "<callback,lightOn>" +
        "<callback,faceChange,smile>" +
        "<callback,effect,kouhun>" +
        "<i>わしはうんこ{先生,せんせい}じゃ。</i>" +
        "<callback,effect,end>" +
        "<i>{突然,とつぜん}じゃが、\n__NAME__よ…</i>" +
        "<callback,unazuki>" +
        "<i>おぬし、{天才,てんさい}になりたいか？</i>" +
        //-- select 1 ----
        "<select,はい、なりたい！,{別,べつ}に…>" +
        // answer A
        "<answer>" +
        "<callback,faceChange,kouhun>" +
        "<callback,effect,kirakira>" +
        "<i>うむ。{正直,しょうじき}でよろしい！</i>" +
        "</answer>" +
        // answer B
        "<answer>" +
        "<callback,faceChange,angry>" +
        "<callback,effect,ikari>" +
        "<i>{正直,しょうじき}になるのじゃ！</i>" +
        "<i>{天才,てんさい}になりたいじゃろ！</i>" +
        "<y>じ、{実,じつ}はそうなんだけど…</y>" +
        "</answer>" +
        //----------------
        "<callback,faceChange,normal>" +
        "<callback,effect,end>" +
        "<y>でも、なんで{知,し}ってるの？</y>" +
        "<callback,effect,kouhun>" +
        "<i>わしをだれだと{思,おも}っておる！</i>" +
        "<callback,faceChange,kouhun>" +
        "<callback,effect,kirakira>" +
        "<i>うんこはなんでも\n{知,し}っておるのじゃ！</i>" +
        "<y>そうなの？\nよくわかんないけど…</y>" +
        "<callback,faceChange,smile>" +
        "<callback,effect,end>" +
        "<i>そこでじゃ…</i>" +
        "<callback,effect,kirakira>" +
        "<i>__NAME__を\n{天才,てんさい}にしてやろう！</i>" +
        "<callback,effect,end>" +
        "<y>{本当,ほんとう}！？\nどうやったらなれるの？</y>" +
        "<callback,bodyChange,handUp>" +
        "<i>フォフォフォ、\nよくぞ{聞,き}いてくれたのぅ！\nこれを{見,み}るのじゃ！</i>" +
        "<callback,bgm,FALSE>" +
        "<callback,senseiVisible,FALSE>" +
        "<callback,semiFlyAndShow,stop>" +
        "<i>これはわしが20{年,ねん}かけて\n{開発,かいはつ}したタイムマシン、\n「うんこゼミ」じゃ！</i>" +
        "<i>このうんこゼミに{乗,の}れば、\n{歴史上,れきしじょう}の{偉人,いじん}、つまりたくさんの\n{天才,てんさい}たちに{出会,であ}えるぞい。</i>" +
        "<i>{世界中,せかいじゅう}をタイムトラベルして、\n{歴史上,れきしじょう}の{偉人,いじん}たちと{友,とも}だちに\nなりながら、</i>" +
        "<i>かしこくなるための{修行,しゅぎょう}を\nするのじゃ～～！</i>" +
        "<callback,semiEffect,FALSE>" +
        "<callback,semiHide,stop>" +
        "<callback,senseiVisible,TRUE>" +
        "<callback,bgm,TRUE>" +
        "<y>え～、{偉人,いじん}と{友,とも}だちになるなんて、\nできるのかなあ…</y>" +
        "<callback,faceChange,normal>" +
        "<callback,bodyChange,normal>" +
        "<callback,effect,kirakira>" +
        "<i>{大丈夫,だいじょうぶ}じゃ！\nまずは{今,いま}の__NAME__の\n{天才,てんさい}パワーをはかってみようかの。</i>" +
        "<callback,sePlay,statusShow>" +
        "<show_status>" +
        "<callback,effect,end>" +
        "<i>どれどれ…</i>" +
        //"<callback,sePlay,expUp>" +
        "<tensai_power,400>" +
        "<callback,sePlay,expEnd>" +
        "<callback,unazuki>" +
        "<i>ふむ、400くらいか。</i>" +
        "<i>まぁ、ふつうじゃの。</i>" +
        //-- select 2 ----
        "<select,え！ふつうなの？,うそだ！もう{一度,いちど}はかって！>" +
        // answer A
        "<answer>" +
        "<callback,unazuki>" +
        "<i>ふつうじゃな。</i>" +
        "</answer>" +
        // answer B
        "<answer>" +
        "<reset_status>" +
        "<i>では、もう一度…。</i>" +
        //"<callback,sePlay,expUp>" +
        "<tensai_power,400>" +
        "<callback,sePlay,expEnd>" +
        "<callback,unazuki>" +
        "<i>やっぱり、400じゃ。\nふつうじゃな。</i>" +
        "</answer>" +
        //----------------
        "<callback,negaEffect, stop>" +
        "<y><f>ガーン！</f></y>" +
        "<y>ふつう…</y>" +
        "<i>しかし、\n「{今,いま}は」の{話,はなし}じゃから{安心,あんしん}せい。</i>" +
        "<callback,effect,kouhun>" +
        "<i>これから{天才,てんさい}パワーは\nどんどん{上,あ}がるぞ。{楽,たの}しみじゃな。</i>" +
        "<callback,semiFly,0>" +
        "<callback,effect,end>" +
        "<callback,faceChange,warui>" +
        "<i>では、さっそく{出発,しゅっぱつ}じゃ！</i>" +
        "<y>え、ひとりで{行,い}くの？？？</y>" +
        "<y>このマシン、あばれてますけど？？</y>" +
        "<y>いやいや、まだ{心,こころ}の{準備,じゅんび}が〜！！！</y>" +
        //"<callback,senseiVisible,FALSE>" +
        "<callback,senseiScale0>" +
        "<callback,semiShow,stop>" +
        "<i>これでよし！\n{学,まな}びは、{遊,あそ}びじゃ。</i>" +
        "<i>{楽,たの}しんでくるのじゃぞ～～！！！</i>" +
        "<callback,bgm,FALSE>" +
        "<callback,sePlay,jet>" +
        "<callback,semiHide,stop>" +
        "<callback,lightOff>" +
        "<n>{強引,ごういん}にタイムマシンに{乗,の}せられた\n__NAME__。</n>" +
        "<n>はたして{偉人,いじん}と\n{友,とも}だちになれるのか。</n>" +
        "<n>{偉人,いじん}の{友,とも}だち100{人,にん}できるかな？\nへの{挑戦,ちょうせん}が、いま{始,はじ}まった…</n>";
        
        return script;
    }



}
