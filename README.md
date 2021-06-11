# bk-unko-school

Cocos Creator

![Build](https://github.com/radicodeinc/bk-unko-school/workflows/Build/badge.svg)


## CLI

### Build

for Mac

```
/Applications/CocosCreator.app/Contents/MacOS/CocosCreator --path ${PROJECT_PATH} --build 'platform=web-mobile;debug=false'
```

### Upload

Please, install docker-compose!

```
docker-compose run -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY aws-cli s3 sync /web-mobile s3://unkogakuen-game/cocos/${PROJECT_NAME}/ --delete --acl public-read
```

### Confirm
```
open https://unkogakuen-game.s3-ap-northeast-1.amazonaws.com/cocos/${PROJECT_NAME}/index.html
```
