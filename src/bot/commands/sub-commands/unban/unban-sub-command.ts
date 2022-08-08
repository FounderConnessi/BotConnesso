import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, Payload, SubCommand, UsePipes } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { Colors, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { UnBanDto } from 'src/bot/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@UsePipes(TransformPipe)
@SubCommand({ name: 'unban', description: 'Rimuovi un utente dalla blacklist' })
export class UnbanSubCommand implements DiscordTransformedCommand<UnBanDto> {

  private readonly logger = new Logger(UnbanSubCommand.name);

  constructor(private readonly prisma: PrismaService) { }

  async handler(@Payload() dto: UnBanDto): Promise<InteractionReplyOptions> {
    const ban = await this.prisma.ban.findFirst({
      where: dto,
    });

    if (!ban || !ban.valid) {
      return {
        content: "Questo utente non risulta bannato!",
        ephemeral: true
      }
    }

    await this.prisma.ban.update({
      where: dto,
      data: {
        valid: false,
        endDate: new Date()
      }
    }).catch(error => {
      this.logger.error(error);
      return {
        content: "Errore, contatta l'amministratore!",
        ephemeral: true
      }
    });

    const embed = new EmbedBuilder()
      .setTitle("Ban Connesso")
      .setDescription("Utente sbannato!")
      .setColor(Colors.Green)
      .addFields([
        { name: 'Nickname', value: ban.nickname, inline: true },
        { name: 'UUID', value: ban.uuid, inline: true },
        { name: 'Motivo', value: ban.reason }
      ])
      .setTimestamp()
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' });

    return {
      embeds: [embed],
    };
  }
}