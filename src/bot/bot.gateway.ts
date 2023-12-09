import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { Injectable, Logger, UseGuards } from "@nestjs/common";
import { Client, GuildChannel, GuildMember, Message, MessageReaction, PartialGuildMember, User } from "discord.js";
import { UtilsService } from "src/utils/utils.service";
import { Cron } from "@nestjs/schedule";
import { MessageAfterPollStarted, MessageFromBotGuard, MessagePinnedOrThreadCreated, PollReaction } from "./guards";
import { FoundersService } from "src/founders/founders.service";
import * as process from "process";

@Injectable()
export class BotGateway {

  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly utils: UtilsService,
    private readonly founders: FoundersService
  ) {
  }

  @Once("ready")
  async onReady() {
    this.logger.log(
      `Logged in as ${this.client.user.tag}!`
    );
  }

  /**
   * Elimina i messaggi di "messaggio fissato" e "thread creato" provenienti dal BOT.
   */
  @UseGuards(MessageFromBotGuard, MessagePinnedOrThreadCreated)
  @On("messageCreate")
  async onMessageCreate(message: Message): Promise<void> {
    message.delete();
  }

  /**
   * Elimina i messaggi inviati durante un sondaggio aperto.
   */
  @UseGuards(MessageAfterPollStarted)
  @On("messageCreate")
  async onMessageDuringPoll(message: Message): Promise<void> {
    message.delete();
  }

  /**
   * Gestisco il cambio del ruolo di Referente.
   */
  @On("guildMemberUpdate")
  async onGuildMemberUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) {
    const roleIdToCheck = process.env.VOTE_ROLE_ID;
    const hasRoleAfter = newMember.roles.cache.has(roleIdToCheck);

    if (oldMember.roles.cache.has(roleIdToCheck) !== hasRoleAfter) {
      const user = newMember.user;
      const userId = user.id;

      if (hasRoleAfter){
        const success = await this.founders.addReferent({ id: userId, username: user.username });
        if (success)
          this.logger.log(`Added ${user.username} to referents`);
        else
          this.logger.warn(`Failed to add ${user.username} to referents`);
      }
      else{
        const success = await this.founders.removeReferent(userId);
        if (success)
          this.logger.log(`Removed ${user.username} from referents`);
        else
          this.logger.warn(`Failed to remove ${user.username} from referents`);
      }
    }
  }

  /**
   * Gestisco le reazioni del sondaggio.
   */
  @UseGuards(PollReaction)
  @On("messageReactionAdd")
  async OnMessageReact(reaction: MessageReaction, user: User) {
    this.founders.isReferent(user.id).then(
      isReferent => {
        if (!isReferent)
          reaction.users.remove(user.id);
      }
    );
  }

  /**
   * Motifica il nome di un canale dato il suo id e il nuovo nome.
   * @param channelId Identificato del canale
   * @param name nuovo nome del canale
   */
  changeChannelName(channelId: string, name: string) {
    const channel = this.client.channels.cache.get(channelId) as GuildChannel;
    channel.setName(name);
  }

  /**
   * Task di aggiornamento del contatore dei Server, Founder e Utenti Connessi.
   */
  @Cron("30 */5 * * * *")
  async updateChannels() {
    this.utils.getCounters().then(counters => {
      this.changeChannelName(process.env.CHANNEL_UC_ID, "Utenti Connessi: " + counters.userCount);
      this.changeChannelName(process.env.CHANNEL_SC_ID, "Server Connessi: " + counters.serverCount);
      this.changeChannelName(process.env.CHANNEL_FC_ID, "Founder Connessi: " + counters.founderCount);
    });
  }
}