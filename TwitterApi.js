const Twit = require('Twit');
const fs = require('fs');
const config = require('./config.json');
const { resolve } = require('path');

class TwitterApi {
    constructor () {
        const T = new Twit(config);

        this.twit = T;
    }

    async getVotesFromTweet() {
        return new Promise(resolve => {
            const tweetId = this.lastTweetId;

            if (!tweetId) return;

            const votesReplies = [];

            this.twit.get('search/tweets', { q: '@JogoDaVelhaBot' }, (err, data, res) => {
                if (err) return console.log(err);

                const statuses = data.statuses;
                const usersVoted = [];

                for (const status of statuses) {
                    const replyId = status['in_reply_to_status_id_str'];

                    if (replyId != tweetId) continue;

                    const user = status.user;

                    if (usersVoted.includes(user.screen_name)) continue;

                    const replyContent = status.text.replace('@JogoDaVelhaBot', '').trim();

                    const positions = replyContent.split(',');

                    if (!positions.length == 2) continue;

                    const posX = Number(positions[0]);
                    const posY = Number(positions[1]);

                    if (isNaN(posX) || isNaN(posY)) continue;

                    if (!(posX >= 1 && posX <= 3)) continue;
                    if (!(posY >= 1 && posY <= 3)) continue;

                    votesReplies.push([posX-1, posY-1]);
                    usersVoted.push(user.screen_name);
                }

                resolve(votesReplies);
            });
        });
    }

    async postBoardImage(relativePath, status = null) {
        return new Promise(resolve => {
            const boardContent = fs.readFileSync(__dirname + relativePath, { encoding: 'base64' });

            this.twit.post('media/upload', { media_data: boardContent }, (err, data, res) => {
                if (err) return console.log(err);

                const mediaId = data.media_id_string;
                const metaParams = { media_id: mediaId };

                this.twit.post('media/metadata/create', metaParams, (err, data, res) => {
                    if (err) return console.log(err);

                    const params = { media_ids: [mediaId] };

                    if (status) {
                        params.status = status;
                    }

                    this.twit.post('statuses/update', params, (err, data, res) => {
                        if (err) return console.log(err);

                        this.lastTweetId = data['id_str'];

                        console.log('Imagem enviada')

                        resolve();
                    });
                });
            });
        });
    }

    async updateDescription(wins) {
        return new Promise(resolve => {
            const newDescription = `Vezes que os usuários ganharam: ${wins.users}\nVezes que a Skynet ganhou: ${wins.skynet}\nVezes que deu velha: ${wins.velha}`;

            this.twit.post('account/update_profile', { description: newDescription }, (err, data, res) => {
                if (err) return console.log(err);

                resolve();
            })
        });
    } 
}

module.exports = TwitterApi;