import { ThreadChannel } from 'discord.js';
import { CanActivate, ExecutionContext } from "@nestjs/common";
export class PollReaction implements CanActivate{
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const emoji = ['🟢', '🟡', '🟠', '🔴']
        const [reaction, user] = context.getArgs();
        const message = reaction.partial ? await reaction.message.fetch() : reaction.message;

        return reaction.client.user == message.author &&
          user != reaction.client.user &&
          reaction.message.channel instanceof ThreadChannel &&
          emoji.includes(reaction.emoji.name)
    }

}