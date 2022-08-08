import { DiscordGuard } from '@discord-nestjs/core';
import { MessageReaction, ThreadChannel, User } from 'discord.js';

export class PollReaction implements DiscordGuard {

    async canActive(event: 'messageReactionAdd', [reaction, user]: [MessageReaction, User]): Promise<boolean> {
        let message = reaction.message;
        
        if (reaction.partial)
            message = await reaction.message.fetch();
        
        return reaction.client.user == message.author &&
            user != reaction.client.user &&
            reaction.message.channel instanceof ThreadChannel && 
            (
                reaction.emoji.name == '🟢' || 
                reaction.emoji.name == '🟡' || 
                reaction.emoji.name == '🟠' || 
                reaction.emoji.name == '🔴'
            )
    }
}