const {
	SlashCommandBuilder,
	inlineCode,
	userMention,
	channelMention,
} = require('@discordjs/builders');
const { XOGames } = require('../classes/games.js');
const XOGame = require('../classes/xogame.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('xo')
		.setDescription('Play a game of Tic-tac-toe.')
		.addSubcommand((subcommand) =>
			subcommand.setName('play').setDescription('Play a game of Tic Tac Toe'),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('start').setDescription('Start the game'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('info')
				.setDescription('Check game info')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('Check game info of given channel'),
				),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		let msg = null;
		console.log(subcommand);
		if (subcommand !== 'info') {
			console.log('INFO');
			msg = await interaction.deferReply({ fetchReply: true });
		}
		console.log(msg);

		let game = XOGames.get(interaction.channelId);

		if (subcommand === 'play') {
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
						// return await interaction.editReply("You can't play with yourself!");
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
				XOGames.set(interaction.channelId, xoGame);
				setTimeout(() => {
					game = XOGames.get(interaction.channelId);
					if (game.players.length == 1) {
						console.log(`Remove XOGame with id of: ${interaction.channelId}`);

						interaction.followUp(
							`Guess no one wants to play with ${userMention(
								game.players[0].user.id,
							)} :frowning:`,
						);
						XOGames.delete(interaction.channelId);
					}
				}, 30 * 1000);

				return await interaction.editReply(
					`Player 1: ${userMention(
						xoGame.players[0].user.id,
					)}, waiting for second user.\nType ${inlineCode('/xo play')} to play`,
				);
			}
		} else if (subcommand === 'start') {
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
		} else if (subcommand === 'info') {
			const channel = interaction.options.getChannel('channel');
			console.log(channel);
			if (channel) {
				game = XOGames.get(channel.id);
			}
			console.log(game);

			if (!game) {
				return await interaction.reply({
					content: `No active game in ${
						channel ? channelMention(channel.id) : 'current channel!'
					}`,
					ephemeral: true,
				});
			} else {
				let info = '';
				info += `Channel: ${
					channel
						? channelMention(channel.id)
						: channelMention(interaction.channelId)
				}\n`;
				info += `Game ID: ${game.id}\n`;
				info += `Game status: ${
					game.inGame ? 'Playing' : game.winner ? 'Game Over Lobby' : 'Lobby'
				}\n`;
				info += `Player 1: ${userMention(game.players[0].id)} - ${
					game.players[0].sign
				}\n`;
				if (game.players[1]) {
					info += `Player 1: ${userMention(game.players[1].id)} - ${
						game.players[1].sign
					}\n`;
				}
				info += `Round: ${game.round}\n`;
				info += `Turn: ${game.turn}\n`;
				if (game.winner) {
					info += `Winner: ${
						game.winner === 'Tie' ? 'Tie' : userMention(game.winner.id)
					}\n`;
				}
				info += `Board: ${game.gameBoard}\n`;

				return await interaction.reply({
					content: info,
					ephemeral: true,
				});
			}
		}
	},
};
