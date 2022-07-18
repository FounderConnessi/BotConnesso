import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';

import { BotGateway } from './bot.gateway';

@Module({
  imports: [
    DiscordModule.forFeature(),
    UtilsModule
  ],
  providers: [BotGateway],
})
export class BotModule {}