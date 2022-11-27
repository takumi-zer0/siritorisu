const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function getHiragana(data) {
    // check if word is hiragana or katakana
    if (data.match(/^[ぁ-ん]+$/)) {
        return data;
    } else if (data.match(/^[ァ-ヶー]+$/)) {
        console.log("katakana");
        // turn katakana to hiragana
        return data.replace(/[\u30a1-\u30f6]/g, function (match) {
            var chr = match.charCodeAt(0) - 0x60;
            return String.fromCharCode(chr);
        });
    } else {
        return -1;
    }
}

async function askEmojiDB(word, yourWord) {
    return new Promise(async (resolve, reject) => {
        console.log("word", word);
        console.log("yourWord", yourWord);

        let hiragana = getHiragana(word);
        if (hiragana === -1) {
            hiragana = getHiragana(yourWord);
        }
        let searchChar = hiragana.slice(-1);

        try {
            // get data where yomi starts with searchChar and does not end with "ん"
            const oneData = await prisma.emoji.findMany({
                where: {
                    yomi: {
                        startsWith: searchChar,
                        not: {
                            endsWith: "ん",
                        },
                    },
                },
            });
            console.log(oneData, "ONEDATA");
            if (oneData.length === 0) {
                resolve(-1);
            }
            // pick random one
            let randomIndex = Math.floor(Math.random() * oneData.length);
            let randomEmoji = oneData[randomIndex];
            resolve(randomEmoji);
        } catch (error) {
            console.log(error);
            resolve(-1);
        } finally {
            await prisma.$disconnect();
        }
    });
}

module.exports = {
    askEmojiDB,
};
