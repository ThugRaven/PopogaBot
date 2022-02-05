const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sponge')
		.setDescription('Convert your text to mocking spongebob.')
		.addStringOption((option) =>
			option
				.setName('message')
				.setDescription('The message that will be mocked')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('type')
				.setDescription('Choose the type of mocking')
				.addChoice('Default', 'default')
				.addChoice('Random', 'random'),
		),
	async execute(interaction) {
		let msg = interaction.options.getString('message');
		const type = interaction.options.getString('type') || 'default';

		let mockedMsg = '';

		console.log(type);
		console.log(msg);

		msg = msg.toLowerCase();
		if (type === 'default') {
			for (let i = 0; i < msg.length; i++) {
				if (i % 2 == 0) {
					mockedMsg = mockedMsg.concat(msg[i].toUpperCase());
				} else {
					mockedMsg = mockedMsg.concat(msg[i].toLowerCase());
				}
			}
		} else if (type === 'random') {
			for (let i = 0; i < msg.length; i++) {
				const rand = Math.random();
				if (rand < 0.5) {
					mockedMsg = mockedMsg.concat(msg[i].toUpperCase());
				} else {
					mockedMsg = mockedMsg.concat(msg[i].toLowerCase());
				}
			}
		}

		console.log(mockedMsg);
		await interaction.reply(mockedMsg);
	},
};
