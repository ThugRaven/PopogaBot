const {MessageEmbed} = require('discord.js');
const XOGame = require('../game.js');
const Discord = require('discord.js');
const client = new Discord.Client(["MANAGE_MESSAGES"]);

let players = new Array();
const Player1 = 'X';
const Player2 = 'O';

const xoGame = new XOGame(client);

const filter = response => {
	return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
}; 

module.exports = {
	name: 'xo',
    description: 'Play Tic Tac Toe',
    args: ['start', 'play'],
    usage: '[start|play]',
    cooldown: 1,
	execute(message, args) {
        const { commands } = message.client;

        if(!args.length){
            return message.reply('That\'s not a valid command!');
        }
        
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.args && c.args.includes(name));

        if (!command) {
            return message.reply('That\'s not a valid command!');
        }

        const argument = args[0].toLowerCase();

        if(argument === 'play'){
            if(players.length == 0){
                players.push({
                    user: message.author,
                    id: message.author.id,
                    sign: Player1
                });
                console.log('Player 1');
                console.log(players);
                message.channel.send(`Player 1: ${players[0].user.username}, waiting for second user. Type \`!xo play\` to play`);
            }
            else if(message.author.id == players[0].user.id){
                return message.reply('You can\'t play with yourself!');
            }

            if(players.length == 1){
                const filter = m => m.content.includes('');
                const collector = message.channel.createMessageCollector(filter, { time: 30000 });
    
                collector.on('collect', m => {
                    //console.log(`Collected ${m.content}\n\n${m.author} == ${players[0].user} - ${m.author == players[0].user ? true : false} `);
                    if(m.author.id != players[0].user.id && !m.author.bot && players.length < 2 && argument === 'play'){
                        players.push({
                            user: m.author,
                            id: m.author.id,
                            sign: Player2
                        });
                        console.log('Player 1 Player 2');
                        console.log(players);
                        message.channel.send(`Player 1: ${players[0].user.username}, Player 2: ${players[1].user.username}`);
                        collector.stop();
                    }
                });
    
                collector.on('end', collected => {
                    console.log(`Collected ${collected.size} items`);
                    console.log(players.length);
                    if(players.length < 2){
                        message.channel.send(`Guess no one want to play with ${players[0].user.username} :frowning:`).then(() => {
                            players = new Array();
                        })
                    }
                });
            }
            
        }
        else if(argument === 'start'){
            if(players.length == 2){
                xoGame.newGame(message, players);
            }
            else{
                message.channel.send('You can\'t start a game with only one player!');
            }
        }
	},
};

