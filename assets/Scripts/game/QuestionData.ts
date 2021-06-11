const {ccclass, property} = cc._decorator;

@ccclass
export default class QuestionData
{

    public json:{};
    
    /** ID */
    public id: string;
    /** レベル */
    public level: number;
    /** 問題フォーマット */
    public format: string;
    /** 教科 */
    public subject: string;
    /** 優先順位 */
    public order: number;
    /** 問題文 */
    public question: string;
    /** 問題画像 */
    public question_image: string;
    /** 画像のサイズ(normal / large) */
    public zuhan_size: string;
    /** 正解率 */
    public correct_answer_rate: number;
    /** 挑戦回数 */
    public challenging_num: number;

    /** 正解 */
    public correct_answer: string;
    /** 解説画像 */
    public explain_image: string;
    /** 解説文 */
    public explain_long: string;
    /** 解説文ショート */
    public explain_short: string;

    /** ゴーストの回答までの時間 */
    public ghost_required_time: number;
    /** ゴーストが正解したかどうか */
    public ghost_result: boolean;
    
    /** ヒント1 */
    public hint1: string;
    /** ヒント2 */
    public hint2: string;
    /** ヒント3 */
    public hint3: string;
    
    /** 回答1 */
    public option1: string;
    /** 回答2 */
    public option2: string;
    /** 回答3 */
    public option3: string;
    /** 回答4 */
    public option4: string;
    /** 回答5 */
    public option5: string;
    /** 回答6 */
    public option6: string;
    /** 回答7 */
    public option7: string;
    /** 回答8 */
    public option8: string;
    /** 回答中のセリフ1 */
    public script_thinking1: string;
    /** 回答中のセリフ2 */
    public script_thinking2: string;
    /** 回答中のセリフ3 */
    public script_thinking3: string;
    /** 名言の場合は人物も含まれる */
    public script_thinking_uttered_by3:string;
    /** 回答決定時のセリフ1 */
    public script_enter1:string;
    /** 回答決定時のセリフ2 */
    public script_enter2:string;
    /** 正解時のセリフ */
    public script_correct:string;
    /** 不正解時のセリフ */
    public script_incorrect:string;
    /** 回答5秒時のセリフ */
    public script_fastest:string;
    /** 回答10秒時のセリフ */
    public script_fast:string;
    /** 回答20秒時のセリフ */
    public script_normal:string;
    /** 連続正解時のセリフ */
    public script_combo:string;

    /**
     * jsonファイルからQuestionDataを作成する
     * @param json jsonファイル
     */
    public static jsonParse(json:any):QuestionData
    {
        let q:QuestionData = new QuestionData();

        q.json = json;
        q.id = json.id;
        q.level = json.level;
        q.format = json.format;
        q.subject = json.subject;
        q.order = json.order;
        q.question = json.question;
        q.question_image = json.question_image;
        q.zuhan_size = json.zuhan_size;
        q.correct_answer_rate = json.correct_answer_rate;
        q.challenging_num = json.challenging_num;
        q.correct_answer = json.correct_answer;
        q.explain_image = json.explain_image;
        q.explain_long = json.explain_long;
        q.explain_short = json.explain_short;
        q.ghost_required_time = json.ghost_required_time;
        q.ghost_result = json.ghost_result;
        q.hint1 = json.hint1;
        q.hint2 = json.hint2;
        q.hint3 = json.hint3;
        q.option1 = json.option1;
        q.option2 = json.option2;
        q.option3 = json.option3;
        q.option4 = json.option4;
        q.option5 = json.option5;
        q.option6 = json.option6;
        q.option7 = json.option7;
        q.option8 = json.option8;
        q.script_thinking1 = json.script_thinking1;
        q.script_thinking2 = json.script_thinking2;
        q.script_thinking3 = json.script_thinking3;
        q.script_thinking_uttered_by3 = json.script_thinking_uttered_by3;
        q.script_enter1 = json.script_enter1;
        q.script_enter2 = json.script_enter2;
        q.script_correct = json.script_correct;
        q.script_incorrect = json.script_incorrect;
        q.script_fastest = json.script_fastest;
        q.script_fast = json.script_fast;
        q.script_normal = json.script_normal;
        q.script_combo = json.script_combo;

        return q;
    }


    /**
     * jsonファイルの配列から複数のQuestionDataを作成
     * @param datas jsonファイルの配列
     */
    public static createQuestionDatas(datas:any[]):QuestionData[]
    {
        let qDatas:QuestionData[] = [];
        for(let i:number = 0 ; i < datas.length ; i ++)
        {
            qDatas.push(QuestionData.jsonParse(datas[i]));
        }
        return qDatas;
    }


    /**
     * 回答リストをすべてシャッフルする（nullの項目はのぞく）
     */
    public shuffleAllOptions():void
    {
        let options:string[] = [ this.option1, this.option2, this.option3, this.option4, this.option5, this.option6, this.option7, this.option8 ];
        let list:string[] = [];
        
        for(let i:number = 0 ; i < 8 ; i ++)
        {
            if(options[i] != null && options[i] != "")
            {
                list.splice(Math.floor(Math.random() * (list.length + 1)), 0, options[i]);
            }
        }

        if(list.length > 0) this.option1 = list[0];
        if(list.length > 1) this.option2 = list[1];
        if(list.length > 2) this.option3 = list[2];
        if(list.length > 3) this.option4 = list[3];
        if(list.length > 4) this.option5 = list[4];
        if(list.length > 5) this.option6 = list[5];
        if(list.length > 6) this.option7 = list[6];
        if(list.length > 7) this.option8 = list[7];
    }


    /**
     * 回答リストごとにセミコロンで区切ったワードをシャッフルする
     * スロット問題、グルーピング
     */
    public shuffleSemicolonOptions():void
    {
		this.option1 = this.shuffleSemicolonWord(this.option1);
		this.option2 = this.shuffleSemicolonWord(this.option2);
		this.option3 = this.shuffleSemicolonWord(this.option3);
		this.option4 = this.shuffleSemicolonWord(this.option4);
		this.option5 = this.shuffleSemicolonWord(this.option5);
		this.option6 = this.shuffleSemicolonWord(this.option6);
		this.option7 = this.shuffleSemicolonWord(this.option7);
		this.option8 = this.shuffleSemicolonWord(this.option8);
    }


    public shuffleSemicolonWord(word:string):string
    {
        if(word == null || word == "") return word;

        let list:string[] = word.split(";");
        let newList:string[] = [];

        for(let i:number = 0 ; i < list.length ; i ++)
        {
            let num:number = Math.floor(Math.random() * (newList.length + 1));
            newList.splice(num, 0 , list[i]);
        }

        let rtnWord:string = "";
        for(let i:number = 0 ; i < newList.length ; i ++)
        {
            rtnWord += newList[i] + ";";
        }

        rtnWord = rtnWord.substr(0, rtnWord.length - 1);
        return rtnWord;
    }


    
}