import { Param } from '@discord-nestjs/core';

export class ThreadDto {
  @Param({
    name: 'nickname',
    description: 'Nickname di gioco',
    required: true,
  })
  nickname: string;
}