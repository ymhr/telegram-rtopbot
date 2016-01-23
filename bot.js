'use strict';

const TelegramBot = require('node-telegram-bot-api');
const subreddit = require('./endpoints/subreddit');

const config = require('./config');

const bot = new TelegramBot(config.token, {polling: true});

// subreddit.getTopPics('pics').then((images) => console.log(images));

bot.on('inline_query', msg => {
    console.log('message inbound');
    const queryId = msg.id;
    const subredditName = msg.query;

    if(subredditName.length > 0){
        subreddit.getTopPics(subredditName).then((images) => {
            bot.answerInlineQuery(queryId, images, {})
                .then((res) => {
                    console.log(res);
                });
        }).catch(err => console.log(err));
    }
});
