import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GatewayIntentBits, Partials } from 'discord.js'
import { BanModule } from './ban/ban.module';
import { BotModule } from './bot/bot.module';
import { FoundersModule } from './founders/founders.module';
import { PrismaModule } from './prisma/prisma.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    PrismaModule,
    UtilsModule,
    BotModule,
    BanModule,
    FoundersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),  
    ScheduleModule.forRoot(),  
    DiscordModule.forRootAsync({
      useFactory: () => ({
        token: process.env.DISCORD_TOKEN,
        discordClientOptions: {
          intents: [ 
            GatewayIntentBits.Guilds, 
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
          ],
          partials:[
            Partials.Message,
            Partials.Channel,
            Partials.Reaction          
          ]
        },
        registerCommandOptions: [
          {
            forGuild: process.env.GUILD_ID,
            removeCommandsBefore: true,
          },
        ],
        allowGuilds: [process.env.GUILD_ID]
      }),
    }),
  ],
})
export class AppModule {}
