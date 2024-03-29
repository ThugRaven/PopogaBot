const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription("Check the bot's ping"),
	async execute(interaction) {
		const sent = await interaction.reply({
			content: 'Pinging...',
			fetchReply: true,
		});
		interaction.editReply(
			`Roundtrip latency: ${
				sent.createdTimestamp - interaction.createdTimestamp
			}ms\nWebsocket heartbeat: ${interaction.client.ws.ping}ms.`,
		);
	},
};
