module.exports.run = (client, message, [command], level) => {
  const settings = client.getSettings(message.guild);

  if (!command) {
    let commands = client.commands.filter((cmd) => client.levelCache[cmd.conf.permLevel] <= level
      && client.enabledCmds.get(cmd.help.name).enabled === true);

    if (!message.guild) {
      commands = client.commands.filter((cmd) => client.levelCache[cmd.conf.permLevel] <= level
        && cmd.conf.guildOnly === false);
    }

    const commandNames = commands.keyArray();
    const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

    let currentCategory = '';
    let output = `= Command List =\n\n[Use ${settings.prefix}help <command name> for details]\n`;

    // eslint-disable-next-line no-nested-ternary
    const sorted = commands.array().sort((p, c) => (p.help.category > c.help.category ? 1
      : p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1));
    sorted.forEach((c) => {
      const cat = c.help.category.toProperCase();
      if (currentCategory !== cat) {
        output += `\u200b\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      output += `${settings.prefix}${c.help.name}${' '.repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
    });
    message.channel.send(output, { code: 'asciidoc', split: { char: '\u200b' } });
  } else if (client.commands.has(command) || client.aliases.has(command)) {
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

    let output = `= ${cmd.help.name} = \n${cmd.help.description}\n\nUsage :: ${settings.prefix}${cmd.help.usage}`;

    if (cmd.conf.aliases) {
      output += `\nAliases :: ${cmd.conf.aliases.join(', ')}`;
    }

    if (cmd.help.details) {
      output += `\nDetails :: ${cmd.help.details}`;
    }

    output += `\nPerm Level :: ${cmd.conf.permLevel}`;

    message.channel.send(output, { code: 'asciidoc' });
  } else {
    client.error(message.channel, 'Invalid Command!', `All valid commands can be found by using \`${settings.prefix}help\`!`);
  }
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['h', 'halp', 'commands', 'cmds'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'help',
  category: 'info',
  description: 'Displays all commands available for your permission level',
  usage: 'help <command>',
};
