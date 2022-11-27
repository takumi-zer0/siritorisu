const axios = require('axios');

async function sendShiritoriWord(word) {

    const res = await axios.post('https://api-sunaba.xaiml.docomo-dialog.com/dialogue' ,
    {
        "appId": "65ba9625-3fec-43db-9683-876c59623ff2",
        "botId": "3584_ControllerBot",
        "voiceText": word,
        "initTalkingFlag": false,
        "language": "ja-JP",
      }, {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        }
      }
    ).catch((err) => {
        console.log("err", err)
        return -1
    })
    // console.log(res.data.dialogStatus.task)
    let arr = res.data.systemText.expression.split(" ")
    let result = {
      "yourWord": arr[0],
      "botWord": arr[1],
      "botWordYomi": arr[2],
      "nextChar": arr[3],
    }

    console.log(result)
    return result
    
}

module.exports = sendShiritoriWord