import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, InjectDiscordClient, Payload, SubCommand, UsePipes } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { Gravity } from '@prisma/client';
import { InteractionReplyOptions, EmbedBuilder, TextChannel, Client, hyperlink, Colors } from 'discord.js';
import { gravityToStr } from 'src/bot/definitions/gravity';
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
          { nickname: dto.nickname.toLowerCase() },
          { uuid: uuid },
        ],
      },
    });

    if (!ban) {
      await this.prisma.ban.create({
        data: {
          nickname: dto.nickname.toLowerCase(),
          uuid: uuid,
          gravity: gravityToStr(dto.gravity) as Gravity,
          reason: dto.reason
        }
      }).catch(error => {
        this.logger.error(error);
        return {
          content: "Errore, contatta l'amministratore!",
          ephemeral: true
        }
      });
    }else if (!ban.endDate) {
      return {
        content: "Questo utente risulta già bannato!",
        ephemeral: true
      }
    }else{
      await this.prisma.ban.update({
        where: {
          nickname: dto.nickname.toLowerCase(),
        },
        data: {
          nickname: dto.nickname.toLowerCase(),
          uuid: uuid,
          reason: dto.reason,
          gravity: gravityToStr(dto.gravity) as Gravity,
          startDate: new Date(),
          endDate: null,
        }
      }).catch(error => {
        this.logger.error(error);
        return {
          content: "Errore, contatta l'amministratore!",
          ephemeral: true
        }
      });
    }


    const embed = new EmbedBuilder()
      .setTitle("Ban Connesso")
      .setDescription("Dopo la votazione è stato deciso di aggiungere alla blacklist: ")
      .addFields([
        { name: 'Nickname', value: dto.nickname, inline: true },
        { name: 'UUID', value: uuid, inline: true },
        { name: 'Motivo', value: dto.reason }
      ])
      .setTimestamp()
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' });
    
    if (gravityToStr(dto.gravity) == Gravity.HIGH){
      embed.setColor(Colors.Red);
    }else if (gravityToStr(dto.gravity) == Gravity.MEDIUM){
      embed.setColor(Colors.Orange);
    }else{
      embed.setColor(Colors.Yellow);
    }

    const banListchannel = this.client.channels.cache.get(process.env.CHANNEL_BANLIST_ID) as TextChannel;
    const threadChannel = this.client.channels.cache.get(process.env.CHANNEL_THREAD_ID) as TextChannel;
    const thread = threadChannel.threads.cache.find(x => x.name === 'Segnalazione su ' + dto.nickname.toLowerCase());

    if (thread) {
      embed.addFields({
        name: ' ',
        value: `Leggi la discussione: ${hyperlink('Segnalazione su ' + dto.nickname, "https://discord.com/channels/" + process.env.GUILD_ID + "/" + thread.id)}`
      })
    }

    const message = {
      embeds: [embed],
    }

    await banListchannel.send(message);
    embed.setDescription("Hai bannato il seguente utente:");
    return {
      embeds: [embed],
      ephemeral: true
    };
  }
}