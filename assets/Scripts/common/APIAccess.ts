import BugTracking from "./BugTracking";

const {ccclass, property} = cc._decorator;

@ccclass
export default class APIAccess {

    
    /**
     * クッキーまたはローカルストレージからトークンを取得（なければデベロッパートークン）
     * クッキーとローカルストレージにトークンがある場合はクッキーを使う
     */
    public static staticGetToken():string
    {
        let userChildTokenFromCookie:string = this.staticGetTokenFromCookie();
        let userChildTokenFromLocalStorage:string = this.staticGetTokenFromLocalStorage();

        let developToken = (
          location.hostname == "localhost" ||
          location.hostname == "s3-ap-northeast-1.amazonaws.com" ||
          location.hostname == "unkogakuen-game.s3-ap-northeast-1.amazonaws.com"
        ) ? "develop_token" : "";
        
        let userChildToken:string = userChildTokenFromCookie ? userChildTokenFromCookie : userChildTokenFromLocalStorage;
        let token:string = userChildToken ? userChildToken : developToken;

        //cc.log("USER_CHILD_TOKEN:" + userChildToken);
        //cc.log("TOKEN:" + token);

        return token;
    }

    public static isDevelopToken():boolean
    {
        return (APIAccess.staticGetToken() == "develop_token");
    }




    /**
     * ローカルストレージからトークンを取得
     */
    protected static staticGetTokenFromLocalStorage():string
    {
        let token:string = localStorage.getItem("userChildToken");
        return token;
    }

    /**
     * クッキーからトークンを取得
     */
    protected static staticGetTokenFromCookie():string
    {
        let cookies = new Array();
        if(document.cookie != '' && document.cookie != null)
        {
			let tmp:string[] = document.cookie.split('; ');
			for (let i = 0 ; i < tmp.length ; i++ )
          {
				let data:string[] = tmp[i].split('=');
            cookies[data[0]] = decodeURIComponent(data[1]);
          }
        }
		let tokenKey:string = "userChildToken";

		let token:string = cookies[tokenKey];

        return token;
    }




    /**
     * ホストのURL取得（スクールからURLが変更になった）
     */
    protected static staticGetHost():string
    {
        //return (location.hostname == "play.unkogakuen.com" || location.hostname == "app.unkogakuen.com") ? "https://unkogakuen.com" : "https://staging.unkogakuen.com";
        return "https://qadb.unkogakuen.com";
    }
    protected static staticGetUnkoGakuenHost():string
    {
        return "https://unkogakuen.com";
    }



    /**
     * うんこ式にあるコンテンツかどうか返す
     */
    protected static getUsFlg():number
    {
        return (location.pathname.substr(0, 11) == "/unko-shiki") ? 1 : 0;
    }

    

}
