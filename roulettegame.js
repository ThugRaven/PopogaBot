const Discord = require('discord.js');

let isOk = false;
let firstTime = true;

class RouletteGame {
    constructor() {
        this.players = new Array();
        this.round = 0;
        this.gameEmbed = null;
        this.inGame = false;
        this.winner = null;
        this.message = null;
        this.bullet = new Array();
        this.pos = 0;
        this.type = -1;
    }

    newGame(msg, players, type) {
        if (this.inGame)
            return;

        console.log('New game');
        this.inGame = true;
        this.round = players.length;
        this.winner = null;
        this.message = msg;
        this.pos = 0;
        this.type = type;

        this.players = players;
        this.bullet = new Array(6).fill(false);
        this.bullet[Math.floor(Math.random() * 6)] = true;
        console.log(this.bullet);

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Russian Roulette')
            .setDescription(`Wait for reactions to come up...`);

        msg.channel.send(embed).then(emsg => {
            this.gameEmbed = emsg;
            this.gameEmbed.react('🔫').then(() => {
                let player = players[this.round % players.length].user.username;
                console.log(`${player} - ${this.round}`);
                const editEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Russian Roulette')
                .setDescription(`${player} it's your time to shoot 🙂🔫`)
                .setImage('https://media.giphy.com/media/mwFRWrcN1z42s/giphy.gif');
                this.gameEmbed.edit(editEmbed);
            })

            this.waitForReaction();
        });
    }

    step() {
        if(isOk){
            console.log('Step');

            if(this.type === '2'){
                this.bullet = new Array(6).fill(false);
                this.bullet[Math.floor(Math.random() * 6)] = true;
            }
            //console.log(this.bullet);

            this.round++;
            this.pos++;
            let player = this.players[this.round % this.players.length].user.username;
            console.log(`${player} - ${this.round}`);
            

            const editEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Russian Roulette')
            .setDescription(`🙂🔫`)
            .setImage('https://media.giphy.com/media/3o6Mb2Cq10b0OQRqYU/giphy.gif');
            this.gameEmbed.edit(editEmbed);

            setTimeout(() => {
                const editEmbed = new Discord.MessageEmbed()
                .setColor('#28a745')
                .setTitle('Russian Roulette')
                .setDescription(`${player} it's your time to shoot 🙂🔫`)
                .setImage('https://media.giphy.com/media/mwFRWrcN1z42s/giphy.gif')
                this.gameEmbed.edit(editEmbed);

                this.waitForReaction();
            }, 3000);
        }
        else{
            this.waitForReaction();
        }
    }

    check() {
        let player = this.players[this.round % this.players.length].user.username;

        if(this.type === '2'){
            if(this.bullet[this.pos % 6] == true){
                this.winner = player;
                return true;
            }
            else return false;
        }
        else{
            if(this.bullet[this.pos] == true){
                this.winner = player;
                return true;
            }
            else return false;
        }
    }

    gameOver() {
        let player = this.players[this.round % this.players.length].user.username;

        const editEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Russian Roulette')
        .setDescription(`🙂🔫`)
        .setImage('https://media.giphy.com/media/3o6Mb2Cq10b0OQRqYU/giphy.gif');
        this.gameEmbed.edit(editEmbed);

        setTimeout(() => {
            this.inGame = false;
            const editEmbed = new Discord.MessageEmbed()
                .setColor('#dc3545')
                .setTitle('Russian Roulette')
                .setDescription(`😵🔫\n\n${this.winner} shoot himself in the head\n\nPress 🔁 to restart`)
                .setImage('https://media.giphy.com/media/l46C7ZAkAoQ2A9wUU/giphy.gif')
                .setTimestamp();
            this.gameEmbed.edit(editEmbed);
    
            const filter = (reaction, user) => {
               return ['🔁','❌'].includes(reaction.emoji.name) && user.id !== this.gameEmbed.author.id;
            };
    
            this.gameEmbed.react('🔁');
            this.gameEmbed.react('❌');
            this.gameEmbed.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
            
                    if (reaction.emoji.name == '🔁') {
                        console.log('Restart');
                        //Remove message for performance
                        this.gameEmbed.delete({ timeout: 2000 });
                        this.newGame(this.message, this.players, this.type);
                    }
                    else if(reaction.emoji.name == '❌'){
                        console.log('Remove');
                        this.gameEmbed.delete({ timeout: 1000 });
                    }
                })
                .catch(collected => {
                    console.error(collected);
                    this.gameEmbed.delete({ timeout: 2000 });
                    console.log('error/removed due to timeout');
                });
        }, 3000);
    }

    waitForReaction() {
        const filter = (reaction, user) => {
            return ['🔫'].includes(reaction.emoji.name) && user.id !== this.gameEmbed.author.id;
        }

        this.gameEmbed.awaitReactions(filter, { max: 1, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();
                const user = reaction.users.cache.filter(user => user.id !== this.gameEmbed.author.id).first();

                if(reaction.emoji.name == '🔫'){
                    console.log(`Shoot ${this.pos}`);
                    if(this.type === '2'){
                        console.log(`Shoot % ${this.pos % 6}`);
                    }
                    this.pick(user);
                }

                reaction.users.remove(reaction.users.cache.filter(user => user.id !== this.gameEmbed.author.id).first().id).then(() => {
                    if (this.check()) {
                        this.gameOver();
                    }
                    else {
                        this.step();
                    }
                });
            })
            .catch(collected => {
                console.log('error - waitForReaction');
                this.gameOver();
            });
    }

    pick(user){
        let player = false;

        for(let i = 0; i < this.players.length; i++){
            console.log(`${this.players[this.round % this.players.length].user.id} = ${user.id}`);
                 if(this.players[i].user.id == user.id && this.players[this.round % this.players.length].user.id == user.id){
                     player = true; break;
                 }
        }

        if(player == true){
            return isOk = true;
        }
        else return isOk = false;
    }
}

module.exports = RouletteGame;