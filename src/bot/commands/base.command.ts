import { Command, UseGroup } from '@discord-nestjs/core';
import { BanListCommand } from './ban/list.command';
import { BanThreadCommand } from './ban/thread.command';
@Command({
  name: 'fc',
  description: 'Comandi del BOT Connesso',
  include: [
    UseGroup(
      { name: 'ban', description: 'Sotto comandi' },
      BanThreadCommand,
      BanListCommand,
    ),
  ],
})
export class BaseCommand {}