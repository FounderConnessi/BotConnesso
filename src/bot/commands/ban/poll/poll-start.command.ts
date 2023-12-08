import { Handler, IA, InjectDiscordClient, SubCommand } from "@discord-nestjs/core";
import { Client, CommandInteraction, EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { PollDto } from 'src/bot/dto';
import { addPollButton, getChannelAndThreadDiscussion } from 'src/utils/utils';
import { SlashCommandPipe } from "@discord-nestjs/common";

@SubCommand({ name: 'poll-start', description: 'Avvia la votazione per la blacklist' })
export class BanPollStartCommand {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) { }

  @Handler()
  async onCommand(@IA(SlashCommandPipe) dto: PollDto, @IA() interaction: CommandInteraction): Promise<InteractionReplyOptions> {
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

    await interaction.deferReply();

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

    await interaction.editReply(addPollButton(lastMessage.url, {
      embeds: [
        new EmbedBuilder()
          .setTitle('Inizio sondaggio')
          .setColor(0xff7264)
          .setDescription(`È stato avviato il sondaggio per la segnalazione su **${dto.nickname}**.\nResterà aperto per 24h, ogni server esprime un voto.`)
          .setTimestamp()
          .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      ]
    }));
  }
}