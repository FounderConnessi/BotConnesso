import { Handler, IA, SubCommand } from "@discord-nestjs/core";
import { Colors, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { BanService } from 'src/ban/ban.service';
import { UnBanDto } from 'src/bot/dto';
import { SlashCommandPipe } from "@discord-nestjs/common";

@SubCommand({ name: 'unban', description: 'Rimuovi un utente dalla blacklist' })
export class UnbanUserCommand {

  constructor(private readonly ban: BanService) { }

  @Handler()
  async onCommand(@IA(SlashCommandPipe) dto: UnBanDto): Promise<InteractionReplyOptions> {
    const ban = await this.ban.unBanUser(dto);

    if (ban.error)
      return {
        content: "Errore, contatta l'amministratore!",
        ephemeral: true
      };

    if (!ban.completed)
      return {
        content: "Questo utente non risulta bannato!",
        ephemeral: true
      };

    return {
      embeds: [
        new EmbedBuilder()
          .setTitle("Ban Connesso")
          .setDescription("Utente sbannato!")
          .setColor(Colors.Green)
          .addFields([
            { name: 'Nickname', value: ban.data.nickname, inline: true },
            { name: 'UUID', value: ban.data.uuid, inline: true },
            { name: 'Motivo', value: ban.data.reason }
          ])
          .setTimestamp()
          .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      ],
    };
  }
}