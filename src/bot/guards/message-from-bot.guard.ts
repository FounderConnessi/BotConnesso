import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import { CanActivate, ExecutionContext } from "@nestjs/common";

export class MessageFromBotGuard implements CanActivate{

  constructor(
    @InjectDiscordClient()
    private readonly client: Client
  ){}

  canActivate(context: ExecutionContext): boolean {
    const [message] = context.getArgs();
    return this.client.user == message.author;
  }
}