/* eslint-disable consistent-return */
// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, [flag, key, ...value], level) => {
  const settings = client.getSettings(message.guild);
  const defaults = client.settings.get('default');
  const overrides = client.settings.get(message.guild.id);

  if (!client.settings.has(message.guild.id)) {
    client.settings.set(message.guild.id, {});
  }

  switch (flag) {
    case 'edit': {
      if (!key) {
        return client.error(message.channel, 'No Key Specified!', 'Please specify a key to edit!');
      }

      if (!defaults[key]) {
        return client.error(message.channel, 'Invalid Key!', 'This key does not exist in the settings!');
      }

      const joinedValue = value.join(' ');
      if (joinedValue.length < 1) {
        return client.error(message.channel, 'Invalid Value!', 'Please specify a new value!');
      }

      if (joinedValue === settings[key]) {
        return client.error(message.channel, 'Value Already Exists!', 'This setting already has that value!');
      }

      client.settings.set(message.guild.id, joinedValue, key);
      client.success(message.channel, 'Success!', `**${key}** successfully edited to \`${joinedValue}\`!`);
      break;
    }
    case 'del': case 'delete': {
      if (!key) {
        return client.error(message.channel, 'No Key Specified!', 'Please specify a key to reset!');
      }

      if (!defaults[key]) {
        return client.error(message.channel, 'Invalid Key!', 'This key does not exist in the settings!');
      }

      if (!overrides[key]) {
        return client.error(message.channel, 'Setting Already Set to Default!', 'This key does not have an override and is already using defaults!');
      }

      const msgReset = await message.channel.send(`Are you sure you want to reset **${key}** to its deafult configuration?`);
      await msgReset.react(client.emoji.checkMark);
      await msgReset.react(client.emoji.redX);

      // eslint-disable-next-line max-len
      const filter = (reaction, user) => [client.emoji.checkMark, client.emoji.redX].includes(reaction.emoji.name)
          && user.id === message.author.id;

      msgReset.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
        .then((collected) => {
          const reaction = collected.first();

          if (reaction.emoji.name === client.emoji.checkMark) {
            client.settings.delete(message.guild.id, key);
            client.success(message.channel, 'Success!', `**${key}** was successfully reset to default!`);
          } else {
            message.reply(`Alright then, **${key}** still remains as \`${settings[key]}\`!`);
          }
        })
        .catch(() => {
          console.log('After a minute, a configuration setting was not changed.');
          client.error(message.channel, 'Time Expired!', "So... I guess we're not changing the configuration settings today. Time's up.");
        });
      break;
    }
    case 'view': {
      const currentSettings = [];
      Object.entries(settings).forEach(([k, val]) => {
        currentSettings.push(`${k}${' '.repeat(20 - k.length)}: ${val}`);
      });
      message.channel.send(`**Current Server Configurations**:\n\`\`\`${currentSettings.join('\n')}\`\`\``);
      break;
    }
    default:
      client.error(message.channel, 'Invalid Subcommand!', `Remember to use subcommands when using this command! For example: \`edit\`, \`del\`, or \`view\`! For further details, use \`${client.getSettings(message.guild).prefix}help set\`!`);
      break;
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['setting', 'settings'],
  permLevel: 'Bot Owner',
  args: 1,
};

module.exports.help = {
  name: 'set',
  category: 'system',
  description: 'Controls configuration settings',
  usage: 'set <edit|del|view> <key> <value>',
  details: '<edit|del|view> => Whether to edit a setting, delete a setting, or view all settings.\n<key> => The key you wish to change\n<value> => The value you wish to change',
};
