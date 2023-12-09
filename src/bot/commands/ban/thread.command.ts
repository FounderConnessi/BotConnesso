import { Handler, IA, InjectDiscordClient, SubCommand } from "@discord-nestjs/core";
import {
  Client,
  CommandInteraction,
  EmbedBuilder,
  InteractionReplyOptions,
  roleMention,
  ThreadAutoArchiveDuration
} from "discord.js";
import { ThreadDto } from "src/bot/dto";
import { addDiscussionButton, getChannelAndThreadDiscussion } from "src/utils/utils";
import * as process from "process";
import { SlashCommandPipe } from "@discord-nestjs/common";
import { UtilsService } from "../../../utils/utils.service";

@SubCommand({ name: "thread", description: "Avvia la discussione per segnalare una persona" })
export class BanThreadCommand {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly utils: UtilsService
  ) {
  }

  @Handler()
  async onCommand(@IA(SlashCommandPipe) dto: ThreadDto, @IA() interaction: CommandInteraction): Promise<InteractionReplyOptions> {
    const { user } = interaction;
    const member = interaction.guild.members.cache.get(user.id);

    if (!member.roles.cache.some(role => role.id === process.env.BAN_ROLE_ID)) {
      return {
        content: '⠀\n' +
          '<a:2333verifyred:1063075026418544680> **ERRORE: INSTALLA LA BLACKLIST**\n' +
          'Per poter aprire una segnalazione su un giocatore e utilizzare le funzionalità\n' +
          'della blacklist di FounderConnessi, devi prima installarla sul tuo server.\n' +
          '\n' +
          '<a:7972discordoff:1063075118881964123>  Scarica il plugin dal sito oppure usa le API pubbliche\n' +
          '<a:7972discordoff:1063075118881964123> Attiva la blacklist nella Lobby oppure nel Proxy\n' +
          '<a:7972discordoff:1063075118881964123> Configura il plugin con il filtro e il nome del server\n' +
          '<a:7972discordoff:1063075118881964123> Attendi che un Amministratore ti dia il ruolo\n' +
          '⠀',
        ephemeral: true
      };
    }

    if (await this.utils.getUuid(dto.nickname) == undefined) {
      return {
        content: '⠀\n' +
          '<a:2333verifyred:1063075026418544680> **ERRORE: UTENTE NON PREMIUM**\n' +
          'Per poter segnalare un giocatore affinché venga bannato da FounderConnessi,\n' +
          'è necessario che disponga di un account premium di sua proprietà.\n' +
          '⠀',
        ephemeral: true
      };
    }

    let { channel, thread } = getChannelAndThreadDiscussion(dto.nickname, this.client);

    if (thread)
      return addDiscussionButton(this.client, dto.nickname, "Leggi la discussione", {
        content: "Esiste già un thread aperto per questo utente!",
        ephemeral: true
      });

    thread = await channel.threads.create({
      name: `Segnalazione su ${dto.nickname}`,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      reason: `Segnalazione su ${dto.nickname}`
    });
    thread.send({
      content: `Discuti la segnalazione ${roleMention(process.env.FC_ROLE_ID)}`
    });

    return addDiscussionButton(this.client, dto.nickname, "Partecipa alla discussione", {
      embeds: [
        new EmbedBuilder()
          .setTitle("Segnalazione aperta")
          .setAuthor({ name: user.username, iconURL: user.avatarURL() })
          .setDescription(`È stata avviata una segnalazione su **${dto.nickname}**\n`)
          .setColor(0xff7264)
          .setTimestamp()
          .setFooter({ text: "FounderConnessi", iconURL: "https://i.imgur.com/EayOzNt.png" })
      ]
    });
  }
}