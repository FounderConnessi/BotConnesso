import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, InjectDiscordClient, Payload, SubCommand, UsePipes } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { InteractionReplyOptions, EmbedBuilder, TextChannel, Client } from 'discord.js';
import { BanDto } from 'src/bot/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

@UsePipes(TransformPipe)
@SubCommand({ name: 'user', description: 'Inserisci un utente nella blacklist' })
export class BanUserSubCommand implements DiscordTransformedCommand<BanDto> {

  private readonly logger = new Logger(BanUserSubCommand.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) { }

  async handler(@Payload() dto: BanDto): Promise<InteractionReplyOptions> {
    const uuid = await this.utils.getUuid(dto.nickname);
    const ban = await this.prisma.ban.findFirst({
      where: {
        OR: [
          { nickname: dto.nickname },
          { uuid: uuid },
        ],
      },
    });

    if (!ban) {
      await this.prisma.ban.create({
        data: {
          nickname: dto.nickname,
          uuid: uuid,
          reason: dto.reason
        }
      }).catch(error => {
        this.logger.error(error);
        return {
          content: "Errore, contatta l'amministratore!",
          ephemeral: true
        }
      });
    }

    if (ban.valid) {
      return {
        content: "Questo utente risulta già bannato!",
        ephemeral: true
      }
    }

    await this.prisma.ban.update({
      where: {
        nickname: ban.nickname,
      },
      data: {
        nickname: dto.nickname,
        uuid: uuid,
        reason: dto.reason,
        valid: true
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
      .setDescription("Dopo la votazione è stato deciso di aggiungere alla blacklist: ")
      .setColor(0xff7264)
      .addFields([
        { name: 'Nickname', value: dto.nickname, inline: true },
        { name: 'UUID', value: uuid, inline: true },
        { name: 'Motivo', value: dto.reason }
      ])
      .setTimestamp()
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' });
    const banListchannel = this.client.channels.cache.get(process.env.CHANNEL_BANLIST_ID) as TextChannel;
    const threadChannel = this.client.channels.cache.get(process.env.CHANNEL_THREAD_ID) as TextChannel;
    const thread = threadChannel.threads.cache.find(x => x.name === 'Segnalazione su ' + dto.nickname);
    const message = {
      embeds: [embed],
    }
    if (thread) {
      message.embeds[0].setDescription(message.embeds[0].data.description + "\nLeggi la discussione: <#" + thread.id + ">");
    }
    await banListchannel.send(message);
    embed.setDescription("Hai bannato il seguente utente:");
    return {
      embeds: [embed],
      ephemeral: true
    };
  }
}