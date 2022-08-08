import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, InjectDiscordClient, Payload, SubCommand, UsePipes } from '@discord-nestjs/core';
import { Client, EmbedBuilder, hyperlink, InteractionReplyOptions, TextChannel } from 'discord.js';
import { PollDto } from 'src/bot/dto';

@UsePipes(TransformPipe)
@SubCommand({ name: 'poll-start', description: 'Avvia la votazione per la blacklist' })
export class BanPollStartSubCommand implements DiscordTransformedCommand<PollDto> {

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) { }

  async handler(@Payload() dto: PollDto): Promise<InteractionReplyOptions> {
    const channel = this.client.channels.cache.get(process.env.CHANNEL_THREAD_ID) as TextChannel;
    const thread = channel.threads.cache.find(thread => thread.name === 'Segnalazione su ' + dto.nickname.toLowerCase());

    if (thread == undefined) {
      return { content: 'Devi prima creare un thread per discutere del ban' };
    }

    let message = (await thread.messages.fetchPinned()).last();


    if (message != undefined) {
      return {
        content: 'Esiste già un sondaggio per questo utente! ' + hyperlink('Segnalazione su ' + dto.nickname, "https://discord.com/channels/"+ process.env.GUILD_ID +"/"+ thread.id),
        ephemeral: true
      };
    }

    const embed = new EmbedBuilder()
      .setTitle('Ban Connesso')
      .setColor(0xff7264)
      .setDescription("Sei a favore del ban di " + dto.nickname + "?")
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' });

    await thread.send({
      embeds: [embed],
    });

    message = thread.lastMessage;

    Promise.all([
      message.react('🟢'),
      message.react('🟡'),
      message.react('🟠'),
      message.react('🔴'),
      message.pin('Sondaggio'),
      thread.setLocked(true),
    ]);

    embed
      .setTitle('Inizio sondaggio')
      .setColor(0xff7264)
      .setDescription("E' stato avviato il sondaggio in "+ hyperlink('Segnalazione su ' + dto.nickname, "https://discord.com/channels/"+ process.env.GUILD_ID +"/"+ thread.id)+ "\nResterà aperto per 24h, ogni server esprime un voto.")
      .setFields()
      .setTimestamp()
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' });

    return {
      embeds: [embed]
    };

  }
}