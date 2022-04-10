const Discord = require('discord.js');
/**
 * 
 * @param {*} client 
 * @param {Discord.MessageComponentInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    const reactionRoleMenu = client.reactionRoleDB.get(interaction.message.id);

    // If there isn't a type, then this is not a reaction role message.
    if (!reactionRoleMenu) {
      return;
    }

    switch (reactionRoleMenu.type) {
      case 'remove': {
        // This reaction role menu is supposed to remove the specified role on a button press.
        if (interaction.member.roles.cache.has(interaction.customId)) {
          // Member has the role, remove and reply
          interaction.member.roles.remove(interaction.customId);
          interaction.reply({ content: `Removed the ${interaction.component.label} role!`, ephemeral: true });
        } else {
          // Member doesn't have the role, reply
          interaction.reply({ content: `You already do not have the ${interaction.component.label} role!`, ephemeral: true });
        }
        break;
      }
      case 'exclusive': {
        // Members can only have one of the roles in this menu.
        const removeRoles = interaction.message.components.flatMap(r => r.components.map(c => c.customId)).filter(f => (interaction.member.roles.cache.has(f)));

        // Remove all roles in this menu that aren't the one they clicked
        if (removeRoles.length !== 0) {
          await interaction.member.roles.remove(removeRoles);
        }
        
        // If they clicked Remove, reply they were removed or if they didn't have any roles from this menu.
        if (interaction.customId === 'remove') {
          if (removeRoles.length === 0) {
            interaction.reply({ content: 'You did not have any roles from this menu to remove!', ephemeral: true });
          } else {
            interaction.reply({ content: 'Removed all roles!', ephemeral: true });
          }
        } else if (!removeRoles.includes(interaction.customId)) {
          // If they clicked to add a role they didn't have, add it and reply.
          interaction.member.roles.add(interaction.customId);
          interaction.reply({ content: `Gave the ${interaction.component.label} role!`, ephemeral: true });
        } else {
          // Else, they clicked a role they already had, so say it was removed.
          interaction.reply({ content: `Removed the ${interaction.component.label} role!`, ephemeral: true });
        }
        break;
      }
      case 'multiple': {
        // Members can have any number of the roles in this menu.
        if (interaction.customId === 'remove') {
          const allRoles = interaction.message.components.flatMap(r => r.components.map(c => c.customId)).filter(f => (interaction.member.roles.cache.has(f)));
          if (allRoles.length === 0) {
            interaction.reply({ content: 'You did not have any roles from this menu to remove!', ephemeral: true });
          } else {
            interaction.member.roles.remove(allRoles);
            interaction.reply({ content: 'Removed all roles!', ephemeral: true });
          }
        } else if (!interaction.member.roles.cache.has(interaction.customId)) {
          interaction.member.roles.add(interaction.customId);
          interaction.reply({ content: `Gave the ${interaction.component.label} role!`, ephemeral: true });
        } else {
          interaction.member.roles.remove(interaction.customId);
          interaction.reply({ content: `Removed the ${interaction.component.label} role!`, ephemeral: true });
        }
        break;
      }
      case 'restricted': {
        // Members must be in the server for a certain amount of time before they can recieve roles from this menu.
        if (interaction.member.roles.cache.has(interaction.customId)) {
          // Already have it, reply
          interaction.reply({ content: 'You already have this role!', ephemeral: true });
        } else if ((Date.now() - interaction.member.joinedTimestamp) > reactionRoleMenu.time) {
          // Don't have the role, add it and reply
          interaction.member.roles.add(interaction.customId);
          interaction.reply({ content: `Gave the ${interaction.component.label} role!`, ephemeral: true });
        } else {
          // Not eligible
          interaction.reply({ content: `This is an age restricted role. You must wait until <t:${Math.floor((interaction.member.joinedTimestamp + reactionRoleMenu.time) / 1000)}> before you can get this role!`, ephemeral: true });
        }
        break;
      }
      default:
        break;
    }
  }

  if (!interaction.isCommand()) {
    return;
  }

  if (!interaction.member) {
    await interaction.guild.members.fetch(interaction.user.id);
  }

  await client.commands.get(interaction.commandName).run(client, interaction);
};
