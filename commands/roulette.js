const RouletteGame = require('../roulettegame.js');
const Discord = require('discord.js');
const client = new Discord.Client(['MANAGE_MESSAGES']);
const { TYPE_EACH, TYPE_ONCE } = require('../constants.js');

const players = new Array();

const rouletteGame = new RouletteGame(client);

module.exports = {
	name: 'roulette',
	description:
		'Play a game of Russian roulette\nModes:\neach - respin after each trigger pull\nonce - only spin once at the start',
	aliases: ['gun'],
	args: ['start', 'play'],
	usage: '[start [each|once]|play]',
	cooldown: 1,
	execute(message, args) {
		const { commands } = message.client;

		if (!args.length) {
			return message.reply("That's not a valid command!");
		}

		const name = args[0].toLowerCase();
		const command =
			commands.get(name) ||
			commands.find((c) => c.args && c.args.includes(name));

		const argument = args[0].toLowerCase();
		let gameType = null;
		let isTimeoutEnabled = null;

		if (!command) {
			return message.reply("That's not a valid command!");
		}

		if (argument === 'start') {
			gameType = args[1];
			if (gameType == null) {
				return message.reply(
					'Choose proper gamemode!\neach - respin after each trigger pull\nonce - only spin once at the start',
				);
			}
		}

		if (argument === 'play') {
			if (
				message.author.id !== players.find(() => message.author.id) &&
				players.filter((e) => e.id === message.author.id).length == 0
			) {
				players.push({
					user: message.author,
					id: message.author.id,
				});
				console.log(`Player joined: ${players[players.length - 1]}`);
				message.channel.send(
					`Player ${
						players[players.length - 1].user.username
					} joined to the Russian Roulette!`,
				);
			} else {
				message.reply("You can't join twice!");
			}

			console.log('Players');
			console.log(players);
		} else if (argument === 'start') {
			if (players.length >= 1) {
				isTimeoutEnabled = args[2];
				console.log(isTimeoutEnabled);
				if (isTimeoutEnabled != null) {
					if (isTimeoutEnabled === 'true') {
						isTimeoutEnabled = true;
					} else if (isTimeoutEnabled === 'false') {
						isTimeoutEnabled = false;
					}
				}

				if (gameType === 'each') {
					rouletteGame.newGame(message, players, TYPE_EACH, isTimeoutEnabled);
				} else if (gameType === 'once') {
					rouletteGame.newGame(message, players, TYPE_ONCE, isTimeoutEnabled);
				}
			} else {
				message.channel.send("You can't start a game without any players!");
			}
		}
	},
};
