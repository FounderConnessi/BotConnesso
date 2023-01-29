import { Param, ParamType } from '@discord-nestjs/core';

export class ReferentDto {
  @Param({
    name: 'membro',
    description: 'Membro referente',
    required: true,
    type: ParamType.USER
  })
  id: string;
}