import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddFounderDto } from "./dto/add.dto";

@Injectable()
export class FoundersService {

  constructor(
    private readonly prisma: PrismaService,
  ) {
    this.get().then(founders => {
      founders.forEach(founder => {
        this.cache[founder.id] = founder.isReferent;
      });
    });
  }

  cache: { [key: string]: boolean } = {};

  async get() {
    return await this.prisma.founder.findMany();
  }

  async exists(id: string) {
    const founder = await this.prisma.founder.findFirst({
      where: {
        id
      }
    });
    return founder != undefined;
  }

  async add(dto: AddFounderDto) {
    const isReferent = dto.isReferent ? dto.isReferent : false;
    this.cache[dto.id] = isReferent;
    return await this.prisma.founder.create({
      data: {
        id: dto.id,
        username: dto.username,
        isReferent
      }
    });
  }

  async remove(id: string) {
    return await this.prisma.founder.delete({
      where: {
        id,
      }
    });
  }

  async setReferent(id: string, referent: boolean) {
    await this.prisma.founder.update({
      where: {
        id,
      },
      data: {
        isReferent: referent
      }
    });
    this.cache[id] = referent;
  }

  async isReferent(id: string): Promise<boolean> {
    const cachedValue = this.cache[id];
    if (cachedValue != null)
      return cachedValue as boolean;
    const ref = await this.prisma.founder.findFirst({
      where: {
        id,
        isReferent: true
      }
    });
    const isReferent = ref != undefined;
    this.cache[id] = isReferent;
    return isReferent;
  }

}