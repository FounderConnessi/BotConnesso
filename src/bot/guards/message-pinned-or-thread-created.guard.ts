import { MessageType } from 'discord.js';
import { CanActivate, ExecutionContext } from "@nestjs/common";
export class MessagePinnedOrThreadCreated implements CanActivate {

  canActivate(context: ExecutionContext): boolean {
    const [message] = context.getArgs();
    return message.type === MessageType.ChannelPinnedMessage || message.type === MessageType.ThreadCreated;
  }
}