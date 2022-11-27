const { App } = require("@slack/bolt");
const askShiritoriAPI = require("./sendShiritoriWord");
require("dotenv").config();
const { translateToJapanese } = require("./translateToJapanese");
const { askEmojiDB } = require("./askEmojiDB");
const emoji = require("node-emoji");

// globa array to store the words
let usedWords = [];
let nextChar = null;

const app = new App({
    token: process.env.TOKEN,
    signingSecret: process.env.SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.APP_TOKEN,
});

function isEmoji(word) {
    //check if the word is an emoji
    return word.match(/^:[a-z0-9_+-]+:$/);
}

app.command("/start", async ({ command, ack, say }) => {
    try {
        await ack();
        let txt = command.text; // The inputted parameters
        say("やっほー！しりとり大好きSiriとリス🐿だよ！");
        say(` Siri: 『ルールを説明します。』
- ひらがな、カタカナ、漢字、絵文字で入力してください
- 使用した単語は使えません
- 「ん」で終わる単語は使えません
- リスタートしたい場合は「/start」を入力してください
`);
        usedWords = [];
        nextChar = null;
    } catch (error) {
        console.log("err");
        console.error(error);
    }
});

function isNN(word) {
    if (word.slice(-1) == "ん" || word.slice(-1) == "ン") {
        return true;
    }
    return false;
}

let risuMsg = [
    "かわい～",
    "いいね～",
    "そうきたか！",
    "変化球だねw",
    "まじかw",
    "なるほど～",
];

async function normalize(data, say) {
    return new Promise(async (resolve, reject) => {
        let response = {
            type: "",
            word: data,
            isNN: false,
        };
        if (isEmoji(data)) {
            response.type = "emoji";
            tmp = data.replace(/:/g, "");
            response.word = await translateToJapanese(tmp);
            say(
                response.word +
                    " の絵文字かな？ " +
                    risuMsg[Math.floor(Math.random() * risuMsg.length)]
            );
            resolve(response);
        } else {
            // 日本語かどうかをチェック
            response.type = "text";
            if (data.match(/^[ぁ-んァ-ヶー一-龠]+$/)) {
                data = data.replace(/[\u3041-\u3096]/g, function (match) {
                    var chr = match.charCodeAt(0) + 0x60;
                    return String.fromCharCode(chr);
                });
                response.word = data;
                response.isNN = isNN(data);
                resolve(response);
            } else if (data.match(/^[ァ-ヶー]+$/)) {
                // カタカナのまま
                response.isNN = isNN(data);
                resolve(response);
            } else {
                let errMsg = [
                    "日本語で入力してね！アルファベットや数字、記号は使えないよ！",
                    "Siri:『すみません。アルファベットや数字、記号は使えません。』",
                ];
                say(errMsg[Math.floor(Math.random() * errMsg.length)]);
                reject(-1);
            }
        }
    });
}

// 全てのメッセージを受信できるようにする
app.message(async ({ message, say }) => {
    // console.log("message", message);
    // console.log("MSG received.", message.text);

    /*
    inputTypeAndWord = {
        type: "word" or "emoji",
        word: "林檎", ":apple:"など
    }
    */
    console.log("checking");
    let inputTypeAndWord = await normalize(message.text, say);
    if (inputTypeAndWord === -1) {
        return;
    }

    if (inputTypeAndWord.isNN) {
        say("んで終わっちゃダメだよ！");
        return;
    }

    console.log("inputTypeAndWord", inputTypeAndWord);

    try {
        let result = await askShiritoriAPI(inputTypeAndWord.word);
        let emojiResult = -1;

        // --- 単語チェック --- //
        if (result.yourWord == "回答できませんでした。") {
            say("Siri:『エラーが発生しました。「ん」を使ってませんか？』");
            return;
        }

        if (inputTypeAndWord.type == "emoji") {
            console.log("---------------");
            let emojiResult = await askEmojiDB(
                inputTypeAndWord.word,
                result.yourWord
            );
            console.log("emojiResult", emojiResult);
            if (emojiResult != -1) {
                // replace space with underscore
                console.log(emojiResult, "hihifhi");
                let emojiName = emojiResult.englishName.replace(/ /g, "_");
                usedWords.push(emojiResult.japaneseName);
                // nextChar is last char of yomi
                console.log(emojiResult.yomi);
                nextChar = emojiResult.yomi.slice(-1);
                console.log(nextChar);
                say(
                    `${emoji.get(emojiName)} (${
                        emojiResult.japaneseName
                    }) -> 次は 「${nextChar}」 !`
                );
                return;
            }
        }

        console.log(nextChar, result.yourWord[0], "validating");
        if (nextChar != null && result.yourWord[0] != nextChar) {
            say(
                "「" +
                    result.yourWord +
                    "」は「" +
                    nextChar +
                    "」で始まる単語じゃないよ！"
            );
            return;
        }

        // ん　で終わっていたら終了
        if (
            inputTypeAndWord.word.slice(-1) === "ん" ||
            inputTypeAndWord.word.slice(-1) === "ン"
        ) {
            say("んで終わってるじゃん😵!もう一回！");
            return;
        }
        // すでに使われていたら 指摘する
        if (usedWords.includes(result.yourWord)) {
            say("さっき使わなかったっけ？まあいっか");
        }

        // 有効であれば、usedWordsに追加

        usedWords.push(result.yourWord);
        usedWords.push(result.botWordYomi);
        nextChar = result.nextChar;

        console.log("usedWords", usedWords);
        console.log("nextChar", nextChar);

        say(
            result.botWord +
                "(" +
                result.botWordYomi +
                ")" +
                " -> 次は「" +
                result.nextChar +
                "」！"
        );
    } catch (error) {
        console.log("err");
        console.error(error);
    }
});

app.start(3000);
