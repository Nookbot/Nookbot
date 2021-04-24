module.exports = (client) => {
  client.reactPrompt = async (message, question, opt) => {
    if (!opt) {
      const confirm = await message.channel.send(question);
      await confirm.react(client.emoji.checkMark);
      await confirm.react(client.emoji.redX);

      const filter = (reaction, user) => [client.emoji.checkMark, client.emoji.redX].includes(reaction.emoji.name)
              && user.id === message.author.id;

      let decision = false;
      await confirm.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
        .then((collected) => {
          const reaction = collected.first();

          if (reaction.emoji.name === client.emoji.checkMark) {
            decision = true;
          }
        })
        .catch(() => {
          console.log('React Prompt timed out.');
        });
      await confirm.delete();
      return decision;
    }
    let counter = 0x1F1E6;
    let body = question;
    opt.slice(0, 20).forEach((option) => {
      body += `\n${String.fromCodePoint(counter)} : \`${option}\``;
      counter += 1;
    });
    const confirm = await message.channel.send(body);
    counter = 0x1F1E6;
    const emojiList = [];
    await client.asyncForEach(opt.slice(0, 20), async () => {
      emojiList.push(String.fromCodePoint(counter));
      await confirm.react(String.fromCodePoint(counter));
      counter += 1;
    });
    const filter = (reaction, user) => emojiList.includes(reaction.emoji.name)
              && user.id === message.author.id;

    let decision = '';
    await confirm.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
      .then((collected) => {
        const reaction = collected.first();

        decision = opt[reaction.emoji.toString().codePointAt(0) - 0x1F1E6];
      })
      .catch(() => {
        console.log('React Prompt timed out.');
      });
    await confirm.delete();
    return decision;
  };
};
