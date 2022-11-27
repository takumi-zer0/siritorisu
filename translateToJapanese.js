const { Translate } = require("@google-cloud/translate").v2;

// Creates a client
const translate = new Translate({
    // FIX ON DEPLOYMENT
    projectId: "102623110291049534629",
    keyFilename: "./secret.json",
});

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// const text = 'The text to translate, e.g. Hello, world!';
// const target = 'The target language, e.g. ru';

async function translateText(text) {
    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    const target = "ja";
    let [translations] = await translate.translate(text, target);
    translations = Array.isArray(translations) ? translations : [translations];
    console.log("Translations:");
    translations.forEach((translation, i) => {
        console.log(`${text[i]} => (${target}) ${translation}`);
    });
    console.log(translations, "translations");
    return translations[0];
}

async function translateToJapanese(word) {
    console.log("translating to japanese");
    let result = await translateText(word);
    console.log("result", result);
    return result;
}

module.exports = {
    translateToJapanese,
};
