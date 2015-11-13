var express = require('express');
var Slack = require('node-slack');
var request = require('request');
var dotenv = require('dotenv');

dotenv.load();

var app = express();
var slack = new Slack(process.env.SLACK_HOOK_URL);

var asciiEmoticons = {
    "arg": "(╯°Д°）╯︵/(.□ . \\)",
    "bear": "ʕ •ᴥ•ʔ",
    "content": "(´ー`)",
    "crying": "ಥ_ಥ",
    "dance": "ᕕ( ᐛ )ᕗ",
    "die": "(✖╭╮✖)",
    "diretide": "༼ つ ◕_◕ ༽つ GIVE DIRETIDE",
    "disapprove": "ಠ_ಠ",
    "do it": "(☞ﾟヮﾟ)☞",
    "excited": "*✲ﾟ*｡✧٩(･ิᴗ･ิ๑)۶*✲ﾟ :hart: *｡✧",
    "eyeroll": "◔_◔",
    "eyes": "ಠ_ಠ",
    "face": "(╯°□°)╯︵ ʞooqǝɔɐℲ",
    "fitch": "( °┏＿┓°)"  ,
    "flip": "(╯°□°）╯︵ ┻━┻",
    "frown": "ಠ╭╮ಠ",
    "hmm": "╭∩╮(-_-)╭∩╮" ,
    "hugs": "٩(๑•◡-๑)۶ⒽⓤⒼ :hart:",
    "lenny": "( ͡° ͜ʖ ͡°)",
    "lolhard": "。゜（゜＾▽＾゜）゜。",
    "love": "(≚ᄌ≚)ℒℴѵℯ :hart:",
    "ooh": "（◎ ｡ ◎）ooOO" ,
    "paget": "╰(´・｀)ﾉ",
    "sad": "◕︵◕",
    "satuan": "↶（｀∇´）"   ,
    "sayhello": " ̿ ̿'̿'\̵͇̿̿\\з=(•益•)=ε/̵͇̿̿/,'̿'̿ ",
    "shades": "(⌐■_■)",
    "shrug": "¯\\_(ツ)_/¯",
    "slap": "Slaps you with a large Trout! `·.¸¸ ><((((º>.·",
    "sleep": "（= ‸ =）"   ,
    "smile": "◕ ◡ ◕",
    "soon": "◉‿◉",
    "stare": "◉_◉",
    "unflip": "┬──┬◡ﾉ(° -°ﾉ)",
    "whatever": "ヽ( ´¬`)ノ",
    "win": "٩(^ᴗ^)۶" ,
    "y u no": "ლ(ಠ益ಠლ)",
    "yosh": "(๑•̀ㅂ•́)و",
    "zoid": "(V)(•,,,•)(V) woo woo woop"
};

var helpResponseMessage = '';
for (emoticon in asciiEmoticons) {
    helpResponseMessage += '*' + emoticon + '*: ' + asciiEmoticons[emoticon] + '\n';
}

app.use('/', function(req, res, next) {
    if (req.query.token !== process.env.SLACK_SLASH_COMMAND_TOKEN) {
        return res.status(500).send('Cross-site request detected!');
    }
    next();
});

app.get('/', function(req, res) {
    if (req.query.text == "help") {
        return res.send(helpResponseMessage);
    }
    if (req.query.text == "image") {
         var respond = {
                text: "Hi guys, ASCII slackbot here"
            };
         return slack.send(respond);
    }

    var userRequestUrl =
        'https://slack.com/api/users.info?' +
        'token=' + process.env.SLACK_TEAM_API_TOKEN +
        '&user=' + req.query.user_id;

    request(userRequestUrl, function (userErr, userRes, userBody) {
        if (!userErr && userRes.statusCode == 200) {
            userInfo = JSON.parse(userBody);

            if (userInfo.ok) {
                var emoticon = asciiEmoticons[req.query.text];

                if (emoticon) {
                    var payload = {
                        text: emoticon,
                        channel: req.query.channel_id,
                        username: userInfo.user.real_name,
                        icon_url: userInfo.user.profile.image_48
                    };

                    slack.send(payload);
                    res.send();
                } else {
                    res.status(404).send(' `' + req.query.text + '` not found. ' +
                        'Enter `' + req.query.command + ' help` for a list of available ASCII emoticons.');
                }
            } else {
                res.status(500).send('Error: `' + userInfo.error +'`.');
            }
        } else {
            res.status(500).send('Error: User `' + req.query.user_name +'` not found.');
        }
    });
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
