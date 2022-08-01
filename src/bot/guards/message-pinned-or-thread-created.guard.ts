import { DiscordGuard } from '@discord-nestjs/core';
import { Message, MessageType } from 'discord.js';

export class MessagePinnedOrThreadCreated implements DiscordGuard {

  canActive(event: 'messageCreate', [message]: [Message]): boolean {
    return message.type === MessageType.ChannelPinnedMessage || message.type === MessageType.ThreadCreated;
  }
}