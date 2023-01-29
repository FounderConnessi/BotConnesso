import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, InjectDiscordClient, Payload, SubCommand, TransformedCommandExecutionContext, UsePipes } from '@discord-nestjs/core';
import { Client, EmbedBuilder, InteractionReplyOptions, roleMention, ThreadAutoArchiveDuration } from 'discord.js';
import { ThreadDto } from 'src/bot/dto';
import { addDiscussionButton, getChannelAndThreadDiscussion } from 'src/utils/utils';

@UsePipes(TransformPipe)
@SubCommand({ name: 'thread', description: 'Avvia la discussione per segnalare una persona' })
export class BanThreadCommand implements DiscordTransformedCommand<ThreadDto> {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) { }

  async handler(@Payload() dto: ThreadDto, context: TransformedCommandExecutionContext): Promise<InteractionReplyOptions> {
    let { channel, thread } = getChannelAndThreadDiscussion(dto.nickname, this.client);

    if (thread)
      return addDiscussionButton(this.client, dto.nickname, "Leggi la discussione", {
        content: "Esiste già un thread aperto per questo utente!",
        ephemeral: true
      });

    thread = await channel.threads.create({
      name: `Segnalazione su ${dto.nickname.toLowerCase()}`,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      reason: `Segnalazione su ${dto.nickname}`,
    });
    thread.send({
      content: `Discuti la segnalazione ${roleMention(process.env.FC_ROLE_ID)}`
    });

    const user = context.interaction.user;
    return addDiscussionButton(this.client, dto.nickname, "Partecipa alla discussione", {
      embeds: [
        new EmbedBuilder()
          .setTitle("Segnalazione aperta")
          .setAuthor({ name: user.username, iconURL: user.avatarURL() })
          .setDescription(`E' stata avviata una segnalazione su **${dto.nickname}**\n`)
          .setColor(0xff7264)
          .setTimestamp()
          .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      ]
    });
  }
}