const {
	SlashCommandBuilder,
	inlineCode,
	userMention,
} = require('@discordjs/builders');
const { Collection } = require('discord.js');
const XOGame = require('../classes/xogame.js');

const games = new Collection();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('xo')
		.setDescription('Play a game of Tic-tac-toe.')
		.addStringOption((option) =>
			option
				.setName('action')
				.setDescription('Choose game action')
				.addChoice('play', 'play')
				.addChoice('start', 'start')
				.addChoice('status', 'status')
				.setRequired(true),
		),
	async execute(interaction) {
		const msg = await interaction.deferReply({ fetchReply: true });

		const action = interaction.options.getString('action');

		let game = games.get(interaction.channelId);

		if (action === 'play') {
			console.log('Play');

			const player = {
				user: interaction.user,
				id: interaction.user.id,
			};

			if (game) {
				// Game created
				if (game.inGame) {
					// Game already started
					return await interaction.editReply(
						`The game has already started in this channel!`,
					);
				} else {
					// Add player to lobby
					if (game.players.length == 2) {
						console.log('Game full');

						return await interaction.editReply(
							`The game can only have 2 players!\nType ${inlineCode(
								'/xo start',
							)} to start a Tic Tac Toe game`,
						);
					}

					if (game.players[0].user.id === interaction.user.id) {
						return await interaction.editReply("You can't play with yourself!");
					}

					console.log(`Add player to lobby: ${player.user.username}`);

					game.addPlayer(player);
					return await interaction.editReply(
						`Player 1: ${userMention(
							game.players[0].user.id,
						)}\nPlayer 2: ${userMention(
							game.players[1].user.id,
						)}\nType ${inlineCode('/xo start')} to start the game!`,
					);
				}
			} else {
				// Create lobby
				console.log(
					`Create lobby id: ${interaction.channelId},\nwith player: ${player.user.username}`,
				);

				const xoGame = new XOGame(interaction.channelId);
				xoGame.addPlayer(player);
				games.set(interaction.channelId, xoGame);
				setTimeout(() => {
					game = games.get(interaction.channelId);
					if (game.players.length == 1) {
						console.log(`Remove XOGame with id of: ${interaction.channelId}`);

						interaction.followUp(
							`Guess no one wants to play with ${userMention(
								game.players[0].user.id,
							)} :frowning:`,
						);
						games.delete(interaction.channelId);
					}
				}, 30 * 1000);

				return await interaction.editReply(
					`Player 1: ${userMention(
						xoGame.players[0].user.id,
					)}, waiting for second user.\nType ${inlineCode('/xo play')} to play`,
				);
			}
		} else if (action === 'start') {
			if (!game) {
				return await interaction.editReply('No game to start!');
			} else {
				if (game.inGame) {
					return await interaction.editReply(
						'Game of Tic Tac Toe already started!',
					);
				} else if (game.players.length == 2) {
					await interaction.editReply('Game of Tic Tac Toe started!');
					return game.newGame(msg);
				} else if (game.players.length == 1) {
					return await interaction.editReply(
						"You can't start a game with 1 player!",
					);
				}
				await interaction.editReply('Error occured during game starting!');
			}
		} else if (action === 'status') {
			console.log(game);

			if (!game) {
				return await interaction.editReply(
					'No active game in current channel!',
				);
			} else {
				let status = '';
				status += `Game ID: ${game.id}\n`;
				status += `Game status: ${
					game.inGame ? 'Playing' : game.winner ? 'Game Over Lobby' : 'Lobby'
				}\n`;
				status += `Player 1: ${userMention(game.players[0].id)} - ${
					game.players[0].sign
				}\n`;
				if (game.players[1]) {
					status += `Player 1: ${userMention(game.players[1].id)} - ${
						game.players[1].sign
					}\n`;
				}
				status += `Round: ${game.round}\n`;
				status += `Turn: ${game.turn}\n`;
				if (game.winner) {
					status += `Winner: ${
						game.winner === 'Tie' ? 'Tie' : userMention(game.winner.id)
					}\n`;
				}
				status += `Board: ${game.gameBoard}\n`;

				return await interaction.editReply(status);
			}
		}
	},
};
