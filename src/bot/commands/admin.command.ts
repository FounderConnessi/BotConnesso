import { Command, UseGroup } from '@discord-nestjs/core';
import { BanPollEndCommand } from './ban/poll/poll-end.command';
import { BanPollStartCommand } from './ban/poll/poll-start.command';
import { BanUserCommand } from './ban/user.command';
import { AddReferentCommand } from './referent/add.command';
import { RemoveReferentCommand } from './referent/remove.command';
import { UnbanUserCommand } from './unban/unban.command';

@Command({
  name: 'fca',
  description: 'Comandi del BOT Connesso',
  include: [
    UseGroup(
      { name: 'ban', description: 'Sotto comandi' },
      BanUserCommand,
      BanPollStartCommand,
      BanPollEndCommand,

    ),
    UnbanUserCommand,
    UseGroup(
      { name: 'referent', description: 'Sotto comandi' },
      AddReferentCommand,
      RemoveReferentCommand
    ),
  ],
})
export class AdminCommand {}