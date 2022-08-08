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
    const thread = channel.threads.cache.find(thread => thread.name === 'Segnalazione su ' + dto.nickname.toLowerCase());

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
      .setDescription("La segnalazione su " + dto.nickname + " si è conclusa con: ")
    const votingMembers: string[] = message.guild.roles.resolve(process.env.VOTE_ROLE_ID).members.map((member) => member.id);

    let greenVotes: string[]
    await message.reactions.resolve('🟢').users.fetch().then(userList => {
      greenVotes = userList.filter(user => votingMembers.includes(user.id)).map((user) => user.username);
      userList.filter(user => !greenVotes.includes(user.username)).forEach(user=> message.reactions.resolve('🟢').users.remove(user.id));
    });
    let yellowVotes: string[];
    await message.reactions.resolve('🟡').users.fetch().then(userList => {
      yellowVotes = userList.filter(user => votingMembers.includes(user.id)).map((user) => user.username);
      userList.filter(user => !yellowVotes.includes(user.username)).forEach(user=> message.reactions.resolve('🟡').users.remove(user.id));
    });
    let orangeVotes: string[];
    await message.reactions.resolve('🟠').users.fetch().then(userList => {
      orangeVotes = userList.filter(user => votingMembers.includes(user.id)).map((user) => user.username);
      userList.filter(user => !orangeVotes.includes(user.username)).forEach(user=> message.reactions.resolve('🟠').users.remove(user.id));
    });
    let redVotes: string[];
    await message.reactions.resolve('🔴').users.fetch().then(userList => {
      redVotes = userList.filter(user => votingMembers.includes(user.id)).map((user) => user.username);
      userList.filter(user => !redVotes.includes(user.username)).forEach(user => message.reactions.resolve('🔴').users.remove(user.id));
    });

    const upVotes = new Set(yellowVotes.concat(orangeVotes).concat(redVotes));
    embed.addFields({ name: 'A favore', value: (upVotes.size).toString(), inline: true });
    embed.addFields({ name: 'Contro', value: (greenVotes.length).toString(), inline: true });
    

    if (greenVotes.length > upVotes.size) {
      embed.setColor(Colors.Green)
    } else if (greenVotes.length == upVotes.size) {
      embed.setColor(Colors.White)
    } else if (redVotes.length> upVotes.size-redVotes.length){
      embed.setColor(Colors.Red)
    } else if (orangeVotes.length> upVotes.size-orangeVotes.length){
      embed.setColor(Colors.Orange)
    } else{
      embed.setColor(Colors.Yellow)
    }

    embed
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      .setTimestamp();

    Promise.all([
      message.edit({
        embeds: [embed],
      }),
      message.unpin(),
    ]).then(() => {
      setTimeout((() => thread.setArchived(true)), 6000);
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