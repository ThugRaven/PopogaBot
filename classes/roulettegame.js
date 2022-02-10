const { MessageEmbed } = require('discord.js');
const { userMention } = require('@discordjs/builders');
const { MODE_EACH } = require('../constants.js');
const { RouletteGames } = require('./games.js');

let isOk = false;
class RouletteGame {
	constructor(id, timeout) {
		this.id = id;
		this.players = new Array();
		this.round = 0;
		this.gameEmbed = null;
		this.inGame = false;
		this.winner = null;
		this.message = null;
		this.bullet = new Array();
		this.pos = 0;
		this.type = -1;
		this.timeoutable = false;
		this.timeout = timeout;
	}

	addPlayer(player) {
		this.players.push(player);
	}

	newGame(msg, type, timeoutable) {
		if (this.inGame) return;

		console.log('New game');
		this.inGame = true;
		this.round = this.players.length;
		this.winner = null;
		this.message = msg;
		this.pos = 0;
		this.type = type;
		this.timeoutable = timeoutable;

		this.bullet = new Array(6).fill(false);
		this.bullet[Math.floor(Math.random() * 6)] = true;
		// console.log(this.bullet);

		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Russian Roulette')
			.setDescription('Wait for reactions to come up...');

		msg.channel.send({ embeds: [embed] }).then((emsg) => {
			this.gameEmbed = emsg;
			this.gameEmbed.react('🔫').then(() => {
				const player = this.players[this.round % this.players.length].user;
				console.log(`${player.username} - ${this.round}`);
				const editEmbed = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Russian Roulette')
					.setDescription(
						`${userMention(player.id)} it's your time to shoot 🙂🔫`,
					)
					.setImage('https://media.giphy.com/media/mwFRWrcN1z42s/giphy.gif');
				this.gameEmbed.edit({ embeds: [editEmbed] });
			});

			this.waitForReaction();
		});
	}

	step() {
		if (isOk) {
			console.log('Step');

			if (this.type === MODE_EACH) {
				this.bullet = new Array(6).fill(false);
				this.bullet[Math.floor(Math.random() * 6)] = true;
			}
			console.log(this.bullet);

			this.round++;
			this.pos++;
			const player = this.players[this.round % this.players.length].user;
			console.log(`${player.username} - ${this.round}`);

			let editEmbed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Russian Roulette')
				.setDescription('🙂🔫')
				.setImage('https://media.giphy.com/media/3o6Mb2Cq10b0OQRqYU/giphy.gif');
			this.gameEmbed.edit({ embeds: [editEmbed] });

			setTimeout(() => {
				editEmbed = new MessageEmbed()
					.setColor('#28a745')
					.setTitle('Russian Roulette')
					.setDescription(
						`${userMention(player.id)} it's your time to shoot 🙂🔫`,
					)
					.setImage('https://media.giphy.com/media/mwFRWrcN1z42s/giphy.gif');
				this.gameEmbed.edit({ embeds: [editEmbed] });

				this.waitForReaction();
			}, 3000);
		} else {
			this.waitForReaction();
		}
	}

	check() {
		const player = this.players[this.round % this.players.length];

		if (this.type === MODE_EACH) {
			if (this.bullet[this.pos % 6] == true) {
				this.winner = player;
				return true;
			} else {
				return false;
			}
		} else if (this.bullet[this.pos] == true) {
			this.winner = player;
			return true;
		} else {
			return false;
		}
	}

	gameOver() {
		let editEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Russian Roulette')
			.setDescription('🙂🔫')
			.setImage('https://media.giphy.com/media/3o6Mb2Cq10b0OQRqYU/giphy.gif');
		this.gameEmbed.edit({ embeds: [editEmbed] });

		setTimeout(async () => {
			this.inGame = false;
			let timeoutText = '';

			console.log(this.winner);
			console.log(this.timeoutable);
			if (this.timeoutable) {
				console.log('timeout');
				const userToTimeout = await this.message.guild.members.fetch(
					this.winner.user.id,
				);
				console.log(userToTimeout);
				try {
					const time = (this.pos + 1) * 10 * 1000;
					await userToTimeout.timeout(time, 'Reconsider your life choices');
					timeoutText = `Enjoy your ${time / 1000}s timeout!`;
					const index = this.players.findIndex(
						({ id }) => id === this.winner.user.id,
					);
					this.players.splice(index, 1);
				} catch (error) {
					timeoutText = "Can't timeout this user!";
				}
			}

			const description =
				this.pos >= 6
					? `Finally after ${this.pos + 1} pulls ${userMention(
							this.winner.user.id,
					  )} shoot himself in the head 🙂`
					: `${userMention(this.winner.user.id)} shoot himself in the head`;
			editEmbed = new MessageEmbed()
				.setColor('#dc3545')
				.setTitle('Russian Roulette')
				.setDescription(
					`😵💥🔫\n\n${description}\n${timeoutText}\n\nPress 🔁 to restart`,
				)
				.setImage('https://media.giphy.com/media/l46C7ZAkAoQ2A9wUU/giphy.gif')
				.setTimestamp();
			this.gameEmbed.edit({ embeds: [editEmbed] });

			const filter = (reaction, user) => {
				return (
					['🔁', '❌'].includes(reaction.emoji.name) &&
					user.id !== this.gameEmbed.author.id
				);
			};

			this.gameEmbed.react('🔁');
			this.gameEmbed.react('❌');
			this.gameEmbed
				.awaitReactions({ filter, max: 1, time: 60 * 1000, errors: ['time'] })
				.then((collected) => {
					const reaction = collected.first();

					if (reaction.emoji.name == '🔁') {
						console.log('Restart');
						// Remove message for performance
						this.gameEmbed.delete({ timeout: 2 * 1000 });
						if (this.players.length > 0) {
							this.newGame(this.message, this.type, this.timeoutable);
						} else {
							this.message.channel.send(
								'Sadly, there are no more players to play 🙂',
							);
							RouletteGames.delete(this.id);
							console.log(
								`Remove RRGame (no more players) with id of: ${this.id}`,
							);
						}
					} else if (reaction.emoji.name == '❌') {
						console.log('Remove');
						this.gameEmbed.delete({ timeout: 1 * 1000 });
						RouletteGames.delete(this.id);
						console.log(`Remove RRGame with id of: ${this.id}`);
					}
				})
				.catch((collected) => {
					console.error(collected);
					this.gameEmbed.delete({ timeout: 2 * 1000 });
					console.log('error/removed due to timeout');
					RouletteGames.delete(this.id);
					console.log(`Remove RRGame with id of: ${this.id}`);
				});
		}, 3000);
	}

	waitForReaction() {
		const filter = (reaction, user) => {
			return (
				['🔫'].includes(reaction.emoji.name) &&
				user.id !== this.gameEmbed.author.id
			);
		};

		this.gameEmbed
			.awaitReactions({ filter, max: 1, errors: ['time'] })
			.then((collected) => {
				const reaction = collected.first();
				const user = reaction.users.cache
					.filter((u) => u.id !== this.gameEmbed.author.id)
					.first();

				if (reaction.emoji.name == '🔫') {
					console.log(`Shoot ${this.pos}`);
					if (this.type === MODE_EACH) {
						console.log(`Shoot % ${this.pos % 6}`);
					}
					this.pick(user);
				}

				reaction.users
					.remove(
						reaction.users.cache
							.filter((u) => u.id !== this.gameEmbed.author.id)
							.first().id,
					)
					.then(() => {
						if (this.check()) {
							this.gameOver();
						} else {
							this.step();
						}
					});
			})
			.catch(() => {
				console.log('error - waitForReaction');
				this.gameOver();
			});
	}

	pick(user) {
		let player = false;

		for (let i = 0; i < this.players.length; i++) {
			console.log(
				`${this.players[this.round % this.players.length].user.id} = ${
					user.id
				}`,
			);
			if (
				this.players[i].user.id == user.id &&
				this.players[this.round % this.players.length].user.id == user.id
			) {
				player = true;
				break;
			}
		}

		if (player == true) {
			return (isOk = true);
		} else {
			return (isOk = false);
		}
	}
}

module.exports = RouletteGame;
