import { DiscordGuard } from '@discord-nestjs/core';
import { MessageReaction, ThreadChannel, User } from 'discord.js';

export class PollReaction implements DiscordGuard {

    async canActive(event: 'messageReactionAdd', [reaction, user]: [MessageReaction, User]): Promise<boolean> {
        const emoji = ['🟢', '🟡', '🟠', '🔴']
        const message = reaction.partial ? await reaction.message.fetch() : reaction.message;

        return reaction.client.user == message.author &&
            user != reaction.client.user &&
            reaction.message.channel instanceof ThreadChannel && 
            emoji.includes(reaction.emoji.name)
    }
}