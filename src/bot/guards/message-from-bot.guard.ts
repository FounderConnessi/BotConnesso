import { DiscordGuard, InjectDiscordClient } from '@discord-nestjs/core';
import { Client, Message } from 'discord.js';

export class MessageFromBotGuard implements DiscordGuard {

  constructor(
    @InjectDiscordClient()
    private readonly client: Client
  ){}

  canActive(event: 'messageCreate', [message]: [Message]): boolean {
    return this.client.user == message.author;
  }
}