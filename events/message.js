/* eslint-disable max-len */
/* eslint-disable consistent-return */
const Discord = require('discord.js');

const cooldowns = new Discord.Collection();

module.exports = async (client, message) => {
  // Ignore all bots
  if (message.author.bot) {
    return;
  }

  // Emoji finding and tracking
  const regex = /<a?:\w+:([\d]+)>/g;
  const msg = message.content;
  let regMatch;
  while ((regMatch = regex.exec(msg)) !== null) {
    // If the emoji ID is in our emojiDB, then increment its count
    if (client.emojiDB.has(regMatch[1])) {
      client.emojiDB.inc(regMatch[1]);
    }
  }

  if (message.guild && !message.member) {
    await message.guild.members.fetch(message.author);
  }

  // Anti Mention Spam
  if (message.mentions.members && message.mentions.members.size > 10) {
    // They mentioned more than 10 members, automute them for 10 mintues.
    if (message.member) {
      // Mute
      message.member.roles.add('495854925054607381', 'Mention Spam');
      // Delete Message
      message.delete();
      // Schedule unmute
      setTimeout(() => (message.member.roles.remove('495854925054607381', 'Unmuted after 10 mintues for Mention Spam')), 600000);
      // Notify mods so they may ban if it was a raider.
      message.guild.channels.cache.get(client.getSettings(message.guild).staffChat).send(`**Mass Mention Attempt!**
<@&495865346591293443> <@&494448231036747777>
The member **${message.author.tag}** just mentioned ${message.mentions.members.size} members and was automatically muted for 10 minutes!
They have been a member of the server for ${client.humanTimeBetween(Date.now(), message.member.joinedTimestamp)}.
If you believe this member is a mention spammer bot, please ban them with the command:
\`.ban ${message.author.id} Raid Mention Spammer\``);
    }
  }

  const settings = client.getSettings(message.guild);

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(settings.prefix) !== 0) {
    return;
  }

  const level = client.permLevel(message);

  // Our standard argument/command name definition.
  const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data and aliases from the client.commands Enmap
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
  const enabledCmds = client.enabledCmds.get(command) || client.enabledCmds.get(client.aliases.get(command));

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) {
    return;
  }

  if (enabledCmds.enabled === false) {
    if (level[1] < 2) {
      return client.error(message.channel, 'Command Disabled!', 'This command is currently disabled!');
    }
  }

  if (!message.guild && cmd.conf.guildOnly) {
    return client.error(message.channel, 'Command Not Available in DMs!', 'This command is unavailable in DMs. Please use it in a server!');
  }

  if (cmd.conf.blockedChannels && cmd.conf.blockedChannels.includes(message.channel.id)) {
    return client.error(message.channel, 'Command Not Available in this Channel!', 'You will have to use this command in the <#549858839994826753> channel!');
  }

  // eslint-disable-next-line prefer-destructuring
  message.author.permLevel = level[1];

  if (level[1] < client.levelCache[cmd.conf.permLevel]) {
    client.error(message.channel, 'Invalid Permissions!', `You do not currently have the proper permssions to run this command!\n**Current Level:** \`${level[0]}: Level ${level[1]}\`\n**Level Required:** \`${cmd.conf.permLevel}: Level ${client.levelCache[cmd.conf.permLevel]}\``);
    return console.log(`${message.author.tag} (${message.author.id}) tried to use cmd '${cmd.help.name}' without proper perms!`);
  }

  if (cmd.conf.args && (cmd.conf.args > args.length)) {
    return client.error(message.channel, 'Invalid Arguments!', `The proper usage for this command is \`${settings.prefix}${cmd.help.usage}\`! For more information, please see the help command by using \`${settings.prefix}help ${cmd.help.name}\`!`);
  }

  if (!cooldowns.has(cmd.help.name)) {
    cooldowns.set(cmd.help.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(cmd.help.name);
  const cooldownAmount = (cmd.conf.cooldown || 0) * 1000;

  if (timestamps.has(message.author.id)) {
    if (level[1] < 2) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        let timeLeft = (expirationTime - now) / 1000;
        let time = 'second(s)';
        if (cmd.conf.cooldown > 60) {
          timeLeft = (expirationTime - now) / 60000;
          time = 'minute(s)';
        }
        return client.error(message.channel, 'Woah There Bucko!', `Please wait **${timeLeft.toFixed(2)} more ${time}** before reusing the \`${cmd.help.name}\` command!`);
      }
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  // Run the command
  const guildUsed = message.guild ? `#${message.channel.name}` : 'DMs';

  console.log(`${message.author.tag} (${message.author.id}) ran cmd '${cmd.help.name}' in ${guildUsed}!`);
  cmd.run(client, message, args, level[1], Discord);
};
