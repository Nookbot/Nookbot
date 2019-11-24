/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  const command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));

  if (!command) {
    return client.error(message.channel, 'Invalid Command!', "That's not a valid command!");
  }

  const props = require(`../../commands/${command.help.category}/${command.help.name}`);

  delete require.cache[require.resolve(`../../commands/${command.help.category}/${command.help.name}.js`)];
  client.commands.set(command.help.name, props);

  console.log(`${command.help.name} command was reloaded!`);
  return client.success(message.channel, 'Success!', `Successfully reloaded command \`${command.help.name}\`!`);
};

module.exports.conf = {
  guildOnly: false,
  aliases: [],
  permLevel: 'Bot Owner',
  args: 1,
};

module.exports.help = {
  name: 'reload',
  category: 'system',
  description: 'Deletes the cache and reloads the specified command',
  usage: 'reload <command name>',
  details: '<command name> => Any valid command name',
};
