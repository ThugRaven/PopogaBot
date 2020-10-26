const {MessageEmbed} = require('discord.js');

module.exports = {
	name: 'links',
	description: 'List of all the links',
	execute(message, args) {
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Links')
			.addField('Moodle', 
				'- [AK](https://el.us.edu.pl/wnst/course/view.php?id=1028)\n' +
				'- [RPIT](https://el.us.edu.pl/wnst/course/view.php?id=1042)\n' + 
				'- [SWI](https://el.us.edu.pl/wnst/course/view.php?id=1027)\n' + 
				'- [SO](https://el.us.edu.pl/wnst/course/view.php?id=56)');

        message.channel.send(embed);
	},
};