import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, InjectDiscordClient, Payload, SubCommand, UsePipes } from '@discord-nestjs/core';
import { Client, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { PollDto } from 'src/bot/dto';
import { addDiscussionButton, addPollButton, getChannelAndThreadDiscussion } from 'src/utils/utils';

@UsePipes(TransformPipe)
@SubCommand({ name: 'poll-start', description: 'Avvia la votazione per la blacklist' })
export class BanPollStartSubCommand implements DiscordTransformedCommand<PollDto> {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) { }

  async handler(@Payload() dto: PollDto): Promise<InteractionReplyOptions> {
    const { thread } = getChannelAndThreadDiscussion(dto.nickname, this.client);

    if (!thread)
      return { 
        content: 'Devi prima creare un thread per discutere del ban',
        ephemeral: true
      };

    let pollMessage = (await thread.messages.fetchPinned()).last();

    if (pollMessage)
      return addPollButton(pollMessage.url, {
          content: "Esiste già un sondaggio aperto per questo utente!",
          ephemeral: true
      });

    await thread.send({
      embeds: [
        new EmbedBuilder()
        .setTitle('Ban Connesso')
        .setColor(0xff7264)
        .setDescription(`Sei a favore del ban di **${dto.nickname}**?\n\n**COME VOTARE:**\n🟢 Contrario alla blacklist\n🟡 Blacklist gravità bassa\n🟠 Blacklist gravità media\n🔴 Blacklist gravità alta`)
        .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      ]
    });

    const lastMessage = thread.lastMessage;

    Promise.all([
      lastMessage.react('🟢'),
      lastMessage.react('🟡'),
      lastMessage.react('🟠'),
      lastMessage.react('🔴'),
      lastMessage.pin('Sondaggio'),
      thread.setLocked(true),
    ]);

    return addPollButton(lastMessage.url, {
      embeds: [
        new EmbedBuilder()
        .setTitle('Inizio sondaggio')
        .setColor(0xff7264)
        .setDescription(`È stato avviato il sondaggio per la segnalazione su **${dto.nickname}**\nResterà aperto per 24h, ogni server esprime un voto.`)
        .setTimestamp()
        .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      ]
    });
  }
}