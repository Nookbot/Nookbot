const Discord = require('discord.js');

module.exports = async (client, member) => {
    const time = Date.now();
    let accountAge = client.humanTimeBetween(time, member.user.createdTimestamp);
    
    // 172,800,000 ms is 48 hours.
    if (time - member.user.createdTimestamp < 172800000) {
        accountAge = `:warning: **NEW ACCOUNT** ${accountAge} :warning:`;
    }

    const embed = new Discord.RichEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setColor('#1de9b6')
    .setTimestamp()
    .setFooter(`ID: ${member.id}`)
    .setThumbnail(member.user.displayAvatarURL)
    .addField("**Member Joined**", `<@${member.id}>`, true)
    .addField("**Join Position**", member.guild.memberCount, true)
    .addField("**Account Age**", accountAge, true);

    client.channels.get(client.getSettings(member.guild).actionLog).send(embed);
};