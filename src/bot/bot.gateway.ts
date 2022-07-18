import { Once, InjectDiscordClient } from '@discord-nestjs/core'
import { Injectable, Logger } from '@nestjs/common';
import { Client, GuildChannel } from 'discord.js';
import { UtilsService } from 'src/utils/utils.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BotGateway {

  private readonly logger = new Logger(BotGateway.name);
  
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly utils: UtilsService 
  ) {
   
  }

  @Once('ready')
  async onReady() {
    this.logger.log(
      `Logged in as ${this.client.user.tag}!`,
    );   
  }

  @Once('shardDisconnect')
  async onDisconnect(){
    this.logger.log(
      `Disconnect as ${this.client.user.tag}!`,
    );   
  }

  changeChannelName(channelId : string, name: string) {
    const channel = this.client.channels.cache.get(channelId) as GuildChannel;
    channel.setName(name);
    this.logger.log('Channel name has been updated (' + name + ')');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateUtentiConnessi(){
    const utentiConnessi = await this.utils.getUtentiConnessi();
    this.changeChannelName(process.env.CHANNEL_ID, process.env.CHANNEL_NAME.replace('%players%', utentiConnessi.toString()));
  }
}