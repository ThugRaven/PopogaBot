const {
	SlashCommandBuilder,
	inlineCode,
	userMention,
	channelMention,
} = require('@discordjs/builders');
const { RouletteGames } = require('../classes/games.js');
const RouletteGame = require('../classes/roulettegame.js');
const { MODE_EACH, MODE_ONCE } = require('../constants.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gun')
		.setDescription('Play a game of Russian Roulette')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('play')
				.setDescription('Play a game of Russian Roulette'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('start')
				.setDescription('Start the game')
				.addStringOption((option) =>
					option
						.setName('mode')
						.setDescription(
							'Game mode: each - respin after each trigger pull, once - only spin once at the start',
						)
						.addChoice('each', 'each')
						.addChoice('once', 'once')
						.setRequired(true),
				)
				.addBooleanOption((option) =>
					option.setName('timeout').setDescription('Loser gets timeout'),
				),
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
		if (subcommand !== 'info') {
			msg = await interaction.deferReply({ fetchReply: true });
		}

		let game = RouletteGames.get(interaction.channelId);

		if (subcommand === 'play') {
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
					console.log(player);
					if (player.id === game.players.find(() => player.id)) {
						return await interaction.editReply(`You can't join twice!`);
					}

					console.log(`Add player to lobby: ${player.user.username}`);

					game.addPlayer(player);
					return await interaction.editReply(
						`User ${userMention(player.id)} joined to the Russian Roulette!`,
					);
				}
			} else {
				// Create lobby
				console.log(
					`Create RR lobby id: ${interaction.channelId},\nwith player: ${player.user.username}`,
				);

				const rouletteGame = new RouletteGame(interaction.channelId);
				rouletteGame.addPlayer(player);
				RouletteGames.set(interaction.channelId, rouletteGame);
				setTimeout(() => {
					game = RouletteGames.get(interaction.channelId);
					if (!game.inGame) {
						console.log(`Remove RR with id of: ${interaction.channelId}`);

						interaction.followUp(`Lobby was closed due to timeout`);
						RouletteGames.delete(interaction.channelId);
					}
				}, 30 * 1000);

				return await interaction.editReply(
					`User ${userMention(
						rouletteGame.players[0].user.id,
					)} started a Russian Roulette lobby!\nType ${inlineCode(
						'/gun play',
					)} to join`,
				);
			}
		} else if (subcommand === 'start') {
			if (!game) {
				return await interaction.editReply('No game to start!');
			} else {
				if (game.inGame) {
					return await interaction.editReply(
						'Game of Russian Roulette already started!',
					);
				} else if (game.players.length >= 1) {
					const gameMode = interaction.options.getString('mode');
					const timeout = interaction.options.getBoolean('timeout') || false;

					game.newGame(
						msg,
						gameMode === 'each' ? MODE_EACH : MODE_ONCE,
						timeout,
					);
					console.log(
						`Start RR game id: ${interaction.channelId}, mode: ${gameMode}, timeoutable: ${timeout}`,
					);

					return await interaction.editReply(
						'Game of Russian Roulette started!',
					);
				}
				await interaction.editReply('Error occured during game starting!');
			}
		} else if (subcommand === 'info') {
			const channel = interaction.options.getChannel('channel');
			console.log(channel);
			if (channel) {
				game = RouletteGames.get(channel.id);
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
