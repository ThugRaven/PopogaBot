const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true,
		});
	}
});

client.login(token);

// const fs = require('fs');
// const Discord = require('discord.js');
// const { token } = require('./config.json');

// const bot = new Discord.Client();
// bot.commands = new Discord.Collection();

// const commandFiles = fs
// 	.readdirSync('./commands')
// 	.filter((file) => file.endsWith('.js'));

// for (const file of commandFiles) {
// 	const command = require(`./commands/${file}`);
// 	bot.commands.set(command.name, command);
// }

// const cooldowns = new Discord.Collection();

// bot.on('ready', () => {
// 	console.log('Bot is online!');
// });

// bot.on('message', (message) => {
// 	if (!message.content.startsWith(prefix) || message.author.bot) return;

// 	const args = message.content.slice(prefix.length).trim().split(/ +/);
// 	const commandName = args.shift().toLowerCase();

// 	const command =
// 		bot.commands.get(commandName) ||
// 		bot.commands.find(
// 			(cmd) => cmd.aliases && cmd.aliases.includes(commandName),
// 		);

// 	if (!command) return;

// 	if (command.guildOnly && message.channel.type === 'dm') {
// 		return message.reply("I can't execute that command inside DMs!");
// 	}

// 	if (command.args && !args.length) {
// 		let reply = `You didn't provide any arguments, ${message.author}!`;

// 		if (command.usage) {
// 			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
// 		}

// 		return message.channel.send(reply);
// 	}

// 	if (!cooldowns.has(command.name)) {
// 		cooldowns.set(command.name, new Discord.Collection());
// 	}

// 	const now = Date.now();
// 	const timestamps = cooldowns.get(command.name);
// 	const cooldownAmount = (command.cooldown || 3) * 1000;

// 	if (timestamps.has(message.author.id)) {
// 		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

// 		if (now < expirationTime) {
// 			const timeLeft = (expirationTime - now) / 1000;
// 			return message.reply(
// 				`Please wait ${timeLeft.toFixed(
// 					1,
// 				)} more second(s) before reusing the \`${command.name}\` command.`,
// 			);
// 		}
// 	}

// 	timestamps.set(message.author.id, now);
// 	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

// 	try {
// 		command.execute(message, args);
// 	} catch (error) {
// 		console.error(error);
// 		message.reply('There was an error trying to execute that command!');
// 	}
// });

// bot.login(token);
