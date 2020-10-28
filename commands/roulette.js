const {MessageEmbed} = require('discord.js');
const RouletteGame = require('../roulettegame.js');
const Discord = require('discord.js');
const client = new Discord.Client(["MANAGE_MESSAGES"]);

let players = new Array();

const rouletteGame = new RouletteGame(client);

const filter = response => {
	return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
}; 

module.exports = {
	name: 'roulette',
    description: 'Play a game of Russian roulette',
    aliases: ['gun'],
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
            console.log('TEST');
            if(message.author.id !== players.find(id => message.author.id) && players.filter(e => e.id === message.author.id).length == 0){
                players.push({
                    user: message.author,
                    id: message.author.id,
                });
                console.log(`Player joined: ${players[players.length - 1]}`);
                message.channel.send(`Player ${players[players.length - 1].user.username} joined to the Russian Roulette!`);
            }
            else{
                message.reply("You can't join twice!");
            }

            console.log('Players');
            console.log(players);
        }
        else if(argument === 'start'){
            if(players.length >= 1){
                rouletteGame.newGame(message, players);
            }
            else{
                message.channel.send('You can\'t start a game without any players!');
            }
        }
	},
};