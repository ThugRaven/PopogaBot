const { MessageAttachment } = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message) {
		message.channel.send(
			'Pong.',
			new MessageAttachment(
				'https://cdn.betterttv.net/emote/5dca0f9227360247dd652228/2x.png',
			),
		);
	},
};
