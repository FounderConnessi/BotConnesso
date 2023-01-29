import { DiscordCommand, SubCommand } from "@discord-nestjs/core";
import { EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { BanService } from "src/ban/ban.service";

@SubCommand({ name: 'list', description: 'Consulta la lista degli utenti nella blacklist' })
export class BanListCommand implements DiscordCommand {

  constructor(private readonly ban: BanService) { }

  async handler(): Promise<InteractionReplyOptions> {
    const bans = await this.ban.getBannedUsers();
    const message = {
      embeds: [
        new EmbedBuilder()
          .setTitle('Ban Connesso')
          .setDescription("Lista degli utenti bannati:")
          .setColor(0xff7264)
          .setTimestamp()
          .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      ],
      ephemeral: true
    };
    const embed = message.embeds[0];

    if (bans.length == 0)
      embed.setDescription("Lista degli utenti bannati al momento vuota.")
    else {
      const colorMap = {
        HIGH: '🔴',
        MEDIUM: '🟠',
        LOW: '🟡',
      };

      bans.forEach(ban => {
        const date = ban.startDate.toLocaleDateString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
        embed.addFields([
          { name: 'Data', value: `${date}`, inline: true },
          { name: 'Nickname', value: ban.nickname, inline: true },
          { name: 'Gravità', value: colorMap[ban.gravity], inline: true }
        ]);
      });
    }

    return message;
  }
}