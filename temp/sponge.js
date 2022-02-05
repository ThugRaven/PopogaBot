module.exports = {
	name: 'sponge',
	description: 'Convert your text to mocking spongebob',
	execute(message, args) {
		console.log(args);
		let msg = '';
		let finalMsg = '';

		for (const x in args) {
			msg += args[x] + ' ';
		}

		msg = msg.toLowerCase();
		console.log(msg);

		for (let i = 0; i < msg.length; i++) {
			const rand = Math.random();
			if (rand < 0.5) {
				finalMsg += msg[i].toUpperCase();
			} else {
				finalMsg += msg[i].toLowerCase();
			}
		}

		console.log(finalMsg);

		message.channel.send(finalMsg);
	},
};
