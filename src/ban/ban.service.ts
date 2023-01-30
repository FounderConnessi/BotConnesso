import { Injectable, Logger } from "@nestjs/common";
import { Gravity } from "@prisma/client";
import { gravityToStr } from "src/bot/definitions/gravity";
import { BanDto, UnBanDto } from "src/bot/dto";
import { PrismaService } from "src/prisma/prisma.service";
import { UtilsService } from "src/utils/utils.service";

@Injectable()
export class BanService {
  
  private readonly logger = new Logger(BanService.name);

  constructor(private readonly prisma: PrismaService, private readonly utils: UtilsService) { }

  async getBannedUsers() {
    return await this.prisma.ban.findMany({
      where: {
        endDate: null
      },
      select: {
        startDate: true,
        nickname: true,
        gravity: true,
      },
      orderBy: {
        startDate: "desc"
      }
    });
  }

  async banUser(dto: BanDto): Promise<{ completed: boolean; error: boolean; data: any}>  {
    let error = false;
    const uuid = await this.utils.getUuid(dto.nickname);
    let ban = await this.prisma.ban.findFirst({
      where: {
        OR: [
          {
            nickname: {
              equals: dto.nickname,
              mode: 'insensitive'
            }
          },
          {
            uuid
          }
        ],
      },
    }).catch( e => {
      this.logger.error(e);
      error = true;
    });

    if (!ban) {
      ban = await this.prisma.ban.create({
        data: {
          nickname: dto.nickname,
          uuid: uuid,
          gravity: gravityToStr(dto.gravity) as Gravity,
          reason: dto.reason
        }
      }).catch( e => {
        this.logger.error(e);
        error = true;
      });
      return { completed: true, error, data: ban};
    }
    if (!ban.endDate) {
      return { completed: false, error, data: ban};
    }
    await this.prisma.ban.update({
      where: {
        uuid
      },
      data: {
        nickname: dto.nickname,
        uuid: uuid,
        reason: dto.reason,
        gravity: gravityToStr(dto.gravity) as Gravity,
        startDate: new Date(),
        endDate: null,
      }
    }).catch( e => {
      this.logger.error(e);
      error = true;
    });
    return { completed: true, error, data: ban};
  }

  async unBanUser(dto: UnBanDto): Promise<{ completed: boolean; error: boolean; data: any}> {
    const ban = await this.prisma.ban.findFirst({
      where: {
        nickname: {
          equals: dto.nickname,
          mode: 'insensitive'
        }
      }
    });
    let error = false;

    if (!ban || ban.endDate != null)
      return { completed: false, error, data: ban};

    await this.prisma.ban.update({
      where: dto,
      data: {
        endDate: new Date()
      }
    }).catch( e => {
      this.logger.error(e);
      error = true;
    });

    return { completed: true, error, data: ban};
  }
}