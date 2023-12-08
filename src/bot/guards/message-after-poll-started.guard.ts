import { InjectDiscordClient } from "@discord-nestjs/core";
import { Client, ThreadChannel } from "discord.js";
import { CanActivate, ExecutionContext } from "@nestjs/common";

export class MessageAfterPollStarted implements CanActivate {

    constructor(
        @InjectDiscordClient()
        private readonly client: Client
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const [message] = context.getArgs();
        return message.channel.isThread() && (message.channel as ThreadChannel).locked && message.channel.name.includes("Segnalazione su ") && this.client.user != message.author;
    }
}