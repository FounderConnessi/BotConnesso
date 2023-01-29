import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BanModule } from 'src/ban/ban.module';
import { FoundersModule } from 'src/founders/founders.module';
import { UtilsModule } from 'src/utils/utils.module';

import { BotGateway } from './bot.gateway';
import { AdminCommand } from './commands/admin.command';
import { BaseCommand } from './commands/base.command';
import { BanListCommand } from './commands/ban/list.command';
import { BanPollEndCommand } from './commands/ban/poll/poll-end.command';
import { BanPollStartCommand } from './commands/ban/poll/poll-start.command';
import { BanThreadCommand } from './commands/ban/thread.command';
import { BanUserCommand } from './commands/ban/user.command';
import { UnbanUserCommand } from './commands/unban/unban.command';
import { AddReferentCommand } from './commands/referent/add.command';
import { RemoveReferentCommand } from './commands/referent/remove.command';
@Module({
  imports: [
    DiscordModule.forFeature(),
    UtilsModule,
    BanModule,
    FoundersModule
  ],
  providers: [
    BotGateway,
    AdminCommand,
    BaseCommand,
    UnbanUserCommand,
    BanUserCommand,
    BanThreadCommand,
    BanListCommand,
    BanPollStartCommand,
    BanPollEndCommand,
    AddReferentCommand,
    RemoveReferentCommand
  ],
})
export class BotModule {}