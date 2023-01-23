import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, Payload, SubCommand, TransformedCommandExecutionContext, UsePipes } from '@discord-nestjs/core';
import { InteractionReplyOptions, EmbedBuilder, TextChannel, Colors, hyperlink } from 'discord.js';
import { ThreadDto } from 'src/bot/dto';

@UsePipes(TransformPipe)
@SubCommand({ name: 'poll-end', description: 'Termina la votazione per la blacklist' })
export class BanPollEndSubCommand implements DiscordTransformedCommand<ThreadDto> {

  async handler(@Payload() dto: ThreadDto, context: TransformedCommandExecutionContext): Promise<InteractionReplyOptions> {
    const client = context.interaction.client;
    const channel = client.channels.cache.get(process.env.CHANNEL_THREAD_ID) as TextChannel;
    const thread = channel.threads.cache.find(thread => thread.name === `Segnalazione su ${dto.nickname.toLowerCase()}`);

    if (thread == undefined) {
      return {
        content: 'Devi prima creare un thread di discussione.',
        ephemeral: true
      };
    }

    let message = (await thread.messages.fetchPinned()).last();

    if (message == undefined) {
      return {
        content: 'Devi prima aprire il sondaggio!',
        ephemeral: true
      };
    }
    
    await context.interaction.deferReply();

    message = await (message.fetch())
    const embed = new EmbedBuilder()
      .setTitle('Esito sondaggio')
      .setDescription(`La segnalazione si è conclusa con: `)
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      .setTimestamp();
    const votingMembers: string[] = message.guild.roles.resolve(process.env.VOTE_ROLE_ID).members.map((member) => member.id);
    const votes = { '🟢': 0, '🟡': 0, '🟠': 0, '🔴': 0 }

    for (const reaction of ['🟢', '🟡', '🟠', '🔴']) {
      let userList = await message.reactions.resolve(reaction).users.fetch();
      const votesUsername = userList.filter(user => votingMembers.includes(user.id)).map((user) => user.username);
      votes[reaction] = votesUsername.length;
      const removePromises = userList.filter(user => !votesUsername.includes(user.username)).map(async user =>
        await message.reactions.resolve(reaction).users.remove(user.id));
      await Promise.all(removePromises);
    }

    const blackListVotes = votes['🔴'] + votes['🟠'] + votes['🟡'];

    embed.addFields([
      { name: 'Contrari alla blacklist', value: `${votes['🟢']}`, inline: true },
      { name: 'Favorevoli alla blacklist', value: `${blackListVotes}`, inline: true }
    ]);


    if (votes['🟢'] > blackListVotes) {
      embed.setColor(Colors.Green)
    } else if (votes['🟢'] == blackListVotes) {
      embed.setColor(Colors.White)
    } else if (votes['🔴'] > (blackListVotes - votes['🔴'])) {
      embed.setColor(Colors.Red)
    } else if (votes['🟠'] > (blackListVotes - votes['🟠'])) {
      embed.setColor(Colors.Orange)
    } else {
      embed.setColor(Colors.Yellow)
    }

    await message.edit({
      embeds: [embed],
    });
    message.unpin(),
    thread.setArchived(true)

    await context.interaction.editReply({
      embeds:
        [
          new EmbedBuilder()
            .setTitle('Fine sondaggio')
            .setColor(0xff7264)
            .setDescription(`Si è concluso il sondaggio in ${hyperlink(`Segnalazione su ${dto.nickname}`, `https://discord.com/channels/${process.env.GUILD_ID}/${thread.id}`)}`)
            .setFields()
            .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
            .setTimestamp()
        ],
    });
  }
}