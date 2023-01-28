import { Once, InjectDiscordClient, On, UseGuards } from '@discord-nestjs/core'
import { Injectable, Logger } from '@nestjs/common';
import { Client, GuildChannel, Message, MessageReaction, User } from 'discord.js';
import { UtilsService } from 'src/utils/utils.service';
import { Cron } from '@nestjs/schedule';
import { MessageAfterPollStarted, MessageFromBotGuard, MessagePinnedOrThreadCreated, PollReaction } from './guards';
@Injectable()
export class BotGateway {

  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly utils: UtilsService
  ) { }

  @Once('ready')
  async onReady() {
    this.logger.log(
      `Logged in as ${this.client.user.tag}!`,
    );
  }

  /**
   * Elimina i messaggi di "messaggio fissato" e "thread creato" provenienti dal BOT.
   */
  @UseGuards(MessageFromBotGuard, MessagePinnedOrThreadCreated)
  @On('messageCreate')
  async onMessageCreate(message: Message): Promise<void> {
    message.delete();
  }

  /**
   * Elimina i messaggi inviati durante un sondaggio aperto.
   */
  @UseGuards(MessageAfterPollStarted)
  @On('messageCreate')
  async onMessageDuringPoll(message: Message): Promise<void> {
    message.delete();
  }

  /**
   * Gestisco le reazioni del sondaggio.
   */
  @UseGuards(PollReaction)
  @On('messageReactionAdd')
  async OnMessageReact(reaction: MessageReaction, user: User) {
    const isReferent = reaction.message.guild.members.cache.get(user.id).roles.cache.has(process.env.VOTE_ROLE_ID);
    if (!isReferent) {
      reaction.users.remove(user.id);
      return;
    }
    const message = reaction.partial ? await reaction.message.fetch() : reaction.message;

    const userReactions = (
      await Promise.all(
        message.reactions.cache.map(async (reactionElement) => {
          let users = reactionElement.users.cache;
          if (users.size == 1) {
            users = await reactionElement.users.fetch();
          }
          const keep = users.has(user.id) && reactionElement.emoji.name != reaction.emoji.name;
          return { reactionElement, keep };
        })
      )
    )
      .filter((data) => data.keep)
      .map((data) => data.reactionElement);

    for (const reaction of userReactions.values()) {
      reaction.users.remove(user.id);
    }
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
  @Cron('30 */5 * * * *')
  async updateChannels() {
    this.utils.getCounters().then(counters => {
      this.changeChannelName(process.env.CHANNEL_UC_ID, "Utenti Connessi: " + counters.userCount);
      this.changeChannelName(process.env.CHANNEL_SC_ID, "Server Connessi: " + counters.serverCount);
      this.changeChannelName(process.env.CHANNEL_FC_ID, "Founder Connessi: " + counters.founderCount);
    });
  }
}