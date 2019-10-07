const Discord = require('discord.js');

module.exports = async (client, member) => {
    //const mem = await client.fetchMember(member.id);
    
    const totalSeconds = (Date.now() - member.createdTimestamp) / 1000;
    
    // Math for days, hours, and minutes
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds / 3600) % 24);
    const minutes = Math.floor((totalSeconds / 60) % 60);

    // If something = 1 don't make it plural
    const daysP = (days === 1) ? 'day' : 'days';
    const hoursP = (hours === 1) ? 'hour' : 'hours';
    const minutesP = (minutes === 1) ? 'minute' : 'minutes';

    // Set uptime
    const accountAge = `${days} ${daysP}, ${hours} ${hoursP}, and ${minutes} ${minutesP}`;

    const embed = new Discord.RichEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setColor('#23d160')
    .setTimestamp()
    .setFooter(`ID: ${member.id}`)
    .setThumbnail(member.user.displayAvatarURL)
    .addField("**Member Joined**", `<@${member.id}>`, true)
    .addField("**Join Position**", `${member.guild.memberCount}`, true)
    .addField("**Account Age**", `${accountAge}`);

    client.channels.get(client.getSettings(member.guild).actionLog).send(embed);
};