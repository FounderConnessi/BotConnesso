import { Command, UseGroup } from '@discord-nestjs/core';
import { BanPollEndSubCommand } from './sub-commands/ban/poll/poll-end-sub-command';
import { BanPollStartSubCommand } from './sub-commands/ban/poll/poll-start-sub-command';
import { BanUserSubCommand } from './sub-commands/ban/user-sub-command';
import { UnbanSubCommand } from './sub-commands/unban/unban-sub-command';

@Command({
  name: 'fca',
  description: 'Comandi del BOT Connesso',
  include: [
    UseGroup(
      { name: 'ban', description: 'Sotto comandi' },
      BanUserSubCommand,
      BanPollStartSubCommand,
      BanPollEndSubCommand
    ),
    UnbanSubCommand,
  ],
})
export class FounderConnessiAdminCommand {}