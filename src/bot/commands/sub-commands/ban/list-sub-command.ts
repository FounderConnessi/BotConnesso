import { DiscordCommand, SubCommand } from '@discord-nestjs/core';
import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { PrismaService } from 'src/prisma/prisma.service';

@SubCommand({ name: 'list', description: 'Consulta la lista degli utenti nella blacklist' })
export class BanListSubCommand implements DiscordCommand {

  constructor(private readonly prisma: PrismaService) { }

  async handler(): Promise<InteractionReplyOptions> {
    const bans = await this.prisma.ban.findMany({
      where: {
        valid: true
      },
      select: {
        uuid: true,
        nickname: true,
        reason: true
      }
    });

    const embed = new EmbedBuilder()
      .setTitle('Ban Connesso')
      .setDescription("Lista degli utenti bannati:")
      .setColor(0xff7264)
      .setTimestamp()
      .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' });

    if (bans.length==0){
      embed.setDescription("Lista degli utenti bannati al momento vuota.")
    }else{
      bans.forEach(ban => {
        embed.addFields([
          { name: 'Nickname', value: ban.nickname, inline: true },
          { name: 'UUID', value: ban.uuid, inline: true }
        ]);
      });
    }

    return {
      embeds: [embed],
      ephemeral: true
    };
  }
}