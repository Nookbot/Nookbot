const moment = require('moment-timezone');
const { version } = require('discord.js');

module.exports.run = async (client, message, args, level, Discord) => {
  const owner = await client.fetchOwner();

  // embed
  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL())
    .setColor('#4199c2')
    .setTimestamp()
    .setFooter('Nookbot', client.user.displayAvatarURL());

  switch (args[0]) {
    case 'bot': {
      if (level < 8) {
        return client.error(message.channel, 'Not Allowed!', 'You are not allowed to show bot information!');
      }

      const uptime = client.humanTimeBetween(client.uptime, 0);

      embed.setTitle('Bot Information')
        .setThumbnail(client.user.displayAvatarURL())
        .addField('Bot Name', client.user.username, true)
        .addField('Bot ID', client.user.id, true)
        .addField('Bot Owner', owner.tag, true)
        .addField('Bot Version', client.version, true)
        .addField('Online Users', client.users.cache.size, true)
        .addField('Server Count', client.guilds.cache.size, true)
        .addField('Discord.js Version', `v${version}`, true)
        .addField('Mem Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
        .addField('Node.js Version', `${process.version}`, true)
        .addField('Created On', moment(client.user.createdAt).tz('America/New_York').format('MMMM Do YYYY, h:mm:ss a z'), true)
        .addField('Uptime', uptime, true);

      return message.channel.send(embed);
    }
    case 'user': {
      // Setting the member to the mentioned user, if no mentioned user, falls back to author
      const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || client.searchMember(args.slice(1).join(' ')) || message.member;

      // Block everyone but mods or higher from using this command to show other users info.
      if (member !== message.member && level < 2) {
        return client.error(message.channel, 'Not Allowed!', 'You are not allowed to show user information on other users!');
      }

      const roles = member.roles.cache.filter((r) => r.id !== message.guild.id).map((r) => r.name).join(', ') || 'No Roles';
      const roleSize = member.roles.cache.filter((r) => r.id !== message.guild.id).size;

      let activity = member.presence.status;

      if (activity === 'online') {
        activity = `${client.emoji.online} Online`;
      } else if (activity === 'idle') {
        activity = `${client.emoji.idle} Idle`;
      } else if (activity === 'dnd') {
        activity = `${client.emoji.dnd} Do Not Disturb`;
      } else if (activity === 'offline') {
        activity = `${client.emoji.offline} Offline/Invisible`;
      }

      embed.setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setTitle(`${member.displayName}\'s Info`)
        .addField('ID', member.user.id, true)
        .addField('Nickname', member.displayName, true)
        .addField('Account Created', moment(member.user.createdAt).tz('America/New_York').format('MMMM Do YYYY, h:mm:ss a z'), true)
        .addField(`Joined *${message.guild.name}*`, moment(member.joinedAt).tz('America/New_York').format('MMMM Do YYYY, h:mm:ss a z'), true)
        .addField(`Roles (${roleSize})`, roles, true)
        .addField('Status', activity, true);

      return message.channel.send(embed);
    }
    case 'server':
      embed.setTitle('Server Information')
        .setTimestamp()
        .setThumbnail(message.guild.iconURL({ format: 'gif', dynamic: true }))
        .addField('Server Name', message.guild.name, true)
        .addField('Server ID', message.guild.id, true)
        .addField('Server Owner', `${message.guild.owner.user.tag} (${message.guild.owner.user.id})`, true)
        .addField('Created On', moment(message.guild.createdAt).tz('America/New_York').format('MMMM Do YYYY, h:mm:ss a z'), true)
        .addField('Member Count', message.guild.memberCount, true);

      return message.channel.send(embed);
    default:
      return client.error(message.channel, 'Invalid Subcommand!', `Remember to use subcommands when using this command! For example: \`bot\`, \`server\`, or \`user\`! For further details, use \`${client.getSettings(message.guild).prefix}help info\`!`);
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['i'],
  permLevel: 'User',
  args: 1,
};

module.exports.help = {
  name: 'info',
  category: 'info',
  description: 'Provides info of the specified source',
  usage: 'info <bot|user|server>',
  details: '<bot|user|server> => The source of info.',
};
