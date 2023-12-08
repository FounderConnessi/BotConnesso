import { Handler, SubCommand } from "@discord-nestjs/core";
import { EmbedBuilder, InteractionReplyOptions } from "discord.js";

@SubCommand({ name: 'list', description: 'Consulta la lista degli utenti nella blacklist' })
export class BanListCommand {

  @Handler()
  async onCommand(): Promise<InteractionReplyOptions> {
    return {
      content: '⠀\n' +
          '<:FounderConnessi:1063045748586975302> **LISTA UTENTI BLACKLISTATI**\n' +
          'Scopri sul sito la lista dei giocatori blacklistati dai server di FounderConnessi,\n' +
          'il motivo della segnalazione e la gravità scelta dalla maggioranza dei founder. \n' +
          '⠀',
      ephemeral: true
    };
  }
}