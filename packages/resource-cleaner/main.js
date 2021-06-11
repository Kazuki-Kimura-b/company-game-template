'use strict';

var fs = require('fs');

module.exports = {
  load () {
    // execute when package loaded
  },

  unload () {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'open' () {
      // open entry panel registered in package.json
      Editor.Panel.open('resource-cleaner');
    },
    'say-hello' () {
      Editor.log('Hello World!');
      // send ipc message to panel
      Editor.Ipc.sendToPanel('resource-cleaner', 'resource-cleaner:hello');
    },
    'clicked' () {
      Editor.log('Button clicked!');


      /*
      Editor.log(Editor.assetdb.library);

      Editor.log(Editor.assetdb.urlToUuid ("db://assets/Scripts/title/TitleMain.ts"));  // db98d548-e494-4c9c-bc43-7d90d03f193f
      Editor.log(Editor.assetdb.urlToUuid ("db://assets/title.fire"));  // 14a3a142-ddcd-41cf-8f53-ac689b37cb17

      Editor.log(Editor.assetdb.uuidToUrl ("db98d548-e494-4c9c-bc43-7d90d03f193f"));  //  db://assets/Scripts/title/TitleMain.ts
      Editor.log(Editor.assetdb.uuidToUrl ("4608814f-67b8-4812-9fff-479e3bac35c8"));  //  db://assets/game.fire

      //urlからアセットの情報を見る
      Editor.log(Editor.assetdb.assetInfo("db://assets/Scripts/title/TitleMain.ts"));
      //{
      //  uuid: 'db98d548-e494-4c9c-bc43-7d90d03f193f',
      //  path: 'プロジェクトのフルパス\assets\\Scripts\\title\\TitleMain.ts',
      //  url: 'db://assets/Scripts/title/TitleMain.ts',
      //  type: 'typescript',
      //  isSubAsset: false
      //}
      */

      let typeScripts = [];
      let textures = [];
      let audioClips = [];
      let prefabs = [];
      let scenes = [];
      let texObj = {};


      //試しにアセットDBから.fireファイルだけリストアップしてみる
      let obj = Editor.assetdb._uuid2mtime;
      
      for(const uuid in obj)
      {
        const url = Editor.assetdb.uuidToUrl(uuid);
        
        if(url.substr(0,12) != "db://assets/") continue;

        const info = Editor.assetdb.assetInfo(url);
        if(info.type == 'typescript')
        {
          typeScripts.push(url);
        }
        else if(info.type == 'texture')
        {
          textures.push(url);
        }
        else if(info.type == 'audio-clip')
        {
          audioClips.push(url);
        }
        else if(info.type == 'prefab')
        {
          prefabs.push(url);
        }
        else if(info.type == 'scene')
        {
          scenes.push(url);

          /*
          Editor.log(url);
          
          let path = Editor.assetdb.urlToFspath(url);
          Editor.log(path);

          let fireJsonStr = fs.readFileSync( path,'utf8');
          let fireJson = JSON.parse(fireJsonStr);
          Editor.log(fireJson);

          //このjsonからシーンで使用しているuuid一式が取り出せるはず

          Editor.log(fireJson[0]["__type__"]);    //cc.SceneAsset
          */
          

        }
        else
        {
          //Editor.log(info.type);
        }
      }

      let serchResult = "アセット数  type-script:" + typeScripts.length + " / texture:" + textures.length + " / audio-clip:" + audioClips.length + " / prefab:" + prefabs.length + " / scene:" + scenes.length;

      Editor.log("===============================================================");
      Editor.log(serchResult);
      Editor.log("===============================================================");
      
      Editor.Ipc.sendToPanel('resource-cleaner', 'resource-cleaner:hello', serchResult);

      Editor.log("");
      Editor.log("---------------------------------------------------------------");
      Editor.log("type-script:");
      for(let i = 0 ; i < typeScripts.length ; i ++)
      {
        Editor.log(typeScripts[i] + " " + Editor.assetdb.urlToUuid(typeScripts[i]));
      }

      Editor.log("");
      Editor.log("---------------------------------------------------------------");
      Editor.log("texture:");
      for(const po in Editor.assetdb._uuid2meta)
      {
        if(Editor.assetdb._uuid2meta[po].rawTextureUuid)
        {
          let rawTextureUuid = Editor.assetdb._uuid2meta[po].rawTextureUuid;
          //Editor.log(rawTextureUuid);
          
          texObj[rawTextureUuid] = po;

          //Editor.log(rawTextureUuid + "/" + texObj[rawTextureUuid]);
        }
      }




      for(let i = 0 ; i < textures.length ; i ++)
      {
        let textureUUID = Editor.assetdb.urlToUuid(textures[i]);
        Editor.log(textures[i] + " " + texObj[textureUUID]);
      }

      Editor.log("");
      Editor.log("---------------------------------------------------------------");
      Editor.log("audio-clip:");
      for(let i = 0 ; i < audioClips.length ; i ++)
      {
        Editor.log(audioClips[i] + " " + Editor.assetdb.urlToUuid(audioClips[i]));
      }

      Editor.log("");
      Editor.log("---------------------------------------------------------------");
      Editor.log("prefab:");
      for(let i = 0 ; i < prefabs.length ; i ++)
      {
        Editor.log(prefabs[i] + " " + Editor.assetdb.urlToUuid(prefabs[i]));
      }

      Editor.log("");
      Editor.log("---------------------------------------------------------------");
      Editor.log("scene:");
      for(let i = 0 ; i < scenes.length ; i ++)
      {
        Editor.log(scenes[i] + " " + Editor.assetdb.urlToUuid(scenes[i]));
      }



      Editor.log("===============================================================");
      Editor.log("Scene内");
      Editor.log("===============================================================");

      let __subFunc = (data)=>
      {
        let type = Object.prototype.toString.call(data);
        if(type == "[object Array]")
        {
          for(let i = 0 ; i < data.length ; i ++)
          {
            __subFunc(data[i]);
          }
        }
        else if(type == "[object Object]")
        {
          for(const p in data)
          {
            if(p == "__uuid__")
            {
              //rtnUUID += data[p] + "\n";
              //rtnCount ++;
              Editor.log(data[p]);
            }
            __subFunc(data[p]);
          }
        }
      };


      {
        let url = scenes[0];
        let path = Editor.assetdb.urlToFspath(url);
        Editor.log(path);

        let fireJsonStr = fs.readFileSync( path,'utf8');
        let fireJson = JSON.parse(fireJsonStr);
        //Editor.log(fireJson);

        //このjsonからシーンで使用しているuuid一式が取り出せるはず
        //Editor.log(fireJson[0]["__type__"]);    //cc.SceneAsset


        //scene[0]内のuuidをすべて取り出せた（menu.fireで160個）
        __subFunc(fireJson);
      }
          
      


      


      //アセットDB内の情報を見る
      //Editor.log(Editor.assetdb);
      //-----------------------------------------------
      /*
      
      u
      {
        silent: false,
        dev: false,
        metaBackupPath:'プロジェクトのフルパス\\temp\\RemovedMetas',
        assetBackupPath:'プロジェクトのフルパス\\temp\\BackupAssets',
        cwd:'プロジェクトのフルパス',
        library:'プロジェクトのフルパス\\library',

        _mounts:
        {
          internal:
          { path: 'C:\\CocosDashboard_1.0.10\\resources\\.editors\\Creator\\2.4.4\\resources\\static\\default-assets',
            mountPath: 'internal',
            attached: true,
            hidden: false,
            readonly: true
          },
          assets:
          { path:
            'プロジェクトのフルパス\\assets',
            mountPath: 'assets',
            attached: true
          }
        },

        _uuid2mtime:
        {
          'db98d548-e494-4c9c-bc43-7d90d03f193f': { asset: 1616815188314, meta: 1616815263530, relativePath: 'Scripts\\title\\TitleMain.ts' }
        },

        _uuid2path:
        {
          'mount-assets' : 'プロジェクトのフルパス\\assets',
          'da24270b-b79a-411f-ae3a-a75baa405d0b':'プロジェクトのフルパス\\assets\\Prefabs\\AnswerBtnBoxL.prefab',
        },

        _uuid2meta:
        {
          '430eccbf-bf2c-4e6e-8c0c-884bbb487f32':
          s {
            _assetdb: [Circular],
            ver: '1.0.25',
            uuid: '430eccbf-bf2c-4e6e-8c0c-884bbb487f32',
            __subMetas__: {},
            compiledShaders: [Array] },
        },
        
        _path2uuid:
        {
          'プロジェクトのフルパス\\assets': 'mount-assets',
          'プロジェクトのフルパス\\assets\\game.fire': '4608814f-67b8-4812-9fff-479e3bac35c8',
          'プロジェクトのフルパス\\assets\\Prefabs\\AllKaitou.prefab': '95607540-a1ec-4582-8ff5-b049ceda6b72',
          'プロジェクトのフルパス\\assets\\Scripts\\answerComponents\\AC.ts': 'f84d404f-4562-49d3-b7d4-57fcc8bf54d2',
          'プロジェクトのフルパス\\assets\\Textures\\bgSkin\\bgGoriben\\bgGoriIzinK01.png': '6e3aeb11-af80-498a-8469-2d7fdcc42e54',
        }
      }


       */




      //-----------------------------------------------
      





    },
    
    

  },

  



};