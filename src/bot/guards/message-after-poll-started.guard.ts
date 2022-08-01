import { DiscordGuard, InjectDiscordClient } from '@discord-nestjs/core';
import { Client, Message, ThreadChannel } from 'discord.js';

export class MessageAfterPollStarted implements DiscordGuard {

constructor(
        @InjectDiscordClient()
        private readonly client: Client
){}
  canActive(event: 'messageCreate', [message]: [Message]): boolean {
    return message.channel.isThread() && (message.channel as ThreadChannel).locked && message.channel.name.includes("Segnalazione su ") && this.client.user != message.author;
  }
}