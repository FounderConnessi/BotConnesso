import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, Payload, SubCommand, UsePipes } from '@discord-nestjs/core';
import { Colors, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { BanService } from 'src/ban/ban.service';
import { UnBanDto } from 'src/bot/dto';

@UsePipes(TransformPipe)
@SubCommand({ name: 'unban', description: 'Rimuovi un utente dalla blacklist' })
export class UnbanUserCommand implements DiscordTransformedCommand<UnBanDto> {

  constructor(private readonly ban: BanService) { }

  async handler(@Payload() dto: UnBanDto): Promise<InteractionReplyOptions> {
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