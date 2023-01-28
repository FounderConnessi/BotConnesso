import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BanModule } from 'src/ban/ban.module';
import { UtilsModule } from 'src/utils/utils.module';

import { BotGateway } from './bot.gateway';
import { FounderConnessiAdminCommand } from './commands/founder-connessi-admin.command';
import { FounderConnessiCommand } from './commands/founder-connessi.command';
import { BanListSubCommand } from './commands/sub-commands/ban/list-sub-command';
import { BanPollEndSubCommand } from './commands/sub-commands/ban/poll/poll-end-sub-command';
import { BanPollStartSubCommand } from './commands/sub-commands/ban/poll/poll-start-sub-command';
import { BanThreadSubCommand } from './commands/sub-commands/ban/thread-sub-command';
import { BanUserSubCommand } from './commands/sub-commands/ban/user-sub-command';
import { UnbanSubCommand } from './commands/sub-commands/unban/unban-sub-command';
@Module({
  imports: [
    DiscordModule.forFeature(),
    UtilsModule,
    BanModule
  ],
  providers: [
    BotGateway,
    FounderConnessiAdminCommand,
    FounderConnessiCommand,
    UnbanSubCommand,
    BanUserSubCommand,
    BanThreadSubCommand,
    BanListSubCommand,
    BanPollStartSubCommand,
    BanPollEndSubCommand
  ],
})
export class BotModule {}