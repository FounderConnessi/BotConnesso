
import { Handler, IA, InjectDiscordClient, SubCommand } from "@discord-nestjs/core";
import { InteractionReplyOptions, Client } from 'discord.js';
import { ReferentDto } from 'src/bot/dto/referent.dto';
import { FoundersService } from 'src/founders/founders.service';
import { SlashCommandPipe } from "@discord-nestjs/common";

@SubCommand({ name: 'add', description: 'Aggiungi un referente' })
export class AddReferentCommand {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly founders: FoundersService,
  ) { }

  @Handler()
  async handler(@IA(SlashCommandPipe) dto: ReferentDto): Promise<InteractionReplyOptions> {
    const user = await this.client.users.fetch(dto.id);
    const message = {
      ephemeral: true
    };
    const guild = this.client.guilds.cache.get(process.env.GUILD_ID);
    const member = guild.members.cache.get(user.id);
    const role = guild.roles.cache.get(process.env.VOTE_ROLE_ID);

    if (await this.founders.isReferent(user.id)) {
      await member.roles.add(role);
      return {
        content: `Il membro **${user.username}** è già referente!`,
        ...message
      }
    }
    if (await this.founders.exists(user.id))
      await this.founders.setReferent(user.id, true);
    else
      await this.founders.add({ id: user.id, username: user.username, isReferent: true });

    await member.roles.add(role);

    return {
      content: `Hai aggiunto correttamente **${user.username}** ai referenti!`,
      ...message
    };
  }
}