import { CollectionItem, ComboRanking } from "../common/Models";
import StaticData from "../StaticData";
import QuestionData from "./QuestionData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestLocalData extends cc.Component {


    @property(cc.SpriteFrame) dummyQ1ChinaImg: cc.SpriteFrame = null;
	@property(cc.SpriteFrame) dummyQ1JapanImg: cc.SpriteFrame = null;
	@property(cc.SpriteFrame) dummyQ2TenkaiImg: cc.SpriteFrame = null;
	@property(cc.SpriteFrame) dummyQ2RokkakuImg: cc.SpriteFrame = null;
	@property(cc.SpriteFrame) dummyQ2GokakuImg: cc.SpriteFrame = null;
	@property(cc.SpriteFrame) dummyQ3ToiImg: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) dummyIjinImg: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) dummyBGImg: cc.SpriteFrame = null;



    public getQuestionNum():number
    {
        let QNum:number = 0;
        //QNum = 2;
        //QNum = 3;//ヨコ2択
        //QNum = 4;
        //QNum = 5;   //ノーヒント
        //QNum = 6;//画像だけ問題確認もできるやつ
        //QNum = 7;//マルバツ
        //QNum = 10;//スクエア4択
        //QNum = 11;//ヨコ4択
        //QNum = 12;
        //QNum = 13;//複数回答
        //QNum = 14;//順番
        //QNum = 16;//スロット
        //QNum = 18;//?が溢れるパターン
        //QNum = 20;//ペアリング
        //QNum = 21;//グルーピング
        //QNum = 23;//タテ4択
        //QNum = 24;//ならべかえ
        //QNum = 25;//連想
        //QNum = 26;
        //QNum = 31;//虫食い
        //QNum = 32;
        
        return QNum
    }


    public bigData():QuestionData[]
    {
        let datas:{}[] =
        [
            /*
            //表示されない
            {
                id:"000005_3",
                question:"この計算は、何÷何と同じ？",
                correct_answer:"19.5÷65",
                option1:"19.5÷65",
                option2:"195÷65",
                option3:"",
                option4:"",
                option5:"",
                option6:"",
                option7:"",
                option8:"",
                hint1:"ひっ算で言うと、小数点を右にずらす。",
                hint2:"ひとつずつね。",
                hint3:"",
                question_image:"000005_3.png",
                explain_image:"000005_3_e.jpg",
                explain_long:"小数÷小数の計算は、小数点をずら\nして整数にする楽に計算できる。",
                explain_short:"小数点を右にずらして、整数をつくろう！",
                subject:"算数",
                grade:5,
                format:"タテ2択",
                genre:"数と計算",
                level:2,
                zuhan_size:"normal"
            },

            //表示される
            {
                id:"000019_5",
                question:"",
                correct_answer:"FALSE",
                option1:"",
                option2:"",
                option3:"",
                option4:"",
                option5:"",
                option6:"",
                option7:"",
                option8:"",
                hint1:"分母をそろえて！",
                hint2:"2と3の最小公倍数？",
                hint3:"分母は3+2。",
                question_image:"000019_5.jpg",
                explain_image:"",
                explain_long:"解説ロング",
                explain_short:"解説ショート",
                subject:"算数",
                grade:5,
                format:"マルバツ",
                genre:"数と計算",
                level:3,
                zuhan_size:"large"
            },
            */


            /*
            //--dummy2   --- 右の回答ボタンのテキストがずれるバグの確認用 ---
            {
                correct_answer: "100",
                explain_image: null,
                explain_long: "平均は、個数に関係なく一定です。",
                explain_short: "平均は、個数に関係なく一定です。",
                format: "ヨコ2択",
                hint1: "普通に10倍じゃないの？",
                hint2: "え、違うんじゃない？",
                hint3: "10個調べても1000個調べても、平均はほぼ同じ。",
                id: "000505_1",
                level: 1,
                option1: "100",
                option2: "5000",
                order: null,
                question: "みかんの重さを5{個,こ}調べたら{平均,へいきん}100gだった。みかんの重さを50{個,こ}調べたら{平均,へいきん}〓gくらい？",
                question_image: null,
                script_combo: "[X]コンボ！",               //連続正解時のセリフ
                script_correct: "次もがんばろう！",         //正解時のセリフ
                script_enter1: "僕は間違えた…",             //回答決定時のセリフ1
                script_enter2: "わたしは間違えた…",         //回答決定時のセリフ2
                script_fast: "いいペース！",                //回答10秒時のセリフ
                script_fastest: "は、はやい！",             //回答5秒時のセリフ
                script_incorrect: "ちがった…",              //不正解時のセリフ
                script_normal: "この調子でがんばろう！",     //回答20秒時のセリフ
                script_thinking1: "むずかしい…",            //回答中のセリフ1
                script_thinking2: "わかんないな…",          //回答中のセリフ2
                script_thinking3: "ヒントほしいなー",        //回答中のセリフ3
                subject: "理科"
            },
            */
            
            
            /*
            //--dummy   --- テキスト無しで画像のみの問題の確認用 ---
            {
                subject: "算数",
                id: "460000000004",
                grade: 6,
                genre: "算数",
                category: "図形",
                subCategory: "図形",
                question_image: "Q2tenkai.png",
                format: "ヨコ2択",
                question: null,
                correct_answer: "Q2Gokakuchu.png",//五角柱
                option1: "Q2Rokkakuchu.png",//六角柱
                option2: "Q2Gokakuchu.png",//五角柱
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "ハサミで切ってみよう",
                hint2: "いやいや、紙じゃないし",
                hint3: ""
            },
            */
            

            /*
            //--0
            {
                subject: "算数",
                explain_long: "長い{説明,せつめい}、短い説明。いろいろ。、。、1.2\n3333\n4444",
                explain_image: "Q2Rokkakuchu.png",
                id: "0001",
                grade: 6,
                genre: "はんたいことば",
                category: "不明",
                subCategory: "不明",
                image: "",
                format: "虫食い入力",
                question: "◇◇◇◇{テスト,よみがな}",//"〓と■とだ。よ○\nたて3、よこ4の{四角,しかく}の面積は\n◇x◇=□□",
                correct_answer: "3412",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "虫食い入力のテスト中",
                hint2: "",
                hint3: ""
            },
            */

            
            /*
            //--0
            {
                subject: "国語",
                explain_long: "{西洋,せいよう}の{反対言葉,はんたいことば}は{東洋,とうよう}です",
                id: "0001",
                grade: 6,
                genre: "タテ２択サンプル",
                category: "不明",
                subCategory: "不明",
                image: "",
                format: "タテ2択",
                question: "「{西洋,せいよう}」の\n{反対言葉,はんたいことば}は東洋です。",
                correct_answer: "あってる",
                option1: "あってる",
                option2: "まちがってる",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "",
                hint2: "",
                hint3: ""
            },
            */

            
            //--0
            {
                subject: "国語",
                explain_long: "{西洋,せいよう}の{反対言葉,はんたいことば}は{東洋,とうよう}です<b>太字テスト</b>",
                id: "0001",
                grade: 6,
                genre: "はんたいことば",
                category: "不明",
                subCategory: "不明",
                image: "",
                format: "指定もじ入力",
                question: "「{西洋,せいよう}」の\n{反対言葉,はんたいことば}は{□,とう}□です。\n<t>てすと</t>ああ<t>あ<f>gori</f></t>",
                correct_answer: "東洋",
                option1: "海",
                option2: "南",
                option3: "東",
                option4: "北",
                option5: "洋",
                option6: "山",
                option7: "川",
                option8: "雲",
                hint1: "「よう」は{洋,よう}だよ。",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },

            //--1
            {
                subject: "国語",
                explain_long: "ああああああああああああああああいいいいいいいいいいいいいいいいううううううううううううううううええええええええええええええええおおおおおおおおおおおおおおおお",
                id: "0001",
                grade: 6,
                genre: "はんたいことば",
                category: "不明",
                subCategory: "不明",
                image: "",
                format: "指定もじ入力",
                question: "<u>三角形</u>は□つの辺と\n□つの角でできています。",
                correct_answer: "33",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "{角,かど}はとがっているところだね",
                hint2: "辺は３つだよ",
                hint3: "",
                zuhan_size: "normal"
            },

            //--2
            {
                subject: "国語",
                explain_long: "ああああ\nいいいい\nうううう\nええええええええええええええええおおおお\nかかかか",
                id: "0001",
                grade: 6,
                genre: "はんたいことば",
                category: "不明",
                subCategory: "不明",
                image: "",
                format: "フリーもじ入力",
                question: "<u>オタマジャクシが<r>{成長,せいちょう}する</r>と□になる。</u>",
                correct_answer: "カエル",
                option1: "エ",
                option2: "リ",
                option3: "マ",
                option4: "キ",
                option5: "ト",
                option6: "カ",
                option7: "ゲ",
                option8: "ル",
                hint1: "田んぼによくいるよ",
                hint2: "ゲロゲロゲロゲロ・・",
                hint3: "くわっくわっくわ！",
                zuhan_size: "normal"
            },

            //--3
            {
                subject: "算数",
                explain_long: "ああああ\nいいいい\nうううう\nええええ\nおおおお",
                id: "460000000004",
                grade: 6,
                genre: "算数",
                category: "計算",
                subCategory: "計算",
                image: "",
                format: "ヨコ2択",
                question: "70×<u>24</u>=1680です\n70×2.4=〓",
                correct_answer: "168",
                option1: "168",
                option2: "1680",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "しょうすうてんをよく見てみ",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },
            //--4
            {
                subject: "算数",
                explain_long: "next\n{巣,す}",
                id: "460000000004",
                grade: 6,
                genre: "算数",
                category: "単位",
                subCategory: "単位",
                image: "",
                format: "ヨコ2択",
                question: "1Lは1000㎤\nでは、10Lは何㎤?",
                correct_answer: "10000㎤",
                option1: "10㎤",
                option2: "10000㎤",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "ワシ{単位,たんい}はダメ。帰る",
                hint2: "だめだって",
                hint3: "がんばれ！",
                zuhan_size: "normal"
            },

            //--5
            {
                subject: "国語",
                id: "0003",
                grade: 6,
                genre: "国語",
                category: "読み",
                subCategory: "読み",
                question_image: "Q3toi.png",
                format: "タテ4択",
                question: "{間違,まちが}ってるのは？",
                correct_answer: "かきごうり",
                option1: "おかあさん",
                option2: "おねえちゃん",
                option3: "とおく",
                option4: "かきごうり",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "",
                hint2: "",
                hint3: "",
                zuhan_size: "normal",
                explain_image: "Q3toi.png",
                explain_long: "正しくはかきごおり"
            },

            //--6
            {
                subject: "算数",
                id: "460000000004",
                grade: 6,
                genre: "算数",
                category: "図形",
                subCategory: "図形",
                question_image: "Q2tenkai.png",
                format: "ヨコ2択",
                question: null,//"これを{組,く}み{立,た}てたら？",
                correct_answer: "Q2Gokakuchu.png",//五角柱
                option1: "Q2Rokkakuchu.png",//六角柱
                option2: "Q2Gokakuchu.png",//五角柱
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "ハサミで切ってみよう",
                hint2: "いやいや、紙じゃないし",
                hint3: "",
                zuhan_size: "normal"
            },

            //--7
            {
                subject: "算数",
                id: "360513000001",
                grade: 6,
                genre: "算数",
                category: "図形",
                subCategory: "図形",
                image: "",
                format: "マルバツ",
                question: "{円周,えんしゅう}は\n「{半径,はんけい}×{半径,はんけい}×3.14」\nで{求,もと}められる。",
                correct_answer: "FALSE",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "これ{面積,めんせき}の{公式,こうしき}だよね？",
                hint2: "そうだそうだ",
                hint3: "",
                zuhan_size: "normal"
            },

            //--8
            {
                subject: "社会",
                id: "460000000004",
                grade: 6,
                genre: "社会",
                category: "地理",
                subCategory: "地理",
                image: "",
                format: "ヨコ2択",
                question:"人口が世界一の国は？",
                correct_answer: "Q1China.png",//中国
                option1: "Q1China.png",//中国
                option2: "Q1Japan.png",//日本
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "約14億人だよ！",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },

            //--9
            {
                subject: "算数",
                id: "360513000001",
                grade: 6,
                genre: "算数",
                category: "計算",
                subCategory: "計算",
                image: "",
                format: "マルバツ",
                question: "6/13×2=12/13\n正しい？",
                correct_answer: "TRUE",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "{分母,ぶんぼ}がいっしょだから・・",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },
            //--10
            {
                subject: "算数",
                id: "0003",
                grade: 6,
                genre: "算数",
                category: "計算",
                subCategory: "計算",
                image: "",
                format: "スクエア4択",
                question: "360÷12=30ですが\n36÷1.2=?",
                correct_answer: "30",
                option1: "0.3",
                option2: "3",
                option3: "30",
                option4: "300",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },
            //--11
            {
                subject: "算数",
                id: "0003",
                grade: 6,
                genre: "算数",
                category: "計算",
                subCategory: "計算",
                image: "",
                format: "ヨコ4択",
                question: "3の段の答えはすべて3の倍数です。\nでは、3の倍数はどれ？",
                correct_answer: "6",
                option1: "4",
                option2: "6",
                option3: "8",
                option4: "10",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "3の段といえば・・・",
                hint2: "3,6,9,12...",
                hint3: "",
                zuhan_size: "normal"
            },
            //--12
            {
                subject: "国語",
                id: "460000000004",
                grade: 6,
                genre: "国語",
                category: "漢字",
                subCategory: "漢字",
                image: "",
                format: "ヨコ2択",
                question: "{銀行,ぎんこう}に{■,つと}める。",
                correct_answer: "勤",
                option1: "勤",
                option2: "努",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "きんむの「きん」だよ",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },
            //--13
            {
                subject: "理科",
                id: "460000000001",
                grade: 6,
                genre: "理科",
                category: "物理",
                subCategory: "物理",
                image: "",
                format: "複数回答",
                question: "ホウ{酸,さん}の水よう{液,えき}からホウ{酸,さん}を取り出せ！",
                correct_answer: "冷やす;加熱する",
                option1: "爆発させる",
                option2: "冷やす",
                option3: "{加,か}{熱,ねつ}する",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "答えはアレとアレかな？",
                hint2: "爆発しちゃだめでしょ",
                hint3: "",
                zuhan_size: "normal"
            },

            //--14
            {
                subject: "国語",
                id: "0004",
                grade: 6,
                genre: "俳句",
                category: "名俳句",
                subCategory: "えらい俳句",
                image: "",
                format: "順番",
                question: "{正,ただ}しい{俳句,はいく}になるよう\n{順番,じゅんばん}を{並,なら}べましょう。",
                correct_answer: "秋深き;隣は何を;する人ぞ",
                option1: "する{人,ひと}ぞ",
                option2: "{秋深,あきふか}き",
                option3: "{隣,となり}は{何,なに}を",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "{秋深,あきふか}き",
                hint2: "{隣,となり}は{何,なに}を",
                hint3: "する{人,ひと}ぞ",
                zuhan_size: "normal"
            },

            //--15
            {
                subject: "国語",
                id: "0004",
                grade: 6,
                genre: "俳句",
                category: "名俳句",
                subCategory: "えらい俳句",
                image: "",
                format: "順番",
                question: "数の多い順に並べなさい。",
                correct_answer: "2×5;8-3;1+1;6×0",
                option1: "1+1",
                option2: "2×5",
                option3: "8-3",
                option4: "6×0",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },


            //--16
            {
                subject: "国語",
                id: "160207023006",
                grade: 6,
                genre: "言葉",
                category: "定型の言葉",
                subCategory: "俳句",
                image: "",
                format: "スロット",
                question: "{句集,くしゅう}『おらが{春,はる}』で{有名,ゆうめい}な{歌人,かじん}は？",
                correct_answer: "小林一茶",
                option1: "高;松;小;正",
                option2: "林;岡;浜;尾",
                option3: "子;虚;芭;一",
                option4: "茶;子;規;蕉",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "私じゃないよ",
                hint2: "僕も違うよ",
                hint3: "正岡子規ちゃんと\n松尾芭蕉ちゃんは違うって",
                zuhan_size: "normal"
            },

            //--17
            {
                subject: "理科",
                id: "460000000004",
                grade: 6,
                genre: "理科",
                category: "物理",
                subCategory: "物理",
                image: "",
                format: "ヨコ2択",
                question: "{植物,しょくぶつ}の{種子,しゅし}が{発芽,はつが}するのに必要じゃないのは？",
                correct_answer: "日光",
                option1: "日光",
                option2: "水",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "ちなみに、土の中だよ！",
                hint2: "土の中はまっくらだから・・",
                hint3: "",
                zuhan_size: "normal"
            },
            //--18
            {
                subject: "理科",
                id: "460000000004",
                grade: 6,
                genre: "理科",
                category: "物理",
                subCategory: "物理",
                image: "",
                format: "ヨコ2択",
                question: "口からこう門まで{続,つづ}く食べ物を消化する管を何という？",
                correct_answer: "消化管",
                option1: "気管",
                option2: "消化管",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "どこで消化するんんだっけ？",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },
            //--19
            {
                subject: "理科",
                id: "0003",
                grade: 6,
                genre: "理科",
                category: "物理",
                subCategory: "物理",
                image: "",
                format: "ヨコ4択",
                question: "{吸収,きゅうしゅう}された{養分,ようぶん}をたくわえる{器官,きかん}は何{臓,ぞう}？",
                correct_answer: "かん臓",
                option1: "かん{臓,ぞう}",
                option2: "{肺,はい}",
                option3: "胃",
                option4: "小腸",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "うーん、何{臓,ぞう}だろう",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },

            //--20
            {
                subject: "国語",
                id: "160313041007",
                grade: 6,
                genre: "文法",
                category: "敬語",
                subCategory: "敬語",
                image: "",
                format: "ペアリング",
                question: "{同,おな}じ{意味,いみ}の{言葉,ことば}をつなぎましょう",
                correct_answer: "行く=参る;食べる=召し上がる;言う=申す",
                option1: "{行,い}く;{食,た}べる;{言,い}う",
                option2: "{参,まい}る;{申,もう}す;{召,め}し{上,あ}がる",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "どうぞ召し上がってください",
                hint2: "いやいや、結構なお味で",
                hint3: "では、そろそろ参りましょう",
                zuhan_size: "normal"
            },
            //--21
            {
                subject: "理科",
                id: "360513000001",
                grade: 6,
                genre: "人体",
                category: "人の体のつくりと運動",
                subCategory: "呼吸",
                image: "",
                format: "グルーピング",
                question: "{次,つぎ}の{動物,どうぶつ}を、えら{呼吸,こきゅう}と{肺呼吸,はいこきゅう}にグループ{分,わ}けしましょう",
                correct_answer: "イヌ=肺呼吸;フナ=えら呼吸;クジラ=肺呼吸",
                option1: "肺呼吸;えら呼吸",
                option2: "イヌ",
                option3: "フナ",
                option4: "クジラ",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "クジラは{哺乳類,ほにゅうるい}だから\n魚じゃないね",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },

            //--22
            {
                subject: "社会",
                id: "0003",
                grade: 6,
                genre: "社会",
                category: "地理",
                subCategory: "地理",
                image: "",
                format: "スクエア4択",
                question: "非政府組織はエヌジーオーと呼ばれますが、これをアルファベット3文字であらわすと？",
                correct_answer: "NGO",
                option1: "ODA",
                option2: "NPO",
                option3: "NGO",
                option4: "WHO",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "エヌはアルファベットで「N」だよ",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },
            //--23
            {
                subject: "社会",
                id: "0003",
                grade: 6,
                genre: "社会",
                category: "地理",
                subCategory: "地理",
                image: "",
                format: "タテ4択",
                question: "{初代,しょだい}の{内閣,ないかく}{総理,そうり}{大臣,だいじん}は？",
                correct_answer: "伊藤博文",
                option1: "大隈重信",
                option2: "{新,に}{渡,と}{戸,べ}稲造",
                option3: "伊藤博文",
                option4: "{西郷,さいごう}隆盛どおおおおおん",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "日本に多い苗字だね",
                hint2: "僕の近所にもいたなあ。\n伊藤くん。",
                hint3: "",
                zuhan_size: "normal"
            },
            //--24
            {
                subject: "社会",
                id: "260217088009",
                grade: 6,
                genre: "社会",
                category: "地理",
                subCategory: "地理",
                image: "",
                format: "ならべかえ",
                question: "国連児童基金は\nUNICEF、カタカナで□と呼ばれます。",
                correct_answer: "ユニセフ",
                option1: "セ",
                option2: "ユ",
                option3: "フ",
                option4: "ニ",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },

            //--25
            {
                subject: "社会",
                id: "460000000003",
                grade: 6,
                genre: "歴史",
                category: "日本の歴史",
                subCategory: "江戸時代（出来事・政治）",
                image: "",
                format: "連想",
                question: "だれのこと？\n徳川家光の{四男,よんなん}\n元禄{文化,ぶんか}が{栄,さか}えさせる\n江戸{幕府,ばくふ}の第5代{将軍,しょうぐん}\n生類憐みの令を{制定,せいてい}",
                //question: "徳川家光の四男,元禄文化が栄えさせる,江戸幕府の第5代将軍,生類憐みの令を制定",
                correct_answer: "徳川綱吉",
                option1: "{徳光,とくみつ}{和夫,かずお}",
                option2: "{徳川,とくがわ}{美術館,びじゅつかん}",
                option3: "{徳川,とくがわ}{幕府,ばくふ}",
                option4: "{徳川,とくがわ}{綱吉,つなよし}",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "もうちょっと待ってみようか",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },

            //--26
            {
                subject: "算数",
                id: "0003",
                grade: 6,
                genre: "算数",
                category: "計算",
                subCategory: "計算",
                image: "",
                format: "ヨコ4択",
                question: "38÷19=2です。\nでは、38÷1.9=■",
                correct_answer: "20",
                option1: "0.2",
                option2: "2",
                option3: "20",
                option4: "200",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },
            //--27
            {
                subject: "算数",
                id: "360513000001",
                grade: 6,
                genre: "算数",
                category: "単位",
                subCategory: "単位",
                image: "",
                format: "マルバツ",
                //question: "2,000,000cm3を立方メートルに直すと2,000m3である。\n㎤㎥",
                question: "2,000,000㎤を立方メートルに直すと2,000㎥である。",
                correct_answer: "FALSE",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "1㎥は100㎤だね",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },
            //--28
            {
                subject: "理科",
                id: "460000000004",
                grade: 6,
                genre: "理科",
                category: "物理",
                subCategory: "物理",
                image: "",
                format: "ヨコ2択",
                question: "てこを{利,り}{用,よう}した{道,どう}{具,ぐ}のうち支点が{力,りき}点と{作,さ}{用,よう}{点,てん}の間にある、はさむ道具は？",
                correct_answer: "ペンチ",
                option1: "ペンチ",
                option2: "ベンチ",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "ベンチは座るものだね",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },

            //--29
            {
                subject: "社会",
                id: "460000000004",
                grade: 6,
                genre: "社会",
                category: "地理",
                subCategory: "地理",
                question_image: "Q2tenkai.png",
                format: "指定もじ入力",
                question: "",//question: "□□□□□",
                correct_answer: "てんかいず",
                option1: "て",
                option2: "ん",
                option3: "か",
                option4: "い",
                option5: "ず",
                option6: "１",
                option7: "２",
                option8: "３",
                hint1: "てんかいした{図,ず}だね",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },

            //--30
            {
                subject: "社会",
                id: "460000000004",
                grade: 6,
                genre: "社会",
                category: "地理",
                subCategory: "地理",
                question_image: "Q1Japan.png",
                format: "フリーもじ入力",
                question: "",//question: "□",
                correct_answer: "にほん",
                option1: "に",
                option2: "ほ",
                option3: "ん",
                option4: "と",
                option5: "ぶ",
                option6: "ら",
                option7: "じ",
                option8: "る",
                hint1: "「ぶらじる」だっけ？",
                hint2: "「にほん」だっけ？",
                hint3: "",
                zuhan_size: "normal"
            },

            //--31
            {
                subject: "算数",
                explain_long: "長い{説明,せつめい}",
                id: "0001",
                grade: 6,
                genre: "はんたいことば",
                category: "不明",
                subCategory: "不明",
                image: "",
                format: "虫食い入力",
                question: "2、5、3、合計の計算式は\n◇+◇+◇=□□",
                correct_answer: "25310",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "虫食い入力のテスト中",
                hint2: "",
                hint3: ""
            },

            //--32
            {
                subject: "算数",
                explain_long: "長い{説明,せつめい}",
                id: "0001",
                grade: 6,
                genre: "はんたいことば",
                category: "不明",
                subCategory: "不明",
                image: "",
                format: "虫食い入力",
                question: "富士は日本□の山",
                correct_answer: "1",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "虫食い入力のテスト中",
                hint2: "",
                hint3: ""
            },
        ];
        return QuestionData.createQuestionDatas(datas);
    }


    public smallData():QuestionData[]
    {
        let datas:{}[] =
        [
            {
                subject: "算数",
                id: "460000000004",
                grade: 6,
                genre: "算数",
                category: "図形",
                subCategory: "図形",
                question_image: "Q2tenkai.png",
                format: "ヨコ4択",
                question: "これを{組,く}み{立,た}てたら？",
                correct_answer: "Q2Gokakuchu.png",//五角柱
                option1: "あ",//六角柱
                option2: "Q2Gokakuchu.png",//五角柱
                option3: "い",
                option4: "うん",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "文字数チェック",
                hint2: "１２３４５６７８９０１２３４５６７８９０１２３４あいうえお０",
                hint3: "",
                zuhan_size: "normal"
            },
            
            
            /*
            {
                subject: "社会",
                id: "260217088009",
                grade: 6,
                genre: "社会",
                category: "地理",
                subCategory: "地理",
                image: "",
                format: "ならべかえ",
                question: "ころころむ□",
                correct_answer: "コロコロム",
                option1: "ム",
                option2: "ロ",
                option3: "コ",
                option4: "ロ",
                option5: "コ",
                option6: "",
                option7: "",
                option8: "",
                hint1: "",
                hint2: "",
                hint3: "",
                zuhan_size: "normal"
            },
            */
           
            /*
            {
                correct_answer: "17",
                explain_image: "Q2tenkai.png",
                explain_long: null,
                explain_short: "解説ショート",
                format: "ヨコ4択",
                hint1: "5+12の計算で考えよう。",
                hint2: "分母は8のまま。",
                hint3: null,
                id: "002045_2",
                level: 2,
                option1: "5",
                option2: "12",
                option3: "17",
                option4: "19",
                order: null,
                question: null,
                question_image: "Q2tenkai.png",
                script_combo: "[X]コンボ！",
                script_correct: "ワンダフル！",
                script_enter1: "そっちか〜！",
                script_enter2: "むずかしかった",
                script_fast: "いいペース！",
                script_fastest: "は、はやい！",
                script_incorrect: "きりかえよう！",
                script_normal: "この調子でがんばろう！",
                script_thinking1: "ヒントほしいなー",
                script_thinking2: "うーん",
                script_thinking3: "考え中",
                subject: "算数",
                zuhan_size: "large"
            },
            */
            
            
            /*
            {
                subject: "算数",
                id: "460000000004",
                grade: 6,
                genre: "算数",
                category: "図形",
                subCategory: "図形",
                question_image: "Q2tenkai.png",
                format: "ヨコ2択",
                question: "これを{組,く}み{立,た}てたら？",
                correct_answer: "Q2Gokakuchu.png",//五角柱
                option1: "Q2Rokkakuchu.png",//六角柱
                option2: "Q2Gokakuchu.png",//五角柱
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "ハサミで切ってみよう",
                hint2: "いやいや、紙じゃないし",
                hint3: "",
                zuhan_size: "normal"
            },
            */

            /*
            //--7
            {
                subject: "算数",
                id: "360513000001",
                grade: 6,
                genre: "算数",
                category: "図形",
                subCategory: "図形",
                image: "",
                format: "マルバツ",
                question: "{円周,えんしゅう}は\n「{半径,はんけい}×{半径,はんけい}×3.14」\nで{求,もと}められる。",
                correct_answer: "FALSE",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                option5: "",
                option6: "",
                option7: "",
                option8: "",
                hint1: "これ{面積,めんせき}の{公式,こうしき}だよね？",
                hint2: "そうだそうだ",
                hint3: "",
                zuhan_size: "normal"
            },*/
        ];
        return QuestionData.createQuestionDatas(datas);
    }


    public setupImage(imgRes:{}):void
    {
        //ローカルのダミー画像を読み込み
        imgRes["Q1China.png"] = this.dummyQ1ChinaImg;
        imgRes["Q1Japan.png"] = this.dummyQ1JapanImg;
        imgRes["Q2tenkai.png"] = this.dummyQ2TenkaiImg;
        imgRes["Q2Rokkakuchu.png"] = this.dummyQ2RokkakuImg;
        imgRes["Q2Gokakuchu.png"] = this.dummyQ2GokakuImg;
        imgRes["Q3toi.png"] = this.dummyQ3ToiImg;
    }


    public getBasicHits():any
    {
        let datas =
        {
            script_start1: "ドキドキ...",
            script_start2: "{気合,きあ}い、{気合,きあ}い！",
            script_start3: "ぜんもんせいかいしたい！",
            script_five_sec: "あと5秒！",
            script_ten_sec: "まだ大丈夫",
            script_twenty_sec: "あと20秒！",
            script_end1: "（笑）",
            script_end2: "おつ〜！",
            script_end3: "もう1{回,かい}やらない？"
        };
        return datas;
    }


    public createGetCollection():CollectionItem[]
    {
        return [
            new CollectionItem(
                "その他",
                "本因坊秀策",
                "囲碁史上最強との呼び声高い江戸時代の棋士。秀策の布石は「秀策流」と呼ばれ、現在の勝負でもよく使われる。",
                "https://unko-qadb.s3-ap-northeast-1.amazonaws.com/collection/100_1.jpg",
                1,
                "習得モードでパーフェクト(全問正解)を10回とった"
            )
		];
    }


    public static getPreviewQuestionDataA():QuestionData
    {
        
        let str:string = "{"+
            "\"id\":\"000017_3\","+
            "\"question\":\"\","+
            "\"correct_answer\":\"000017_3_a.png\","+
            "\"option1\":\"000017_3_a.png\","+
            "\"option2\":\"0\","+
            "\"option3\":\"\","+
            "\"option4\":\"\","+
            "\"option5\":\"\","+
            "\"option6\":\"\","+
            "\"option7\":\"\","+
            "\"option8\":\"\","+
            "\"hint1\":\"約分って何さ...\","+
            "\"hint2\":\"分子・分母を小さくすることだよ。\","+
            "\"hint3\":\"分子と分母を 9で割ってみて！\","+
            "\"question_image\":\"000017_3.png\","+
            "\"explain_image\":\"000017_3_e.png\","+
            "\"explain_long\":\"\","+
            "\"explain_short\":\"解説ショート\","+
            "\"subject\":\"算数\","+
            "\"grade\":5,\"format\":\"ヨコ2択\","+
            "\"genre\":\"数と計算\","+
            "\"level\":1,"+
            "\"zuhan_size\":\"large\""+
        "}";
        
        
        /*
        let str:string = "{"+
            "\"id\":\"000005_3\","+
            "\"question\":\"この計算は、何÷何と同じ？\","+
            "\"correct_answer\":\"19.5÷65\","+
            "\"option1\":\"19.5÷65\","+
            "\"option2\":\"195÷65\","+
            "\"option3\":\"\","+
            "\"option4\":\"\","+
            "\"option5\":\"\","+
            "\"option6\":\"\","+
            "\"option7\":\"\","+
            "\"option8\":\"\","+
            "\"hint1\":\"ひっ算で言うと、小数点を右にずらす。\","+
            "\"hint2\":\"ひとつずつね。\","+
            "\"hint3\":\"\","+
            "\"question_image\":\"000005_3.png\","+
            "\"explain_image\":\"000005_3_e.jpg\","+
            //"\"explain_long\":\"小数÷小数の計算は、小数点をずら\nして整数にする楽に計算できる。\","+      //これだとJsonパースエラーが出る
            "\"explain_long\":\"小数÷小数の計算は、小数点をずらして整数にする楽に計算できる。\","+
            "\"explain_short\":\"小数点を右にずらして、整数をつくろう！\","+
            "\"subject\":\"算数\","+
            "\"grade\":5,"+
            "\"format\":\"タテ2択\","+
            "\"genre\":\"数と計算\","+
            "\"level\":2,"+
            "\"zuhan_size\":\"normal\""+
        "}";
        */
        return this._previewQuestionDataJsonParse(str);
    }


    public static getPreviewQuestionDataB():QuestionData
    {
        let str:string = "{"+
            "\"id\":\"000019_5\","+
            "\"question\":\"\","+
            "\"correct_answer\":\"FALSE\","+
            "\"option1\":\"\","+
            "\"option2\":\"\","+
            "\"option3\":\"\","+
            "\"option4\":\"\","+
            "\"option5\":\"\","+
            "\"option6\":\"\","+
            "\"option7\":\"\","+
            "\"option8\":\"\","+
            "\"hint1\":\"分母をそろえて！\","+
            "\"hint2\":\"2と3の最小公倍数？\","+
            "\"hint3\":\"分母は3+2。\","+
            "\"question_image\":\"000019_5.jpg\","+
            "\"explain_image\":\"\","+
            "\"explain_long\":\"解説ロング\","+
            "\"explain_short\":\"解説ショート\","+
            "\"subject\":\"算数\","+
            "\"grade\":5,"+
            "\"format\":\"マルバツ\","+
            "\"genre\":\"数と計算\","+
            "\"level\":3,"+
            "\"zuhan_size\":\"large\""+
        "}";
        
        return this._previewQuestionDataJsonParse(str);
    }


    private static _previewQuestionDataJsonParse(str:string):QuestionData
    {
        let json:any = null;
        let qd:QuestionData = null;
        try{
            json = JSON.parse(str);
            qd = QuestionData.jsonParse(json);
        }catch(e)
        {
            alert(e);
        }
        return qd;
    }



    public static getDummyScoreRanking(rank:number, totalCount:number):ComboRanking[]
    {
        let ranks:ComboRanking[] = [];
        
        for(let i:number = 0 ; i < totalCount ; i ++)
        {
            let nickName:string = (i == rank) ? "あなた" : "Name " + i;
            ranks.push(new ComboRanking(3 + i, totalCount + 10 - i, 50 + i, nickName, "dummyURL"));
        }
        return ranks;
    }






    
}
