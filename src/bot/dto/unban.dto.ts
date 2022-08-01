import { Param } from '@discord-nestjs/core';

export class UnBanDto {
  @Param({
    name: 'nickname',
    description: 'Nickname di gioco',
    required: true,
  })
  nickname: string;
}