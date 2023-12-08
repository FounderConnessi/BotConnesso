import { Handler, IA, InjectDiscordClient, SubCommand } from "@discord-nestjs/core";
import { InteractionReplyOptions, EmbedBuilder, TextChannel, Client, Colors } from 'discord.js';
import { BanService } from 'src/ban/ban.service';
import { Gravity, translateGravity } from 'src/bot/definitions/gravity';
import { BanDto } from 'src/bot/dto';
import { addDiscussionButton } from 'src/utils/utils';
import { SlashCommandPipe } from "@discord-nestjs/common";

@SubCommand({ name: 'user', description: 'Inserisci un utente nella blacklist' })
export class BanUserCommand {

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly ban: BanService
  ) { }

  @Handler()
  async onCommand(@IA(SlashCommandPipe) dto: BanDto): Promise<InteractionReplyOptions> {
    const ban = await this.ban.banUser(dto);

    if (ban.error)
      return {
        content: "Errore, contatta l'amministratore!",
        ephemeral: true
      };
    if (!ban.completed)
      return {
        content: "Questo utente risulta già bannato!",
        ephemeral: true
      };

    const message = addDiscussionButton(this.client, dto.nickname, "Leggi la discussione", {
      embeds: [
        new EmbedBuilder()
          .setTitle("Ban Connesso")
          .setDescription(`Il giocatore **${dto.nickname}** è stato aggiunto alla blacklist con gravità **${translateGravity(dto.gravity)}**.`)
          .addFields([{ name: 'Motivo', value: dto.reason }])
          .setTimestamp()
          .setFooter({ text: 'FounderConnessi', iconURL: 'https://i.imgur.com/EayOzNt.png' })
      ],
    });
    const embed = message.embeds[0];

    switch (dto.gravity) {
      case Gravity.HIGH:
        embed.setColor(Colors.Red);
        break;
      case Gravity.MEDIUM:
        embed.setColor(Colors.Orange);
        break;
      case Gravity.LOW:
        embed.setColor(Colors.Yellow);
        break;
    }

    const banListChannel = this.client.channels.cache.get(process.env.CHANNEL_BANLIST_ID) as TextChannel;
    await banListChannel.send(message);

    embed.setDescription("Hai bannato il seguente utente:");
    return {
      ...message,
      ephemeral: true,
    };
  }
}