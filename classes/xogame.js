const { MessageEmbed } = require('discord.js');

const WIDTH = 3;
const HEIGHT = 3;
const gameBoard = [];

const combinations = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

// let moves = {
//     'X': [],
//     'O': []
// };

const DefSign = 'D';
const Player1 = 'X';
const Player2 = 'O';

let isOk = false;

const DSign = '🟦';
const XSign = ':regional_indicator_x:';
const OSign = ':regional_indicator_o:';

class XOGame {
	constructor(id) {
		this.id = id;
		this.players = new Array();
		this.round = 0;
		this.turn = this.round % 2 === 0 ? Player2 : Player1;
		this.gameEmbed = null;
		this.inGame = false;
		this.winner = null;
		this.moves = [];
		this.message = null;
		for (let x = 0; x < WIDTH; x++) {
			for (let y = 0; y < HEIGHT; y++) {
				gameBoard[x * WIDTH + y] = DefSign;
			}
		}
	}

	addPlayer(player) {
		this.players.push(player);
	}

	gameBoardToString() {
		let str = '';
		for (let x = 0; x < WIDTH; x++) {
			for (let y = 0; y < HEIGHT; y++) {
				let sign;
				if (gameBoard[x * WIDTH + y] == 'D') {
					sign = DSign;
				} else if (gameBoard[x * WIDTH + y] == 'X') {
					sign = XSign;
				} else if (gameBoard[x * WIDTH + y] == 'O') {
					sign = OSign;
				}

				str += sign;
			}
			str += '\n';
		}
		return str;
	}

	newGame(msg) {
		if (this.inGame) return;

		console.log('New game');
		this.inGame = true;
		this.round = 0;
		this.winner = null;
		this.moves = [];
		this.message = msg;

		this.players[0].sign = Player1;
		this.players[1].sign = Player2;
		console.log(this.players);

		for (let x = 0; x < WIDTH; x++) {
			for (let y = 0; y < HEIGHT; y++) {
				gameBoard[x * WIDTH + y] = DefSign;
			}
		}

		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Tic Tac Toe')
			.setDescription(
				`Wait for reactions to come up...\n\n${this.gameBoardToString()}`,
			);

		msg.channel.send({ embeds: [embed] }).then((emsg) => {
			this.gameEmbed = emsg;
			this.gameEmbed.react('1️⃣');
			this.gameEmbed.react('2️⃣');
			this.gameEmbed.react('3️⃣');
			this.gameEmbed.react('🟥');
			this.gameEmbed.react('4️⃣');
			this.gameEmbed.react('5️⃣');
			this.gameEmbed.react('6️⃣');
			this.gameEmbed.react('🟩');
			this.gameEmbed.react('7️⃣');
			this.gameEmbed.react('8️⃣');
			this.gameEmbed.react('9️⃣').then(() => {
				const sign = this.turn == Player1 ? XSign : OSign;
				const editEmbed = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Tic Tac Toe')
					// .setAuthor(`${this.turn}`)
					// .setDescription(this.gameBoardToString());
					// .setDescription(this.gameBoardToString() + "\n" + this.players[0].user.username);
					.setDescription(
						`${sign} - ${
							this.turn == this.players[0].sign
								? this.players[0].user.username
								: this.players[1].user.username
						}\n\n${this.gameBoardToString()}`,
					);
				this.gameEmbed.edit({ embeds: [editEmbed] });
			});

			this.waitForReaction();
		});
	}

	step() {
		if (isOk) {
			this.round++;
			this.turn = this.round % 2 === 0 ? Player2 : Player1;

			const sign = this.turn == Player1 ? XSign : OSign;
			const editEmbed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Tic Tac Toe')
				// .setAuthor(`${this.turn}`)
				.setDescription(
					`${sign} - ${
						this.turn == this.players[0].sign
							? this.players[0].user.username
							: this.players[1].user.username
					}\n\n${this.gameBoardToString()}`,
				);
			this.gameEmbed.edit({ embeds: [editEmbed] });
		}
		this.waitForReaction();
	}

	equals3(a, b, c) {
		return a == b && b == c && a != DefSign;
	}

	checkBoard() {
		/*
            [x][y]
            x
            x
            x

            yyy
        */

		let isDone = true;
		// List of moves
		for (let x = 0; x < WIDTH; x++) {
			this.moves[x] = [];
			for (let y = 0; y < HEIGHT; y++) {
				this.moves[x][y] = gameBoard[x * HEIGHT + y];
				if (this.moves[x][y] == DefSign) isDone = false;
			}
		}
		// console.log(this.moves);

		// Horizontal
		for (let x = 0; x < WIDTH; x++) {
			if (this.equals3(this.moves[x][0], this.moves[x][1], this.moves[x][2])) {
				console.log(
					`Test ${this.moves[x][0]} ${this.moves[x][1]} ${this.moves[x][2]}`,
				);
				console.log('1');
				this.winner = this.moves[x][0];
			}
		}

		// Vertical
		for (let x = 0; x < WIDTH; x++) {
			if (this.equals3(this.moves[0][x], this.moves[1][x], this.moves[2][x])) {
				this.winner = this.moves[0][x];
				console.log('2');
			}
		}

		// Diagonal Top-Bot LR
		if (this.equals3(this.moves[0][0], this.moves[1][1], this.moves[2][2])) {
			this.winner = this.moves[0][0];
			console.log('3');
		}

		// Diagonal Top-Bot RL
		if (this.equals3(this.moves[2][0], this.moves[1][1], this.moves[0][2])) {
			this.winner = this.moves[2][0];
			console.log('4');
		}

		if (this.winner != null) {
			console.log('Winner: ' + this.winner);
			if (this.players[0].sign == this.winner) {
				this.winner = this.players[0].user.username;
			} else {
				this.winner = this.players[1].user.username;
			}
			return true;
		} else if (isDone) {
			this.winner = 'Tie';
			return true;
		} else {
			return false;
		}
	}

	gameOver() {
		this.inGame = false;
		const editEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Tic Tac Toe')
			.setDescription(
				'GAME OVER!\nWinner: ' + this.winner + '\n\nPress 🔁 to restart',
			)
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
					this.newGame(this.message);
				} else if (reaction.emoji.name == '❌') {
					console.log('Remove');
					this.gameEmbed.delete({ timeout: 1 * 1000 });
				}
			})
			.catch((collected) => {
				console.error(collected);
				this.gameEmbed.delete({ timeout: 2 * 1000 });
				console.log('error/removed due to timeout');
			});
		// this.gameEmbed.reactions.removeAll()
	}

	waitForReaction() {
		const filter = (reaction, user) => {
			return (
				['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'].includes(
					reaction.emoji.name,
				) && user.id !== this.gameEmbed.author.id
			);
		};

		this.gameEmbed
			.awaitReactions({
				filter,
				max: 1,
				errors: ['time'],
			})
			.then((collected) => {
				const reaction = collected.first();
				const user = reaction.users.cache
					.filter((u) => u.id !== this.gameEmbed.author.id)
					.first();

				switch (reaction.emoji.name) {
					case '1️⃣':
						this.pick(0, user);
						break;
					case '2️⃣':
						this.pick(1, user);
						break;
					case '3️⃣':
						this.pick(2, user);
						break;
					case '🟥':
						console.log('ble');
						break;
					case '4️⃣':
						this.pick(3, user);
						break;
					case '5️⃣':
						this.pick(4, user);
						break;
					case '6️⃣':
						this.pick(5, user);
						break;
					case '🟩':
						console.log('ble');
						break;
					case '7️⃣':
						this.pick(6, user);
						break;
					case '8️⃣':
						this.pick(7, user);
						break;
					case '9️⃣':
						this.pick(8, user);
						break;
				}

				reaction.users
					.remove(
						reaction.users.cache
							.filter((u) => u.id !== this.gameEmbed.author.id)
							.first().id,
					)
					.then(() => {
						if (this.checkBoard()) {
							this.gameOver();
						} else {
							this.step();
						}
					});
			})
			.catch(() => {
				console.log('error');
				this.gameOver();
			});
	}

	pick(num, user) {
		let player = false;

		for (let i = 0; i < this.players.length; i++) {
			// console.log(this.players[i].user.id + " " + this.players[i].sign)
			if (
				this.players[i].user.id == user.id &&
				this.players[i].sign == this.turn
			) {
				player = true;
				break;
			}
		}

		if (gameBoard[num] == DefSign && player == true) {
			gameBoard[num] = this.turn;
			return (isOk = true);
		} else {
			return (isOk = false);
		}
	}
}

module.exports = XOGame;
