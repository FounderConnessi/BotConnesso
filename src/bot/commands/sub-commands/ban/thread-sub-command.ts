import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, InjectDiscordClient, Payload, SubCommand, TransformedCommandExecutionContext, UsePipes } from '@discord-nestjs/core';
import { channelMention, Client, EmbedBuilder, InteractionReplyOptions, roleMention, TextChannel, ThreadAutoArchiveDuration } from 'discord.js';
import { ThreadDto } from 'src/bot/dto';

@UsePipes(TransformPipe)
@SubCommand({ name: 'thread', description: 'Avvia la discussione per segnalare una persona' })
export class BanThreadSubCommand implements DiscordTransformedCommand<ThreadDto> {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) { }
  async handler(@Payload() dto: ThreadDto, context: TransformedCommandExecutionContext): Promise<InteractionReplyOptions> {
    const channel = this.client.channels.cache.get(process.env.CHANNEL_THREAD_ID) as TextChannel;
    let thread = channel.threads.cache.find(x => x.name === 'Segnalazione su ' + dto.nickname);

    if (thread != undefined) {
      return {
        content: 'Esiste già un thread aperto per questo utente ' + channelMention(thread.id),
        ephemeral: true
      };
    }

    thread = await channel.threads.create({
      name: 'Segnalazione su ' + dto.nickname,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      reason: 'Segnalazione su ' + dto.nickname,
    });
    thread.send({
      content: roleMention(process.env.VOTE_ROLE_ID)
    });

    const user = context.interaction.user;
    const embed = new EmbedBuilder()
      .setTitle("Segnalazione aperta")
      .setAuthor({ name: user.username, iconURL: user.avatarURL() })
      .setDescription("E' stata avviata una segnalazione su " + dto.nickname + "\nPartecipa alla discussione nella stanza " + channelMention(thread.id))
      .setColor(0xff7264)
      .setTimestamp()
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' });

    return {
      embeds: [embed],
    };

  }
}