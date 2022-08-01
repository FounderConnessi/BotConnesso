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
    const thread = channel.threads.cache.find(thread => thread.name === 'Segnalazione su ' + dto.nickname);

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

    message = await (message.fetch())
    const embed = new EmbedBuilder()
      .setTitle('Esito sondaggio')
      .setDescription("La segnalazione di " + dto.nickname + " si è conclusa con: ")
    const votingMembers: string[] = message.guild.roles.resolve(process.env.VOTE_ROLE_ID).members.map((member) => member.id);

    let upVotes: string[]
    await message.reactions.resolve('👍').users.fetch().then(userList => {
      upVotes = userList.filter(user => votingMembers.includes(user.id)).map((user) => user.username);
      embed.addFields({ name: 'A favore', value: (upVotes.length).toString(), inline: true });
    });

    let downVotes: string[];
    await message.reactions.resolve('👎').users.fetch().then(userList => {
      downVotes = userList.filter(user => votingMembers.includes(user.id)).map((user) => user.username);
      embed.addFields({ name: 'Contro', value: (downVotes.length).toString(), inline: true });
    });

    if (downVotes.length > upVotes.length) {
      embed.setColor(Colors.Green)
    } else if (downVotes.length == upVotes.length) {
      embed.setColor(Colors.Orange)
    } else {
      embed.setColor(Colors.Red)
    }

    if (downVotes.length == 0) {
      downVotes.push('Nessuno');
    }

    if (upVotes.length == 0) {
      upVotes.push('Nessuno');
    }

    embed
      .addFields({ name: '\u200B', value: '\u200B' }, { name: 'Votanti', value: upVotes.join(','), inline: true }, { name: 'Votanti', value: downVotes.join(','), inline: true })
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      .setTimestamp();

    Promise.all([
      message.edit({
        embeds: [embed],
      }),
      message.unpin(),
      message.reactions.removeAll(),
    ]).then(() => {
      thread.setArchived(true);
    });

    return {
      embeds:
        [
          new EmbedBuilder()
            .setTitle('Fine sondaggio')
            .setColor(0xff7264)
            .setDescription("Si è concluso il sondaggio in " + hyperlink('Segnalazione su ' + dto.nickname, "https://discord.com/channels/"+ process.env.GUILD_ID +"/"+ thread.id))
            .setFields()
            .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
            .setTimestamp()
        ]
    };
  }
}