import { Choice, Param, ParamType } from '@discord-nestjs/core';
import { Gravity } from '../definitions/gravity';

export class BanDto {
  @Param({
    name: 'nickname',
    description: 'Nickname di gioco',
    required: true,
  })
  nickname: string;

  @Choice(Gravity)
  @Param({ 
    name: 'gravità',
    description: 'Gravità del ban',
    type: ParamType.INTEGER,
    required: true
  })
  gravity: Gravity;

  @Param({
    name: 'motivo',
    description: 'Motivazione',
    required: true,
  })
  reason: string;
}