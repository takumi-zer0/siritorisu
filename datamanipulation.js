const fs = require("fs");
const { translateToJapanese } = require("./translateToJapanese");
const axios = require("axios");

async function hiragana(word) {
    return new Promise((resolve, reject) => {
        axios
            .post("https://labs.goo.ne.jp/api/hiragana", {
                app_id: "1fc287990600fe6ba3e3980af38a5b21afed5d0fb5aa9a461d3b3961eabc9e3f",
                sentence: word,
                output_type: "hiragana",
            })
            .then((res) => {
                console.log(res.data.converted);
                resolve(res.data.converted);
            });
    });
}

async function main() {
    // get json data from emoji.json
    let rawdata = fs.readFileSync("emoji.json");
    let emojiData = JSON.parse(rawdata);

    // for each key in the json data
    let cnt = 0;
    for (const key in emojiData) {
        let tempSingleEmojiData = {
            emoji: emojiData[key],
            englishName: "",
            japaneseName: "",
            yomi: "",
        };

        // replace _ with space
        let englishName = key.replace(/_/g, " ");
        let japaneseName = await translateToJapanese(englishName);
        tempSingleEmojiData.englishName = englishName;
        tempSingleEmojiData.japaneseName = japaneseName;
        tempSingleEmojiData.yomi = await hiragana(japaneseName);
        console.log(tempSingleEmojiData);
        // append to json file
        fs.appendFileSync(
            "emojiData.json",
            JSON.stringify(tempSingleEmojiData) + ",\n"
        );
        // pause for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

main();
