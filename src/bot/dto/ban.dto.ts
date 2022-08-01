import { Param } from '@discord-nestjs/core';

export class BanDto {
  @Param({
    name: 'nickname',
    description: 'Nickname di gioco',
    required: true,
  })
  nickname: string;

  @Param({
    name: 'motivo',
    description: 'Motivazione',
    required: true,
  })
  reason: string;
}