import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { Injectable, Logger, UseGuards } from "@nestjs/common";
import {
  Client,
  GuildChannel,
  GuildMember,
  Message,
  MessageReaction,
  PartialGuildMember,
  TextChannel,
  User
} from "discord.js";
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

    const guild = await this.client.guilds.fetch(process.env.GUILD_ID);

    this.logger.log("Fetching members...");

    await guild.members.fetch();

    this.logger.log("Members fetched!");
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
  async onGuildMemberUpdate(oldMember : GuildMember, newMember: GuildMember) {
    const hadVoteRole = oldMember.roles.cache.has(process.env.VOTE_ROLE_ID);
    const hadBanRole = oldMember.roles.cache.has(process.env.BAN_ROLE_ID);
    const hasVoteRole = newMember.roles.cache.has(process.env.VOTE_ROLE_ID);
    const hasBanRole = newMember.roles.cache.has(process.env.BAN_ROLE_ID);

    if((hadBanRole !== hasBanRole && hasVoteRole) || hadVoteRole !== hasVoteRole) {
      const user = newMember.user;
      const userId = user.id;

      if (hasVoteRole) {
        const success = await this.founders.addReferent({
          id: userId,
          username: user.username,
          banRole: hasBanRole
        });
        if (success)
          this.logger.log(`Added ${user.username} to referents with banRole=${hasBanRole}`);
        else
          this.logger.warn(`Failed to add ${user.username} to referents with banRole=${hasBanRole}`);
      } else {
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
    this.founders.canVote(user.id).then(canVote => {
      if (!canVote)
        reaction.users.remove(user);
    });
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

  @Cron("0 8 * * 1", {
    timeZone: "Europe/Rome"
  })
  async sendWeeklyMeetUp() {
    const channel = this.client.channels.cache.get(process.env.CHANNEL_MEETUP_ID) as TextChannel;
    const days = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
    const hours = ["18:00", "18:30", "19:00", "21:00", "21:30"];

    const day = days[this.randomInt(days.length)];
    const hour = hours[this.randomInt(hours.length)];

    await channel.send("⠀\n" +
      "<:FounderConnessi:1063045748586975302> **MEET UP SETTIMANALE DEI FOUNDER!**\n" +
      "Come ogni settimana, è arrivato il momento di fissare l'incontro per\n" +
      "fare quattro chiacchiere, conoscerci meglio e, chissà, mettere le basi\n" +
      "per future nuove collaborazioni tra server. La data è casuale!\n" +
      "\n" +
      "Data: **" + day + " alle ore " + hour + "**\n" +
      "\n" +
      "Ti aspettiamo <:1666iconthereeroles:1063075024514330666> \n" +
      "⠀");
    await channel.lastMessage.react("📅");
  }

  private randomInt(max: number) {
    return Math.floor(Math.random() * max);
  }
}