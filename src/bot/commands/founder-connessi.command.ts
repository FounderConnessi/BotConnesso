import { Command, UseGroup } from '@discord-nestjs/core';
import { BanListSubCommand } from './sub-commands/ban/list-sub-command';
import { BanThreadSubCommand } from './sub-commands/ban/thread-sub-command';
@Command({
  name: 'fc',
  description: 'Comandi del BOT Connesso',
  include: [
    UseGroup(
      { name: 'ban', description: 'Sotto comandi' },
      BanThreadSubCommand,
      BanListSubCommand,
    ),
  ],
})
export class FounderConnessiCommand {}