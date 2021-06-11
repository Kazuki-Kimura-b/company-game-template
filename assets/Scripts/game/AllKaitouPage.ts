import SchoolText from "../common/SchoolText";
import STFont from "../common/STFont";
import STFormat from "../common/STFormat";
import QuestionData from "./QuestionData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AllKaitouPage extends cc.Component {

    @property(cc.ScrollView) scrollView: cc.ScrollView = null;
    @property(cc.Label) questionNumLabel: cc.Label = null;
    @property(SchoolText) questionOutput: SchoolText = null;
    @property(cc.Label) kaisetsuLabel: cc.Label = null;
    @property(SchoolText) kaisetsuOutput: SchoolText = null;
    @property(cc.Node) debugLineY: cc.Node = null;
    @property(cc.Prefab) stFontPrefab: cc.Prefab = null;

    private static readonly _INTERVAL_TEXT_END:number = 30;
    private static readonly _INTERVAL_IMG_END:number = 30;
    private static readonly _INTERVAL_KAISETSU_UP:number = 60;
    private static readonly _INTERVAL_KAISETSU_DOWN:number = 60;
    private static readonly _INTERVAL_BOTTOM:number = 96;


    /**
     * 問題を表示
     * @param index 
     * @param questionData 
     * @param imageSRC 
     */
    public setupQuestion(index:number, questionData:QuestionData, imageSRC:{}):void
    {
        this.questionNumLabel.string = "第" + (index + 1) + "問：" + questionData.subject;
        
        this.questionOutput.setSTFontFromPrefab(this.stFontPrefab);


        //this.kaisetsuOutput.setUnderlineSpriteFrame(this.underlineSpriteFrame);

        let format:{} =
		{
			size: 40,
			margin: 1,
			lineHeight: 66,
			rows: 8,
			columns: 16,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_TOP,
			color: cc.color(0, 0, 0),
			yomiganaSize : 20,
			yomiganaMarginY : 2
        };

        let posY:number = this.questionOutput.node.y;
        
        // 問題文がある場合
        if(questionData.question != null)
        {
            this.questionOutput.createText(questionData.question, STFormat.create(format));
            this.questionOutput.flushText();

            //問題文の高さと余白だけposYを下げる
            posY -= this.questionOutput.getContentsHeight() + AllKaitouPage._INTERVAL_TEXT_END;
        }
		
        // 問題の画像がある場合
        if(questionData.question_image != null && questionData.question_image != "")
        {
            let spriteFrame:cc.SpriteFrame = imageSRC[questionData.question_image];
            let sprite:cc.Sprite = this._createImage(spriteFrame);

            //大きすぎる画像を小さくする
            let rect:cc.Rect = spriteFrame.getRect();
            let scale:number = 650 / rect.width;
            if(scale > 1) scale = 1;

            sprite.node.scale = scale;

            sprite.node.y = posY - rect.height / 2 * scale;
            this.scrollView.content.addChild(sprite.node);

            //画像の高さと余白だけposYを下げる
            posY -= rect.height * scale + AllKaitouPage._INTERVAL_IMG_END;
        }

        //全て表示したので下に余白追加
        posY -= AllKaitouPage._INTERVAL_BOTTOM;
        this.debugLineY.y = posY;

        //スクロールコンテンツの高さを算出
        let contentsHeight:number = -posY;
        if(contentsHeight < this.scrollView.node.height) contentsHeight = this.scrollView.node.height;

        this.scrollView.content.height = contentsHeight;

        this.kaisetsuLabel.node.active = false;
    }


    
    /**
     * 回答を表示
     * @param index 
     * @param questionData 
     * @param imageSRC 
     */
    public setupAnswer(index:number, questionData:QuestionData, imageSRC:{}):void
    {
        this.kaisetsuOutput.setSTFontFromPrefab(this.stFontPrefab);
        
        let format:{} =
		{
			size: 40,
			margin: 1,
			lineHeight: 66,
			rows: 8,
			columns: 16,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_TOP,
			color: cc.color(0, 0, 0),
			yomiganaSize : 20,
			yomiganaMarginY : 2
        };
        
        let posY:number = this.questionNumLabel.node.y;
        this.questionNumLabel.node.active = false;
        
        //解 説(見出し)
        //posY -= AllKaitouPage._INTERVAL_KAISETSU_UP;
        this.kaisetsuLabel.node.y = posY;
        posY -= AllKaitouPage._INTERVAL_KAISETSU_DOWN;
        

        //解説文
        if(! questionData.explain_long) questionData.explain_long = "";//"解説文無し";
        

        this.kaisetsuOutput.node.y = posY;
        this.kaisetsuOutput.createText(questionData.explain_long, STFormat.create(format));
        this.kaisetsuOutput.flushText();

        //解説文の高さと余白だけposYを下げる
        posY -= this.kaisetsuOutput.getContentsHeight() + AllKaitouPage._INTERVAL_TEXT_END;
        

        //解説画像がある場合
        if(questionData.explain_image != null && questionData.explain_image != "")
        {
            let spriteFrame:cc.SpriteFrame = imageSRC[questionData.explain_image];
            let sprite:cc.Sprite = this._createImage(spriteFrame);

            //大きすぎる画像を小さくする
            let rect:cc.Rect = spriteFrame.getRect();
            let scale:number = 650 / rect.width;
            if(scale > 1) scale = 1;

            sprite.node.scale = scale;

            sprite.node.y = posY - rect.height / 2 * scale;
            this.scrollView.content.addChild(sprite.node);

            //画像の高さと余白だけposYを下げる
            posY -= rect.height * scale + AllKaitouPage._INTERVAL_IMG_END;
        }
        
        //全て表示したので下に余白追加
        posY -= AllKaitouPage._INTERVAL_BOTTOM;
        this.debugLineY.y = posY;


        //スクロールコンテンツの高さを算出
        let contentsHeight:number = -posY;
        if(contentsHeight < this.scrollView.node.height) contentsHeight = this.scrollView.node.height;

        this.scrollView.content.height = contentsHeight;
    }




    /*
    public setup(index:number, questionData:QuestionData, imageSRC:{}):void
    {
        this.questionNumLabel.string = "第" + (index + 1) + "問：" + questionData.subject;
        
        //this.kaisetsuOutput.setUnderlineSpriteFrame(this.underlineSpriteFrame);

        let format:{} =
		{
			size: 40,
			margin: 1,
			lineHeight: 66,
			rows: 8,
			columns: 16,
			horizontalAlign: SchoolText.HORIZONTAL_ALIGH_CONTENTS_LEFT,
			verticalAlign: SchoolText.VERTICAL_ALIGN_TOP,
			color: cc.color(0, 0, 0),
			yomiganaSize : 20,
			yomiganaMarginY : 2
        };

        let posY:number = this.questionOutput.node.y;
        
        // 問題文がある場合
        if(questionData.question != null)
        {
            this.questionOutput.createText(questionData.question, STFormat.create(format));
            this.questionOutput.flushText();

            //問題文の高さと余白だけposYを下げる
            posY -= this.questionOutput.getContentsHeight() + AllKaitouPage._INTERVAL_TEXT_END;
        }
		
        // 問題の画像がある場合
        if(questionData.question_image != null && questionData.question_image != "")
        {
            let spriteFrame:cc.SpriteFrame = imageSRC[questionData.question_image];
            let sprite:cc.Sprite = this._createImage(spriteFrame);

            //大きすぎる画像を小さくする
            let rect:cc.Rect = spriteFrame.getRect();
            let scale:number = 700 / rect.width;
            if(scale > 1) scale = 1;

            sprite.node.scale = scale;

            sprite.node.y = posY - rect.height / 2 * scale;
            this.scrollView.content.addChild(sprite.node);

            //画像の高さと余白だけposYを下げる
            posY -= rect.height * scale + AllKaitouPage._INTERVAL_IMG_END;
        }

        //解 説(見出し)
        posY -= AllKaitouPage._INTERVAL_KAISETSU_UP;
        this.kaisetsuLabel.node.y = posY;
        posY -= AllKaitouPage._INTERVAL_KAISETSU_DOWN;
        

        //解説文
        if(! questionData.explain_long) questionData.explain_long = "";//"解説文無し";
        

        this.kaisetsuOutput.node.y = posY;
        this.kaisetsuOutput.createText(questionData.explain_long, STFormat.create(format));
        this.kaisetsuOutput.flushText();

        //解説文の高さと余白だけposYを下げる
        posY -= this.kaisetsuOutput.getContentsHeight() + AllKaitouPage._INTERVAL_TEXT_END;
        

        //解説画像がある場合
        if(questionData.explain_image != null && questionData.explain_image != "")
        {
            let spriteFrame:cc.SpriteFrame = imageSRC[questionData.explain_image];
            let sprite:cc.Sprite = this._createImage(spriteFrame);

            //大きすぎる画像を小さくする
            let rect:cc.Rect = spriteFrame.getRect();
            let scale:number = 700 / rect.width;
            if(scale > 1) scale = 1;

            sprite.node.scale = scale;

            sprite.node.y = posY - rect.height / 2 * scale;
            this.scrollView.content.addChild(sprite.node);

            //画像の高さと余白だけposYを下げる
            posY -= rect.height * scale + AllKaitouPage._INTERVAL_IMG_END;
        }
        
        //全て表示したので下に余白追加
        posY -= AllKaitouPage._INTERVAL_BOTTOM;
        this.debugLineY.y = posY;

        //スクロールコンテンツの高さを算出
        let contentsHeight:number = -posY;
        if(contentsHeight < this.scrollView.node.height) contentsHeight = this.scrollView.node.height;

        this.scrollView.content.height = contentsHeight;

        
    }
    */



    private _createImage(spriteFrame:cc.SpriteFrame):cc.Sprite
    {
        let node:cc.Node = new cc.Node();
        node.width = spriteFrame.getRect().width;
        node.height = spriteFrame.getRect().height;
        
        let sprite:cc.Sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;

        return sprite;
    }
}
