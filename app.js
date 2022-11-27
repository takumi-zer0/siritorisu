const { App } = require("@slack/bolt");
const sendShiritoriWord = require("./sendShiritoriWord");
require("dotenv").config();
const { translateToJapanese } = require("./translateToJapanese");

// globa array to store the words
const usedWords = [];
let nextChar = null;

const app = new App({
    token: process.env.TOKEN,
    signingSecret: process.env.SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.APP_TOKEN,
});
