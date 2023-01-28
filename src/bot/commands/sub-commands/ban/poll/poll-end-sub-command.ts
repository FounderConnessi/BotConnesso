import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, InjectDiscordClient, Payload, SubCommand, TransformedCommandExecutionContext, UsePipes } from '@discord-nestjs/core';
import { InteractionReplyOptions, EmbedBuilder, Colors, Client } from 'discord.js';
import { ThreadDto } from 'src/bot/dto';
import { addDiscussionButton, addPollButton, getChannelAndThreadDiscussion } from 'src/utils/utils';

@UsePipes(TransformPipe)
@SubCommand({ name: 'poll-end', description: 'Termina la votazione per la blacklist' })
export class BanPollEndSubCommand implements DiscordTransformedCommand<ThreadDto> {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) { }

  async handler(@Payload() dto: ThreadDto, context: TransformedCommandExecutionContext): Promise<InteractionReplyOptions> {
    const { thread } = getChannelAndThreadDiscussion(dto.nickname, this.client);
    
    if (!thread)
      return {
        content: 'Devi prima creare un thread di discussione.',
        ephemeral: true
      };

    let pollMessage = (await thread.messages.fetchPinned()).last();

    if (!pollMessage)
      return {
        content: 'Devi prima aprire il sondaggio!',
        ephemeral: true
      };

    await context.interaction.deferReply();

    pollMessage = await (pollMessage.fetch());

    const votingMembers: string[] = pollMessage.guild.roles.resolve(process.env.VOTE_ROLE_ID).members.map((member) => member.id);
    const votes = { '🟢': 0, '🟡': 0, '🟠': 0, '🔴': 0 }

    for (const reaction of ['🟢', '🟡', '🟠', '🔴']) {
      let userList = await pollMessage.reactions.resolve(reaction).users.fetch();
      const votesUsername = userList.filter(user => votingMembers.includes(user.id)).map((user) => user.username);
      votes[reaction] = votesUsername.length;
      const removePromises = userList.filter(user => !votesUsername.includes(user.username)).map(async user =>
        await pollMessage.reactions.resolve(reaction).users.remove(user.id));
      await Promise.all(removePromises);
    }

    const blackListVotes = votes['🔴'] + votes['🟠'] + votes['🟡'];

    const message = {
      embeds: [
        new EmbedBuilder()
          .setTitle('Esito sondaggio')
          .setDescription(`La segnalazione si è conclusa con: `)
          .addFields([
            { name: 'Contrari alla blacklist', value: `${votes['🟢']}`, inline: true },
            { name: 'Favorevoli alla blacklist', value: `${blackListVotes}`, inline: true }
          ])
          .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      ]
    }
    const embed = message.embeds[0];

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

    await pollMessage.edit(message);
    pollMessage.unpin();
    thread.setArchived(true);

    embed
      .setTitle('Fine sondaggio')
      .setDescription(`Si è concluso il sondaggio su **${dto.nickname}**`)
      .setFields()
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      .setTimestamp();

    await context.interaction.editReply(addPollButton(pollMessage.url, message));
  }
}