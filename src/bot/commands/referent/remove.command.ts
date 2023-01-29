
import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand, InjectDiscordClient, Payload, SubCommand, UsePipes } from '@discord-nestjs/core';
import { InteractionReplyOptions, Client } from 'discord.js';
import { ReferentDto } from 'src/bot/dto/referent.dto';
import { FoundersService } from 'src/founders/founders.service';

@UsePipes(TransformPipe)
@SubCommand({ name: 'remove', description: 'Rimuovi un referente' })
export class RemoveReferentCommand implements DiscordTransformedCommand<ReferentDto> {

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly founders: FoundersService
  ) { }

  async handler(@Payload() dto: ReferentDto): Promise<InteractionReplyOptions> {
    const user = await this.client.users.fetch(dto.id);
    const message = {
      ephemeral: true
    };
    const guild = this.client.guilds.cache.get(process.env.GUILD_ID);
    const member = guild.members.cache.get(user.id);
    const role = guild.roles.cache.get(process.env.VOTE_ROLE_ID);

    if (!await this.founders.isReferent(user.id)) {
      member.roles.remove(role);
      return {
        content: `Il membro **${user.username}** non è un referente!`,
        ...message
      }
    }

    if (await this.founders.exists(user.id))
      await this.founders.setReferent(user.id, false);

    member.roles.remove(role);

    return {
      content: `Hai rimosso **${user.username}** dai referenti!`,
      ...message
    };
  }
}