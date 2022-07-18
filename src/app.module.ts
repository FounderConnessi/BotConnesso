import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Intents } from 'discord.js'
import { BotModule } from './bot/bot.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    UtilsModule,
    BotModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),  
    ScheduleModule.forRoot(),  
    DiscordModule.forRootAsync({
      useFactory: () => ({
        token: process.env.DISCORD_TOKEN,
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS],
        },
        allowGuilds: [process.env.GUILD_ID],
      }),
    }),
  ],
})
export class AppModule {}
